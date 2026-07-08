---
type: zettel
id: "20260708223105938838"
title: "Prompt Engineering"
created: "2026-07-08"
parent_id: "20260708224425985221"
child_ids:
  - "20260708223105938839"
  - "20260708223105938840"
  - "20260708223105938841"
  - "20260708223105938842"
  - "20260708223105938843"
  - "20260708223105938844"
  - "20260708223105938845"
  - "20260708223105938846"
tags:
  - llm-fundamentals
  - prompting
---

# Prompt Engineering

## Synthesis

Prompt engineering elicits desired behavior *without changing weights* — the fastest, cheapest lever, and essential even for fine-tuned models. It rests on **in-context learning** (the model infers a task from prompt examples at inference time) and fans out into a ladder of techniques: zero-shot → few-shot demonstrations, structured instructions and output schemas, chain-of-thought for reasoning, and advanced patterns (RAG, chaining, self-critique). The mindset is "programming in natural language."

## Children

- [[In-Context-Learning]] — learning a task from examples with no gradient updates
- [[Zero-Shot-Prompting]] — instruction only, no examples
- [[Few-Shot-Prompting]] — $k$ input–output demonstrations
- [[Instruction-Following-Prompts]] — the prompt as a specification
- [[Structured-Output-Prompts]] — reliable JSON/XML output
- [[Chain-Of-Thought]] — intermediate reasoning steps and their variants
- [[Advanced-Prompting-Techniques]] — RAG, chaining, self-critique, ARQ
- [[Prompt-Engineering-Best-Practices]] — the checklist and failure modes

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13

## Cross-references

- Parent: [[Optimization-Methods]]
- When prompting stops improving quality, move to [[Supervised-Fine-Tuning]] or RLHF.
- Guaranteed structure via [[Constrained-Decoding]]
