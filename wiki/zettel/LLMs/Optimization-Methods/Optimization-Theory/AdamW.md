---
type: zettel
address: "c-000115"
title: "AdamW"
created: "2026-07-08"
parent: "c-000123"
children: []
tags:
  - llm-fundamentals
  - optimization
subtree_size: 0
cards_due: 0
---

# AdamW

## Claim

AdamW applies weight decay *directly* to the parameters, outside Adam's adaptive scaling, giving uniform regularization; plain Adam with L2 instead scales the decay by $1/\sqrt{\hat{v}_t}$, under-regularizing high-variance weights — so LLMs should always use AdamW.

## Reasoning

With L2 regularization the loss becomes $\mathcal{L} + \tfrac{\lambda}{2}\lVert\theta\rVert^2$, so the gradient carries a $\lambda\theta_t$ term that Adam then divides by $\sqrt{\hat{v}_t}$:

$$\theta_{t+1} = \theta_t - \eta \frac{\hat{m}_t + \lambda\theta_t}{\sqrt{\hat{v}_t} + \epsilon}$$

Parameters with large gradient variance receive *less* decay — the opposite of uniform regularization. AdamW decouples the decay from the adaptive term:

$$\theta_{t+1} = \theta_t - \eta \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon} - \eta\lambda\theta_t$$

The $\eta\lambda\theta_t$ term is not divided by $\sqrt{\hat{v}_t}$, so every parameter is regularized equally regardless of gradient history. Typical $\lambda = 0.1$ for LLM training. Practical note: exclude biases and normalization weights from decay (few parameters, regularizing them hurts).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.4

## Cross-references

- Parent: [[Optimization-Theory]]
- Builds on: [[Adam-Optimizer]]
- Recommended values: [[Optimizer-Settings-By-Phase]]


