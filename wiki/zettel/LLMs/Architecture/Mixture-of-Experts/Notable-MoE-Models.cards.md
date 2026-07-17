---
type: flashcards
note_address: "c-000025"
note_title: "Notable MoE Models"
format: 1
---

### card c-000025-01
type: mcq

Which open-weight MoE model matches Llama-2 70B quality while activating only ~13B parameters per token?

- [ ] Switch Transformer
- [x] Mixtral 8×7B
- [ ] DBRX
- [ ] Qwen-MoE

### card c-000025-02
type: cloze

Mixtral 8×7B has {{c::47}}B total parameters, {{c::13}}B active, with 8 experts routed Top-2.

### card c-000025-03
type: free

**Prompt**

What is the "fine-grained expert" trend in recent MoE models (DeepSeek-V2, Qwen-MoE, DBRX), and why is it winning?

**Answer**

More, smaller experts with higher $K$ — e.g. DeepSeek-V2's 160 experts routed Top-6 — instead of a few large experts. Smaller experts specialize better and balance load more evenly across devices.

### card c-000025-04
type: mcq

What made Switch Transformer notable in MoE history?

- [x] First large-scale MoE, with simplified Top-1 routing at 1.6T total parameters
- [ ] First open-weight MoE to beat a dense 70B model
- [ ] Introduced shared + routed experts (DeepSeekMoE)
- [ ] First MoE to use Gumbel-Softmax routing
