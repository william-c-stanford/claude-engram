---
type: zettel
id: "20260708221914968953"
title: "Attention Pathologies"
created: "2026-07-08"
parent_id: "20260708221914968943"
child_ids:
  - "20260708221914968964"
  - "20260708221914968965"
  - "20260708221914968966"
tags:
  - llm-fundamentals
  - transformer
  - attention
---

# Attention Pathologies

## Synthesis

The softmax attention that makes transformers powerful also produces systematic, predictable failure modes — not bugs but consequences of the mechanism. Two matter most operationally: attention is forced to dump unused mass somewhere (the **sink**), and it spreads too thin over long contexts (**dilution**). A third theme, head **specialization**, explains why some heads are prunable and others are load-bearing.

## Children

- [[Attention-Sink]] — why the first token soaks up 20–50% of attention
- [[Attention-Dilution]] — the $O(1/n)$ thinning and "lost in the middle"
- [[Attention-Head-Roles]] — induction, retrieval, and specialized heads

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.11

## Cross-references

- Parent: [[Transformer-Architecture]]
- Sink handling drives [[Long-Context-Extension]] KV-cache strategies (StreamingLLM).
