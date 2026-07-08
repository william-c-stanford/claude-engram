---
type: zettel
id: "20260708221914968974"
title: "Value Head"
created: "2026-07-08"
parent_id: "20260708221914968971"
child_ids: []
tags:
  - llm-fundamentals
  - reinforcement-learning
---

# Value Head

## Claim

For RL (PPO/GRPO) the model needs a scalar estimate of how good a state is, so the value head replaces the vocabulary projection with a linear regression to $\mathbb{R}$ trained by MSE against observed returns — and it must be initialized near zero to avoid destabilizing early PPO updates.

## Reasoning

$$V(s_t) = w_{\text{value}}^\top h_t + b \in \mathbb{R}, \qquad w_{\text{value}} \in \mathbb{R}^d$$

Trained with $\mathcal{L}_V = \frac{1}{T}\sum_t (V(s_t) - R_t)^2$. The architecture is a linear layer $\mathbb{R}^d \rightarrow \mathbb{R}^1$ (sometimes a small MLP $d \rightarrow 256 \rightarrow 1$); the backbone is often shared with the policy (separate value head) or a fully separate critic. It is used for PPO advantage estimation (GAE).

**Initialization matters:** if the final layer starts with large weights, initial value estimates are wildly wrong, producing huge advantages and unstable updates. Common practice is $\mathcal{N}(0, 1/\sqrt{d})$ or zeros.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.4.3

## Cross-references

- Parent: [[Prediction-Heads]]
- Scalar sibling: [[Reward-Head]]
