---
type: zettel
address: "c-000062"
title: "ALiBi (Attention with Linear Biases)"
created: "2026-07-08"
parent: "c-000066"
children: []
tags:
  - llm-fundamentals
  - positional-encoding
---

# ALiBi (Attention with Linear Biases)

## Claim

ALiBi uses *no* positional embedding; instead it subtracts a static, head-specific linear penalty $m \cdot |i - j|$ from the attention scores, creating a soft recency window whose width varies by head — trivial to implement, zero parameters, and excellent length extrapolation.

## Reasoning

$$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}} - m \cdot [\,|i - j|\,]_{i,j}\right) V$$

The slope $m$ is fixed geometrically per head, $m_h = 2^{-8h/H}$ for head $h$ of $H$, so different heads get windows of different widths (multi-scale locality). Because the position signal lives purely in attention-score space, it never contaminates the token representations. **Pros:** trained at 1K, works at 8K+; zero parameters. **Cons:** weaker for tasks needing precise long-range positional reasoning ("what was the 5th word?"), and its linear-decay inductive bias does not suit every domain — RoPE has largely overtaken it. Used by BLOOM and MPT.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.7

## Cross-references

- Parent: [[Positional-Encodings]]
- Contrast: [[RoPE]]
