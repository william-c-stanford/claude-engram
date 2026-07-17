---
type: zettel
address: "c-000123"
title: "Optimization Theory for LLM Training"
created: "2026-07-08"
parent: "c-000151"
children:
  - "c-000121"
  - "c-000122"
  - "c-000114"
  - "c-000115"
  - "c-000118"
  - "c-000117"
  - "c-000116"
  - "c-000119"
  - "c-000120"
tags:
  - llm-fundamentals
  - optimization
  - training
subtree_size: 9
cards_due: 0
---

# Optimization Theory for LLM Training

## Synthesis

Training an LLM is minimizing a loss $\mathcal{L}(\theta)$ over billions of parameters in an extraordinarily high-dimensional space, and the optimizer decides whether training succeeds, diverges, or stalls. The through-line: plain SGD is inadequate for transformers, so the field uses **AdamW** with a carefully shaped **learning-rate schedule** (the single most important hyperparameter), stabilized by **gradient clipping** and made affordable by **mixed-precision** arithmetic. Each child is one link in that chain.

## Children

- [[Stochastic-Gradient-Descent]] — the mini-batch gradient step and why it is used
- [[Why-SGD-Fails-For-LLMs]] — the four reasons vanilla SGD is inadequate
- [[Adam-Optimizer]] — per-parameter adaptive learning rates from gradient moments
- [[AdamW]] — decoupled weight decay, the correct fix for Adam + L2
- [[Learning-Rate-Warmup]] — why LR must ramp up from near zero
- [[Learning-Rate-Schedules]] — constant, cosine, linear, and WSD
- [[Gradient-Clipping]] — bounding update magnitude while preserving direction
- [[Mixed-Precision-Training]] — BF16/FP16, loss scaling, FP32 master weights
- [[Optimizer-Settings-By-Phase]] — the practical reference table

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5

## Cross-references

- Parent: [[Optimization-Methods]]
- Kernel-level training efficiency: [[Flash-Attention]]
- Applied in [[Pretraining]] and [[Supervised-Fine-Tuning]]


