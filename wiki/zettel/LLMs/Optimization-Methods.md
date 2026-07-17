---
type: zettel
address: "c-000151"
title: "Optimization Methods"
created: "2026-07-08"
parent: "c-000152"
children:
  - "c-000123"
  - "c-000094"
  - "c-000129"
  - "c-000150"
  - "c-000109"
  - "c-000089"
  - "c-000085"
  - "c-000138"
  - "c-000113"
  - "c-000144"
  - "c-000097"
  - "c-000103"
tags:
  - llm-fundamentals
  - optimization
  - methods
subtree_size: 76
cards_due: 0
---

# Optimization Methods

## Synthesis

Optimization Methods are everything you *do* around the architecture, grouped by lifecycle stage. **Train it:** optimization theory (AdamW, schedules), pretraining, supervised fine-tuning, and parameter-efficient adaptation. **Run it efficiently:** Flash Attention, model compression, and speculative decoding. **Steer its outputs:** decoding strategies, prompt engineering, and training/sampling diversity. **Keep it trustworthy:** hallucination detection and safety. None of these change what the model fundamentally *is* — they change how well and how safely it is trained and used.

## Children

- [[Optimization-Theory]] — AdamW, learning-rate schedules, clipping, mixed precision
- [[Flash-Attention]] — IO-aware exact attention that slashes HBM traffic
- [[Pretraining]] — the expensive next-token-prediction phase and its data recipe
- [[Supervised-Fine-Tuning]] — instruction-following from curated prompt–response pairs
- [[LoRA-And-PEFT]] — cheap low-rank adaptation instead of full fine-tuning
- [[Diversity-In-Training]] — sampling and data diversity that prevent mode collapse
- [[Decoding-Methods]] — turning per-step distributions into generated tokens
- [[Prompt-Engineering]] — eliciting behavior without changing weights
- [[Model-Compression]] — quantization, pruning, and knowledge distillation
- [[Speculative-Decoding]] — draft-and-verify inference speedup with no quality loss
- [[Hallucination-Detection]] — model-level uncertainty signals for factuality
- [[LLM-Safety]] — threat taxonomy, safety mechanisms, and evaluation

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5–1.9, §1.11–1.17

## Cross-references

- Parent: [[LLMs]]
- Sibling: [[Architecture]] (the structure these methods act on)


