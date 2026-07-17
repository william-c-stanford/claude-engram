---
type: zettel
address: "c-000059"
title: "LayerNorm and RMSNorm"
created: "2026-07-08"
parent: "c-000061"
children: []
tags:
  - llm-fundamentals
  - normalization
subtree_size: 0
cards_due: 0
---

# LayerNorm and RMSNorm

## Claim

LayerNorm normalizes each token's activations across the feature dimension (making it batch-size independent), and **RMSNorm** — used by all modern LLMs — drops the mean-centering and shift, normalizing only by the root-mean-square, which is 5–10% faster on GPUs at equivalent quality.

## Reasoning

**LayerNorm** on a hidden vector $x \in \mathbb{R}^d$:

$$\text{LayerNorm}(x) = \gamma \odot \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} + \beta$$

with $\mu = \frac{1}{d}\sum_i x_i$, $\sigma^2 = \frac{1}{d}\sum_i (x_i - \mu)^2$, learned per-dimension scale $\gamma$ and shift $\beta$, and $\epsilon \approx 10^{-5}$. Unlike BatchNorm it normalizes *within one example* across features, so it behaves identically in training and inference regardless of batch size.

**RMSNorm** removes the mean subtraction and the shift $\beta$:

$$\text{RMSNorm}(x) = \gamma \odot \frac{x}{\text{RMS}(x)}, \quad \text{RMS}(x) = \sqrt{\frac{1}{d}\sum_{i=1}^{d} x_i^2}$$

One fewer reduction per token, no accuracy cost — which is why Llama, Mistral, and Qwen all adopt it.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.9

## Cross-references

- Parent: [[Normalization]]
- Placement decision: [[Pre-LN-vs-Post-LN]]


