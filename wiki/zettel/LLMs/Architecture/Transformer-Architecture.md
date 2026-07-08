---
type: zettel
address: "c-000072"
title: "Transformer Architecture"
created: "2026-07-08"
parent: "c-000073"
children:
  - "c-000054"
  - "c-000056"
  - "c-000071"
  - "c-000055"
  - "c-000070"
  - "c-000066"
  - "c-000057"
  - "c-000061"
  - "c-000058"
  - "c-000053"
  - "c-000049"
tags:
  - llm-fundamentals
  - architecture
  - transformer
---

# Transformer Architecture

## Synthesis

The transformer is the substrate of every modern LLM: a stack of $L$ identical blocks, each pairing a self-attention sublayer (which lets every position read from every other) with a position-wise feed-forward network, glued by residual connections and normalization. Understanding its parts — how discrete tokens become continuous vectors, how attention mixes them, how position is injected, how the block is normalized, and how attention fails — is the prerequisite for every training and optimization method in this guide. Each part is a child of this note.

## Children

- [[Decoder-Only-Block]] — the stacked embed → (attention + FFN)×L → norm → logits skeleton
- [[Encoder-Decoder-vs-Decoder-Only]] — why generative LLMs dropped the encoder
- [[Token-Embeddings]] — the learned lookup table from IDs to dense vectors
- [[Embedding-Anisotropy]] — why raw embeddings cluster in a cone, and whitening
- [[Self-Attention]] — the core token-mixing operation and its cost
- [[Positional-Encodings]] — injecting sequence order into a permutation-equivariant model
- [[Feed-Forward-Network]] — the position-wise MLP and its key-value-memory view
- [[Normalization]] — LayerNorm / RMSNorm and where they sit in the block
- [[Model-Size-Reference]] — parameters, layers, heads, context for popular models
- [[Attention-Pathologies]] — systematic attention failure modes
- [[Attention-Interpretability]] — reading attention and the tools beyond it

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3

## Cross-references

- Parent: [[Architecture]]
- Upstream stage: [[Tokenization]] produces the IDs this architecture embeds.
- [[LLM-Pipeline-Overview]] — where this sits in the end-to-end pipeline.
