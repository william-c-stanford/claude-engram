---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
product_contract_source: ce-plan-bootstrap
type: feat
title: "feat: Plain colored explorer indicators (cadence-first, de-tiled counts)"
date: 2026-07-17
target_component: obsidian-engram
---

# feat: Plain colored explorer indicators (cadence-first, de-tiled counts)

## Summary

Restyle the file-explorer row indicators into one cohesive strip. The review-cadence metric (`~4d | 10d`) moves to the **front**, right after the note/folder title; the red/yellow/green count chips lose their filled tiles and become **plain colored numbers** at text weight; the "no cards yet" indicator becomes a plain **gray** number; a thin `·` divider separates the cadence from the counts. Click-to-review is preserved on the colored count numbers. Target order:

```
Architecture   ~4d | 10d · 139 17 15 1
               └cadence┘  └red/yel/grn┘ └gray uncovered
```

**Target component:** `obsidian-engram/`. This is a presentation-only change — no counting, rollup, or scheduling logic is touched.

---

## Problem Frame

The row currently mixes visual languages: saturated red/yellow/green **tiles** with white numerals, a **white tile** with a black numeral for coverage gaps, and a bordered **pill** for cadence rendered *last*. The tiles read heavier than the cadence text and the ordering buries the metric the user reaches for first. The user wants a single cohesive strip: cadence first, then plain colored numbers at the same visual weight as the cadence words (`now`, `new`), so the whole row scans as one unit instead of a row of buttons.

---

## Requirements

- **R1** — The cadence indicator (median due `|` median interval) renders **first**, immediately after the title, before any count numbers.
- **R2** — The red/yellow/green counts render as **plain colored numerals** — no filled background, no border, no fixed min-width/height/padding — at normal text weight, colored: red = due, yellow = due-soon, green = healthy.
- **R3** — The "no cards yet" indicator renders as a **plain gray numeral** (neutral, colorless — distinct from the scheduled-card counts), in the same de-tiled style.
- **R4** — A thin, faint **divider** (`·` or equivalent) sits between the cadence and the count numbers when both are present; it is absent when either side is.
- **R5** — The colored count numerals **remain clickable** and open the same review sessions as today (red → due, yellow → early, green → practice-ahead when enabled), with a visible hover affordance since the tile/button shape is gone. The cadence and uncovered numerals stay inert.
- **R6** — All numerals are legible in **both light and dark themes**. Plain yellow text is the weak case; use a readable amber rather than the raw tile fill.
- **R7** — The `showCadence` setting still governs whether the cadence segment (and therefore the divider) appears; the count numbers are unaffected by it.

---

## Key Technical Decisions

- **KTD1 — Presentation-only; the chip *model* is unchanged.** `chipsFor(counts, uncovered)` and the cadence rollups already produce exactly the data needed. The change lives in the `decorateLeaf` render order and in `styles.css`. No changes to `chips.ts`, `rollup.ts`, `cadence.ts`, or the counting logic.

- **KTD2 — Restyle the existing `engram-chip*` classes rather than renaming.** Keeping the class names (`engram-chip`, `engram-chip-red/yellow/green/uncovered/cadence`, `engram-chip-inert`) minimizes JS churn; the CSS is what changes — the base rule drops tile geometry (`min-width`/`height`/`padding`/`border-radius`/`background`/white `color`) and the `-red/-yellow/-green` rules switch from `background-color` to `color`. (A rename to `engram-count*` is optional cleanup, deferred — not worth the extra JS diff for this pass.)

- **KTD3 — Yellow uses a readable amber, not the tile fill.** `var(--color-yellow)` is tuned as a *background* fill behind white text; as foreground text on a light sidebar it's low-contrast. Use a darker amber for the yellow numeral (a fixed value or a theme var that reads as text), keeping red/green on their theme vars where contrast is already adequate.

- **KTD4 — Hover affordance replaces the button shape.** With no tile, the clickable numbers need a discoverability cue: an underline and/or brightness shift on hover for the red/yellow/green numerals only (uncovered and cadence stay plain, `cursor: default`).

- **KTD5 — Divider is a rendered element, gated on both sides.** The `·` is its own inert span emitted between the cadence segment and the first count number, only when the cadence segment rendered *and* at least one count number will follow. A scope with uncovered notes but zero cards (cadence hidden) shows just the gray numeral, no divider.

---

## High-Level Technical Design

Render order inside `decorateLeaf`, after counts/uncovered/cadence data are computed for the row:

```
create .engram-chips wrap
if showCadence and scope has cards:
    render cadence  "~<due> | <interval>"      (plain, inert)
    hasCadence = true
for chip in chipsFor(counts, uncovered):        # red, yellow, green, uncovered
    if first chip and hasCadence:
        render divider "·"                       (faint, inert)
    if chip.kind == uncovered:
        render gray numeral                      (inert)
    else:
        render colored numeral + click→openSession(scope, kind) + hover cue
```

*(Directional — the current loop already carries the click-wiring and the inert/uncovered branch; this only reorders and moves the cadence block ahead of the loop plus inserts the divider.)*

---

## Implementation Units

### U1. Reorder the render and move cadence to the front

**Goal:** Emit the cadence segment before the count numbers and insert the gated divider.

**Requirements:** R1, R4, R5, R7.

**Dependencies:** none.

**Files:**
- `obsidian-engram/src/ui/explorer-badges.ts` (modify)

**Approach:**
- Move the existing cadence-rendering block from *after* the `chips` loop to *before* it (still guarded by `showCadence && scopeCards.length > 0`); track a local `hasCadence` boolean.
- In the chip loop, before rendering the first chip, emit a divider span (`·`, class e.g. `engram-chip-sep engram-chip-inert`) when `hasCadence` is true.
- Leave the per-chip branches intact: bucket chips keep their `openSession` click wiring (R5); the uncovered branch stays inert. Only the *order* and the new divider change here; the CSS in U2 does the visual restyle.
- Keep the `chips.length === 0 → continue` guard; the cadence-only case (no cards) can't occur because cadence requires cards.

**Patterns to follow:** the current `decorateLeaf` chip loop and cadence block in the same file.

**Test scenarios:** `Test expectation: none — DOM ordering over already-tested pure functions (chipsFor, cadence rollups); verified via the U3 manual smoke.`

**Verification:** In a live vault the cadence segment appears immediately after the title, followed by `·` and the count numbers; clicking a colored number still opens the correct session.

---

### U2. Restyle chips to plain colored numerals

**Goal:** Turn the tiles/pill into plain colored/gray/muted text at a cohesive weight, with a hover cue on the clickable numerals and light/dark legibility.

**Requirements:** R2, R3, R5, R6.

**Dependencies:** U1 (ordering/divider markup present).

**Files:**
- `obsidian-engram/styles.css` (modify)

**Approach:**
- Strip tile geometry from `.engram-chip`: remove `min-width`, `height`, `padding`, `border-radius`, `background-color`, and the white `color`; keep it inline-flex/inline with the shared font-size and weight so numerals sit on the text baseline.
- `.engram-chip-red/-yellow/-green`: set `color` (foreground) instead of `background-color`. Yellow uses a readable amber (KTD3).
- `.engram-chip-uncovered`: plain `var(--text-muted)` gray; drop the white background and border.
- `.engram-chip-cadence`: plain `var(--text-muted)`; drop the border/pill.
- `.engram-chip-sep`: faint (`var(--text-faint)`) divider glyph, inert.
- Add a hover rule for the clickable (non-inert) numerals — underline and/or brightness — scoped so uncovered/cadence/sep (inert) don't get it.
- Verify contrast in both themes; adjust the amber if the light-theme sidebar washes it out.

**Patterns to follow:** the existing `.engram-chip*` block being replaced; Obsidian theme vars (`--color-red/green`, `--text-muted`, `--text-faint`) already used elsewhere in the file.

**Test scenarios:** `Test expectation: none — pure styling; verified visually in U3 (both themes).`

**Verification:** Row renders as `~4d | 10d · 139 17 15 1` with cadence/divider muted, counts colored, uncovered gray; hovering a colored count shows the affordance; all readable in light and dark.

---

### U3. Build, test, docs, version bump

**Goal:** Ship the restyle verified.

**Requirements:** R1–R7.

**Dependencies:** U1, U2.

**Files:**
- `obsidian-engram/manifest.json`, `obsidian-engram/versions.json`, `obsidian-engram/package.json` (version bump)
- `obsidian-engram/README.md` (update the chip/legend wording to match the plain-number layout)

**Approach:**
- Run the suite and the production build (which auto-deploys to the vault plugin dir); reload and eyeball both themes.
- Smoke steps: (1) cadence-first ordering with divider; (2) colored counts click through to the right sessions; (3) yellow numeral is readable on a light theme; (4) a card-less-but-uncovered row shows a lone gray numeral and no divider; (5) toggling *Show review cadence* off removes the cadence segment and the divider but leaves the colored counts.
- Bump the version and refresh the README legend.

**Test scenarios:** `Test expectation: none — manual verification unit; automated logic coverage is unchanged (chips/rollup/cadence suites already green).`

**Verification:** Full suite passes except the known pre-existing `session-smoke` failures; build+deploy succeeds; all five smoke steps pass; README and version updated.

---

## Scope Boundaries

**In scope:** render order in `explorer-badges.ts`, the `styles.css` restyle, a divider element, hover affordance, version/docs.

### Deferred to Follow-Up Work
- Renaming `engram-chip*` classes to `engram-count*` to match the de-tiled reality (KTD2) — cosmetic cleanup, not worth the JS diff now.
- Any per-user color customization of the numerals.

### Out of scope (unchanged)
- Count/rollup logic (`chips.ts`, `rollup.ts`), cadence metric (`cadence.ts`), review-session behavior, `cards_due` writeback.

---

## System-Wide Impact

- No logic or data-shape changes; the persisted index, sidecars, and settings are untouched. `showCadence` semantics are unchanged (R7).
- Risk is confined to CSS legibility (yellow-on-light) and click discoverability (no button shape) — both addressed by KTD3/KTD4 and verified in the U3 smoke.

## Verification Contract

- `npm test` passes except the pre-existing `session-smoke` integration failures (unrelated to this change).
- `npm run build` succeeds and auto-deploys.
- The five U3 smoke steps pass in a live vault, both themes.

## Definition of Done

- U1–U3 complete; smoke observed.
- R1–R7 satisfied; click-to-review and the `showCadence` toggle still work.
- Version bumped, README legend updated.

## Sources & Research

Local only — the indicators, click wiring, and cadence/rollup logic all already exist in-repo:
- `obsidian-engram/src/ui/explorer-badges.ts` — render loop + cadence block being reordered.
- `obsidian-engram/styles.css` — `.engram-chip*` rules being restyled.
- `obsidian-engram/src/ui/chips.ts`, `src/scheduler/cadence.ts` — unchanged data sources.
