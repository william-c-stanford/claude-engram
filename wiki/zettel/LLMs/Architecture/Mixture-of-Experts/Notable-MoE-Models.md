---
type: zettel
address: c-000025
title: Notable MoE Models
created: 2026-07-08
parent: c-000026
children: []
tags:
  - llm-fundamentals
  - moe
  - reference
subtree_size: 0
cards_due: 0
---

# Notable MoE Models

## Claim

Production MoE models span Switch Transformer (first large-scale, Top-1), Mixtral 8×7B (open-weight, matches Llama-2 70B at 13B active), and the fine-grained-expert trend (DeepSeek-V2, Qwen-MoE, DBRX) that uses many small experts for efficiency.

## Reasoning

| Model | Total | Active | Experts | Innovation |
|---|---|---|---|---|
| Switch Transformer | 1.6T | 100B | 128, Top-1 | First large-scale MoE; simplified routing |
| Mixtral 8×7B | 47B | 13B | 8, Top-2 | Open-weight; matches Llama-2 70B |
| DeepSeek-V2 | 236B | 21B | 160, Top-6 | Shared + routed experts (DeepSeekMoE) |
| Qwen-MoE | 14.3B | 2.7B | 60, Top-4 | Fine-grained experts for efficiency |
| DBRX | 132B | 36B | 16, Top-4 | Fine-grained, 4 experts per block |

The clear trajectory is toward *more, smaller* experts with higher $K$ (DeepSeek-V2's 160 experts Top-6), which improves specialization and load balance versus a few large experts.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.10.4

## Cross-references

- Parent: [[Mixture-of-Experts]]
- Architecture: [[MoE-Architecture]]; also in [[Model-Size-Reference]]


