import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSidecar, rewriteStates, srsLine } from "../src/cards/parser";
import { CardState } from "../src/cards/types";

const fixture = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "fixtures", "moe-architecture.cards.md"),
  "utf8"
);

describe("parseSidecar", () => {
  it("parses all five card types with correct IDs and state attached by ID", () => {
    const parsed = parseSidecar(fixture);
    expect(parsed).not.toBeNull();
    expect(parsed!.noteAddress).toBe("c-000022");
    expect(parsed!.cards.map((c) => c.id)).toEqual([
      "c-000022-01",
      "c-000022-02",
      "c-000022-03",
      "c-000022-04",
      "c-000022-05",
    ]);
    expect(parsed!.cards.map((c) => c.type)).toEqual(["cloze", "mcq", "derivation", "free", "pseudocode"]);
    const first = parsed!.cards[0]!;
    expect(first.state.interval).toBe(4);
    expect(first.state.reviews).toHaveLength(1);
  });

  it("treats cards without state blocks as new", () => {
    const parsed = parseSidecar(fixture)!;
    const c2 = parsed.cards.find((c) => c.id === "c-000022-02")!;
    expect(c2.state.state).toBe("new");
    const c3 = parsed.cards.find((c) => c.id === "c-000022-03")!;
    expect(c3.state.state).toBe("new");
  });

  it("skips unknown card types with a warning, remaining cards parse", () => {
    const parsed = parseSidecar(fixture)!;
    expect(parsed.cards.find((c) => c.id === "c-000022-06")).toBeUndefined();
    expect(parsed.warnings.some((w) => w.includes("c-000022-06"))).toBe(true);
  });

  it("flags state lines with no matching card as orphaned, never crashes", () => {
    const parsed = parseSidecar(fixture)!;
    expect(parsed.orphanedStateIds).toEqual(["c-000022-99"]);
  });

  it("preserves retired lines", () => {
    const parsed = parseSidecar(fixture)!;
    expect(parsed.retiredLines).toHaveLength(1);
    expect(parsed.retiredLines[0]).toContain("srs-retired c-000022-07");
  });

  it("returns null for non-sidecar files", () => {
    expect(parseSidecar("# just a note\n")).toBeNull();
    expect(parseSidecar("---\ntype: zettel\n---\nbody\n")).toBeNull();
  });

  it("handles empty sidecar body and malformed frontmatter without crashing", () => {
    expect(parseSidecar("---\ntype: flashcards\nnote_address: \"c-000001\"\n---\n")!.cards).toEqual([]);
    expect(parseSidecar("---\ntype: flashcards\nnever closed")).toBeNull();
  });

  it("warns on invalid note_address", () => {
    const parsed = parseSidecar('---\ntype: flashcards\nnote_address: "bogus"\n---\n')!;
    expect(parsed.warnings.some((w) => w.includes("note_address"))).toBe(true);
  });
});

describe("rewriteStates", () => {
  it("updates existing lines, appends new ones, keeps orphaned and retired lines verbatim", () => {
    const updated = new Map<string, CardState>([
      ["c-000022-01", { due: "2026-08-01T00:00:00.000Z", interval: 10, ease: 2.5, reviews: [] }],
      ["c-000022-02", { due: "2026-07-18T00:00:00.000Z", interval: 1, ease: 2.5, reviews: [] }],
    ]);
    const out = rewriteStates(fixture, updated);
    expect(out).toContain(srsLine("c-000022-01", updated.get("c-000022-01")!));
    expect(out).toContain(srsLine("c-000022-02", updated.get("c-000022-02")!));
    // untouched state, orphan, and retired lines survive byte-for-byte
    expect(out).toContain('%% srs c-000022-03 {"state":"new"} %%');
    expect(out).toContain("c-000022-99");
    expect(out).toContain("srs-retired c-000022-07");
    // card content untouched
    expect(out).toContain("{{c::$K/N$}}");
    // round-trips through the parser
    const reparsed = parseSidecar(out)!;
    expect(reparsed.cards.find((c) => c.id === "c-000022-01")!.state.interval).toBe(10);
  });
});
