---
type: flashcards
note_address: "c-000044"
note_title: "Tokenization"
format: 1
---

### card c-000044-01
type: free

**Prompt**

What does the tokenization stage produce, and why must it be the first stage of the LLM pipeline?

**Answer**

It converts raw text into the discrete integer symbols (token IDs) the model operates on. Those IDs index into the transformer's embedding table, so nothing downstream can run until text has been turned into symbols — tokenization is the entry point of the pipeline.

### card c-000044-02
type: mcq

The design space of tokenization resolves into four decisions, each a child of the Tokenization note. Which set correctly lists them?

- [x] Granularity, the merge algorithm that builds the vocabulary, how structural (special) tokens are handled, and practical tokenizer settings
- [ ] Embedding dimension, attention window, positional encoding, and vocabulary size
- [ ] Character encoding, Unicode normalization, whitespace stripping, and casing
- [ ] Learning rate, batch size, dropout, and weight decay

### card c-000044-03
type: cloze

The tokenizer's output integers are not used as numeric values; each token ID instead {{c::indexes into the embedding table}} of the transformer.
%% srs c-000044-02 {"due":"2026-07-21T22:55:20.936Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T22:55:20.936Z","rating":"easy","verdict":"correct"}],"easeDelta":0.15} %%
%% srs c-000044-01 {"due":"2026-07-18T22:55:35.311Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T22:55:35.311Z","rating":"good"}]} %%
%% srs c-000044-03 {"due":"2026-07-18T22:55:58.332Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T22:55:58.332Z","rating":"hard"}],"easeDelta":-0.15} %%
