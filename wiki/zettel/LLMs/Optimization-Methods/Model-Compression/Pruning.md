---
type: zettel
address: "c-000111"
title: "Pruning"
created: "2026-07-08"
parent: "c-000113"
children: []
tags:
  - llm-fundamentals
  - compression
  - pruning
subtree_size: 0
cards_due: 0
---

# Pruning

## Claim

Pruning exploits LLM over-parameterization by selectively removing weights; unstructured pruning zeroes individual weights (50–90% sparsity, needs sparse kernels), structured pruning removes whole heads/layers/neurons (direct FLOP savings), and NVIDIA 2:4 sparsity gives a hardware-accelerated exact 2× speedup.

## Reasoning

Unlike quantization (which lowers precision of *all* weights uniformly), pruning *eliminates* weights, and it composes multiplicatively with quantization (a 50%-sparse 4-bit model uses 4× less memory than dense BF16). Approaches:

- **Unstructured** — zero individual weights below a threshold; high sparsity possible but needs sparse GEMM kernels (2:4 on A100/H100).
- **Structured** — remove entire attention heads, layers, or FFN neurons; directly cuts FLOPs without special kernels.
- **SparseGPT** — one-shot pruning via approximate inverse Hessian; 50% unstructured sparsity with minimal loss on 175B models.
- **Wanda** — prune by $|w| \cdot \lVert x \rVert$ (weight magnitude × input activation norm); no calibration data, competitive with SparseGPT.

**NVIDIA 2:4** structured sparsity: at most 2 non-zero of every 4 elements, giving exactly 2× hardware speedup — but it requires *exactly* 50% sparsity in that pattern, limiting flexibility.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.14.2

## Cross-references

- Parent: [[Model-Compression]]
- Which heads are safe to prune: [[Attention-Head-Roles]]


