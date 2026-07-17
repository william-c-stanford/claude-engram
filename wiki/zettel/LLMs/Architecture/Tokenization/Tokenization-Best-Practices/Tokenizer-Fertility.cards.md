---
type: flashcards
note_address: "c-000040"
note_title: "Tokenizer Fertility"
format: 1
---

### card c-000040-01
type: free

**Prompt**

What is tokenizer fertility, and what does high fertility for a given language indicate?

**Answer**

Fertility is the average number of tokens the tokenizer emits per word. High fertility for a language means its words fragment into many subword pieces, signalling that the vocabulary covers that language poorly — the standard per-language coverage diagnostic.

### card c-000040-02
type: mcq

High tokenizer fertility for a language causes which downstream costs?

- [x] Higher inference cost, more context consumption, and degraded quality for that language
- [ ] Lower vocabulary memory but slower training only
- [ ] More `<unk>` tokens but no cost change
- [ ] Faster decoding because sequences are shorter

### card c-000040-03
type: cloze

Fertility is the average number of {{c::tokens per word}} a tokenizer emits, used as a per-language coverage diagnostic.
