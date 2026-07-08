---
type: zettel
id: "20260708223105938827"
title: "Text Generation: Decoding Methods"
created: "2026-07-08"
parent_id: "20260708224425985221"
child_ids:
  - "20260708223105938828"
  - "20260708223105938829"
  - "20260708223105938830"
  - "20260708223105938831"
  - "20260708223105938832"
  - "20260708223105938833"
  - "20260708223105938834"
  - "20260708223105938835"
  - "20260708223105938836"
  - "20260708223105938837"
tags:
  - llm-fundamentals
  - decoding
  - inference
---

# Text Generation: Decoding Methods

## Synthesis

At each step a trained model gives a distribution $P(x_t \mid x_{<t})$; the **decoding strategy** turns that distribution into an actual token, and this single choice profoundly shapes output quality, diversity, and coherence — the same model and prompt yield generic, creative, or distinctive text depending on it. The methods split into deterministic search (greedy, beam), truncated sampling (top-$k$, top-$p$, min-$p$, temperature), signal-sharpening (contrastive, repetition penalties), and hard-constrained (grammar) decoding.

## Practical comparison

| Method | Deterministic | Diversity | Quality | Best for |
|---|---|---|---|---|
| Greedy | Yes | None | Medium | Code, factual QA |
| Beam ($B$=4–8) | Yes | Low | High (narrow) | Translation, summarization |
| Diverse Beam | Yes | Medium | High | Candidate generation for reranking |
| Top-$k$ ($k$=50) | No | Medium | Medium | General generation |
| Top-$p$ ($p$=0.9) | No | Adaptive | High | Default for open-ended tasks |
| Min-$p$ ($p_{\min}$=0.1) | No | Adaptive | High | Robust alternative to top-$p$ |
| Contrastive | Yes | Low | Very high | Factual, coherent long-form |

## Children

- [[Greedy-Decoding]] · [[Beam-Search]] · [[Diverse-Beam-Search]]
- [[Top-K-Sampling]] · [[Top-P-Sampling]] · [[Min-P-Sampling]] · [[Temperature-Scaling]]
- [[Contrastive-Decoding]] · [[Repetition-Penalties]] · [[Constrained-Decoding]]

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12

## Cross-references

- Parent: [[Optimization-Methods]]
- Diversity lens: [[Sampling-Diversity]]
- Accelerated by [[Speculative-Decoding]]
