import { App, Component } from "obsidian";
import { renderCloze } from "../../cards/content";
import { Card } from "../../cards/types";
import { renderMarkdown } from "./markdown";

export interface ClozeView {
  answers: string[];
  showReveal: (el: HTMLElement) => Promise<void>;
}

export async function renderClozePrompt(
  app: App,
  card: Card,
  el: HTMLElement,
  sourcePath: string,
  component: Component
): Promise<ClozeView> {
  const { prompt, reveal, answers } = renderCloze(card.content);
  await renderMarkdown(app, prompt, el, sourcePath, component);
  return {
    answers,
    showReveal: (revealEl: HTMLElement) => renderMarkdown(app, reveal, revealEl, sourcePath, component),
  };
}

/** Normalized comparison for typed cloze answers. */
export function clozeAnswerMatches(typed: string, answers: string[]): boolean {
  const norm = (s: string) => s.replace(/\s+/g, " ").replace(/[$]/g, "").trim().toLowerCase();
  const t = norm(typed);
  if (t.length === 0) return false;
  return answers.length === 1 ? norm(answers[0]!) === t : norm(answers.join(" ")) === t;
}
