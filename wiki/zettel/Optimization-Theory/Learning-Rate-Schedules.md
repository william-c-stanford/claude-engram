---
type: zettel
id: "20260708222508084722"
title: "Learning Rate Schedules"
created: "2026-07-08"
parent_id: "20260708222508084716"
child_ids: []
tags:
  - llm-fundamentals
  - optimization
---

# Learning Rate Schedules

## Claim

After warmup, the learning rate is annealed by a schedule; cosine decay is the classic standard, but **Warmup-Stable-Decay (WSD)** has become the pretraining default because its long constant phase permits checkpointing and resuming, with the decay applied only in the final 10–20% of any run.

## Reasoning

The main options (all preceded by linear warmup):

- **Constant** — simplest; good for short fine-tunes, but no annealing risks not reaching the sharpest minimum.
- **Cosine decay** — $\eta_t = \eta_{\min} + \tfrac{1}{2}(\eta_{\max}-\eta_{\min})\left(1 + \cos\!\left(\frac{t - T_{\text{warmup}}}{T - T_{\text{warmup}}}\pi\right)\right)$, with $\eta_{\min} \approx \eta_{\max}/10$; smooth, standard for pretraining and SFT.
- **Linear decay** — simpler, similar empirical results, predictable LR at any step.
- **WSD** — three phases: linear warmup (1–5%), constant $\eta_{\max}$ for the bulk, then fast cosine/linear decay to $\eta_{\min}$ (last 10–20%). The stable phase decouples "how long to train" from "when to decay."
- **Cosine with restarts (SGDR)** — periodic resets to $\eta_{\max}$; rare for LLMs.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.7

## Cross-references

- Parent: [[Optimization-Theory]]
- First phase: [[Learning-Rate-Warmup]]
- Per-phase values: [[Optimizer-Settings-By-Phase]]
