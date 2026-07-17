---
type: flashcards
note_address: "c-000067"
note_title: "Attention Quadratic Cost"
format: 1
---

### card c-000067-01
type: free

**Prompt**

Why is naive self-attention $O(n^2)$ in both time and memory, and why does the memory cost bite hardest at long context?

**Answer**

Computing $QK^\top$ is $n^2$ dot products, and the full $n \times n$ score matrix must be materialized in memory to run softmax over each row. The memory term dominates at scale: 128K tokens is a $128\text{K} \times 128\text{K}$ matrix (~64 GB in FP32), exceeding a single GPU's HBM.

### card c-000067-02
type: mcq

FlashAttention reduces attention's memory cost without changing its output. How?

- [x] It tiles the computation so the full $n \times n$ score matrix is never materialized in HBM, keeping FLOPs the same
- [ ] It attends only to a sliding window of nearby tokens
- [ ] It replaces softmax with a linear recurrence
- [ ] It evicts old KV-cache entries at inference

### card c-000067-03
type: cloze

Sliding-window (local) attention limits each query to its $w$ nearest tokens, cutting attention cost from $O(n^2)$ to ${{c::O(n \cdot w)}}$.

### card c-000067-04
type: mcq

What is the main quality trade-off of linear-attention / state-space models (Mamba, RWKV) that achieve $O(n d^2)$ scaling?

- [x] Softmax-free attention is less expressive and lags on precise long-range retrieval
- [ ] They cannot be trained in parallel
- [ ] They still must materialize the full score matrix
- [ ] They only work below 4K tokens
