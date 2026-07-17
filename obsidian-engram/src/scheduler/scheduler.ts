import { CardState, Rating } from "../cards/types";

export interface ScheduleConfig {
  /** Base ease factor from settings (default 2.5). */
  easeFactor: number;
}

export const EASE_FLOOR = 1.3;
const HARD_MULTIPLIER = 1.2;
const EASY_BONUS = 1.3;
const HARD_EASE_DELTA = -0.15;
const EASY_EASE_DELTA = 0.15;
const LAPSE_EASE_DELTA = -0.2;
const FIRST_INTERVAL = 1; // days
const SECOND_INTERVAL = 4; // days

/**
 * Effective ease = settings base + the card's accumulated adjustment, floored.
 * The card stores only its delta, so changing the ease setting alters future
 * reviews of every card without rewriting any stored state (R6: adjustable).
 */
export function effectiveEase(state: CardState, config: ScheduleConfig): number {
  const delta = typeof (state as { easeDelta?: number }).easeDelta === "number" ? (state as { easeDelta?: number }).easeDelta! : 0;
  return Math.max(EASE_FLOOR, config.easeFactor + delta);
}

function clampDelta(base: number, delta: number): number {
  // Keep the resulting ease at or above the floor.
  return Math.max(EASE_FLOOR - base, delta);
}

/**
 * The R6 ladder: first success ~1 day, second ~4 days, then interval × ease.
 * Hard dampens, Easy boosts, Again lapses to the ladder start with an ease
 * penalty (KTD6). Returns the fully-updated state with the review appended.
 */
export function rate(state: CardState, rating: Rating, config: ScheduleConfig, now: Date): CardState {
  const prevInterval = state.interval ?? 0;
  const prevDelta = (state as { easeDelta?: number }).easeDelta ?? 0;
  const ease = effectiveEase(state, config);

  let interval: number;
  let delta = prevDelta;

  switch (rating) {
    case "again":
      interval = 0;
      delta = clampDelta(config.easeFactor, prevDelta + LAPSE_EASE_DELTA);
      break;
    case "hard":
      interval = prevInterval <= 0 ? FIRST_INTERVAL : Math.max(prevInterval + 1, prevInterval * HARD_MULTIPLIER);
      delta = clampDelta(config.easeFactor, prevDelta + HARD_EASE_DELTA);
      break;
    case "good":
      if (prevInterval <= 0) interval = FIRST_INTERVAL;
      else if (prevInterval < SECOND_INTERVAL) interval = SECOND_INTERVAL;
      else interval = prevInterval * ease;
      break;
    case "easy":
      interval = prevInterval <= 0 ? SECOND_INTERVAL : Math.max(SECOND_INTERVAL, prevInterval * ease * EASY_BONUS);
      delta = prevDelta + EASY_EASE_DELTA;
      break;
  }

  const due = new Date(now.getTime() + interval * 24 * 3600 * 1000);
  const reviews = [...(state.reviews ?? []), { at: now.toISOString(), rating }];

  const next: CardState & { easeDelta?: number } = {
    due: due.toISOString(),
    interval,
    ease: Math.max(EASE_FLOOR, config.easeFactor + delta),
    reviews,
  };
  if (delta !== 0) next.easeDelta = delta;
  return next;
}
