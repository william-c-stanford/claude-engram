---
type: zettel
address: "c-000107"
title: "LoRA Variants"
created: "2026-07-08"
parent: "c-000109"
children: []
tags:
  - llm-fundamentals
  - lora
subtree_size: 0
cards_due: 0
---

# LoRA Variants

## Claim

A family of LoRA refinements trade off memory, quality, and rank behavior: **QLoRA** (4-bit base) makes 70B trainable on one 48 GB GPU, **DoRA** decomposes magnitude/direction for +1–3% quality, **LoRA+** uses a higher LR on $B$ for a free ~2% gain, and **VeRA** freezes shared random $A,B$ for ~10× fewer parameters.

## Reasoning

| Variant | Innovation | When |
|---|---|---|
| QLoRA | 4-bit NF4 base + double quantization; LoRA in BF16 | Fine-tune 70B on one 48 GB GPU |
| DoRA | Decompose $W$ into magnitude + direction; LoRA on direction only | Better reasoning generalization |
| LoRA+ | $\eta_B = \lambda\eta_A$, $\lambda \approx 16$ | Free ~2% gain, one-line change |
| AdaLoRA | SVD-based dynamic rank budget across layers | Very tight compute budgets |
| rsLoRA | Scale by $\alpha/\sqrt{r}$ | When $r \ge 64$ |
| VeRA | Shared frozen random $A,B$; train only diagonal scalings | Extreme param efficiency (hundreds of adapters) |
| LoRA-FA | Freeze $A$ after init, train only $B$ | Memory-constrained |

**QLoRA memory** for a 70B model ($r=16$, all linear layers): NF4 base $\approx$ 35 GB + adapters ~160 MB + optimizer ~320 MB + activations ~8 GB $\approx$ **44 GB**, versus 560 GB for full fine-tuning. **DoRA** applies LoRA only to the direction, $W' = m \odot \frac{W + BA}{\lVert W + BA \rVert_c}$, with magnitude $m$ a separate learnable per-column vector — matching the observation that full FT changes direction more than magnitude. **VeRA** freezes $A,B$ as shared random matrices and trains only diagonal vectors $d_b, d_a$: $\Delta W = B\,\text{diag}(d_b)\,A\,\text{diag}(d_a)$, ~10× fewer params at 90–95% of LoRA quality.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.9.3

## Cross-references

- Parent: [[LoRA-And-PEFT]]
- rsLoRA scaling: [[LoRA-Alpha-Scaling]]; QLoRA in Unsloth: [[SFT-Efficient-Training]]; NF4 quantization: [[Quantization]]


