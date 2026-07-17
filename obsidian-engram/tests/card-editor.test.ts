import { describe, expect, it } from "vitest";
import { closeDecision, composeFromFields, fieldsFor, patchCardContents } from "../src/ui/card-editor";
import { splitNotes } from "../src/cards/parser";
import { Card, NEW_STATE } from "../src/cards/types";

function card(type: Card["type"], content: string, notes = ""): Card {
  return { id: "c-000001-01", type, content, notes, state: NEW_STATE };
}

describe("editor field mapping (plan 002 KTD5)", () => {
  it("derivation → Prompt/Answer/Notes fields", () => {
    const f = fieldsFor(card("derivation", "**Prompt**\n\nDerive X.\n\n**Answer**\n\n$$x=1$$", "a cue"));
    expect(f.prompt).toBe("Derive X.");
    expect(f.answer).toBe("$$x=1$$");
    expect(f.raw).toBeUndefined();
    expect(f.notes).toBe("a cue");
  });

  it("mcq and cloze → raw field", () => {
    expect(fieldsFor(card("mcq", "Q?\n- [x] a\n- [ ] b")).raw).toBe("Q?\n- [x] a\n- [ ] b");
    expect(fieldsFor(card("cloze", "The {{c::answer}}.")).raw).toBe("The {{c::answer}}.");
  });

  it("malformed Prompt/Answer body falls back to raw", () => {
    const f = fieldsFor(card("free", "no markers here"));
    expect(f.raw).toBe("no markers here");
  });

  it("an unmodified save round-trips: fields → body → same content and notes", () => {
    const original = card("free", "**Prompt**\n\nWhy X?\n\n**Answer**\n\nBecause Y.", "hidden cue");
    const body = composeFromFields(fieldsFor(original));
    const { content, notes } = splitNotes(body);
    expect(notes).toBe(original.notes);
    const round = fieldsFor(card("free", content, notes));
    expect(round.prompt).toBe("Why X?");
    expect(round.answer).toBe("Because Y.");
  });

  it("empty notes omit the Notes section entirely", () => {
    const body = composeFromFields({ raw: "content only", notes: "" });
    expect(body).toBe("content only");
    expect(body).not.toContain("**Notes**");
  });
});

describe("close decision (dirty-editor guard)", () => {
  it("only a dirty editor blocks; a clean editor closes with the modal in one action", () => {
    expect(closeDecision(false, false)).toBe("close");
    expect(closeDecision(true, false)).toBe("close");
    expect(closeDecision(true, true)).toBe("block");
    expect(closeDecision(false, true)).toBe("close"); // stale dirty flag without editor never traps the user
  });
});

describe("patchCardContents (post-save index resync)", () => {
  it("updates content/notes in place and never touches state objects or the array", () => {
    const stagedState = { due: "2026-07-18T00:00:00.000Z", interval: 0, ease: 2.5, reviews: [{ at: "2026-07-17T00:00:00.000Z", rating: "reset" as const }] };
    const sibling = card("free", "**Prompt**\n\nsib\n\n**Answer**\n\nx");
    sibling.id = "c-000001-02";
    sibling.state = stagedState; // staged, unflushed
    const edited = card("free", "**Prompt**\n\nold\n\n**Answer**\n\ny");
    const existing = [edited, sibling];

    const freshEdited = card("free", "**Prompt**\n\nnew\n\n**Answer**\n\ny", "new note");
    const freshSibling = card("free", "**Prompt**\n\nsib\n\n**Answer**\n\nx");
    freshSibling.id = "c-000001-02";
    freshSibling.state = { state: "new" }; // disk knows nothing of the staged reset

    const patched = patchCardContents(existing, [freshEdited, freshSibling]);
    expect(patched).toBe(1);
    expect(existing[0]!.content).toContain("new");
    expect(existing[0]!.notes).toBe("new note");
    expect(existing[1]!.state).toBe(stagedState); // identity preserved — staged state survives
    expect(existing).toHaveLength(2);
  });
});
