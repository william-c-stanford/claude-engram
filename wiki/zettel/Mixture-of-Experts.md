---
type: zettel
id: "20260708223105938818"
title: "Mixture of Experts (MoE)"
created: "2026-07-08"
parent_id: ""
child_ids:
  - "20260708223105938819"
  - "20260708223105938820"
  - "20260708223105938821"
  - "20260708223105938822"
tags:
  - llm-fundamentals
  - moe
  - architecture
---

# Mixture of Experts (MoE)

## Synthesis

MoE scales model *capacity* without scaling per-token *compute*: it replaces the block's FFN with many parallel expert FFNs and a router that activates only a few per token, so total parameters grow with the expert count while active parameters stay small. The design problems it creates are all about the router — keeping experts evenly used (load balancing) and making a discrete top-K selection trainable (noisy gating) — and the payoff is visible in models like Mixtral and DeepSeek-V2.

## Children

- [[MoE-Architecture]] — expert FFNs, the router, and active vs. total parameters
- [[MoE-Load-Balancing]] — expert collapse and the auxiliary balancing loss
- [[Noisy-Top-K-Gating]] — making discrete routing differentiable
- [[Notable-MoE-Models]] — Switch, Mixtral, DeepSeek-V2, Qwen-MoE, DBRX

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.10

## Cross-references

- Replaces the dense [[Feed-Forward-Network]]
- "Active param" models in [[Model-Size-Reference]]
