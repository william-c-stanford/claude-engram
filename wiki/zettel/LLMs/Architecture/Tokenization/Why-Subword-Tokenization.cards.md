---
type: flashcards
note_address: "c-000043"
note_title: "Why Subword Tokenization"
format: 1
---

### card c-000043-01
type: free

**Prompt**

Why is subword the granularity "sweet spot" compared with character-level and word-level tokenization?

**Answer**

Subword keeps sequences short and the vocabulary manageable (32K–128K) while still handling rare and novel words. Character-level makes sequences very long (quadratic attention cost, hard long-range semantics); word-level needs a huge vocabulary (~500K+) and still fails on rare/novel words. Only subword achieves short-ish sequences, a bounded vocabulary, and no out-of-vocabulary problem at once.

### card c-000043-02
type: mcq

What is the core problem with character-level tokenization?

- [x] Sequences become very long, so attention cost $O(n^2)$ explodes and long-range semantics are hard to learn
- [ ] The vocabulary balloons to ~500K entries
- [ ] Rare and novel words become out-of-vocabulary
- [ ] The embedding table cannot fit common words

### card c-000043-03
type: mcq

What is the core problem with word-level tokenization?

- [x] It cannot handle rare/novel words and needs a huge (~500K+) vocabulary and embedding table
- [ ] Sequences become extremely long
- [ ] Attention cost grows quadratically in sequence length
- [ ] It cannot represent common words like "the" as single tokens

### card c-000043-04
type: cloze

Under subword tokenization, common words stay single tokens ("the") while rare words decompose into known pieces, so the vocabulary stays bounded but nothing is ever {{c::out-of-vocabulary}}.
%% srs c-000043-04 {"due":"2026-07-18T22:56:24.407Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T22:56:24.407Z","rating":"good"}]} %%
%% srs c-000043-01 {"due":"2026-07-18T22:56:44.737Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T22:56:44.737Z","rating":"hard"}],"easeDelta":-0.15} %%
%% srs c-000043-03 {"due":"2026-07-21T23:05:34.937Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T23:05:34.937Z","rating":"easy","verdict":"correct"}],"easeDelta":0.15} %%
%% srs c-000043-02 {"due":"2026-07-21T23:06:21.641Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T23:06:21.641Z","rating":"easy","verdict":"correct"}],"easeDelta":0.15} %%
