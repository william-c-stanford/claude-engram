---
type: flashcards
note_address: "c-000072"
note_title: "Transformer Architecture"
format: 1
---

### card c-000072-01
type: free

**Prompt**

A transformer is a stack of $L$ identical blocks. What two sublayers does each block pair, and what connects them within and across blocks?

**Answer**

Each block pairs a self-attention sublayer (every position reads from every other position) with a position-wise feed-forward network. Residual connections and normalization glue the two sublayers together, and the same block is stacked $L$ times.

### card c-000072-02
type: mcq

Why must a transformer add an explicit positional-encoding signal to its inputs?

- [x] Self-attention is permutation-equivariant, so without position information it cannot distinguish a sentence from a reordering of its tokens
- [ ] The feed-forward network mixes positions and would otherwise overflow
- [ ] Token embeddings are anisotropic and need positional whitening
- [ ] Residual connections discard token order

### card c-000072-03
type: cloze

In the transformer forward path, discrete token IDs are first turned into continuous vectors by {{c::token embeddings}}, which self-attention then mixes across positions.
