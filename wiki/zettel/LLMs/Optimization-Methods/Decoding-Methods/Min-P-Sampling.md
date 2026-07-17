---
type: zettel
address: "c-000080"
title: "Min-p Sampling"
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

# Min-p Sampling

## Claim

Min-$p$ sampling keeps only tokens whose probability is at least $p_{\min}$ times the top token's probability, so the pool scales naturally with model confidence — fewer degenerate samples than top-$p$ on peaked distributions, with a single intuitive parameter.

## Reasoning

$$\text{Min-}p = \left\{ v \in V : P(v \mid x_{<t}) \ge p_{\min} \cdot \max_{v'} P(v' \mid x_{<t}) \right\}$$

"Only consider tokens at least $p_{\min}$ (e.g. 10%) as likely as the best token." If the top token has probability 0.8, only tokens above 0.08 survive; if the model is very uncertain (top token 0.05), the floor drops to 0.005 and the pool naturally widens. This *relative* floor is more principled than top-$k$'s fixed count or top-$p$'s cumulative threshold. Caveat: it is newer and not yet standard in every inference framework.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.6

## Cross-references

- Parent: [[Decoding-Methods]]
- Compared against: [[Top-P-Sampling]] · [[Top-K-Sampling]]


