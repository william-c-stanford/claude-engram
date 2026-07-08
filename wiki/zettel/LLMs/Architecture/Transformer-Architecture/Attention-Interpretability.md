---
type: zettel
id: "20260708221914968954"
title: "Attention Interpretability"
created: "2026-07-08"
parent_id: "20260708221914968943"
child_ids:
  - "20260708221914968967"
  - "20260708221914968968"
  - "20260708221914968969"
  - "20260708221914968970"
tags:
  - llm-fundamentals
  - transformer
  - interpretability
---

# Attention Interpretability

## Synthesis

Attention weights are the cheapest window into what a model "looks at," but they are a weak explanation — high attention is not high influence. Interpretability is therefore a stack that trades cost against faithfulness: attention maps → probing → sparse autoencoders → natural-language autoencoders → causal tracing. The children cover the reading methods, the key caveat, and the two feature-decomposition approaches.

## Children

- [[Attention-Visualization-Methods]] — raw maps, rollout, gradient-weighted attention
- [[Attention-Is-Not-Explanation]] — why attention weights mislead
- [[Sparse-Autoencoders]] — decomposing polysemantic activations into monosemantic features
- [[Natural-Language-Autoencoders]] — self-interpreting features as text descriptions

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.12

## Cross-references

- Parent: [[Transformer-Architecture]]
- Retrieval-head pruning links to [[Attention-Head-Roles]].
