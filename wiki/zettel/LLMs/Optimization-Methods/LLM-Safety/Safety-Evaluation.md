---
type: zettel
address: "c-000099"
title: "Safety Evaluation"
created: "2026-07-08"
parent: "c-000103"
children: []
tags:
  - llm-fundamentals
  - safety
  - evaluation
---

# Safety Evaluation

## Claim

Safety is measured along four axes — safety benchmarks, jailbreak robustness, over-refusal rate (target <5% false refusals on benign prompts), and human red-team evaluations — under the standing principle that no technique set makes safety complete.

## Reasoning

- **Safety benchmarks** — ToxiGen, RealToxicityPrompts, BBQ (bias), CrowS-Pairs.
- **Jailbreak robustness** — GCG attacks, multi-turn jailbreaks, encoded prompts.
- **Over-refusal rate** — false-positive refusals on benign prompts, targeting <5% (the measurable side of the [[Helpfulness-Safety-Tradeoff]]).
- **Red-team evaluations** — human adversarial testing with domain experts (biosecurity, cybersecurity).

**Safety is never complete:** new attack vectors appear continuously (multi-modal jailbreaks, fine-tuning attacks that strip safety training, many-shot prompting), so safety requires ongoing monitoring, rapid response, and defense-in-depth across multiple independent layers.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.17.5

## Cross-references

- Parent: [[LLM-Safety]]
- Over-refusal metric ties to [[Helpfulness-Safety-Tradeoff]]
