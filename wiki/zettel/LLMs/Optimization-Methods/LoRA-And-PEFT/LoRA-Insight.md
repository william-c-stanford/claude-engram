---
type: zettel
address: "c-000106"
title: "LoRA Insight"
created: "2026-07-08"
parent: "c-000109"
children: []
tags:
  - llm-fundamentals
  - lora
---

# LoRA Insight

## Claim

Instead of updating a full weight matrix, LoRA freezes $W$ and learns a low-rank perturbation $\frac{\alpha}{r}BA$; because fine-tuning empirically operates in a very low-dimensional subspace (low "intrinsic dimensionality"), a small rank $r$ captures nearly all the task-specific update at a tiny fraction of the parameters.

## Reasoning

$$W' = W + \frac{\alpha}{r} BA, \qquad B \in \mathbb{R}^{d \times r}, \ A \in \mathbb{R}^{r \times d}$$

$W$ is frozen (no gradients, no optimizer states); only $A$ and $B$ train, costing $2dr$ parameters instead of $d^2$. At $r = 16$, $d = 4096$, LoRA adds $2 \times 4096 \times 16 = 131\text{K}$ params per layer versus 16.8M for the full matrix. Aghajanyan et al. showed the intrinsic dimensionality of a fine-tuning task is far below the model's parameter count (a 175B model's task may have intrinsic dimension <10,000), so constraining the update to an $r$-dimensional subspace loses little. At inference $BA$ can be merged into $W$ for zero overhead.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.9.1

## Cross-references

- Parent: [[LoRA-And-PEFT]]
- The scaling factor: [[LoRA-Alpha-Scaling]]
