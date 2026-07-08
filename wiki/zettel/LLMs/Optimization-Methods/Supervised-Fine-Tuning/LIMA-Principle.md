---
type: zettel
id: "20260708222835675660"
title: "LIMA Principle"
created: "2026-07-08"
parent_id: "20260708222835675658"
child_ids: []
tags:
  - llm-fundamentals
  - sft
  - data
---

# LIMA Principle

## Claim

The LIMA result showed that ~1,000 carefully curated SFT examples can match models trained on 50K+ noisy examples — so for SFT, data *quality* dominates quantity.

## Reasoning

The alignment "knowledge" is largely already in the pretrained model; SFT mainly teaches format and style, which a small, excellent dataset conveys as well as a large messy one. The quality requirements are concrete:

- **Diversity** — cover QA, summarization, code, math, creative writing, multi-turn dialogue.
- **Correctness** — every response factually accurate and well-formatted.
- **Length balance** — mix short (one-sentence) and long (multi-paragraph) responses.
- **Decontamination** — remove any overlap with evaluation benchmarks.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.8.2

## Cross-references

- Parent: [[Supervised-Fine-Tuning]]
- Related lens: [[Training-Data-Diversity]]
