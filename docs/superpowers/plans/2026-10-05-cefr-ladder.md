# CEFR ladder A1-C2: plan

Spec: `docs/superpowers/specs/2026-10-05-cefr-ladder-design.md`. After each task: `cd web && npm test`, then one conventional commit. Spacing rule in `CLAUDE.md` applies to every UI task (measure all routes, screenshot, look).

## Phase 1: Foundation (existing B2-C2 only) - DONE 2026-10-05
Retag result (per item): collocations A1 12 / A2 68 / B1 98 / B2 312 / C1 378 / C2 132; vocab A2 1 / B1 5 / B2 33 / C1 64 / C2 77; grammar B1 2 / B2 20 / C1 31 / C2 19; reading C1 6 / C2 3; listening B1 4 / B2 3 / C1 2; drills B1-C2 only. Dropped the grammar-vs-tree-node verify check (no reliable topic mapping); level tags are justified in `docs/audits/cefr-tagging/`.
- [x] 1.1 `core/cefr.ts` (type, order, labels) + `verify-cefr.cjs` skeleton asserting tags exist (fails first). Commit `feat(cefr): level type and verifier`.
- [x] 1.2 Relax hard-coded counts in `verify-*.cjs` to minimums; positional collocation parser. Commit `fix(content): positional collocation parser, count minimums`.
- [x] 1.2b Compiler emits `cefrLevel` for grammar/vocab/listening/drills (block field `CEFR`), reading frontmatter `cefrLevel`, collocations 6th column.
- [x] 1.2c Tag existing content **per item with a one-line rationale**, one commit per pillar (grammar, vocab, collocations, reading, listening, drills). Tier/category mapping is only a hint. Verify passes. Commits `feat(cefr): tag <pillar>`.
- [x] 1.3 Widen `SkillNode.cefrLevel` to `Cefr`; `AppStorageState.learnerLevel` + v1->v2 migration incl. `importBackup` (default B2) + effective-level helper + getters/setters. Commit `feat(cefr): learner level state`.
- [x] 1.4 Find what renders "C1 Scholar" (header badge, tree "RANK:"); header level badge + picker; a11y (button, aria-haspopup, Escape claims). Commit `feat(cefr): header level picker`.

## Phase 2: Level-aware UI (still B2-C2 data)
- [ ] 2.1 Vocab + Grammar: CEFR chips replace Lvl 1/2/3; modes derived from data; UI count strings computed. Commit `feat(cefr): level chips in vocab and grammar`.
- [ ] 2.2 Reading, Listening, Collocations, Drills filter *new* cards by effective level + "below my level" toggle; the SRS due queue stays level-independent. Computed count strings. Commit `feat(cefr): level filter across pillars`.
- [ ] 2.3 Skill tree: new nodes `<branch>-a1/-a2/-b1` (concrete ids + coordinates written here after measuring crowding); sub-B2 prerequisites count as satisfied for learners at or above that level; a node renders only when content for it exists. Commit `feat(cefr): 8-tier skill tree`.

## Phase 3: B1 content (all pillars)
- [ ] 3.1 B1 gap-fill after re-tagging (target = gap; indicative 100-150 collocations, 20-30 vocab, 24 grammar, 3 reading, 6 listening, 12+12 drills); collocations append at 1001+. Subagent per file, verify script, spot-check sample. B1 tree nodes added. Commits per pillar.

## Phase 4: A2 content (same targets)
## Phase 5: A1 content (same targets; Vietnamese-first glosses)

## Phase 6: Placement quiz
- [ ] 6.1 18-item MCQ (3 per level) from vocab+grammar, result sets learner level (highest level with >=2/3, stop at first failure); skippable; first-run only. Commit `feat(cefr): placement quiz`.

## Phase 7: Close-out
- [ ] 7.1 Update `STATUS.md`, screenshots of all views at desktop and 390, gaps measurement.
