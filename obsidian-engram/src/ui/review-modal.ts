import { Component, Modal, Notice } from "obsidian";
import type EngramPlugin from "../main";
import { CardState, Rating } from "../cards/types";
import { rate } from "../scheduler/scheduler";
import { againReinsertIndex, SessionCard } from "./session-queue";
import { autoRating, finalRating } from "./grading";
import { clozeAnswerMatches, renderClozePrompt } from "./renderers/cloze";
import { renderMcq } from "./renderers/mcq";
import { renderPromptAnswer } from "./renderers/prompt-answer";

const RATING_KEYS: Record<string, Rating> = { "1": "again", "2": "hard", "3": "good", "4": "easy" };
const RATING_LABELS: [Rating, string, string][] = [
  ["again", "Again (1)", "engram-rating-again"],
  ["hard", "Hard (2)", "engram-rating-hard"],
  ["good", "Good (3)", "engram-rating-good"],
  ["easy", "Easy (4)", "engram-rating-easy"],
];

/**
 * One review session over a prebuilt topological queue. State updates are
 * in-memory until the modal closes, then batch-written per sidecar (KTD2);
 * closing mid-session persists only rated cards.
 */
export class ReviewModal extends Modal {
  private plugin: EngramPlugin;
  private queue: SessionCard[];
  private sessionTitle: string;
  private pos = 0;
  private rated = 0;
  /** Lifecycle owner for MarkdownRenderer embeds. */
  private component = new Component();
  /** sidecarPath -> cardId -> new state */
  private updates = new Map<string, Map<string, CardState>>();

  private revealed = false;
  private currentAuto: Rating | null = null;
  private revealEl: HTMLElement | null = null;
  private revealFn: ((el: HTMLElement) => Promise<void>) | null = null;
  private clozeInput: HTMLInputElement | null = null;
  private clozeAnswers: string[] = [];

  constructor(plugin: EngramPlugin, queue: SessionCard[], sessionTitle: string) {
    super(plugin.app);
    this.plugin = plugin;
    this.queue = queue;
    this.sessionTitle = sessionTitle;
  }

  onOpen(): void {
    this.modalEl.addClass("engram-review-modal");
    this.component.load();
    this.scope.register([], " ", (evt) => {
      if (document.activeElement === this.clozeInput) return;
      evt.preventDefault();
      this.handleAdvanceKey();
    });
    this.scope.register([], "Enter", (evt) => {
      evt.preventDefault();
      this.handleAdvanceKey();
    });
    for (const [key, rating] of Object.entries(RATING_KEYS)) {
      this.scope.register([], key, (evt) => {
        if (document.activeElement === this.clozeInput) return;
        if (this.revealed) {
          evt.preventDefault();
          this.rateCurrent(rating);
        }
      });
    }
    void this.renderCurrent();
  }

  private handleAdvanceKey(): void {
    if (this.revealed) {
      // Enter/Space on a revealed card confirms the auto verdict (or Good).
      this.rateCurrent(this.currentAuto ?? "good");
      return;
    }
    if (this.clozeInput && this.clozeInput.value.trim().length > 0) {
      this.checkCloze();
    } else {
      void this.reveal();
    }
  }

  private async renderCurrent(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    this.revealed = false;
    this.currentAuto = null;
    this.revealFn = null;
    this.clozeInput = null;
    this.clozeAnswers = [];

    const item = this.queue[this.pos];
    if (!item) {
      this.renderDone();
      return;
    }

    // A note deleted since scan: skip its cards with a notice.
    if (!this.app.vault.getAbstractFileByPath(item.entry.notePath)) {
      new Notice(`Engram: skipping card for deleted note ${item.entry.notePath}`);
      this.pos++;
      void this.renderCurrent();
      return;
    }

    // Breadcrumb: session scope, then the note only when it differs (a parent
    // note reviewing its own cards would otherwise show its title twice).
    const parts = [this.sessionTitle];
    if (item.entry.title !== this.sessionTitle) parts.push(item.entry.title);
    if (item.reorientation) parts.push("reorientation");
    const crumb = contentEl.createDiv({ cls: "engram-review-breadcrumb" });
    crumb.setText(parts.join(" · "));

    const cardEl = contentEl.createDiv({ cls: "engram-review-card" });
    const sourcePath = item.entry.notePath;

    if (item.card.type === "cloze") {
      const view = await renderClozePrompt(this.app, item.card, cardEl, sourcePath, this.component);
      this.clozeAnswers = view.answers;
      this.revealFn = view.showReveal;
      const input = contentEl.createEl("input", { type: "text", placeholder: "type the answer, or Space to reveal" });
      input.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter") {
          evt.preventDefault();
          if (input.value.trim().length > 0) this.checkCloze();
          else void this.reveal();
        }
      });
      this.clozeInput = input;
      input.focus();
    } else if (item.card.type === "mcq") {
      const view = await renderMcq(this.app, item.card, cardEl, sourcePath, this.component);
      if (!view) {
        new Notice(`Engram: malformed mcq card ${item.card.id} — skipped`);
        this.pos++;
        void this.renderCurrent();
        return;
      }
      void view.answered.then((correct) => {
        this.currentAuto = autoRating(correct);
        void this.reveal();
      });
    } else {
      const view = await renderPromptAnswer(this.app, item.card, cardEl, sourcePath, this.component);
      if (!view) {
        new Notice(`Engram: malformed card ${item.card.id} — skipped`);
        this.pos++;
        void this.renderCurrent();
        return;
      }
      this.revealFn = view.showReveal;
    }

    this.revealEl = contentEl.createDiv({ cls: "engram-review-reveal" });
    this.revealEl.hide();

    const controls = contentEl.createDiv({ cls: "engram-review-controls" });
    if (item.card.type !== "mcq") {
      const revealBtn = controls.createEl("button", { text: "Reveal (Space)" });
      revealBtn.addEventListener("click", () => this.handleAdvanceKey());
    }

    contentEl.createDiv({ cls: "engram-review-progress" }).setText(`${this.pos + 1} / ${this.queue.length}`);
  }

  private checkCloze(): void {
    if (!this.clozeInput) return;
    this.currentAuto = autoRating(clozeAnswerMatches(this.clozeInput.value, this.clozeAnswers));
    void this.reveal();
  }

  private async reveal(): Promise<void> {
    if (this.revealed) return;
    this.revealed = true;
    if (this.revealEl && this.revealFn) {
      await this.revealFn(this.revealEl);
      this.revealEl.show();
    } else if (this.revealEl && this.currentAuto !== null && !this.revealFn) {
      this.revealEl.show();
    }

    const controls = this.contentEl.querySelector(".engram-review-controls") as HTMLElement | null;
    if (!controls) return;
    controls.empty();

    if (this.currentAuto !== null) {
      // Auto-checked: confirm or override (KTD6). Own line above the buttons.
      const verdict = controls.createDiv({ cls: "engram-review-verdict" });
      verdict.setText(this.currentAuto === "good" ? "Correct — Enter to confirm Good" : "Incorrect — Enter to confirm Again");
    }
    const buttons = controls.createDiv({ cls: "engram-review-buttons" });
    for (const [rating, label, cls] of RATING_LABELS) {
      const btn = buttons.createEl("button", { text: label, cls });
      if (this.currentAuto === rating) btn.addClass("engram-rating-suggested");
      btn.addEventListener("click", () => this.rateCurrent(rating));
    }
  }

  private rateCurrent(rating: Rating): void {
    const item = this.queue[this.pos];
    if (!item) return;
    // KTD6: the auto verdict is the recommended default; the clicked/typed
    // rating is final (clicking the matching button just confirms it).
    const effective = finalRating(this.currentAuto ?? rating, rating);

    const newState = rate(item.card.state, effective, { easeFactor: this.plugin.settings.easeFactor }, new Date());
    item.card.state = newState;
    const sidecarPath = item.entry.sidecarPath;
    if (sidecarPath) {
      const perFile = this.updates.get(sidecarPath) ?? new Map<string, CardState>();
      perFile.set(item.card.id, newState);
      this.updates.set(sidecarPath, perFile);
    }
    this.rated++;

    // In-session relearn: an Again card comes back 1–10 cards later, not at
    // the end of the queue.
    if (effective === "again") {
      const insertAt = againReinsertIndex(this.pos + 1, this.queue.length);
      this.queue.splice(insertAt, 0, { ...item, reorientation: false });
    }

    this.pos++;
    void this.renderCurrent();
  }

  private renderDone(): void {
    const { contentEl } = this;
    contentEl.empty();
    const done = contentEl.createDiv({ cls: "engram-review-card" });
    done.setText(
      this.queue.length === 0
        ? "Nothing due here. Click a yellow chip for early review, or a green chip to practice ahead."
        : `Session complete — ${this.rated} reviews.`
    );
    const controls = contentEl.createDiv({ cls: "engram-review-controls" });
    const close = controls.createEl("button", { text: "Close" });
    close.addEventListener("click", () => this.close());
  }

  onClose(): void {
    this.component.unload();
    void this.plugin.persistReviewUpdates(this.updates);
  }
}
