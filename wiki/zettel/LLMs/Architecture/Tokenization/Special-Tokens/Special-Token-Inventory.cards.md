---
type: flashcards
note_address: "c-000037"
note_title: "Special Token Inventory"
format: 1
---

### card c-000037-01
type: mcq

Which special token marks the end of a sequence and stops generation?

- [x] `<eos>` / `<|end_of_text|>`
- [ ] `<bos>` / `<|begin_of_text|>`
- [ ] `<pad>`
- [ ] `<unk>`

### card c-000037-02
type: mcq

What is the `<pad>` token used for?

- [x] Batch padding, and it is masked out in attention
- [ ] Marking the start of a sequence
- [ ] Standing in for out-of-vocabulary text
- [ ] Separating chat-turn roles

### card c-000037-03
type: mcq

Which special tokens encode chat-turn roles?

- [x] `<|user|>` / `<|assistant|>`
- [ ] `<bos>` / `<eos>`
- [ ] `<pad>` / `<unk>`
- [ ] `<|begin_of_text|>` / `<|end_of_text|>`

### card c-000037-04
type: cloze

The out-of-vocabulary placeholder token, which is rare with byte-level BPE, is {{c::`<unk>`}}.
