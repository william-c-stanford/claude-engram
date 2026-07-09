---
type: zettel
address: "c-000068"
title: "Multi-Head Attention"
created: "2026-07-08"
parent: "c-000070"
children: []
tags:
  - llm-fundamentals
  - attention
---

# Multi-Head Attention

## Claim

Multi-head attention runs $H$ attention functions in parallel over $d_k = d/H$-dimensional projections and concatenates them, letting different heads specialize (syntax, semantics, position); **Grouped-Query Attention** (GQA) then shares a few KV heads across many query heads to shrink the KV cache with minimal quality loss.

## Reasoning

$$\text{MultiHead}(X) = \text{Concat}(\text{head}_1, \dots, \text{head}_H) W_O$$

Each head attends independently, so the model can attend to several relationship types at once rather than averaging them into a single pattern.

**GQA** decouples the number of query heads from KV heads: Llama-3 uses 8 KV heads shared across 32 query heads, cutting the KV cache $4\times$ (see [[Attention-Quadratic-Cost]] on why KV memory is the inference bottleneck) with negligible quality loss. This is why nearly every recent model in the [[Model-Size-Reference]] reports 8 KV heads. DeepSeek-V3's MLA is an alternative that compresses KV into a low-rank latent instead.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.6

## Cross-references

- Parent: [[Self-Attention]]
- Which heads specialize: [[Attention-Head-Roles]]
