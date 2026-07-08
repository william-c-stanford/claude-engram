---
type: zettel
id: "20260708221914968975"
title: "Reward Head"
created: "2026-07-08"
parent_id: "20260708221914968971"
child_ids: []
tags:
  - llm-fundamentals
  - reinforcement-learning
---

# Reward Head

## Claim

The reward head scores an entire response with a single scalar by pooling the last token's hidden state through a classification layer $\mathbb{R}^d \rightarrow \mathbb{R}^1$, and it is trained with a pairwise ranking loss (preferred vs. dispreferred response) to build a reward model for RLHF.

## Reasoning

Unlike the LM/conditional heads that emit per-position logits, the reward head reads the pooled representation of the last token and outputs one number for the whole sequence. It is trained not by regression to a target value but by *ranking*: given a chosen and a rejected response, the loss pushes the chosen score above the rejected score. The resulting reward model then supplies the scalar signal that PPO/GRPO optimize against. In HuggingFace this is `AutoModelForSequenceClassification` with `num_labels=1`.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.4.4, §1.4.5

## Cross-references

- Parent: [[Prediction-Heads]]
- Scalar sibling used inside PPO: [[Value-Head]]
