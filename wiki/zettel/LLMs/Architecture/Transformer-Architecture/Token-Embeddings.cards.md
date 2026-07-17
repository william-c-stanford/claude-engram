---
type: flashcards
note_address: "c-000071"
note_title: "Token Embeddings"
format: 1
---

### card c-000071-01
type: free

**Prompt**

What is the token embedding layer mechanically, and why do tokens appearing in similar contexts end up with similar vectors?

**Answer**

It is a learned matrix $E \in \mathbb{R}^{|V| \times d}$ whose row $i$ is token $i$'s dense vector; converting an ID to its vector is a table lookup. Because $E$ is learned end-to-end for next-token prediction, tokens that appear in similar contexts acquire similar vectors — the distributional hypothesis ("you shall know a word by the company it keeps").

### card c-000071-02
type: cloze

With weight tying, a model shares the embedding matrix with the output projection as ${{c::W_\text{head} = E^\top}}$, saving parameters and creating a symmetric encode-decode structure.

### card c-000071-03
type: mcq

Roughly what share of an 8B model like Llama-3 does the embedding matrix ($128{,}256 \times 4096$) account for?

- [x] About 6.5% (~525M parameters)
- [ ] About 25%
- [ ] Under 0.1%
- [ ] About 50%
