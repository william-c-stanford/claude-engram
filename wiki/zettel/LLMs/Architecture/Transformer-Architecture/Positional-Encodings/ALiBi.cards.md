---
type: flashcards
note_address: "c-000062"
note_title: "ALiBi (Attention with Linear Biases)"
format: 1
---

### card c-000062-01
type: cloze

ALiBi adds no positional embedding; it subtracts a static, head-specific linear penalty from the attention scores: $\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}} - {{c::m \cdot |i-j|}}\right) V$.

### card c-000062-02
type: free

**Prompt**

How does ALiBi create a per-head "soft recency window," and what determines each head's window width?

**Answer**

It subtracts $m \cdot |i-j|$ from the attention scores, penalizing distant positions linearly. The slope $m_h = 2^{-8h/H}$ is fixed geometrically per head, so different heads get windows of different widths (multi-scale locality). Because the signal lives purely in attention-score space, it never contaminates the token representations.

### card c-000062-03
type: mcq

What is ALiBi's main weakness relative to RoPE?

- [x] Weaker on tasks needing precise long-range positional reasoning (e.g. "what was the 5th word?")
- [ ] It requires many learnable parameters
- [ ] It cannot be trained below 8K tokens
- [ ] It contaminates the value stream with position information
