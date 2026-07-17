---
type: zettel
address: "c-000023"
title: "MoE Load Balancing"
created: "2026-07-08"
parent: "c-000026"
children: []
tags:
  - llm-fundamentals
  - moe
subtree_size: 0
cards_due: 0
---

# MoE Load Balancing

## Claim

Left unconstrained, an MoE router collapses onto a few favored experts, wasting capacity and unbalancing GPUs (experts usually live on different devices); an auxiliary load-balancing loss that rewards uniform utilization prevents this.

## Reasoning

"Expert collapse" is self-reinforcing: an expert that is used more gets more gradient and improves, attracting yet more tokens. The auxiliary loss counteracts it:

$$\mathcal{L}_{\text{bal}} = \alpha \cdot N \sum_{i=1}^{N} f_i \cdot p_i$$

where $f_i$ is the fraction of tokens routed to expert $i$ and $p_i$ is the mean router probability for expert $i$. Minimizing the product of "how often chosen" and "how confidently chosen" pushes utilization toward uniform, keeping all experts trained and all GPUs busy. Switch Transformer relies on this loss alone (with Top-1 routing and no noise).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.10.2

## Cross-references

- Parent: [[Mixture-of-Experts]]
- The other routing challenge: [[Noisy-Top-K-Gating]]


