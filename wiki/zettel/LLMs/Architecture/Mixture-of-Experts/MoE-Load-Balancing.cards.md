---
type: flashcards
note_address: "c-000023"
note_title: "MoE Load Balancing"
format: 1
---

### card c-000023-01
type: free

**Prompt**

Why is MoE "expert collapse" self-reinforcing, and what breaks the cycle?

**Answer**

An expert that gets more tokens receives more gradient, improves, and attracts still more tokens — a rich-get-richer loop. An auxiliary load-balancing loss that rewards uniform utilization counteracts it, keeping all experts trained and all GPUs busy.

### card c-000023-02
type: derivation

**Prompt**

Write the auxiliary load-balancing loss for an $N$-expert MoE, defining both per-expert quantities it multiplies.

**Answer**

$$\mathcal{L}_{\text{bal}} = \alpha \cdot N \sum_{i=1}^{N} f_i \cdot p_i$$

where $f_i$ is the fraction of tokens actually routed to expert $i$ and $p_i$ is the mean router probability for expert $i$.

### card c-000023-03
type: cloze

The balancing loss $$\mathcal{L}_{\text{bal}} = \alpha \cdot N \sum_{i=1}^{N} {{c::f_i \cdot p_i}}$$ penalizes the product of "how often chosen" and "how confidently chosen", pushing utilization toward uniform.

### card c-000023-04
type: mcq

Besides wasted capacity, why is expert collapse an *infrastructure* problem?

- [x] Experts usually live on different GPUs, so skewed routing unbalances device load
- [ ] Collapsed experts corrupt the KV cache across devices
- [ ] The router's weights grow unboundedly and overflow memory
- [ ] Unused experts must be checkpointed more frequently

### card c-000023-05
type: cloze

{{c::Switch Transformer}} relies on the auxiliary balancing loss alone, with Top-1 routing and no noise.
%% srs c-000023-01 {"due":"2026-07-21T18:31:09.407Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T18:31:09.407Z","rating":"easy"}],"easeDelta":0.15} %%
%% srs c-000023-02 {"due":"2026-07-21T18:32:09.304Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T18:32:09.304Z","rating":"easy"}],"easeDelta":0.15} %%
%% srs c-000023-03 {"due":"2026-07-21T18:32:16.501Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T18:32:16.501Z","rating":"easy"}],"easeDelta":0.15} %%
%% srs c-000023-04 {"due":"2026-07-21T18:32:34.737Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T18:32:34.737Z","rating":"easy"}],"easeDelta":0.15} %%
%% srs c-000023-05 {"due":"2026-07-18T18:32:46.827Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T18:32:46.827Z","rating":"hard"}],"easeDelta":-0.15} %%
