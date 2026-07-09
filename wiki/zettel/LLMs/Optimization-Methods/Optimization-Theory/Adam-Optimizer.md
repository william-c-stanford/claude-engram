---
type: zettel
address: "c-000114"
title: "Adam Optimizer"
created: "2026-07-08"
parent: "c-000123"
children: []
tags:
  - llm-fundamentals
  - optimization
---

# Adam Optimizer

## Claim

Adam gives each parameter its own effective learning rate by tracking exponential moving averages of the gradient (first moment $m_t$) and squared gradient (second moment $v_t$), dividing the step by $\sqrt{\hat{v}_t}$ so consistently large-gradient parameters get smaller steps and small-gradient parameters get larger ones.

## Reasoning

Given $g_t = \nabla_\theta \mathcal{L}(\theta_t)$:

$$m_t = \beta_1 m_{t-1} + (1-\beta_1) g_t, \qquad v_t = \beta_2 v_{t-1} + (1-\beta_2) g_t^2$$

$$\hat{m}_t = \frac{m_t}{1-\beta_1^t}, \qquad \hat{v}_t = \frac{v_t}{1-\beta_2^t}, \qquad \theta_{t+1} = \theta_t - \eta \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}$$

Role of each term: $m_t$ is momentum (smooths noisy gradients; $\beta_1 = 0.9$ weights history 90%); $v_t$ gives the adaptive per-parameter LR $\eta/\sqrt{v_t}$ that handles differing gradient scales; **bias correction** $\hat{m}_t, \hat{v}_t$ fixes the fact that at $t=1$ the EMAs start near zero and would otherwise make early steps too small; $\epsilon$ prevents division by zero and floors the effective LR. Typical values: $\beta_1 = 0.9$, $\beta_2 = 0.95$ or $0.999$, $\epsilon = 10^{-8}$, $\eta = 10^{-4}$ to $10^{-5}$.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.3

## Cross-references

- Parent: [[Optimization-Theory]]
- The LLM-correct variant: [[AdamW]]
- Bias-correction motivates [[Learning-Rate-Warmup]]
