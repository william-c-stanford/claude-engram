---
type: zettel
address: "c-000069"
title: "Scaled Dot-Product Attention"
created: "2026-07-08"
parent: "c-000070"
children: []
tags:
  - llm-fundamentals
  - attention
subtree_size: 0
cards_due: 0
---

# Scaled Dot-Product Attention

## Claim

Each position projects its input into a query, key, and value; the attention output is a softmax-weighted average of values where the weights are scaled query-key dot products, and a **causal mask** sets future positions to $-\infty$ so an autoregressive model attends only to the past.

## Reasoning

From input $X \in \mathbb{R}^{n \times d}$ we form $Q = X W_Q$, $K = X W_K$, $V = X W_V$ with $W_Q, W_K, W_V \in \mathbb{R}^{d \times d_k}$, then

$$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}} + M\right) V$$

The $\sqrt{d_k}$ divisor keeps dot-product magnitudes (and thus softmax gradients) stable as $d_k$ grows. The causal mask is

$$M_{ij} = \begin{cases} 0 & i \ge j \ (\text{can attend}) \\ -\infty & i < j \ (\text{future token, blocked}) \end{cases}$$

During training the whole target sequence is processed in parallel (teacher forcing), and the mask is what preserves causality — token $t$ uses only tokens $1, \dots, t-1$. At inference tokens are produced one at a time, so the mask is implicit.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.5

## Cross-references

- Parent: [[Self-Attention]]
- Cost of this operation: [[Attention-Quadratic-Cost]]
- Cross-attention drops the mask: [[Encoder-Decoder-vs-Decoder-Only]]


