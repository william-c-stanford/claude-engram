import { Rating } from "../cards/types";

/**
 * KTD6: auto-checked card types map conservatively — correct answers are Good,
 * incorrect are Again. The user can override after the reveal.
 */
export function autoRating(correct: boolean): Rating {
  return correct ? "good" : "again";
}

/** A post-reveal override replaces the auto rating before scheduling. */
export function finalRating(auto: Rating, override: Rating | null): Rating {
  return override ?? auto;
}
