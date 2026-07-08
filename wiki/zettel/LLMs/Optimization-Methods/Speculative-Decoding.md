---
type: zettel
id: "20260708223500121078"
title: "Speculative Decoding Methods"
created: "2026-07-08"
parent_id: "20260708224425985221"
child_ids:
  - "20260708223500121079"
  - "20260708223500121080"
  - "20260708223500121081"
  - "20260708223500121082"
  - "20260708223500121083"
tags:
  - llm-fundamentals
  - inference
  - speculative-decoding
---

# Speculative Decoding Methods

## Synthesis

Speculative decoding accelerates autoregressive generation 2–3× by having a fast drafter propose several tokens and the target model verify them in a single batched pass — with an accept/reject scheme that provably yields the *identical* output distribution (no quality loss). The methods differ only in the draft source: a separate small model, extra parallel heads (Medusa), a feature-level decoder (Eagle), or an n-gram cache — and the technique pays off mainly for latency-sensitive, single-stream generation.

## Children

- [[Speculative-Decoding-Principle]] — draft, verify, accept/reject, and when not to use it
- [[Speculative-Decoding-Methods-Comparison]] — the draft-source landscape
- [[Medusa]] — extra parallel prediction heads
- [[Eagle]] — feature-level autoregressive drafting
- [[N-Gram-Speculative-Decoding]] — zero-cost cache lookup

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.15

## Cross-references

- Parent: [[Optimization-Methods]]
- Accelerates the [[Decoding-Methods]] loop
- Weight-level complement: [[Model-Compression]]
