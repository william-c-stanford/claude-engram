---
type: flashcards
note_address: "c-000050"
note_title: "Attention Dilution"
format: 1
---

### card c-000050-01
type: cloze

As sequence length $n$ grows, a query's fixed attention budget spreads over more keys, so the average weight per token falls as ${{c::O(1/n)}}$.

### card c-000050-02
type: free

**Prompt**

Name the three compounding causes of attention dilution and the shape of the retrieval curve they produce.

**Answer**

(1) Softmax saturation — with many keys the effective temperature drops and the distribution flattens toward uniform; (2) positional decay — RoPE suppresses attention to distant positions, disadvantaging the middle; (3) training distribution — models trained on shorter sequences develop recency bias. Together they produce the U-shaped "lost in the middle" curve: information at the start and end is retrieved but the middle is ignored.

### card c-000050-03
type: mcq

Why does a 1M-token context window not guarantee 1M tokens of usable context?

- [x] Attention dilution thins per-token weight as $O(1/n)$, so the model struggles to concentrate on the few relevant middle positions
- [ ] The KV cache physically cannot store 1M tokens
- [ ] Positional encodings hard-cap at 128K
- [ ] Softmax numerically overflows beyond 1M keys
