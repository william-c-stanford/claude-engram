import { FlashcardIndex } from "../index/flashcard-index";
import { noteCounts, subtreeCounts } from "../scheduler/rollup";

/** I/O port so the reconcile loop is testable without Obsidian. */
export interface FrontmatterPort {
  /** Frontmatter for a note path, or null when the file/frontmatter is missing. */
  getFrontmatter(notePath: string): Record<string, unknown> | null;
  writeCardsDue(notePath: string, value: number): Promise<void>;
}

export interface ReconcileResult {
  written: string[];
  failed: string[];
}

/**
 * Diff-guarded reconcile (KTD5): write only `type: zettel` notes whose stored
 * `cards_due` differs from the computed value; one note's failure never stops
 * the rest.
 */
export async function reconcileCardsDue(values: Map<string, number>, port: FrontmatterPort): Promise<ReconcileResult> {
  const result: ReconcileResult = { written: [], failed: [] };
  for (const [notePath, value] of values) {
    const fm = port.getFrontmatter(notePath);
    if (!fm || fm["type"] !== "zettel") continue;
    if (fm["cards_due"] === value) continue; // diff guard — no churn
    try {
      await port.writeCardsDue(notePath, value);
      result.written.push(notePath);
    } catch {
      result.failed.push(notePath);
    }
  }
  return result;
}

/**
 * Pure: the cards_due value every zettel note should carry (R13). Parents get
 * the subtree's red count (matching their folder badge); leaves their own.
 */
export function computeCardsDue(index: FlashcardIndex, nowMs: number, warnWindowHours: number): Map<string, number> {
  const out = new Map<string, number>();
  for (const entry of index.byAddress.values()) {
    const red = index.hasFolder(entry)
      ? subtreeCounts(index, entry.address, nowMs, warnWindowHours).red
      : noteCounts(entry, nowMs, warnWindowHours).red;
    out.set(entry.notePath, red);
  }
  return out;
}
