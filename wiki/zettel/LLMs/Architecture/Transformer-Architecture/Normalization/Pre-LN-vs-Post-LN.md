---
type: zettel
address: "c-000060"
title: "Pre-LN vs Post-LN"
created: "2026-07-08"
parent: "c-000061"
children: []
tags:
  - llm-fundamentals
  - normalization
subtree_size: 0
cards_due: 0
---

# Pre-LN vs Post-LN

## Claim

Placing normalization *before* each sublayer (**Pre-LN**, $h + \text{SubLayer}(\text{LN}(h))$) rather than after it (**Post-LN**, the original $h + \text{LN}(\text{SubLayer}(h))$) stabilizes training and enables higher learning rates without warmup — which is why every modern LLM uses Pre-LN.

## Reasoning

- **Post-LN** (original Transformer): the residual stream itself is normalized each block, which can make early training unstable and typically demands a careful learning-rate warmup.
- **Pre-LN** (GPT-2 onward, Llama, Mistral): normalization is applied to the sublayer's input while the residual path stays un-normalized, preserving a clean identity highway from input to output. This keeps gradients well-scaled through depth and removes the warmup requirement.

Deep networks need this because, without normalization, activation magnitudes drift exponentially across layers — a 128-layer transformer could see a $10^{30}\times$ magnitude difference between its first and last layer. Constraining each layer's output to a predictable range is what lets the optimizer use one consistent learning rate throughout.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.9 (Pre-LN vs Post-LN)

## Cross-references

- Parent: [[Normalization]]
- Assumed by: [[Decoder-Only-Block]]
- Warmup detail: [[Learning-Rate-Warmup]]


