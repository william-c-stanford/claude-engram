---
type: zettel
id: "20260708222835675655"
title: "Scaling Laws"
created: "2026-07-08"
parent_id: "20260708222835675652"
child_ids: []
tags:
  - llm-fundamentals
  - pretraining
  - scaling
---

# Scaling Laws

## Claim

Chinchilla scaling laws show that compute-optimal training balances model size $N$ and data size $D$ roughly equally ($N_{\text{opt}} \propto C^{0.5}$, $D_{\text{opt}} \propto C^{0.5}$), but in practice models are deliberately *over-trained* on more tokens than optimal because inference cost scales with model size, not training tokens.

## Reasoning

Hoffmann et al. found that for a fixed compute budget $C$, both model parameters and training tokens should grow as $\sqrt{C}$ — e.g. a 70B model is compute-optimal at ~1.4T tokens. But the compute-optimal point minimizes *training* cost, not *deployment* cost. Since a smaller model is cheaper to serve for its entire lifetime, labs train smaller models on far more tokens than Chinchilla-optimal (Llama-3 8B on 15T), trading extra training compute for permanently lower inference cost.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.7.3

## Cross-references

- Parent: [[Pretraining]]
- Model sizes in practice: [[Model-Size-Reference]]
