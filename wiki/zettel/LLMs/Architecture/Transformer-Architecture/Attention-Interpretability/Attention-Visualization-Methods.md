---
type: zettel
address: "c-000046"
title: "Attention Visualization Methods"
created: "2026-07-08"
parent: "c-000049"
children: []
tags:
  - llm-fundamentals
  - interpretability
---

# Attention Visualization Methods

## Claim

Three visualization methods trade simplicity for faithfulness: raw attention heatmaps (per head/layer), **attention rollout** (multiply attention across layers to approximate total information flow), and **gradient-weighted attention** (combine weights with gradients to isolate tokens that actually influence the output).

## Reasoning

- **Raw attention maps** — plot the $n \times n$ matrix $A = \text{softmax}(QK^\top/\sqrt{d})$ per head and layer (tools like BertViz). Simplest, but a single layer is misleading because information also flows through residual connections.
- **Attention rollout** — approximate cumulative flow by multiplying per-layer matrices, folding in the residual: $R^{(l)} = A^{(l)} R^{(l-1)}$, $R^{(0)} = I$, with $A^{(l)} = 0.5 A^{(l)}_{\text{raw}} + 0.5 I$.
- **Gradient-weighted attention** — weight each attention value by output sensitivity, $\text{Relevance}(i) = \alpha_i \cdot \left|\frac{\partial y}{\partial h_i}\right|$, to distinguish "attended to" from "actually influential."

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.12

## Cross-references

- Parent: [[Attention-Interpretability]]
- Caveat: [[Attention-Is-Not-Explanation]]
