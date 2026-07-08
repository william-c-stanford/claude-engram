---
type: zettel
address: "c-000118"
title: "Learning Rate Warmup"
created: "2026-07-08"
parent: "c-000123"
children: []
tags:
  - llm-fundamentals
  - optimization
---

# Learning Rate Warmup

## Claim

Warmup starts training with a very small learning rate and ramps it up linearly, giving Adam's second-moment estimate time to become reliable so that an unusually large first gradient cannot dominate $v_t$ and cause erratic early steps.

## Reasoning

Because $v_t$ starts at zero, bias correction at $t=1$ with $\beta_2 = 0.999$ gives $\hat{v}_1 = v_1/(1-0.999) = 1000\,v_1$, so the effective LR is already tiny; the real danger is that a large initialization-time gradient dominates the second-moment estimate and destabilizes subsequent steps. Linear warmup mitigates this:

$$\eta_t = \eta_{\max} \cdot \frac{t}{T_{\text{warmup}}}$$

Typical durations: 1–5% of total steps for pretraining, 3–10% for fine-tuning (shorter runs need proportionally more warmup); for SFT, 50–200 warmup steps is common. Warmup is also what makes Pre-Norm's high learning rates safe (see [[Pre-LN-vs-Post-LN]]).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.6

## Cross-references

- Parent: [[Optimization-Theory]]
- Second-moment source: [[Adam-Optimizer]]
- First phase of: [[Learning-Rate-Schedules]]
