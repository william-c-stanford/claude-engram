---
type: flashcards
note_address: "c-000041"
note_title: "Vocabulary Size"
format: 1
---

### card c-000041-01
type: free

**Prompt**

What is the trade-off in choosing a tokenizer's vocabulary size?

**Answer**

A larger vocabulary lets more words and code fragments stay as single tokens, shortening sequences and improving cross-language fairness (fewer tokens per non-English word). The cost is a larger embedding matrix and output projection, so vocabulary size is a direct memory-vs-coverage trade-off, not a free lunch.

### card c-000041-02
type: cloze

A larger vocabulary enlarges the embedding matrix $\mathbf{E} \in \mathbb{R}^{|V| \times d}$; the factor of that shape set by the tokenizer is the vocabulary size ${{c::|V|}}$.

### card c-000041-03
type: mcq

Llama-3 uses a 128K vocabulary rather than the 32K practical minimum. What does the larger vocabulary primarily buy?

- [x] Meaningfully better multilingual coverage and code handling
- [ ] Faster attention because sequences are longer
- [ ] A smaller embedding matrix
- [ ] Elimination of the need for special tokens

### card c-000041-04
type: cloze

The practical minimum tokenizer vocabulary is about {{c::32K}} tokens, while Llama-3 uses {{c::128K}}.
