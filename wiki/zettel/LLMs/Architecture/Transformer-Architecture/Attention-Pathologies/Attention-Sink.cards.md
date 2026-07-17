---
type: flashcards
note_address: "c-000052"
note_title: "Attention Sink"
format: 1
---

### card c-000052-01
type: cloze

The attention weight on the first-token sink approaches ${{c::1/n}}$ even when its key $k_0$ is meaningless, because softmax must still form a valid distribution.

### card c-000052-02
type: free

**Prompt**

Why does a transformer route 20–50% of attention to the first token regardless of its content, and what breaks if you evict it from a sliding-window KV cache?

**Answer**

Softmax forces the attention weights to sum to 1, so when no key is relevant the model must still dump the mass somewhere; the always-present, positionally predictable first token becomes the learned no-op sink. Evicting it spikes perplexity because the model loses its default dump location.

### card c-000052-03
type: mcq

How does StreamingLLM exploit the attention-sink phenomenon for bounded-memory infinite generation?

- [x] It permanently keeps the first $k$ tokens alongside a recent sliding window
- [ ] It removes the first token to free a KV slot
- [ ] It replaces softmax with sigmoid attention everywhere
- [ ] It trains a dedicated sink token at every position
