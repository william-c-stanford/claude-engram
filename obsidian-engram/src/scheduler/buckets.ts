import { Card, CardState } from "../cards/types";

export type Bucket = "red" | "yellow" | "green";

export interface Counts {
  red: number;
  yellow: number;
  green: number;
}

export const ZERO_COUNTS: Counts = { red: 0, yellow: 0, green: 0 };

/**
 * Bucket classification per the plan's table: red = due or overdue (new cards
 * are due for their first review), yellow = due within the warn window,
 * green = beyond it.
 */
export function bucketOf(state: CardState, nowMs: number, warnWindowHours: number): Bucket {
  if (state.state === "new" || !state.due) return "red";
  const due = Date.parse(state.due);
  if (Number.isNaN(due) || due <= nowMs) return "red";
  if (due <= nowMs + warnWindowHours * 3600 * 1000) return "yellow";
  return "green";
}

export function countCards(cards: Card[], nowMs: number, warnWindowHours: number): Counts {
  const counts: Counts = { red: 0, yellow: 0, green: 0 };
  for (const card of cards) counts[bucketOf(card.state, nowMs, warnWindowHours)]++;
  return counts;
}

export function addCounts(a: Counts, b: Counts): Counts {
  return { red: a.red + b.red, yellow: a.yellow + b.yellow, green: a.green + b.green };
}

export function totalCards(c: Counts): number {
  return c.red + c.yellow + c.green;
}
