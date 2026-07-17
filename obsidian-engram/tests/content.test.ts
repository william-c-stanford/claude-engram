import { describe, expect, it } from "vitest";
import { parseMcqContent, renderCloze, splitPromptAnswer } from "../src/cards/content";

describe("renderCloze (AE3 rule)", () => {
  it("masks a span outside math with a styled blank", () => {
    const { prompt, reveal, answers } = renderCloze("The router keeps the top-{{c::K}} experts.");
    expect(prompt).toContain('class="engram-review-blank"');
    expect(prompt).not.toContain("{{c::");
    expect(reveal).toContain("**K**");
    expect(answers).toEqual(["K"]);
  });

  it("masks a span inside inline math with \\boxed{?}", () => {
    const { prompt, reveal } = renderCloze("Active params are a {{c::x}} and $f = {{c::K/N}}$ of capacity.");
    expect(prompt).toContain("$f = \\boxed{\\;?\\;}$");
    expect(prompt).toContain('engram-review-blank'); // the non-math span
    expect(reveal).toContain("$f = \\boxed{K/N}$");
  });

  it("masks inside display math blocks", () => {
    const { prompt, reveal } = renderCloze("$$\\text{MoE}(x) = \\sum_i {{c::g_i(x)\\, E_i(x)}}$$");
    expect(prompt).toBe("$$\\text{MoE}(x) = \\sum_i \\boxed{\\;?\\;}$$");
    expect(reveal).toBe("$$\\text{MoE}(x) = \\sum_i \\boxed{g_i(x)\\, E_i(x)}$$");
  });

  it("handles multiple spans, all masked together", () => {
    const { prompt, answers } = renderCloze("{{c::BPE}} merges the {{c::most frequent}} pair.");
    expect(prompt.match(/engram-review-blank/g)).toHaveLength(2);
    expect(answers).toEqual(["BPE", "most frequent"]);
  });
});

describe("parseMcqContent", () => {
  it("parses prompt and options, checked = correct", () => {
    const mcq = parseMcqContent("Why?\n\n- [ ] wrong one\n- [x] right one\n- [ ] also wrong")!;
    expect(mcq.prompt).toBe("Why?");
    expect(mcq.options).toHaveLength(3);
    expect(mcq.options.filter((o) => o.correct)).toEqual([{ text: "right one", correct: true }]);
  });

  it("rejects bodies with no single correct option", () => {
    expect(parseMcqContent("Q?\n- [ ] a\n- [ ] b")).toBeNull();
    expect(parseMcqContent("Q?\n- [x] a\n- [x] b")).toBeNull();
    expect(parseMcqContent("just prose")).toBeNull();
  });
});

describe("splitPromptAnswer", () => {
  it("splits on the bold markers", () => {
    const pa = splitPromptAnswer("**Prompt**\n\nWhy X?\n\n**Answer**\n\nBecause Y.\n$$e=mc^2$$")!;
    expect(pa.prompt).toBe("Why X?");
    expect(pa.answer).toContain("Because Y.");
    expect(pa.answer).toContain("$$e=mc^2$$");
  });

  it("returns null when markers are missing", () => {
    expect(splitPromptAnswer("no markers here")).toBeNull();
  });
});
