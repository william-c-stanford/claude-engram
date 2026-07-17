---
type: flashcards
note_address: "c-000048"
note_title: "Sparse Autoencoders"
format: 1
---

### card c-000048-01
type: free

**Prompt**

What problem with individual neurons do sparse autoencoders (SAEs) solve, and what properties do the recovered features have?

**Answer**

Individual neurons are polysemantic — one neuron fires for many unrelated concepts — making neuron-level interpretation unreliable. An SAE decomposes activations into an overcomplete basis of monosemantic features (one concept each), which are also steerable and composable.

### card c-000048-02
type: cloze

An SAE is trained to minimize reconstruction plus a sparsity penalty, $\mathcal{L} = \lVert x - \hat{x} \rVert_2^2 + \lambda {{c::\lVert z \rVert_1}}$, so only a few features fire per input.

### card c-000048-03
type: mcq

In an SAE $h = W_\text{dec} \cdot \text{ReLU}(W_\text{enc} x + b_\text{enc}) + b_\text{dec}$, what makes the feature dictionary "overcomplete"?

- [x] The number of features $m$ far exceeds the activation dimension $d$ ($m \gg d$)
- [ ] The L1 sparsity penalty is removed
- [ ] $W_\text{dec}$ is tied to the token embedding matrix
- [ ] It uses more layers than the base model

### card c-000048-04
type: free

**Prompt**

What did clamping the "Golden Gate Bridge" feature demonstrate about SAE features, and how far do SAEs scale?

**Answer**

It demonstrated steerability — forcing that feature high makes the model mention the Golden Gate Bridge constantly — showing the direction is a causal, monosemantic handle on behavior. SAEs scale: Templeton et al. trained up to 34M features on Claude 3 Sonnet, surfacing safety-relevant concepts such as deception and sycophancy.
