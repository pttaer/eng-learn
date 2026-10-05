# CEFR ladder A1 to C2: design

## Problem
The app only covers B2 to C2 (26 tree nodes: 6 B2, 10 C1, 10 C2; reading all C1/C2; grammar and vocab "Lvl 1/2/3" are unlabeled difficulty tiers). A learner below B2 has nowhere to start, and nothing says which level an item belongs to.

## Decisions (user-approved 2026-10-05)
- Full ladder **A1, A2, B1, B2, C1, C2**.
- **Tag everything** with an explicit `cefr`; existing grammar/vocab tiers 1/2/3 map to B2/C1/C2.
- One global **learner level**, filters every pillar. No per-level duplicate courses.

## Data model
- `type Cefr = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2'` in `web/src/core/cefr.ts`, with `CEFR_ORDER`, `cefrIndex()`, and a display label per level (e.g. "A1 Beginner" ... "C2 Mastery").
- `cefr` field on: grammar rules, vocabulary items, collocations, reading articles (rename of `cefrLevel`, kept as alias until UI migrated), listening passages, speaking/writing drills, skill-tree nodes (type widened).
- Markdown sources carry it: `- **CEFR**: B2` in grammar/vocab/listening/drills blocks; reading frontmatter `cefr:`; collocation table gets a 6th column `CEFR` (Index | Phrase | Vietnamese | Category | Example | CEFR). Compiler defaults a missing tag to **nothing**; the verify script fails on untagged items (no silent default).
- Existing mapping: `level 1 -> B2`, `2 -> C1`, `3 -> C2`; reading uses its current `cefrLevel`; collocations 1-1000 = B2 (everyday/business) or C1 (academic) or C2 (idioms) by category, adjusted per item only where obviously wrong; drills B2-C2 by their level/mode.
- `mode`/`category` stay free strings. Grammar/vocab mode tabs are **derived from data** (distinct modes at the active level) with a title map, not hard-coded.

## Learner state
- `AppStorageState.learnerLevel: Cefr` (version 2). Migration from v1 sets `B2` (existing users were already doing B2+). New users: placement quiz, skippable (default A1).
- `StorageManager.getLearnerLevel()/setLearnerLevel()`; changing level never deletes SRS state.

## UI
- Header shows level badge (replaces the hard-coded "C1 Scholar" rank text); click opens a level picker (A1-C2).
- Vocab/Grammar: "Lvl 1/2/3" tabs replaced by CEFR chips for levels that have content; default = learner level. Reading/Listening/Collocations/Drills filter the same way, plus a "show below my level" toggle for review.
- Skill tree: 8 nodes per branch (A1, A2, B1, B2, then existing C1 x2... mapped; see plan) laid out bottom-up; nodes above learner level+1 render locked; prerequisites chain unchanged for existing nodes (the first existing node `*-1` gains prerequisites from the new B1 node).
- Placement quiz: 12 multiple-choice items drawn from vocab + grammar items spanning A1-C2 (2 per level), result = highest level with >= 2/3 correct run. Built last, after content exists.

## Content targets (per new level A1, A2, B1)
collocations 150, vocabulary 30, grammar rules 24 (new modes per level, e.g. Tenses, Modals, Conditionals), reading 3, listening 6, speaking drills 12, writing drills 12. Low levels get Vietnamese glosses everywhere (vocab, collocations, grammar cue). Content written by subagents per file, validated by `verify-cefr.cjs`, spot-checked by the user.

## Verification
`verify-cefr.cjs`: every item has a valid `cefr`; minimum item counts per level and pillar; tree prerequisites exist and are acyclic; no node unlocks below its own level chain; collocation phrases unique across all levels. Existing `verify-content-pipeline.cjs` count assertions change from "exactly 1000" to per-level minimums. `npm test` after every task.

## Out of scope (stated)
Per-level 30-day habit plans (the existing plan stays level-agnostic), speaking/writing automatic CEFR scoring, audio recordings for new listening passages (TTS as today), anime.js v4 and big-file splits.
