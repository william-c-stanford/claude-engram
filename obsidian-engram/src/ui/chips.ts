import { Bucket, Counts, totalCards } from "../scheduler/buckets";

/** A chip is either a card-state bucket or the note-coverage "uncovered" tile. */
export type ChipKind = Bucket | "uncovered";

export interface Chip {
  kind: ChipKind;
  count: number;
}

/**
 * Chip selection per KTD4: zero-count bucket chips are omitted, except green —
 * the healthy count is always shown when the scope has any cards at all. The
 * uncovered chip (notes with no flashcards) is appended last and, unlike the
 * bucket chips, renders even when the scope has zero cards total (KTD2): a
 * freshly-ingested, uncarded note is exactly what it exists to surface.
 */
export function chipsFor(counts: Counts, uncovered: number): Chip[] {
  const chips: Chip[] = [];
  if (totalCards(counts) > 0) {
    if (counts.red > 0) chips.push({ kind: "red", count: counts.red });
    if (counts.yellow > 0) chips.push({ kind: "yellow", count: counts.yellow });
    chips.push({ kind: "green", count: counts.green });
  }
  if (uncovered > 0) chips.push({ kind: "uncovered", count: uncovered });
  return chips;
}
