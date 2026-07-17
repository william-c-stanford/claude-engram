---
type: flashcards
note_address: "c-000047"
note_title: "Natural Language Autoencoders"
format: 1
---

### card c-000047-01
type: free

**Prompt**

How does a Natural Language Autoencoder (NLAE) differ architecturally from a sparse autoencoder, and what makes its features "self-interpreting"?

**Answer**

An NLAE replaces the SAE's sparse-vector bottleneck with a natural-language description: an encoder LM reads activations and emits a text description of the active concepts, and a decoder LM reconstructs the activations from that description, both trained end-to-end. Because the bottleneck is human-readable language, the features *are* text — self-interpreting, with no manual labeling of directions.

### card c-000047-02
type: mcq

Which capability do NLAEs have that a single SAE direction cannot express?

- [x] Compositional/relational concepts like "a sarcastic response to a factual claim"
- [ ] Exact activation magnitudes
- [ ] Geometric sub-symbolic patterns
- [ ] Zero-cost inference

### card c-000047-03
type: free

**Prompt**

What are the two main limitations of NLAEs relative to SAEs?

**Answer**

(1) A language model in the loop is expensive and inherits the faithfulness concerns of any model-generated explanation; (2) they cannot easily represent sub-symbolic features — geometric patterns or exact magnitudes — that SAEs capture as activation strengths.
