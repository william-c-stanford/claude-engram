import { Component, Modal, Notice, TFile } from "obsidian";
import type EngramPlugin from "../main";
import { CardState, Rating, Verdict } from "../cards/types";
import { rate, resetLadder } from "../scheduler/scheduler";
import { stripFrontmatter } from "../cards/content";
import { parseSidecar, rewriteCardBlock, splitNotes } from "../cards/parser";
import { againReinsertIndex, SessionItem } from "./session-queue";
import { autoRating, finalRating } from "./grading";
import { closeDecision, fieldsFor, composeFromFields, patchCardContents, EditorFields } from "./card-editor";
import { clozeAnswerMatches, renderClozePrompt } from "./renderers/cloze";
import { renderMcq } from "./renderers/mcq";
import { renderPromptAnswer } from "./renderers/prompt-answer";
import { renderMarkdown } from "./renderers/markdown";

const RATING_KEYS: Record<string, Rating> = { "1": "again", "2": "hard", "3": "good", "4": "easy" };
const RATING_LABELS: [Rating, string, string][] = [
  ["again", "Again (1)", "engram-rating-again"],
  ["hard", "Hard (2)", "engram-rating-hard"],
  ["good", "Good (3)", "engram-rating-good"],
  ["easy", "Easy (4)", "engram-rating-easy"],
];

function inTextEntry(): boolean {
  const tag = document.activeElement?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA";
}

/**
 * One review session over a prebuilt topological item queue: note-reading
 * steps interleave with cards (plan 002). Scheduling-state updates are
 * in-memory until the modal closes, then batch-written per sidecar; card
 * content edits write immediately on save.
 */
export class ReviewModal extends Modal {
  private plugin: EngramPlugin;
  private queue: SessionItem[];
  private sessionTitle: string;
  private pos = 0;
  private rated = 0;
  /** Lifecycle owner for MarkdownRenderer embeds. */
  private component = new Component();
  /** sidecarPath -> cardId -> new state */
  private updates = new Map<string, Map<string, CardState>>();
  /** Note addresses whose ladder was already reset this session. */
  private resetDone = new Set<string>();

  private revealed = false;
  private currentAuto: Rating | null = null;
  /** Raw check outcome, frozen at answer time — never mutated by overrides (KTD2). */
  private currentVerdict: Verdict | null = null;
  private revealEl: HTMLElement | null = null;
  private revealFn: ((el: HTMLElement) => Promise<void>) | null = null;
  private clozeInput: HTMLInputElement | null = null;
  private clozeAnswers: string[] = [];
  private sourcePanelEl: HTMLElement | null = null;

  private editorOpen = false;
  private editorDirty = false;
  private pendingClose = false;

  constructor(plugin: EngramPlugin, queue: SessionItem[], sessionTitle: string) {
    super(plugin.app);
    this.plugin = plugin;
    this.queue = queue;
    this.sessionTitle = sessionTitle;
  }

  onOpen(): void {
    this.modalEl.addClass("engram-review-modal");
    this.component.load();
    // In-memory staged state must survive the session; hold event rebuilds.
    this.plugin.scanner.holdRebuilds();
    this.scope.register([], " ", (evt) => {
      if (inTextEntry()) return;
      evt.preventDefault();
      this.handleAdvanceKey();
    });
    this.scope.register([], "Enter", (evt) => {
      if (inTextEntry() && document.activeElement !== this.clozeInput) return;
      evt.preventDefault();
      this.handleAdvanceKey();
    });
    for (const [key, rating] of Object.entries(RATING_KEYS)) {
      this.scope.register([], key, (evt) => {
        if (inTextEntry()) return;
        if (this.revealed && !this.editorOpen) {
          evt.preventDefault();
          this.rateCurrent(rating);
        }
      });
    }
    void this.renderCurrent();
  }

  /** Dirty-editor guard: the modal never closes over unsaved edits. */
  close(): void {
    if (closeDecision(this.editorOpen, this.editorDirty) === "block") {
      this.pendingClose = true;
      new Notice("Unsaved card edits — Save or Discard first.");
      (this.contentEl.querySelector(".engram-editor-save") as HTMLButtonElement | null)?.focus();
      return;
    }
    if (this.editorOpen) this.closeEditor();
    super.close();
  }

  private handleAdvanceKey(): void {
    const item = this.queue[this.pos];
    if (item?.kind === "note-intro") {
      this.pos++;
      void this.renderCurrent();
      return;
    }
    if (this.editorOpen) return;
    if (this.revealed) {
      this.rateCurrent(this.currentAuto ?? "good");
      return;
    }
    if (this.clozeInput && this.clozeInput.value.trim().length > 0) {
      this.checkCloze();
    } else {
      void this.reveal();
    }
  }

  private noteFile(path: string): TFile | null {
    const f = this.app.vault.getAbstractFileByPath(path);
    return f instanceof TFile ? f : null;
  }

  private async renderCurrent(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    this.revealed = false;
    this.currentAuto = null;
    this.currentVerdict = null;
    this.revealFn = null;
    this.clozeInput = null;
    this.clozeAnswers = [];
    this.sourcePanelEl = null;
    this.editorOpen = false;
    this.editorDirty = false;

    const item = this.queue[this.pos];
    if (!item) {
      this.renderDone();
      return;
    }

    const file = this.noteFile(item.entry.notePath);
    if (!file) {
      new Notice(`Engram: skipping ${item.kind === "note-intro" ? "reading step" : "card"} for missing note ${item.entry.notePath}`);
      this.pos++;
      void this.renderCurrent();
      return;
    }

    if (item.kind === "note-intro") {
      await this.renderNoteIntro(item.entry, file);
      return;
    }

    const extra: string[] = [];
    if (item.reorientation) extra.push("reorientation");
    extra.push(item.card.type);
    this.renderBreadcrumb(item.entry, extra);

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
        this.currentVerdict = correct ? "correct" : "incorrect";
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

    // Source access (R3/R4): available on every card.
    const sourceRow = contentEl.createDiv({ cls: "engram-source-row" });
    const sourceBtn = sourceRow.createEl("button", { text: "Review source note", cls: "engram-source-btn" });
    sourceBtn.addEventListener("click", () => void this.toggleSourcePanel(item.entry.notePath, item.entry.address, item.entry.title));
    this.sourcePanelEl = contentEl.createDiv({ cls: "engram-source-panel" });
    this.sourcePanelEl.hide();

    this.revealEl = contentEl.createDiv({ cls: "engram-review-reveal" });
    this.revealEl.hide();

    const controls = contentEl.createDiv({ cls: "engram-review-controls" });
    if (item.card.type !== "mcq") {
      const revealBtn = controls.createEl("button", { text: "Reveal (Space)" });
      revealBtn.addEventListener("click", () => this.handleAdvanceKey());
    }

    this.renderProgress();
  }

  private renderProgress(): void {
    const total = this.queue.filter((i) => i.kind === "card").length;
    const done = this.queue.slice(0, this.pos).filter((i) => i.kind === "card").length;
    this.contentEl.createDiv({ cls: "engram-review-progress" }).setText(`${Math.min(done + 1, total)} / ${total}`);
  }

  /**
   * Session-scope line plus the ancestry strip (plan 003): topmost node inside
   * the zettel root → … → source note, own scroll container, opened scrolled
   * fully right so the source note is visible (R2/R3).
   */
  private renderBreadcrumb(entry: SessionItem["entry"], extra: string[]): void {
    const { contentEl } = this;
    contentEl.createDiv({ cls: "engram-review-breadcrumb" }).setText([this.sessionTitle, ...extra].join(" · "));
    const lineage = this.plugin.scanner.index.lineageOf(entry, this.plugin.settings.zettelRoot);
    const strip = contentEl.createDiv({ cls: "engram-lineage" });
    strip.setText(lineage.join(" → "));
    queueMicrotask(() => {
      strip.scrollLeft = strip.scrollWidth; // no-op outside a real DOM
    });
  }

  private async renderNoteIntro(entry: SessionItem["entry"], file: TFile): Promise<void> {
    const { contentEl } = this;
    this.renderBreadcrumb(entry, ["reading"]);
    const body = contentEl.createDiv({ cls: "engram-note-intro" });
    const raw = await this.app.vault.cachedRead(file);
    await renderMarkdown(this.app, stripFrontmatter(raw), body, file.path, this.component);
    const controls = contentEl.createDiv({ cls: "engram-review-controls" });
    const proceed = controls.createEl("button", { text: "Proceed to cards (Space)", cls: "mod-cta" });
    proceed.addEventListener("click", () => this.handleAdvanceKey());
    proceed.focus();
    this.renderProgress();
  }

  /**
   * R3/R4: show the note in-modal; the first open per note per session
   * restarts that exact note's ladder (children untouched).
   */
  private async toggleSourcePanel(notePath: string, address: string, title: string): Promise<void> {
    if (!this.sourcePanelEl) return;
    if (!this.sourcePanelEl.isShown()) {
      const file = this.noteFile(notePath);
      if (!file) {
        new Notice(`Engram: source note is missing (${notePath}) — no reset applied.`);
        return;
      }
      if (this.sourcePanelEl.childElementCount === 0) {
        const raw = await this.app.vault.cachedRead(file);
        await renderMarkdown(this.app, stripFrontmatter(raw), this.sourcePanelEl, notePath, this.component);
      }
      this.applySourceReset(address, title);
      this.sourcePanelEl.show();
    } else {
      this.sourcePanelEl.hide();
    }
  }

  private applySourceReset(address: string, title: string): void {
    if (this.resetDone.has(address)) return;
    this.resetDone.add(address);
    const entry = this.plugin.scanner.index.byAddress.get(address);
    if (!entry?.sidecar) return;
    const now = new Date();
    let count = 0;
    for (const card of entry.sidecar.cards) {
      const next = resetLadder(card.state, now);
      if (next !== card.state) {
        card.state = next;
        this.stageState(entry.sidecarPath, card.id, next);
        count++;
      }
    }
    if (count > 0) new Notice(`Engram: ladder reset for "${title}" — ${count} card(s) back to start.`);
  }

  private stageState(sidecarPath: string | undefined, cardId: string, state: CardState): void {
    if (!sidecarPath) return;
    const perFile = this.updates.get(sidecarPath) ?? new Map<string, CardState>();
    perFile.set(cardId, state);
    this.updates.set(sidecarPath, perFile);
  }

  private checkCloze(): void {
    if (!this.clozeInput) return;
    const correct = clozeAnswerMatches(this.clozeInput.value, this.clozeAnswers);
    this.currentVerdict = correct ? "correct" : "incorrect";
    this.currentAuto = autoRating(correct);
    void this.reveal();
  }

  private async reveal(): Promise<void> {
    if (this.revealed) return;
    this.revealed = true;
    const item = this.queue[this.pos];
    if (this.revealEl && this.revealFn) {
      await this.revealFn(this.revealEl);
      this.revealEl.show();
    } else if (this.revealEl && this.currentAuto !== null && !this.revealFn) {
      this.revealEl.show();
    }

    // Annotation (R7): hidden while answering, shown after reveal.
    if (this.revealEl && item?.kind === "card" && item.card.notes.trim().length > 0) {
      const notesEl = this.revealEl.createDiv({ cls: "engram-card-notes" });
      notesEl.createDiv({ cls: "engram-card-notes-label" }).setText("Notes");
      const notesBody = notesEl.createDiv();
      await renderMarkdown(this.app, item.card.notes, notesBody, item.entry.notePath, this.component);
    }

    const controls = this.contentEl.querySelector(".engram-review-controls") as HTMLElement | null;
    if (!controls) return;
    controls.empty();

    if (this.currentAuto !== null) {
      const verdict = controls.createDiv({ cls: "engram-review-verdict" });
      verdict.setText(this.currentAuto === "good" ? "Correct — Enter to confirm Good" : "Incorrect — Enter to confirm Again");
    }
    const buttons = controls.createDiv({ cls: "engram-review-buttons" });
    for (const [rating, label, cls] of RATING_LABELS) {
      const btn = buttons.createEl("button", { text: label, cls });
      if (this.currentAuto === rating) btn.addClass("engram-rating-suggested");
      btn.addEventListener("click", () => this.rateCurrent(rating));
    }
    const editRow = controls.createDiv();
    const editBtn = editRow.createEl("button", { text: "Edit card", cls: "engram-edit-btn" });
    editBtn.addEventListener("click", () => this.openEditor());
  }

  private openEditor(): void {
    const item = this.queue[this.pos];
    if (item?.kind !== "card" || this.editorOpen) return;
    this.editorOpen = true;
    this.editorDirty = false;

    const host = this.contentEl.createDiv({ cls: "engram-card-editor" });
    const fields = fieldsFor(item.card);
    const areas = new Map<keyof EditorFields, HTMLTextAreaElement>();

    const addField = (key: keyof EditorFields, label: string, value: string) => {
      host.createDiv({ cls: "engram-editor-label" }).setText(label);
      const ta = host.createEl("textarea", { cls: "engram-editor-area" });
      ta.value = value;
      ta.addEventListener("input", () => (this.editorDirty = true));
      areas.set(key, ta);
    };

    if (fields.raw !== undefined) addField("raw", item.card.type === "mcq" ? "Question and options" : "Content", fields.raw);
    else {
      addField("prompt", "Prompt", fields.prompt ?? "");
      addField("answer", "Answer", fields.answer ?? "");
    }
    addField("notes", "Notes (hidden until reveal)", fields.notes);

    const row = host.createDiv({ cls: "engram-review-buttons" });
    const save = row.createEl("button", { text: "Save", cls: "mod-cta engram-editor-save" });
    save.addEventListener("click", () => void this.saveEditor(areas));
    const discard = row.createEl("button", { text: "Discard" });
    discard.addEventListener("click", () => {
      this.editorDirty = false;
      this.closeEditor();
    });
  }

  private closeEditor(): void {
    this.editorOpen = false;
    this.editorDirty = false;
    this.contentEl.querySelector(".engram-card-editor")?.remove();
    if (this.pendingClose) {
      this.pendingClose = false;
      super.close();
    }
  }

  private async saveEditor(areas: Map<keyof EditorFields, HTMLTextAreaElement>): Promise<void> {
    const item = this.queue[this.pos];
    if (item?.kind !== "card") return;
    const fields: EditorFields = {
      notes: areas.get("notes")?.value ?? "",
    };
    if (areas.has("raw")) fields.raw = areas.get("raw")!.value;
    else {
      fields.prompt = areas.get("prompt")?.value ?? "";
      fields.answer = areas.get("answer")?.value ?? "";
    }
    const newBody = composeFromFields(fields);

    const sidecarPath = item.entry.sidecarPath;
    const file = sidecarPath ? this.noteFile(sidecarPath) : null;
    if (!file || !sidecarPath) {
      new Notice("Engram: no sidecar file to save to.");
      return;
    }
    let applied = false;
    await this.app.vault.process(file, (raw) => {
      const out = rewriteCardBlock(raw, item.card.id, newBody);
      if (out === null) return raw;
      applied = true;
      return out;
    });
    if (!applied) {
      new Notice(`Engram: card ${item.card.id} not found in sidecar — edit not saved.`);
      return;
    }
    const { content, notes } = splitNotes(newBody);
    item.card.content = content;
    item.card.notes = notes;
    // Keep the in-memory index consistent without waiting for the rescan —
    // content/notes only. Never swap the sidecar wholesale: sibling cards may
    // hold staged scheduling state not yet flushed to disk.
    const parsed = parseSidecar(await this.app.vault.cachedRead(file));
    const entry = this.plugin.scanner.index.byAddress.get(item.entry.address);
    if (parsed && entry?.sidecar) {
      patchCardContents(entry.sidecar.cards, parsed.cards);
    }
    new Notice("Card saved.");
    this.editorDirty = false;
    this.closeEditor();
  }

  private rateCurrent(rating: Rating): void {
    const item = this.queue[this.pos];
    if (item?.kind !== "card" || this.editorOpen) return;
    const effective = finalRating(this.currentAuto ?? rating, rating);

    const newState = rate(
      item.card.state,
      effective,
      { easeFactor: this.plugin.settings.easeFactor },
      new Date(),
      this.currentVerdict ?? undefined
    );
    item.card.state = newState;
    this.stageState(item.entry.sidecarPath, item.card.id, newState);
    this.rated++;

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
    this.plugin.scanner.releaseRebuilds();
    void this.plugin.persistReviewUpdates(this.updates);
  }
}
