---
type: zettel
address: "c-000109"
title: "LoRA and Parameter-Efficient Fine-Tuning"
created: "2026-07-08"
parent: "c-000151"
children:
  - "c-000106"
  - "c-000104"
  - "c-000105"
  - "c-000107"
  - "c-000108"
tags:
  - llm-fundamentals
  - peft
  - lora
---

# LoRA and Parameter-Efficient Fine-Tuning

## Synthesis

Full fine-tuning of a 70B model needs 560+ GB (weights + gradients + optimizer states). **LoRA** sidesteps this by freezing the base weights and learning a small low-rank update — fine-tuning with <1% of the parameters at comparable quality. The topic organizes into the core low-rank insight, the $\alpha/r$ scaling that makes rank a free knob, the hyperparameter choices, the variant zoo (QLoRA, DoRA, …), and the other PEFT families LoRA displaced.

## Children

- [[LoRA-Insight]] — the frozen-weight low-rank update and why it works
- [[LoRA-Alpha-Scaling]] — the $\alpha/r$ factor and rank-independent tuning
- [[LoRA-Hyperparameters]] — rank, alpha, target modules, dropout
- [[LoRA-Variants]] — QLoRA, DoRA, LoRA+, VeRA, AdaLoRA, rsLoRA
- [[Other-PEFT-Methods]] — adapters, prefix/prompt tuning, IA3, BitFit, and why LoRA won

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.9

## Cross-references

- Parent: [[Optimization-Methods]]
- Applied during [[Supervised-Fine-Tuning]]
- Adapts the weight matrices of [[Transformer-Architecture]]
