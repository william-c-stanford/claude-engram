---
type: zettel
address: "c-000143"
title: "Speculative Decoding Principle"
created: "2026-07-08"
parent: "c-000144"
children: []
tags:
  - llm-fundamentals
  - speculative-decoding
subtree_size: 0
cards_due: 0
---

# Speculative Decoding Principle

## Claim

A fast drafter proposes $k$ candidate tokens, the target model scores all $k$ in one batched pass, and an accept/reject rule ($\text{accept if } P_{\text{target}}(\hat{x}_i) \ge r_i P_{\text{draft}}(\hat{x}_i)$, $r_i \sim U[0,1]$) keeps a prefix and resamples at the first rejection — provably preserving the target distribution exactly.

## Reasoning

The framework: (1) drafter proposes $\hat{x}_1, \dots, \hat{x}_k$; (2) target runs one forward pass on all $k$; (3) verify left-to-right, accepting while $P_{\text{target}}(\hat{x}_i) \ge r_i \cdot P_{\text{draft}}(\hat{x}_i)$; (4) at the first rejection at $j$, resample $x_j$ from an adjusted distribution and discard $\hat{x}_{j+1..k}$. This acceptance scheme guarantees the final distribution equals $P_{\text{target}}$ — the speedup is free of quality cost.

With acceptance rate $\alpha$, expected tokens per step is $\frac{1 - \alpha^{k+1}}{1 - \alpha}$; at $\alpha = 0.8$, $k=5$ that is ~3.4 tokens/step versus 1 for standard decoding.

**When *not* to use it:** high batch sizes ($\ge 64$, already compute-efficient); a draft too dissimilar to the target (acceptance <50% is slower than standard); very short outputs (<20 tokens, setup cost dominates). It helps most for latency-sensitive single-stream generation (chatbots, code completion).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.15.1, §1.15.6

## Cross-references

- Parent: [[Speculative-Decoding]]
- Draft-source options: [[Speculative-Decoding-Methods-Comparison]]


