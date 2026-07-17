import { describe, expect, it } from "vitest";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, CardState, ParsedSidecar } from "../src/cards/types";
import { againReinsertIndex, buildSessionQueue, isRelearning } from "../src/ui/session-queue";
import { chipsFor } from "../src/ui/chips";
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
    state,
  }));
  return { noteAddress: address, noteTitle: address, cards, orphanedStateIds: [], retiredLines: [], warnings: [] };
}

function entry(address: string, notePath: string, children: string[], states: CardState[]): NoteEntry {
  return { address, notePath, title: notePath, childrenAddresses: children, sidecar: states.length ? sidecarWith(address, states) : undefined };
}

const opts = { nowMs: NOW, warnWindowHours: 24, skipGreenParents: false, reorientationSampleSize: 3, random: () => 0.5 };

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
    const queue = buildSessionQueue(index, "c-000001", "red", opts);
    const byNote = queue.map((s) => s.entry.address);
    // parent sample first, then LeafA, then Mid, then LeafB — contiguous runs
    expect(byNote).toEqual(["c-000001", "c-000001", "c-000001", "c-000002", "c-000002", "c-000003", "c-000004", "c-000004"]);
  });

  it("an all-green parent contributes its reorientation sample, most-nearly-due first", () => {
    const queue = buildSessionQueue(index, "c-000001", "red", opts);
    const sample = queue.filter((s) => s.reorientation);
    expect(sample).toHaveLength(3);
    // sorted by due ascending: the 50h card first, then 100h, then 200h
    expect(sample.map((s) => s.card.id)).toEqual(["c-000001-02", "c-000001-01", "c-000001-03"]);
  });

  it("skip-green-parents removes the reorientation sample entirely", () => {
    const queue = buildSessionQueue(index, "c-000001", "red", { ...opts, skipGreenParents: true });
    expect(queue.filter((s) => s.reorientation)).toHaveLength(0);
    expect(queue.map((s) => s.entry.address)).toEqual(["c-000002", "c-000002", "c-000003", "c-000004", "c-000004"]);
  });

  it("a leaf with nothing in the bucket contributes nothing (no reorientation for leaves)", () => {
    const idx = new FlashcardIndex(
      [entry("c-000010", "wiki/zettel/Q.md", ["c-000011"], [red()]), entry("c-000011", "wiki/zettel/Q/L.md", [], [green()])],
      new Set(["wiki/zettel", "wiki/zettel/Q"])
    );
    const queue = buildSessionQueue(idx, "c-000010", "red", opts);
    expect(queue.map((s) => s.entry.address)).toEqual(["c-000010"]);
  });

  it("green bucket (practice-ahead) selects green cards directly", () => {
    const queue = buildSessionQueue(index, "c-000001", "green", opts);
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
      state: lapsed("2026-07-17T08:00:00.000Z"),
    });
    const queue = buildSessionQueue(idx, "c-000020", "red", opts);
    expect(queue.slice(0, 2).map((s) => s.card.id)).toEqual(["c-000020-02", "c-000021-01"]);
    expect(queue.slice(2).every((s) => !isRelearning(s.card.state))).toBe(true);
  });

  it("againReinsertIndex lands 1–10 cards later, clamped to queue end", () => {
    expect(againReinsertIndex(5, 100, () => 0)).toBe(6); // k=1: one card intervenes
    expect(againReinsertIndex(5, 100, () => 0.999)).toBe(15); // k=10
    expect(againReinsertIndex(5, 7, () => 0.999)).toBe(7); // clamped to end
  });
});

describe("chipsFor (KTD4)", () => {
  it("omits zero chips except green, which always shows when cards exist", () => {
    expect(chipsFor({ red: 0, yellow: 3, green: 10 })).toEqual([
      { bucket: "yellow", count: 3 },
      { bucket: "green", count: 10 },
    ]);
    expect(chipsFor({ red: 2, yellow: 0, green: 0 })).toEqual([
      { bucket: "red", count: 2 },
      { bucket: "green", count: 0 },
    ]);
    expect(chipsFor({ red: 0, yellow: 0, green: 0 })).toEqual([]);
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
