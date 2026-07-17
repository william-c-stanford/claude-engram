import { FlashcardIndex, NoteEntry } from "../index/flashcard-index";
import { Counts, ZERO_COUNTS, addCounts, countCards } from "./buckets";

/** A single note's own cards, bucketed. */
export function noteCounts(entry: NoteEntry, nowMs: number, warnWindowHours: number): Counts {
  if (!entry.sidecar) return ZERO_COUNTS;
  return countCards(entry.sidecar.cards, nowMs, warnWindowHours);
}

/**
 * Subtree rollup for a parent note / its paired folder: the parent's own
 * cards plus every descendant's (R10). Leaf notes get their own counts.
 */
export function subtreeCounts(index: FlashcardIndex, address: string, nowMs: number, warnWindowHours: number): Counts {
  let total = ZERO_COUNTS;
  for (const entry of index.subtreeOf(address)) {
    total = addCounts(total, noteCounts(entry, nowMs, warnWindowHours));
  }
  return total;
}

/**
 * Counts for a folder row that has no paired parent note: sum over the
 * subtrees of the notes directly inside it.
 */
export function folderCounts(index: FlashcardIndex, folderPath: string, nowMs: number, warnWindowHours: number): Counts {
  const paired = index.noteForFolder(folderPath);
  if (paired) return subtreeCounts(index, paired.address, nowMs, warnWindowHours);
  let total = ZERO_COUNTS;
  for (const entry of index.notesDirectlyIn(folderPath)) {
    total = addCounts(total, subtreeCounts(index, entry.address, nowMs, warnWindowHours));
  }
  return total;
}
