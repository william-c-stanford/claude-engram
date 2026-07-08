---
type: zettel
id: "20260708222835675663"
title: "SFT Is Not Enough"
created: "2026-07-08"
parent_id: "20260708222835675658"
child_ids: []
tags:
  - llm-fundamentals
  - sft
  - rlhf
---

# SFT Is Not Enough

## Claim

SFT teaches format and basic instruction following but cannot reliably teach preference, refusal, calibration, or complex multi-step reasoning — so the full alignment pipeline is Pretrain → SFT → RLHF/DPO.

## Reasoning

Four capabilities SFT alone cannot instill, each needing a reward or preference signal SFT lacks:

- **Preference** — which of two responses is better (needs RLHF/DPO).
- **Refusal** — when *not* to answer (needs safety training).
- **Calibration** — saying "I don't know" (needs RL with truthfulness rewards).
- **Complex reasoning** — multi-step chains (needs RL with verifiable rewards).

SFT provides a competent, well-formatted starting policy; the reinforcement-learning phase then shapes the harder-to-supervise behaviors.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.8.5 (SFT Is Not Enough)

## Cross-references

- Parent: [[Supervised-Fine-Tuning]]
- Safety phase: [[Safety-Training-Pipeline]]
