---
type: zettel
id: "20260708221914968956"
title: "Attention Quadratic Cost"
created: "2026-07-08"
parent_id: "20260708221914968948"
child_ids: []
tags:
  - llm-fundamentals
  - attention
  - efficiency
---

# Attention Quadratic Cost

## Claim

Naive attention costs $O(n^2 d)$ time and $O(n^2)$ memory because the full $n \times n$ score matrix must be materialized for softmax; this quadratic scaling is the fundamental long-context bottleneck, addressed by five families of solutions.

## Reasoning

Computing $QK^\top$ is $n^2$ dot products; the resulting matrix must be held in memory to normalize it. At 128K tokens the attention matrix alone is $128\text{K} \times 128\text{K} = 16.4$ billion entries (64 GB in FP32) — it exceeds a single GPU's HBM, and 1M tokens would need 4 TB.

The five families that tame it:

1. **Exact, IO-aware** ([[Flash-Attention]]): same FLOPs, but tiles the computation so the $n \times n$ matrix is never materialized in HBM. An *execution engine*, orthogonal to the sparse patterns below.
2. **Sliding-window / local**: attend only to the $w$ nearest tokens → $O(n \cdot w)$ (Mistral $w=4096$, Longformer).
3. **Sparse patterns**: local windows plus periodic global tokens (BigBird, LongT5), $\approx O(n\sqrt{n})$.
4. **Linear attention / state-space models**: reorder with associativity or use a recurrence (Mamba, RWKV), $O(n d^2)$ — but softmax-free attention is less expressive and lags on precise long-range retrieval.
5. **KV-cache compression**: evict or compress old KV pairs at inference (H2O, StreamingLLM, quantized caches).

Crucially, FlashAttention *composes* with families 2–3 — production stacks run a sliding-window or block-sparse mask *inside* a FlashAttention kernel, getting both fewer FLOPs and optimal memory access.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.5 (Computational Complexity)

## Cross-references

- Parent: [[Self-Attention]]
- Deep dive on family 1: [[Flash-Attention]]
- KV-cache reduction via heads: [[Multi-Head-Attention]]
