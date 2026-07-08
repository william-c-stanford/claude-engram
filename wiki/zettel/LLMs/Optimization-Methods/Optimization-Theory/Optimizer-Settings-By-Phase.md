---
type: zettel
id: "20260708222508084725"
title: "Optimizer Settings by Phase"
created: "2026-07-08"
parent_id: "20260708222508084716"
child_ids: []
tags:
  - llm-fundamentals
  - optimization
  - reference
---

# Optimizer Settings by Phase

## Claim

Across pretraining, SFT, and LoRA the optimizer is AdamW with $\beta_1=0.9$, $\beta_2=0.95$, $\epsilon=10^{-8}$, `max_grad_norm`$=1.0$, and BF16; what changes per phase is the learning rate, weight decay, and warmup — and getting the learning rate right matters more than any other hyperparameter.

## Reasoning

| Phase | LR | Weight decay | Warmup | Schedule |
|---|---|---|---|---|
| Pretraining | 3e-4 | 0.1 | 2000 steps | WSD or Cosine |
| SFT | 2e-5 | 0.01 | 100 steps | Cosine |
| LoRA SFT | 2e-4 | 0.01 | 100 steps | Cosine |

LoRA uses a *higher* LR than full fine-tuning because only the adapter weights update. Diagnosing LR from the loss curve: diverging (rises after initial drop) → LR too high; slow plateau → too low; oscillating → LR too high or warmup too short. Batch size is the second most important knob (it sets gradient noise and, via the linear scaling rule, the effective LR); everything else is secondary. RL learning rates are covered separately in the book's RL chapter.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.5, §1.5.10

## Cross-references

- Parent: [[Optimization-Theory]]
- [[AdamW]] · [[Learning-Rate-Schedules]] · [[Gradient-Clipping]] · [[Mixed-Precision-Training]]
