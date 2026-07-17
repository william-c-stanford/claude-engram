---
type: zettel
address: "c-000042"
title: "Tokenization Best Practices"
created: "2026-07-08"
parent: "c-000044"
children:
  - "c-000041"
  - "c-000039"
  - "c-000040"
tags:
  - llm-fundamentals
  - tokenization
subtree_size: 3
cards_due: 0
---

# Tokenization Best Practices

## Synthesis

Beyond the choice of algorithm, a handful of practical settings determine whether a tokenizer serves a model well. The three that most affect model quality are the vocabulary size, whether numbers are split to digit level, and measuring fertility to diagnose per-language coverage.

## Children

- [[Vocabulary-Size]] — 32K minimal vs 128K for multilingual/code coverage
- [[Digit-Level-Tokenization]] — splitting numbers digit-by-digit aids arithmetic
- [[Tokenizer-Fertility]] — tokens-per-word as a coverage diagnostic

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.4

## Cross-references

- Parent: [[Tokenization]]


