---
type: zettel
address: c-000043
title: Why Subword Tokenization
created: 2026-07-08
parent: c-000044
children: []
tags:
  - llm-fundamentals
  - tokenization
subtree_size: 0
cards_due: 0
---

# Why Subword Tokenization

## Claim

Subword tokenization is the granularity sweet spot: it keeps sequences short and the vocabulary manageable (32K–128K) while still handling rare and novel words, which neither character-level nor word-level tokenization can do at once.

## Reasoning

The three granularities trade off against each other:

| Granularity | Vocab | Seq length | Core problem |
|---|---|---|---|
| Character | ~256 | Very long | Attention cost $O(n^2)$; hard to learn long-range semantics |
| Word | ~500K+ | Short | Cannot handle rare/novel words; huge embedding table |
| Subword | 32K–128K | Moderate | — (the balance point) |

Common words stay single tokens ("the"), while rare words decompose into known pieces ("cryptocurrency" → "crypt", "ocur", "rency"), so the vocabulary stays bounded but nothing is out-of-vocabulary.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.1

## Cross-references

- Parent: [[Tokenization]]


