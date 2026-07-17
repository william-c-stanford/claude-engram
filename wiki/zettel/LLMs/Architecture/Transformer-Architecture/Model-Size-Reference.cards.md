---
type: flashcards
note_address: "c-000058"
note_title: "Model Size Reference"
format: 1
---

### card c-000058-01
type: mcq

A model reports "400B (17B active)" parameters. What does that split indicate?

- [x] It is a Mixture-of-Experts model: total params measure capacity, active params measure per-token compute
- [ ] 17B parameters are frozen during fine-tuning
- [ ] 17B is the size of the KV cache
- [ ] The router itself uses 17B parameters

### card c-000058-02
type: cloze

Across popular 2024–2025 open-weight LLMs, the near-universal KV-head count is {{c::8}}, reflecting broad adoption of Grouped-Query Attention.

### card c-000058-03
type: mcq

DeepSeek-V3's row lists "MLA" instead of a KV-head count. What is MLA?

- [x] Multi-head Latent Attention, which compresses KV into a low-rank latent space
- [ ] A 671B fully dense attention variant
- [ ] Masked Linear Attention for long context
- [ ] Multi-Layer Aggregation of attention heads
