import { FlashcardIndex, NoteEntry } from "../index/flashcard-index";

export interface AccuracyCounts {
  /** Reviews that carried a mechanical-check verdict. */
  checked: number;
  correct: number;
}

export interface NoteAccuracy extends AccuracyCounts {
  entry: NoteEntry;
  /** Depth in the walk, for indented rendering. */
  depth: number;
  /** Own cards plus every descendant's (parents only differ from own when they have children). */
  subtree: AccuracyCounts;
}

function ownCounts(entry: NoteEntry): AccuracyCounts {
  const counts: AccuracyCounts = { checked: 0, correct: 0 };
  for (const card of entry.sidecar?.cards ?? []) {
    for (const review of card.state.reviews ?? []) {
      if (review.verdict === undefined) continue; // unchecked / legacy / reset — out of accuracy math (R2)
      counts.checked++;
      if (review.verdict === "correct") counts.correct++;
    }
  }
  return counts;
}

/**
 * Per-note accuracy over a subtree in the mental-palace order (plan 005 R3/R4):
 * every logged verdict counts (per-attempt accuracy), entries without verdicts
 * are excluded from numerator and denominator. Single recursive pass — rows in
 * pre-order, subtree totals accumulated post-order — so each note is visited
 * exactly once: linear work, and a note reachable through two parents
 * (frontmatter DAG) contributes to an ancestor rollup only once.
 */
export function accuracyOf(index: FlashcardIndex, rootAddress: string): NoteAccuracy[] {
  const root = index.byAddress.get(rootAddress);
  if (!root) return [];
  const rootDepth = root.notePath.split("/").length;
  const rows: NoteAccuracy[] = [];

  const visit = (entry: NoteEntry, seen: Set<string>): AccuracyCounts => {
    if (seen.has(entry.address)) return { checked: 0, correct: 0 };
    seen.add(entry.address);
    const own = ownCounts(entry);
    const row: NoteAccuracy = {
      entry,
      depth: entry.notePath.split("/").length - rootDepth,
      ...own,
      subtree: { ...own },
    };
    rows.push(row);
    for (const child of index.childrenOf(entry)) {
      const childTotal = visit(child, seen);
      row.subtree.checked += childTotal.checked;
      row.subtree.correct += childTotal.correct;
    }
    return row.subtree;
  };

  visit(root, new Set());
  return rows;
}

/** "60% (6/10)" or an em dash when nothing was ever checked. */
export function formatAccuracy(counts: AccuracyCounts): string {
  if (counts.checked === 0) return "—";
  return `${Math.round((100 * counts.correct) / counts.checked)}% (${counts.correct}/${counts.checked})`;
}
