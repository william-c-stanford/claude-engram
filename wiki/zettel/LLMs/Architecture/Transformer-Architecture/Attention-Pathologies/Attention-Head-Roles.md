---
type: zettel
address: "c-000051"
title: "Attention Head Roles"
created: "2026-07-08"
parent: "c-000053"
children: []
tags:
  - llm-fundamentals
  - attention
  - interpretability
---

# Attention Head Roles

## Claim

Attention heads specialize into distinct functional roles — syntax, co-reference, positional, induction, and retrieval heads — so heads are not equally important: many are prunable, but pruning induction or retrieval heads damages in-context learning and factual recall respectively.

## Reasoning

Observed head types:

- **Specialized heads** — different heads learn syntax, co-reference, or positional roles; many contribute little and can be pruned.
- **Induction heads** — implement the copy pattern $[A][B]\dots[A] \rightarrow [B]$; they are critical for in-context learning and emerge in 2-layer-and-deeper models.
- **Retrieval heads** — specialize in pulling factual information from context; pruning them causes hallucination spikes.
- **Attention collapse** — in deep networks head distributions can converge (all heads attend the same positions), hurting expressivity; addressed with attention-diversity losses.

The practical upshot: pruning is safe only if it avoids the load-bearing induction and retrieval heads.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.11 (Other Attention Phenomena)

## Cross-references

- Parent: [[Attention-Pathologies]]
- Head-count mechanics: [[Multi-Head-Attention]]
- Retrieval-head pruning links to [[Attention-Is-Not-Explanation]]
