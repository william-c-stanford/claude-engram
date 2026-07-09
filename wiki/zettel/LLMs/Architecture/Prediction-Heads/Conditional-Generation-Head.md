---
type: zettel
address: "c-000027"
title: "Conditional Generation Head"
created: "2026-07-08"
parent: "c-000031"
children: []
tags:
  - llm-fundamentals
  - sft
---

# Conditional Generation Head

## Claim

The SFT head is *architecturally identical* to the LM head — the same projection to vocabulary logits; the only difference is that loss is computed on the response tokens alone, and this single change of masking turns a general text predictor into an instruction-following assistant.

## Reasoning

$$\mathcal{L}_{\text{SFT}} = -\frac{1}{|y|} \sum_{t=1}^{|y|} \log P(y_t \mid x_{\text{prompt}}, y_{<t})$$

Key differences from the LM head:

- **Loss masking** — prompt/instruction tokens provide context but no gradient signal; only response tokens contribute loss (in practice, prompt labels are set to $-100$ so cross-entropy ignores them).
- **Conditioning** — the model learns to generate responses conditioned on specific instruction formats (system prompts, user queries, tool calls).
- **Format tokens** — special tokens like `<|user|>` / `<|assistant|>` steer structured output.

The same head is reused as the policy head in RL that emits actions/responses. Because $W_{\text{head}}$ is unchanged, the head simply learns to "activate" different generation modes based on conditioning context.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.4.2

## Cross-references

- Parent: [[Prediction-Heads]]
- Identical architecture: [[Language-Modeling-Head]]
- Training method that uses it: [[Supervised-Fine-Tuning]]
- Loss masking of structural tokens: [[Mask-Loss-On-Special-Tokens]]
