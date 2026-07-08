---
type: zettel
address: "c-000124"
title: "Pretraining Data Pipeline"
created: "2026-07-08"
parent: "c-000129"
children: []
tags:
  - llm-fundamentals
  - pretraining
  - data
---

# Pretraining Data Pipeline

## Claim

Frontier pretraining consumes 1–15 trillion tokens drawn mostly from web crawl, then aggressively deduplicated, quality-filtered, and mixed by domain — with code and math upweighted for reasoning.

## Reasoning

A representative recipe (Llama-3 used 15T tokens):

- **Scale:** 1–15T tokens for frontier models.
- **Sources:** ~80% web crawl, 10% code, 5% books/papers, 5% curated.
- **Deduplication:** MinHash plus exact substring dedup, which reduces verbatim memorization.
- **Quality filtering:** a perplexity-based classifier plus heuristic filters (length, language ID, toxicity).
- **Data mixing:** temperature-weighted sampling across domains, upweighting code and math to strengthen reasoning.

Data quality and mixture are as consequential as raw scale — dedup in particular guards against the memorization failure mode.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.7.2

## Cross-references

- Parent: [[Pretraining]]
- Memorization risk: [[Pretraining-Failure-Modes]]
- Diversity lens: [[Training-Data-Diversity]]
