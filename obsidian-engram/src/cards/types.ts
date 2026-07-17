export type CardType = "cloze" | "mcq" | "free" | "derivation" | "pseudocode";

export const CARD_TYPES: readonly CardType[] = ["cloze", "mcq", "free", "derivation", "pseudocode"];

export type Rating = "again" | "hard" | "good" | "easy";

/** Log entries record the four ratings plus `reset` (source-note re-read; not a rating). */
export type ReviewEventKind = Rating | "reset";

/** Raw outcome of a mechanical check (typed cloze, MCQ) at answer time. */
export type Verdict = "correct" | "incorrect";

export interface ReviewLogEntry {
  at: string; // ISO 8601 UTC
  rating: ReviewEventKind;
  /**
   * Present only when the answer was mechanically checked; frozen before any
   * rating override, so accuracy stays honest even when the user rates Good
   * over an incorrect check (plan 005 R1). Absent = not checked.
   */
  verdict?: Verdict;
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
  /** Markdown content of the block below the type line, annotation excluded. */
  content: string;
  /** Annotation from the card's **Notes** section — hidden while answering, shown after reveal. */
  notes: string;
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
