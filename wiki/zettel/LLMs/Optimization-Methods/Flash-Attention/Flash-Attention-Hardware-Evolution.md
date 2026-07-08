---
type: zettel
address: "c-000091"
title: "Flash Attention Hardware Evolution"
created: "2026-07-08"
parent: "c-000094"
children: []
tags:
  - llm-fundamentals
  - attention
  - gpu
---

# Flash Attention Hardware Evolution

## Claim

Each Flash Attention version responds to a *different* hardware bottleneck: FA2 improves parallelism on A100, FA3 exploits Hopper's async data movement (H100), and FA4 attacks Blackwell's non-matmul bottleneck — illustrating that every GPU generation shifts where the limit lies and demands new algorithmic ideas, not just recompilation.

## Reasoning

- **FA2** (A100, memory-bandwidth limited): reduces non-matmul FLOPs (Tensor Cores outrun scalar ops ~16×), adds parallelism over the query-sequence dimension, and skips fully-masked blocks in causal attention (~2× for causal).
- **FA3** (H100, data-movement limited): uses the **TMA** (Tensor Memory Accelerator) for async bulk HBM↔SRAM transfer, **warp specialization** (producer warps load, consumer warps compute), and **FP8** attention with per-block quantization. Reaches ~75% of H100 peak vs. ~35% for FA2.
- **FA4** (Blackwell B200, non-matmul-compute limited): fully asynchronous MMA pipelines, a **software-emulated exponential** (polynomial $e^x$ on Tensor Cores to avoid the slow hardware exp unit), **conditional softmax rescaling** (skip when the tile max doesn't exceed the running max), and Tensor-Memory + 2-CTA cooperative backward. Written in **CuTe-DSL** (compiles 20–30× faster than C++ CUTLASS). On B200: 1613 TFLOP/s (71% peak), 1.3× over cuDNN, 2.7× over Triton.

The general principle: identify *where* the hardware bottleneck lies (bandwidth → data movement → non-matmul compute), then co-design the kernel for it.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.6.4–1.6.6

## Cross-references

- Parent: [[Flash-Attention]]
- Base algorithm: [[Flash-Attention-Algorithm]]
