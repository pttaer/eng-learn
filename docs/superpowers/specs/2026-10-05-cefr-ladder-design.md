# CEFR ladder A1 to C2: design

## Problem
The app only covers B2 to C2 (26 tree nodes: 6 B2, 10 C1, 10 C2; reading all C1/C2; grammar and vocab "Lvl 1/2/3" are unlabeled difficulty tiers). A learner below B2 has nowhere to start, and nothing says which level an item belongs to.

## Decisions (user-approved 2026-10-05)
- Full ladder **A1, A2, B1, B2, C1, C2**.
- **Tag everything** with an explicit CEFR level, **per item, never per tier or category**. Existing tiers 1/2/3 and categories are only a starting hint: "seldom" inversion is C1 even though it sits in tier 1; "make a decision" and "do homework" are A2/B1 even though they sit in a B2 file.
- One global **learner level**, filters every pillar. No per-level duplicate courses.

## Data model
- `type Cefr = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2'` in `web/src/core/cefr.ts`, with `CEFR_ORDER`, `cefrIndex()`, and a display label per level (e.g. "A1 Beginner" ... "C2 Mastery").
- Field name is `cefrLevel` everywhere (already used by tree nodes and reading articles); no rename, no alias. Added to grammar rules, vocabulary items, collocations, listening passages and speaking/writing drills; tree and reading widen their type to `Cefr`.
- Markdown sources carry it: `- **CEFR**: B2` in grammar/vocab/listening/drills blocks (vocab already has a `CEFR Rank` line, reuse it); reading frontmatter `cefrLevel:`; the collocation table gets a 6th column `CEFR` (Index | Phrase | Vietnamese | Category | Example | CEFR). The compiler never defaults a missing tag; `verify-cefr.cjs` fails on untagged items.
- **Collocation parser:** switch the row parser to positional (`line.slice(1,-1).split('|')`, trim each cell, keep empty cells) before adding the column, so an empty Example cannot shift CEFR into its slot.
- **IDs are stable.** Collocation ids stay `colloc-${index}`; SRS state is keyed by them. New items append at 1001+ in new files, never renumbered; other pillars keep their ids.
- **Tagging is per item, with a one-line rationale** kept in a tagging log under `docs/`, not in the app. Reference: English Vocabulary Profile / Oxford 3000-5000 for words and English Grammar Profile for structures if reachable by WebFetch, otherwise labeled "model judgment". A verify check: no grammar rule's `cefrLevel` is below the tree node for that topic.
- Content targets for A1/A2/B1 are the **gap after re-tagging**, not a flat number (many existing items will land at A2/B1).
- `mode`/`category` stay free strings. Grammar/vocab mode tabs are **derived from data** (distinct modes at the active level) with a title map, not hard-coded.

## Learner state
- `AppStorageState.learnerLevel: Cefr` (version 2). Migration from v1 sets `B2` (existing users were already doing B2+); `importBackup` also migrates v1 backups. New users: placement quiz (skippable), default A1.
- **Effective level** = learner level, or the nearest level that has content while a level has none (new users never land on empty screens during phases 1-5).
- `StorageManager.getLearnerLevel()/setLearnerLevel()`; changing level never deletes SRS state.
- **SRS independence:** the level filter applies to *new* cards only. Due reviews, the daily-workout counter and the "Review 15" quest always include every due card regardless of level.

## UI
- Header shows level badge (replaces the hard-coded "C1 Scholar" rank text); click opens a level picker (A1-C2).
- Vocab/Grammar: "Lvl 1/2/3" tabs replaced by CEFR chips for levels that have content; default = effective level. Reading/Listening/Collocations/Drills filter the same way, plus a "show below my level" toggle.
- **No hard-coded counts in UI strings.** Computed from the filtered list: "Full 1,000 Lexicon", "SEARCH 1,000 COLLOCATIONS", "VAULT x / 1000", "SRS Due (20)", "5/25 perks", branch taglines. Find what renders "C1 Scholar" (header rank badge and the tree's "RANK:") before replacing it.
- Skill tree: each branch grows from 5 to 8 nodes: three new nodes `<branch>-a1`, `-a2`, `-b1` below the existing `-1..-5`, chain `a1 -> a2 -> b1 -> <branch>-1`. **Prerequisites below the learner's level count as satisfied**, so migrated B2 users keep their tree unlocked. Concrete node ids and coordinates are written into the plan at task 2.3, after measuring label crowding at 1440x900 and 390; the view may show only the learner level +-1 band if 8 rows crowd labels.
- Placement quiz: **18 multiple-choice items** (3 per level A1-C2) from vocab + grammar; result = highest level answered with >= 2 of 3 correct, stopping at the first level with < 2. Built last, after content exists.

## Content targets (gap after re-tagging)
Indicative for each of A1, A2, B1: collocations 100-150, vocabulary 20-30, grammar 24 (new modes per level, e.g. Tenses, Modals, Conditionals), reading 3, listening 6, speaking drills 12, writing drills 12. Low levels get Vietnamese glosses everywhere. Content is written by subagents per file, validated by `verify-cefr.cjs`, spot-checked by the user.

## Verification
`verify-cefr.cjs`: every item has a valid `cefrLevel`; minimum item counts per level and pillar; tree prerequisites exist, are acyclic, and are satisfied when below learner level; grammar rule level >= its tree node level; collocation phrases unique across all levels. **Hard-coded counts** in `verify-*.cjs` (collocations 1000, grammar 72, vocab 180, drills 40/40, articles 9, lexicon entries in the Init 17 scripts) become minimums before the first content phase. `npm test` after every task.

## Out of scope / known limits for A1 and A2 (stated)
- The daily-workout panel (Franklin inversion, 4-3-2) and the 30-day habit plan stay advanced and level-agnostic.
- UI copy ("Syntactic Transformation", "Hermeneutic", etc.) stays heavy for beginners.
- No automatic CEFR scoring of speaking/writing; new listening passages use TTS as today; anime.js v4 and big-file splits stay deferred.
