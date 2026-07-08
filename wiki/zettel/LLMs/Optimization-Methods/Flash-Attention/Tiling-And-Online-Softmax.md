---
type: zettel
id: "20260708222508084728"
title: "Tiling and Online Softmax"
created: "2026-07-08"
parent_id: "20260708222508084726"
child_ids: []
tags:
  - llm-fundamentals
  - attention
  - efficiency
---

# Tiling and Online Softmax

## Claim

The full $n \times n$ matrix is never needed at once: by keeping a running maximum and normalization factor, softmax can be updated incrementally as new blocks of scores arrive, letting the output be accumulated block by block with a result mathematically identical to computing softmax over the whole row.

## Reasoning

Numerically stable softmax needs the row maximum, $\text{softmax}(x_i) = e^{x_i - m}/\sum_j e^{x_j - m}$ with $m = \max_j x_j$. The **online softmax** trick maintains state $(m_{\text{old}}, \ell_{\text{old}}, O_{\text{old}})$ and, given a new score block $s_{\text{new}}$, updates:

$$m_{\text{new}} = \max(m_{\text{old}}, \max(s_{\text{new}}))$$
$$\ell_{\text{new}} = e^{m_{\text{old}} - m_{\text{new}}}\,\ell_{\text{old}} + \sum_j e^{s_{\text{new},j} - m_{\text{new}}}$$
$$O_{\text{new}} = \frac{1}{\ell_{\text{new}}}\left(e^{m_{\text{old}} - m_{\text{new}}}\,\ell_{\text{old}}\,O_{\text{old}} + e^{s_{\text{new}} - m_{\text{new}}}\,V_{\text{new}}\right)$$

The rescaling by $e^{m_{\text{old}} - m_{\text{new}}}$ retroactively corrects earlier partial sums whenever a larger maximum appears, so no information is lost and the full row is never materialized.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.6.2

## Cross-references

- Parent: [[Flash-Attention]]
- Applied in: [[Flash-Attention-Algorithm]]
