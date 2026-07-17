import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FakeEl, Notice, TFile } from "./obsidian-stub";
import { ReviewModal } from "../../src/ui/review-modal";
import { buildSessionQueue, SessionItem } from "../../src/ui/session-queue";
import { FlashcardIndex, NoteEntry } from "../../src/index/flashcard-index";
import { parseSidecar, rewriteStates } from "../../src/cards/parser";
import { CardState } from "../../src/cards/types";
import { DEFAULT_SETTINGS } from "../../src/settings";

/**
 * Headless execution of the plan's vault-smoke gate (AE1–AE3): the real
 * ReviewModal driven over the real MoE deck content. Files are copied into an
 * in-memory vault so the live deck's scheduling state is never touched —
 * AE2's ladder reset must not clobber the user's actual review history.
 */

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const BASE = "wiki/zettel/LLMs/Architecture";
const NOTES: [address: string, notePath: string, children: string[]][] = [
  [`c-000026`, `${BASE}/Mixture-of-Experts.md`, ["c-000022", "c-000023", "c-000024", "c-000025"]],
  [`c-000022`, `${BASE}/Mixture-of-Experts/MoE-Architecture.md`, []],
  [`c-000023`, `${BASE}/Mixture-of-Experts/MoE-Load-Balancing.md`, []],
  [`c-000024`, `${BASE}/Mixture-of-Experts/Noisy-Top-K-Gating.md`, []],
  [`c-000025`, `${BASE}/Mixture-of-Experts/Notable-MoE-Models.md`, []],
];

let files: Map<string, string>;
let index: FlashcardIndex;
let plugin: {
  app: { vault: unknown };
  settings: typeof DEFAULT_SETTINGS;
  scanner: { index: FlashcardIndex; holdRebuilds(): void; releaseRebuilds(): void };
  persistReviewUpdates(updates: Map<string, Map<string, CardState>>): Promise<void>;
};

const flush = async (): Promise<void> => {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
};

/**
 * The committed MoE `.cards.md` sidecars accumulated real review history from
 * manual spot-checks (due dates in the future, non-empty `reviews`). These AE
 * regressions assume a pristine deck: every card `new` (so a red walk is
 * populated regardless of wall-clock) and unvisited notes carrying zero
 * reviews. Strip the persisted `%% srs <id> {json} %%` state lines at load so
 * cards parse as new (parser.ts defaults absent state to NEW_STATE). This
 * touches only the in-memory copy — the committed vault data is never modified.
 * `%% srs-retired %%` lines are left intact (the pattern requires an id+JSON).
 */
const SRS_STATE_LINE = /^%% srs [a-z]-\d{6}-\d{2} \{.*\} %%\s*$/;
function pristine(raw: string): string {
  return raw
    .split("\n")
    .filter((line) => !SRS_STATE_LINE.test(line))
    .join("\n");
}

function rebuildIndex(): void {
  const entries: NoteEntry[] = NOTES.map(([address, notePath, childrenAddresses]) => {
    const sidecarPath = notePath.replace(/\.md$/, ".cards.md");
    const sidecarRaw = files.get(sidecarPath);
    const sidecar = sidecarRaw ? parseSidecar(sidecarRaw) ?? undefined : undefined;
    const title = /^title:\s*"?([^"\n]+?)"?\s*$/m.exec(files.get(notePath) ?? "")?.[1] ?? notePath;
    return { address, notePath, title, childrenAddresses, sidecar, sidecarPath };
  });
  index = new FlashcardIndex(
    entries,
    new Set(["wiki/zettel", `${BASE}`, `${BASE}/Mixture-of-Experts`])
  );
  if (plugin) plugin.scanner.index = index;
}

beforeEach(() => {
  Notice.reset();
  files = new Map();
  for (const [, notePath] of NOTES) {
    files.set(notePath, readFileSync(join(REPO, notePath), "utf8"));
    const sc = notePath.replace(/\.md$/, ".cards.md");
    files.set(sc, pristine(readFileSync(join(REPO, sc), "utf8")));
  }
  const vault = {
    getAbstractFileByPath: (p: string) => (files.has(p) ? new TFile(p) : null),
    cachedRead: async (f: TFile) => files.get(f.path) ?? "",
    process: async (f: TFile, fn: (raw: string) => string) => {
      files.set(f.path, fn(files.get(f.path) ?? ""));
    },
  };
  plugin = {
    app: { vault },
    settings: { ...DEFAULT_SETTINGS, noteIntroMode: "first-encounter" },
    scanner: { index: undefined as unknown as FlashcardIndex, holdRebuilds() {}, releaseRebuilds() {} },
    async persistReviewUpdates(updates) {
      for (const [p, states] of updates) {
        const f = vault.getAbstractFileByPath(p);
        if (f) await vault.process(f, (raw) => rewriteStates(raw, states));
      }
    },
  };
  rebuildIndex();
});

function queueFor(address: string): SessionItem[] {
  return buildSessionQueue(index, address, "red", {
    nowMs: Date.now(),
    warnWindowHours: plugin.settings.warnWindowHours,
    skipGreenParents: false,
    reorientationSampleSize: 3,
    noteIntroMode: plugin.settings.noteIntroMode,
    random: () => 0.5,
  });
}

function openModal(queue: SessionItem[], title: string): ReviewModal {
  const modal = new ReviewModal(plugin as never, queue, title);
  modal.open();
  return modal;
}

function btn(modal: ReviewModal, label: string): FakeEl | null {
  return (modal.contentEl as unknown as FakeEl).find((el) => el.tag === "button" && el.textContent.includes(label));
}

function screen(modal: ReviewModal): string {
  return (modal.contentEl as unknown as FakeEl).allText();
}

/** Answer the currently shown card with the given rating button label. */
async function answerCard(modal: ReviewModal, rating = "Good (3)"): Promise<void> {
  const content = modal.contentEl as unknown as FakeEl;
  const mcqOptions = content.querySelectorAll(".engram-mcq-option");
  if (mcqOptions.length > 0) {
    mcqOptions[0]!.click(); // auto-check fires reveal
  } else {
    btn(modal, "Reveal")!.click();
  }
  await flush();
  btn(modal, rating)!.click();
  await flush();
}

describe("AE1 — note-first reading step", () => {
  it("a never-reviewed note renders its content with Proceed before the first card", async () => {
    const modal = openModal(queueFor("c-000024"), "Noisy Top-K Gating");
    await flush();
    expect(screen(modal)).toContain("reading");
    expect(screen(modal)).toContain("non-differentiable"); // the note's Claim text
    expect(screen(modal)).not.toContain("type the answer");
    // Lineage strip: root→source, ancestors falling back to folder names when
    // their paired notes are outside this harness's entry set (AE1 of plan 003).
    const strip = (modal.contentEl as unknown as FakeEl).querySelector(".engram-lineage")!;
    expect(strip.textContent).toBe("LLMs → Architecture → Mixture of Experts (MoE) → Noisy Top-K Gating");

    btn(modal, "Proceed")!.click();
    await flush();
    expect(screen(modal)).not.toContain("· reading");
    const cardStrip = (modal.contentEl as unknown as FakeEl).querySelector(".engram-lineage")!;
    expect(cardStrip.textContent).toContain("→ Noisy Top-K Gating"); // source note ends the strip
    modal.close();
    await flush();
  });

  it("after reviews exist, a later session skips straight to cards", async () => {
    // Review one card, persist, rebuild — the note now has history.
    const first = openModal(queueFor("c-000024"), "Noisy Top-K Gating");
    await flush();
    btn(first, "Proceed")!.click();
    await flush();
    await answerCard(first);
    first.close();
    await flush();
    rebuildIndex();

    const queue = queueFor("c-000024");
    expect(queue.some((i) => i.kind === "note-intro")).toBe(false);
    const second = openModal(queue, "Noisy Top-K Gating");
    await flush();
    expect(screen(second)).not.toContain("· reading");
    second.close();
    await flush();
  });
});

describe("AE2 — source review resets exactly one note's ladder (full-session walk)", () => {
  it("walks the whole MoE subtree; reset touches only MoE Load Balancing", async () => {
    const modal = openModal(queueFor("c-000026"), "Mixture of Experts (MoE)");
    await flush();

    let resetFired = false;
    let lbAnswered = 0;
    let steps = 0;
    while ((modal as unknown as { isOpen: boolean }).isOpen && steps++ < 100) {
      const text = screen(modal);
      if (text.includes("Session complete")) break;
      const proceed = btn(modal, "Proceed");
      if (proceed) {
        proceed.click();
        await flush();
        continue;
      }
      const onLoadBalancing = text.includes("MoE Load Balancing");
      // Open the source panel once the note has real history (a reset is a
      // no-op on brand-new cards by design — they are already at the start).
      if (!resetFired && onLoadBalancing && lbAnswered >= 2) {
        btn(modal, "Review source note")!.click();
        await flush();
        resetFired = true;

        const panel = (modal.contentEl as unknown as FakeEl).querySelector(".engram-source-panel")!;
        expect(panel.isShown()).toBe(true);
        expect(panel.allText()).toContain("load-balancing loss"); // the note, in-modal
        expect(Notice.messages.some((m) => m.includes("ladder reset"))).toBe(true);

        // That exact note: every card with history is back at the ladder start.
        const lbCards = index.byAddress.get("c-000023")!.sidecar!.cards;
        const resetCards = lbCards.filter((c) => c.state.reviews?.at(-1)?.rating === "reset");
        expect(resetCards.length).toBeGreaterThanOrEqual(2);
        for (const card of resetCards) expect(card.state.interval).toBe(0);

        // Not its siblings: already-reviewed MoE-Architecture cards keep their intervals.
        for (const card of index.byAddress.get("c-000022")!.sidecar!.cards) {
          expect(card.state.reviews?.at(-1)?.rating).toBe("good");
          expect(card.state.interval).toBeGreaterThan(0);
        }
        // Unvisited notes stay new.
        for (const addr of ["c-000024", "c-000025"]) {
          for (const card of index.byAddress.get(addr)!.sidecar!.cards) {
            expect(card.state.reviews ?? []).toHaveLength(0);
          }
        }
        // Second open in the same session applies no second reset.
        btn(modal, "Review source note")!.click(); // hide
        btn(modal, "Review source note")!.click(); // show again
        await flush();
        for (const card of index.byAddress.get("c-000023")!.sidecar!.cards) {
          expect((card.state.reviews ?? []).filter((r) => r.rating === "reset").length).toBeLessThanOrEqual(1);
        }
      }
      await answerCard(modal);
      if (onLoadBalancing) lbAnswered++;
    }
    expect(resetFired).toBe(true);
    expect(screen(modal)).toContain("Session complete");
    modal.close();
    await flush();

    // Persisted: reset events + ratings landed in the in-memory sidecar copies…
    const persisted = parseSidecar(files.get(`${BASE}/Mixture-of-Experts/MoE-Load-Balancing.cards.md`)!)!;
    expect(persisted.cards.filter((c) => c.state.reviews!.some((r) => r.rating === "reset")).length).toBeGreaterThanOrEqual(2);
    for (const card of persisted.cards) {
      // Answered pre-reset → last event is the reset; answered post-reset → good.
      expect(["good", "reset"]).toContain(card.state.reviews!.at(-1)!.rating);
      expect(card.state.reviews!.length).toBeGreaterThan(0);
    }
    // …and the real vault deck on disk was never touched by this harness.
    const onDisk = readFileSync(join(REPO, `${BASE}/Mixture-of-Experts/MoE-Load-Balancing.cards.md`), "utf8");
    expect(onDisk).not.toContain('"rating":"reset"');

    // Verdict logging (plan 005 AE1/AE2): the walk clicks the first MCQ option
    // (often wrong) and rates Good — those entries must carry the raw verdict;
    // open-ended and reveal-only cloze entries must carry none.
    const allCards = NOTES.flatMap(([, notePath]) => parseSidecar(files.get(notePath.replace(/\.md$/, ".cards.md"))!)?.cards ?? []);
    const entriesOf = (types: string[]) =>
      allCards.filter((c) => types.includes(c.type)).flatMap((c) => c.state.reviews ?? []).filter((r) => r.rating !== "reset");
    const mcqEntries = entriesOf(["mcq"]);
    expect(mcqEntries.length).toBeGreaterThan(0);
    expect(mcqEntries.every((r) => r.verdict === "correct" || r.verdict === "incorrect")).toBe(true);
    expect(allCards.some((c) => c.type === "mcq" && c.state.reviews!.some((r) => r.verdict === "incorrect" && r.rating === "good"))).toBe(true); // AE1
    expect(entriesOf(["free", "derivation", "pseudocode", "cloze"]).every((r) => r.verdict === undefined)).toBe(true); // AE2 + reveal-only cloze
  });
});

describe("AE3 — post-reveal editing with hidden annotations", () => {
  it("adds an annotation, guards dirty close, persists, and hides it until reveal next session", async () => {
    const modal = openModal(queueFor("c-000022"), "MoE Architecture");
    await flush();
    btn(modal, "Proceed")?.click(); // first-encounter intro
    await flush();

    // Reveal the first card, open the editor, write an annotation.
    const content = modal.contentEl as unknown as FakeEl;
    const mcq = content.querySelectorAll(".engram-mcq-option");
    if (mcq.length > 0) mcq[0]!.click();
    else btn(modal, "Reveal")!.click();
    await flush();
    btn(modal, "Edit card")!.click();
    await flush();
    const areas = content.querySelectorAll(".engram-editor-area");
    const notesArea = areas.at(-1)!; // Notes is always the last field
    notesArea.value = "harness annotation — hidden until reveal";
    notesArea.dispatch("input");

    // Dirty-close guard: the modal refuses to close over unsaved edits.
    modal.close();
    expect((modal as unknown as { isOpen: boolean }).isOpen).toBe(true);
    expect(Notice.messages.some((m) => m.includes("Unsaved card edits"))).toBe(true);

    // Save: the pending close completes and the sidecar carries the Notes section.
    btn(modal, "Save")!.click();
    await flush();
    expect(Notice.messages.some((m) => m.includes("Card saved"))).toBe(true);
    expect((modal as unknown as { isOpen: boolean }).isOpen).toBe(false);
    const sidecarRaw = files.get(`${BASE}/Mixture-of-Experts/MoE-Architecture.cards.md`)!;
    expect(sidecarRaw).toContain("**Notes**");
    expect(sidecarRaw).toContain("harness annotation");

    // Next session: annotation absent at prompt time, present after reveal.
    rebuildIndex();
    const annotatedId = parseSidecar(sidecarRaw)!.cards.find((c) => c.notes.includes("harness annotation"))!.id;
    const second = openModal(queueFor("c-000022"), "MoE Architecture");
    await flush();
    let sawAnnotation = false;
    let steps = 0;
    while ((second as unknown as { isOpen: boolean }).isOpen && steps++ < 50) {
      const text = screen(second);
      if (text.includes("Session complete")) break;
      const proceed = btn(second, "Proceed");
      if (proceed) {
        proceed.click();
        await flush();
        continue;
      }
      // Hidden while answering — both my annotation and the deck's pre-existing one.
      expect(text).not.toContain("harness annotation");
      expect(text).not.toContain("only the FFN forks");
      const sc = second.contentEl as unknown as FakeEl;
      const mcq2 = sc.querySelectorAll(".engram-mcq-option");
      if (mcq2.length > 0) mcq2[0]!.click();
      else btn(second, "Reveal")!.click();
      await flush();
      const notesBlock = sc.querySelector(".engram-card-notes");
      if (notesBlock?.allText().includes("harness annotation")) {
        sawAnnotation = true;
      }
      btn(second, "Good (3)")!.click();
      await flush();
    }
    expect(sawAnnotation).toBe(true);
    second.close();
    await flush();
    void annotatedId;
  });
});
