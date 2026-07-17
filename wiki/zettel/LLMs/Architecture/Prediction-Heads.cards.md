---
type: flashcards
note_address: "c-000031"
note_title: "Prediction Heads"
format: 1
---

### card c-000031-01
type: free

**Prompt**

The transformer backbone produces the same contextual hidden state $h_t$ regardless of task. What single design choice lets that one backbone serve pretraining, instruction-following, and RL, and where does the task actually get defined?

**Answer**

The prediction *head* — the projection applied to $h_t$ — is swapped while the backbone is reused. The head (its output space and its loss) is what defines the task: project to $\mathbb{R}^{|V|}$ logits for token prediction, or to $\mathbb{R}^1$ for a scalar score. Nothing about the body changes.

### card c-000031-02
type: mcq

Two prediction heads project to vocabulary logits $\mathbb{R}^{|V|}$ and differ *only* in loss masking. Which pair is it?

- [x] Language-Modeling head (loss on all tokens) and Conditional-Generation head (loss on response tokens only)
- [ ] Language-Modeling head and Reward head
- [ ] Value head and Reward head
- [ ] Conditional-Generation head and Value head

### card c-000031-03
type: cloze

Across the four prediction heads, the two output shapes are: the LM and Conditional heads emit ${{c::\mathbb{R}^{|V|}\,}}$ logits, while the Value and Reward heads emit a scalar ${{c::\mathbb{R}^1}}$.

### card c-000031-04
type: mcq

Which prediction head is trained with a pairwise ranking loss rather than cross-entropy or MSE?

- [ ] Value head
- [x] Reward head
- [ ] Conditional-Generation head
- [ ] Language-Modeling head
