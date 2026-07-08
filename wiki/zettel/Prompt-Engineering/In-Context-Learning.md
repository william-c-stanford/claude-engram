---
type: zettel
id: "20260708223105938839"
title: "In-Context Learning"
created: "2026-07-08"
parent_id: "20260708223105938838"
child_ids: []
tags:
  - llm-fundamentals
  - prompting
---

# In-Context Learning

## Claim

In-context learning (ICL) is the ability to learn a task at inference time purely from examples in the prompt, with no gradient updates; the prompt examples *locate* the relevant task within the distribution the model already learned during pretraining.

## Reasoning

Why ICL works:

- **Implicit Bayesian inference** — pretraining exposed the model to millions of tasks; the prompt examples do not teach a new task but identify which learned task to apply.
- **Induction heads** — attention heads that implement the copy pattern $[A][B]\dots[A]\rightarrow[B]$ enable in-context generalization (see [[Attention-Head-Roles]]).
- **Task vectors** — ICL creates implicit task representations in the residual stream that steer generation toward the demonstrated format and content.

Scaling: ICL emerges mainly above ~1B parameters and improves log-linearly with scale; smaller models can memorize examples but struggle to generalize to novel inputs within the same context.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13.1

## Cross-references

- Parent: [[Prompt-Engineering]]
- Mechanism: [[Attention-Head-Roles]] (induction heads)
- Zero and few examples: [[Zero-Shot-Prompting]] · [[Few-Shot-Prompting]]
