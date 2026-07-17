---
type: zettel
address: c-000055
title: Embedding Anisotropy
created: 2026-07-08
parent: c-000072
children: []
tags:
  - llm-fundamentals
  - embeddings
subtree_size: 0
cards_due: 3
---

# Embedding Anisotropy

## Claim

Pretrained token/sequence embeddings are highly **anisotropic** — they occupy a narrow cone rather than spreading over all directions — so raw cosine similarity is nearly meaningless for retrieval or clustering; **whitening** (a linear transform to zero mean and identity covariance) restores isotropy and makes similarity informative.

## Reasoning

When most embedding pairs have cosine similarity $> 0.7$ regardless of content, RAG rankings become near-random, recommender geometry breaks, and clusters collapse. Whitening fixes this:

$$\tilde{h} = D^{-1/2} U^\top (h - \mu)$$

where $\mu$ is the mean embedding and $U D U^\top$ is the eigendecomposition of the covariance $\Sigma = \frac{1}{N} \sum_i (h_i - \mu)(h_i - \mu)^\top$. This rotates and scales the space so every direction has unit variance; keeping only the top-$k$ eigenvectors simultaneously reduces dimensionality (PCA-like). Cost is a one-time $O(N d^2)$ covariance computation; the transform itself is a matrix multiply at inference. Alternatives: contrastive fine-tuning (SimCSE), flow-based normalization, or isotropy-promoting regularizers.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.4 (Anisotropy Problem)

## Cross-references

- Parent: [[Transformer-Architecture]]
- Concerns the geometry built in [[Token-Embeddings]]


