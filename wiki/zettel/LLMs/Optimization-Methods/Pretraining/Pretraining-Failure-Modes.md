---
type: zettel
address: "c-000125"
title: "Pretraining Failure Modes"
created: "2026-07-08"
parent: "c-000129"
children: []
tags:
  - llm-fundamentals
  - pretraining
subtree_size: 0
cards_due: 0
---

# Pretraining Failure Modes

## Claim

Three characteristic pretraining pitfalls are loss spikes (from bad batches or numerical instability), verbatim memorization of training data, and context-length mismatch between training and deployment.

## Reasoning

- **Loss spikes** — sudden loss increases from a bad data batch or numerical instability; Llama-3 reports rolling back to earlier checkpoints and skipping the offending batches.
- **Memorization** — the model regurgitates training data verbatim; the fix is aggressive deduplication (see [[Pretraining-Data-Pipeline]]) and monitoring for extraction attacks.
- **Context length** — training on short sequences then deploying at long context fails; the fix is continued pretraining on long documents plus RoPE scaling (see [[Long-Context-Extension]]).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.7.5

## Cross-references

- Parent: [[Pretraining]]
- Dedup: [[Pretraining-Data-Pipeline]]; long context: [[Long-Context-Extension]]


