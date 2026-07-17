---
type: flashcards
note_address: "c-000049"
note_title: "Attention Interpretability"
format: 1
---

### card c-000049-01
type: mcq

The note frames interpretability as a stack that trades cost against faithfulness. Which ordering does it give?

- [x] Attention maps → probing → sparse autoencoders → natural-language autoencoders → causal tracing
- [ ] Causal tracing → SAEs → probing → attention maps
- [ ] Attention maps → gradient descent → weight tying → probing
- [ ] Probing → attention maps → RoPE scaling → SAEs

### card c-000049-02
type: free

**Prompt**

Why are attention weights called "the cheapest window" into a model yet "a weak explanation" of its behavior?

**Answer**

Attention maps are trivial to extract and show which positions a model attends to, but high attention does not imply high influence on the output. So they generate hypotheses rather than faithfully explain behavior; more faithful (and more expensive) tools — probing, SAEs, causal tracing — sit higher in the interpretability stack.

### card c-000049-03
type: cloze

The core caveat of attention interpretability is that {{c::high attention is not high influence}}.
