---
type: zettel
address: "c-000088"
title: "Training Data Diversity"
created: "2026-07-08"
parent: "c-000089"
children: []
tags:
  - llm-fundamentals
  - diversity
  - data
subtree_size: 0
cards_due: 0
---

# Training Data Diversity

## Claim

Diverse training data — prompts spanning domains, difficulties, and formats (targeting a 20–80% success rate, the "Goldilocks" band), deduplicated and mixed by domain — prevents overfitting to specific patterns and ensures broad coverage.

## Reasoning

- **Prompt diversity** — cover different domains, difficulty levels, and formats; the Goldilocks principle says prompts should sit at a 20–80% success rate (too easy teaches nothing, too hard gives no signal).
- **Deduplication** — remove near-duplicates (MinHash, n-gram overlap); duplicates cause overfitting to specific patterns.
- **Data mixing** — balance across tasks/domains via temperature-weighted sampling or curriculum strategies.

These mirror the pretraining data recipe but apply to every training phase, including SFT and RL prompt sets.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.11.2

## Cross-references

- Parent: [[Diversity-In-Training]]
- Related: [[Pretraining-Data-Pipeline]] · [[LIMA-Principle]]


