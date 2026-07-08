---
type: zettel
address: "c-000094"
title: "Flash Attention"
created: "2026-07-08"
parent: "c-000151"
children:
  - "c-000092"
  - "c-000093"
  - "c-000090"
  - "c-000091"
tags:
  - llm-fundamentals
  - attention
  - efficiency
---

# Flash Attention

## Synthesis

Flash Attention computes *exactly* standard attention but restructures its memory access so the GPU's fast SRAM does the work, cutting the HBM footprint from $O(n^2)$ to $O(n)$ and delivering 2–4× wall-clock gains. The idea rests on one trick — never materialize the full score matrix, using an online-softmax recurrence to accumulate the output block by block — and its successive versions (FA2/3/4) track how each new GPU generation shifts the hardware bottleneck. The children build this up from the problem to the algorithm to the hardware story.

## Children

- [[Standard-Attention-Memory-Problem]] — why $O(n^2)$ HBM traffic is catastrophic
- [[Tiling-And-Online-Softmax]] — the block-wise softmax recurrence that avoids the full matrix
- [[Flash-Attention-Algorithm]] — the tiled forward pass and its complexity
- [[Flash-Attention-Hardware-Evolution]] — FA2/3/4 and hardware–software co-evolution

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.6

## Cross-references

- Parent: [[Optimization-Methods]]
- The bottleneck it solves: [[Attention-Quadratic-Cost]]
- Composes with sparse masks under [[Self-Attention]]
