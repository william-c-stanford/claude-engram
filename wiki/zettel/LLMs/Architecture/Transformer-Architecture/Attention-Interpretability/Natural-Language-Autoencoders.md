---
type: zettel
address: "c-000047"
title: "Natural Language Autoencoders"
created: "2026-07-08"
parent: "c-000049"
children: []
tags:
  - llm-fundamentals
  - interpretability
subtree_size: 0
cards_due: 0
---

# Natural Language Autoencoders

## Claim

Natural Language Autoencoders (NLAEs, Anthropic 2026) replace the SAE's sparse-vector bottleneck with a natural-language description, so features are self-interpreting text ("French cuisine, formal academic tone") rather than directions needing manual labeling.

## Reasoning

An NLAE encoder (a language model) reads activations and emits a natural-language description of the active concepts; a decoder LM reads that description and reconstructs the activations (or predicts the next token); both are trained end-to-end to minimize reconstruction loss, with a variable-length string as the bottleneck.

**Advantages over SAEs:** self-interpreting (features *are* language, no labeling), compositional (can express relational concepts like "a sarcastic response to a factual claim" that a single SAE direction cannot), hierarchical (word- and document-level in one representation), and auditable (the bottleneck is human-readable). **Limitations:** a language-model-in-the-loop is expensive and inherits the faithfulness concerns of any model-generated explanation, and it cannot easily represent sub-symbolic features (geometric patterns, exact magnitudes) that SAEs capture as activation strengths.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.12 (NLAEs)

## Cross-references

- Parent: [[Attention-Interpretability]]
- Predecessor: [[Sparse-Autoencoders]]


