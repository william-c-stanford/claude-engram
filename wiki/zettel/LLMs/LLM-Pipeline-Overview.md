---
type: zettel
id: "20260708221914968942"
title: "LLM Pipeline Overview"
created: "2026-07-08"
parent_id: "20260708224425985219"
child_ids: []
tags:
  - llm-fundamentals
  - architecture
---

# LLM Pipeline Overview

## Claim

A large language model maps text to text through a fixed five-stage pipeline — $\text{text} \rightarrow \text{tokens} \rightarrow \text{representations} \rightarrow \text{tokens} \rightarrow \text{text}$ — wrapped in an autoregressive loop that appends each generated token to the input for the next forward pass.

## Reasoning

The four processing stages, in order:

1. **Tokenization** — raw text is split into subword pieces via a learned vocabulary (e.g. "unhappiness" → `["un", "happiness"]`).
2. **Embedding** — each token ID indexes a learned table, producing a dense vector in $\mathbb{R}^d$ (typically $d = 4096$); similar tokens get nearby vectors.
3. **Contextual processing** — the transformer stack processes all embeddings in parallel, using self-attention so each position reads from every other; after $L$ layers each hidden state encodes rich context.
4. **Prediction** — the final hidden state is projected to a probability distribution over the vocabulary, and a decoding strategy selects the next token.

Generation is autoregressive: the chosen token is appended to the input and the whole forward pass repeats until an end token is emitted. This note is the map; each stage is treated in depth by its own root.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.1

## Cross-references

- Parent: [[LLMs]]
- Stage 1: [[Tokenization]]
- Stages 2–3: [[Transformer-Architecture]] (embeddings, attention, layers)
- Stage 4: [[Prediction-Heads]] and [[Decoding-Methods]]
