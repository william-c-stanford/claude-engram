---
type: zettel
address: "c-000089"
title: "Diversity in LLM Training"
created: "2026-07-08"
parent: "c-000151"
children:
  - "c-000087"
  - "c-000088"
  - "c-000086"
tags:
  - llm-fundamentals
  - diversity
  - training
subtree_size: 3
cards_due: 0
---

# Diversity in LLM Training

## Synthesis

Diversity — in outputs, in training data, and in optimization — is what prevents mode collapse and produces robust general-purpose models. It shows up on two fronts: at generation time (sampling strategies that widen the output distribution) and at data time (varied prompts, deduplication, domain mixing), unified by a small set of diversity-promoting mechanisms.

## Children

- [[Sampling-Diversity]] — generation-time knobs for diverse outputs
- [[Training-Data-Diversity]] — prompt variety, dedup, and data mixing
- [[Diversity-Promoting-Methods]] — the consolidated method list

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.11

## Cross-references

- Parent: [[Optimization-Methods]]
- Sampling knobs are detailed under [[Decoding-Methods]]
- Data diversity connects to [[Pretraining-Data-Pipeline]] and [[LIMA-Principle]]


