---
type: zettel
address: "c-000101"
title: "Safety Threat Taxonomy"
created: "2026-07-08"
parent: "c-000103"
children: []
tags:
  - llm-fundamentals
  - safety
subtree_size: 0
cards_due: 0
---

# Safety Threat Taxonomy

## Claim

LLM safety threats span six categories: harmful content, bias/discrimination, privacy violations, jailbreaking, misinformation, and dual-use — the last capturing legitimate capabilities (coding, chemistry) weaponized for harm.

## Reasoning

| Category | Description |
|---|---|
| Harmful content | Toxic, violent, or illegal instructions (bioweapons, CSAM) |
| Bias and discrimination | Perpetuating stereotypes; unfair treatment across demographics |
| Privacy violations | Leaking PII from training data; memorization attacks |
| Jailbreaking | Adversarial prompts that bypass safety guardrails |
| Misinformation | Convincing but false claims (hallucination at scale) |
| Dual-use | Legitimate capabilities weaponized for harm |

The taxonomy matters because the mechanisms differ: data filtering addresses harmful content and privacy, refusal training and guardrails address harmful requests and jailbreaks, and dual-use is the hardest because the capability is desirable in benign contexts.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.17.1

## Cross-references

- Parent: [[LLM-Safety]]
- Countermeasures: [[Safety-Mechanisms]]
- Privacy links to [[Pretraining-Failure-Modes]] (memorization)


