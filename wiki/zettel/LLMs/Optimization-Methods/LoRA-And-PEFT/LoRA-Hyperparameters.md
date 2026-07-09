---
type: zettel
address: "c-000105"
title: "LoRA Hyperparameters"
created: "2026-07-08"
parent: "c-000109"
children: []
tags:
  - llm-fundamentals
  - lora
  - reference
---

# LoRA Hyperparameters

## Claim

Start LoRA at rank 16 with `lora_alpha` $= r$ or $2r$, targeting all attention projections (add the FFN projections for full coverage), `lora_dropout` 0.0–0.1, no bias training, and a learning rate of 1e-4 to 3e-4 — higher than full fine-tuning because only the adapters update.

## Reasoning

| Hyperparameter | Typical | Guidance |
|---|---|---|
| $r$ (rank) | 8, 16, 32, 64 | Higher = more capacity + memory. Start at 16. |
| `lora_alpha` | 16, 32 (= $r$ or $2r$) | Controls magnitude via $\alpha/r$. |
| `target_modules` | q/k/v/o_proj | Add gate/up/down_proj for full coverage. |
| `lora_dropout` | 0.0–0.1 | ~0.05 for small datasets. |
| `bias` | "none" | Training biases rarely helps. |
| LR | 1e-4–3e-4 | Higher than full FT. |

**Rank selection:** $r=8$ for simple single-domain tasks; $r=16$ general default; $r=32$–$64$ for complex tasks (math, code, multi-turn) approaching full-FT quality; $r=128+$ hits diminishing returns (prefer full FT or high-rank QLoRA). Key indicator: if training loss plateaus well above the full-FT loss, increase rank.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.9.2

## Cross-references

- Parent: [[LoRA-And-PEFT]]
- Scaling knob: [[LoRA-Alpha-Scaling]]; LR context: [[Optimizer-Settings-By-Phase]]
