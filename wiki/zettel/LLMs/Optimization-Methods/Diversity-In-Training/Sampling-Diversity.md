---
type: zettel
address: "c-000087"
title: "Sampling Diversity"
created: "2026-07-08"
parent: "c-000089"
children: []
tags:
  - llm-fundamentals
  - diversity
  - decoding
subtree_size: 0
cards_due: 0
---

# Sampling Diversity

## Claim

Output diversity is controlled at generation time by the sampling strategy — temperature, top-$k$, top-$p$, min-$p$, and frequency/presence penalties — which is especially important for producing the varied rollouts that RLHF generation depends on ($\tau = 0.7$–1.0 is typical there).

## Reasoning

The generation-time diversity levers (each detailed in [[Decoding-Methods]]):

- **Temperature $\tau$** — $P(x_i) \propto \exp(\text{logit}_i / \tau)$; higher $\tau$ flattens the distribution → more diverse.
- **Top-$k$** — sample only from the $k$ highest-probability tokens; blocks degenerate tail tokens.
- **Top-$p$ (nucleus)** — sample from the smallest set with cumulative probability $\ge p$; adaptively wider when the model is uncertain.
- **Min-$p$** — keep tokens with $P \ge p_{\min}\cdot P_{\max}$; a more principled relative floor.
- **Frequency/presence penalty** — penalize already-emitted tokens, forcing lexical variety.

For RLHF the model must generate a spread of candidate responses to learn from, so moderate temperature and nucleus sampling are standard.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.11.1

## Cross-references

- Parent: [[Diversity-In-Training]]
- Full treatment: [[Temperature-Scaling]], [[Top-P-Sampling]], [[Min-P-Sampling]], [[Repetition-Penalties]]


