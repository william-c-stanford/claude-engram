---
type: zettel
id: "20260708221914968958"
title: "Sinusoidal and Learned Absolute Positional Encoding"
created: "2026-07-08"
parent_id: "20260708221914968949"
child_ids: []
tags:
  - llm-fundamentals
  - positional-encoding
---

# Sinusoidal and Learned Absolute Positional Encoding

## Claim

The two original *absolute* schemes encode position directly into the token representation — sinusoidal encoding uses fixed sine/cosine waves at geometric frequencies (zero parameters), learned absolute encoding adds a trainable per-position vector — but both are largely superseded because neither extrapolates well beyond the training length.

## Reasoning

**Sinusoidal** (original Transformer):

$$PE_{(pos, 2i)} = \sin\!\left(\frac{pos}{10000^{2i/d}}\right), \quad PE_{(pos, 2i+1)} = \cos\!\left(\frac{pos}{10000^{2i/d}}\right)$$

Each dimension oscillates at a different scale (like binary counting), and $PE_{pos+k}$ is a linear function of $PE_{pos}$, so relative offsets are in principle recoverable. Deterministic and unbounded in length, but empirically extrapolates poorly.

**Learned absolute** (GPT-2, BERT): add a trainable $E_{\text{pos}} \in \mathbb{R}^{L_{\max} \times d}$, $h_0^{(pos)} = \text{TokenEmbed}(x_{pos}) + E_{\text{pos}}[pos]$. Maximally flexible and strong at short lengths, but hard-capped at $L_{\max}$, with under-trained embeddings near the cap and $L_{\max} \times d$ extra parameters.

Both are absolute; modern models prefer relative encodings ([[RoPE]], [[ALiBi]]) for their length behavior.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.7

## Cross-references

- Parent: [[Positional-Encodings]]
- Successors: [[RoPE]] · [[ALiBi]]
