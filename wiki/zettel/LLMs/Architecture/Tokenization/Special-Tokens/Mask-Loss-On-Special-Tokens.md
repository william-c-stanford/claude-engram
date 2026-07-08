---
type: zettel
id: "20260708215912548087"
title: "Mask Loss on Special Tokens"
created: "2026-07-08"
parent_id: "20260708215912482649"
child_ids: []
tags:
  - llm-fundamentals
  - tokenization
---

# Mask Loss on Special Tokens

## Claim

During supervised fine-tuning, the loss should not be computed on structural tokens (role markers, separators) — the model should not "learn" to predict formatting, only content.

## Reasoning

Structural tokens are inserted by the chat template, not generated as a modeling decision. If the SFT loss $\mathcal{L}$ rewards predicting them, the model spends capacity memorizing template scaffolding instead of the response content that matters. Masking those positions (label $= -100$ in typical frameworks) confines the gradient signal to the tokens the model actually needs to generate.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.6

## Cross-references

- Parent: [[Special-Tokens]]
- The tokens being masked: [[Special-Token-Inventory]]
