---
type: zettel
address: "c-000127"
title: "Pretraining Objective"
created: "2026-07-08"
parent: "c-000129"
children: []
tags:
  - llm-fundamentals
  - pretraining
subtree_size: 0
cards_due: 0
---

# Pretraining Objective

## Claim

All modern decoder-only LLMs pretrain with a single objective — **causal language modeling** (next-token prediction) — and, given enough data and scale, this one objective produces emergent capabilities (in-context learning, reasoning, instruction following) without any explicit supervision.

## Reasoning

$$\mathcal{L}_{\text{CLM}} = -\frac{1}{T} \sum_{t=1}^{T} \log P_\theta(x_t \mid x_{<t})$$

The remarkable empirical fact is that this simple self-supervised loss, scaled up, does not merely learn surface statistics: capabilities that were never directly trained for *emerge* as a byproduct of predicting the next token over a sufficiently large and diverse corpus. This is the foundation on which SFT and RLHF later build.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.7.1

## Cross-references

- Parent: [[Pretraining]]
- Same loss, computed on all tokens: [[Language-Modeling-Head]]
- Response-masked version: [[SFT-Objective]]


