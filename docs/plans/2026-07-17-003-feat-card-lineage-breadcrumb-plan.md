---
title: "Card Lineage Breadcrumb — Scrollable Ancestry Strip - Plan"
type: feat
date: 2026-07-17
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

# Card Lineage Breadcrumb — Scrollable Ancestry Strip - Plan

## Goal Capsule

- **Objective:** Replace the card screens' single greyed note title with a horizontally scrollable lineage strip: topmost ancestor inside the zettel root → … → source note, fixed width, initially scrolled fully right.
- **Authority:** This plan; plan 002's modal architecture.
- **Stop conditions:** none anticipated — additive UI over existing index data.
- **Tail:** Plugin 0.2.1 tagged release.

## Product Contract

### Summary

Card screens (and the note-reading step) show the note's full ancestry as a `→`-separated strip — e.g. `LLMs → Architecture → Mixture of Experts → MoE Architecture` — inside its own overflow-x scroll container that never widens the card and opens scrolled to the right so the source note is visible; scrolling left reveals the path back up the tree, deepening the mental-palace orientation.

### Requirements

- R1. Every card screen shows the source note's lineage: each ancestor note title from the first node inside the configured zettel root down to the source note itself, in root→source order with `→` separators.
- R2. The lineage renders in its own horizontally scrolling sub-component with a fixed width bounded by the card; it never expands the modal or wraps.
- R3. The strip starts scrolled fully right (source note visible); the user scrolls left to see ancestors.
- R4. Ancestor titles come from the paired parent notes (folder `X/` ↔ `X.md`); a folder with no paired note falls back to its folder name. Session-scope and reorientation/type indicators are preserved alongside the strip.

### Acceptance Examples

- AE1. **Given** a card from `MoE-Architecture` with zettel root `wiki/zettel`, **then** the strip reads `LLMs → Architecture → Mixture of Experts (MoE) → MoE Architecture`, right-scrolled, and the modal width is unchanged.
- AE2. **Given** a root-level note (no ancestors), **then** the strip shows just that note's title with no separators.

## Planning Contract

### Key Technical Decisions

- KTD1. **Lineage derives from the note path, not stored state.** Folder path = parent chain (comprehensive-zettel invariant); each ancestor segment resolves its paired note via the existing `noteForFolder` for the title, falling back to the segment name. Pure function on `FlashcardIndex`, so it's unit-testable and needs no new frontmatter or index fields.
- KTD2. **The strip is a CSS scroll container** (`overflow-x: auto`, `white-space: nowrap`, `max-width: 100%`); after render the modal sets its scroll position to the far right. No JS virtualization — lineages are a handful of segments.

## Implementation Units

### U1. Lineage resolution

- **Goal:** `lineageOf(index, entry, zettelRoot)` → ordered titles from the first node under the root to the entry itself.
- **Requirements:** R1, R4.
- **Dependencies:** none.
- **Files:** `obsidian-engram/src/index/flashcard-index.ts`, `obsidian-engram/tests/index.test.ts`.
- **Test scenarios:**
  - Covers AE1: deep leaf resolves every ancestor title in root→source order, titles taken from paired notes.
  - Covers AE2: root-level note yields a single-element lineage.
  - Fallback: an ancestor folder with no paired note contributes its folder name.
  - A custom zettel root trims correctly (nothing above the root appears).
- **Verification:** `npm test` green.

### U2. Breadcrumb strip UI and release

- **Goal:** Render the strip on card screens and the reading step; scroll-right initialization; 0.2.1 release.
- **Requirements:** R2, R3; distribution.
- **Dependencies:** U1.
- **Files:** `obsidian-engram/src/ui/review-modal.ts`, `obsidian-engram/styles.css`, `obsidian-engram/tests/integration/session-smoke.test.ts` (lineage text asserted in the walk), `obsidian-engram/manifest.json`, `obsidian-engram/versions.json`, `obsidian-engram/package.json`, `CHANGELOG.md`.
- **Approach:** The breadcrumb row becomes session-scope line + lineage strip; `scrollLeft = scrollWidth` after attach (harmless no-op in the headless stub). Reorientation/type markers stay on the session-scope line.
- **Test scenarios:**
  - Integration walk asserts the full lineage text appears on a deep card's screen and a single title on the root note's cards.
  - Test expectation for scroll position: none — `scrollLeft` is a real-DOM behavior; verified by vault smoke.
- **Verification:** `npm test` green; build + install; release `0.2.1` with the three assets.

## Verification Contract

| Gate | Command / procedure |
|---|---|
| Tests + typecheck | `cd obsidian-engram && npx tsc --noEmit && npm test` |
| Build + install | `npm run build`; copy assets to `.obsidian/plugins/engram-flashcards/` |
| Release smoke | Tag `0.2.1`; workflow green; assets present |

## Definition of Done

- AE1 passes in the integration harness; AE2 (root-level single-element lineage) is covered at unit level in `tests/index.test.ts`; scroll-right start eyeballed at next real session (real-DOM only).
- All gates green; release `0.2.1` published; CHANGELOG updated; no abandoned code.
