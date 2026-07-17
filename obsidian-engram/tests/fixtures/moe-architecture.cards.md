---
type: flashcards
note_address: "c-000022"
note_title: "MoE Architecture"
format: 1
---

### card c-000022-01
type: cloze

A MoE layer keeps only the top-$K$ experts per token, so active parameters are a {{c::$K/N$}} fraction of FFN capacity.

### card c-000022-02
type: mcq

Why do MoE models report both "total" and "active" parameter counts?

- [ ] Total counts include the router; active excludes it
- [x] Only $K$ of $N$ experts run per token
- [ ] Active parameters are the ones updated during fine-tuning

### card c-000022-03
type: derivation

**Prompt**

Write the MoE layer output as a sum over experts, defining the gating term.

**Answer**

$$\text{MoE}(x) = \sum_{i=1}^{N} g_i(x)\, E_i(x), \qquad g(x) = \text{TopK}(\text{softmax}(W_r x))$$

### card c-000022-04
type: free

**Prompt**

Why does MoE decouple capacity from per-token compute?

**Answer**

Total parameters grow with the expert count $N$ while per-token compute grows only with the active count $K$.

### card c-000022-05
type: pseudocode

**Prompt**

Sketch the routing step of a MoE forward pass.

**Answer**

```text
logits = W_r @ x
gates  = softmax(logits)
topk   = indices of K largest gates
y      = sum(gates[i] * expert[i](x) for i in topk)
```

### card c-000022-06
type: telepathy

This card has an unknown type and must be skipped with a warning.

%% srs c-000022-01 {"due":"2026-07-18T09:00:00Z","interval":4,"ease":2.5,"reviews":[{"at":"2026-07-14T09:00:00Z","rating":"good"}]} %%
%% srs c-000022-03 {"state":"new"} %%
%% srs c-000022-99 {"due":"2026-07-01T00:00:00Z","interval":10,"ease":2.5,"reviews":[]} %%
%% srs-retired c-000022-07 {"due":"2026-06-01T00:00:00Z","interval":25,"ease":2.35,"reviews":[]} %%
