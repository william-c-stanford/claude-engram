import { FlashcardIndex, NoteEntry } from "../index/flashcard-index";
import { Card, CardState } from "../cards/types";

/**
 * Branch review cadence — two medians over every card in a scope:
 *   - due offset: the median DUE date, as time from now (negative = overdue).
 *     Answers "when is this branch ripe for a walk?" — it drifts toward now as
 *     you fall behind.
 *   - interval: the median current spacing. Answers "how mature is this branch?"
 *     — stable over time, independent of where you are in the schedule.
 * Median, not mean: spaced-repetition intervals are strongly right-skewed (the
 * ladder is roughly geometric), so a mean is dragged into the future by a few
 * mature cards and hides a near-term load. A new (never-reviewed) card is due
 * now (0 offset) and has no spacing yet (interval 0).
 */

const DAY = 86_400_000;

// ---- scope → cards (rollup topology mirrors the count chips, R9) ----

export function cardsInNote(entry: NoteEntry): Card[] {
  return entry.sidecar?.cards ?? [];
}

export function cardsInSubtree(index: FlashcardIndex, address: string): Card[] {
  const out: Card[] = [];
  for (const e of index.subtreeOf(address)) if (e.sidecar) out.push(...e.sidecar.cards);
  return out;
}

export function cardsInFolder(index: FlashcardIndex, folderPath: string): Card[] {
  const paired = index.noteForFolder(folderPath);
  if (paired) return cardsInSubtree(index, paired.address);
  const out: Card[] = [];
  for (const e of index.notesDirectlyIn(folderPath)) out.push(...cardsInSubtree(index, e.address));
  return out;
}

// ---- per-card values ----

function cardDueMs(state: CardState, nowMs: number): number {
  if (state.state === "new" || !state.due) return nowMs;
  const t = Date.parse(state.due);
  return Number.isNaN(t) ? nowMs : t;
}

function cardIntervalDays(state: CardState): number {
  return typeof state.interval === "number" && state.interval > 0 ? state.interval : 0;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** Median due date across the cards, as ms from now (negative = overdue); null if empty. */
export function medianDueOffsetMs(cards: Card[], nowMs: number): number | null {
  if (cards.length === 0) return null;
  return median(cards.map((c) => cardDueMs(c.state, nowMs))) - nowMs;
}

/** Median current interval in days; new/unlearned cards count as 0; null if empty. */
export function medianIntervalDays(cards: Card[]): number | null {
  if (cards.length === 0) return null;
  return median(cards.map((c) => cardIntervalDays(c.state)));
}

// ---- compact labels ----

function tier(days: number): string {
  if (days < 14) return `${Math.max(1, Math.round(days))}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30.44)}mo`;
}

/** Due-offset label: "now" at or before zero, else a single rounded unit. */
export function formatDueOffset(ms: number): string {
  return ms <= 0 ? "now" : tier(ms / DAY);
}

/** Interval label: "new" when nothing has matured yet (median 0), else a unit. */
export function formatIntervalDays(days: number): string {
  return days <= 0 ? "new" : tier(days);
}
