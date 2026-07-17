---
type: zettel
address: c-000073
title: Architecture
created: 2026-07-08
parent: c-000152
children:
  - c-000044
  - c-000072
  - c-000031
  - c-000026
tags:
  - llm-fundamentals
  - architecture
subtree_size: 51
cards_due: 139
---

# Architecture

## Synthesis

Architecture is what an LLM *is* — the static computational structure a token flows through, independent of how the model is trained or served. It runs in sequence: tokenization turns text into integer symbols, the transformer stack mixes and transforms their embeddings, and a prediction head reads out the answer; Mixture-of-Experts is the one structural variant here, replacing the dense feed-forward block with sparsely-activated experts to scale capacity without scaling per-token compute.

## Children

- [[Tokenization]] — text → discrete integer symbols the model operates on
- [[Transformer-Architecture]] — the stacked attention + FFN substrate of every LLM
- [[Prediction-Heads]] — turning hidden states into task-specific outputs
- [[Mixture-of-Experts]] — sparsely-activated expert FFNs that scale capacity, not compute

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2–1.4, §1.10

## Cross-references

- Parent: [[LLMs]]
- Sibling: [[Optimization-Methods]] (what you *do* to this structure)


