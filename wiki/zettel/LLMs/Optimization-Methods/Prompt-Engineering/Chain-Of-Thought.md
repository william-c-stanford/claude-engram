---
type: zettel
address: "c-000131"
title: "Chain-of-Thought Prompting"
created: "2026-07-08"
parent: "c-000138"
children: []
tags:
  - llm-fundamentals
  - prompting
  - reasoning
---

# Chain-of-Thought Prompting

## Claim

Chain-of-thought (CoT) prompting asks the model to produce intermediate reasoning steps before the final answer, which dramatically improves multi-step reasoning by *serializing computation* — converting a hard parallel problem into easy sequential steps and effectively increasing the model's compute budget; but it hurts on simple tasks.

## Reasoning

Why CoT works: transformers have fixed depth but variable-length generation, so writing out steps lets the model spend more sequential compute; each step is a simpler sub-problem with lower per-step error; and intermediate state becomes auditable. Variants:

| Method | Description |
|---|---|
| Zero-shot CoT | Append "Let's think step by step" |
| Few-shot CoT | Provide examples with explicit reasoning chains |
| Self-Consistency | Sample $N$ CoT paths, majority-vote the answer |
| Tree of Thoughts | Explore branches with backtracking |
| Plan-and-Solve | Plan the steps, then execute |
| ReAct | Interleave reasoning and acting (tool use) |

**Self-consistency** works because correct reasoning paths converge on the same answer while errors are idiosyncratic — trading compute for accuracy. **When CoT hurts:** on single-step classification/retrieval/formatting it adds latency and can introduce errors through overthinking, so apply it selectively.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13.6

## Cross-references

- Parent: [[Prompt-Engineering]]
- Advanced patterns build on it: [[Advanced-Prompting-Techniques]]
