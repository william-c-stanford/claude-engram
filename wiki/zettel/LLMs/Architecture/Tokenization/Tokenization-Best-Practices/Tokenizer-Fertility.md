---
type: zettel
address: c-000040
title: Tokenizer Fertility
created: 2026-07-08
parent: c-000042
children: []
tags:
  - llm-fundamentals
  - tokenization
subtree_size: 0
cards_due: 3
---

# Tokenizer Fertility

## Claim

Fertility — the average number of tokens a tokenizer emits per word — is the standard diagnostic for per-language coverage: high fertility for a language signals that the vocabulary covers it poorly.

## Reasoning

When a language is under-represented in the tokenizer's training corpus, its words fragment into many subword pieces, inflating tokens-per-word. High fertility directly raises inference cost and context consumption for that language and degrades quality, so measuring fertility across languages reveals where vocabulary is thin — the diagnostic that motivates larger multilingual vocabularies.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.4

## Cross-references

- Parent: [[Tokenization-Best-Practices]]
- Mitigation: [[Vocabulary-Size]]


