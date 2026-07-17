import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { composeCardBody, parseSidecar, rewriteCardBlock, rewriteStates, splitNotes, srsLine } from "../src/cards/parser";
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

describe("Notes sections (plan 002 U1)", () => {
  it("splits content and annotation at the **Notes** marker", () => {
    const parsed = parseSidecar(fixture)!;
    const annotated = parsed.cards.find((c) => c.id === "c-000022-04")!;
    expect(annotated.notes).toContain("library size vs books");
    expect(annotated.content).not.toContain("**Notes**");
    expect(annotated.content).toContain("Total parameters grow");
  });

  it("cards without Notes have empty notes", () => {
    const parsed = parseSidecar(fixture)!;
    expect(parsed.cards.find((c) => c.id === "c-000022-01")!.notes).toBe("");
  });

  it("**Notes** inside a fenced code block is not a marker", () => {
    const { content, notes } = splitNotes("q\n```text\n**Notes**\nfake\n```\na");
    expect(notes).toBe("");
    expect(content).toContain("**Notes**");
  });

  it("composeCardBody inverts splitNotes", () => {
    const body = composeCardBody("the content", "the annotation");
    expect(splitNotes(body)).toEqual({ content: "the content", notes: "the annotation" });
    expect(composeCardBody("just content", "")).toBe("just content");
  });
});

describe("rewriteCardBlock (plan 002 U1)", () => {
  it("replaces one card's body leaving every other byte identical", () => {
    const out = rewriteCardBlock(fixture, "c-000022-04", "**Prompt**\n\nEdited?\n\n**Answer**\n\nYes.\n\n**Notes**\n\nkept note")!;
    expect(out).not.toBeNull();
    const reparsed = parseSidecar(out)!;
    const edited = reparsed.cards.find((c) => c.id === "c-000022-04")!;
    expect(edited.content).toContain("Edited?");
    expect(edited.notes).toBe("kept note");
    // all other cards and every state line byte-identical
    for (const id of ["c-000022-01", "c-000022-02", "c-000022-03", "c-000022-05"]) {
      const before = parseSidecar(fixture)!.cards.find((c) => c.id === id)!;
      const after = reparsed.cards.find((c) => c.id === id)!;
      expect(after.content).toBe(before.content);
    }
    expect(out).toContain('%% srs c-000022-01 {"due":"2026-07-18T09:00:00Z"');
    expect(out).toContain("c-000022-99");
    expect(out).toContain("srs-retired c-000022-07");
  });

  it("handles the last card before state lines and the true last card", () => {
    const noStates = fixture.split("%% srs")[0]!.trimEnd();
    const out = rewriteCardBlock(noStates, "c-000022-06", "still unknown type body")!;
    expect(out).toContain("still unknown type body");
  });

  it("returns null for an unknown card ID", () => {
    expect(rewriteCardBlock(fixture, "c-000022-42", "nope")).toBeNull();
  });

  it("fenced example boundary lines are body, not boundaries (parse + rewrite)", () => {
    const raw = [
      "---",
      "type: flashcards",
      'note_address: "c-000001"',
      "---",
      "",
      "### card c-000001-01",
      "type: pseudocode",
      "",
      "**Prompt**",
      "Show the sidecar format.",
      "**Answer**",
      "```markdown",
      "### card c-000099-01",
      "%% srs c-000099-01 {} %%",
      "```",
      "",
      "### card c-000001-02",
      "type: free",
      "",
      "**Prompt**",
      "q",
      "**Answer**",
      "a",
      "",
    ].join("\n");
    const parsed = parseSidecar(raw)!;
    expect(parsed.cards.map((c) => c.id)).toEqual(["c-000001-01", "c-000001-02"]);
    expect(parsed.cards[0]!.content).toContain("### card c-000099-01");
    // Rewriting the second card leaves the fenced example intact.
    const out = rewriteCardBlock(raw, "c-000001-02", "**Prompt**\n\nq2\n\n**Answer**\n\na2")!;
    expect(out).toContain("### card c-000099-01");
    expect(parseSidecar(out)!.cards.map((c) => c.id)).toEqual(["c-000001-01", "c-000001-02"]);
    // Rewriting the fenced card itself replaces only its body.
    const out2 = rewriteCardBlock(raw, "c-000001-01", "**Prompt**\n\nnew\n\n**Answer**\n\nbody")!;
    expect(out2).toContain("### card c-000001-02");
    expect(out2).not.toContain("c-000099-01");
  });

  it("an emptied card body inserts no stray lines", () => {
    const out = rewriteCardBlock(fixture, "c-000022-04", "")!;
    expect(out).not.toContain("\n\n\n\n");
    expect(parseSidecar(out)!.cards.find((c) => c.id === "c-000022-04")!.content).toBe("");
  });

  it("a reset event in a state line round-trips", () => {
    const raw = '---\ntype: flashcards\nnote_address: "c-000001"\n---\n\n### card c-000001-01\ntype: free\n\n**Prompt**\nq\n**Answer**\na\n\n%% srs c-000001-01 {"due":"2026-07-17T09:00:00.000Z","interval":0,"ease":2.5,"reviews":[{"at":"2026-07-17T09:00:00.000Z","rating":"reset"}]} %%\n';
    const parsed = parseSidecar(raw)!;
    expect(parsed.cards[0]!.state.reviews![0]!.rating).toBe("reset");
    const out = rewriteStates(raw, new Map([["c-000001-01", parsed.cards[0]!.state]]));
    expect(parseSidecar(out)!.cards[0]!.state).toEqual(parsed.cards[0]!.state);
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
