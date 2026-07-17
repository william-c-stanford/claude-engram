---
type: flashcards
note_address: "c-000046"
note_title: "Attention Visualization Methods"
format: 1
---

### card c-000046-01
type: mcq

Why is a raw single-layer attention heatmap a misleading picture of information flow?

- [x] Information also flows through residual connections, which a single layer's attention map ignores
- [ ] Softmax forces all attention weights to be equal
- [ ] It can only display attention from the first token
- [ ] Gradients are undefined for attention weights

### card c-000046-02
type: cloze

Attention rollout folds the residual connection into each layer's matrix as $A^{(l)} = {{c::0.5 A^{(l)}_\text{raw} + 0.5 I}}$ before multiplying the matrices across layers to approximate cumulative flow.

### card c-000046-03
type: free

**Prompt**

What does gradient-weighted attention add over raw attention weights, and what distinction does it make possible?

**Answer**

It weights each attention value by output sensitivity, $\text{Relevance}(i) = \alpha_i \cdot \left|\frac{\partial y}{\partial h_i}\right|$, distinguishing tokens that are merely "attended to" from tokens that actually influence the output.
