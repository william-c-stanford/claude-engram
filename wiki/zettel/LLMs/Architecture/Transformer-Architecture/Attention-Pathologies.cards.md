---
type: flashcards
note_address: "c-000053"
note_title: "Attention Pathologies"
format: 1
---

### card c-000053-01
type: mcq

Softmax attention produces systematic failure modes. Which two are described as mattering most operationally?

- [x] The attention sink (forced dump of unused mass) and attention dilution (spreading too thin over long context)
- [ ] Vanishing gradients and exploding activations
- [ ] Positional aliasing and embedding anisotropy
- [ ] Weight tying and sparse gradients

### card c-000053-02
type: free

**Prompt**

Why does the note frame attention failure modes as "not bugs but consequences of the mechanism"?

**Answer**

They follow directly from softmax producing a normalized distribution over keys: it must place its mass somewhere even when nothing is relevant (creating the sink), and it must divide a fixed budget across all keys (causing dilution). Both are inherent to how the mechanism works, not implementation errors.

### card c-000053-03
type: cloze

A third pathology theme, head {{c::specialization}}, explains why some attention heads are prunable while others (induction, retrieval) are load-bearing.
