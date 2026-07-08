---
type: zettel
id: "20260708215912437724"
title: "BPE Merge Algorithm"
created: "2026-07-08"
parent_id: "20260708215912414151"
child_ids: []
tags:
  - llm-fundamentals
  - tokenization
---

# BPE Merge Algorithm

## Claim

BPE builds its vocabulary bottom-up: starting from individual characters, it repeatedly counts adjacent symbol pairs and merges the single most frequent pair into a new symbol, iterating $k$ times until the target vocabulary size is reached.

## Reasoning

The procedure is deterministic and greedy:

1. Start with a vocabulary of individual characters (or bytes).
2. Count all adjacent symbol pairs in the training corpus.
3. Merge the most frequent pair into one new symbol.
4. Repeat steps 2–3 for $k$ iterations (until the vocabulary budget is spent).

Worked example — the word `lower` collapses as frequent pairs merge:

```
l o w e r  →  l o w er  →  l ow er  →  low er  →  lower
```

Each iteration adds exactly one token to the vocabulary, so $k$ directly sets the final vocabulary size.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.2

## Cross-references

- Parent: [[Byte-Pair-Encoding]]
- Contrast: [[Subword-Tokenizer-Variants]] (other merge criteria)
