---
type: zettel
id: "20260708222835675666"
title: "LoRA Alpha Scaling"
created: "2026-07-08"
parent_id: "20260708222835675664"
child_ids: []
tags:
  - llm-fundamentals
  - lora
---

# LoRA Alpha Scaling

## Claim

The $\alpha/r$ factor normalizes the update magnitude so it stays roughly constant as rank changes, making rank a knob you can sweep without re-tuning the learning rate; at high ranks ($r \ge 64$), rsLoRA's $\alpha/\sqrt{r}$ is more stable because the variance of $BA$ scales with $\sqrt{r}$, not $r$.

## Reasoning

Without scaling, doubling $r$ roughly doubles the magnitude of $\Delta W = BA$ (more columns of $B$ contribute), so you'd have to re-tune the LR whenever you change rank. The $\alpha/r$ factor in $W' = W + \frac{\alpha}{r}BA$ fixes the effective magnitude at $\approx \alpha$ regardless of rank, so you can try $r \in \{8,16,32,64\}$ with one LR recipe. Common practice: set $\alpha = r$ (scaling 1) or $\alpha = 2r$ (scaling 2). It is a *rank-independent* knob teams can share across experiments. The **rsLoRA** refinement notes that at high ranks the empirical variance of $BA$ grows as $\sqrt{r}$, so scaling by $\alpha/\sqrt{r}$ is more stable than $\alpha/r$.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.9.1

## Cross-references

- Parent: [[LoRA-And-PEFT]]
- Core update: [[LoRA-Insight]]; rsLoRA in context: [[LoRA-Variants]]
