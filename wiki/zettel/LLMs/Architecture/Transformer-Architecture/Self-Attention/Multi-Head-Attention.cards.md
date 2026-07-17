---
type: flashcards
note_address: "c-000068"
note_title: "Multi-Head Attention"
format: 1
---

### card c-000068-01
type: cloze

Multi-head attention splits the model dimension $d$ into $H$ heads, each of size ${{c::d_k = d/H}}$, runs attention independently in each, then concatenates and projects with $W_O$.

### card c-000068-02
type: free

**Prompt**

What does running $H$ attention heads in parallel buy over a single head, and what does Grouped-Query Attention (GQA) change?

**Answer**

Each head attends independently, so the model captures several relationship types at once (syntax, semantics, position) instead of averaging them into a single pattern. GQA decouples query heads from KV heads, sharing a few KV heads across many query heads (Llama-3: 8 KV heads for 32 query heads), shrinking the KV cache ~4x with negligible quality loss.

### card c-000068-03
type: mcq

Why do nearly all recent LLMs report 8 KV heads despite having many more query heads?

- [x] Grouped-Query Attention shares KV heads across query heads to shrink the KV cache with minimal quality loss
- [ ] 8 is the maximum number of heads a GPU tensor core supports
- [ ] Each KV head corresponds to one transformer layer group
- [ ] It is required for RoPE compatibility
