---
type: zettel
address: "c-000050"
title: "Attention Dilution"
created: "2026-07-08"
parent: "c-000053"
children: []
tags:
  - llm-fundamentals
  - attention
  - long-context
---

# Attention Dilution

## Claim

As sequence length $n$ grows, each query must spread a fixed attention budget over more keys, so the average weight per token falls as $O(1/n)$ and the model struggles to concentrate on the few relevant positions — producing the U-shaped "lost in the middle" retrieval curve where information at the start and end is found but the middle is ignored.

## Reasoning

Three compounding causes:

- **Softmax saturation** — with many keys the effective temperature drops, flattening the distribution toward uniform.
- **Positional decay** — RoPE's relative encoding naturally suppresses attention to distant positions, disadvantaging the middle (far from both ends).
- **Training distribution** — models trained on shorter sequences develop recency-biased attention.

**Mitigations:** place critical content at the beginning or end of the prompt (or use RAG to avoid the middle); train on long documents with varied placement of key information; use temperature scaling of attention logits by $\log n$; or adopt architectures that avoid the $O(n^2)$ bottleneck (Mamba, RWKV). This is why a 1M-token context window does not guarantee 1M tokens of *usable* context.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.7 (Long Context ≠ Usage) & §1.3.11 (Attention Dilution)

## Cross-references

- Parent: [[Attention-Pathologies]]
- Positional cause: [[RoPE]]; extension context: [[Long-Context-Extension]]
