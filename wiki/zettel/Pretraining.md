---
type: zettel
id: "20260708222835675652"
title: "Pretraining"
created: "2026-07-08"
parent_id: ""
child_ids:
  - "20260708222835675653"
  - "20260708222835675654"
  - "20260708222835675655"
  - "20260708222835675656"
  - "20260708222835675657"
tags:
  - llm-fundamentals
  - pretraining
  - training
---

# Pretraining

## Synthesis

Pretraining is the most expensive phase of LLM development — millions of GPU-hours — and it is where raw capability comes from: a single self-supervised objective (next-token prediction) applied to trillions of carefully curated tokens produces emergent abilities. Doing it well is an orchestration problem across a simple objective, a data pipeline, scaling-law-guided sizing, a small set of hyperparameters, and vigilance against a few characteristic failure modes.

## Children

- [[Pretraining-Objective]] — causal language modeling and emergent capability
- [[Pretraining-Data-Pipeline]] — scale, sources, dedup, filtering, mixing
- [[Scaling-Laws]] — the compute-optimal balance of model and data size
- [[Pretraining-Hyperparameters]] — published settings from frontier models
- [[Pretraining-Failure-Modes]] — loss spikes, memorization, context mismatch

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.7

## Cross-references

- Uses the [[Language-Modeling-Head]] and [[Optimization-Theory]]
- Next phase: [[Supervised-Fine-Tuning]]
