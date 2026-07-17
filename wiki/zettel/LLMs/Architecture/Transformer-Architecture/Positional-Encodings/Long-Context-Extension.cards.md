---
type: flashcards
note_address: "c-000063"
note_title: "Long-Context Extension"
format: 1
---

### card c-000063-01
type: mcq

What is the primary mechanism for extending a model to 100K–1M tokens without full retraining?

- [x] Rescaling RoPE frequencies (Position Interpolation, NTK-aware, YaRN, Dynamic NTK), plus a short continued-pretraining phase on long data
- [ ] Switching from RoPE to learned absolute encodings
- [ ] Adding more attention heads
- [ ] Enlarging the vocabulary

### card c-000063-02
type: free

**Prompt**

Contrast linear Position Interpolation with NTK-aware RoPE scaling.

**Answer**

Position Interpolation divides the position indices by a factor $s$ — cheap, but it loses resolution at high ratios. NTK-aware scaling instead stretches the base ($\theta = 10000 \rightarrow 10000 \cdot s^{d/(d-2)}$), stretching the low frequencies (global range) while preserving the high frequencies (local detail).

### card c-000063-03
type: cloze

{{c::YaRN}} combines NTK scaling with an attention-temperature correction $t = 0.1\ln(s) + 1$ and a little long-context fine-tuning; Llama-3 used it to reach 128K from 8K training.

### card c-000063-04
type: mcq

What role does Ring Attention play in long-context extension?

- [x] It distributes a single sequence across GPUs in a ring to reach 1M+ tokens
- [ ] It rescales RoPE frequencies dynamically by sequence length
- [ ] It compresses the KV cache into a low-rank latent
- [ ] It replaces softmax attention with a recurrence
