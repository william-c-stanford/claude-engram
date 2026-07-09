---
type: zettel
address: "c-000108"
title: "Other PEFT Methods"
created: "2026-07-08"
parent: "c-000109"
children: []
tags:
  - llm-fundamentals
  - peft
---

# Other PEFT Methods

## Claim

LoRA won over the other PEFT families — adapters, prefix/prompt tuning, IA3, BitFit — because it uniquely combines zero inference overhead (adapters merge into base weights), composability (swap adapters at serving time), broad ecosystem support, and proven production use.

## Reasoning

The alternatives and their drawbacks:

- **Adapters** — small bottleneck MLPs inserted between layers; modular and stackable but add sequential inference latency. *Rarely used.*
- **Prefix tuning** — learnable "virtual tokens" prepended to keys/values at each layer; no weight change but consumes context length. *Niche.*
- **Prompt tuning** — learnable soft-prompt embeddings on the input; extremely few params (<0.01%) but weaker on complex tasks. *Niche.*
- **IA3** — learned vectors that rescale keys/values/FFN activations; even fewer params, mergeable, but limited capacity. *Deprecated.*
- **BitFit** — train only bias terms; near-zero params, surprisingly effective on simple tasks, limited expressiveness. *Historical.*

LoRA's advantages — (1) mergeable, so zero added latency (unlike adapters/prefix); (2) swappable adapters for multi-tenant serving; (3) first-class support in PEFT, TRL, vLLM; (4) production-proven at Meta/Google — make it the default unless a specific constraint rules it out.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.9.4

## Cross-references

- Parent: [[LoRA-And-PEFT]]
- The standard: [[LoRA-Insight]]
