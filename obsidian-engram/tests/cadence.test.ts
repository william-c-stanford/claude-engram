import { describe, expect, it } from "vitest";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, CardState, ParsedSidecar } from "../src/cards/types";
import {
  folderMedianDueOffsetMs,
  formatDueOffset,
  noteMedianDueOffsetMs,
  subtreeMedianDueOffsetMs,
} from "../src/scheduler/cadence";

const NOW = Date.parse("2026-07-17T09:00:00.000Z");
const DAY = 86_400_000;
const at = (days: number): string => new Date(NOW + days * DAY).toISOString();

function sidecar(address: string, states: CardState[]): ParsedSidecar {
  const cards: Card[] = states.map((state, i) => ({
    id: `${address}-${String(i + 1).padStart(2, "0")}`,
    type: "free",
    content: "q",
    notes: "",
    state,
  }));
  return { noteAddress: address, noteTitle: address, cards, orphanedStateIds: [], retiredLines: [], warnings: [] };
}

function entry(address: string, notePath: string, children: string[], states: CardState[] | null): NoteEntry {
  return {
    address,
    notePath,
    title: notePath,
    childrenAddresses: children,
    sidecar: states ? sidecar(address, states) : undefined,
  };
}

const due = (days: number): CardState => ({ due: at(days), interval: days, ease: 2.5, reviews: [] });

describe("median due-offset (cadence)", () => {
  it("odd count returns the middle due date, as an offset from now (in days)", () => {
    const e = entry("c-1", "wiki/zettel/N.md", [], [due(2), due(10), due(30)]);
    expect(noteMedianDueOffsetMs(e, NOW)! / DAY).toBeCloseTo(10);
  });

  it("even count averages the two middle due dates", () => {
    const e = entry("c-1", "wiki/zettel/N.md", [], [due(2), due(8), due(12), due(30)]);
    expect(noteMedianDueOffsetMs(e, NOW)! / DAY).toBeCloseTo(10); // (8 + 12) / 2
  });

  it("is not dragged by a long right tail the way a mean would be", () => {
    // 3 cards due in ~2 days, one mature card due in 2 years: median stays near 2d.
    const e = entry("c-1", "wiki/zettel/N.md", [], [due(1), due(2), due(3), due(730)]);
    expect(noteMedianDueOffsetMs(e, NOW)! / DAY).toBeCloseTo(2.5); // (2 + 3) / 2, not ~184 (the mean)
  });

  it("overdue cards yield a negative offset", () => {
    const e = entry("c-1", "wiki/zettel/N.md", [], [due(-5), due(-3), due(-1)]);
    expect(noteMedianDueOffsetMs(e, NOW)! / DAY).toBeCloseTo(-3);
  });

  it("new cards count as due now (0 offset)", () => {
    const e = entry("c-1", "wiki/zettel/N.md", [], [{ state: "new" }, { state: "new" }, due(20)]);
    expect(noteMedianDueOffsetMs(e, NOW)! / DAY).toBeCloseTo(0); // median of [0, 0, 20]
  });

  it("returns null when a scope has no cards", () => {
    expect(noteMedianDueOffsetMs(entry("c-1", "wiki/zettel/N.md", [], null), NOW)).toBeNull();
    expect(noteMedianDueOffsetMs(entry("c-1", "wiki/zettel/N.md", [], []), NOW)).toBeNull();
  });
});

describe("cadence rollups mirror the count topology", () => {
  // Root -> [A -> [A1], B]; pool every card for one median.
  const entries = [
    entry("c-000001", "wiki/zettel/Root.md", ["c-000002", "c-000004"], [due(4), due(40)]),
    entry("c-000002", "wiki/zettel/Root/A.md", ["c-000003"], [due(10)]),
    entry("c-000003", "wiki/zettel/Root/A/A1.md", [], [due(6), due(6)]),
    entry("c-000004", "wiki/zettel/Root/B.md", [], null),
  ];
  const index = new FlashcardIndex(
    entries,
    new Set(["wiki/zettel", "wiki/zettel/Root", "wiki/zettel/Root/A"])
  );

  it("subtree pools all descendant cards into one median", () => {
    // A subtree cards: A(10), A1(6,6) -> median of [6,6,10] = 6
    expect(subtreeMedianDueOffsetMs(index, "c-000002", NOW)! / DAY).toBeCloseTo(6);
  });

  it("folder with a paired note equals that note's subtree exactly (R9)", () => {
    expect(folderMedianDueOffsetMs(index, "wiki/zettel/Root/A", NOW)).toBe(
      subtreeMedianDueOffsetMs(index, "c-000002", NOW)
    );
  });

  it("folder with no paired note pools across the notes inside it", () => {
    // All cards under the root: 4,40 (Root) + 10 (A) + 6,6 (A1) -> [4,6,6,10,40] median 6
    expect(folderMedianDueOffsetMs(index, "wiki/zettel", NOW)! / DAY).toBeCloseTo(6);
  });
});

describe("formatDueOffset", () => {
  it("shows 'now' at or before zero", () => {
    expect(formatDueOffset(0)).toBe("now");
    expect(formatDueOffset(-5 * DAY)).toBe("now");
  });
  it("rounds sub-day positive offsets up to 1d", () => {
    expect(formatDueOffset(0.3 * DAY)).toBe("1d");
  });
  it("uses days under a fortnight", () => {
    expect(formatDueOffset(4 * DAY)).toBe("4d");
    expect(formatDueOffset(13 * DAY)).toBe("13d");
  });
  it("uses weeks up to two months", () => {
    expect(formatDueOffset(21 * DAY)).toBe("3w");
    expect(formatDueOffset(56 * DAY)).toBe("8w");
  });
  it("uses months beyond", () => {
    expect(formatDueOffset(90 * DAY)).toBe("3mo");
    expect(formatDueOffset(365 * DAY)).toBe("12mo");
  });
});
