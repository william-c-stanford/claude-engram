---
type: zettel
id: "20260708215912593475"
title: "Vocabulary Size"
created: "2026-07-08"
parent_id: "20260708215912570475"
child_ids: []
tags:
  - llm-fundamentals
  - tokenization
---

# Vocabulary Size

## Claim

32K tokens is the practical minimum vocabulary; 128K (as in Llama-3) meaningfully improves multilingual coverage and code handling at the cost of a larger embedding table.

## Reasoning

A larger vocabulary lets more words and code fragments stay as single tokens, shortening sequences and improving cross-language fairness (fewer tokens per non-English word). The cost is a larger embedding matrix $\mathbf{E} \in \mathbb{R}^{|V| \times d}$ and output projection, so vocabulary size is a direct memory/coverage trade-off rather than a free lunch.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.4

## Cross-references

- Parent: [[Tokenization-Best-Practices]]
- Related coverage diagnostic: [[Tokenizer-Fertility]]
