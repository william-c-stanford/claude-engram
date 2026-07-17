import { splitPromptAnswer } from "../cards/content";
import { composeCardBody } from "../cards/parser";
import { Card } from "../cards/types";

/**
 * Editor field mapping (plan 002 KTD5): prompt/answer textareas for the
 * Prompt/Answer card types, one raw-content textarea for cloze/mcq (their
 * bodies are single-segment), Notes for every type. Pure so the mapping and
 * its round-trip are unit-testable.
 */
export interface EditorFields {
  /** Present for free/derivation/pseudocode with a well-formed body. */
  prompt?: string;
  answer?: string;
  /** Present for cloze/mcq, or as fallback when Prompt/Answer markers are malformed. */
  raw?: string;
  notes: string;
}

/**
 * Modal close decision (pure so the guard is testable): only a dirty editor
 * blocks closing. A clean editor closes together with the modal — requiring a
 * second close action there was a lifecycle bug, not protection.
 */
export function closeDecision(editorOpen: boolean, editorDirty: boolean): "close" | "block" {
  return editorOpen && editorDirty ? "block" : "close";
}

/**
 * After an on-disk card edit, update only content/notes on the shared index's
 * existing card objects. Never swap the card array or touch `state` — sibling
 * cards may carry staged-but-unflushed scheduling state that a wholesale
 * replace would silently discard. Returns the number of cards patched.
 */
export function patchCardContents(existing: Card[], fresh: Card[]): number {
  let patched = 0;
  for (const f of fresh) {
    const e = existing.find((c) => c.id === f.id);
    if (e && (e.content !== f.content || e.notes !== f.notes)) {
      e.content = f.content;
      e.notes = f.notes;
      patched++;
    }
  }
  return patched;
}

export function fieldsFor(card: Card): EditorFields {
  if (card.type === "free" || card.type === "derivation" || card.type === "pseudocode") {
    const pa = splitPromptAnswer(card.content);
    if (pa) return { prompt: pa.prompt, answer: pa.answer, notes: card.notes };
  }
  return { raw: card.content, notes: card.notes };
}

/** Compose the full card body (content + Notes section) from editor fields. */
export function composeFromFields(fields: EditorFields): string {
  const content =
    fields.raw !== undefined
      ? fields.raw.trim()
      : `**Prompt**\n\n${(fields.prompt ?? "").trim()}\n\n**Answer**\n\n${(fields.answer ?? "").trim()}`;
  return composeCardBody(content, fields.notes);
}
