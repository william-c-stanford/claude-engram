---
type: flashcards
note_address: "c-000026"
note_title: "Mixture of Experts (MoE)"
format: 1
---

### card c-000026-01
type: free

**Prompt**

What does a Mixture-of-Experts layer decouple, and what is the architectural trick that achieves it?

**Answer**

It decouples model *capacity* from per-token *compute*: the block's single FFN is replaced by many parallel expert FFNs plus a router that activates only a few per token, so total parameters grow with the expert count while active parameters stay small.

### card c-000026-02
type: cloze

The two design problems MoE creates are both about the router: keeping experts evenly used ({{c::load balancing}}) and making a discrete top-K selection trainable ({{c::noisy gating}}).

### card c-000026-03
type: mcq

Which component of a MoE layer is the source of its main training difficulties?

- [ ] The expert FFNs, because they are too small to train stably
- [x] The router, because uniform utilization and differentiable selection both have to be engineered
- [ ] The attention block, because experts change its head dimension
- [ ] The embedding layer, because vocabulary must be split across experts
