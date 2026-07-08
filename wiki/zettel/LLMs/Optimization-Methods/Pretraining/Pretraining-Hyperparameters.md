---
type: zettel
id: "20260708222835675656"
title: "Pretraining Hyperparameters"
created: "2026-07-08"
parent_id: "20260708222835675652"
child_ids: []
tags:
  - llm-fundamentals
  - pretraining
  - reference
---

# Pretraining Hyperparameters

## Claim

Published frontier pretraining runs cluster on a narrow band of settings: 8–18T tokens, million-scale token batches, peak LR of 3e-4 (lower, ~8e-5, for the largest models), weight decay 0.1, and a WSD or cosine schedule.

## Reasoning

| Setting | Llama-3 405B | Llama-3 8B | Qwen-2.5 72B | Mistral 7B |
|---|---|---|---|---|
| Tokens | 15T | 15T | 18T | 8T |
| Batch (tokens) | 16M | 4M | 4M | 4M |
| Peak LR | 8e-5 | 3e-4 | 3e-4 | 3e-4 |
| Schedule | WSD | WSD | Cosine | Cosine |
| Weight decay | 0.1 | 0.1 | 0.1 | 0.1 |
| Context length | 8192 | 8192 | 4096→32K | 8192 |

Two patterns: the very largest model (405B) uses both a *larger* batch (16M tokens) and a *smaller* peak LR (8e-5), and context length is often extended in a later phase (Qwen 4096→32K) rather than trained long from the start.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.7.4

## Cross-references

- Parent: [[Pretraining]]
- Schedules: [[Learning-Rate-Schedules]]; full optimizer table: [[Optimizer-Settings-By-Phase]]
