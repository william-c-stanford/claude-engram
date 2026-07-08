---
type: zettel
id: "20260708221914968971"
title: "Prediction Heads"
created: "2026-07-08"
parent_id: ""
child_ids:
  - "20260708221914968972"
  - "20260708221914968973"
  - "20260708221914968974"
  - "20260708221914968975"
tags:
  - llm-fundamentals
  - training
---

# Prediction Heads

## Synthesis

The transformer body produces a contextual hidden state $h_t \in \mathbb{R}^d$ per position; what you *do* with it — the prediction head — defines the task, and the same backbone serves radically different purposes by swapping the head. Three heads recur across pretraining and RL: two project to vocabulary logits ($\mathbb{R}^{|V|}$, differing only in loss masking) and two produce a scalar ($\mathbb{R}^1$). This note indexes them.

## Children

- [[Language-Modeling-Head]] — cross-entropy over the next token, for pretraining
- [[Conditional-Generation-Head]] — same projection, loss on response tokens only (SFT)
- [[Value-Head]] — scalar state-value regression for PPO/GRPO
- [[Reward-Head]] — scalar response score from pairwise ranking (RM training)

## Head selection summary

| Head | Output | Loss | Stage | Purpose |
|---|---|---|---|---|
| LM | $\mathbb{R}^{|V|}$ | cross-entropy (all tokens) | Pretraining | Learn language from raw text |
| Conditional | $\mathbb{R}^{|V|}$ | cross-entropy (response only) | SFT | Learn to follow instructions |
| Value | $\mathbb{R}^1$ | MSE | RL (PPO) | Estimate state value for advantage |
| Reward | $\mathbb{R}^1$ | pairwise ranking | RM training | Score response quality |

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.4

## Cross-references

- Consumes hidden states from [[Transformer-Architecture]]
- Final stage of the [[LLM-Pipeline-Overview]]
