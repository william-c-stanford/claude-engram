---
type: zettel
id: "20260708215912460084"
title: "Subword Tokenizer Variants"
created: "2026-07-08"
parent_id: "20260708215912414151"
child_ids: []
tags:
  - llm-fundamentals
  - tokenization
---

# Subword Tokenizer Variants

## Claim

The main subword tokenizers differ chiefly in how they decide what to merge or keep: BPE merges by raw frequency, WordPiece by training-data likelihood, Unigram LM prunes a large vocabulary by likelihood impact, and byte-level BPE runs BPE over raw bytes so no token is ever out-of-vocabulary.

## Reasoning

| Method | Used by | Key idea |
|---|---|---|
| BPE | GPT-4, Llama-3, Mistral | Bottom-up frequency merging; deterministic |
| WordPiece | BERT, DistilBERT | Like BPE but maximizes training-data likelihood |
| Unigram LM | SentencePiece (T5, XLNet) | Top-down: start large, prune by likelihood impact |
| Byte-level BPE | GPT-2+ | BPE on raw bytes; 256 base vocab, no unknown tokens possible |

Byte-level BPE's guarantee matters most: because every input decomposes to bytes, there is no `<unk>` failure mode regardless of input.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.3

## Cross-references

- Parent: [[Byte-Pair-Encoding]]
- Base procedure: [[BPE-Merge-Algorithm]]
