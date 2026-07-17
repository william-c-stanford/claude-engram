---
type: zettel
address: "c-000076"
title: "Constrained Decoding"
created: "2026-07-08"
parent: "c-000085"
children: []
tags:
  - llm-fundamentals
  - decoding
  - structured-output
subtree_size: 0
cards_due: 0
---

# Constrained Decoding

## Claim

Constrained (structured) decoding masks the vocabulary at each step to only the tokens a formal grammar allows, guaranteeing the output conforms to a JSON schema, regex, or CFG — enforced incrementally so no invalid prefix is ever produced.

## Reasoning

At step $t$ a token mask $M_t \subseteq V$ is derived from the current parser state; tokens outside $M_t$ get logit $-\infty$ before softmax:

$$P'(v \mid x_{<t}) = \begin{cases} P(v \mid x_{<t})/Z & v \in M_t \\ 0 & \text{otherwise} \end{cases}$$

with $Z$ renormalizing. Because the mask changes every step, validity is enforced incrementally. The compilation pipeline is JSON Schema → Regex → FSM (DFA) → per-state token mask, precomputed once per schema so runtime mask lookup is $O(1)$. Libraries: **Outlines**, **lm-format-enforcer** (regex/FSM), **Guidance** (interleaved control flow), **XGrammar** (full context-free grammars). Trade-offs: forcing structure can degrade content quality if the "correct" answer lies outside the grammar (rare for good models/schemas); the per-schema FSM build costs 1–5 s (amortized). **Use it whenever the output consumer is a program** (tool-calling, API backends, data extraction), not for free-form prose.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.12.11

## Cross-references

- Parent: [[Decoding-Methods]]
- Prompt-side analogue: [[Structured-Output-Prompts]]


