---
type: zettel
address: "c-000112"
title: "Quantization"
created: "2026-07-08"
parent: "c-000113"
children: []
tags:
  - llm-fundamentals
  - compression
  - quantization
---

# Quantization

## Claim

Quantization maps weights (and optionally activations) from FP32/BF16 to lower-bit formats via a scale and zero-point; for inference serving, **W4A16** (4-bit weights, BF16 activations) is the sweet spot — ~2× memory savings at <1% quality loss for 70B+ models.

## Reasoning

$$x_q = \text{round}\!\left(\frac{x - z}{s}\right), \qquad x_{\text{dequant}} = s \cdot x_q + z$$

with scale $s$ and zero-point $z$. Method landscape:

| Method | Bits | Type | Key idea |
|---|---|---|---|
| GPTQ | 4 | PTQ, weight-only | Layer-wise, minimizes $\lVert WX - \hat{W}X \rVert^2$ (optimal brain surgeon) |
| AWQ | 4 | PTQ, weight-only | Protect salient weights (1% carry 99% importance) |
| GGUF | 2–8 | PTQ, weight-only | CPU-optimized (llama.cpp), per-block |
| FP8 (E4M3) | 8 | train + inference | Native H100, 2× throughput vs BF16 |
| SmoothQuant | W8A8 | PTQ, weight+act | Smooth activation outliers into weights → INT8 GEMM |
| QAT | 4 | QAT | Train with simulated quantization; best quality, expensive |
| AQLM | 2 | PTQ, additive codes | Extreme compression via learned codebooks |

When to quantize: **always for inference serving** (W4A16); **FP8 for training** on H100 (2× throughput); **GGUF Q4_K_M** for edge; and in **RLHF**, quantize the frozen reference/reward models to INT8/FP8 while keeping the policy in BF16.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.14.1

## Cross-references

- Parent: [[Model-Compression]]
- NF4 quantization underlies QLoRA: [[LoRA-Variants]]
- FP8/BF16 in training: [[Mixed-Precision-Training]]
