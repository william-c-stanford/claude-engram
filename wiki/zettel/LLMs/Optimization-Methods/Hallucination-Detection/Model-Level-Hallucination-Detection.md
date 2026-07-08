---
type: zettel
id: "20260708223500121086"
title: "Model-Level Hallucination Detection"
created: "2026-07-08"
parent_id: "20260708223500121084"
child_ids: []
tags:
  - llm-fundamentals
  - hallucination
---

# Model-Level Hallucination Detection

## Claim

Without external knowledge, hallucination is flagged by uncertainty signals — token entropy, sequence log-probability, self-consistency across samples, **semantic entropy** (entropy over meaning-clusters), and **DoLA** (contrasting late vs. early layer logits) — but all of these detect *uncertainty*, not *incorrectness*, so a confidently-wrong model evades them.

## Reasoning

| Method | Mechanism | Signal |
|---|---|---|
| Token entropy | High entropy at generation = uncertainty | $H(P(x_t)) > \tau$ |
| Sequence log-prob | Low mean log-prob suggests confabulation | $\frac{1}{T}\sum_t \log P(x_t)$ |
| Consistency sampling | Generate $N$; low agreement = likely hallucination | Contradiction rate |
| Semantic entropy | Entropy over meaning clusters | Cluster diversity |
| DoLA | Contrast later vs. earlier layer logits | Layer divergence |

**Semantic entropy** fixes the flaw that token entropy is unreliable (paraphrases differ in tokens but not meaning): generate multiple responses, cluster by semantic equivalence (via NLI), and compute $SE = -\sum_c P(c)\log P(c)$; high $SE$ = semantically different answers = strong hallucination signal. **SelfCheckGPT** checks whether claims in the main response are supported by other samples ("disagrees with itself"). **DoLA** exploits that factual knowledge emerges in later layers: $\text{DoLA}(x_t) = \text{softmax}(\log P_{\text{late}}(x_t) - \log P_{\text{early}}(x_t))$, amplifying deep-layer facts at inference with one extra forward pass and no retraining.

**Limitation:** these measure uncertainty, not truth — for reliable detection, combine with retrieval-based verification (RAG) or external fact-checking.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.16.2

## Cross-references

- Parent: [[Hallucination-Detection]]
- DoLA vs. model-pair contrast: [[Contrastive-Decoding]]; grounding: [[Advanced-Prompting-Techniques]]
