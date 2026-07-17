import { FlashcardIndex, NoteEntry } from "../index/flashcard-index";
import { Card, CardState } from "../cards/types";

/**
 * Branch review cadence: the MEDIAN due date of every card in a scope, expressed
 * as an offset from now (ms; negative = the branch is overdue). Median, not mean,
 * because interval distributions are strongly right-skewed (the ladder is roughly
 * geometric) and a few long-interval mature cards would drag a mean far into the
 * future, hiding a near-term review load. A new (never-reviewed) card is due now,
 * so it contributes a 0 offset.
 */
function cardDueMs(state: CardState, nowMs: number): number {
  if (state.state === "new" || !state.due) return nowMs;
  const t = Date.parse(state.due);
  return Number.isNaN(t) ? nowMs : t;
}

function collect(cards: Card[], nowMs: number, out: number[]): void {
  for (const c of cards) out.push(cardDueMs(c.state, nowMs));
}

/** Median of a non-empty array; averages the two middle values for even length. */
function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function medianOffset(dues: number[], nowMs: number): number | null {
  return dues.length > 0 ? median(dues) - nowMs : null;
}

/** Median due offset (ms from now) for a single note's own cards, or null if it has none. */
export function noteMedianDueOffsetMs(entry: NoteEntry, nowMs: number): number | null {
  const dues: number[] = [];
  if (entry.sidecar) collect(entry.sidecar.cards, nowMs, dues);
  return medianOffset(dues, nowMs);
}

/** Median due offset across a parent note's whole subtree (R9 rollup), or null if empty. */
export function subtreeMedianDueOffsetMs(index: FlashcardIndex, address: string, nowMs: number): number | null {
  const dues: number[] = [];
  for (const entry of index.subtreeOf(address)) {
    if (entry.sidecar) collect(entry.sidecar.cards, nowMs, dues);
  }
  return medianOffset(dues, nowMs);
}

/**
 * Median due offset for a folder row. Mirrors folderCounts: a folder with a
 * paired parent note reports that note's subtree exactly; otherwise it pools
 * every card across the subtrees of the notes directly inside it and takes one
 * median over the pool (not a median-of-medians).
 */
export function folderMedianDueOffsetMs(index: FlashcardIndex, folderPath: string, nowMs: number): number | null {
  const paired = index.noteForFolder(folderPath);
  if (paired) return subtreeMedianDueOffsetMs(index, paired.address, nowMs);
  const dues: number[] = [];
  for (const entry of index.notesDirectlyIn(folderPath)) {
    for (const n of index.subtreeOf(entry.address)) {
      if (n.sidecar) collect(n.sidecar.cards, nowMs, dues);
    }
  }
  return medianOffset(dues, nowMs);
}

/**
 * Compact human label for a due offset: "now" when due or overdue, else a
 * single rounded unit — days under a fortnight, weeks under two months, months
 * beyond. Callers prefix "~" for positive offsets to signal it's a median.
 */
export function formatDueOffset(ms: number): string {
  if (ms <= 0) return "now";
  const days = ms / 86_400_000;
  if (days < 14) return `${Math.max(1, Math.round(days))}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30.44)}mo`;
}
