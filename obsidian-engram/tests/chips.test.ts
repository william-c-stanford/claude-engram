import { describe, expect, it } from "vitest";
import { chipsFor } from "../src/ui/chips";
import { Counts } from "../src/scheduler/buckets";

const c = (red: number, yellow: number, green: number): Counts => ({ red, yellow, green });

describe("chipsFor (R1, R4, R6, R8)", () => {
  it("shows bucket chips as before, zero omitted except green (unchanged path)", () => {
    expect(chipsFor(c(2, 0, 1), 0)).toEqual([
      { kind: "red", count: 2 },
      { kind: "green", count: 1 },
    ]);
  });

  it("shows exactly one uncovered chip when a scope has no cards (R4)", () => {
    // Previously returned [] — the newly-ingested-note case that must now surface.
    expect(chipsFor(c(0, 0, 0), 3)).toEqual([{ kind: "uncovered", count: 3 }]);
  });

  it("appends the uncovered chip last, after the bucket chips", () => {
    expect(chipsFor(c(1, 0, 2), 4)).toEqual([
      { kind: "red", count: 1 },
      { kind: "green", count: 2 },
      { kind: "uncovered", count: 4 },
    ]);
  });

  it("shows nothing when there are no cards and nothing uncovered", () => {
    expect(chipsFor(c(0, 0, 0), 0)).toEqual([]);
  });

  it("omits the uncovered chip for a fully-covered scope (R8)", () => {
    expect(chipsFor(c(0, 0, 5), 0)).toEqual([{ kind: "green", count: 5 }]);
  });

  it("includes all three buckets plus uncovered when all are present", () => {
    expect(chipsFor(c(1, 2, 3), 1)).toEqual([
      { kind: "red", count: 1 },
      { kind: "yellow", count: 2 },
      { kind: "green", count: 3 },
      { kind: "uncovered", count: 1 },
    ]);
  });
});
