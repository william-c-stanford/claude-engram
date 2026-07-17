---
type: zettel
address: "c-000053"
title: "Attention Pathologies"
created: "2026-07-08"
parent: "c-000072"
children:
  - "c-000052"
  - "c-000050"
  - "c-000051"
tags:
  - llm-fundamentals
  - transformer
  - attention
subtree_size: 3
cards_due: 0
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


