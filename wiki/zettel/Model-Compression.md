---
type: zettel
id: "20260708223500121074"
title: "Model Compression Methods"
created: "2026-07-08"
parent_id: ""
child_ids:
  - "20260708223500121075"
  - "20260708223500121076"
  - "20260708223500121077"
tags:
  - llm-fundamentals
  - compression
  - inference
---

# Model Compression Methods

## Synthesis

Model compression cuts size and inference cost while preserving quality through three complementary levers: **quantization** (lower numerical precision), **pruning** (remove parameters), and **knowledge distillation** (train a smaller student to mimic a larger teacher). They compose — a distilled, 4-bit, 50%-sparse model multiplies the savings — and each trades compression ratio against quality degradation differently.

## Children

- [[Quantization]] — reduce weight/activation precision (W4A16 sweet spot)
- [[Pruning]] — remove redundant weights (unstructured, structured, 2:4)
- [[Knowledge-Distillation]] — transfer a teacher's soft distribution to a student

## 70B compression comparison

| Method | Size | Speed | Quality |
|---|---|---|---|
| BF16 baseline | 140 GB | 1× | 100% |
| FP8 (E4M3) | 70 GB | 2× | 99.5% |
| INT8 (SmoothQuant) | 70 GB | 1.8× | 99% |
| 4-bit (AWQ) | 35 GB | 2.5× | 97–98% |
| 2-bit (AQLM) | 17.5 GB | 3× | 90–93% |
| Pruned 50% (2:4) | 70 GB | 1.8× | 97% |
| Distilled 8B | 16 GB | 10× | 80–85% |

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.14

## Cross-references

- Inference-time complement: [[Speculative-Decoding]]
- QLoRA relies on 4-bit quantization: [[LoRA-Variants]]
