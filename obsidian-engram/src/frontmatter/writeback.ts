import { Notice, TFile } from "obsidian";
import type EngramPlugin from "../main";
import { computeCardsDue, reconcileCardsDue } from "./compute";

/**
 * cards_due writeback (R13/KTD5) through the Obsidian frontmatter port.
 * Failures are surfaced in a Notice — derived data, so no retry queue.
 */
export async function applyCardsDue(plugin: EngramPlugin): Promise<number> {
  const { app, scanner, settings } = plugin;
  const values = computeCardsDue(scanner.index, Date.now(), settings.warnWindowHours);
  const result = await reconcileCardsDue(values, {
    getFrontmatter: (notePath) => {
      const file = app.vault.getAbstractFileByPath(notePath);
      if (!(file instanceof TFile)) return null;
      return app.metadataCache.getFileCache(file)?.frontmatter ?? null;
    },
    writeCardsDue: async (notePath, value) => {
      const file = app.vault.getAbstractFileByPath(notePath);
      if (!(file instanceof TFile)) throw new Error(`missing file: ${notePath}`);
      await app.fileManager.processFrontMatter(file, (front) => {
        front["cards_due"] = value;
      });
    },
  });
  if (result.failed.length > 0) {
    console.warn("Engram: cards_due writeback failed for", result.failed);
    new Notice(`Engram: cards_due update failed for ${result.failed.length} note(s) — see console.`);
  }
  return result.written.length;
}
