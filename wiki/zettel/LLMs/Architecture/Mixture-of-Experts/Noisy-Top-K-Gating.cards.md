---
type: flashcards
note_address: "c-000024"
note_title: "Noisy Top-K Gating"
format: 1
---

### card c-000024-01
type: free

**Prompt**

Why does plain Top-K expert selection strand experts permanently, even though the router is trained by gradient descent?

**Answer**

The selection itself is non-differentiable — gradients flow only through the softmax over *selected* experts. An unselected expert gets no gradient, never improves, and so is never selected: a deadlock only exploration noise can break.

### card c-000024-02
type: derivation

**Prompt**

Write the noisy Top-K gating pre-activation $H(x)$, including how the noise magnitude is learned and kept positive.

**Answer**

$$H(x) = W_g x + \epsilon \cdot \text{Softplus}(W_{\text{noise}} x), \quad \epsilon \sim \mathcal{N}(0,1)$$

then $g(x) = \text{softmax}(\text{TopK}(H(x), k))$. $W_{\text{noise}}$ is a learned per-expert exploration magnitude; Softplus keeps it positive. At inference the noise is removed.

### card c-000024-03
type: cloze

In noisy gating, the masked term is the learned, always-positive per-expert noise scale that occasionally promotes underdog experts:

$$H(x) = W_g x + \epsilon \cdot {{c::\text{Softplus}(W_\text{noise} x)}}, \quad \epsilon \sim \mathcal{N}(0,1)$$

### card c-000024-04
type: mcq

How does the Gumbel-Softmax alternative differ from Gaussian noisy Top-K gating?

- [ ] It removes noise entirely and uses a hard argmax in both passes
- [x] It replaces argmax with a temperature-controlled softmax over logits plus Gumbel noise, often with a straight-through estimator
- [ ] It adds noise to expert outputs instead of router logits
- [ ] It requires Top-1 routing and cannot handle K > 1

### card c-000024-05
type: pseudocode

**Prompt**

Sketch noisy Top-K routing for one token (training mode).

**Answer**

```text
h      = W_g @ x + randn() * softplus(W_noise @ x)   # noisy logits
topk   = indices of K largest entries of h
gates  = softmax(h[topk])
y      = sum(gates[i] * expert[i](x) for i in topk)
# inference: drop the noise term for deterministic routing
```
%% srs c-000024-05 {"due":"2026-07-18T18:37:53.447Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T18:37:53.447Z","rating":"hard"}],"easeDelta":-0.15} %%
%% srs c-000024-04 {"due":"2026-07-21T18:38:12.122Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T18:38:12.122Z","rating":"easy"}],"easeDelta":0.15} %%
%% srs c-000024-02 {"due":"2026-07-18T18:49:51.714Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T18:49:51.714Z","rating":"hard"}],"easeDelta":-0.15} %%
