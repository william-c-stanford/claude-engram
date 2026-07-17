---
type: flashcards
note_address: "c-000038"
note_title: "Special Tokens"
format: 1
---

### card c-000038-01
type: free

**Prompt**

Special tokens carry structural meaning rather than linguistic content. What three handling rules follow from that structural role?

**Answer**

(1) There is a fixed inventory of them, each marking a specific structure (sequence boundaries, chat roles, padding); (2) they must never be split — they stay atomic in the tokenizer; and (3) their loss must be masked during supervised fine-tuning so the model does not learn to predict formatting.

### card c-000038-02
type: mcq

What distinguishes special tokens from ordinary vocabulary entries?

- [x] They encode structure (sequence boundaries, chat roles, padding) rather than linguistic content, and never appear in natural text
- [ ] They are the most frequent tokens in the training corpus
- [ ] They are always multi-character subword merges
- [ ] They are the only tokens with trainable embeddings
%% srs c-000038-02 {"due":"2026-07-21T23:08:40.075Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T23:08:40.075Z","rating":"easy","verdict":"correct"}],"easeDelta":0.15} %%
%% srs c-000038-01 {"due":"2026-07-18T23:09:06.861Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T23:09:06.861Z","rating":"hard"}],"easeDelta":-0.15} %%
