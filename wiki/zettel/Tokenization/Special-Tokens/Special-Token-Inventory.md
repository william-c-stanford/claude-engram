---
type: zettel
id: "20260708215912504485"
title: "Special Token Inventory"
created: "2026-07-08"
parent_id: "20260708215912482649"
child_ids: []
tags:
  - llm-fundamentals
  - tokenization
---

# Special Token Inventory

## Claim

A small set of reserved tokens encodes conversational and batch structure that ordinary text cannot: sequence boundaries, chat-turn roles, padding, and unknown placeholders.

## Reasoning

| Token | Marks |
|---|---|
| `<bos>` / `<\|begin_of_text\|>` | Start of sequence |
| `<eos>` / `<\|end_of_text\|>` | End of sequence; stops generation |
| `<\|user\|>` / `<\|assistant\|>` | Chat-turn roles |
| `<pad>` | Batch padding (masked in attention) |
| `<unk>` | Out-of-vocabulary placeholder (rare with byte-level BPE) |

These entries occupy real vocabulary slots but never appear in natural text; the model learns to treat them as control signals.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.6

## Cross-references

- Parent: [[Special-Tokens]]
- Why `<unk>` is rare: [[Subword-Tokenizer-Variants]] (byte-level BPE)
