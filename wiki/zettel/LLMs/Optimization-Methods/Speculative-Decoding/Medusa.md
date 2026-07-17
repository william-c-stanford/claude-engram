---
type: zettel
address: "c-000140"
title: "Medusa"
created: "2026-07-08"
parent: "c-000144"
children: []
tags:
  - llm-fundamentals
  - speculative-decoding
subtree_size: 0
cards_due: 0
---

# Medusa

## Claim

Medusa adds $k$ extra prediction heads to the target model (head $i$ predicts the token at position $t+i+1$), all running in parallel in one forward pass with tree-structured verification; only the tiny heads are trained (backbone frozen, ~1 epoch), so memory overhead is <1% and no separate draft model is needed.

## Reasoning

Each Medusa head is one linear layer sharing the backbone: head 0 is the standard next-token head, head 1 predicts $t+2$, head $i$ predicts $t+i+1$. Because all heads emit in a single pass, the model proposes several future tokens at once, and a tree-structured verification validates multiple candidate sequences simultaneously. Its limitation — which motivates Eagle — is that the heads predict *independently*: the head for $t+2$ cannot condition on what the $t+1$ head predicted, so it misses inter-token dependencies, giving a lower 60–80% acceptance rate.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.15.3

## Cross-references

- Parent: [[Speculative-Decoding]]
- Improves on Medusa's independence flaw: [[Eagle]]


