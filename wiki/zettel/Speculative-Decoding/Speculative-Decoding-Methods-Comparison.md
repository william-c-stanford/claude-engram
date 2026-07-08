---
type: zettel
id: "20260708223500121080"
title: "Speculative Decoding Methods Comparison"
created: "2026-07-08"
parent_id: "20260708223500121078"
child_ids: []
tags:
  - llm-fundamentals
  - speculative-decoding
  - reference
---

# Speculative Decoding Methods Comparison

## Claim

Speculative-decoding methods differ only in *where the draft comes from* — a separate small model, parallel LM heads, a feature-level decoder, an n-gram cache, Jacobi iteration, or a natively multi-token model — trading setup cost against acceptance rate (and thus speedup, 1.5–4×).

## Reasoning

| Method | Draft source | Speedup | Key idea |
|---|---|---|---|
| Standard | Small model (1–7B) | 2–3× | Separate draft model; simple but loads 2 models |
| Medusa | Parallel LM heads | 2–3× | Add $k$ heads predicting positions $+1,\dots,+k$ |
| Eagle | Feature-level | 2.5–3.5× | Lightweight decoder over target hidden states |
| Eagle-2 | Context-aware | 3–4× | Dynamic draft tree, confidence-based expansion |
| N-gram lookup | N-gram cache | 1.5–2× | Match prompt n-grams; zero cost |
| Lookahead | Jacobi iteration | 2–2.5× | Parallel Jacobi decoding + n-gram verify; no draft model |
| Multi-token | Modified arch | 2–3× | Train model to natively predict multiple tokens |

The general lever: a cheaper, higher-acceptance draft source yields more accepted tokens per verification pass. vLLM exposes standard, n-gram, EAGLE, and MLP-speculator configs.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.15.2, §1.15.6

## Cross-references

- Parent: [[Speculative-Decoding]]
- Detailed methods: [[Medusa]] · [[Eagle]] · [[N-Gram-Speculative-Decoding]]
