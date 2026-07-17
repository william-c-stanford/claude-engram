---
type: flashcards
note_address: "c-000045"
note_title: "Attention Is Not Explanation"
format: 1
---

### card c-000045-01
type: free

**Prompt**

What two empirical findings from Jain and Wallace show that attention weights are not faithful explanations?

**Answer**

(1) High attention need not mean high influence — a token can receive large attention weight yet be routed through a near-zero-weight path and contribute little to the output; (2) adversarially different attention distributions can produce identical predictions. Hence attention is a hypothesis generator, not a faithful explanation.

### card c-000045-02
type: mcq

Given that "attention is not explanation," what does the note recommend for genuine causal attribution?

- [x] Gradient-based methods, probing classifiers, or mechanistic interpretability (SAEs, causal tracing)
- [ ] Reading raw attention heatmaps at face value
- [ ] Attention rollout across all layers
- [ ] Increasing the number of attention heads

### card c-000045-03
type: cloze

Because distinct attention maps can yield the same prediction, attention should be treated as a {{c::hypothesis generator}}, not a faithful explanation of model behavior.
