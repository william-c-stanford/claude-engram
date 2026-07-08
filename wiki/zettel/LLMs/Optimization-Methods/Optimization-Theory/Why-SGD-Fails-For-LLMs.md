---
type: zettel
id: "20260708222508084718"
title: "Why Vanilla SGD Fails for LLMs"
created: "2026-07-08"
parent_id: "20260708222508084716"
child_ids: []
tags:
  - llm-fundamentals
  - optimization
---

# Why Vanilla SGD Fails for LLMs

## Claim

A single global learning rate cannot serve a transformer well because gradients vary enormously across parameters, which is why LLMs need *adaptive* optimizers that maintain a per-parameter learning rate.

## Reasoning

Four concrete failures of $\theta_{t+1} = \theta_t - \eta \nabla_\theta \mathcal{L}$:

- **Different gradient scales per layer** — early transformer layers have much smaller gradients than late ones; one $\eta$ is simultaneously too large for some parameters and too small for others.
- **Sparse gradients** — embedding rows receive gradient only for tokens in the current batch; SGD-with-momentum wastes momentum on the zero-gradient rows.
- **Saddle points** — high-dimensional landscapes are full of saddles where SGD stalls; adaptive methods escape faster.
- **LR sensitivity** — a $2\times$ change in $\eta$ can cause divergence, demanding fragile tuning.

The resolution is a per-parameter adaptive learning rate ([[Adam-Optimizer]]).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.2

## Cross-references

- Parent: [[Optimization-Theory]]
- The fix: [[Adam-Optimizer]]
