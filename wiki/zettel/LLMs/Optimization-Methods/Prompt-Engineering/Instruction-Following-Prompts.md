---
type: zettel
address: "c-000134"
title: "Instruction-Following Prompts"
created: "2026-07-08"
parent: "c-000138"
children: []
tags:
  - llm-fundamentals
  - prompting
---

# Instruction-Following Prompts

## Claim

Treat the prompt as a *specification, not a suggestion*: an effective instruction prompt names a role, states the task unambiguously, supplies context and explicit constraints, optionally shows examples, then provides the input — and the system prompt is the right place for persistent role/constraint/format instructions.

## Reasoning

The anatomy of a strong instruction prompt:

1. **Role/persona** — "You are a senior data scientist…"
2. **Task** — what to do, stated clearly.
3. **Context** — background the model needs.
4. **Constraints** — length, tone, what to avoid, output format.
5. **Examples** (optional) — show the desired format.
6. **Input** — the actual data.

Modern chat APIs separate the **system prompt** (persistent role/instructions) from the **user message** (per-turn input); system prompts are processed with higher attention priority in most models, making them the natural home for role definitions, constraints, and format specs.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13.4

## Cross-references

- Parent: [[Prompt-Engineering]]
- Format enforcement: [[Structured-Output-Prompts]]; checklist: [[Prompt-Engineering-Best-Practices]]
