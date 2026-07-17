---
type: flashcards
note_address: "c-000055"
note_title: "Embedding Anisotropy"
format: 1
---

### card c-000055-01
type: free

**Prompt**

What is embedding anisotropy, and why does it make raw cosine similarity nearly useless for retrieval or clustering?

**Answer**

Pretrained embeddings are anisotropic — they occupy a narrow cone rather than spreading over all directions — so most pairs have high cosine similarity (>0.7) regardless of content. That makes RAG rankings near-random, breaks recommender geometry, and collapses clusters. Whitening restores isotropy so similarity becomes informative.

### card c-000055-02
type: cloze

Whitening restores isotropy via the linear transform ${{c::\tilde{h} = D^{-1/2} U^\top (h - \mu)}}$, giving every direction unit variance.

### card c-000055-03
type: mcq

In the whitening transform $\tilde{h} = D^{-1/2} U^\top (h - \mu)$, what are $U$ and $D$?

- [x] The eigenvectors and eigenvalues from the eigendecomposition of the embedding covariance $\Sigma$
- [ ] The query and key projection matrices
- [ ] Learned scale and shift like LayerNorm's $\gamma, \beta$
- [ ] The SAE encoder and decoder weights
