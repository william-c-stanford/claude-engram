---
type: zettel
address: "c-000090"
title: "Flash Attention Algorithm"
created: "2026-07-08"
parent: "c-000094"
children: []
tags:
  - llm-fundamentals
  - attention
  - efficiency
subtree_size: 0
cards_due: 0
---

# Flash Attention Algorithm

## Claim

Flash Attention tiles $Q$, $K$, $V$ into SRAM-sized blocks and, in a nested loop, computes each attention tile $S_{ij}$ in SRAM, applies the online-softmax update, and writes back only the output/statistics — so the $n \times n$ matrix is never stored in HBM, cutting HBM memory to $O(n)$ at identical FLOPs.

## Reasoning

For SRAM size $M$, block sizes $B_r = \lceil M/4d \rceil$ and $B_c = \min(\lceil M/4d \rceil, d)$:

1. Split $Q$ into $T_r = \lceil n/B_r \rceil$ blocks; split $K, V$ into $T_c = \lceil n/B_c \rceil$ blocks.
2. Keep output $O$, running max $m$, running sum $\ell$ in HBM.
3. **Outer loop** over $j$: load $K_j, V_j$ into SRAM.
4. **Inner loop** over $i$: load $Q_i, O_i, m_i, \ell_i$; compute $S_{ij} = Q_i K_j^\top / \sqrt{d}$ *in SRAM*; apply the online-softmax update; write $O_i, m_i, \ell_i$ back.

The tile $S_{ij}$ is computed and discarded in SRAM, never written to HBM.

| | Standard | Flash |
|---|---|---|
| HBM memory | $O(n^2)$ | $O(n)$ |
| HBM reads/writes | $O(n^2 d)$ | $O(n^2 d / M)$ |
| FLOPs | $O(n^2 d)$ | $O(n^2 d)$ (same) |
| Speedup | 1× | 2–4× |

Forward FLOPs are unchanged — the speedup comes entirely from slashing HBM traffic. The backward pass does *more* FLOPs (recomputation) but is still faster because saved bandwidth dominates.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.6.3

## Cross-references

- Parent: [[Flash-Attention]]
- Softmax recurrence: [[Tiling-And-Online-Softmax]]
- Hardware-specific versions: [[Flash-Attention-Hardware-Evolution]]


