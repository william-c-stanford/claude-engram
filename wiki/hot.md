---
type: meta
title: "Hot Cache"
updated: 2026-07-17T12:10:00
tags:
  - meta
  - hot-cache
status: evergreen
related:
  - "[[index]]"
  - "[[log]]"
  - "[[Wiki Map]]"
  - "[[getting-started]]"
  - "[[DragonScale Memory]]"
---

# Recent Context

Navigation: [[index]] | [[log]] | [[overview]]

## Last Updated

2026-07-17: **Engram Flashcards shipped (v1.10.0) — spaced repetition over the zettel tree.** New Obsidian plugin `obsidian-engram/` (id `engram-flashcards` 0.1.0; GitHub release `0.1.0` published with `main.js`/`manifest.json`/`styles.css`, BRAT-installable) + `/zettel-flashcards` generation skill + shared spec `docs/flashcard-format.md`. Cards live in `<Note>.cards.md` sidecars bound by DragonScale address; scheduling is an adjustable ease-factor ladder (1 → 4 → ×2.5 ≈ 1/4/10/25/62/156 days), sessions walk the tree topologically (parent cards first, green-parent reorientation samples, skippable), the explorer shows red/yellow/green count chips on folders + paired parent notes (identical subtree rollups; red chip → due review, yellow → early review, green → practice-ahead), and each note's `cards_due` frontmatter carries its red count (parents = subtree rollup) as graph-coloring groundwork.

## Key Recent Facts

- First deck: **Mixture-of-Experts subtree** — 5 sidecars (`c-000022`–`c-000026`), 22 cards across all five types (cloze incl. inside-LaTeX `\boxed{?}` masking, mcq, free, derivation, pseudocode), parser-validated with zero warnings.
- All 22 cards are new → red and due for first review; `cards_due` frontmatter reconciles when the vault opens with the plugin enabled (already in `community-plugins.json`, built files installed in `.obsidian/plugins/engram-flashcards/`).
- `%% srs <card-id> {json} %%` state lines are plugin-owned (append-only review log — never hand-edit); `.vault-meta/flashcard-index.json` is a rebuildable, gitignored cache.
- Plan artifact: `docs/plans/2026-07-17-001-feat-zettel-flashcards-plugin-plan.md` (executed to DoD this session; verifier findings fixed pre-commit).

## Recent Changes

- 2026-07-17: v1.10.0 commit `abe542a`; tag `0.1.0` pushed; release workflow green (22s) and release assets verified.
- 2026-07-08: Vault switched to Zettelkasten mode; LLM-fundamentals ingest re-filed as nested zettels under `wiki/zettel/LLMs/` (131 notes, DragonScale addresses, real LaTeX).

## Active Threads

- **Manual smoke (AE1–AE3):** open the vault in Obsidian → MoE folder + parent-note rows show red chips; click a chip, run the session end-to-end; confirm `cards_due` updates and no unrelated frontmatter churn in git diff.
- **Card the rest of the tree:** run `/zettel-flashcards` per subtree (bulk generation of all 131 notes deliberately deferred).
- **Stage 2 (deferred):** graph-view coloring by `cards_due`; optional FSRS swap (review log keeps migration lossless); review stats/heatmaps.
