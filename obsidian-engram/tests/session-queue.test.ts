import { describe, expect, it } from "vitest";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, CardState, ParsedSidecar } from "../src/cards/types";
import { againReinsertIndex, buildSessionQueue, isFirstEncounter, isRelearning, SessionItem } from "../src/ui/session-queue";
import { autoRating, finalRating } from "../src/ui/grading";

const NOW = Date.parse("2026-07-17T09:00:00.000Z");
const red = (): CardState => ({ due: "2026-07-16T00:00:00.000Z", interval: 1, ease: 2.5, reviews: [] });
const green = (h = 200): CardState => ({
  due: new Date(NOW + h * 3600 * 1000).toISOString(),
  interval: 25,
  ease: 2.5,
  reviews: [],
});

function sidecarWith(address: string, states: CardState[]): ParsedSidecar {
  const cards: Card[] = states.map((state, i) => ({
    id: `${address}-${String(i + 1).padStart(2, "0")}`,
    type: "free",
    content: "**Prompt**\nq\n**Answer**\na",
    notes: "",
    state,
  }));
  return { noteAddress: address, noteTitle: address, cards, orphanedStateIds: [], retiredLines: [], warnings: [] };
}

function entry(address: string, notePath: string, children: string[], states: CardState[]): NoteEntry {
  return { address, notePath, title: notePath, childrenAddresses: children, sidecar: states.length ? sidecarWith(address, states) : undefined };
}

const opts = { nowMs: NOW, warnWindowHours: 24, skipGreenParents: false, reorientationSampleSize: 3, noteIntroMode: "never" as const, random: () => 0.5 };

/** Card items only (intro items are covered by their own describe block). */
function cards(queue: SessionItem[]) {
  return queue.filter((i): i is Extract<SessionItem, { kind: "card" }> => i.kind === "card");
}

// Parent (all green, 4 cards) -> [LeafA (2 red), Mid parent (1 red) -> [LeafB (2 red)]]
const entries = [
  entry("c-000001", "wiki/zettel/P.md", ["c-000002", "c-000003"], [green(100), green(50), green(200), green(300)]),
  entry("c-000002", "wiki/zettel/P/LeafA.md", [], [red(), red()]),
  entry("c-000003", "wiki/zettel/P/Mid.md", ["c-000004"], [red()]),
  entry("c-000004", "wiki/zettel/P/Mid/LeafB.md", [], [red(), red()]),
];
const index = new FlashcardIndex(entries, new Set(["wiki/zettel", "wiki/zettel/P", "wiki/zettel/P/Mid"]));

describe("buildSessionQueue (R16 mental-palace walk)", () => {
  it("orders parent cards before all child cards; sibling subtrees in children order; no cross-note interleaving", () => {
    const queue = cards(buildSessionQueue(index, "c-000001", "red", opts));
    const byNote = queue.map((s) => s.entry.address);
    // parent sample first, then LeafA, then Mid, then LeafB — contiguous runs
    expect(byNote).toEqual(["c-000001", "c-000001", "c-000001", "c-000002", "c-000002", "c-000003", "c-000004", "c-000004"]);
  });

  it("an all-green parent contributes its reorientation sample, most-nearly-due first", () => {
    const queue = cards(buildSessionQueue(index, "c-000001", "red", opts));
    const sample = queue.filter((s) => s.reorientation);
    expect(sample).toHaveLength(3);
    // sorted by due ascending: the 50h card first, then 100h, then 200h
    expect(sample.map((s) => s.card.id)).toEqual(["c-000001-02", "c-000001-01", "c-000001-03"]);
  });

  it("skip-green-parents removes the reorientation sample entirely", () => {
    const queue = cards(buildSessionQueue(index, "c-000001", "red", { ...opts, skipGreenParents: true }));
    expect(queue.filter((s) => s.reorientation)).toHaveLength(0);
    expect(queue.map((s) => s.entry.address)).toEqual(["c-000002", "c-000002", "c-000003", "c-000004", "c-000004"]);
  });

  it("a leaf with nothing in the bucket contributes nothing (no reorientation for leaves)", () => {
    const idx = new FlashcardIndex(
      [entry("c-000010", "wiki/zettel/Q.md", ["c-000011"], [red()]), entry("c-000011", "wiki/zettel/Q/L.md", [], [green()])],
      new Set(["wiki/zettel", "wiki/zettel/Q"])
    );
    const queue = cards(buildSessionQueue(idx, "c-000010", "red", opts));
    expect(queue.map((s) => s.entry.address)).toEqual(["c-000010"]);
  });

  it("green bucket (practice-ahead) selects green cards directly", () => {
    const queue = cards(buildSessionQueue(index, "c-000001", "green", opts));
    expect(queue.every((s) => s.entry.address === "c-000001")).toBe(true);
    expect(queue).toHaveLength(4);
    expect(queue.every((s) => !s.reorientation)).toBe(true);
  });
});

describe("relearning cards (Again flow)", () => {
  const lapsed = (at: string): CardState => ({
    due: at,
    interval: 0,
    ease: 2.3,
    reviews: [{ at, rating: "again" }],
  });

  it("isRelearning: lapsed cards yes, new and passed cards no", () => {
    expect(isRelearning(lapsed("2026-07-17T08:00:00.000Z"))).toBe(true);
    expect(isRelearning({ state: "new" })).toBe(false);
    expect(isRelearning(red())).toBe(false); // interval 1, passed before
  });

  it("a reopened red session puts relearning cards first, oldest lapse first", () => {
    const idx = new FlashcardIndex(
      [
        entry("c-000020", "wiki/zettel/R.md", ["c-000021"], [red()]),
        entry("c-000021", "wiki/zettel/R/L.md", [], [red()]),
      ],
      new Set(["wiki/zettel", "wiki/zettel/R"])
    );
    // Lapse the leaf's card (later) and one deep card (earlier).
    idx.byAddress.get("c-000021")!.sidecar!.cards[0]!.state = lapsed("2026-07-17T08:30:00.000Z");
    idx.byAddress.get("c-000020")!.sidecar!.cards.push({
      id: "c-000020-02",
      type: "free",
      content: "**Prompt**\nq\n**Answer**\na",
    notes: "",
      state: lapsed("2026-07-17T08:00:00.000Z"),
    });
    const queue = cards(buildSessionQueue(idx, "c-000020", "red", opts));
    expect(queue.slice(0, 2).map((s) => s.card.id)).toEqual(["c-000020-02", "c-000021-01"]);
    expect(queue.slice(2).every((s) => !isRelearning(s.card.state))).toBe(true);
  });

  it("againReinsertIndex lands 1–10 cards later, clamped to queue end", () => {
    expect(againReinsertIndex(5, 100, () => 0)).toBe(6); // k=1: one card intervenes
    expect(againReinsertIndex(5, 100, () => 0.999)).toBe(15); // k=10
    expect(againReinsertIndex(5, 7, () => 0.999)).toBe(7); // clamped to end
  });
});

describe("note-intro items (plan 002 R1/R2)", () => {
  const fresh = (): CardState => ({ state: "new" });
  // Parent (fresh) -> [ LeafA (fresh), LeafB (reviewed, due) ]
  function freshTree() {
    return new FlashcardIndex(
      [
        entry("c-000030", "wiki/zettel/T.md", ["c-000031", "c-000032"], [fresh(), fresh()]),
        entry("c-000031", "wiki/zettel/T/A.md", [], [fresh()]),
        entry("c-000032", "wiki/zettel/T/B.md", [], [red()]), // red() has reviews: [] — mark reviewed below
      ],
      new Set(["wiki/zettel", "wiki/zettel/T"])
    );
  }

  it("isFirstEncounter: true only when no card has review history", () => {
    const idx = freshTree();
    idx.byAddress.get("c-000032")!.sidecar!.cards[0]!.state.reviews = [{ at: "2026-07-10T00:00:00.000Z", rating: "good" }];
    expect(isFirstEncounter(idx.byAddress.get("c-000031")!)).toBe(true);
    expect(isFirstEncounter(idx.byAddress.get("c-000032")!)).toBe(false);
    expect(isFirstEncounter(entry("c-000099", "wiki/zettel/N.md", [], []))).toBe(false); // no cards, no intro
  });

  it("first-encounter mode: intro precedes only never-reviewed notes, adjacent to their run", () => {
    const idx = freshTree();
    idx.byAddress.get("c-000032")!.sidecar!.cards[0]!.state.reviews = [{ at: "2026-07-10T00:00:00.000Z", rating: "good" }];
    const queue = buildSessionQueue(idx, "c-000030", "red", { ...opts, noteIntroMode: "first-encounter" });
    const shape = queue.map((i) => (i.kind === "note-intro" ? `intro:${i.entry.address}` : i.entry.address));
    expect(shape).toEqual([
      "intro:c-000030", "c-000030", "c-000030",
      "intro:c-000031", "c-000031",
      "c-000032", // has history — no intro
    ]);
  });

  it("always mode gives every contributing note an intro; never mode gives none", () => {
    const idx = freshTree();
    const always = buildSessionQueue(idx, "c-000030", "red", { ...opts, noteIntroMode: "always" });
    expect(always.filter((i) => i.kind === "note-intro")).toHaveLength(3);
    const never = buildSessionQueue(idx, "c-000030", "red", { ...opts, noteIntroMode: "never" });
    expect(never.filter((i) => i.kind === "note-intro")).toHaveLength(0);
  });

  it("a note contributing zero cards contributes no intro", () => {
    const idx = freshTree();
    // LeafA green: out of the red bucket entirely
    idx.byAddress.get("c-000031")!.sidecar!.cards[0]!.state = green(200);
    const queue = buildSessionQueue(idx, "c-000030", "red", { ...opts, noteIntroMode: "always" });
    expect(queue.some((i) => i.kind === "note-intro" && i.entry.address === "c-000031")).toBe(false);
  });

  it("relearning cards pulled to the front carry no first-encounter intro (history implied)", () => {
    const idx = freshTree();
    idx.byAddress.get("c-000032")!.sidecar!.cards[0]!.state = {
      due: "2026-07-17T08:00:00.000Z",
      interval: 0,
      ease: 2.5,
      reviews: [{ at: "2026-07-17T08:00:00.000Z", rating: "reset" }],
    };
    const queue = buildSessionQueue(idx, "c-000030", "red", { ...opts, noteIntroMode: "first-encounter" });
    expect(queue[0]).toMatchObject({ kind: "card", entry: { address: "c-000032" } }); // relearning first
    expect(queue.some((i) => i.kind === "note-intro" && i.entry.address === "c-000032")).toBe(false);
  });
});

describe("note-intro red-yellow mode (plan 008)", () => {
  const yellow = (): CardState => ({ due: new Date(NOW + 12 * 3600 * 1000).toISOString(), interval: 5, ease: 2.5, reviews: [] });
  const ryOpts = { ...opts, noteIntroMode: "red-yellow" as const };
  const introAddrs = (q: SessionItem[]) => q.filter((i) => i.kind === "note-intro").map((i) => i.entry.address);
  const idxOf = (es: NoteEntry[], folders: string[]) => new FlashcardIndex(es, new Set(["wiki/zettel", ...folders]));

  it("every note in a red walk whose subtree has red cards gets an intro (incl. a green-own-cards parent)", () => {
    // Module fixture: c-000001 parent is all-green own cards but every descendant is red.
    // It enters the red walk as a reorientation parent; its subtree is red, so its intro fires.
    const intros = introAddrs(buildSessionQueue(index, "c-000001", "red", ryOpts));
    expect(intros).toEqual(["c-000001", "c-000002", "c-000003", "c-000004"]);
  });

  it("a yellow walk shows intros when the subtree has yellow (due-soon) cards but no red", () => {
    const idx = idxOf(
      [
        entry("c-000040", "wiki/zettel/Y.md", ["c-000041"], [yellow()]),
        entry("c-000041", "wiki/zettel/Y/L.md", [], [yellow()]),
      ],
      ["wiki/zettel/Y"]
    );
    expect(introAddrs(buildSessionQueue(idx, "c-000040", "yellow", ryOpts))).toEqual(["c-000040", "c-000041"]);
  });

  it("an all-green walk shows no intros", () => {
    const idx = idxOf(
      [
        entry("c-000050", "wiki/zettel/G.md", ["c-000051"], [green(100)]),
        entry("c-000051", "wiki/zettel/G/L.md", [], [green(200)]),
      ],
      ["wiki/zettel/G"]
    );
    expect(introAddrs(buildSessionQueue(idx, "c-000050", "green", ryOpts))).toEqual([]);
  });

  it("the intro sits immediately before its note's card run", () => {
    const idx = idxOf(
      [
        entry("c-000060", "wiki/zettel/S.md", ["c-000061"], [red()]),
        entry("c-000061", "wiki/zettel/S/L.md", [], [red(), red()]),
      ],
      ["wiki/zettel/S"]
    );
    const shape = buildSessionQueue(idx, "c-000060", "red", ryOpts).map((i) =>
      i.kind === "note-intro" ? `intro:${i.entry.address}` : i.entry.address
    );
    expect(shape).toEqual(["intro:c-000060", "c-000060", "intro:c-000061", "c-000061", "c-000061"]);
  });

  it("the trigger is subtree state, independent of the session bucket (fires in a green session on a red descendant)", () => {
    const idx = idxOf(
      [
        entry("c-000070", "wiki/zettel/M.md", ["c-000071"], [green(100)]),
        entry("c-000071", "wiki/zettel/M/L.md", [], [red()]),
      ],
      ["wiki/zettel/M"]
    );
    // Green session: only c-000070's green card is in-bucket. c-000071's red card is off-bucket and it is a
    // leaf (no reorientation), so it contributes nothing. c-000070's subtree still holds a red card -> intro.
    expect(introAddrs(buildSessionQueue(idx, "c-000070", "green", ryOpts))).toEqual(["c-000070"]);
  });
});

describe("grading (KTD6)", () => {
  it("auto-checks conservatively and honors post-reveal overrides", () => {
    expect(autoRating(true)).toBe("good");
    expect(autoRating(false)).toBe("again");
    expect(finalRating("good", null)).toBe("good");
    expect(finalRating("good", "easy")).toBe("easy");
    expect(finalRating("again", "hard")).toBe("hard");
  });
});
