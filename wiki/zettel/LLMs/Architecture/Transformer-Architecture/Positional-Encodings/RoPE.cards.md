---
type: flashcards
note_address: "c-000064"
note_title: "RoPE (Rotary Position Embedding)"
format: 1
---

### card c-000064-01
type: free

**Prompt**

What is RoPE's defining mathematical property, and how does it achieve *relative* position encoding without bias terms?

**Answer**

RoPE rotates each 2D coordinate pair of the query and key by a position-dependent angle $m\theta_i$, so their rotated inner product depends only on the relative offset $m - n$: $\langle \text{RoPE}(q_m, m), \text{RoPE}(k_n, n)\rangle = f(q_m, k_n, m - n)$. Applying the rotation only to $Q$ and $K$ gives relative position without explicit bias terms and without polluting the value stream.

### card c-000064-02
type: cloze

RoPE's rotated inner product is a function of relative position only: $\langle \text{RoPE}(q_m, m), \text{RoPE}(k_n, n)\rangle = f(q_m, k_n, {{c::m-n}})$.

### card c-000064-03
type: cloze

RoPE rotates the $i$-th 2D coordinate pair at frequency $\theta_i = 10000^{{{c::-2i/d}}}$, so low $i$ gives slow (global-range) rotations and high $i$ gives fast (local-detail) ones.

### card c-000064-04
type: mcq

Why has RoPE largely overtaken ALiBi in recent models?

- [x] Better short-context performance, while remaining relative, parameter-free, and KV-cache compatible
- [ ] It needs no scaling strategy to extrapolate past the training length
- [ ] It adds learnable per-position parameters
- [ ] It applies its rotation to the value stream as well
