---
type: zettel
address: "c-000022"
title: "MoE Architecture"
created: "2026-07-08"
parent: "c-000026"
children: []
tags:
  - llm-fundamentals
  - moe
subtree_size: 0
cards_due: 0
---

# MoE Architecture

## Claim

A MoE layer replaces the block's single FFN with $N$ parallel expert FFNs plus a router that computes gating weights and keeps only the top-$K$ (typically $K=2$ of $N=8$–64); total parameters scale with $N$ while per-token compute scales with $K$, decoupling capacity from cost.

## Reasoning

$$\text{MoE}(x) = \sum_{i=1}^{N} g_i(x)\, E_i(x), \qquad g(x) = \text{TopK}(\text{softmax}(W_r x))$$

where $E_i$ are expert FFNs and $g_i(x)$ are router gating weights, non-zero only for the top-$K$ experts. Because only $K$ of $N$ experts run per token, active parameters are a $K/N$ fraction of the FFN capacity — a model can hold, say, 671B parameters but spend only 37B of compute per token. This is why MoE models report both "total" and "active" parameter counts.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.10.1

## Cross-references

- Parent: [[Mixture-of-Experts]]
- Dense counterpart: [[Feed-Forward-Network]]
- Routing must be balanced ([[MoE-Load-Balancing]]) and trainable ([[Noisy-Top-K-Gating]])


