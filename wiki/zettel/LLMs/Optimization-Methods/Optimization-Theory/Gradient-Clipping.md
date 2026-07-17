---
type: zettel
address: "c-000116"
title: "Gradient Clipping"
created: "2026-07-08"
parent: "c-000123"
children: []
tags:
  - llm-fundamentals
  - optimization
subtree_size: 0
cards_due: 0
---

# Gradient Clipping

## Claim

Gradient clipping rescales the gradient when its global norm exceeds a threshold $\tau$ (typically 1.0), bounding update size while *preserving the gradient's direction* — unlike lowering the learning rate, which shrinks every step uniformly.

## Reasoning

$$g_t \leftarrow g_t \cdot \min\!\left(1, \frac{\tau}{\lVert g_t \rVert_2}\right)$$

Only steps whose global L2 norm exceeds `max_grad_norm` are scaled down; normal steps pass through untouched. This is the right tool for occasional large gradients (e.g. a bad batch) because it damps the spike without slowing ordinary training the way a smaller LR would. Practical notes: clipping applies to the *accumulated* gradient when using gradient accumulation; under FP16 you must unscale before clipping, or the threshold is applied to scaled gradients (see [[Mixed-Precision-Training]]).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.8

## Cross-references

- Parent: [[Optimization-Theory]]
- Interacts with: [[Mixed-Precision-Training]]


