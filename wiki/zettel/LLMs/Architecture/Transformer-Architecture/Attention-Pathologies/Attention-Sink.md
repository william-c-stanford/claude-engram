---
type: zettel
address: "c-000052"
title: "Attention Sink"
created: "2026-07-08"
parent: "c-000053"
children: []
tags:
  - llm-fundamentals
  - attention
---

# Attention Sink

## Claim

Transformers route disproportionate attention (often 20–50% of total mass) to the *first token* regardless of its meaning, because softmax must produce a valid distribution and needs a default "dump" location for otherwise-irrelevant attention — the first token becomes that no-op sink.

## Reasoning

Softmax forces $\sum_j \alpha_j = 1$, so when no key is relevant the model must still place its mass somewhere. The always-present, positionally-predictable first token becomes the learned default:

$$\alpha_{\text{sink}} = \frac{\exp(q \cdot k_0 / \sqrt{d})}{\sum_j \exp(q \cdot k_j / \sqrt{d})} \approx \frac{1}{n}, \quad \text{even when } k_0 \text{ is meaningless}$$

**Consequences:** evicting the first token from a sliding-window KV cache spikes perplexity (the model loses its sink); naive attention maps make the first token look "important" when it is an artifact; and the sink wastes a KV-cache slot. **Solutions:** StreamingLLM keeps the first $k$ tokens permanently alongside the recent window (enabling bounded-memory infinite generation); some models train dedicated sink tokens; softmax alternatives (ReLU/sigmoid attention) let zero attention be representable without a dump target.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.11 (Attention Sink)

## Cross-references

- Parent: [[Attention-Pathologies]]
- StreamingLLM also appears under [[Long-Context-Extension]] (KV-cache strategies)
