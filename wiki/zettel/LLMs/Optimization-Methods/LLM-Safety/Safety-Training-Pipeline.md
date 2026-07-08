---
type: zettel
id: "20260708223500121089"
title: "Safety Training Pipeline"
created: "2026-07-08"
parent_id: "20260708223500121087"
child_ids: []
tags:
  - llm-fundamentals
  - safety
---

# Safety Training Pipeline

## Claim

Safety is applied at every stage of the training pipeline, not bolted on at the end: data filtering during pretraining, refusal examples during SFT, safety-specific reward models during RLHF, and iterative red-teaming throughout.

## Reasoning

Each stage contributes a distinct layer of safety:

- **Pretraining** — filter toxic, biased, and PII-containing text from the corpus so harmful patterns are less learned in the first place.
- **SFT** — include refusal examples so the model learns appropriate declines (a capability SFT is uniquely suited to teach for format, though [[SFT-Is-Not-Enough]] for the harder judgment).
- **RLHF** — a safety-specific reward model shapes when to refuse versus help.
- **Red-teaming** — systematic adversarial evaluation throughout finds failure modes before deployment.

Because each layer catches what earlier ones miss, safety is defense-in-depth rather than a single gate.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.17.2

## Cross-references

- Parent: [[LLM-Safety]]
- The tools used at each stage: [[Safety-Mechanisms]]
