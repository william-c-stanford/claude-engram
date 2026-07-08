---
type: zettel
id: "20260708223500121083"
title: "N-gram Speculative Decoding"
created: "2026-07-08"
parent_id: "20260708223500121078"
child_ids: []
tags:
  - llm-fundamentals
  - speculative-decoding
---

# N-gram Speculative Decoding

## Claim

The simplest speculative decoding needs no extra model or training: maintain an n-gram cache of the prompt and generated text, and when the current context's last $n-1$ tokens match a cached n-gram, propose its continuation as the draft — essentially zero cost, ideal for repetitive outputs.

## Reasoning

Steps: (1) cache n-grams from the prompt and previously generated text; (2) at each step, check whether the last $n-1$ tokens match a cached n-gram; (3) if so, propose the stored continuation as draft tokens; (4) verify against the target model as usual. Because the "drafter" is a hash lookup, cost is essentially zero. It shines on **code generation** (repetitive patterns), **structured output** (JSON/XML), and prompts with repeated elements — anywhere the next tokens have likely appeared before.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.15.5

## Cross-references

- Parent: [[Speculative-Decoding]]
- Landscape: [[Speculative-Decoding-Methods-Comparison]]
