# IELTS 7.0 Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a learner who completes the app able to score IELTS Academic >= 7.0 overall (>= 7.0 in each skill is the safe target).

**Architecture:** Add an IELTS layer on top of the existing CEFR ladder: exam-format content (question-bearing reading, multi-speaker listening, Task 1/Task 2 writing, Part 1/2/3 speaking), a band-estimating scorer per skill, and timed mock tests. Reuse existing engines (`srs-engine`, `skill-tree-engine`, `level-filter`, `acoustic-engine`) and the content pipeline (`web/content/**` markdown -> `compile-content.cjs` -> `web/src/assets/data/*.json`).

**Tech Stack:** TypeScript + Vite (web/), markdown content compiled by `web/scripts/compile-content.cjs`, `web/scripts/verify-*.cjs` node checks, Web Speech / MediaRecorder already in `acoustic-engine.ts`.

**Spec:** this document's Audit section (no separate spec; user request 2026-10-06 "audit the app ... IELTS 7.0").

## Global Constraints

- Do not break existing CEFR ladder: `node web/scripts/run-verify.cjs` must stay green (34 scripts as of 2026-10-05).
- UI spacing rules from `E:\Eng\CLAUDE.md`: 8 inside group, 16 between groups, shared dossier skeleton, measure at 1440 and 390 widths and screenshot before done.
- No new runtime dependency (`package.json` deps: `animejs` only).
- New content carries `cefrLevel` and a new `ielts` tag (see Task 1) so `level-filter.ts` keeps working.
- Content authored by a model needs human spot-check (see STATUS.md "Still open"); never present model-written answer keys as verified.

---

## Audit (IELTS teacher view)

**Verdict: NO. A student who finishes everything in the app today would not reliably reach 7.0 overall. Realistic outcome: strong vocabulary and grammar knowledge, weak and unmeasured exam performance. Estimate ~5.5-6.5 depending on learner, with Listening and Reading the largest gaps.** The grep for "ielts" across the whole repo returns nothing: the app is built around CEFR C2 self-study, not the exam.

Evidence (counts from `web/src/assets/data/*.json`, 2026-10-06):

| Skill | What exists | IELTS 7.0 needs | Gap |
| :--- | :--- | :--- | :--- |
| Listening | 27 passages, 4-34 words each (max 34 words ~ 12 sec). Scored by self-comparison, TTS audio. | 4 sections, ~30 min, 40 Qs, multi-speaker dialogue/monologue, 1,000+ words per section, accents, note/form/map/MCQ/matching questions | **Critical.** No exam format, no questions, no real-length audio. Cannot train 7.0 (30+/40). |
| Reading | 21 articles (A1 102 words ... C2 460 words max); "four-pass protocol" with free-text comprehension checks. | 3 passages ~900 words each, 60 min, 40 Qs: T/F/NG, Y/N/NG, matching headings, matching info, sentence/summary completion, MCQ | **Critical.** Passages ~half to a third of IELTS length, zero IELTS question types, no timing, no auto-scoring. T/F/NG is a distinct skill that is never taught. |
| Writing | 76 prompts (all paragraph level; modes: 4/6/8-sentence paragraph, MEAL paragraph, copywork). Diff view vs model answer. | Task 1 (150 words: graph/chart/process/map description, or letter for GT) + Task 2 (250 words essay, 40 min total); rubric TR/CC/LR/GRA | **Critical.** No Task 1 at all, no data to describe, no essay with 4-5 paragraphs, no band rubric, no word-count/time constraint. MEAL paragraph is a good base for Task 2 body paragraphs only. |
| Speaking | 76 prompts (30s/60s/90s talks, 4-3-2 drill, impromptu). Mic recording + acoustic analysis exist. | Part 1 (4-5 min Q&A), Part 2 (cue card, 1 min prep, 2 min talk), Part 3 (abstract discussion); band descriptors FC/LR/GRA/Pron | **High.** Closest to ready (recording + fluency tooling exists) but no Part 1/2/3 structure, no cue cards, no examiner-style follow-ups, no band feedback. |
| Vocabulary | 254 core items + 842 lexicon + AWL corpus (512 lines) + rhetoric. | Roughly 6,000-8,000 word families, strong topic lexis (environment, education, technology, health, work, crime, ...) | **Medium.** Quality good (AWL, collocations 1,336, phrasal verbs). Quantity low and topic-light; skews C1/C2 literary-academic. |
| Grammar | 144 rules A1-C2, transformation format. | Complex structures with accuracy; error-free sentences | **Low-Medium.** Best pillar. Missing exam use: accuracy under time, conditional/passive in Task 1, comparison language for data. |
| Measurement | CEFR placement quiz (vocab-based) + multi-skill diagnostic (30 Qs, 6 per skill). | Band estimate per skill, timed full mocks, error log | **Critical.** No band scale, no mock test, no timer-pressure practice, no score tracking against 7.0. |
| Strategy | None. | Skimming/scanning, paraphrase spotting, distractor traps, time per section, Task 1 overview, Task 2 position clarity | **High.** Strategy is a big part of 6.5 -> 7.0 jump. |

What is genuinely good and kept: CEFR ladder A1-C2, SRS engine, 1,336 collocations with examples, grammar transformation drills, MEAL writing scaffold, mic/acoustic tooling, tree progression. These cover the "knowledge" layer of 7.0. The missing layer is **exam format, timing, and scored feedback**.

Prerequisite honesty: 7.0 is roughly CEFR C1 on all four skills. App has C1 content in all pillars, but Listening C1 is single sentences, and Reading C1 passages are 420-450 words. So even the C1 path is under-served for exam-length input.

---

## File Structure

| File | Responsibility |
| :--- | :--- |
| `web/content/ielts/reading/*.md` | IELTS-style passages (~900 words) + question blocks with answer key |
| `web/content/ielts/listening/*.md` | Multi-speaker scripts (300-600 words each, 4 sections) + questions + key |
| `web/content/ielts/writing-task1/*.md` | Data (table/line/bar/pie/process/map as structured data) + model answer + band notes |
| `web/content/ielts/writing-task2/*.md` | Essay questions by type + model essay + band notes |
| `web/content/ielts/speaking/*.md` | Part 1 topics, Part 2 cue cards, Part 3 follow-ups |
| `web/content/ielts/strategy/*.md` | Per-question-type strategy cards |
| `web/scripts/compile-content.cjs` | Modify: compile `ielts/**` into `ielts-*.json` |
| `web/src/core/ielts-bands.ts` | Raw-score -> band tables (Listening/Reading), rubric band estimate helpers |
| `web/src/core/ielts-mock.ts` | Mock test state machine: sections, timers, answers, scoring |
| `web/src/modules/ielts-reading-dossier.ts`, `ielts-listening-dossier.ts`, `ielts-writing-dossier.ts`, `ielts-speaking-dossier.ts` | One view per skill (follow the shared dossier skeleton) |
| `web/src/modules/ielts-mock-view.ts` | Mock launcher + results + band report |
| `web/scripts/verify-ielts-*.cjs` | One verify script per task, registered in `run-verify.cjs` |
| `docs/audits/STATUS.md` | Append status |

Sequencing: Tasks 1-2 are foundations. Tasks 3-6 are the four skills and can run in parallel after Task 2. Task 7 (mock + band report) needs 3-6. Task 8 (vocab/strategy) is independent. Order by impact: Reading, Listening, Writing, Speaking.

---

### Task 1: IELTS data model, band tables, verify harness

**Files:**
- Create: `web/src/core/ielts-bands.ts`
- Create: `web/scripts/verify-ielts-bands.cjs`
- Modify: `web/scripts/run-verify.cjs` (register new script — look at how existing scripts are listed first)

**Interfaces:**
- Produces: `rawToBand(skill: 'listening' | 'reading', raw: number, of?: 40): number` (half-band steps, Academic Reading table); `averageBands(b: number[]): number` (IELTS rounding: mean rounded to nearest 0.5, .25 rounds up, .75 rounds up); type `IeltsQuestion = { id: string; type: 'tfng'|'ynng'|'heading'|'match'|'complete'|'mcq'|'short'|'map'; prompt: string; options?: string[]; answer: string | string[]; why: string }`.

- [ ] **Step 1: Write the failing check** `web/scripts/verify-ielts-bands.cjs` (match the style of `verify-cefr.cjs`; read it first). Assertions:

```js
const assert = require('assert');
const { rawToBand, averageBands } = require('./_load-ts')('../src/core/ielts-bands.ts'); // use whatever loader verify-cefr.cjs uses
assert.strictEqual(rawToBand('reading', 30), 7.0);
assert.strictEqual(rawToBand('reading', 23), 6.0);
assert.strictEqual(rawToBand('listening', 30), 7.0);
assert.strictEqual(rawToBand('listening', 23), 6.0);
assert.strictEqual(averageBands([7, 7, 6.5, 6.5]), 7.0);   // 6.75 -> 7.0
assert.strictEqual(averageBands([6.5, 6.5, 6, 6.5]), 6.5); // 6.375 -> 6.5
assert.strictEqual(averageBands([6, 6, 6, 6.5]), 6.0);     // 6.125 -> 6.0
console.log('ielts-bands ok');
```

- [ ] **Step 2: Run and confirm FAIL** — `node web/scripts/verify-ielts-bands.cjs` (module not found).
- [ ] **Step 3: Implement** `ielts-bands.ts` with lookup arrays. Official Academic Reading: 39-40=9, 37-38=8.5, 35-36=8, 33-34=7.5, 30-32=7, 27-29=6.5, 23-26=6, 19-22=5.5, 15-18=5. Listening: 39-40=9, 37-38=8.5, 35-36=8, 32-34=7.5, 30-31=7, 26-29=6.5, 23-25=6, 18-22=5.5, 16-17=5. `averageBands`: `Math.round(mean*2)/2` fails for .25 (JS rounds .5 up so 6.25*2=12.5 -> 13 -> 6.5 which is correct IELTS behaviour; confirm with the tests above).
- [ ] **Step 4: Run, expect PASS.** Then `node web/scripts/run-verify.cjs` stays green.
- [ ] **Step 5: Commit** — `git commit -m "feat(ielts): band tables and score averaging"`

---

### Task 2: Content pipeline for `ielts/**`

**Files:**
- Modify: `web/scripts/compile-content.cjs` (add reader for `web/content/ielts/<kind>/*.md`; follow how per-level drills files are merged — see commit "Compile script refactored to support multiple per-level drill files")
- Create: `web/content/ielts/reading/_template.md`, `web/content/ielts/listening/_template.md` (files starting with `_` are skipped by the compiler)
- Create: `web/scripts/verify-ielts-content.cjs`

**Interfaces:**
- Produces: `web/src/assets/data/ielts-reading.json` (`{ id, title, topic, words, passage: string, questions: IeltsQuestion[] }[]`), `ielts-listening.json` (`{ id, section: 1|2|3|4, title, speakers: string[], script: {speaker, text}[], questions: IeltsQuestion[] }[]`), `ielts-writing1.json`, `ielts-writing2.json`, `ielts-speaking.json`. Frontmatter fields as above, body markdown, questions in a fenced ```questions json block.
- Consumes: `IeltsQuestion` from Task 1.

- [ ] **Step 1: Write `verify-ielts-content.cjs`** asserting, per file in each ielts json: unique ids; every question has a non-empty `why`; tfng/ynng answers in `{TRUE,FALSE,NOT GIVEN}` / `{YES,NO,NOT GIVEN}`; reading passage word count within 800-1000; listening script word count >= 280 per section; every `answer` for `mcq/heading/match` is within `options`. With zero content files it must pass (empty arrays) so it can land before content.
- [ ] **Step 2:** run it, expect FAIL (jsons missing).
- [ ] **Step 3:** Implement compile step; run `npm run compile` (check the actual script name in `web/package.json`), expect empty arrays written.
- [ ] **Step 4:** Run verify, expect PASS; run full `run-verify.cjs`.
- [ ] **Step 5: Commit** — `feat(ielts): content pipeline and schema checks`

---

### Task 3: IELTS Reading (highest impact)

**Files:**
- Create: `web/content/ielts/reading/r01..r12-*.md` (12 passages = 4 full tests; band 6-8 difficulty ramp), `web/content/ielts/strategy/reading-*.md`
- Create: `web/src/modules/ielts-reading-dossier.ts`
- Modify: `web/src/core/router.ts` (new route), `web/src/modules/corner-compass.ts` (nav entry)
- Test: `web/scripts/verify-ielts-reading.cjs`

**Interfaces:**
- Consumes: `ielts-reading.json`, `rawToBand`.
- Produces: view with split layout (passage left, questions right; stacked at 390px), 20-minute per-passage timer (toggleable), auto-scoring per question with `why` explanation shown after submit, per-question-type accuracy saved via `storage.ts` under key `ielts.reading.history` as `{date, passageId, raw, of, byType: Record<string, {ok:number,n:number}>}[]`.

- [ ] **Step 1:** Extend `verify-ielts-reading.cjs`: >= 12 passages, each has 13-14 questions covering >= 3 distinct types across the set; across the set tfng and heading and complete each appear >= 4 times. Run, expect FAIL.
- [ ] **Step 2:** Author 12 passages (900 words, Academic topics: science, history, environment, psychology, technology, linguistics; mix of genres) with questions + keys + `why` (quote the evidence sentence). Passages must be original, not copied from Cambridge books.
- [ ] **Step 3:** Run verify, expect PASS. Human reviewer spot-checks answer keys (NOT GIVEN vs FALSE is the common model error). Record result in `docs/audits/ielts-reading-review.md`.
- [ ] **Step 4:** Implement dossier following the shared skeleton in `CLAUDE.md`; reuse card/chip styles from `reading-dossier.ts`.
- [ ] **Step 5:** Measure spacing at 1440 and 390 on this route, screenshot, look. Commit — `feat(ielts): academic reading practice with scored question types`

---

### Task 4: IELTS Listening

**Files:**
- Create: `web/content/ielts/listening/s1..s4-*.md` (start with 2 tests = 8 sections)
- Create: `web/src/modules/ielts-listening-dossier.ts`
- Test: `web/scripts/verify-ielts-listening.cjs`

**Interfaces:**
- Consumes: `ielts-listening.json`; `acoustic-engine.ts` TTS (`speechSynthesis`, line ~326) for playback.
- Produces: multi-speaker playback (assign distinct `SpeechSynthesisVoice` per speaker; prefer en-GB/en-AU/en-US voices to mimic accents), play-once mode (exam condition) and replay mode (study), 10 questions per section, auto-scoring + `why`.

- [ ] **Step 1:** Verify script: per section script >= 280 words (sec 1-2 dialogue/monologue), sec 4 is single-speaker lecture >= 400 words, 10 questions, types appear: complete (note/form), mcq, match/map.
- [ ] **Step 2:** Author scripts. Section 1: everyday transaction with spelled names/numbers; 2: monologue about a facility; 3: 2-4 speaker academic discussion; 4: lecture. Include paraphrase and distractor self-corrections ("Tuesday, no sorry, Thursday").
- [ ] **Step 3:** Run verify PASS; human check keys.
- [ ] **Step 4:** Implement dossier; document limitation clearly in UI help text: TTS voices are not real exam audio. **Decision for owner:** record real human audio files into `web/public/audio/ielts/` (best) vs TTS only (cheap, weaker). Plan assumes TTS until decided.
- [ ] **Step 5:** Layout check + screenshots. Commit — `feat(ielts): sectioned listening with multi-voice playback and scoring`

---

### Task 5: IELTS Writing Task 1 and Task 2 with band rubric

**Files:**
- Create: `web/content/ielts/writing-task1/*.md` (>= 16: 4 line, 4 bar, 3 table, 2 pie, 2 process, 1 map; data as JSON in frontmatter), `web/content/ielts/writing-task2/*.md` (>= 20 across opinion, discuss-both, advantages/disadvantages, problem-solution, two-part)
- Create: `web/src/modules/ielts-writing-dossier.ts`
- Test: `web/scripts/verify-ielts-writing.cjs`

**Interfaces:**
- Produces: editor with live word count + 20/40-minute timer, minimum-word warnings (150/250), self-assessment checklist per criterion (TR/TA, CC, LR, GRA) with band-descriptor text for 5/6/7 that outputs an estimated band (average of four self-ratings, flagged as self-estimate), and model answer reveal after submit. Task 1 renders data as inline SVG (no chart lib).
- Reuse: existing diff view from `writing-dossier.ts` for comparing against the band-7 model; reuse `timer` code in `speaking-dossier.ts`.

- [ ] **Step 1:** Verify: Task 1 data shapes valid (series length = labels length; pie sums to 100 +/- 1), each Task 1 has model answer 150-190 words including an overview sentence (assert contains `overall` or `in general`); each Task 2 has model essay 260-320 words and 4-5 paragraphs.
- [ ] **Step 2:** Author content + band-5/6/7 annotation for 6 sample answers (shows what separates 6 from 7).
- [ ] **Step 3:** Verify PASS.
- [ ] **Step 4:** Implement view. Keep estimate labelled "self-estimate"; do not claim automatic scoring.
- [ ] **Step 5:** Layout check. Commit — `feat(ielts): task 1 and task 2 writing with band checklist`

---

### Task 6: IELTS Speaking Parts 1-3

**Files:**
- Create: `web/content/ielts/speaking/part1-*.md` (12 topics x 6 Qs), `part2-*.md` (30 cue cards, each with 4 bullet prompts), `part3-*.md` (follow-up set per cue card, 4-5 Qs)
- Create: `web/src/modules/ielts-speaking-dossier.ts`
- Test: `web/scripts/verify-ielts-speaking.cjs`

**Interfaces:**
- Consumes: `acoustic-engine.ts` (record, fluency metrics), existing speaking timer.
- Produces: flow Part 1 (answer each Q, 20-30s target) -> Part 2 (60s prep countdown, 2:00 talk, cut-off at 2:00) -> Part 3 (follow-ups); post-answer FC/LR/GRA/Pron self-checklist with band descriptors; use measured speech rate / pause stats from `acoustic-engine` as a fluency hint only.

- [ ] **Step 1:** Verify: every Part 2 card has 4 bullets, every card has a linked Part 3 set with >= 4 Qs; Part 1 topics >= 12.
- [ ] **Step 2:** Author. **Step 3:** PASS.
- [ ] **Step 4:** Implement flow + recording playback for self-review.
- [ ] **Step 5:** Layout check. Commit — `feat(ielts): speaking parts 1-3 with cue-card timer`

---

### Task 7: Full mock test + band report + tree integration

**Files:**
- Create: `web/src/core/ielts-mock.ts`, `web/src/modules/ielts-mock-view.ts`, `web/scripts/verify-ielts-mock.cjs`
- Modify: `web/src/core/skill-tree-data.ts` (add IELTS branch after C1 nodes; follow node format used for 8-tier tree), `web/src/modules/placement-quiz.ts` (optional "target: IELTS 7.0" goal flag stored in `storage.ts`)

**Interfaces:**
- Consumes: Tasks 1, 3-6.
- Produces: `startMock(kind: 'reading'|'listening'|'full'): MockSession`; `MockSession.submit(answers): { raw: number, band: number, byType: Record<string,{ok:number,n:number}> }`; report screen: per-skill band, overall via `averageBands`, gap-to-7.0 and weakest question types, recommended next drills. Readiness rule: "7.0-ready" only when last 2 mocks each have Listening >= 7, Reading >= 7, and writing/speaking self-estimates >= 6.5 (self-estimates cannot alone certify).

- [ ] **Step 1:** Verify: scoring a known answer set returns expected raw and band; timer expiry auto-submits; readiness rule truth table.
- [ ] **Step 2-4:** Fail, implement, pass.
- [ ] **Step 5:** Layout check on all routes at 1440 and 390 (new routes included), screenshot. Commit — `feat(ielts): timed mocks, band report and readiness gate`

---

### Task 8: Vocabulary topics + strategy cards (independent)

**Files:**
- Create: `web/content/vocabulary/ielts-topics-*.md` (>= 15 topics x 30 items: environment, education, technology, health, work, crime, media, transport, urban life, globalisation, arts, science, family, food, travel), `web/content/ielts/strategy/*.md` (one card per question type + Task 1 overview + Task 2 position + Part 2 structure)
- Test: extend `verify-content-pipeline.cjs` count guards (bump exact totals, as in the prior learning-audit pass)

**Interfaces:** vocabulary items use the existing schema (`wordOrChunk, breakdown, ipa, definition, vietnamese, contextSentence, cefrLevel`) so SRS works unchanged. Prioritise B2-C1 topic lexis and paraphrase pairs (synonym sets) which T/F/NG and Listening depend on.

- [ ] Steps: author, compile, bump guards, run `run-verify.cjs`, commit — `feat(ielts): topic vocabulary and strategy cards`

---

## Self-Review

- Spec coverage: all four skills (Tasks 3-6), measurement/band (1, 7), strategy and topic vocab (8), pipeline (2). Gap table rows each map to a task.
- Placeholders: authoring steps (Task 3-6 step 2) are content-writing, not code; counts and schema are exact. Verify scripts for Tasks 3-6 name their assertions but their code will follow the Task 1 pattern — implementer must read `verify-cefr.cjs` first.
- Type consistency: `IeltsQuestion`, `rawToBand`, `averageBands`, `startMock`, `MockSession` names match across tasks.

## Open decisions for owner

1. Listening audio: TTS only vs recorded human audio (decides how real Listening 7.0 practice can be).
2. Academic vs General Training: plan assumes Academic. GT changes Reading texts and Task 1 (letters).
3. Human reviewer for answer keys (model-written NOT GIVEN/FALSE keys have a known error rate).
4. Writing/Speaking scoring is self-assessment only. Automatic essay scoring would need an LLM API (new dependency, cost, privacy); out of plan unless requested.
