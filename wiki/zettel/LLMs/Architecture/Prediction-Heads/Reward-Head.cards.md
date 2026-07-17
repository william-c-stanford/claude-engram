---
type: flashcards
note_address: "c-000029"
note_title: "Reward Head"
format: 1
---

### card c-000029-01
type: free

**Prompt**

The reward head is trained not by regressing to a target score but by a pairwise ranking loss over a chosen/rejected response pair. Why is ranking preferred over regression here?

**Answer**

Absolute quality scores are not well-defined or consistent across annotators, but *relative* preference (this response is better than that one) is. The ranking loss only needs to push the chosen response's scalar above the rejected one's, learning a comparative reward signal without ever committing to an absolute target — exactly the signal PPO/GRPO then optimize against.

### card c-000029-02
type: mcq

How does the reward head collapse an entire variable-length response into a single scalar score?

- [x] It pools the last token's hidden state and passes it through a classification layer $\mathbb{R}^d \rightarrow \mathbb{R}^1$
- [ ] It averages the per-position vocabulary logits across the sequence
- [ ] It sums the cross-entropy loss over all response tokens
- [ ] It regresses each token to a value and takes the maximum

### card c-000029-03
type: cloze

In HuggingFace, a reward head is instantiated as {{c::`AutoModelForSequenceClassification`}} with {{c::`num_labels=1`}}, giving a single scalar output per sequence.

### card c-000029-04
type: mcq

Both the reward head and the value head output a scalar from the backbone. What distinguishes the reward head?

- [x] It scores a whole completed response via pairwise ranking; the value head regresses per-state value by MSE for advantage estimation
- [ ] The reward head outputs per-token values; the value head outputs one number per response
- [ ] The reward head is trained with MSE; the value head with a ranking loss
- [ ] The reward head shares the vocabulary projection; the value head does not
%% srs c-000029-02 {"due":"2026-07-21T20:35:08.030Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T20:35:08.030Z","rating":"easy","verdict":"correct"}],"easeDelta":0.15} %%
%% srs c-000029-01 {"due":"2026-07-18T20:35:34.833Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T20:35:34.833Z","rating":"hard"}],"easeDelta":-0.15} %%
%% srs c-000029-03 {"due":"2026-07-18T20:35:55.899Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T20:35:55.899Z","rating":"good"}]} %%
%% srs c-000029-04 {"due":"2026-07-18T20:36:35.375Z","interval":1,"ease":2.5,"reviews":[{"at":"2026-07-17T20:36:35.375Z","rating":"good","verdict":"correct"}]} %%
