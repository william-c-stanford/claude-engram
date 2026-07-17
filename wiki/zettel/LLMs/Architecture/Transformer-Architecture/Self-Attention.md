---
type: zettel
address: "c-000070"
title: "Self-Attention"
created: "2026-07-08"
parent: "c-000072"
children:
  - "c-000069"
  - "c-000067"
  - "c-000068"
tags:
  - llm-fundamentals
  - transformer
  - attention
subtree_size: 3
cards_due: 0
---

# Self-Attention

## Synthesis

Self-attention is the transformer's token-mixing engine: each position forms a query, matches it against every key, and takes a weighted average of values, so information flows between arbitrary positions in one step. That expressive power comes at a quadratic price in sequence length, and it is run in parallel across multiple heads — the three sub-notes cover the core operation, its cost, and its multi-head form.

## Children

- [[Scaled-Dot-Product-Attention]] — the QKV formula and the causal mask
- [[Attention-Quadratic-Cost]] — the $O(n^2)$ bottleneck and the families that tame it
- [[Multi-Head-Attention]] — parallel heads and grouped-query attention

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.5–1.3.6

## Cross-references

- Parent: [[Transformer-Architecture]]
- IO-aware exact implementation: [[Flash-Attention]]


