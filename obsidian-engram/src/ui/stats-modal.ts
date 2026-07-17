import { Modal } from "obsidian";
import type EngramPlugin from "../main";
import { accuracyOf, formatAccuracy } from "../scheduler/accuracy";

/**
 * Read-only accuracy view (plan 005 R3): one row per note, walked
 * topologically per top-level subtree, with subtree rollups on parents.
 */
export class StatsModal extends Modal {
  private plugin: EngramPlugin;

  constructor(plugin: EngramPlugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onOpen(): void {
    this.modalEl.addClass("engram-stats-modal");
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Flashcard accuracy" });
    contentEl.createDiv({ cls: "engram-review-breadcrumb" }).setText(
      "Mechanically checked answers only (typed cloze, multiple choice) — every attempt counts."
    );

    const index = this.plugin.scanner.index;
    const roots = index.notesDirectlyIn(this.plugin.settings.zettelRoot);
    if (roots.length === 0) {
      contentEl.createDiv({ cls: "engram-review-card" }).setText("No zettel notes found under the configured root.");
      return;
    }

    const table = contentEl.createDiv({ cls: "engram-stats-table" });
    const header = table.createDiv({ cls: "engram-stats-row engram-stats-header" });
    header.createSpan({ cls: "engram-stats-name", text: "Note" });
    header.createSpan({ cls: "engram-stats-val", text: "Own" });
    header.createSpan({ cls: "engram-stats-val", text: "Subtree" });

    for (const root of roots) {
      for (const row of accuracyOf(index, root.address)) {
        const rowEl = table.createDiv({ cls: "engram-stats-row" });
        const name = rowEl.createSpan({ cls: "engram-stats-name" });
        name.setText(row.entry.title);
        name.style.paddingLeft = `${row.depth * 16}px`;
        rowEl.createSpan({ cls: "engram-stats-val", text: formatAccuracy(row) });
        rowEl.createSpan({
          cls: "engram-stats-val",
          text: row.subtree.checked === row.checked && row.subtree.correct === row.correct ? "" : formatAccuracy(row.subtree),
        });
      }
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
