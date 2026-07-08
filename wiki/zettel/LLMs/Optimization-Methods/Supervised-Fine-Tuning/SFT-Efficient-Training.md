---
type: zettel
id: "20260708222835675661"
title: "SFT Efficient Training"
created: "2026-07-08"
parent_id: "20260708222835675658"
child_ids: []
tags:
  - llm-fundamentals
  - sft
  - efficiency
---

# SFT Efficient Training

## Claim

Fused-kernel libraries deliver large drop-in efficiency gains over vanilla HuggingFace training: **Liger Kernel** (Triton fusions, +20% throughput / −60% memory), **Unsloth** (custom CUDA + QLoRA, 2–5× faster / −60–70% VRAM), and **torchtune** (transparent native-PyTorch recipes) — and they are complementary.

## Reasoning

- **Liger Kernel** (LinkedIn) — Triton-fused operators: fused cross-entropy (merges the final projection, softmax, and loss into one kernel, avoiding the full `batch×seq×vocab` logit tensor), fused RMSNorm/SwiGLU/RoPE, and chunked ops. One-line integration; compatible with FSDP, DeepSpeed, LoRA.
- **Unsloth** — custom CUDA/Triton kernels plus aggressive memory optimization: manual LoRA backprop, 4-bit QLoRA with fused dequantization (trains 70B on a single 48 GB GPU), architecture-specific fusions.
- **torchtune** (Meta, wound down 2025) — composable, single-file, pure-PyTorch recipes with native `torch.compile`/FSDP2 support; maximally debuggable.

Selection: Unsloth for quick single-GPU LoRA/QLoRA; TRL/DeepSpeed + Liger for multi-GPU full fine-tunes; torchtune for research. Liger kernels can be used *inside* TRL and torchtune, so they compose.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.8.4

## Cross-references

- Parent: [[Supervised-Fine-Tuning]]
- QLoRA: [[LoRA-Variants]]; fused ops touch [[Feed-Forward-Network]] and [[RoPE]]
