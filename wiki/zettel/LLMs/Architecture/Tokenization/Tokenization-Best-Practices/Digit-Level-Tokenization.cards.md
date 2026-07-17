---
type: flashcards
note_address: "c-000039"
note_title: "Digit-Level Tokenization"
format: 1
---

### card c-000039-01
type: free

**Prompt**

Why does tokenizing numbers digit-by-digit (e.g. "2024" → "2", "0", "2", "4") improve arithmetic reasoning?

**Answer**

A single multi-digit token gives the model no positional handle on the individual digits, so column-wise arithmetic (carries, place value) is hard to learn. Splitting to digits exposes the place-value structure the model needs to add, subtract, and compare numbers reliably.

### card c-000039-02
type: mcq

Why is a single token for "2024" poor for arithmetic?

- [x] The model has no positional handle on the individual digits, so place-value operations are hard to learn
- [ ] The token is too rare to receive a good embedding
- [ ] It inflates the vocabulary beyond 128K
- [ ] It cannot be masked during fine-tuning

### card c-000039-03
type: cloze

Digit-level tokenization exposes the {{c::place-value}} structure of numbers, letting the model reason over individual digits instead of opaque multi-digit chunks.
