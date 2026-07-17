import { describe, expect, it } from "vitest";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, CardState, ParsedSidecar } from "../src/cards/types";
import { folderCounts, noteCounts, subtreeCounts } from "../src/scheduler/rollup";

const NOW = Date.parse("2026-07-17T09:00:00.000Z");
const WARN = 24;

const red: CardState = { due: "2026-07-16T09:00:00.000Z", interval: 1, ease: 2.5, reviews: [] };
const yellow: CardState = { due: "2026-07-17T20:00:00.000Z", interval: 1, ease: 2.5, reviews: [] };
const green: CardState = { due: "2026-08-01T09:00:00.000Z", interval: 25, ease: 2.5, reviews: [] };

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
  return {
    address,
    notePath,
    title: notePath,
    childrenAddresses: children,
    sidecar: states.length > 0 ? sidecarWith(address, states) : undefined,
  };
}

// Three-level tree: Root -> [A -> [A1], B]
const entries = [
  entry("c-000001", "wiki/zettel/Root.md", ["c-000002", "c-000004"], [red, green]),
  entry("c-000002", "wiki/zettel/Root/A.md", ["c-000003"], [yellow]),
  entry("c-000003", "wiki/zettel/Root/A/A1.md", [], [red, red, green]),
  entry("c-000004", "wiki/zettel/Root/B.md", [], []),
];
const index = new FlashcardIndex(
  entries,
  new Set(["wiki/zettel", "wiki/zettel/Root", "wiki/zettel/Root/A"])
);

describe("rollups (R10, R14)", () => {
  it("leaf counts are the note's own cards", () => {
    expect(noteCounts(index.byAddress.get("c-000003")!, NOW, WARN)).toEqual({ red: 2, yellow: 0, green: 1 });
  });

  it("parent rollups include the parent's own cards plus all descendants", () => {
    expect(subtreeCounts(index, "c-000002", NOW, WARN)).toEqual({ red: 2, yellow: 1, green: 1 });
    expect(subtreeCounts(index, "c-000001", NOW, WARN)).toEqual({ red: 3, yellow: 1, green: 2 });
  });

  it("sibling subtrees stay independent", () => {
    expect(subtreeCounts(index, "c-000004", NOW, WARN)).toEqual({ red: 0, yellow: 0, green: 0 });
  });

  it("a note with no sidecar contributes zero without erroring", () => {
    expect(noteCounts(index.byAddress.get("c-000004")!, NOW, WARN)).toEqual({ red: 0, yellow: 0, green: 0 });
  });

  it("folder counts match the paired parent note's rollup exactly (R9)", () => {
    expect(folderCounts(index, "wiki/zettel/Root/A", NOW, WARN)).toEqual(subtreeCounts(index, "c-000002", NOW, WARN));
  });

  it("a folder with no paired note sums the subtrees of the notes inside it", () => {
    expect(folderCounts(index, "wiki/zettel", NOW, WARN)).toEqual({ red: 3, yellow: 1, green: 2 });
  });
});
