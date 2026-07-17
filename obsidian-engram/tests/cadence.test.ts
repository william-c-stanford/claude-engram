import { describe, expect, it } from "vitest";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, CardState, ParsedSidecar } from "../src/cards/types";
import {
  cardsInFolder,
  cardsInNote,
  cardsInSubtree,
  formatDueOffset,
  formatIntervalDays,
  medianDueOffsetMs,
  medianIntervalDays,
} from "../src/scheduler/cadence";

const NOW = Date.parse("2026-07-17T09:00:00.000Z");
const DAY = 86_400_000;
const at = (days: number): string => new Date(NOW + days * DAY).toISOString();
const due = (days: number): CardState => ({ due: at(days), interval: days, ease: 2.5, reviews: [] });

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

describe("median due-offset", () => {
  const cards = (states: CardState[]): Card[] => cardsInNote(entry("c-1", "wiki/zettel/N.md", [], states));

  it("odd count returns the middle due date as an offset from now (days)", () => {
    expect(medianDueOffsetMs(cards([due(2), due(10), due(30)]), NOW)! / DAY).toBeCloseTo(10);
  });

  it("even count averages the two middle due dates", () => {
    expect(medianDueOffsetMs(cards([due(2), due(8), due(12), due(30)]), NOW)! / DAY).toBeCloseTo(10);
  });

  it("is not dragged by a long right tail the way a mean would be", () => {
    // 3 near-due cards + one 2-year mature card: median stays near 2.5d, not ~184 (the mean).
    expect(medianDueOffsetMs(cards([due(1), due(2), due(3), due(730)]), NOW)! / DAY).toBeCloseTo(2.5);
  });

  it("overdue cards yield a negative offset", () => {
    expect(medianDueOffsetMs(cards([due(-5), due(-3), due(-1)]), NOW)! / DAY).toBeCloseTo(-3);
  });

  it("new cards count as due now (0 offset)", () => {
    expect(medianDueOffsetMs(cards([{ state: "new" }, { state: "new" }, due(20)]), NOW)! / DAY).toBeCloseTo(0);
  });

  it("returns null for an empty scope", () => {
    expect(medianDueOffsetMs([], NOW)).toBeNull();
  });
});

describe("median interval (maturity)", () => {
  const cards = (states: CardState[]): Card[] => cardsInNote(entry("c-1", "wiki/zettel/N.md", [], states));

  it("is the median current spacing in days", () => {
    expect(medianIntervalDays(cards([due(4), due(10), due(40)]))).toBeCloseTo(10);
  });

  it("counts new/unlearned cards as 0", () => {
    expect(medianIntervalDays(cards([{ state: "new" }, { state: "new" }, due(20)]))).toBeCloseTo(0);
  });

  it("does not go negative for overdue cards (interval is spacing, not position)", () => {
    // A card overdue by 5 days can still carry a 30-day interval.
    const overdueButMature: CardState = { due: at(-5), interval: 30, ease: 2.5, reviews: [] };
    expect(medianIntervalDays(cards([overdueButMature, overdueButMature, overdueButMature]))).toBeCloseTo(30);
  });

  it("returns null for an empty scope", () => {
    expect(medianIntervalDays([])).toBeNull();
  });
});

describe("cadence rollups mirror the count topology", () => {
  // Root -> [A -> [A1], B]; all cards pooled for one median.
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

  it("subtree pools all descendant cards", () => {
    // A subtree: A(10), A1(6,6) -> median [6,6,10] = 6
    expect(medianDueOffsetMs(cardsInSubtree(index, "c-000002"), NOW)! / DAY).toBeCloseTo(6);
  });

  it("folder with a paired note equals that note's subtree exactly (R9)", () => {
    expect(cardsInFolder(index, "wiki/zettel/Root/A")).toEqual(cardsInSubtree(index, "c-000002"));
  });

  it("folder with no paired note pools across the notes inside it", () => {
    // All cards under root: 4,40,10,6,6 -> median [4,6,6,10,40] = 6
    expect(medianDueOffsetMs(cardsInFolder(index, "wiki/zettel"), NOW)! / DAY).toBeCloseTo(6);
  });
});

describe("formatting", () => {
  it("due offset: 'now' at or before zero, else a rounded unit", () => {
    expect(formatDueOffset(0)).toBe("now");
    expect(formatDueOffset(-5 * DAY)).toBe("now");
    expect(formatDueOffset(0.3 * DAY)).toBe("1d");
    expect(formatDueOffset(4 * DAY)).toBe("4d");
    expect(formatDueOffset(21 * DAY)).toBe("3w");
    expect(formatDueOffset(90 * DAY)).toBe("3mo");
  });

  it("interval: 'new' at zero, else a rounded unit", () => {
    expect(formatIntervalDays(0)).toBe("new");
    expect(formatIntervalDays(10)).toBe("10d");
    expect(formatIntervalDays(56)).toBe("8w");
    expect(formatIntervalDays(365)).toBe("12mo");
  });
});
