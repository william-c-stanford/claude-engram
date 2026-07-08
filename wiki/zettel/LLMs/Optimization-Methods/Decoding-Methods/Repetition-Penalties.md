---
type: zettel
id: "20260708223105938836"
title: "Repetition Penalties"
created: "2026-07-08"
parent_id: "20260708223105938827"
child_ids: []
tags:
  - llm-fundamentals
  - decoding
---

# Repetition Penalties

## Claim

Orthogonal to the sampling strategy, repetition penalties push the logits of already-generated tokens toward zero to discourage repetition; the multiplicative form divides/multiplies by a factor $\theta > 1$, while OpenAI's additive frequency/presence penalties subtract a term proportional to (or flat for) prior occurrences.

## Reasoning

Multiplicative penalty on the raw logit $z_v$ of a previously generated token:

$$z'_v = \begin{cases} z_v / \theta & z_v > 0 \\ z_v \cdot \theta & z_v < 0 \end{cases}$$

with $\theta$ typically 1.1–1.3 — in both cases pushing the logit toward zero, lowering the token's probability. The additive OpenAI variant:

$$z'_v = z_v - \alpha \cdot \text{count}(v) - \beta \cdot \mathbb{1}[v \in \text{generated}]$$

where $\alpha$ is the frequency penalty (scales with how many times $v$ appeared) and $\beta$ is the presence penalty (flat penalty for any prior occurrence).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.9

## Cross-references

- Parent: [[Decoding-Methods]]
- Diversity role: [[Sampling-Diversity]]
