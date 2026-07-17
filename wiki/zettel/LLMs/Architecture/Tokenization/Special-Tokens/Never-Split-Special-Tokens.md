---
type: zettel
address: c-000036
title: Never Split Special Tokens
created: 2026-07-08
parent: c-000038
children: []
tags:
  - llm-fundamentals
  - tokenization
subtree_size: 0
cards_due: 3
---

# Never Split Special Tokens

## Claim

Special tokens must be treated as atomic units by the tokenizer — never decomposed into character or subword pieces — or the model loses the structural signal they encode.

## Reasoning

A special token like `<|assistant|>` is meaningful only as a single indivisible symbol. If the tokenizer splits it into `<`, `|`, `assistant`, `|`, `>`, the model sees ordinary text instead of a control marker, and the chat/template structure it was trained to parse collapses. Tokenizer configurations therefore register special tokens explicitly so they bypass the normal subword-splitting path.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.2.6

## Cross-references

- Parent: [[Special-Tokens]]
- What the tokens are: [[Special-Token-Inventory]]


