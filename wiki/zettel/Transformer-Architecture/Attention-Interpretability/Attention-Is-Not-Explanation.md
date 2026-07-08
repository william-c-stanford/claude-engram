---
type: zettel
id: "20260708221914968968"
title: "Attention Is Not Explanation"
created: "2026-07-08"
parent_id: "20260708221914968954"
child_ids: []
tags:
  - llm-fundamentals
  - interpretability
---

# Attention Is Not Explanation

## Claim

Attention weights often fail to correlate with gradient-based feature importance, and adversarially different attention distributions can yield identical outputs — so attention should be used as a *hypothesis generator*, not a faithful explanation of model behavior.

## Reasoning

Jain and Wallace showed that high attention does not imply high influence: a token can receive large attention weight yet be routed through a near-zero-weight path, contributing little to the output; conversely, distinct attention maps can produce the same prediction. For genuine causal attribution, prefer gradient-based methods, probing classifiers, or mechanistic interpretability ([[Sparse-Autoencoders]], causal tracing) rather than reading attention maps at face value.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.12 (Attention Is Not Explanation)

## Cross-references

- Parent: [[Attention-Interpretability]]
- More faithful tools: [[Sparse-Autoencoders]]
