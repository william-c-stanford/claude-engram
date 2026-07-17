---
type: zettel
address: "c-000028"
title: "Language Modeling Head"
created: "2026-07-08"
parent: "c-000031"
children: []
tags:
  - llm-fundamentals
  - pretraining
subtree_size: 0
cards_due: 0
---

# Language Modeling Head

## Claim

The LM head projects the final hidden state to vocabulary logits and trains with cross-entropy on the next token at every position; general language understanding emerges as a byproduct of this single next-token-prediction objective, and the head's weights are often tied to the embedding matrix.

## Reasoning

$$P(x_{t+1} \mid x_{\le t}) = \text{softmax}(W_{\text{head}} \, h_t + b), \qquad W_{\text{head}} \in \mathbb{R}^{|V| \times d}$$

Training minimizes causal LM loss over all $T$ positions:

$$\mathcal{L}_{\text{LM}} = -\frac{1}{T} \sum_{t=1}^{T} \log P(x_t \mid x_{<t})$$

Every token is simultaneously input (shifted right) and target (shifted left), so one forward pass supplies $T$ prediction targets. This is the pretraining objective, run over trillions of tokens. **Weight tying:** $W_{\text{head}} = E^\top$ reuses the embedding table (see [[Token-Embeddings]]) — fewer parameters, better generalization, and the embedding geometry directly determines token probabilities.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.4.1, §1.4.5

## Cross-references

- Parent: [[Prediction-Heads]]
- Weight tying with [[Token-Embeddings]]
- Same projection, different masking: [[Conditional-Generation-Head]]


