---
type: zettel
address: "c-000083"
title: "Top-k Sampling"
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

# Top-k Sampling

## Claim

Top-$k$ sampling restricts sampling to the $k$ most probable tokens and renormalizes over them, removing tail noise; but a fixed $k$ is simultaneously too restrictive for peaked distributions and too permissive for flat ones.

## Reasoning

$$P'(v \mid x_{<t}) = \begin{cases} \dfrac{P(v \mid x_{<t})}{\sum_{v' \in \text{Top-}k} P(v' \mid x_{<t})} & v \in \text{Top-}k \\ 0 & \text{otherwise} \end{cases}$$

After "The cat sat on the…" it keeps the $k$ plausible continuations ("mat", "floor", …) and drops absurd ones ("quantum"). The flaw is the *fixed* $k$: when the distribution is peaked (one token has ~99% mass), a large $k$ wastefully admits wrong answers; when flat, a small $k$ excludes plausible options. This motivates the adaptive [[Top-P-Sampling]].

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.4

## Cross-references

- Parent: [[Decoding-Methods]]
- Adaptive successor: [[Top-P-Sampling]]; relative-floor variant: [[Min-P-Sampling]]


