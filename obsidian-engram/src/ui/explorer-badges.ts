import { WorkspaceLeaf } from "obsidian";
import type EngramPlugin from "../main";
import { NoteEntry, isSidecarPath, pairedFolderPath } from "../index/flashcard-index";
import { Bucket, Counts } from "../scheduler/buckets";
import {
  folderCounts,
  folderUncovered,
  noteCounts,
  noteUncovered,
  subtreeCounts,
  subtreeUncovered,
} from "../scheduler/rollup";
import {
  cardsInFolder,
  cardsInNote,
  cardsInSubtree,
  formatDueOffset,
  formatIntervalDays,
  medianDueOffsetMs,
  medianIntervalDays,
} from "../scheduler/cadence";
import { Card } from "../cards/types";
import { chipsFor } from "./chips";
import { buildSessionQueue, SessionItem } from "./session-queue";
import { ReviewModal } from "./review-modal";

interface FileItem {
  el?: HTMLElement;
  selfEl?: HTMLElement;
}

/**
 * Decorates file-explorer rows with count chips (the file-explorer-note-count
 * technique: patch rendered tree items, re-decorate on events, degrade
 * silently when the explorer view is absent or its internals changed).
 */
export class ExplorerBadges {
  private plugin: EngramPlugin;

  constructor(plugin: EngramPlugin) {
    this.plugin = plugin;
  }

  install(): void {
    const ws = this.plugin.app.workspace;
    this.plugin.registerEvent(ws.on("layout-change", () => this.decorate()));
    // Time moves cards between buckets even with no file activity.
    this.plugin.registerInterval(window.setInterval(() => this.decorate(), 60_000));
    this.plugin.scanner.onRebuilt.push(() => this.decorate());
    ws.onLayoutReady(() => this.decorate());
  }

  decorate(): void {
    try {
      for (const leaf of this.plugin.app.workspace.getLeavesOfType("file-explorer")) {
        this.decorateLeaf(leaf);
      }
    } catch (e) {
      console.warn("Engram: badge decoration failed (explorer internals changed?)", e);
    }
  }

  private decorateLeaf(leaf: WorkspaceLeaf): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileItems: Record<string, FileItem> | undefined = (leaf.view as any)?.fileItems;
    if (!fileItems) return;

    const index = this.plugin.scanner.index;
    const root = this.plugin.settings.zettelRoot;
    const nowMs = Date.now();
    const warn = this.plugin.settings.warnWindowHours;

    for (const [path, item] of Object.entries(fileItems)) {
      const rowEl = item.selfEl;
      if (!rowEl) continue;

      // Hide sidecars (KTD3).
      if (isSidecarPath(path)) {
        item.el?.toggleClass("engram-hidden-sidecar", this.plugin.settings.hideSidecars);
        continue;
      }
      if (path !== root && !path.startsWith(`${root}/`)) {
        rowEl.querySelector(":scope > .engram-chips")?.remove();
        continue;
      }

      let counts: Counts | null = null;
      let uncovered = 0;
      let scopeCards: Card[] = [];
      let scope: NoteEntry | { folderPath: string } | null = null;

      if (index.folderPaths.has(path)) {
        counts = folderCounts(index, path, nowMs, warn);
        uncovered = folderUncovered(index, path);
        scopeCards = cardsInFolder(index, path);
        scope = index.noteForFolder(path) ?? { folderPath: path };
      } else {
        const entry = index.byNotePath.get(path);
        if (entry) {
          const parent = index.hasFolder(entry); // parent note mirrors its folder (R9)
          counts = parent ? subtreeCounts(index, entry.address, nowMs, warn) : noteCounts(entry, nowMs, warn);
          uncovered = parent ? subtreeUncovered(index, entry.address) : noteUncovered(entry);
          scopeCards = parent ? cardsInSubtree(index, entry.address) : cardsInNote(entry);
          scope = entry;
        }
      }

      rowEl.querySelector(":scope > .engram-chips")?.remove();
      if (!counts || !scope) continue;

      const chips = chipsFor(counts, uncovered);
      if (chips.length === 0) continue;

      const wrap = rowEl.createSpan({ cls: "engram-chips" });

      // Cadence first (R1): median next-review | median interval across the
      // scope. Left = urgency (drifts to "now" as you fall behind), right =
      // maturity (stable spacing). Inert — a summary metric, not an entry point.
      let hasCadence = false;
      if (this.plugin.settings.showCadence && scopeCards.length > 0) {
        const dueMs = medianDueOffsetMs(scopeCards, nowMs)!;
        const intervalDays = medianIntervalDays(scopeCards)!;
        const dueLabel = dueMs > 0 ? `~${formatDueOffset(dueMs)}` : formatDueOffset(dueMs);
        const intLabel = formatIntervalDays(intervalDays);
        const el = wrap.createSpan({
          cls: "engram-chip engram-chip-cadence engram-chip-inert",
          text: `${dueLabel} | ${intLabel}`,
        });
        el.setAttribute(
          "aria-label",
          `median next review ${dueMs > 0 ? `in ${formatDueOffset(dueMs)}` : "due now"}, median interval ${intLabel}`
        );
        hasCadence = true;
      }

      // Divider between the cadence and the count numbers (R4). Counts are
      // guaranteed present here (empty chip lists already continued out), so the
      // divider only needs the cadence side gated.
      if (hasCadence) {
        wrap.createSpan({ cls: "engram-chip engram-chip-sep engram-chip-inert", text: "·" });
      }

      for (const chip of chips) {
        // The uncovered chip is purely informational — nothing to review (R6).
        if (chip.kind === "uncovered") {
          const el = wrap.createSpan({
            cls: "engram-chip engram-chip-uncovered engram-chip-inert",
            text: String(chip.count),
          });
          el.setAttribute("aria-label", `${chip.count} ${chip.count === 1 ? "note" : "notes"} without flashcards`);
          continue;
        }
        const inert = chip.kind === "green" && !this.plugin.settings.practiceAhead;
        const el = wrap.createSpan({
          cls: `engram-chip engram-chip-${chip.kind}${inert ? " engram-chip-inert" : ""}`,
          text: String(chip.count),
        });
        el.setAttribute("aria-label", `${chip.count} ${chip.kind === "red" ? "due" : chip.kind === "yellow" ? "due soon" : "healthy"} — click to review`);
        if (!inert) {
          const bucket = chip.kind;
          el.addEventListener("click", (evt) => {
            evt.preventDefault();
            evt.stopPropagation(); // must not toggle folder collapse or open the note
            this.openSession(scope!, bucket);
          });
        }
      }
    }
  }

  private openSession(scope: NoteEntry | { folderPath: string }, bucket: Bucket): void {
    const index = this.plugin.scanner.index;
    const opts = {
      nowMs: Date.now(),
      warnWindowHours: this.plugin.settings.warnWindowHours,
      skipGreenParents: this.plugin.settings.skipGreenParents,
      reorientationSampleSize: this.plugin.settings.reorientationSampleSize,
      noteIntroMode: this.plugin.settings.noteIntroMode,
    };

    let queue: SessionItem[];
    let title: string;
    if ("folderPath" in scope) {
      // Folder with no paired parent note: concatenated walks of its direct notes.
      queue = index.notesDirectlyIn(scope.folderPath).flatMap((n) => buildSessionQueue(index, n.address, bucket, opts));
      title = scope.folderPath.split("/").pop() ?? scope.folderPath;
    } else {
      queue = buildSessionQueue(index, scope.address, bucket, opts);
      title = scope.title;
    }
    new ReviewModal(this.plugin, queue, title).open();
  }
}
