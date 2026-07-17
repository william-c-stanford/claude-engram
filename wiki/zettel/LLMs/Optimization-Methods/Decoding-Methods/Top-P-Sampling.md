---
type: zettel
address: "c-000084"
title: "Top-p (Nucleus) Sampling"
created: "2026-07-08"
parent: "c-000085"
children: []
tags:
  - llm-fundamentals
  - decoding
  - sampling
subtree_size: 0
cards_due: 0
---

# Top-p (Nucleus) Sampling

## Claim

Top-$p$ (nucleus) sampling draws from the smallest set of top tokens whose cumulative probability reaches $p$, so the candidate pool automatically shrinks when the model is confident and expands when it is uncertain — the widely-used default ($p = 0.9$–0.95), and strictly more adaptive than top-$k$.

## Reasoning

$$\text{Top-}p = \min\left\{ S \subseteq V : \sum_{v \in S} P(v \mid x_{<t}) \ge p \right\}$$

tokens are sorted by descending probability and added until the cumulative mass reaches $p$. After "2 + 2 =" the nucleus is a single token ("4"); after "I enjoy eating" it expands to dozens of plausible foods — matching the actual uncertainty, which a fixed top-$k$ cannot. Downsides: it can still admit low-quality tokens at the nucleus tail, and $p$ is a single global threshold. In practice top-$p$ and top-$k$ are often combined (sample from their intersection).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.5

## Cross-references

- Parent: [[Decoding-Methods]]
- Fixed-size counterpart: [[Top-K-Sampling]]; relative floor: [[Min-P-Sampling]]


