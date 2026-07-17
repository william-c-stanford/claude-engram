export type CardType = "cloze" | "mcq" | "free" | "derivation" | "pseudocode";

export const CARD_TYPES: readonly CardType[] = ["cloze", "mcq", "free", "derivation", "pseudocode"];

export type Rating = "again" | "hard" | "good" | "easy";

export interface ReviewLogEntry {
  at: string; // ISO 8601 UTC
  rating: Rating;
}

/** Scheduling state per docs/flashcard-format.md. A never-reviewed card is {state:"new"}. */
export interface CardState {
  state?: "new";
  due?: string; // ISO 8601 UTC
  interval?: number; // days
  ease?: number;
  reviews?: ReviewLogEntry[];
}

export const NEW_STATE: CardState = { state: "new" };

export interface Card {
  id: string; // <note_address>-<nn>
  type: CardType;
  /** Raw markdown content of the block below the type line. */
  content: string;
  state: CardState;
}

export interface ParsedSidecar {
  noteAddress: string;
  noteTitle: string;
  cards: Card[];
  /** srs lines whose card id has no card block in this file (preserved, never scheduled). */
  orphanedStateIds: string[];
  /** Retired state lines, preserved verbatim on rewrite. */
  retiredLines: string[];
  warnings: string[];
}
