---
type: zettel
id: "20260708223105938840"
title: "Zero-Shot Prompting"
created: "2026-07-08"
parent_id: "20260708223105938838"
child_ids: []
tags:
  - llm-fundamentals
  - prompting
---

# Zero-Shot Prompting

## Claim

Zero-shot prompting gives only a task description and no examples, relying entirely on pretrained knowledge and instruction tuning; it works well for tasks the model saw extensively (translation, summarization, sentiment) with unambiguous output formats, and fails on novel formats or ambiguous tasks.

## Reasoning

With no demonstrations, the model must infer both the task and the exact output format from the instruction alone. This succeeds when the task is well-represented in pretraining/SFT and the instruction is unambiguous — and instruction-tuned models (ChatGPT, Claude, Llama-3-Instruct) substantially outperform base models here. It fails when the format is novel, the labeling scheme is domain-specific, or the task is ambiguous, because the model cannot recover your exact requirements from the instruction. In those cases, add demonstrations ([[Few-Shot-Prompting]]).

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13.2

## Cross-references

- Parent: [[Prompt-Engineering]]
- Add examples: [[Few-Shot-Prompting]]
