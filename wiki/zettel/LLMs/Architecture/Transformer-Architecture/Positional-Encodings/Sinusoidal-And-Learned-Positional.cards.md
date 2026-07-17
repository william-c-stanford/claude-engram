---
type: flashcards
note_address: "c-000065"
note_title: "Sinusoidal and Learned Absolute Positional Encoding"
format: 1
---

### card c-000065-01
type: derivation

**Prompt**

Write the sinusoidal positional encoding for even and odd dimensions, and say what structural property it has.

**Answer**

$$PE_{(pos, 2i)} = \sin\!\left(\frac{pos}{10000^{2i/d}}\right), \qquad PE_{(pos, 2i+1)} = \cos\!\left(\frac{pos}{10000^{2i/d}}\right)$$

Each dimension oscillates at a different geometric scale (like binary counting), and $PE_{pos+k}$ is a linear function of $PE_{pos}$, so relative offsets are in principle recoverable.

### card c-000065-02
type: cloze

Learned absolute positional encoding adds a trainable per-position vector to each token embedding: $h_0^{(pos)} = \text{TokenEmbed}(x_{pos}) + {{c::E_\text{pos}[pos]}}$.

### card c-000065-03
type: mcq

What shared weakness pushed the field away from both sinusoidal and learned absolute encodings?

- [x] Neither extrapolates well beyond the training length (learned is hard-capped at $L_\text{max}$; sinusoidal extrapolates poorly in practice)
- [ ] Both require quadratic memory
- [ ] Both pollute the value stream with position
- [ ] Both need per-head slopes to work
