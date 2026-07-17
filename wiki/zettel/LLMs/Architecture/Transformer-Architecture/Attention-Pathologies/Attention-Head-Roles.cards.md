---
type: flashcards
note_address: "c-000051"
note_title: "Attention Head Roles"
format: 1
---

### card c-000051-01
type: mcq

Pruning which attention heads specifically causes hallucination spikes by removing factual recall from context?

- [x] Retrieval heads
- [ ] Induction heads
- [ ] Positional heads
- [ ] Syntax heads

### card c-000051-02
type: free

**Prompt**

What do induction heads compute, and why does the note conclude that pruning is "safe only if it avoids the load-bearing heads"?

**Answer**

Induction heads implement the copy pattern $[A][B]\dots[A] \rightarrow [B]$ and are critical for in-context learning. Heads specialize unequally: many contribute little, but induction heads carry in-context learning and retrieval heads carry factual recall. So pruning is safe only when it removes the redundant specialized heads and spares these load-bearing ones.

### card c-000051-03
type: cloze

{{c::Induction}} heads implement the copy pattern $[A][B]\dots[A] \rightarrow [B]$ and emerge in models of two or more layers, making them critical for in-context learning.
