---
type: zettel
address: "c-000075"
title: "Beam Search"
created: "2026-07-08"
parent: "c-000085"
children: []
tags:
  - llm-fundamentals
  - decoding
subtree_size: 0
cards_due: 0
---

# Beam Search

## Claim

Beam search keeps the $B$ highest-scoring partial hypotheses at each step (expanding each by its top tokens), finding higher-likelihood sequences than greedy; length normalization is needed to stop it favoring short outputs, and it still tends toward generic text for open-ended generation.

## Reasoning

The cumulative score of a hypothesis is $\text{score}(y_{1:t}) = \sum_{i=1}^{t} \log P(y_i \mid y_{<i})$. Because raw log-probabilities are negative and accumulate, longer sequences score lower, so **length normalization** divides by length raised to $\alpha \in [0.6, 1.0]$:

$$\text{score}_{\text{norm}}(y) = \frac{1}{|y|^\alpha} \sum_{i=1}^{|y|} \log P(y_i \mid y_{<i})$$

It explores $B$ paths in parallel and keeps the most promising — excellent for tasks with a single "correct" output (translation, summarization). Downsides: larger $B$ costs more compute, beams often converge to near-identical outputs, and for open-ended generation it still yields generic, repetitive text.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.2

## Cross-references

- Parent: [[Decoding-Methods]]
- Diversity fix: [[Diverse-Beam-Search]]


