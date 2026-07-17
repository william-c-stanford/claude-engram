---
type: flashcards
note_address: "c-000036"
note_title: "Never Split Special Tokens"
format: 1
---

### card c-000036-01
type: free

**Prompt**

Why must a special token like `<|assistant|>` be treated as atomic, and what breaks if the tokenizer splits it?

**Answer**

It is meaningful only as a single indivisible control symbol. If the tokenizer decomposes it into `<`, `|`, `assistant`, `|`, `>`, the model sees ordinary text instead of a control marker, and the chat/template structure it was trained to parse collapses.

### card c-000036-02
type: mcq

How do tokenizer configurations ensure special tokens are never split?

- [x] They register the special tokens explicitly so they bypass the normal subword-splitting path
- [ ] They give the tokens the highest merge priority during BPE training
- [ ] They increase the vocabulary size until the tokens fit
- [ ] They lowercase and normalize the tokens before splitting

### card c-000036-03
type: cloze

If `<|assistant|>` is broken into subword pieces, the model sees {{c::ordinary text}} instead of a control marker, and the template structure collapses.
