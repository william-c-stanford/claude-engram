---
type: zettel
address: c-000024
title: Noisy Top-K Gating
created: 2026-07-08
parent: c-000026
children: []
tags:
  - llm-fundamentals
  - moe
subtree_size: 0
cards_due: 5
---

# Noisy Top-K Gating

## Claim

Top-$K$ expert selection is non-differentiable — the *choice* of which experts to pick has zero gradient — so an unselected expert never gets signal and never gets selected; adding learned Gaussian noise to the router logits before selection occasionally promotes underdog experts, giving them gradient and breaking the deadlock.

## Reasoning

The router's gate weights get gradients through the softmax over *selected* experts, but the selection decision itself does not, which can strand experts permanently. **Noisy Top-K gating** injects noise into the logits before the top-$K$:

$$H(x) = W_g x + \epsilon \cdot \text{Softplus}(W_{\text{noise}} x), \quad \epsilon \sim \mathcal{N}(0,1)$$

then $g(x) = \text{softmax}(\text{TopK}(H(x), k))$. $W_{\text{noise}}$ is a *learned* per-expert exploration magnitude (Softplus keeps it positive); at inference the noise is removed for deterministic routing. An alternative, the **Gumbel-Softmax** relaxation, replaces $\arg\max$ with a temperature-controlled softmax over $(\log\pi_i + G_i)$ (Gumbel noise), annealing temperature $\tau$ from 1.0 toward 0.1–0.5, often with a straight-through estimator (hard forward, soft backward). Both solve the same problem via noise injection: Gaussian noise (Mixtral, DeepSeek-V2) is simpler; Gumbel has stronger categorical-sampling guarantees.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.10.3

## Cross-references

- Parent: [[Mixture-of-Experts]]
- Complements: [[MoE-Load-Balancing]]


