---
type: flashcards
note_address: "c-000030"
note_title: "Value Head"
format: 1
---

### card c-000030-01
type: derivation

**Prompt**

Write the value head's scalar output from a hidden state and the loss used to train it against observed returns $R_t$.

**Answer**

$$V(s_t) = w_\text{value}^\top h_t + b \in \mathbb{R}, \qquad w_\text{value} \in \mathbb{R}^d$$

$$\mathcal{L}_V = \frac{1}{T}\sum_t \big(V(s_t) - R_t\big)^2$$

A linear layer $\mathbb{R}^d \rightarrow \mathbb{R}^1$ (sometimes a small MLP $d \rightarrow 256 \rightarrow 1$), trained by MSE and used for PPO advantage estimation (GAE).

### card c-000030-02
type: cloze

The value head maps a hidden state to a scalar state-value estimate via a linear projection:

$$V(s_t) = {{c::w_\text{value}^\top h_t + b}} \in \mathbb{R}$$

### card c-000030-03
type: free

**Prompt**

The value head must be initialized with near-zero final-layer weights. What failure mode does this prevent in early PPO training?

**Answer**

Large initial weights make the value estimates wildly wrong from the start. Since advantages are computed as return minus value, those errors produce huge, noisy advantages, which drive huge policy updates and destabilize training. Initializing near zero (e.g. $\mathcal{N}(0, 1/\sqrt{d})$ or zeros) keeps early value estimates small so advantages stay controlled while the critic learns.

### card c-000030-04
type: mcq

Which loss trains the value head, and what is its output consumed for?

- [x] MSE against observed returns; its estimates feed PPO/GRPO advantage estimation (GAE)
- [ ] Pairwise ranking loss; it scores response quality for RLHF
- [ ] Cross-entropy over the vocabulary; it predicts the next token
- [ ] MSE against returns; it directly emits the sampled action tokens
%% srs c-000030-03 {"due":"2026-07-18T20:41:51.944Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T20:41:51.944Z","rating":"good"}]} %%
%% srs c-000030-04 {"due":"2026-07-18T20:42:13.633Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T20:42:13.633Z","rating":"good","verdict":"correct"}]} %%
%% srs c-000030-01 {"due":"2026-07-18T20:42:20.595Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T20:42:20.595Z","rating":"hard"}],"easeDelta":-0.15} %%
%% srs c-000030-02 {"due":"2026-07-18T20:42:35.788Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T20:42:35.788Z","rating":"hard"}],"easeDelta":-0.15} %%
