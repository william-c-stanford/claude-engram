import { McqOption } from "./mcq-types";

export interface ClozeRender {
  prompt: string;
  reveal: string;
  /** The masked span contents, for typed-answer checking. */
  answers: string[];
}

const CLOZE_RE = /\{\{c::([\s\S]*?)\}\}/g;

/**
 * Whether the character at `pos` is inside $...$ or $$...$$ math delimiters.
 * Walks the string once, toggling math state on unescaped $ / $$.
 */
function insideMath(text: string, pos: number): boolean {
  let inMath = false;
  let i = 0;
  while (i < pos) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "$") {
      // $$ toggles the same as $ for our purposes (both enter/exit math)
      if (text[i + 1] === "$") i++;
      inMath = !inMath;
    }
    i++;
  }
  return inMath;
}

/**
 * The cloze-inside-LaTeX rule from docs/flashcard-format.md: masked spans
 * become \boxed{\;?\;} inside math and a styled blank outside; reveal keeps
 * the original content with the span emphasized.
 */
export function renderCloze(content: string): ClozeRender {
  const answers: string[] = [];
  const prompt = content.replace(CLOZE_RE, (match, inner: string, offset: number) => {
    answers.push(inner.trim());
    return insideMath(content, offset) ? "\\boxed{\\;?\\;}" : '<span class="engram-review-blank">&nbsp;</span>';
  });
  const reveal = content.replace(CLOZE_RE, (_match, inner: string, offset: number) =>
    insideMath(content, offset) ? `\\boxed{${inner}}` : `**${inner}**`
  );
  return { prompt, reveal, answers };
}

export interface McqContent {
  prompt: string;
  options: McqOption[];
}

const MCQ_OPTION_RE = /^- \[([ xX])\] (.*)$/;

/** Parse an mcq card body: prose prompt, then a task list where checked = correct. */
export function parseMcqContent(content: string): McqContent | null {
  const promptLines: string[] = [];
  const options: McqOption[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(MCQ_OPTION_RE);
    if (m && m[2] !== undefined) {
      options.push({ text: m[2], correct: m[1] !== " " });
    } else if (options.length === 0) {
      promptLines.push(line);
    }
  }
  if (options.length < 2 || options.filter((o) => o.correct).length !== 1) return null;
  return { prompt: promptLines.join("\n").trim(), options };
}

/**
 * Strip a leading YAML frontmatter block from a note's raw text so the body
 * can render inside the review modal. Tolerates `---` inside string values by
 * only matching the closing delimiter on its own line.
 */
export function stripFrontmatter(raw: string): string {
  const lines = raw.split("\n");
  if (lines[0]?.trim() !== "---") return raw;
  for (let i = 1; i < lines.length; i++) {
    if ((lines[i] ?? "").trim() === "---") {
      return lines.slice(i + 1).join("\n").trim();
    }
  }
  return raw; // unterminated frontmatter — render as-is
}

export interface PromptAnswer {
  prompt: string;
  answer: string;
}

/** Split a free/derivation/pseudocode body on the **Prompt** / **Answer** markers. */
export function splitPromptAnswer(content: string): PromptAnswer | null {
  const m = content.match(/\*\*Prompt\*\*\s*\n([\s\S]*?)\n\s*\*\*Answer\*\*\s*\n([\s\S]*)/);
  if (!m || m[1] === undefined || m[2] === undefined) return null;
  return { prompt: m[1].trim(), answer: m[2].trim() };
}
