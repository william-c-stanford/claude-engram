---
type: flashcards
note_address: "c-000056"
note_title: "Encoder-Decoder vs Decoder-Only"
format: 1
---

### card c-000056-01
type: free

**Prompt**

Why did modern generative LLMs converge on a decoder-only stack instead of the original encoder-decoder?

**Answer**

A single causal self-attention stack is enough to encode context and generate continuations in one pass. Decoder-only is simpler, scales better, and unifies training: one model and one loss (next-token prediction) serves pretraining, SFT, and RL, and every parameter contributes to generation rather than being spent on a separate encoder.

### card c-000056-02
type: cloze

In encoder-decoder cross-attention, the queries come from the {{c::decoder}} while the keys and values come from the {{c::encoder}}, and no causal mask is applied.

### card c-000056-03
type: mcq

Which model families still use the encoder-decoder or encoder-only designs, and for what?

- [x] Encoder-decoder (T5, BART) for tasks with distinct input/output structure; encoder-only (BERT) for classification/embeddings
- [ ] Decoder-only (GPT) for classification; encoder-only (BERT) for generation
- [ ] Encoder-decoder for embeddings; decoder-only only for translation
- [ ] All modern models still require the original encoder-decoder
