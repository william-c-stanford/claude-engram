import { App, Component } from "obsidian";
import { parseMcqContent } from "../../cards/content";
import { McqOption } from "../../cards/mcq-types";
import { Card } from "../../cards/types";
import { renderMarkdown } from "./markdown";

export interface McqView {
  /** Resolves true/false when the user picks an option; null if the body is malformed. */
  answered: Promise<boolean>;
}

export async function renderMcq(
  app: App,
  card: Card,
  el: HTMLElement,
  sourcePath: string,
  component: Component,
  random: () => number = Math.random
): Promise<McqView | null> {
  const mcq = parseMcqContent(card.content);
  if (!mcq) return null;

  const promptEl = el.createDiv();
  await renderMarkdown(app, mcq.prompt, promptEl, sourcePath, component);

  const options = [...mcq.options].sort(() => random() - 0.5);
  const optionsEl = el.createDiv();

  let resolve!: (correct: boolean) => void;
  const answered = new Promise<boolean>((r) => (resolve = r));
  let done = false;

  for (const option of options) {
    const btn = optionsEl.createEl("button", { cls: "engram-mcq-option" });
    void renderMarkdown(app, option.text, btn, sourcePath, component);
    btn.addEventListener("click", () => {
      if (done) return;
      done = true;
      markOptions(optionsEl, options, option);
      resolve(option.correct);
    });
  }

  return { answered };
}

function markOptions(optionsEl: HTMLElement, options: McqOption[], picked: McqOption): void {
  const buttons = Array.from(optionsEl.querySelectorAll("button"));
  buttons.forEach((btn, i) => {
    const option = options[i];
    if (!option) return;
    if (option.correct) btn.addClass("engram-mcq-correct");
    else if (option === picked) btn.addClass("engram-mcq-wrong");
    (btn as HTMLButtonElement).disabled = true;
  });
}
