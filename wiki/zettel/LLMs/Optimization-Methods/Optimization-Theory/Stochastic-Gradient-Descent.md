---
type: zettel
address: "c-000121"
title: "Stochastic Gradient Descent"
created: "2026-07-08"
parent: "c-000123"
children: []
tags:
  - llm-fundamentals
  - optimization
---

# Stochastic Gradient Descent

## Claim

Gradient descent moves parameters against the gradient of the loss, $\theta_{t+1} = \theta_t - \eta \nabla_\theta \mathcal{L}(\theta_t)$; because computing the exact gradient over trillions of tokens is prohibitive, LLMs use **mini-batch SGD** — a noisy but unbiased gradient estimate from a small random batch.

## Reasoning

The gradient $\nabla_\theta \mathcal{L}$ points toward steepest *increase* of the loss, so descending means stepping in the opposite direction scaled by learning rate $\eta > 0$. The mini-batch estimate over batch size $B$ is

$$\nabla_\theta \mathcal{L}(\theta) \approx \frac{1}{B} \sum_{i=1}^{B} \nabla_\theta \ell(\theta; x_i)$$

with $B$ typically 1K–4M tokens. Why mini-batches work: each step costs $O(B)$ instead of $O(N_{\text{total}})$ (billions of times cheaper); the stochastic noise acts as regularization, favoring flatter minima that generalize; batches are large enough to saturate GPU parallelism; and it converges to a local minimum at rate $O(1/\sqrt{T})$ — slower per step than exact GD's $O(1/T)$, but each step is vastly cheaper.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.1

## Cross-references

- Parent: [[Optimization-Theory]]
- Why it is not enough: [[Why-SGD-Fails-For-LLMs]]
