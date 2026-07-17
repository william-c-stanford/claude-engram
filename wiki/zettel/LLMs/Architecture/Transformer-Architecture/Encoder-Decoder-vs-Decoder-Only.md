---
type: zettel
address: c-000056
title: Encoder-Decoder vs Decoder-Only
created: 2026-07-08
parent: c-000072
children: []
tags:
  - llm-fundamentals
  - transformer
subtree_size: 0
cards_due: 3
---

# Encoder-Decoder vs Decoder-Only

## Claim

The original Transformer was an **encoder-decoder** for sequence-to-sequence tasks, but modern generative LLMs use a **decoder-only** stack because a single causal self-attention stack is sufficient to encode context and generate continuations in one pass, and it is simpler, scales better, and unifies pretraining with fine-tuning.

## Reasoning

The original architecture had three components:

- **Encoder** — processes the whole input *bidirectionally* (no causal mask), producing $H_{\text{enc}} \in \mathbb{R}^{n \times d}$.
- **Decoder** — generates autoregressively with masked self-attention, then attends to the encoder via **cross-attention**:

$$\text{CrossAttn}(Q_{\text{dec}}, K_{\text{enc}}, V_{\text{enc}}) = \text{softmax}\left(\frac{Q_{\text{dec}} K_{\text{enc}}^\top}{\sqrt{d_k}}\right) V_{\text{enc}}$$

where queries come from the decoder but keys/values come from the encoder (no mask — every decoder position sees every encoder position).

**Why decoder-only won:** one model and one loss (next-token prediction) serves pretraining, SFT, and RL alike; every parameter contributes to generation, so capacity is not wasted on a separate encoder. Encoder-decoder models (T5, BART) survive for tasks with distinct input/output structure; encoder-only models (BERT) serve classification/embeddings. Cross-attention itself reappears in multimodal models, where a vision encoder supplies keys/values to a language decoder.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.2–1.3.3

## Cross-references

- Parent: [[Transformer-Architecture]]
- Mechanism: [[Scaled-Dot-Product-Attention]] (masked self-attention it builds on)


