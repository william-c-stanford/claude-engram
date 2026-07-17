---
type: flashcards
note_address: "c-000027"
note_title: "Conditional Generation Head"
format: 1
---

### card c-000027-01
type: free

**Prompt**

The SFT (conditional-generation) head is architecturally identical to the LM head — same projection to vocabulary logits, same weights. What single change turns a general text predictor into an instruction-following assistant?

**Answer**

Loss masking. Prompt/instruction tokens provide context but receive no gradient (their labels are set to $-100$ so cross-entropy skips them); only response tokens contribute to the loss. The model thus learns to produce *responses* conditioned on instructions, not to predict every token of the input.

### card c-000027-02
type: derivation

**Prompt**

Write the SFT loss for the conditional-generation head, making explicit that it is averaged over response tokens only and conditioned on the prompt.

**Answer**

$$\mathcal{L}_\text{SFT} = -\frac{1}{|y|} \sum_{t=1}^{|y|} \log P(y_t \mid x_\text{prompt}, y_{<t})$$

The sum runs over the $|y|$ response tokens; prompt tokens $x_\text{prompt}$ appear only in the conditioning context, contributing no loss term.

### card c-000027-03
type: cloze

In the SFT objective, loss is taken only over response tokens, each predicted conditioned on the prompt and prior response tokens:

$$\mathcal{L}_\text{SFT} = -\frac{1}{|y|} \sum_{t=1}^{|y|} \log {{c::P(y_t \mid x_\text{prompt}, y_{<t})}}$$

### card c-000027-04
type: mcq

In practice, how is the "loss on response tokens only" rule implemented for the conditional-generation head?

- [x] Prompt token labels are set to $-100$ so cross-entropy ignores them
- [ ] Prompt tokens are deleted from the sequence before the forward pass
- [ ] A separate reward model down-weights the prompt gradients
- [ ] The prompt is encoded by a frozen second model
%% srs c-000027-01 {"due":"2026-07-21T20:37:47.369Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T20:37:47.369Z","rating":"easy"}],"easeDelta":0.15} %%
%% srs c-000027-04 {"due":"2026-07-21T20:37:56.282Z","interval":4,"ease":2.65,"reviews":[{"at":"2026-07-17T20:37:56.282Z","rating":"easy","verdict":"correct"}],"easeDelta":0.15} %%
%% srs c-000027-02 {"due":"2026-07-18T20:38:24.526Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T20:38:24.526Z","rating":"hard"}],"easeDelta":-0.15} %%
%% srs c-000027-03 {"due":"2026-07-18T20:38:41.870Z","interval":1,"ease":2.35,"reviews":[{"at":"2026-07-17T20:38:41.870Z","rating":"hard"}],"easeDelta":-0.15} %%
