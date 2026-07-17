---
type: flashcards
note_address: "c-000033"
note_title: "Subword Tokenizer Variants"
format: 1
---

### card c-000033-01
type: mcq

How does WordPiece (used by BERT, DistilBERT) differ from plain BPE?

- [x] It merges to maximize training-data likelihood rather than by raw pair frequency
- [ ] It prunes a large vocabulary top-down by likelihood impact
- [ ] It operates on raw bytes so no token is out-of-vocabulary
- [ ] It merges the least frequent pairs to preserve rare units

### card c-000033-02
type: mcq

What is the Unigram LM approach (SentencePiece, used by T5 and XLNet)?

- [x] Top-down: start with a large vocabulary and prune tokens by their likelihood impact
- [ ] Bottom-up frequency merging, identical to BPE
- [ ] Maximize training-data likelihood when merging pairs
- [ ] Run BPE over raw bytes

### card c-000033-03
type: mcq

What guarantee makes byte-level BPE (GPT-2 onward) distinctive?

- [x] Every input decomposes to bytes, so there is no `<unk>` failure mode regardless of input
- [ ] It produces the shortest possible sequences of any tokenizer
- [ ] It maximizes training-data likelihood
- [ ] It needs no merge step at all

### card c-000033-04
type: cloze

Byte-level BPE runs BPE over raw bytes with a {{c::256}}-symbol base vocabulary, which is why no token can ever be out-of-vocabulary.
