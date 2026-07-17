---
type: zettel
address: "c-000079"
title: "Greedy Decoding"
created: "2026-07-08"
parent: "c-000085"
children: []
tags:
  - llm-fundamentals
  - decoding
subtree_size: 0
cards_due: 0
---

# Greedy Decoding

## Claim

Greedy decoding always picks the single highest-probability token, $x_t = \arg\max_{v \in V} P(v \mid x_{<t})$ — deterministic, fast, and hyperparameter-free, but it produces repetitive, generic text and misses globally better sequences that require an early low-probability token.

## Reasoning

Choosing the locally most probable token at each step is myopic: a sequence whose best continuation starts with a slightly-lower-probability token is never found, because greedy commits to the top token immediately. It has no diversity (identical output every run) and tends toward bland, repetitive phrasing. It is the right choice when there is essentially one correct answer and determinism matters — code and factual QA. It is the $\tau \rightarrow 0$ limit of temperature sampling.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.1

## Cross-references

- Parent: [[Decoding-Methods]]
- Lookahead alternative: [[Beam-Search]]; $\tau\to 0$ limit of [[Temperature-Scaling]]


