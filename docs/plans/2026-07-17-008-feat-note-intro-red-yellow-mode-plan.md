---
title: "feat: Show note reading step whenever the subtree has red/yellow cards"
date: 2026-07-17
type: feat
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
product_contract_source: ce-plan-bootstrap
plan_depth: lightweight
target_repo: claude-engram (plugin lives in obsidian-engram/)
---

# feat: Show note reading step whenever the subtree has red/yellow cards

## Summary

Today a session shows a note's evergreen reading step only on **first encounter** (no card of that note has any review history). The user wants the reading step to reappear whenever a note has **red or yellow** cards due — refreshing the strong source content whenever recall is lapsing (red = due/overdue/new) or about to come up for review (yellow = due within the warn window) — and to stop showing it once everything is green (well-understood, review comfortably in the future).

The mechanism already exists: `wantsIntro(entry, mode)` in `obsidian-engram/src/ui/session-queue.ts` decides per-note whether to emit a `note-intro` item, and `subtreeCounts(index, address, nowMs, warnWindowHours)` in `obsidian-engram/src/scheduler/rollup.ts` already computes red/yellow/green rollups over a note's subtree (the same rollup the explorer chips use). This plan adds a fourth `noteIntroMode` value — `red-yellow` — wired to that rollup, and makes it the new default while leaving `first-encounter`/`always`/`never` selectable.

**Product Contract preservation:** solo plan, no upstream requirements doc — nothing to preserve.

---

## Problem Frame

- **Current behavior:** `wantsIntro` returns true for `always`, false for `never`, and `isFirstEncounter(entry)` for `first-encounter`. `isFirstEncounter` is true only when the note has cards and none carry a single review-log entry. After the first review of any card in a note, its reading step never shows again.
- **Desired behavior:** the reading step should refresh whenever a note's subtree currently holds red (due/overdue/new) or yellow (due within the warn window) cards, and be suppressed when the subtree is all green. This ties re-reading the source note to a live due/overdue signal rather than to a one-time first-encounter flag. Note the asymmetry the user accepted: red is a genuine lapse signal, while yellow is "coming up soon" (typically still well-retained) — both are in scope per the explicit request, but the trigger is fundamentally "there is due-or-soon work here," not proof of a failed recall.
- **Why subtree granularity:** confirmed with the user — parents should refresh whenever anything beneath them is due, matching how the explorer chips roll up (`subtreeCounts` / `folderCounts` in `rollup.ts`). A parent note re-anchors the whole descending walk.

---

## Requirements

- **R1** — Add a `red-yellow` value to `NoteIntroMode`. In this mode, a note's `note-intro` item is emitted iff `subtreeCounts` for that note's address has `red > 0 || yellow > 0` at session-build time.
- **R2** — `red-yellow` is the new default (`DEFAULT_SETTINGS.noteIntroMode`). `first-encounter`, `always`, and `never` remain valid and selectable.
- **R3** — The settings dropdown exposes all four modes with an accurate description; the persisted-value guard accepts `red-yellow`.
- **R4** — Existing behavior for `first-encounter`, `always`, and `never` is unchanged. Users with a persisted mode keep it (no forced migration).
- **R5** — The `red-yellow` decision is independent of the session's bucket: it reads the note's live subtree counts, so it behaves correctly in red, yellow, and green sessions and for reorientation-parent notes.

---

## Key Technical Decisions

- **KTD1 — Reuse `subtreeCounts`, don't recompute.** `rollup.ts` already exposes `subtreeCounts(index, address, nowMs, warnWindowHours)`. `wantsIntro` calls it directly. `session-queue.ts` importing from `../scheduler/rollup` introduces no import cycle (`rollup.ts` imports only `../index/flashcard-index` and `./buckets`; neither imports `session-queue`).
  - **Cost note:** `wantsIntro` runs only for notes already in the built walk (`ordered`), not the whole index, so the added `subtreeCounts` pass is bounded by the session's own notes, and each such note's subtree is walked once. This mirrors the per-node rollup the explorer chips already do. No latency target exists; if a very large session ever makes this bite, memoize `subtreeCounts` per address across the build — deferred until measured (see Open Questions).
- **KTD2 — Widen `wantsIntro`'s signature rather than precomputing per-note.** `wantsIntro` currently takes `(entry, mode)`. It gains the `index`, `nowMs`, and `warnWindowHours` it needs (all already in scope inside `buildSessionQueue` via the `index` param and `opts`). The `red-yellow` branch is the only one that consumes them; the other branches ignore them.
- **KTD3 — New default takes effect here with no migration.** This vault has no persisted `data.json` for the plugin, so `loadSettings` (`main.ts:71`: `Object.assign({}, DEFAULT_SETTINGS, await this.loadData())`) yields `red-yellow` immediately. For any other install with a persisted `first-encounter`, the saved value is preserved by design (R4) — this is the backward-compatible behavior the user chose ("keep others"). No migration code is added.
- **KTD4 — Subtree, not own-cards, granularity.** The `red-yellow` branch uses `subtreeCounts` (rollup over the note + all descendants), not `noteCounts` (the note's own sidecar cards). Chosen by the user to match the explorer chip rollups.

---

## Implementation Units

### U1. Add `red-yellow` mode to the session-queue intro logic

**Goal:** Emit a note's reading step when its subtree has any red or yellow card, under a new `red-yellow` mode.

**Requirements:** R1, R5. Advances KTD1, KTD2, KTD4.

**Dependencies:** none for the logic change. U1 and U3 are a TDD pair co-delivered in one commit — U1's `Verification` (the `red-yellow` cases green) is only satisfiable once U3's tests exist, so land them together with the failing tests written first (see U3's Execution note).

**Files:**
- `obsidian-engram/src/ui/session-queue.ts` (modify)
- `obsidian-engram/tests/session-queue.test.ts` (modify — authored in U3)

**Approach:**
- Extend the `NoteIntroMode` union (line 33) to `"first-encounter" | "always" | "never" | "red-yellow"`.
- Import `subtreeCounts` from `../scheduler/rollup`.
- Change `wantsIntro` to accept the extra context it needs (index + nowMs + warnWindowHours) alongside `entry` and `mode`. Add the branch: for `red-yellow`, compute `subtreeCounts(index, entry.address, nowMs, warnWindowHours)` and return `red > 0 || yellow > 0`. Leave `never`/`always`/`first-encounter` branches unchanged.
- Update the single call site (currently `wantsIntro(s.entry, opts.noteIntroMode)` near line 135) to pass `index`, `opts.nowMs`, `opts.warnWindowHours`.

**Patterns to follow:** `subtreeCounts` usage in `rollup.ts:14`; the existing bucket-count consumption in `explorer-badges.ts` / `chips.ts`. Keep `wantsIntro` a pure module function (no side effects), consistent with `isFirstEncounter`.

**Technical design (directional, not spec):**
```
function wantsIntro(entry, mode, index, nowMs, warnWindowHours):
  if mode == "never":  return false
  if mode == "always": return true
  if mode == "red-yellow":
     c = subtreeCounts(index, entry.address, nowMs, warnWindowHours)
     return c.red > 0 || c.yellow > 0
  return isFirstEncounter(entry)   // "first-encounter"
```

**Test scenarios:** (implemented in U3)
- `red-yellow`: note whose subtree has a red card → intro emitted before its run.
- `red-yellow`: note whose subtree has a yellow card (due within warn window) but no red → intro emitted.
- `red-yellow`: note whose subtree is entirely green → no intro.
- `red-yellow`: a parent note whose own cards are green but a descendant has a red/yellow card → intro emitted (subtree rollup, KTD4).
- `red-yellow`: intro still lands adjacent to the note's card run (same interleave invariant as `first-encounter`), and a note with no cards emits no intro.
- Regression: `first-encounter`, `always`, `never` produce identical output to before the signature change.

**Verification:** `npm test` passes; the new `red-yellow` cases and the unchanged-mode regressions are green.

---

### U2. Default to `red-yellow` and expose it in settings

**Goal:** Make `red-yellow` the default and selectable in the settings UI without breaking persisted values.

**Requirements:** R2, R3, R4. Advances KTD3.

**Dependencies:** U1 (the `NoteIntroMode` value must exist).

**Files:**
- `obsidian-engram/src/settings.ts` (modify)

**Approach:**
- Widen the inline `noteIntroMode` type on the settings interface (line 20) to include `"red-yellow"` — keep it in sync with the `NoteIntroMode` union in `session-queue.ts` (two declarations exist today; both must list all four values).
- Set `DEFAULT_SETTINGS.noteIntroMode` (line 33) to `"red-yellow"`.
- In the "Note reading step" `Setting` (lines 132–145): add `"red-yellow"` to `addOptions` with a clear label (e.g. `"When red/yellow cards are due (default)"`), move the `(default)` marker off `first-encounter`, update `.setDesc(...)` to describe the four choices, and add `v === "red-yellow"` to the persisted-value guard so the dropdown change handler accepts it.

**Patterns to follow:** the existing dropdown block for this setting (`settings.ts:132`); label/`(default)` convention already used for `first-encounter`.

**Test scenarios:** `Test expectation: none -- pure settings-object default and Obsidian Setting UI wiring; no behavioral logic beyond the guard, which is exercised indirectly by the type checker and U3's mode coverage.` (If a lightweight assertion is cheap, optionally assert `DEFAULT_SETTINGS.noteIntroMode === "red-yellow"`.)

**Verification:** `npm run build` / `tsc` clean (both `NoteIntroMode` declarations agree); opening the plugin settings shows four options with `red-yellow` selected by default on a fresh install.

---

### U3. Test coverage for `red-yellow`

**Goal:** Lock in the `red-yellow` behavior and prove the three legacy modes are unchanged.

**Requirements:** R1, R4, R5.

**Dependencies:** U1.

**Files:**
- `obsidian-engram/tests/session-queue.test.ts` (modify)

**Approach:**
- Reuse the existing `note-intro` fixture pattern (`describe("note-intro items ...")`, the `entry()`/`red()`/`green()` helpers, `NOW`, and the shared `opts`). Add a nested block for `noteIntroMode: "red-yellow"`.
- Build a small parent→child index where buckets are controllable: a green-only subtree, a subtree with a red card, a subtree with a yellow card (due within `warnWindowHours` of `NOW`), and a parent whose own cards are green but a child is red.
- Assert intro presence/absence per U1's scenarios, and that intros remain adjacent to their note's card run.
- Add/keep a regression assertion that `first-encounter`/`always`/`never` output is unchanged after the `wantsIntro` signature widening.

**Execution note:** Prefer writing the failing `red-yellow` assertions first, then implementing U1 — the modes map cleanly to table-style cases.

**Test scenarios:** (the enumerated cases in U1's Test scenarios; this unit is where they live).

**Verification:** `npm test` green, including the pre-existing `first-encounter`/`always`/`never` and relearning tests.

---

## Scope Boundaries

**In scope:** the four items above — new `red-yellow` mode, subtree-rollup wiring, new default, settings UI, tests.

**Out of scope (non-goals):**
- Changing red/yellow/green bucket definitions (`bucketOf` in `buckets.ts`).
- Changing the mental-palace walk, reorientation-sample, or relearning-pull logic in `buildSessionQueue`.
- Migrating existing persisted `noteIntroMode` values (deliberate — R4/KTD3).
- Any change to the per-card "Review source note" affordance (0.2.0) — that resets an interval ladder and is unrelated to the pre-card reading step.

### Deferred to Follow-Up Work
- Consolidating the two `NoteIntroMode` type declarations (`session-queue.ts` and `settings.ts`) into a single shared export, so future mode additions touch one place. Not required for this change; noted because U1/U2 must edit both.

---

## Open Questions

- Both design forks (setting shape → new default mode keeping others; granularity → whole subtree) were resolved with the user before writing. Neither blocks implementation.
- **Parent-note intro frequency (non-blocking, watch after use).** A consequence of subtree granularity + `red-yellow` default: a note appears in a session's walk whenever it contributes a card (or reorientation sample), and its intro then fires whenever *anything* in its subtree is red or yellow. For near-root parent notes with many descendants, that will be nearly every red/yellow session — effectively "always" for high-level parents. This is the intended "refresh on due work" behavior, but if it proves noisy in practice the low-cost dial is to switch the default's granularity to `noteCounts` (the note's own cards) while keeping subtree as an opt-in, or to suppress intros for reorientation-only parent appearances. No code beyond the granularity swap is needed to change this later; flagged so the decision is revisitable rather than silently locked in.

---

## Sources & Research

- `obsidian-engram/src/ui/session-queue.ts` — `wantsIntro`, `isFirstEncounter`, `buildSessionQueue`, `NoteIntroMode`.
- `obsidian-engram/src/scheduler/rollup.ts` — `subtreeCounts` (reused), `noteCounts`, `folderCounts`.
- `obsidian-engram/src/scheduler/buckets.ts` — `bucketOf` red/yellow/green definitions.
- `obsidian-engram/src/settings.ts` — settings interface, `DEFAULT_SETTINGS`, "Note reading step" dropdown.
- `obsidian-engram/src/main.ts`, `obsidian-engram/src/ui/explorer-badges.ts` — the two `buildSessionQueue` call sites (red command; chip-driven per-bucket sessions).
- `obsidian-engram/tests/session-queue.test.ts` — existing intro-mode test patterns.
- No external research: strong local patterns, self-contained change.

## Definition of Done

- `red-yellow` mode exists, is the default, and is selectable in settings; the three legacy modes are unchanged.
- In `red-yellow`, a note's reading step shows iff its subtree has a red or yellow card (verified by tests).
- `npm test` and `npm run build` are green.
