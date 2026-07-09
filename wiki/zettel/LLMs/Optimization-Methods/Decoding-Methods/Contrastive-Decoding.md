---
type: zettel
address: "c-000077"
title: "Contrastive Decoding"
created: "2026-07-08"
parent: "c-000085"
children: []
tags:
  - llm-fundamentals
  - decoding
---

# Contrastive Decoding

## Claim

Contrastive decoding scores tokens by the *difference* of log-probabilities between a strong expert model and a weak amateur model, subtracting the amateur's generic signal to amplify the expert's distinctive knowledge — improving factuality and reducing repetition at the cost of running two models.

## Reasoning

$$x_t = \arg\max_{v \in V(x_{<t})} \left[\log P_{\text{expert}}(v \mid x_{<t}) - \log P_{\text{amateur}}(v \mid x_{<t})\right]$$

restricted to a plausibility set $V(x_{<t}) = \{v : P_{\text{expert}}(v) \ge \alpha \max_{v'} P_{\text{expert}}(v')\}$ so the amateur term cannot promote implausible tokens. The amateur captures generic patterns (common words, repetition); subtracting its log-probs is like removing background noise to hear the expert's signal, leaving distinctive knowledge and reasoning. Pros: better factuality/coherence, less repetition, no training. Cons: 2× compute, sensitivity to the amateur choice, and the threshold $\alpha$ needs tuning.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.8

## Cross-references

- Parent: [[Decoding-Methods]]
- Layer-contrast analogue for hallucination: [[Model-Level-Hallucination-Detection]]
