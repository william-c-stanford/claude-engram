---
type: zettel
address: "c-000150"
title: "Supervised Fine-Tuning (SFT)"
created: "2026-07-08"
parent: "c-000151"
children:
  - "c-000149"
  - "c-000145"
  - "c-000147"
  - "c-000146"
  - "c-000148"
tags:
  - llm-fundamentals
  - sft
  - training
---

# Supervised Fine-Tuning (SFT)

## Synthesis

SFT is the bridge from a raw next-token predictor to an instruction-following assistant: it trains on curated prompt–response pairs with the same CLM loss, but masked to the response. Its dominant lesson is that *data quality beats quantity* (LIMA), it is made cheap by fused-kernel efficiency libraries, and it has hard limits — SFT teaches format and basic instruction following but cannot teach preference, refusal, calibration, or complex reasoning, which is why the full pipeline continues into RLHF/DPO.

## Children

- [[SFT-Objective]] — CLM loss computed only on response tokens
- [[LIMA-Principle]] — 1,000 curated examples beat 50K noisy ones
- [[SFT-Efficient-Training]] — Liger Kernel, Unsloth, torchtune
- [[SFT-Best-Practices]] — packing, NEFTune, chat templates, epoch counts
- [[SFT-Is-Not-Enough]] — what SFT cannot teach, and the full pipeline

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.8

## Cross-references

- Parent: [[Optimization-Methods]]
- Previous phase: [[Pretraining]]
- Head it trains: [[Conditional-Generation-Head]]
