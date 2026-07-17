---
type: flashcards
note_address: "c-000070"
note_title: "Self-Attention"
format: 1
---

### card c-000070-01
type: free

**Prompt**

Describe the query-key-value operation that makes self-attention the transformer's "token-mixing engine," and name the price it pays.

**Answer**

Each position forms a query, matches it against every key, and takes a weighted average of the values — so information flows between arbitrary positions in a single step. The price is quadratic cost in sequence length ($O(n^2)$).

### card c-000070-02
type: mcq

Self-attention lets information flow between arbitrary positions in one step. What is the primary cost of that property?

- [x] Compute and memory grow quadratically with sequence length
- [ ] It breaks permutation equivariance
- [ ] It requires a separate encoder stack
- [ ] Gradients vanish across heads

### card c-000070-03
type: cloze

Self-attention is run in parallel across multiple {{c::heads}}, each computing its own query-key-value weighted average of values.
