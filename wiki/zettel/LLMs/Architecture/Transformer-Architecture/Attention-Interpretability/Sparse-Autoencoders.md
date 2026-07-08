---
type: zettel
id: "20260708221914968969"
title: "Sparse Autoencoders"
created: "2026-07-08"
parent_id: "20260708221914968954"
child_ids: []
tags:
  - llm-fundamentals
  - interpretability
---

# Sparse Autoencoders

## Claim

A sparse autoencoder (SAE) trained on model activations decomposes **polysemantic** neurons (each firing for many unrelated concepts) into an overcomplete basis of **monosemantic**, interpretable, and steerable features.

## Reasoning

Individual neurons are polysemantic — one neuron may activate for "the color blue AND academic citations AND the word 'the'" — making neuron-level interpretation unreliable. An SAE reconstructs activations through a sparse overcomplete layer:

$$h = W_{\text{dec}} \cdot \text{ReLU}(W_{\text{enc}} x + b_{\text{enc}}) + b_{\text{dec}}$$

with $W_{\text{enc}} \in \mathbb{R}^{m \times d}$, $m \gg d$, and an L1 penalty so only a few features fire per input. Training minimizes $\mathcal{L} = \lVert x - \hat{x} \rVert_2^2 + \lambda \lVert z \rVert_1$; encoder rows are candidate features, validated by inspecting max-activating examples.

Key findings: features are **monosemantic** (one concept each), **steerable** (clamping the "Golden Gate Bridge" feature makes the model mention it constantly), and **composable**; SAEs **scale** — Templeton et al. trained up to 34M features on Claude 3 Sonnet, surfacing safety-relevant concepts (deception, sycophancy).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.12 (Mechanistic Interpretability)

## Cross-references

- Parent: [[Attention-Interpretability]]
- Successor approach: [[Natural-Language-Autoencoders]]
