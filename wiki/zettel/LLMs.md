---
type: zettel
address: c-000152
title: LLMs
created: 2026-07-08
parent: ""
children:
  - c-000073
  - c-000151
  - c-000074
tags:
  - llm-fundamentals
  - moc
subtree_size: 130
cards_due: 6
---

# LLMs

## Synthesis

Large language models are the subject of this whole corpus: this note is the top of the tree, dividing the material into what an LLM *is* and what you *do* to it. **Architecture** covers the static structure — how text becomes tokens, the transformer that processes them, the heads that read out answers, and the sparse-expert variant that scales it. **Optimization Methods** covers everything you do around that structure — train it (optimization theory, pretraining, SFT, PEFT), run it efficiently (Flash Attention, compression, speculative decoding), steer its outputs (decoding, prompting, diversity), and keep it honest and safe (hallucination detection, safety). The pipeline-overview leaf is the one-page orientation spanning both.

## Children

- [[Architecture]] — what an LLM is: tokens, transformer, heads, experts
- [[Optimization-Methods]] — how to train, adapt, run, and safeguard it
- [[LLM-Pipeline-Overview]] — the end-to-end text → tokens → representations → tokens → text map

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] (Chapter 1: LLM Architecture and Optimization Methods)

## Cross-references

- Every topic in this chapter descends from here.


