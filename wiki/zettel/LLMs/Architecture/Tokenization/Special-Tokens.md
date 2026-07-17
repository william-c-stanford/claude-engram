---
type: zettel
address: c-000038
title: Special Tokens
created: 2026-07-08
parent: c-000044
children:
  - c-000037
  - c-000036
  - c-000035
tags:
  - llm-fundamentals
  - tokenization
subtree_size: 3
cards_due: 12
---

# Special Tokens

## Synthesis

Special tokens are reserved vocabulary entries that carry structural meaning rather than linguistic content (sequence boundaries, chat roles, padding). Because they are structural, three handling rules follow: what the inventory is and what each marks, that they must never be split, and that their loss must be masked during supervised fine-tuning.

## Children

- [[Special-Token-Inventory]] — the common special tokens and what they mark
- [[Never-Split-Special-Tokens]] — they must be atomic in the tokenizer
- [[Mask-Loss-On-Special-Tokens]] — exclude structural tokens from the SFT loss

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.6

## Cross-references

- Parent: [[Tokenization]]


