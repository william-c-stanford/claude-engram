---
type: zettel
address: "c-000071"
title: "Token Embeddings"
created: "2026-07-08"
parent: "c-000072"
children: []
tags:
  - llm-fundamentals
  - transformer
  - embeddings
---

# Token Embeddings

## Claim

The embedding layer is a learned matrix $E \in \mathbb{R}^{|V| \times d}$ whose row $i$ is the dense vector for token $i$; converting a token ID to its vector is a table lookup, and because the table is learned end-to-end for next-token prediction, tokens appearing in similar contexts acquire similar vectors (the distributional hypothesis).

## Reasoning

For token $x_t$, $\text{embed}(x_t) = E[x_t] \in \mathbb{R}^d$, and a sequence becomes $H_0 = [E[x_1]; \dots; E[x_n]] \in \mathbb{R}^{n \times d}$. This replaces a one-hot vector of size $|V| = 128\text{,}000$ with a compact $d$-dimensional one (e.g. $d = 4096$) that encodes meaning: "king" and "queen" land near each other, and vector arithmetic captures relations, $v_{\text{king}} - v_{\text{man}} + v_{\text{woman}} \approx v_{\text{queen}}$.

Practical facts:

- **Size:** $|V| \times d$. For Llama-3, $128\text{,}256 \times 4096 = 525\text{M}$ parameters (6.5% of an 8B model).
- **Weight tying:** many models share the embedding matrix with the output projection, $W_{\text{head}} = E^\top$, saving parameters and creating a symmetric encode-decode structure (see [[Language-Modeling-Head]]).
- **Sparse gradients:** only rows for tokens in the current batch receive updates.

The geometry is learned purely from co-occurrence — "you shall know a word by the company it keeps."

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.4

## Cross-references

- Parent: [[Transformer-Architecture]]
- Failure mode: [[Embedding-Anisotropy]] (when this geometry degrades)
- Reuse: [[Language-Modeling-Head]] (weight tying with the output head)
