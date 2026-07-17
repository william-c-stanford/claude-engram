---
type: zettel
address: "c-000138"
title: "Prompt Engineering"
created: "2026-07-08"
parent: "c-000151"
children:
  - "c-000133"
  - "c-000137"
  - "c-000132"
  - "c-000134"
  - "c-000136"
  - "c-000131"
  - "c-000130"
  - "c-000135"
tags:
  - llm-fundamentals
  - prompting
subtree_size: 8
cards_due: 0
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


