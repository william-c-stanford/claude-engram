import { Notice, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, EngramSettings, EngramSettingTab } from "./settings";
import { VaultScanner } from "./index/scanner";
import { ExplorerBadges } from "./ui/explorer-badges";
import { ReviewModal } from "./ui/review-modal";
import { StatsModal } from "./ui/stats-modal";
import { buildSessionQueue } from "./ui/session-queue";
import { rewriteStates } from "./cards/parser";
import { CardState } from "./cards/types";
import { applyCardsDue } from "./frontmatter/writeback";

export default class EngramPlugin extends Plugin {
  settings: EngramSettings = DEFAULT_SETTINGS;
  scanner: VaultScanner = new VaultScanner(this);
  badges: ExplorerBadges = new ExplorerBadges(this);

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new EngramSettingTab(this.app, this));

    this.scanner.register();
    this.badges.install();

    this.app.workspace.onLayoutReady(() => {
      void this.scanner.rebuild().then(() => {
        this.refreshBadges();
        void applyCardsDue(this); // F3: reconcile cards_due on vault open
      });
    });

    this.addCommand({
      id: "refresh-flashcard-counts",
      name: "Refresh flashcard counts",
      callback: async () => {
        await this.persistReviewUpdates(new Map()); // flush any failed session writes first
        await this.scanner.rebuild();
        this.refreshBadges();
        const written = await applyCardsDue(this);
        new Notice(`Engram: counts refreshed (${written} note(s) updated).`);
      },
    });

    this.addCommand({
      id: "flashcard-stats",
      name: "Flashcard stats (accuracy by subtree)",
      callback: () => new StatsModal(this).open(),
    });

    this.addCommand({
      id: "review-all-due",
      name: "Review all due cards (whole zettel tree)",
      callback: () => {
        const index = this.scanner.index;
        const roots = index
          .notesDirectlyIn(this.settings.zettelRoot)
          .flatMap((n) =>
            buildSessionQueue(index, n.address, "red", {
              nowMs: Date.now(),
              warnWindowHours: this.settings.warnWindowHours,
              skipGreenParents: this.settings.skipGreenParents,
              reorientationSampleSize: this.settings.reorientationSampleSize,
              noteIntroMode: this.settings.noteIntroMode,
            })
          );
        new ReviewModal(this, roots, "All due").open();
      },
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  requestFullRescan(): void {
    this.scanner.scheduleRebuild(100);
  }

  refreshBadges(): void {
    this.badges.decorate();
  }

  /** Ratings whose sidecar write failed; retried on the next persist or refresh. */
  private pendingReviewWrites = new Map<string, Map<string, CardState>>();

  /**
   * End-of-session batch write (F2/KTD2): one rewrite per touched sidecar,
   * then rescan, badge refresh, and cards_due reconciliation. Failed writes
   * are surfaced in a Notice and kept for retry — ratings are never dropped
   * silently (R8).
   */
  async persistReviewUpdates(updates: Map<string, Map<string, CardState>>): Promise<void> {
    // Merge any previously-failed writes so a retry rides along.
    for (const [path, states] of this.pendingReviewWrites) {
      const merged = updates.get(path) ?? new Map<string, CardState>();
      for (const [id, state] of states) if (!merged.has(id)) merged.set(id, state);
      updates.set(path, merged);
    }
    this.pendingReviewWrites.clear();
    if (updates.size === 0) return;

    const failed: string[] = [];
    for (const [sidecarPath, states] of updates) {
      const file = this.app.vault.getAbstractFileByPath(sidecarPath);
      if (!(file instanceof TFile)) {
        failed.push(sidecarPath);
        this.pendingReviewWrites.set(sidecarPath, states);
        continue;
      }
      try {
        await this.app.vault.process(file, (raw) => rewriteStates(raw, states));
      } catch (e) {
        console.warn(`Engram: failed to write review state to ${sidecarPath}`, e);
        failed.push(sidecarPath);
        this.pendingReviewWrites.set(sidecarPath, states);
      }
    }
    if (failed.length > 0) {
      new Notice(
        `Engram: review state for ${failed.length} sidecar(s) could not be written and will be retried on the next session or "Refresh flashcard counts": ${failed.join(", ")}`,
        10_000
      );
    }
    await this.scanner.rebuild();
    this.refreshBadges();
    await applyCardsDue(this);
  }
}
