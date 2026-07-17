import { App, Component, MarkdownRenderer } from "obsidian";

/** Render markdown (incl. LaTeX and code fences) into el via Obsidian's renderer. */
export async function renderMarkdown(app: App, markdown: string, el: HTMLElement, sourcePath: string, component: Component): Promise<void> {
  el.empty();
  await MarkdownRenderer.render(app, markdown, el, sourcePath, component);
}
