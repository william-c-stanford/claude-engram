---
type: flashcards
note_address: "c-000032"
note_title: "BPE Merge Algorithm"
format: 1
---

### card c-000032-01
type: pseudocode

**Prompt**

Sketch the BPE vocabulary-building procedure over a training corpus, given a target of $k$ merges.

**Answer**

```text
vocab = set of individual characters (or bytes) in corpus
repeat k times:
    counts = count of every adjacent symbol pair in corpus
    pair   = argmax(counts)          # single most frequent pair
    merge pair into one new symbol; add it to vocab
    rewrite corpus with the merge applied
# k iterations add exactly k new symbols
```

### card c-000032-02
type: free

**Prompt**

In BPE, why does the number of merge iterations $k$ directly set the final vocabulary size?

**Answer**

Each iteration merges exactly one pair into exactly one new symbol, adding a single token to the vocabulary. So after $k$ iterations the vocabulary has grown by $k$ entries — the merge budget and the vocabulary budget are the same knob.

### card c-000032-03
type: cloze

At each BPE iteration, the algorithm counts all adjacent symbol pairs and merges the {{c::single most frequent}} pair into one new symbol.

### card c-000032-04
type: mcq

What does BPE start its vocabulary from before any merges?

- [x] Individual characters (or bytes)
- [ ] The most frequent whole words in the corpus
- [ ] A fixed 32K set of common subwords
- [ ] Randomly initialized token embeddings
%% srs c-000032-04 {"due":"2026-07-21T19:15:47.984Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T19:15:47.984Z","rating":"easy","verdict":"correct"}],"easeDelta":0.15} %%
%% srs c-000032-01 {"due":"2026-07-21T19:16:06.992Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T19:16:06.992Z","rating":"easy"}],"easeDelta":0.15} %%
%% srs c-000032-02 {"due":"2026-07-18T19:16:32.663Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T19:16:32.663Z","rating":"good"}]} %%
%% srs c-000032-03 {"due":"2026-07-21T19:16:41.364Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T19:16:41.364Z","rating":"easy"}],"easeDelta":0.15} %%
