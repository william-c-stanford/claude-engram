---
type: zettel
id: "20260708224425985221"
title: "Optimization Methods"
created: "2026-07-08"
parent_id: "20260708224425985219"
child_ids:
  - "20260708222508084716"
  - "20260708222508084726"
  - "20260708222835675652"
  - "20260708222835675658"
  - "20260708222835675664"
  - "20260708223105938823"
  - "20260708223105938827"
  - "20260708223105938838"
  - "20260708223500121074"
  - "20260708223500121078"
  - "20260708223500121084"
  - "20260708223500121087"
tags:
  - llm-fundamentals
  - optimization
  - methods
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
