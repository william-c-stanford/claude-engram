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

/**
 * A note is uncovered when it has no flashcards at all: no sidecar, or a
 * sidecar whose card list is empty. Coverage is time-independent, so these
 * rollups take no nowMs/warnWindowHours (unlike the card-bucket rollups above).
 */
export function isUncovered(entry: NoteEntry): boolean {
  return !entry.sidecar || entry.sidecar.cards.length === 0;
}

/** 1 if this single note has no cards, else 0. */
export function noteUncovered(entry: NoteEntry): number {
  return isUncovered(entry) ? 1 : 0;
}

/** Count of uncovered notes anywhere in a parent note's subtree (R2). */
export function subtreeUncovered(index: FlashcardIndex, address: string): number {
  let total = 0;
  for (const entry of index.subtreeOf(address)) {
    if (isUncovered(entry)) total++;
  }
  return total;
}

/**
 * Uncovered count for a folder row: mirrors folderCounts. A folder with a
 * paired parent note reports that note's subtree exactly (R9 parity);
 * otherwise it sums the subtrees of the notes directly inside it.
 */
export function folderUncovered(index: FlashcardIndex, folderPath: string): number {
  const paired = index.noteForFolder(folderPath);
  if (paired) return subtreeUncovered(index, paired.address);
  let total = 0;
  for (const entry of index.notesDirectlyIn(folderPath)) {
    total += subtreeUncovered(index, entry.address);
  }
  return total;
}
