---
type: flashcards
note_address: "c-000042"
note_title: "Tokenization Best Practices"
format: 1
---

### card c-000042-01
type: free

**Prompt**

Beyond the choice of algorithm, which three practical tokenizer settings most affect model quality, and what does each govern?

**Answer**

(1) Vocabulary size — the memory/coverage trade-off (32K minimal vs 128K for multilingual/code); (2) digit-level tokenization — splitting numbers digit-by-digit to aid arithmetic; and (3) fertility — tokens-per-word measured to diagnose per-language coverage.

### card c-000042-02
type: cloze

The three tokenizer settings that most affect model quality are {{c::vocabulary size}}, {{c::digit-level tokenization}}, and {{c::fertility measurement}}.
