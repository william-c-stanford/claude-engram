---
type: flashcards
note_address: "c-000054"
note_title: "Decoder-Only Block"
format: 1
---

### card c-000054-01
type: cloze

Modern LLMs wrap each sublayer in the Pre-Norm residual form ${{c::x + \text{SubLayer}(\text{LN}(x))}}$, which keeps a clean residual highway from input to output.

### card c-000054-02
type: free

**Prompt**

Trace the full forward path of a decoder-only transformer from token IDs to logits, naming the two sublayers inside each block.

**Answer**

Token IDs → embedding lookup $H_0$ → $L$ identical blocks → final LayerNorm → linear projection to $\mathbb{R}^{|V|}$ logits. Within each block the two sublayers are self-attention then the feed-forward network, each wrapped in its own residual connection.

### card c-000054-03
type: mcq

What practical training benefit does the Pre-Norm ordering give over the original Post-Norm ordering?

- [x] A clean residual highway that stabilizes training and removes the need for a learning-rate warmup
- [ ] Fewer parameters per block
- [ ] It eliminates the feed-forward sublayer
- [ ] It makes attention run in linear time
