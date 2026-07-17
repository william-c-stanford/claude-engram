---
type: flashcards
note_address: "c-000028"
note_title: "Language Modeling Head"
format: 1
---

### card c-000028-01
type: derivation

**Prompt**

Write the LM head's projection from hidden state to a next-token distribution (give the shape of the projection matrix), and the causal LM loss it is trained with over $T$ positions.

**Answer**

$$P(x_{t+1} \mid x_{\le t}) = \text{softmax}(W_\text{head}\, h_t + b), \qquad W_\text{head} \in \mathbb{R}^{|V| \times d}$$

$$\mathcal{L}_\text{LM} = -\frac{1}{T} \sum_{t=1}^{T} \log P(x_t \mid x_{<t})$$

Every token is both input (shifted right) and target (shifted left), so one forward pass yields $T$ prediction targets.

### card c-000028-02
type: cloze

The LM head turns a hidden state into a next-token distribution by:

$$P(x_{t+1} \mid x_{\le t}) = {{c::\text{softmax}(W_\text{head}\, h_t + b)}}$$

### card c-000028-03
type: free

**Prompt**

Under weight tying the LM head reuses the embedding table as $W_\text{head} = E^\top$. Beyond saving parameters, why does this couple token probabilities to embedding geometry?

**Answer**

Because the logit for token $v$ becomes $E_v \cdot h_t$ — the dot product of that token's embedding with the hidden state. Tokens whose embeddings point in the direction of $h_t$ score highest, so the same geometry that places tokens in embedding space directly determines their output probabilities. It also tends to improve generalization.

### card c-000028-04
type: cloze

Under weight tying, the LM head's projection matrix is set equal to the transpose of the embedding table: $W_\text{head} = {{c::E^\top}}$.
%% srs c-000028-04 {"due":"2026-07-18T20:22:41.180Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T20:22:41.180Z","rating":"good"}]} %%
%% srs c-000028-01 {"due":"2026-07-18T20:26:45.319Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T20:26:45.319Z","rating":"hard"}],"easeDelta":-0.15} %%
%% srs c-000028-02 {"due":"2026-07-18T20:27:11.958Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T20:27:11.958Z","rating":"good"}]} %%
%% srs c-000028-03 {"due":"2026-07-18T20:28:23.866Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T20:28:23.866Z","rating":"hard"}],"easeDelta":-0.15} %%
