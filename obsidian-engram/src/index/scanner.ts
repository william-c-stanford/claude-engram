import { Notice, TFile, TFolder } from "obsidian";
import type EngramPlugin from "../main";
import { parseSidecar } from "../cards/parser";
import { FlashcardIndex, NoteEntry, OrphanSidecar, isSidecarPath, sidecarPathFor } from "./flashcard-index";

const INDEX_CACHE_PATH = ".vault-meta/flashcard-index.json";

/**
 * Obsidian-coupled scanner: walks the configured zettel root, feeds the pure
 * FlashcardIndex, persists the rebuildable cache, and debounces rebuilds on
 * file events. All logic lives in FlashcardIndex; this class only does I/O.
 */
export class VaultScanner {
  private plugin: EngramPlugin;
  private rebuildTimer: number | null = null;
  index: FlashcardIndex = new FlashcardIndex([], new Set());
  onRebuilt: (() => void)[] = [];

  constructor(plugin: EngramPlugin) {
    this.plugin = plugin;
  }

  register(): void {
    const events = ["create", "delete", "rename", "modify"] as const;
    for (const evt of events) {
      this.plugin.registerEvent(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.plugin.app.vault as any).on(evt, (file: TFile) => {
          if (file?.path?.startsWith(this.root())) this.scheduleRebuild();
        })
      );
    }
  }

  root(): string {
    return this.plugin.settings.zettelRoot;
  }

  scheduleRebuild(delayMs = 800): void {
    if (this.rebuildTimer !== null) window.clearTimeout(this.rebuildTimer);
    this.rebuildTimer = window.setTimeout(() => {
      this.rebuildTimer = null;
      void this.rebuild();
    }, delayMs);
  }

  async rebuild(): Promise<FlashcardIndex> {
    const { vault, metadataCache } = this.plugin.app;
    const rootFolder = vault.getAbstractFileByPath(this.root());
    const entries: NoteEntry[] = [];
    const orphans: OrphanSidecar[] = [];
    const folderPaths = new Set<string>();
    const sidecars = new Map<string, { path: string; raw: string }>();

    if (rootFolder instanceof TFolder) {
      const files: TFile[] = [];
      const walk = (folder: TFolder) => {
        folderPaths.add(folder.path);
        for (const child of folder.children) {
          if (child instanceof TFolder) walk(child);
          else if (child instanceof TFile && child.extension === "md") files.push(child);
        }
      };
      walk(rootFolder);

      for (const file of files.filter((f) => isSidecarPath(f.path))) {
        sidecars.set(file.path, { path: file.path, raw: await vault.cachedRead(file) });
      }

      for (const file of files.filter((f) => !isSidecarPath(f.path))) {
        const fm = metadataCache.getFileCache(file)?.frontmatter;
        if (!fm || fm["type"] !== "zettel" || typeof fm["address"] !== "string") continue;
        const sidecarRaw = sidecars.get(sidecarPathFor(file.path));
        const sidecar = sidecarRaw ? parseSidecar(sidecarRaw.raw) ?? undefined : undefined;
        if (sidecarRaw) sidecars.delete(sidecarRaw.path);
        entries.push({
          address: fm["address"],
          notePath: file.path,
          title: typeof fm["title"] === "string" ? fm["title"] : file.basename,
          childrenAddresses: Array.isArray(fm["children"]) ? fm["children"].filter((c: unknown) => typeof c === "string") : [],
          sidecar,
          sidecarPath: sidecarRaw?.path,
        });
      }

      // Anything left in `sidecars` had no adjacent note file; check address binding too.
      const known = new Set(entries.map((e) => e.address));
      for (const { path, raw } of sidecars.values()) {
        const parsed = parseSidecar(raw);
        if (parsed && !known.has(parsed.noteAddress)) {
          orphans.push({ sidecarPath: path, noteAddress: parsed.noteAddress });
        } else if (parsed) {
          // Sidecar not beside its note but address resolves — rebind it.
          const entry = entries.find((e) => e.address === parsed.noteAddress);
          if (entry && !entry.sidecar) {
            entry.sidecar = parsed;
            entry.sidecarPath = path;
          }
        }
      }
    }

    this.index = new FlashcardIndex(entries, folderPaths, orphans);
    await this.persistCache();
    if (orphans.length > 0) {
      new Notice(`Engram: ${orphans.length} orphaned card sidecar(s) — bound note no longer exists.`);
    }
    for (const cb of this.onRebuilt) cb();
    return this.index;
  }

  private async persistCache(): Promise<void> {
    try {
      const adapter = this.plugin.app.vault.adapter;
      if (!(await adapter.exists(".vault-meta"))) await adapter.mkdir(".vault-meta");
      await adapter.write(INDEX_CACHE_PATH, JSON.stringify(this.index.toJSON(), null, 2));
    } catch (e) {
      console.warn("Engram: failed to persist flashcard index cache", e);
    }
  }
}
