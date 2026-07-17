---
type: zettel
address: "c-000058"
title: "Model Size Reference"
created: "2026-07-08"
parent: "c-000072"
children: []
tags:
  - llm-fundamentals
  - transformer
  - reference
subtree_size: 0
cards_due: 0
---

# Model Size Reference

## Claim

Popular open-weight LLMs (2024–2025) span roughly 8B to 671B parameters, 32–126 layers, and $d = 4096$–16384, and most now use 8 shared KV heads (GQA) with 128K+ context; MoE models report far fewer *active* than total parameters.

## Reasoning

| Model | Params | Layers | $d$ | Heads | KV Heads | Context |
|---|---|---|---|---|---|---|
| Llama-3.1 8B | 8B | 32 | 4096 | 32 | 8 | 128K |
| Llama-3.1 405B | 405B | 126 | 16384 | 128 | 8 | 128K |
| Llama-4 Maverick | 400B (17B active) | 48 | 5120 | 40 | 8 | 1M |
| Mistral Large 2 | 123B | 88 | 12288 | 96 | 8 | 128K |
| Qwen-2.5 72B | 72B | 80 | 8192 | 64 | 8 | 128K |
| DeepSeek-V3 | 671B (37B active) | 61 | 7168 | 128 | MLA | 128K |

Two design signals recur: **"active" parameters** mark Mixture-of-Experts models where total params measure capacity but active params measure per-token compute (see [[Mixture-of-Experts]]); and **KV-head count** of 8 reflects near-universal adoption of Grouped-Query Attention (see [[Multi-Head-Attention]]). DeepSeek-V3's **MLA** (Multi-head Latent Attention) instead compresses KV into a low-rank latent space.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.10

## Cross-references

- Parent: [[Transformer-Architecture]]
- [[Mixture-of-Experts]] · [[Multi-Head-Attention]]


