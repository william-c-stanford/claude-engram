import { describe, expect, it } from "vitest";
import { rate, EASE_FLOOR } from "../src/scheduler/scheduler";
import { bucketOf } from "../src/scheduler/buckets";
import { CardState, NEW_STATE, Rating } from "../src/cards/types";
import { parseSidecar, rewriteStates } from "../src/cards/parser";

const config = { easeFactor: 2.5 };
const t0 = new Date("2026-07-17T09:00:00.000Z");

function run(ratings: Rating[], cfg = config): CardState[] {
  const states: CardState[] = [];
  let state: CardState = NEW_STATE;
  let now = t0;
  for (const r of ratings) {
    state = rate(state, r, cfg, now);
    states.push(state);
    now = new Date(state.due!); // review exactly when due
  }
  return states;
}

describe("ease-factor ladder (R6)", () => {
  it("Good repeatedly at default ease follows 1 → 4 → 10 → 25 → 62.5 → 156.25", () => {
    const intervals = run(["good", "good", "good", "good", "good", "good"]).map((s) => s.interval);
    expect(intervals).toEqual([1, 4, 10, 25, 62.5, 156.25]);
  });

  it("appends exactly one review-log entry per review", () => {
    const states = run(["good", "again", "good"]);
    expect(states[2]!.reviews).toHaveLength(3);
    expect(states[2]!.reviews!.map((r) => r.rating)).toEqual(["good", "again", "good"]);
  });

  it("Again mid-ladder lapses to the start and penalizes ease", () => {
    const states = run(["good", "good", "good", "again", "good"]);
    expect(states[3]!.interval).toBe(0); // lapsed, due immediately
    expect(states[4]!.interval).toBe(1); // ladder restarts at 1 day
    expect(states[4]!.ease).toBeCloseTo(2.3); // 2.5 - 0.2 lapse penalty
  });

  it("ease never drops below the 1.3 floor", () => {
    const many: Rating[] = Array(20).fill("again");
    const final = run(many).at(-1)!;
    expect(final.ease).toBeCloseTo(EASE_FLOOR);
  });

  it("Hard grows slowly and dampens ease; Easy boosts interval and ease", () => {
    const afterHard = run(["good", "good", "hard"]).at(-1)!;
    expect(afterHard.interval).toBeCloseTo(5); // max(4+1, 4*1.2)
    expect(afterHard.ease).toBeCloseTo(2.35);

    const afterEasy = run(["good", "good", "easy"]).at(-1)!;
    expect(afterEasy.interval).toBeCloseTo(4 * 2.5 * 1.3);
    expect(afterEasy.ease).toBeCloseTo(2.65);
  });

  it("changing the ease setting alters subsequent reviews only, never past state", () => {
    const base = run(["good", "good"]); // interval 4
    const before = JSON.parse(JSON.stringify(base[1]));
    const next = rate(base[1]!, "good", { easeFactor: 3.0 }, new Date(base[1]!.due!));
    expect(next.interval).toBeCloseTo(12); // 4 × 3.0 — new setting applies
    expect(base[1]).toEqual(before); // input state untouched
    expect(next.reviews).toHaveLength(3);
  });

  it("a card's ease delta persists relative to the settings base", () => {
    const lapsed = run(["good", "again"]).at(-1)!; // delta -0.2
    const next = rate(lapsed, "good", { easeFactor: 3.0 }, new Date(lapsed.due!));
    expect(next.ease).toBeCloseTo(2.8); // 3.0 base + (-0.2) delta
  });

  it("state round-trips through the sidecar serialize/parse cycle", () => {
    const state = run(["good", "hard", "good"]).at(-1)!;
    const raw = [
      "---",
      'type: flashcards',
      'note_address: "c-000001"',
      "---",
      "",
      "### card c-000001-01",
      "type: free",
      "",
      "**Prompt**",
      "q",
      "**Answer**",
      "a",
      "",
    ].join("\n");
    const out = rewriteStates(raw, new Map([["c-000001-01", state]]));
    const reparsed = parseSidecar(out)!;
    expect(reparsed.cards[0]!.state).toEqual(state);
  });
});

describe("buckets (R7)", () => {
  const now = t0.getTime();
  const hours = (n: number) => new Date(now + n * 3600 * 1000).toISOString();

  it("classifies red / yellow / green at the boundaries", () => {
    expect(bucketOf({ due: hours(0) }, now, 24)).toBe("red"); // due exactly now
    expect(bucketOf({ due: hours(-72) }, now, 24)).toBe("red"); // overdue by days
    expect(bucketOf({ due: hours(23.98) }, now, 24)).toBe("yellow"); // inside warn window
    expect(bucketOf({ due: hours(24.02) }, now, 24)).toBe("green"); // beyond it
  });

  it("new cards are red (due for first review)", () => {
    expect(bucketOf(NEW_STATE, now, 24)).toBe("red");
    expect(bucketOf({}, now, 24)).toBe("red");
  });

  it("respects a custom warn window", () => {
    expect(bucketOf({ due: hours(40) }, now, 48)).toBe("yellow");
    expect(bucketOf({ due: hours(40) }, now, 24)).toBe("green");
  });
});
