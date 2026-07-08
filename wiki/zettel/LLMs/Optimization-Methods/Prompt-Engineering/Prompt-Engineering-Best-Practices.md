---
type: zettel
id: "20260708223105938846"
title: "Prompt Engineering Best Practices"
created: "2026-07-08"
parent_id: "20260708223105938838"
child_ids: []
tags:
  - llm-fundamentals
  - prompting
---

# Prompt Engineering Best Practices

## Claim

Effective prompting treats the prompt as code: be specific and unambiguous, show rather than tell, define the output format explicitly, delimit input data, assign a role, state what *not* to do, add CoT for reasoning, set temperature to the task, iterate empirically, and exploit recency by putting critical instructions last.

## Reasoning

The model is a powerful but literal interpreter, so software-engineering discipline applies: separation of concerns (distinct sections for role, constraints, examples, input), test-driven development (define expected outputs first), version control, and modular reusable templates. Common failure modes and fixes:

| Failure | Symptom | Fix |
|---|---|---|
| Instruction amnesia | Ignores constraints in long prompts | Move constraints to end; repeat key rules; use system prompt |
| Format drift | Output degrades over long generations | Constrained decoding; shorter chained prompts |
| Sycophancy | Agrees with incorrect premises | "Challenge assumptions if incorrect" |
| Hallucinated details | Invents facts | "If unknown, say I don't know"; RAG with attribution |
| Refusal over-triggering | Refuses benign requests | Clarify legitimate intent/context |

When systematic iteration stops improving quality, that is the signal to move to SFT or RLHF/DPO.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13.8

## Cross-references

- Parent: [[Prompt-Engineering]]
- Recency/amnesia relate to [[Attention-Dilution]]; refusal to [[Helpfulness-Safety-Tradeoff]]
