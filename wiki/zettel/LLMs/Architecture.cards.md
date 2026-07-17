---
type: flashcards
note_address: "c-000073"
note_title: "Architecture"
format: 1
---

### card c-000073-01
type: free

**Prompt**

In an LLM, what does "architecture" refer to, and what does it deliberately leave out?

**Answer**

The static computational structure a token flows through — the fixed arrangement of components that transform its representation. It is defined independent of *how* the model is trained or served; those (optimization, inference) are separate concerns, not part of the architecture itself.

### card c-000073-02
type: cloze

A token flows through the architecture in sequence: {{c::tokenization}} turns text into integer symbols, {{c::the transformer stack}} mixes and transforms their embeddings, and {{c::a prediction head}} reads out the answer.

### card c-000073-03
type: mcq

Why is Mixture-of-Experts classified as an architectural variant rather than a training or serving technique?

- [ ] It changes the loss function used during pretraining
- [x] It replaces the dense feed-forward block with sparsely-activated experts, scaling capacity without scaling per-token compute
- [ ] It shards the model across devices only at inference time
- [ ] It compresses stored weights after training to save memory

### card c-000073-04
type: free

**Prompt**

Architecture and its sibling Optimization-Methods describe an LLM from two angles. What is the distinction?

**Answer**

Architecture is what the model *is* — the static structure a token passes through. Optimization-Methods is what you *do* to that structure — the training procedures and objectives that set its weights. One is the fixed computational form; the other is the process that acts on it.
