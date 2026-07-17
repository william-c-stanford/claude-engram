---
type: zettel
address: "c-000063"
title: "Long-Context Extension"
created: "2026-07-08"
parent: "c-000066"
children: []
tags:
  - llm-fundamentals
  - positional-encoding
  - long-context
subtree_size: 0
cards_due: 0
---

# Long-Context Extension

## Claim

Extending a model to 100K–1M tokens without full retraining relies mostly on **rescaling RoPE frequencies** (Position Interpolation, NTK-aware, YaRN, Dynamic NTK), backed by a short continued-pretraining phase on long data and, for extreme lengths, distributing attention across GPUs (Ring Attention).

## Reasoning

**RoPE frequency scaling** rescales the base so trained rotations still cover the longer range, $\theta'_i = \theta_i \cdot (L_{\text{target}}/L_{\text{train}})^{2i/d}$:

- **Linear scaling / Position Interpolation** — divide position indices by a factor $s$; cheap but loses resolution at high ratios.
- **NTK-aware** — scale the base $\theta = 10000 \rightarrow 10000 \cdot s^{d/(d-2)}$, stretching low frequencies (global range) while preserving high frequencies (local detail).
- **YaRN** — NTK scaling plus an attention-temperature correction $t = 0.1\ln(s) + 1$ and a little long-context fine-tuning; used by Llama-3 to reach 128K from 8K training.
- **Dynamic NTK** — adjust the scaling factor on the fly by actual sequence length.

Beyond positional support, models also need **continued pretraining** on long documents (1–5B tokens, e.g. Llama-3.1's $8\text{K} \rightarrow 64\text{K} \rightarrow 128\text{K}$ schedule) to actually *use* distant context; **Ring Attention** distributes a sequence across GPUs in a ring for 1M+ tokens; and **hybrid** stacks mix local sliding windows with occasional full-attention layers. Note that a large context window does not guarantee effective use — see [[Attention-Dilution]].

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.3.7 (length extension & scaling)

## Cross-references

- Parent: [[Positional-Encodings]]
- Scales: [[RoPE]]
- Usage limit: [[Attention-Dilution]] (lost in the middle)


