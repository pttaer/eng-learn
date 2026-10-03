# Learning Audit — 2026-10-03

Scope: pedagogical fit of compiled content (`web/src/assets/data/*.json`, source `web/content/**`) for a Vietnamese learner targeting CEFR C2.

## Baseline counts (before this pass)

| Pillar | Count | Notes |
| :--- | :--- | :--- |
| Collocations | 1000 (250 × EVERYDAY/BUSINESS/ACADEMIC/IDIOMS) | phrase + Vietnamese only; 9 duplicate phrases |
| Grammar | 60 (15 × 4 modes, 5 per level) | strong transformation format |
| Vocabulary | 120 (40 × ROOT_FORGE / CEFR_ASCENT / PARTICLE_LAB) | level skew; 5 particles only |
| Speaking | 30 | all tech/policy debate prompts |
| Writing | 30 | all argumentative academic paragraphs |
| Reading | 3 articles (2 × C1, 1 × C2) | ~1,300 words of intensive text total |
| Listening | 4 rules, 3 passages | passages are single sentences (14–18 words) |
| Habits | 30-day plan | 79 dead `file:///E:/Eng/...` links |

## Gaps, ranked by impact on C2 attainment

1. **Reading volume and genre range (critical).** Three articles is roughly one week of the 4-pass protocol. All three are expository tech/cognition essays; no narrative/literary prose, no legal or argumentative text with concession structure, no hedged empirical writing. C2 reading requires implicit meaning and stylistic range across genres. *Action this pass: +3 C2 articles in new genres.*
2. **Vocabulary breadth and level skew (high).** 120 items is thin for C2 (the gap from C1 to C2 is mostly low-frequency, register-marked lexis). ROOT_FORGE has only 6 level-1 items, and several "level 1" items (e.g. `predict`, `chronic`) are B1. PARTICLE_LAB has only 2 level-3 items and covers only UP/OUT/DOWN/OFF/ON, with nothing for THROUGH/OVER/BACK/AWAY/IN/AROUND, where most C2 phrasal idiom lives. CEFR_ASCENT lacks stance and hedging lexis (`tenuous`, `specious`, `belie`). *Action: +60 items (20 per mode), new roots, new particles, weighted to L2/L3.*
3. **Productive register monotony (high).** All 30 speaking prompts are abstract policy debates, and all 30 writing prompts are academic argument. CEFR C2 descriptors require register flexibility: tactful disagreement, bad-news delivery, storytelling, letters, reports, reviews. *Action: +10 speaking (interpersonal/pragmatic) and +10 writing (genre-varied).*
4. **Listening is a stub (high, not addressed).** Three one-sentence passages cannot train C2 listening, which means extended speech, multiple accents and implicit attitude. Needs multi-paragraph passages with accent variety and inference questions. **Still open.**
5. **Collocations lack context (medium, not addressed).** No example sentences, so learners can't see usage or colligation. Many EVERYDAY items are A2/B1 (`make money`, `make a mistake`). 9 phrases are duplicated (e.g. `go on strike` 221/492, `carbon footprint` 749/910, `renewable energy` 750/913). **Still open:** dedupe, then add an example field (this needs parser support).
6. **Grammar coverage (medium).** The 4-mode matrix is solid but misses common C2 error classes: agreement with distant heads, pronoun reference, `fewer/less` and `comprise`, and `would that` / `were it not for`. *Action: +12 rules (3 per mode, one per level).*
7. **Accuracy nits (low).** `cognitive-bandwidth.md` presents subvocalization suppression as the route to mastery. Reading research treats inner speech as supportive of comprehension, so the speed-reading framing is contested. Writing prompt 28 had the typo "an Hyper-Connected" (fixed this pass). **Subvocalization framing still open.**
8. **Habits plan links (low, not addressed).** 79 links point to `file:///E:/Eng/*.md`, which doesn't exist; the guides now live in `docs/curriculum/`. **Still open.**

## Outcome of this pass

See commit history. Targets: reading 3→6, vocabulary 120→180, grammar 60→72, speaking 30→40, writing 30→40. The count guards in `web/scripts/verify-content-pipeline.cjs` and `verify-typographic-pedagogy.cjs` were bumped to the new exact totals.
