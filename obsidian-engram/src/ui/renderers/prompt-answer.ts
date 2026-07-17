import { App, Component } from "obsidian";
import { splitPromptAnswer } from "../../cards/content";
import { Card } from "../../cards/types";
import { renderMarkdown } from "./markdown";

export interface PromptAnswerView {
  showReveal: (el: HTMLElement) => Promise<void>;
}

/** free / derivation / pseudocode: prompt now, answer on reveal, self-grade after. */
export async function renderPromptAnswer(
  app: App,
  card: Card,
  el: HTMLElement,
  sourcePath: string,
  component: Component
): Promise<PromptAnswerView | null> {
  const pa = splitPromptAnswer(card.content);
  if (!pa) return null;
  await renderMarkdown(app, pa.prompt, el, sourcePath, component);
  return {
    showReveal: (revealEl: HTMLElement) => renderMarkdown(app, pa.answer, revealEl, sourcePath, component),
  };
}
