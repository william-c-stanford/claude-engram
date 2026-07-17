---
type: flashcards
note_address: "c-000069"
note_title: "Scaled Dot-Product Attention"
format: 1
---

### card c-000069-01
type: derivation

**Prompt**

Write the scaled dot-product attention output for $Q, K, V$, including the causal mask $M$ and the scaling factor. State how $Q, K, V$ are formed.

**Answer**

From input $X$, form $Q = X W_Q$, $K = X W_K$, $V = X W_V$. Then

$$\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}} + M\right) V$$

where the causal mask is $M_{ij} = 0$ for $i \ge j$ (can attend) and $M_{ij} = -\infty$ for $i < j$ (future token, blocked).

### card c-000069-02
type: cloze

The scaling divisor keeps dot-product magnitudes — and thus softmax gradients — stable as key dimension grows. Mask the dimension under the root:

$$\text{softmax}\!\left(\frac{QK^\top}{\sqrt{{{c::d_k}}}} + M\right) V$$

### card c-000069-03
type: free

**Prompt**

In scaled dot-product attention, what goes wrong if you omit the $1/\sqrt{d_k}$ factor, and what does the causal mask accomplish during parallel teacher-forced training?

**Answer**

Without the divisor, dot-product magnitudes grow with $d_k$, pushing softmax into saturated regions where gradients shrink. The causal mask sets future positions to $-\infty$, so even though the whole target sequence is processed in parallel, token $t$ attends only to tokens $1, \dots, t-1$ — preserving autoregressive causality.

### card c-000069-04
type: cloze

In the causal mask, a future position ($i < j$) is set to ${{c::-\infty}}$ before the softmax so it receives zero attention weight.
