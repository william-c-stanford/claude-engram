import { Bucket, Counts, totalCards } from "../scheduler/buckets";

export interface Chip {
  bucket: Bucket;
  count: number;
}

/**
 * Chip selection per KTD4: zero-count chips are omitted, except green — the
 * healthy count is always shown when the scope has any cards at all. No cards,
 * no chips.
 */
export function chipsFor(counts: Counts): Chip[] {
  if (totalCards(counts) === 0) return [];
  const chips: Chip[] = [];
  if (counts.red > 0) chips.push({ bucket: "red", count: counts.red });
  if (counts.yellow > 0) chips.push({ bucket: "yellow", count: counts.yellow });
  chips.push({ bucket: "green", count: counts.green });
  return chips;
}
