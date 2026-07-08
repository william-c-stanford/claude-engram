---
type: zettel
address: "c-000092"
title: "Standard Attention Memory Problem"
created: "2026-07-08"
parent: "c-000094"
children: []
tags:
  - llm-fundamentals
  - attention
  - efficiency
---

# Standard Attention Memory Problem

## Claim

The bottleneck in standard attention is not arithmetic but memory: the $n \times n$ score matrix ($O(n^2)$) is too large for SRAM, so it must be written to slow HBM, read back for softmax, and read again for the $PV$ product — three HBM round-trips whose bandwidth cost dominates runtime.

## Reasoning

For $\text{Attention}(Q,K,V) = \text{softmax}(QK^\top/\sqrt{d_k})V$ with sequence length $n$ and head dim $d$:

- $Q, K, V \in \mathbb{R}^{n \times d}$: $O(nd)$ memory
- $S = QK^\top \in \mathbb{R}^{n \times n}$: $O(n^2)$ — the bottleneck
- $P = \text{softmax}(S) \in \mathbb{R}^{n \times n}$: another $O(n^2)$
- $O = PV \in \mathbb{R}^{n \times d}$: $O(nd)$

At $n = 8192$, $d = 128$, BF16, the attention matrix is $\approx 134$ MB per head — $\times 32$ heads $= 4.3$ GB for one layer's scores. At $n = 32768$ it is $\approx 2$ GB *per head*, infeasible to store. Because the matrix does not fit in SRAM, every softmax step incurs slow HBM traffic.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.6.1

## Cross-references

- Parent: [[Flash-Attention]]
- The solution: [[Tiling-And-Online-Softmax]]
- Broader taxonomy: [[Attention-Quadratic-Cost]]
