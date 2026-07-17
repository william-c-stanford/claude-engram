---
type: zettel
address: "c-000146"
title: "SFT Best Practices"
created: "2026-07-08"
parent: "c-000150"
children: []
tags:
  - llm-fundamentals
  - sft
subtree_size: 0
cards_due: 0
---

# SFT Best Practices

## Claim

Four practical SFT levers: **pack** short examples into full sequences to avoid padding waste, add **NEFTune** embedding noise for a free quality bump, always use the model's **native chat template**, and train only **2–3 epochs** (up to 5 for small curated sets) to avoid format memorization.

## Reasoning

- **Packing** — concatenate multiple short examples into one sequence separated by EOS, eliminating padding waste.
- **NEFTune** — add uniform noise to embeddings ($\alpha = 5$); improves MT-Bench by 5–15% at zero cost.
- **Chat template** — always use the model's native template; a mismatched template degrades quality.
- **Epochs** — 2–3 for large datasets, up to 5 for small (<10K) curated sets; over-training causes the model to memorize format rather than generalize.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.8.5

## Cross-references

- Parent: [[Supervised-Fine-Tuning]]
- Templates use [[Special-Tokens]]


