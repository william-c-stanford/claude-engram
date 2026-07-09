---
type: zettel
address: "c-000082"
title: "Temperature Scaling"
created: "2026-07-08"
parent: "c-000085"
children: []
tags:
  - llm-fundamentals
  - decoding
  - sampling
---

# Temperature Scaling

## Claim

Temperature $T$ divides the logits before softmax, reshaping the distribution: $T < 1$ sharpens it toward deterministic output, $T > 1$ flattens it toward randomness, with $T \rightarrow 0$ recovering greedy decoding and $T \rightarrow \infty$ giving uniform sampling.

## Reasoning

$$P_T(v \mid x_{<t}) = \frac{\exp(z_v / T)}{\sum_{v'} \exp(z_{v'} / T)}$$

Because dividing logits by $T$ rescales their spread, small $T$ exaggerates differences (peaky, focused) and large $T$ compresses them (flat, creative). It is applied *before* any truncation strategy (top-$k$/$p$/min-$p$). Common settings: $T = 0.7$ for factual tasks, $T = 1.0$–1.2 for creative writing, $T = 0.0$ (greedy) for code and math.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.7

## Cross-references

- Parent: [[Decoding-Methods]]
- $T\to 0$ limit: [[Greedy-Decoding]]; applied before [[Top-P-Sampling]]
