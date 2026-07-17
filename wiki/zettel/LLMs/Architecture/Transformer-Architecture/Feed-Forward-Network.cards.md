---
type: flashcards
note_address: "c-000057"
note_title: "Feed-Forward Network"
format: 1
---

### card c-000057-01
type: derivation

**Prompt**

Write the classic transformer FFN and the modern SwiGLU variant, noting how many weight matrices each uses.

**Answer**

Classic (two matrices):

$$\text{FFN}(x) = W_2\, \sigma(W_1 x + b_1) + b_2$$

with $W_1 \in \mathbb{R}^{d \times 4d}$, $W_2 \in \mathbb{R}^{4d \times d}$. Modern SwiGLU (three matrices):

$$\text{FFN}(x) = W_2\left(\text{Swish}(W_1 x) \odot W_3 x\right)$$

hidden dimension typically $\tfrac{8}{3} d$ rounded to a multiple of 256 for Tensor-Core efficiency.

### card c-000057-02
type: cloze

The SwiGLU FFN gates the up-projection: $\text{FFN}(x) = W_2\left({{c::\text{Swish}(W_1 x) \odot W_3 x}}\right)$, needing three weight matrices instead of two.

### card c-000057-03
type: free

**Prompt**

What is the "FFN as key-value memory" interpretation, and what does it explain?

**Answer**

The rows of $W_1$ act as keys (patterns to match against the hidden state) and the columns of $W_2$ act as values (information to emit), so the FFN "retrieves" stored facts conditioned on the current hidden state. This explains why FFN layers hold much of a model's factual knowledge.
