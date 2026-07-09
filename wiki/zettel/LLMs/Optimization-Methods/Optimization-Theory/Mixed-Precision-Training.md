---
type: zettel
address: "c-000119"
title: "Mixed Precision Training"
created: "2026-07-08"
parent: "c-000123"
children: []
tags:
  - llm-fundamentals
  - optimization
  - efficiency
---

# Mixed Precision Training

## Claim

Mixed precision runs the forward/backward pass in 16-bit while keeping an FP32 master copy of the weights for the optimizer step; **BF16** is preferred over FP16 because it shares FP32's exponent range, avoiding the overflow that forces FP16 to use loss scaling.

## Reasoning

The formats differ mainly in dynamic range: FP32 and BF16 both have 8 exponent bits (range $\sim 10^{\pm 38}$), while FP16 has 5 exponent bits (max $\approx 65504$). Gradients or activations above 65504 overflow to NaN/Inf in FP16, so FP16 needs **loss scaling** — multiply the loss by $S$ (e.g. $2^{15}$), compute scaled gradients, divide back by $S$ before the step, skip and shrink $S$ on overflow, grow $S$ after $N$ clean steps. BF16 needs none of this (A100/H100 support it natively).

**FP32 master weights:** weights are stored in FP32 and cast to 16-bit for the passes; the optimizer step happens in FP32 so tiny updates ($\Delta\theta \ll \theta$) are not lost to BF16's ~0.8% mantissa precision. Cost is $2\times$ weight storage. Master weights matter most for long runs and small learning rates; short SFT runs with large LR often train fine in BF16-only.

## Sources

- [[hitchhikers-guide-to-agentic-ai-ch1-llm-architecture]] §1.5.9

## Cross-references

- Parent: [[Optimization-Theory]]
- Clipping must unscale first: [[Gradient-Clipping]]
