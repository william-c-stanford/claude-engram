---
type: zettel
id: "20260708221914968959"
title: "RoPE (Rotary Position Embedding)"
created: "2026-07-08"
parent_id: "20260708221914968949"
child_ids: []
tags:
  - llm-fundamentals
  - positional-encoding
---

# RoPE (Rotary Position Embedding)

## Claim

RoPE encodes position by *rotating* query and key vectors in 2D subspaces by a position-dependent angle, so their dot product depends only on the relative offset $m - n$; it adds no parameters, is compatible with KV-caching, and is the dominant choice in Llama, Qwen, and Mistral.

## Reasoning

Position $m$ rotates each 2D pair of coordinates by $m\theta_i$ with $\theta_i = 10000^{-2i/d}$. The defining property is that the rotated inner product is a function of relative position only:

$$\langle \text{RoPE}(q_m, m), \text{RoPE}(k_n, n) \rangle = f(q_m, k_n, m - n)$$

So RoPE achieves *relative* position encoding without explicit bias terms and without polluting the value stream — the rotation is applied only to Q and K. **Pros:** naturally relative, no extra parameters, works with efficient inference. **Cons:** a little extra compute per attention op, and extrapolation past the training length needs an explicit scaling strategy (see [[Long-Context-Extension]]). It has overtaken ALiBi in recent models thanks to better short-context performance.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.7

## Cross-references

- Parent: [[Positional-Encodings]]
- Extending it: [[Long-Context-Extension]]
- Contrast: [[ALiBi]]
