---
type: zettel
id: "20260708223500121087"
title: "LLM Safety and Responsible AI"
created: "2026-07-08"
parent_id: "20260708224425985221"
child_ids:
  - "20260708223500121088"
  - "20260708223500121089"
  - "20260708223500121090"
  - "20260708223500121091"
  - "20260708223500121092"
tags:
  - llm-fundamentals
  - safety
  - responsible-ai
---

# LLM Safety and Responsible AI

## Synthesis

Safety is not an afterthought but an integral part of the training pipeline, applied at every stage. It begins with a taxonomy of threats, runs as a pipeline (data filtering → refusal SFT → safety reward models → red-teaming), is enforced by a defense-in-depth set of mechanisms, is balanced against helpfulness (over-safety causes over-refusal), and is measured by dedicated evaluations — with the standing caveat that no combination of techniques is ever complete.

## Children

- [[Safety-Threat-Taxonomy]] — the categories of harm
- [[Safety-Training-Pipeline]] — safety applied at every training stage
- [[Safety-Mechanisms]] — the defense-in-depth toolkit
- [[Helpfulness-Safety-Tradeoff]] — the over-refusal problem and weighted rewards
- [[Safety-Evaluation]] — benchmarks, jailbreak robustness, and why safety is never done

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.17

## Cross-references

- Parent: [[Optimization-Methods]]
- Refusal is a capability SFT alone can't teach: [[SFT-Is-Not-Enough]]
- Refusal over-triggering as a prompt failure: [[Prompt-Engineering-Best-Practices]]
