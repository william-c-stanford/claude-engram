---
type: zettel
address: c-000066
title: Positional Encodings
created: 2026-07-08
parent: c-000072
children:
  - c-000065
  - c-000064
  - c-000062
  - c-000063
tags:
  - llm-fundamentals
  - transformer
  - positional-encoding
subtree_size: 4
cards_due: 17
---

# Positional Encodings

## Synthesis

Attention is permutation-equivariant, so without an added position signal a transformer cannot tell "the cat sat on the mat" from a shuffling of the same tokens. Positional-encoding methods inject order, and they differ on one axis that dominates practice: how well they **extrapolate** beyond the training length. The field moved from fixed/learned *absolute* encodings to *relative* ones (RoPE, ALiBi), and then to explicit scaling tricks for 100K–1M-token contexts.

## Children

- [[Sinusoidal-And-Learned-Positional]] — the two absolute methods and why they fade
- [[RoPE]] — rotary encoding: relative position via rotation, today's default
- [[ALiBi]] — a linear attention-score bias, no position embedding at all
- [[Long-Context-Extension]] — scaling RoPE and distributing attention to 1M tokens

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.7

## Cross-references

- Parent: [[Transformer-Architecture]]
- Position interacts with the [[Attention-Dilution]] "lost in the middle" effect.


