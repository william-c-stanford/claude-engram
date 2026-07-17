import { describe, expect, it } from "vitest";
import { FlashcardIndex, NoteEntry } from "../src/index/flashcard-index";
import { Card, CardState, ParsedSidecar, ReviewLogEntry } from "../src/cards/types";
import { accuracyOf, formatAccuracy } from "../src/scheduler/accuracy";

function stateWith(reviews: ReviewLogEntry[]): CardState {
  return { due: "2026-08-01T00:00:00.000Z", interval: 4, ease: 2.5, reviews };
}

const at = "2026-07-17T09:00:00.000Z";
const ok: ReviewLogEntry = { at, rating: "good", verdict: "correct" };
const miss: ReviewLogEntry = { at, rating: "good", verdict: "incorrect" }; // overridden miss still counts
const unchecked: ReviewLogEntry = { at, rating: "good" }; // open-ended / legacy
const reset: ReviewLogEntry = { at, rating: "reset" };

function sidecarWith(address: string, cards: ReviewLogEntry[][]): ParsedSidecar {
  const built: Card[] = cards.map((reviews, i) => ({
    id: `${address}-${String(i + 1).padStart(2, "0")}`,
    type: "free",
    content: "**Prompt**\nq\n**Answer**\na",
    notes: "",
    state: stateWith(reviews),
  }));
  return { noteAddress: address, noteTitle: address, cards: built, orphanedStateIds: [], retiredLines: [], warnings: [] };
}

function entry(address: string, notePath: string, children: string[], cards?: ReviewLogEntry[][]): NoteEntry {
  return {
    address,
    notePath,
    title: notePath.split("/").pop()!.replace(/\.md$/, ""),
    childrenAddresses: children,
    sidecar: cards ? sidecarWith(address, cards) : undefined,
  };
}

// Root (1 correct, 1 unchecked) -> [A (1 correct, 1 miss, 1 reset), B (never checked)]
const index = new FlashcardIndex(
  [
    entry("c-000001", "wiki/zettel/Root.md", ["c-000002", "c-000003"], [[ok, unchecked]]),
    entry("c-000002", "wiki/zettel/Root/A.md", [], [[ok], [miss, reset]]),
    entry("c-000003", "wiki/zettel/Root/B.md", [], [[unchecked]]),
  ],
  new Set(["wiki/zettel", "wiki/zettel/Root"])
);

describe("accuracyOf (plan 005 R3/R4)", () => {
  it("counts only verdict-carrying entries; rollups match hand computation (AE3)", () => {
    const rows = accuracyOf(index, "c-000001");
    expect(rows.map((r) => r.entry.address)).toEqual(["c-000001", "c-000002", "c-000003"]);

    const [root, a, b] = rows as [typeof rows[0], typeof rows[0], typeof rows[0]];
    expect({ checked: root.checked, correct: root.correct }).toEqual({ checked: 1, correct: 1 }); // own only
    expect(root.subtree).toEqual({ checked: 3, correct: 2 }); // 1 own + 2 in A; unchecked/reset excluded
    expect({ checked: a.checked, correct: a.correct }).toEqual({ checked: 2, correct: 1 });
    expect({ checked: b.checked, correct: b.correct }).toEqual({ checked: 0, correct: 0 });
  });

  it("overridden misses count against accuracy (AE1 downstream)", () => {
    const a = accuracyOf(index, "c-000002")[0]!;
    expect(a.correct).toBe(1);
    expect(a.checked).toBe(2); // the good-rated incorrect answer is still a miss here
  });

  it("depth reflects the walk for indentation", () => {
    const rows = accuracyOf(index, "c-000001");
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 1]);
  });

  it("a shared child (frontmatter DAG) counts once in ancestor rollups", () => {
    // Root -> [A, B], both listing C as a child.
    const dag = new FlashcardIndex(
      [
        entry("c-000020", "wiki/zettel/R.md", ["c-000021", "c-000022"]),
        entry("c-000021", "wiki/zettel/R/A.md", ["c-000023"]),
        entry("c-000022", "wiki/zettel/R/B.md", ["c-000023"]),
        entry("c-000023", "wiki/zettel/R/A/C.md", [], [[ok, ok]]),
      ],
      new Set(["wiki/zettel", "wiki/zettel/R", "wiki/zettel/R/A", "wiki/zettel/R/B"])
    );
    const rootRow = accuracyOf(dag, "c-000020")[0]!;
    expect(rootRow.subtree).toEqual({ checked: 2, correct: 2 }); // not 4/4
  });

  it("notes without sidecars and empty trees don't crash", () => {
    const bare = new FlashcardIndex([entry("c-000010", "wiki/zettel/Bare.md", [])], new Set(["wiki/zettel"]));
    expect(accuracyOf(bare, "c-000010")).toHaveLength(1);
    expect(accuracyOf(bare, "c-000099")).toEqual([]);
  });
});

describe("formatAccuracy", () => {
  it("renders percent with counts, em dash when never checked (R3)", () => {
    expect(formatAccuracy({ checked: 10, correct: 6 })).toBe("60% (6/10)");
    expect(formatAccuracy({ checked: 3, correct: 3 })).toBe("100% (3/3)");
    expect(formatAccuracy({ checked: 0, correct: 0 })).toBe("—");
  });
});
