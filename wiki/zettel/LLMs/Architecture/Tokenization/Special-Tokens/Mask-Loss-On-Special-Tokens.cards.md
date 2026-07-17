---
type: flashcards
note_address: "c-000035"
note_title: "Mask Loss on Special Tokens"
format: 1
---

### card c-000035-01
type: free

**Prompt**

During supervised fine-tuning, why should the loss not be computed on structural (special) tokens?

**Answer**

Structural tokens are inserted by the chat template, not generated as a modeling decision. If the SFT loss rewards predicting them, the model spends capacity memorizing template scaffolding instead of the response content that matters. Masking those positions confines the gradient signal to the tokens the model actually needs to generate.

### card c-000035-02
type: cloze

To keep gradients off template scaffolding during SFT, special-token positions are masked by setting their label to ${{c::-100}}$ in typical frameworks.

### card c-000035-03
type: mcq

When we "mask loss on special tokens" during SFT, what exactly is being masked?

- [x] The loss/gradient at the positions of structural tokens (role markers, separators)
- [ ] The attention weights that read the padding token
- [ ] The special tokens themselves, removed from the input sequence
- [ ] The embedding rows of the special tokens, frozen during training
