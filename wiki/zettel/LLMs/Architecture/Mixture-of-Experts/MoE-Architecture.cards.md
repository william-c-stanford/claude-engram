---
type: flashcards
note_address: "c-000022"
note_title: "MoE Architecture"
format: 1
---

### card c-000022-01
type: derivation

**Prompt**

Write the MoE layer output as a sum over $N$ experts, and define how the gating weights $g(x)$ are computed from the router.

**Answer**

$$\text{MoE}(x) = \sum_{i=1}^{N} g_i(x)\, E_i(x), \qquad g(x) = \text{TopK}(\text{softmax}(W_r x))$$

where $E_i$ are expert FFNs and $g_i(x)$ are gating weights, non-zero only for the top-$K$ experts.

### card c-000022-02
type: cloze

In a MoE layer, $$\text{MoE}(x) = \sum_{i=1}^{N} {{c::g_i(x)\, E_i(x)}}$$ — each expert's output weighted by its router gate, with only the top-$K$ gates non-zero.

### card c-000022-03
type: cloze

Because only $K$ of $N$ experts run per token, active parameters are a {{c::$K/N$}} fraction of the FFN capacity; typical routing keeps $K=2$ of $N=8$–64 experts.

### card c-000022-04
type: mcq

A MoE model reports 671B total parameters but 37B active. What explains the difference?

- [ ] 634B parameters are frozen during fine-tuning
- [x] Per token, the router activates only a small subset of experts, so only their parameters participate in compute
- [ ] Quantization stores most weights at lower precision
- [ ] The active count excludes attention and embedding parameters

### card c-000022-05
type: free

**Prompt**

Inside a transformer block, which component does MoE replace, and which components remain shared across all tokens?

**Answer**

It replaces the block's single dense FFN with $N$ parallel expert FFNs plus a router. Attention, normalization, and embeddings stay shared; only the FFN capacity is expert-partitioned.

**Notes**

My cue: "only the FFN forks" — everything else in the block stays shared.
