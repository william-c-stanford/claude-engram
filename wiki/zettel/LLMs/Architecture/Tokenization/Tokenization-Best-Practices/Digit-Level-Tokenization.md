---
type: zettel
address: "c-000039"
title: "Digit-Level Tokenization"
created: "2026-07-08"
parent: "c-000042"
children: []
tags:
  - llm-fundamentals
  - tokenization
---

# Digit-Level Tokenization

## Claim

Tokenizing numbers digit-by-digit (e.g. "2024" → "2", "0", "2", "4") improves arithmetic reasoning, because it lets the model operate on individual digits rather than opaque multi-digit chunks.

## Reasoning

If "2024" is a single token, the model has no positional handle on its digits, so column-wise arithmetic (carries, place value) is hard to learn. Splitting to digits exposes the place-value structure the model needs to add, subtract, and compare numbers reliably. Several modern tokenizers special-case digits for exactly this reason.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.4

## Cross-references

- Parent: [[Tokenization-Best-Practices]]
