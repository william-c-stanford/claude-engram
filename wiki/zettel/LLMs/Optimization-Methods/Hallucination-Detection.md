---
type: zettel
id: "20260708223500121084"
title: "Hallucination Detection"
created: "2026-07-08"
parent_id: "20260708224425985221"
child_ids:
  - "20260708223500121085"
  - "20260708223500121086"
tags:
  - llm-fundamentals
  - hallucination
  - reliability
---

# Hallucination Detection

## Synthesis

LLMs produce fluent text that may be factually wrong — hallucination. This note covers *model-level* detection (no external retrieval or multi-agent verification): first a taxonomy of what "hallucination" even means, then the signals that flag it. The crucial caveat threading through both is that these methods detect *uncertainty*, not *incorrectness* — a model can be confidently wrong — so reliable detection ultimately needs grounding (RAG, external fact-checking).

## Children

- [[Hallucination-Types]] — intrinsic, extrinsic, faithfulness
- [[Model-Level-Hallucination-Detection]] — entropy, consistency, and layer-contrast signals

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.16

## Cross-references

- Parent: [[Optimization-Methods]]
- RAG grounding as the reliable complement: [[Advanced-Prompting-Techniques]]
- DoLA is a layer-contrast cousin of [[Contrastive-Decoding]]
