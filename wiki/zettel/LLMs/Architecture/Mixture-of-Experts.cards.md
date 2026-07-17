---
type: flashcards
note_address: "c-000026"
note_title: "Mixture of Experts (MoE)"
format: 1
---

### card c-000026-01
type: free

**Prompt**

What does a Mixture-of-Experts layer decouple, and what is the architectural trick that achieves it?

**Answer**

It decouples model *capacity* from per-token *compute*: the block's single FFN is replaced by many parallel expert FFNs plus a router that activates only a few per token, so total parameters grow with the expert count while active parameters stay small.

### card c-000026-02
type: cloze

The two design problems MoE creates are both about the router: ({{c::load balancing}}) is the problem of keeping experts evenly used and ({{c::noisy gating}}) is the difficulty associated with making a discrete top-K selection trainable .

### card c-000026-03
type: mcq

Which component of a MoE layer is the source of its main training difficulties?

- [ ] The expert FFNs, because they are too small to train stably
- [x] The router, because uniform utilization and differentiable selection both have to be engineered
- [ ] The attention block, because experts change its head dimension
- [ ] The embedding layer, because vocabulary must be split across experts
%% srs c-000026-02 {"due":"2026-07-18T18:31:44.067Z","interval":1,"ease":1.9,"reviews":[{"at":"2026-07-17T17:58:48.089Z","rating":"again"},{"at":"2026-07-17T17:59:27.722Z","rating":"again"},{"at":"2026-07-17T18:01:50.685Z","rating":"again"},{"at":"2026-07-17T18:31:44.067Z","rating":"good"}],"easeDelta":-0.6000000000000001} %%
%% srs c-000026-03 {"due":"2026-07-18T17:59:03.776Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T17:59:03.776Z","rating":"good"}]} %%
%% srs c-000026-01 {"due":"2026-07-18T18:19:16.945Z","interval":1,"ease":2.15,"reviews":[{"at":"2026-07-17T17:59:55.779Z","rating":"again"},{"at":"2026-07-17T18:19:16.945Z","rating":"hard"}],"easeDelta":-0.35} %%
