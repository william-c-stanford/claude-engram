---
type: zettel
address: "c-000139"
title: "Eagle"
created: "2026-07-08"
parent: "c-000144"
children: []
tags:
  - llm-fundamentals
  - speculative-decoding
subtree_size: 0
cards_due: 0
---

# Eagle

## Claim

Eagle drafts with a lightweight autoregressive decoder that runs on the target model's last-layer hidden states, so each draft token conditions on the previous ones — capturing the inter-token dependencies Medusa misses and raising acceptance from Medusa's 60–80% to 85–95%.

## Reasoning

The fix for Medusa's independence problem: (1) extract hidden states from the target's last layer; (2) feed them into a small (1-layer) decoder that *autoregressively* generates draft tokens conditioned on previous hidden states; (3) this captures the dependency that the token at $t+2$ depends on the token at $t+1$. Operating at the *feature* (hidden-state) level rather than the token level is what gives higher-quality drafts and the jump in acceptance rate. Eagle-2 extends this with a dynamic, confidence-based draft tree for state-of-the-art acceptance (3–4× speedup).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.15.4

## Cross-references

- Parent: [[Speculative-Decoding]]
- The method it improves: [[Medusa]]


