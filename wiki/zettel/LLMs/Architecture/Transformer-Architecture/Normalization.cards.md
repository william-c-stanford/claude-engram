---
type: flashcards
note_address: "c-000061"
note_title: "Normalization"
format: 1
---

### card c-000061-01
type: mcq

The note says two decisions define a model's normalization. Which two?

- [x] Which normalizer (LayerNorm vs RMSNorm) and where it sits relative to each sublayer (Pre-LN vs Post-LN)
- [ ] Batch size and learning rate
- [ ] Number of heads and hidden dimension
- [ ] Activation function and dropout rate

### card c-000061-02
type: free

**Prompt**

Why is normalization described as "what lets deep transformers train at all"?

**Answer**

Without it, activation magnitudes grow or shrink exponentially through the layers, so gradients and activations become unmanageable at depth. Normalization constrains each layer's outputs to a predictable range, which is what keeps training stable enough to optimize a deep stack.
