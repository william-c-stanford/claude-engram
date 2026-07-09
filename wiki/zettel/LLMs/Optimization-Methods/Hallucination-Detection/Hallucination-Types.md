---
type: zettel
address: "c-000095"
title: "Hallucination Types"
created: "2026-07-08"
parent: "c-000097"
children: []
tags:
  - llm-fundamentals
  - hallucination
---

# Hallucination Types

## Claim

Hallucinations fall into three kinds: **intrinsic** (contradicts the provided input/context), **extrinsic** (unverifiable-from-input claims that are factually wrong), and **faithfulness** (output diverges from the instruction or specified constraints).

## Reasoning

The distinction matters because each type is caught by different checks:

- **Intrinsic** — e.g. a summary that states the opposite of its source; detectable by comparing output against the given context.
- **Extrinsic** — claims not grounded in the input and false in the world; needs external knowledge to verify.
- **Faithfulness** — the output ignores the instruction or constraints (right facts, wrong task).

Separating "contradicts the source" from "false about the world" from "ignores the instruction" clarifies whether a fix belongs in grounding, fact-checking, or prompt/constraint design.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.16.1

## Cross-references

- Parent: [[Hallucination-Detection]]
- How to detect them: [[Model-Level-Hallucination-Detection]]
