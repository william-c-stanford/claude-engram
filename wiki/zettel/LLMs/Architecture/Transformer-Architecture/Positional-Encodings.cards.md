---
type: flashcards
note_address: "c-000066"
note_title: "Positional Encodings"
format: 1
---

### card c-000066-01
type: free

**Prompt**

Why does a transformer need positional encodings at all, and what single axis dominates how positional methods are judged in practice?

**Answer**

Attention is permutation-equivariant, so without an added position signal a transformer cannot tell "the cat sat on the mat" from a shuffling of the same tokens. In practice, methods are judged mainly on how well they extrapolate beyond the training length.

### card c-000066-02
type: mcq

How did positional-encoding methods evolve in modern LLMs?

- [x] From fixed/learned absolute encodings to relative ones (RoPE, ALiBi), then explicit scaling tricks for 100K–1M-token contexts
- [ ] From relative to absolute encodings for better extrapolation
- [ ] From learned embeddings to removing position information entirely
- [ ] From RoPE to sinusoidal encoding for efficiency

### card c-000066-03
type: cloze

Positional encoding is necessary because attention is {{c::permutation-equivariant}} — it treats a set of tokens identically regardless of their order.
