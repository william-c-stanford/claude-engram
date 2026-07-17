---
type: flashcards
note_address: "c-000060"
note_title: "Pre-LN vs Post-LN"
format: 1
---

### card c-000060-01
type: free

**Prompt**

Why does Pre-LN stabilize training and remove the warmup requirement compared to Post-LN?

**Answer**

Pre-LN normalizes each sublayer's *input* while leaving the residual path un-normalized, preserving a clean identity highway from input to output that keeps gradients well-scaled through depth. Post-LN normalizes the residual stream itself each block, which destabilizes early training and typically demands a careful learning-rate warmup.

### card c-000060-02
type: cloze

Pre-LN normalizes the sublayer input before adding the residual, $h + \text{SubLayer}(\text{LN}(h))$; the original Post-LN instead normalizes after the sublayer: ${{c::h + \text{LN}(\text{SubLayer}(h))}}$.

### card c-000060-03
type: mcq

Roughly what magnitude difference could a 128-layer transformer see between its first and last layer without normalization — the number the note uses to motivate it?

- [x] Around $10^{30}\times$
- [ ] About $2\times$
- [ ] About $128\times$
- [ ] Around $10^{6}\times$
