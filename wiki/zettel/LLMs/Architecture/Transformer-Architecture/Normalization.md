---
type: zettel
address: "c-000061"
title: "Normalization"
created: "2026-07-08"
parent: "c-000072"
children:
  - "c-000059"
  - "c-000060"
tags:
  - llm-fundamentals
  - transformer
  - normalization
subtree_size: 2
cards_due: 0
---

# Normalization

## Synthesis

Normalization is what lets deep transformers train at all: without it, activations grow or shrink exponentially through layers. Two decisions define a model's normalization: *which* normalizer (LayerNorm vs the simpler RMSNorm) and *where* it sits relative to each sublayer (Pre-LN vs Post-LN). Both children below are near-universal choices in modern LLMs.

## Children

- [[LayerNorm-And-RMSNorm]] — feature-dimension normalization and its modern simplification
- [[Pre-LN-vs-Post-LN]] — sublayer placement and its effect on training stability

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.9

## Cross-references

- Parent: [[Transformer-Architecture]]
- Pre-Norm is assumed by the [[Decoder-Only-Block]] residual form.


