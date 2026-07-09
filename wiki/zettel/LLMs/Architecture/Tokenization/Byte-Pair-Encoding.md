---
type: zettel
address: "c-000034"
title: "Byte-Pair Encoding"
created: "2026-07-08"
parent: "c-000044"
children:
  - "c-000032"
  - "c-000033"
tags:
  - llm-fundamentals
  - tokenization
aliases:
  - "BPE"
---

# Byte-Pair Encoding

## Synthesis

Byte-Pair Encoding (BPE) is the dominant subword tokenization algorithm, used by GPT, Llama, and Mistral. Understanding it splits into two claims: how the core merge procedure builds a vocabulary bottom-up, and how the main production variants differ from plain BPE.

## Children

- [[BPE-Merge-Algorithm]] — the iterative most-frequent-pair merge procedure
- [[Subword-Tokenizer-Variants]] — WordPiece, Unigram LM, and byte-level BPE

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.2–1.2.3

## Cross-references

- Parent: [[Tokenization]]
