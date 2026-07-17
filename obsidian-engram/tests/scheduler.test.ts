import { describe, expect, it } from "vitest";
import { rate, resetLadder, EASE_FLOOR } from "../src/scheduler/scheduler";
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

describe("resetLadder (plan 002 U2)", () => {
  it("resets a mature card to the ladder start, preserving ease and history", () => {
    const mature = run(["good", "good", "good", "hard"]).at(-1)!; // interval 12.5? -> hard path; ease 2.35
    const before = JSON.parse(JSON.stringify(mature));
    const reset = resetLadder(mature, new Date("2026-08-01T00:00:00.000Z"));
    expect(reset.interval).toBe(0);
    expect(Date.parse(reset.due!)).toBeLessThanOrEqual(Date.parse("2026-08-01T00:00:00.001Z"));
    expect(reset.ease).toBe(mature.ease); // preserved, no penalty
    expect(reset.reviews).toHaveLength(mature.reviews!.length + 1);
    expect(reset.reviews!.at(-1)!.rating).toBe("reset");
    expect(mature).toEqual(before); // input untouched
  });

  it("ladder restarts at 1 then 4 then interval × preserved ease", () => {
    const mature = run(["good", "good", "good", "hard"]).at(-1)!; // easeDelta -0.15 -> effective 2.35
    const reset = resetLadder(mature, new Date(mature.due!));
    let s = rate(reset, "good", config, new Date(reset.due!));
    expect(s.interval).toBe(1);
    s = rate(s, "good", config, new Date(s.due!));
    expect(s.interval).toBe(4);
    s = rate(s, "good", config, new Date(s.due!));
    expect(s.interval).toBeCloseTo(4 * 2.35); // preserved ease, not the default
  });

  it("does not count as a failed review (no ease penalty ever)", () => {
    const good = run(["good", "good"]).at(-1)!;
    const reset = resetLadder(good, new Date(good.due!));
    expect(reset.ease).toBe(good.ease);
    expect((reset as { easeDelta?: number }).easeDelta).toBeUndefined();
  });

  it("is a no-op on a never-reviewed card (stays new for the first-encounter rule)", () => {
    expect(resetLadder(NEW_STATE, t0)).toBe(NEW_STATE);
    expect(resetLadder({}, t0)).toEqual({});
  });

  it("reset cards classify red and count as relearning", () => {
    const reset = resetLadder(run(["good", "good"]).at(-1)!, t0);
    expect(bucketOf(reset, t0.getTime(), 24)).toBe("red");
    expect(reset.interval).toBe(0);
    expect((reset.reviews?.length ?? 0) > 0).toBe(true);
  });
});

describe("verdict logging (plan 005 U1)", () => {
  it("rate with a verdict appends it; rating override and verdict coexist (AE1)", () => {
    const s = rate(NEW_STATE, "good", config, t0, "incorrect");
    const entry = s.reviews!.at(-1)!;
    expect(entry.rating).toBe("good");
    expect(entry.verdict).toBe("incorrect"); // schedule advanced, miss remembered
  });

  it("rate without a verdict emits an entry with no verdict key (clean JSON, AE4)", () => {
    const s = rate(NEW_STATE, "hard", config, t0);
    const entry = s.reviews!.at(-1)!;
    expect("verdict" in entry).toBe(false);
    expect(JSON.stringify(entry)).not.toContain("verdict");
  });

  it("resetLadder entries never carry verdicts", () => {
    const mature = run(["good", "good"]).at(-1)!;
    const reset = resetLadder(mature, t0);
    expect("verdict" in reset.reviews!.at(-1)!).toBe(false);
  });

  it("legacy entries without verdicts round-trip byte-identically", () => {
    const legacy = { at: "2026-07-10T00:00:00.000Z", rating: "good" as const };
    expect(JSON.parse(JSON.stringify(legacy))).toEqual(legacy);
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
