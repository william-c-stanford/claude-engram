---
type: flashcards
note_address: "c-000059"
note_title: "LayerNorm and RMSNorm"
format: 1
---

### card c-000059-01
type: derivation

**Prompt**

Write LayerNorm and RMSNorm for a hidden vector $x \in \mathbb{R}^d$, making clear what RMSNorm drops.

**Answer**

$$\text{LayerNorm}(x) = \gamma \odot \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} + \beta$$

with $\mu, \sigma^2$ computed over the $d$ features. RMSNorm drops the mean-centering and the shift $\beta$:

$$\text{RMSNorm}(x) = \gamma \odot \frac{x}{\text{RMS}(x)}, \qquad \text{RMS}(x) = \sqrt{\tfrac{1}{d}\textstyle\sum_{i} x_i^2}$$

### card c-000059-02
type: free

**Prompt**

What exactly does RMSNorm remove from LayerNorm, and what is the practical payoff?

**Answer**

It removes the mean subtraction ($\mu$) and the learned shift $\beta$, normalizing only by the root-mean-square. That is one fewer reduction per token — 5–10% faster on GPUs at equivalent quality — which is why Llama, Mistral, and Qwen all adopt it.

### card c-000059-03
type: mcq

Why is LayerNorm batch-size independent, unlike BatchNorm?

- [x] It normalizes within a single example across the feature dimension, so it behaves identically in training and inference regardless of batch size
- [ ] It uses running statistics updated per batch
- [ ] It normalizes across the batch dimension only at inference
- [ ] It has no learnable parameters
