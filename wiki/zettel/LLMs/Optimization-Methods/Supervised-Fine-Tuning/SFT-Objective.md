---
type: zettel
address: "c-000149"
title: "SFT Objective"
created: "2026-07-08"
parent: "c-000150"
children: []
tags:
  - llm-fundamentals
  - sft
subtree_size: 0
cards_due: 0
---

# SFT Objective

## Claim

The SFT loss is identical to the pretraining CLM loss but computed only on the **response** tokens; prompt tokens provide context but receive no gradient (their labels are set to $-100$).

## Reasoning

$$\mathcal{L}_{\text{SFT}} = -\frac{1}{|y|} \sum_{t=1}^{|y|} \log P_\theta(y_t \mid x_{\text{prompt}}, y_{<t})$$

Masking the prompt is the entire mechanistic difference from pretraining: the model is not rewarded for predicting the instruction, only for producing a good response conditioned on it. This is the loss-masking that turns a text predictor into an assistant (the head that implements it is the [[Conditional-Generation-Head]]).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.8.1

## Cross-references

- Parent: [[Supervised-Fine-Tuning]]
- Head: [[Conditional-Generation-Head]]; pretraining version: [[Pretraining-Objective]]


