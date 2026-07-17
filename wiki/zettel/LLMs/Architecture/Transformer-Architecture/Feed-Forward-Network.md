---
type: zettel
address: c-000057
title: Feed-Forward Network
created: 2026-07-08
parent: c-000072
children: []
tags:
  - llm-fundamentals
  - transformer
subtree_size: 0
cards_due: 3
---

# Feed-Forward Network

## Claim

Each transformer block applies a position-wise MLP that expands to a wide hidden dimension and projects back; modern LLMs use the gated **SwiGLU** variant, and the layer is thought to act as a key-value memory that retrieves stored knowledge from the current hidden state.

## Reasoning

The classic FFN is applied independently at every position:

$$\text{FFN}(x) = W_2 \, \sigma(W_1 x + b_1) + b_2$$

with $W_1 \in \mathbb{R}^{d \times 4d}$, $W_2 \in \mathbb{R}^{4d \times d}$. Modern LLMs (Llama, Mistral) replace this with **SwiGLU**:

$$\text{FFN}(x) = W_2\left(\text{Swish}(W_1 x) \odot W_3 x\right)$$

which needs three weight matrices but performs better; its hidden dimension is typically $\tfrac{8}{3} d$ rounded to a multiple of 256 for Tensor-Core efficiency.

**FFN as memory:** the rows of $W_1$ behave as *keys* (patterns to match) and the columns of $W_2$ as *values* (information to emit), so the FFN "retrieves" stored facts conditioned on the hidden state. This is why FFN layers hold much of a model's factual knowledge.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.8

## Cross-references

- Parent: [[Transformer-Architecture]]
- Sparse-FFN generalization: [[Mixture-of-Experts]]


