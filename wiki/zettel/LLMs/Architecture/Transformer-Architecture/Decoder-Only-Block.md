---
type: zettel
address: "c-000054"
title: "Decoder-Only Block"
created: "2026-07-08"
parent: "c-000072"
children: []
tags:
  - llm-fundamentals
  - transformer
subtree_size: 0
cards_due: 0
---

# Decoder-Only Block

## Claim

A decoder-only transformer is $L$ identical blocks stacked between an embedding layer and a final projection to vocabulary logits; each block applies a self-attention sublayer and a feed-forward sublayer, and modern LLMs wrap each sublayer in the **Pre-Norm** residual form $x + \text{SubLayer}(\text{LN}(x))$.

## Reasoning

The full forward path is: token IDs → embedding lookup $H_0$ → $L$ blocks → final LayerNorm → linear projection to $\mathbb{R}^{|V|}$ logits. Within a block the two sublayers are attention then FFN, each with its own residual connection.

Pre-Norm (used by GPT-2+, Llama, Mistral) places normalization *before* the sublayer and adds the residual after:

$$x' = x + \text{SubLayer}(\text{LN}(x))$$

This keeps a clean residual highway from input to output, which stabilizes training and removes the need for a learning-rate warmup that the original Post-Norm ordering required (see [[Pre-LN-vs-Post-LN]]). Stacking $L$ such blocks lets context and generation happen in a single causal pass.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.1

## Cross-references

- Parent: [[Transformer-Architecture]]
- Detail: [[Pre-LN-vs-Post-LN]] (why the ordering matters)
- Output stage: [[Prediction-Heads]] (what the final projection computes)


