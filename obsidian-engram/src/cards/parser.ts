import { Card, CardState, CardType, CARD_TYPES, NEW_STATE, ParsedSidecar } from "./types";

const CARD_HEADING = /^### card ([a-z]-\d{6}-\d{2})\s*$/;
const SRS_LINE = /^%% srs ([a-z]-\d{6}-\d{2}) (\{.*\}) %%\s*$/;
const RETIRED_LINE = /^%% srs-retired /;

interface Frontmatter {
  fields: Record<string, string>;
  bodyStart: number;
}

function parseFrontmatter(lines: string[]): Frontmatter | null {
  if (lines[0]?.trim() !== "---") return null;
  const fields: Record<string, string> = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.trim() === "---") return { fields, bodyStart: i + 1 };
    const m = line.match(/^([A-Za-z_][\w]*):\s*(.*)$/);
    if (m && m[1] !== undefined && m[2] !== undefined) {
      fields[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

/**
 * Parse a sidecar file per docs/flashcard-format.md. Never throws on malformed
 * content: bad cards/lines are skipped with a warning and the rest parses.
 * Returns null only when the file is not a flashcards sidecar at all
 * (missing/invalid frontmatter or type != flashcards).
 */
export function parseSidecar(raw: string): ParsedSidecar | null {
  const lines = raw.split("\n");
  const fm = parseFrontmatter(lines);
  if (!fm || fm.fields["type"] !== "flashcards") return null;

  const noteAddress = fm.fields["note_address"] ?? "";
  const warnings: string[] = [];
  if (!/^[a-z]-\d{6}$/.test(noteAddress)) {
    warnings.push(`invalid or missing note_address: "${noteAddress}"`);
  }

  const cards: Card[] = [];
  const states = new Map<string, CardState>();
  const retiredLines: string[] = [];

  let current: { id: string; typeLine: string | null; body: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const typeMatch = current.typeLine?.match(/^type:\s*(\S+)\s*$/);
    const type = typeMatch?.[1];
    if (type && (CARD_TYPES as readonly string[]).includes(type)) {
      const { content, notes } = splitNotes(current.body.join("\n").trim());
      cards.push({
        id: current.id,
        type: type as CardType,
        content,
        notes,
        state: NEW_STATE,
      });
    } else {
      warnings.push(`card ${current.id}: unknown or missing type "${type ?? ""}" — skipped`);
    }
    current = null;
  };

  let inFence = false;
  for (let i = fm.bodyStart; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (/^(```|~~~)/.test(line.trim())) {
      inFence = !inFence;
      if (current && current.typeLine !== null) current.body.push(line);
      continue;
    }
    if (inFence) {
      // Fenced content is always card body — never a boundary.
      if (current && current.typeLine !== null) current.body.push(line);
      continue;
    }
    const heading = line.match(CARD_HEADING);
    if (heading && heading[1]) {
      flush();
      current = { id: heading[1], typeLine: null, body: [] };
      continue;
    }
    const srs = line.match(SRS_LINE);
    if (srs && srs[1] && srs[2]) {
      flush();
      try {
        states.set(srs[1], JSON.parse(srs[2]) as CardState);
      } catch {
        warnings.push(`unparseable srs state for ${srs[1]} — treated as new`);
      }
      continue;
    }
    if (RETIRED_LINE.test(line)) {
      flush();
      retiredLines.push(line);
      continue;
    }
    if (current) {
      if (current.typeLine === null && line.trim() !== "") {
        current.typeLine = line.trim();
      } else if (current.typeLine !== null) {
        current.body.push(line);
      }
    }
  }
  flush();

  const cardIds = new Set(cards.map((c) => c.id));
  const orphanedStateIds: string[] = [];
  for (const [id, state] of states) {
    if (cardIds.has(id)) {
      const card = cards.find((c) => c.id === id);
      if (card) card.state = state;
    } else {
      orphanedStateIds.push(id);
    }
  }

  return {
    noteAddress,
    noteTitle: fm.fields["note_title"] ?? "",
    cards,
    orphanedStateIds,
    retiredLines,
    warnings,
  };
}

/**
 * Split a card body at its first top-level `**Notes**` marker line (fenced
 * code blocks don't count). Content before, annotation after.
 */
export function splitNotes(body: string): { content: string; notes: string } {
  const lines = body.split("\n");
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? "").trim();
    if (/^(```|~~~)/.test(trimmed)) inFence = !inFence;
    if (!inFence && trimmed === "**Notes**") {
      return {
        content: lines.slice(0, i).join("\n").trim(),
        notes: lines.slice(i + 1).join("\n").trim(),
      };
    }
  }
  return { content: body, notes: "" };
}

/** Compose a card body from content + optional annotation (inverse of splitNotes). */
export function composeCardBody(content: string, notes: string): string {
  const trimmedNotes = notes.trim();
  return trimmedNotes.length > 0 ? `${content.trim()}\n\n**Notes**\n\n${trimmedNotes}` : content.trim();
}

/**
 * Replace one card's body (everything after its `type:` line, up to the next
 * card/state/retired line) with `newBody`, leaving the heading, type line,
 * every other card, and all state lines byte-identical. Returns null when the
 * card ID is not found.
 */
export function rewriteCardBlock(raw: string, cardId: string, newBody: string): string | null {
  const lines = raw.split("\n");
  const isFence = (line: string) => /^(```|~~~)/.test(line.trim());

  // Boundary lines only count outside fenced code blocks — a card body may
  // legitimately contain an example `### card ...` or `%% srs ... %%` line.
  let inFence = false;
  let start = -1; // index of the card's heading line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (isFence(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(CARD_HEADING);
    if (m && m[1] === cardId) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  // The type line is the first non-blank line after the heading.
  let typeIdx = start + 1;
  while (typeIdx < lines.length && (lines[typeIdx] ?? "").trim() === "") typeIdx++;
  if (typeIdx >= lines.length || !/^type:\s*\S+/.test((lines[typeIdx] ?? "").trim())) return null;

  // Body ends at the next non-fenced card heading, srs/retired line, or EOF.
  inFence = false;
  let end = typeIdx + 1;
  while (end < lines.length) {
    const line = lines[end] ?? "";
    if (isFence(line)) {
      inFence = !inFence;
      end++;
      continue;
    }
    if (!inFence && (CARD_HEADING.test(line) || SRS_LINE.test(line) || RETIRED_LINE.test(line))) break;
    end++;
  }

  const trimmed = newBody.trim();
  const bodyLines = trimmed === "" ? [] : trimmed.split("\n");
  return [...lines.slice(0, typeIdx + 1), "", ...bodyLines, "", ...lines.slice(end)].join("\n");
}

/** Serialize one card state to its srs line. */
export function srsLine(cardId: string, state: CardState): string {
  return `%% srs ${cardId} ${JSON.stringify(state)} %%`;
}

/**
 * Rewrite a sidecar's srs section with updated states, preserving card content,
 * orphaned state lines, and retired lines byte-for-byte. Used by the batch
 * write at session end.
 */
export function rewriteStates(raw: string, updated: Map<string, CardState>): string {
  const lines = raw.split("\n");
  const kept: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const m = line.match(SRS_LINE);
    if (m && m[1]) {
      const id = m[1];
      seen.add(id);
      const next = updated.get(id);
      kept.push(next ? srsLine(id, next) : line);
    } else {
      kept.push(line);
    }
  }
  // Append lines for cards that never had state (first review of a new card).
  const additions: string[] = [];
  for (const [id, state] of updated) {
    if (!seen.has(id)) additions.push(srsLine(id, state));
  }
  if (additions.length > 0) {
    while (kept.length > 0 && kept[kept.length - 1]?.trim() === "") kept.pop();
    kept.push(...additions, "");
  }
  return kept.join("\n");
}
