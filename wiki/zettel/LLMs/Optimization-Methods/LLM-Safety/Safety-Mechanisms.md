---
type: zettel
address: "c-000100"
title: "Safety Mechanisms"
created: "2026-07-08"
parent: "c-000103"
children: []
tags:
  - llm-fundamentals
  - safety
subtree_size: 0
cards_due: 0
---

# Safety Mechanisms

## Claim

Safety is enforced by a defense-in-depth toolkit: data filtering, safety SFT (refusal examples), Constitutional AI (principle-based self-critique), a safety reward model combined with the helpfulness RM, serving-time guardrails, and red-teaming.

## Reasoning

- **Data filtering** — remove toxic, biased, and PII text from pretraining corpora.
- **Safety SFT** — train on appropriate refusals ("I can't help with that because…").
- **Constitutional AI** — the model critiques and revises its own outputs against a written constitution of rules (self-critique, no human label per example).
- **Safety reward model** — a separate RM trained on safety-annotated pairs, combined with the helpfulness RM during RLHF via a weighted sum (see [[Helpfulness-Safety-Tradeoff]]).
- **Guardrails** — input/output classifiers that block harmful requests/responses at serving time.
- **Red teaming** — systematic adversarial evaluation to find failure modes before deployment.

No single mechanism suffices; they layer so that a request slipping past one is caught by another.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.17.3

## Cross-references

- Parent: [[LLM-Safety]]
- Constitutional AI self-critique also appears in [[Advanced-Prompting-Techniques]]
- Reward combination: [[Helpfulness-Safety-Tradeoff]]


