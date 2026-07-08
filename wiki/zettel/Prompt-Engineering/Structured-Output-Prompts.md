---
type: zettel
id: "20260708223105938843"
title: "Structured Output Prompts"
created: "2026-07-08"
parent_id: "20260708223105938838"
child_ids: []
tags:
  - llm-fundamentals
  - prompting
  - structured-output
---

# Structured Output Prompts

## Claim

For programmatic use, reliably eliciting structured output (especially JSON) rests on showing the schema *before* the input, using enum fields over free text, XML tags for nesting, and — for hard guarantees — constrained decoding; a complementary technique is formatting the *prompt itself* as JSON.

## Reasoning

Techniques for reliable structured output: **schema-first** (show the exact JSON schema before the input so the model treats it as a template), **constrained decoding** (grammar-based sampling guarantees valid JSON — see [[Constrained-Decoding]]), **XML tags** (unambiguous delimiters for nested/multi-part output), and **type definitions** (Pydantic/TypeScript). Pitfalls: models add markdown fences unless told to output raw JSON; nested objects raise hallucination risk (flatten where possible); enum fields are far more reliable than free text; always validate programmatically.

**JSON prompting** formats the prompt as JSON rather than prose, exploiting the model's heavy pretraining on APIs/configs/code: unambiguous field boundaries, typed constraints (`"severity_filter": "high"` beats "only show high severity"), and schema-as-contract mirroring API patterns. The system prompt still carries role, tone, and behavioral constraints that don't fit a JSON payload.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13.5

## Cross-references

- Parent: [[Prompt-Engineering]]
- Token-level guarantee: [[Constrained-Decoding]]
