---
type: zettel
id: "20260708223105938841"
title: "Few-Shot Prompting"
created: "2026-07-08"
parent_id: "20260708223105938838"
child_ids: []
tags:
  - llm-fundamentals
  - prompting
---

# Few-Shot Prompting

## Claim

Few-shot prompting supplies $k$ input–output examples before the query; performance typically improves from 0 to 4–8 examples then plateaus, and the *format and label space* of examples matter more than label correctness — even random labels help (though correct labels help more).

## Reasoning

Design principles for the demonstrations:

1. **Diversity** — cover the range of expected inputs (lengths, edge cases, categories).
2. **Ordering** — place harder/more representative examples last (recency bias).
3. **Label balance** — for classification, include all classes to avoid majority-class bias.
4. **Format consistency** — every example must follow the exact same structure; the model mimics the pattern.
5. **Relevance** — examples semantically similar to the target query work best.

Beyond ~20 examples gains are marginal and you risk filling the context window. The Min et al. finding — that format and label space matter more than correctness — implies the demonstrations mainly teach the model *what kind of answer* to produce, not the answer itself.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.13.3

## Cross-references

- Parent: [[Prompt-Engineering]]
- Mechanism: [[In-Context-Learning]]
