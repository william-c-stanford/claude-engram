---
type: zettel
address: "c-000098"
title: "Helpfulness-Safety Tradeoff"
created: "2026-07-08"
parent: "c-000103"
children: []
tags:
  - llm-fundamentals
  - safety
subtree_size: 0
cards_due: 0
---

# Helpfulness-Safety Tradeoff

## Claim

Over-optimizing for safety causes **over-refusal** — the model declines benign requests (e.g. discussing historical violence in an educational context); the goal is a Pareto-optimal policy that maximizes helpfulness *within* safety constraints, implemented as a weighted reward.

## Reasoning

Formally the objective is constrained:

$$\max_\theta \ \mathbb{E}[R_{\text{helpful}}] \quad \text{subject to} \quad \mathbb{E}[R_{\text{safety}}] \ge \tau$$

In practice this is a weighted reward $R = \alpha R_{\text{helpful}} + (1-\alpha) R_{\text{safety}}$ with $\alpha$ carefully tuned (typically 0.6–0.8). Meta's Llama-3 uses distinct safety and helpfulness reward models with margin-based weighting. The tension is real: push $\alpha$ too low and the model refuses legitimate requests; too high and it complies with harmful ones — so the tradeoff is a tuning target, not a solved problem.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.17.4

## Cross-references

- Parent: [[LLM-Safety]]
- Over-refusal as a prompt symptom: [[Prompt-Engineering-Best-Practices]]
- Reward models: [[Reward-Head]]


