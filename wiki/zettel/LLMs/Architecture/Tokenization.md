---
type: zettel
id: "20260708215912362253"
title: "Tokenization"
created: "2026-07-08"
parent_id: "20260708224425985220"
child_ids:
  - "20260708215912389407"
  - "20260708215912414151"
  - "20260708215912482649"
  - "20260708215912570475"
tags:
  - llm-fundamentals
  - tokenization
---

# Tokenization

## Synthesis

Tokenization is the first stage of the LLM pipeline: it converts raw text into the discrete integer symbols the model operates on. The design space resolves into four decisions — what granularity to use, which merge algorithm builds the vocabulary, how structural (non-linguistic) tokens are handled, and which practical settings make the tokenizer good — and each is a child of this note.

## Children

- [[Why-Subword-Tokenization]] — why subword units beat characters and words
- [[Byte-Pair-Encoding]] — the dominant vocabulary-building algorithm and its variants
- [[Special-Tokens]] — reserved tokens that carry structure, not meaning
- [[Tokenization-Best-Practices]] — vocabulary size, digit handling, and fertility

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2 (Tokenization)

## Cross-references

- Parent: [[Architecture]]
- Downstream stage: the token IDs index into the embedding table of the transformer.
