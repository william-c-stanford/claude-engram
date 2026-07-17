import { Card, CardState } from "../cards/types";
import { FlashcardIndex, NoteEntry } from "../index/flashcard-index";
import { Bucket, bucketOf } from "../scheduler/buckets";

/**
 * A lapsed card: its last rating was Again and it hasn't re-passed yet
 * (the scheduler leaves interval at 0 until the next success).
 */
export function isRelearning(state: CardState): boolean {
  return state.interval === 0 && (state.reviews?.length ?? 0) > 0;
}

/**
 * Where an Again-rated card re-enters the live queue: 1–10 cards later
 * (clamped to the queue end). `nextPos` is the index of the next card to be
 * shown; at least one other card intervenes when the queue allows it.
 */
export function againReinsertIndex(nextPos: number, queueLength: number, random: () => number = Math.random): number {
  const k = 1 + Math.floor(random() * 10); // 1..10 intervening cards
  return Math.min(nextPos + k, queueLength);
}

export interface SessionCard {
  card: Card;
  entry: NoteEntry;
  /** True when this card entered as an all-green parent's reorientation sample. */
  reorientation: boolean;
}

export interface QueueOptions {
  nowMs: number;
  warnWindowHours: number;
  skipGreenParents: boolean;
  reorientationSampleSize: number;
  /** Shuffle for within-note card order; injectable for tests. */
  random?: () => number;
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

/**
 * The mental-palace walk (R16 / KTD9): a depth-first pass over the subtree in
 * the index's topological order — each note's selected cards appear as a
 * contiguous run, parents strictly before their children, sibling subtrees in
 * `children` order. The chip's bucket selects which cards enter. A parent note
 * (one with children) whose cards all sit outside the selected bucket still
 * contributes a small reorientation sample — its most-nearly-due cards — so
 * the walk re-anchors context before descending, unless skipGreenParents.
 * Cards shuffle only within their note, never across notes.
 *
 * Exception to the walk: relearning cards (last rating Again, not yet
 * re-passed) jump to the front of a red session, oldest lapse first — closing
 * and reopening a session resumes with the cards that just failed.
 */
export function buildSessionQueue(
  index: FlashcardIndex,
  rootAddress: string,
  bucket: Bucket,
  opts: QueueOptions
): SessionCard[] {
  const random = opts.random ?? Math.random;
  const queue: SessionCard[] = [];

  for (const entry of index.subtreeOf(rootAddress)) {
    const cards = entry.sidecar?.cards ?? [];
    if (cards.length === 0) continue;

    const inBucket = cards.filter((c) => bucketOf(c.state, opts.nowMs, opts.warnWindowHours) === bucket);
    if (inBucket.length > 0) {
      queue.push(...shuffled(inBucket, random).map((card) => ({ card, entry, reorientation: false })));
      continue;
    }

    // Reorientation applies only to the due-review walk (red): an off-bucket
    // parent re-anchors context before its children. Yellow/green sessions
    // take strictly their own bucket.
    const isParent = index.childrenOf(entry).length > 0;
    if (bucket === "red" && isParent && !opts.skipGreenParents && opts.reorientationSampleSize > 0) {
      const sample = [...cards]
        .sort((a, b) => Date.parse(a.state.due ?? "9999") - Date.parse(b.state.due ?? "9999"))
        .slice(0, opts.reorientationSampleSize);
      queue.push(...sample.map((card) => ({ card, entry, reorientation: true })));
    }
  }

  if (bucket === "red") {
    const relearning = queue.filter((s) => isRelearning(s.card.state));
    if (relearning.length > 0) {
      const rest = queue.filter((s) => !isRelearning(s.card.state));
      relearning.sort(
        (a, b) =>
          Date.parse(a.card.state.reviews?.at(-1)?.at ?? "9999") - Date.parse(b.card.state.reviews?.at(-1)?.at ?? "9999")
      );
      return [...relearning, ...rest];
    }
  }

  return queue;
}
