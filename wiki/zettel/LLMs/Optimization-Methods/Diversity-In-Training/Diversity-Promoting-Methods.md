---
type: zettel
address: "c-000086"
title: "Diversity-Promoting Methods"
created: "2026-07-08"
parent: "c-000089"
children: []
tags:
  - llm-fundamentals
  - diversity
---

# Diversity-Promoting Methods

## Claim

The diversity mechanisms consolidate into a short menu spanning both generation and data: temperature scaling, top-$p$/min-$p$, frequency penalties, data deduplication, multi-domain mixing, and verbalized sampling (prompting the model to state an explicit distribution over responses).

## Reasoning

| Method | How it promotes diversity |
|---|---|
| Temperature scaling | Higher $\tau$ flattens the distribution; more tokens become plausible |
| Top-$p$ / Min-$p$ | Adaptive thresholds allow wider sampling when the model is uncertain |
| Frequency penalty | Penalizes repeated tokens, forcing lexical variety within a response |
| Data deduplication | Removing near-duplicates prevents overfitting to specific patterns |
| Multi-domain mixing | Temperature-weighted sampling across domains ensures broad coverage |
| Verbalized sampling | Prompt the model to verbalize a probability distribution over responses |

The first three act at generation time; the next two at data time; verbalized sampling is a prompting technique that surfaces the model's own uncertainty.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.11.3

## Cross-references

- Parent: [[Diversity-In-Training]]
- Generation knobs: [[Sampling-Diversity]]; data knobs: [[Training-Data-Diversity]]
