---
type: zettel
address: "c-000130"
title: "Advanced Prompting Techniques"
created: "2026-07-08"
parent: "c-000138"
children: []
tags:
  - llm-fundamentals
  - prompting
---

# Advanced Prompting Techniques

## Claim

Beyond single prompts, advanced patterns extend the model with external or structural machinery: RAG (retrieve documents into the prompt), prompt chaining/decomposition, Constitutional AI self-critique, automated prompt optimization (APE/DSPy/OPRO), and Attentive Reasoning Queries (ARQ) that manage *where* the model looks.

## Reasoning

- **RAG** — retrieve relevant documents and instruct the model to answer only from them, grounding responses in verifiable sources and cutting hallucination on knowledge-intensive tasks.
- **Prompt chaining / decomposition** — break a complex task into a pipeline of simpler prompts (extract → reason → format), each with its own template/model/temperature, enabling targeted debugging.
- **Constitutional AI / self-critique** — the model critiques its own output against stated principles and revises it.
- **Meta-prompting / optimization** — APE (LLM generates and scores candidate prompts), DSPy (compiles declarative tasks into optimized pipelines with learned few-shot examples), OPRO (LLM as the optimizer).
- **ARQ** — decompose a query into focused sub-queries, each directing attention to a specific context slice, then aggregate; a structured CoT that explicitly manages the lost-in-the-middle effect for long-document QA and agentic tasks.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13.7

## Cross-references

- Parent: [[Prompt-Engineering]]
- ARQ addresses [[Attention-Dilution]]; builds on [[Chain-Of-Thought]]
- Self-critique underlies Constitutional AI in [[Safety-Mechanisms]]
