---
type: zettel
address: "c-000078"
title: "Diverse Beam Search"
created: "2026-07-08"
parent: "c-000085"
children: []
tags:
  - llm-fundamentals
  - decoding
---

# Diverse Beam Search

## Claim

Standard beam search produces near-duplicate beams; diverse beam search partitions beams into $G$ groups and subtracts a dissimilarity penalty between groups, yielding genuinely different candidate sequences at the cost of some per-beam quality and extra hyperparameters.

## Reasoning

$$\text{score}_g(y_t) = \log P(y_t \mid y_{<t}) - \lambda \sum_{g' < g} \Delta(y_t, Y_{g'})$$

where $\Delta$ measures overlap (e.g. Hamming diversity) with tokens already chosen by earlier groups and $\lambda$ controls diversity strength — like forcing each subgroup in a brainstorm to avoid what earlier subgroups said. This is useful for producing distinct candidates to feed a reranking pipeline. Costs: the diversity penalty can degrade individual beam quality, and it adds hyperparameters ($G$, $\lambda$).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.3

## Cross-references

- Parent: [[Decoding-Methods]]
- Base method: [[Beam-Search]]
