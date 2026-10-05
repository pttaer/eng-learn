# CEFR ladder A1-C2: plan

Spec: `docs/superpowers/specs/2026-10-05-cefr-ladder-design.md`. After each task: `cd web && npm test`, then one conventional commit. Spacing rule in `CLAUDE.md` applies to every UI task (measure all routes, screenshot, look).

## Phase 1: Foundation (existing B2-C2 only)
- [ ] 1.1 `core/cefr.ts` (type, order, labels) + `verify-cefr.cjs` skeleton asserting tags exist (fails first). Commit `feat(cefr): level type and verifier`.
- [ ] 1.2 Compiler: parse `CEFR` for grammar/vocab/listening/drills (block field), reading frontmatter `cefr`, collocations 6th column; emit `cefr` in JSON. Tag all existing md sources per the mapping. Verify passes. Commit `feat(cefr): tag all existing content`.
- [ ] 1.3 Widen `SkillNode.cefrLevel` to `Cefr`; `AppStorageState.learnerLevel` + v1->v2 migration (default B2) + getters/setters. Commit `feat(cefr): learner level state`.
- [ ] 1.4 Header level badge + picker (replaces hard-coded C1 Scholar rank text); a11y (button, aria-haspopup, Escape claims). Commit `feat(cefr): header level picker`.

## Phase 2: Level-aware UI (still B2-C2 data)
- [ ] 2.1 Vocab + Grammar: CEFR chips replace Lvl 1/2/3; modes derived from data. Commit `feat(cefr): level chips in vocab and grammar`.
- [ ] 2.2 Reading, Listening, Collocations, Drills filter by learner level + "below my level" toggle. Commit `feat(cefr): level filter across pillars`.
- [ ] 2.3 Skill tree: 8 nodes per branch layout, locking by learner level, new `*-0a/0b/0c` placeholder nodes appear only when their content phase lands (feature-flag by data presence). Commit `feat(cefr): 8-tier skill tree`.

## Phase 3: B1 content (all pillars)
- [ ] 3.1 B1 collocations 150, vocab 30, grammar 24, reading 3, listening 6, drills 12+12 (subagent per file, verify script, spot-check sample). Tree nodes B1 added. Commits per pillar.

## Phase 4: A2 content (same targets)
## Phase 5: A1 content (same targets; Vietnamese-first glosses)

## Phase 6: Placement quiz
- [ ] 6.1 12-item MCQ from vocab+grammar, result sets learner level; skippable; first-run only. Commit `feat(cefr): placement quiz`.

## Phase 7: Close-out
- [ ] 7.1 Update `STATUS.md`, screenshots of all views at desktop and 390, gaps measurement.
