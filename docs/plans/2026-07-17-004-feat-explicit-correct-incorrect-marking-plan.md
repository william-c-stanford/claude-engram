---
title: "Explicit Correct/Incorrect Marking in Review Sessions - Plan"
type: feat
date: 2026-07-17
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

# Explicit Correct/Incorrect Marking in Review Sessions - Plan

## Goal Capsule

- **Objective:** Make grading legible and overridable: open-ended cards get explicit Correct/Incorrect self-mark buttons; auto-checked cards get a one-click verdict flip. Pure UI over the existing rating machinery — the stored rating remains the only scheduling input.
- **Authority:** This plan; KTD6 of plan 001 (auto-check maps correct→Good, incorrect→Again).
- **Stop conditions:** none anticipated.
- **Tail:** Plugin 0.2.2 tagged release.

## Product Contract

### Summary

The review modal grows a binary marking layer: after revealing a free/derivation/pseudocode card, prominent **Correct** / **Incorrect** buttons self-mark the answer (mapping to Good/Again), with the four-button scale kept below for finer control; on cloze/MCQ cards the verdict line gains a visible "mark correct instead" / "mark incorrect instead" flip that swaps the suggested rating, so a known-answer-badly-typed (e.g., an unrendered LaTeX equation) is one click from correct. Scheduling semantics are unchanged.

### Problem Frame

Scheduling already works for every card type, but the grading surface hides it: open-ended cards present four rating buttons with nothing saying "this is how you mark yourself," and auto-checked cards bury the override inside those same buttons — a user who typed a paraphrase of a LaTeX answer sees "Incorrect" with no visible way to disagree. The user experienced both as "grades not being recorded."

### Requirements

- R1. After revealing a free/derivation/pseudocode card, Correct and Incorrect buttons appear as the primary controls; Correct rates Good, Incorrect rates Again; the Again/Hard/Good/Easy row remains available beneath for finer grading.
- R2. On auto-checked cards (cloze typed answers, MCQ), the verdict line shows a flip control — "Incorrect → mark correct instead" (and the mirror) — that swaps the suggested rating between Good and Again, re-outlining the suggested button; Enter then confirms the flipped verdict.
- R3. The flip and binary marks feed the existing rating path only (`finalRating` → `rate`); no state-format or scheduler change, and the review log records the resulting rating exactly as today.
- R4. Keyboard: `c` marks correct and `x` marks incorrect wherever the binary layer is active (both the open-ended buttons and the auto-checked flip); existing keys (Space/Enter, 1–4) keep their meanings.

### Acceptance Examples

- AE1. **Given** a revealed derivation card, **when** the user presses `c` or clicks Correct, **then** the card is rated Good and the session advances; Incorrect/`x` rates Again and re-queues it.
- AE2. **Given** a cloze card auto-marked Incorrect after a loosely typed equation, **when** the user clicks "mark correct instead" (or presses `c`), **then** the verdict line reads correct, Good becomes the outlined suggestion, and Enter rates Good.

## Planning Contract

### Key Technical Decisions

- KTD1. **Binary marks are sugar over ratings, not a new grade dimension.** Correct→Good, Incorrect→Again — identical to `autoRating`, so one mental model covers auto-checked and self-marked cards, and no schema/log change is needed. Hard/Easy stay as deliberate fine-grained choices.
- KTD2. **The flip mutates `currentAuto`** (the suggested-rating field that already drives the verdict text, outline, and Enter-confirm) — the smallest possible surface; `rateCurrent` is untouched.

## Implementation Units

### U1. Binary marking UI and keys

- **Goal:** Both affordances in the modal, keyboard included.
- **Requirements:** R1–R4.
- **Dependencies:** none.
- **Files:** `obsidian-engram/src/ui/review-modal.ts`, `obsidian-engram/src/ui/grading.ts` (pure verdict-flip helper), `obsidian-engram/styles.css`, `obsidian-engram/tests/session-queue.test.ts` (grading describe), `obsidian-engram/tests/integration/session-smoke.test.ts`.
- **Approach:** Reveal flow branches: `currentAuto === null` (open-ended) → render Correct/Incorrect as `mod-cta`-weight buttons above the rating row; `currentAuto` set (auto-checked) → verdict line gains the flip link, which swaps `currentAuto` via a pure `flipVerdict(rating)` helper and re-renders the controls. Keys `c`/`x` route to the active affordance; ignored pre-reveal and in text entry.
- **Test scenarios:**
  - `flipVerdict`: good→again, again→good; other ratings unaffected/unreachable.
  - Covers AE1 (integration): open-ended card revealed → Correct button visible → click rates Good (state interval advances); Incorrect rates Again and re-inserts 1–10 later.
  - Covers AE2 (integration): cloze answered wrong → flip control visible → click → Enter confirms Good; review log shows good, not again.
  - Keyboard: `c` on a revealed open-ended card rates Good; `c` mid-text-entry does nothing.
- **Verification:** `npm test` green; full-suite pass.

### U2. Docs and 0.2.2 release

- **Goal:** README grading section; version bump; release.
- **Requirements:** distribution.
- **Dependencies:** U1.
- **Files:** `obsidian-engram/README.md`, `obsidian-engram/manifest.json`, `obsidian-engram/versions.json`, `obsidian-engram/package.json`, `CHANGELOG.md`.
- **Test scenarios:** Test expectation: none — docs/release.
- **Verification:** Release `0.2.2` with the three assets.

## Verification Contract

| Gate | Command / procedure |
|---|---|
| Tests + typecheck | `cd obsidian-engram && npx tsc --noEmit && npm test` |
| Build + install | `npm run build`; copy assets to `.obsidian/plugins/engram-flashcards/` |
| Release smoke | Tag `0.2.2`; workflow green; assets present |

## Definition of Done

- AE1/AE2 pass in the integration harness; all gates green; release `0.2.2` published; CHANGELOG and README updated; no abandoned code.
