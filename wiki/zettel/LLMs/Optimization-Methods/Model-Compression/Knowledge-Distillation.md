---
type: zettel
address: "c-000110"
title: "Knowledge Distillation"
created: "2026-07-08"
parent: "c-000113"
children: []
tags:
  - llm-fundamentals
  - compression
  - distillation
---

# Knowledge Distillation

## Claim

Distillation transfers a large teacher's behavior into a smaller student by training on the teacher's *soft* output distribution (temperature-scaled), whose "dark knowledge" about which errors are reasonable carries far richer signal than hard labels — via offline, online, black-box, or self-distillation paradigms.

## Reasoning

Softening the teacher logits with temperature $T > 1$ exposes near-miss alternatives:

$$p_i^{(T)} = \frac{\exp(z_i/T)}{\sum_j \exp(z_j/T)}, \qquad \mathcal{L}_{\text{distill}} = \alpha T^2 \cdot \text{KL}\!\left(P^{(T)}_{\text{teacher}} \,\|\, P^{(T)}_{\text{student}}\right) + (1-\alpha)\,\mathcal{L}_{\text{CE}}(y, P^{(1)}_{\text{student}})$$

The $T^2$ factor compensates for softened distributions' reduced gradient magnitude; typical $T \in [2,20]$, $\alpha \in [0.5, 0.9]$. **Dark knowledge:** after "The capital of France is", hard labels say only "Paris", but the teacher's 5% "Lyon" / 2% "Marseille" / ~0 "banana" tells the student which errors are reasonable, improving calibration.

Paradigms: **offline/white-box** (precompute teacher logits, most data-efficient, but stale/storage-heavy), **online/co-training** (fresh logits, adapts to student weaknesses, 2× compute), **black-box/API** (only text outputs — effectively SFT on generations, loses dark knowledge), **self-distillation** (same family, e.g. 70B→8B; no new knowledge, teacher ceiling). Diminishing returns below ~10% of teacher params; combining with 4-bit quantization reaches near-teacher quality at ~20× compression.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.14.3

## Cross-references

- Parent: [[Model-Compression]]
- Layer-contrast cousin at decode time: [[Contrastive-Decoding]]
