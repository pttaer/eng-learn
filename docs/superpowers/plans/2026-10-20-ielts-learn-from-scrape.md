# IELTS Learn-From-Scrape Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the 66 scraped mock tests in `data/scraped-ielts` to learn the real IELTS test structure, then author original Academic content in the app's existing schema, verified and merged through the existing pipeline. Phase 1 adds one original set each for listening, writing and speaking. Reading joins once decision D1 is made.

**Architecture:** A read-only blueprint of the scrape (counts, structure, instruction patterns, chart kinds), never its text. Original items go into `web/src/ielts/data/parts/<kind>-N.json`, merged by `scripts/merge-ielts.cjs`, and gated by the existing `verify-ielts-*.cjs` scripts plus one new provenance gate that fails on any 12-word run shared with the scraped corpus.

**Tech Stack:** Node (CJS scripts), TypeScript app, JSON content. No new dependencies.

**Spec:** No separate spec exists. Governing rules: `E:/Eng/CLAUDE.md` (IELTS app rules) and `docs/superpowers/plans/2026-10-06-ielts-7-readiness.md`. The ielts-coach rule applies too: original practice material only, never copyrighted test content.

## Why not replace the app content with the scrape

- **Listening cannot be imported.** The 66 listening sets (about 2636 questions) carry no full audio scripts. Their explanations quote fragments only, and the sets link 70 YouTube videos. `ListeningSection` requires `script` and `speakers[].lang`, and CLAUDE.md allows browser text-to-speech only.
- **Answer keys cannot be trusted as they are.** 913 of 5269 questions have no `why`. Of the 4356 that do, 2285 carry the source site's UI text mixed into the explanation ("Nghe từ đây Locate Giải thích Report"). CLAUDE.md requires Claude to verify every key, and `verify-ielts-content.cjs` requires a `why` of at least 6 words.
- **The scraped type labels are not a blueprint.** All 1796 `multiple_choice` items have no `options`. The reading items sampled are matching questions whose shared option list was dropped. The 4 labels (`gap_fill`, `multiple_choice`, `tfng`, `ynng`) cannot be mapped 1:1 to the app's 11 question types.
- **Writing Task 1 charts are images.** The scrape stores `image_url`. The app's `Task1Chart` needs structured data (kind, labels, series), so charts must be redrawn with original numbers.
- **Source.** The scrape is third-party IELTS-style test material, and the ielts-coach rule rules out reproducing it. Correction to an earlier claim: a grep for "copyright" in the scrape matched only passage wording ("in terms of"). No copyright notice was found. The objection rests on the source, not on a notice.
- **No existing gate catches this.** `verify-learning-materials-safety.cjs` checks profanity, mojibake and table parity in `src/assets/data`. It does not cover `src/ielts/data` and checks no provenance. Task 2 adds the missing gate.
- **Offer, not a blocker.** If you hold rights to this material, say so. A verbatim import would need its own plan, and the provenance gate would need to be relaxed by you, not by this plan.

## Global Constraints

- Original content only. Every prompt, passage, script, chart value and model answer is written for this app. Nothing is copied or near-copied from `data/scraped-ielts`. Task 2's gate enforces this.
- Academic only (CLAUDE.md).
- Listening: browser text-to-speech only. Each section has `speakers` (`name`, `lang` one of `en-GB|en-US|en-AU`, `gender` `f|m`) and `script`. No audio files, no embedded media.
- Listening shape, from `verify-ielts-content.cjs` (lines 57–62): exactly 10 questions per section; at least 280 words for sections 1 to 3 and 400 for section 4; section 4 has one speaker; sections 1 and 3 have two or more.
- Listening test keys: section ids are `l<N>-s<k>`. `mock.ts` groups listening sections by the first id segment and keeps only groups of four. A new listening test therefore needs its own key. Phase 1 uses `l7`.
- Every answer key is verified by Claude against its own passage or script. Each `why` quotes the evidence (at least 6 words).
- Data enters only through `src/ielts/data/parts/<kind>-N.json`, then `node scripts/merge-ielts.cjs`. Never hand-edit the merged `src/ielts/data/*.json` files; the merge overwrites them. The merged files are committed, so regenerate and commit them with their parts.
- Scoring stays local. No new dependency. No LLM calls in the app runtime. (Claude authors content in this session; the app ships no model calls.)
- `data/scraped-ielts/` stays out of git and out of `src/`.
- Commits stage explicit paths only. No `git add -A`. Commit messages follow the repo's `feat(ielts):`, `chore(ielts):` and `docs(ielts):` style.
- No new tests written as the verify step. Verification uses the existing `verify-ielts-*.cjs` scripts, the provenance gate in Task 2, and `npm test`. Each task ends by stating its success criteria for the user to confirm.
- No UI or CSS changes in this plan. If D1 needs one, CLAUDE.md's layout rules apply and it gets its own step.

## Open Decision D1: where the original reading test goes

This blocks Task 4. Every other task proceeds without it.

The reading bank is closed at ten tests. `verify-ielts-reading.cjs` hard-codes 30 passages (line 16) and loops over ten tests (line 62). Test averages rise from 6.17 (test 1) to 8.33 (test 10), and the verifier caps bands at 8.5 (line 23). A new test on the ladder must average between 8.33 and 8.5.

- **D1-A: Test 11 on the ladder.** Append three passages to the bank and change `PASSAGES` in `verify-ielts-reading.cjs` from 30 to 33. The mock's `readingSet` reads by modulo, so passages 30–32 come through without other changes. Check whether the mock menu offers an eleventh test. Cost: the content must sit at bands 8 to 8.5, and the ladder gets no headroom.
- **D1-B: Separate original reading set (recommended).** Keep the ten-test ladder as it is. Author passages into `parts/originals-reading-N.json`, merge them to `originals-reading.json` with one new line in `merge-ielts.cjs`, and check them against their own rules in `verify-ielts-reading.cjs`. Cost: one new entry in the mock menu in `mock.ts`, a UI change, so CLAUDE.md's layout checks apply.
- **D1-C: Skip reading in Phase 1.** Ship listening, writing and speaking first and decide reading later.

Recommendation: D1-B. D1-A leaves no band headroom and changes what the ladder means. D1-C is the cheapest first step if you only want the other three skills now.

## Branch and Workspace

The current tree is `cleanup/ielts-focus` with uncommitted tier-1 deletions. Do not touch it. Work in a worktree based on `develop`, which contains the same 46 IELTS part files. `worktrees/` is already in `.gitignore`. The scrape lives only in the main checkout, so every script that reads it takes `IELTS_SCRAPE_DIR=E:/Eng/data/scraped-ielts`.

---

### Task 0: Workspace, baseline and ignore rule

**Files:**
- Modify: `.gitignore` (worktree root)
- Create: `docs/superpowers/plans/2026-10-20-ielts-learn-from-scrape.md` (worktree copy of this plan)

**Interfaces:**
- Consumes: nothing
- Produces: a worktree on `feat/ielts-learn-from-scrape`, a recorded baseline of `npm test`, and the scrape ignored by git

- [ ] **Step 1: Create the worktree and install**

```bash
cd "E:/Eng"
git worktree add worktrees/ielts-learn -b feat/ielts-learn-from-scrape develop
cd worktrees/ielts-learn/web && npm ci
```

Check: `git -C worktrees/ielts-learn branch --show-current` prints `feat/ielts-learn-from-scrape`.

- [ ] **Step 2: Record the baseline**

From `worktrees/ielts-learn/web`, run `npm test` and save the full output to `C:\Users\Dell\AppData\Local\Temp\claude\E--Eng\05701847-b8d2-4afc-82b3-54c81b831e9f\scratchpad\baseline-test.txt`.

Record which verifiers already fail on `develop`. Do not fix them in this plan. Every later `npm test` is compared with this baseline, so new failures stand out.

- [ ] **Step 3: Ignore the scrape**

Add this line to the worktree's `.gitignore`:

```
data/scraped-ielts/
```

Check: `git -C worktrees/ielts-learn check-ignore -v data/scraped-ielts/catalog.json` names `.gitignore` and the pattern. The path need not exist in the worktree; the check matches patterns only.

```bash
git -C worktrees/ielts-learn add .gitignore
git -C worktrees/ielts-learn commit -m "chore(ielts): ignore scraped third-party corpus"
```

- [ ] **Step 4: Put this plan under version control**

This plan is untracked in the main checkout, so the worktree does not have it. Copy it in and commit:

```bash
cp "E:/Eng/docs/superpowers/plans/2026-10-20-ielts-learn-from-scrape.md" worktrees/ielts-learn/docs/superpowers/plans/
git -C worktrees/ielts-learn add docs/superpowers/plans/2026-10-20-ielts-learn-from-scrape.md
git -C worktrees/ielts-learn commit -m "docs(ielts): plan learn-from-scrape content"
```

Success criteria: the worktree exists on the new branch; the baseline file is saved; the `.gitignore` rule matches; the plan is committed on the feature branch. The main checkout is unchanged.

---

### Task 1: Blueprint from the scrape (read-only)

**Files:**
- Create: `docs/ielts-blueprint-from-scrape.md` (worktree root)

**Interfaces:**
- Consumes: `E:/Eng/data/scraped-ielts/**` (read-only)
- Produces: the blueprint document. Tasks 3 and 5 follow it for structure, counts and wording patterns. It holds no item text.

- [ ] **Step 1: Re-run the counts**

From `worktrees/ielts-learn/web`:

```bash
IELTS_SCRAPE_DIR=E:/Eng/data/scraped-ielts node -e '
const fs=require("fs"),path=require("path");const root=process.env.IELTS_SCRAPE_DIR;
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const tally={};let noOptionMcq=0;
for(const f of walk(root).filter(f=>f.endsWith(".json")&&!f.endsWith("catalog.json"))){
  const d=JSON.parse(fs.readFileSync(f,"utf8"));const skill=path.basename(f,".json");
  for(const q of d.questions||[]){const k=skill+":"+q.type;tally[k]=(tally[k]||0)+1;
    if(q.type==="multiple_choice"&&!(q.options&&q.options.length))noOptionMcq++;}
}
console.log(tally,{noOptionMcq});'
```

Expected from the 2026-10-20 run: listening 2636 questions (gap_fill 1824, multiple_choice 812); reading 2633 (gap_fill 968, multiple_choice 984, tfng 536, ynng 145); `noOptionMcq` 1796.

- [ ] **Step 2: Write the blueprint**

Write `docs/ielts-blueprint-from-scrape.md` with these sections, each with counts and structure only:

1. **Volume:** 66 practice tests, four skills each. About 40 listening and 40 reading questions per test.
2. **Listening:** section count and layout per test; how form, table and map items are laid out; typical word limits.
3. **Reading:** passage count per test; passage length; the question-type mix. `multiple_choice` items are matching questions in the sample, so the mix is an estimate. Hand-classify a sample of 20 items by reading their prompts and `why`.
4. **Writing:** Task 1 chart kinds (line, bar, table, pie, process, map) with counts, found by reading each `writing.md` prompt. Task 2 essay types with counts.
5. **Speaking:** Part 1 topics and question counts; Part 2 cue-card layout (topic, four bullets); Part 3 question count per cue card.
6. **Instruction wording:** six to eight standard instruction templates, written in our own words (for example "Choose the correct letter, A, B, C or D.").

Rule: no item text in the blueprint. Quote at most five words from any source, and only to name a pattern.

- [ ] **Step 3: Check the numbers**

Re-run the snippet from Step 1. Every number in the blueprint must match its output.

Success criteria: the blueprint's counts match the rerun exactly; no sentence in it carries a run of more than five scraped words.

---

### Task 2: Provenance gate

**Files:**
- Create: `web/scripts/check-ielts-provenance.cjs`

**Interfaces:**
- Consumes: every `*.json` under `web/src/ielts/data/` (including `parts/`); the corpus under `IELTS_SCRAPE_DIR` (default `<repo>/data/scraped-ielts`)
- Produces: exit code 0 only when no app string shares a 12-word run with the corpus. A run found in more than 10 scraped files counts as standard instruction wording and is ignored. A missing corpus fails, so the gate never passes silently.

- [ ] **Step 1: Create the gate**

```js
// IELTS provenance gate: no app item may share a 12-word run with the scraped third-party corpus.
// Corpus: IELTS_SCRAPE_DIR, default <repo>/data/scraped-ielts. Fails if the corpus is missing.
const fs = require('fs');
const path = require('path');

const SCRAPE = process.env.IELTS_SCRAPE_DIR || path.join(__dirname, '..', '..', 'data', 'scraped-ielts');
const DATA = path.join(__dirname, '..', 'src', 'ielts', 'data');
const RUN = 12;
const BOILERPLATE_FILES = 10; // a run in more scraped files than this is standard IELTS instruction wording

const walk = (dir, ext) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name), ext) : e.name.endsWith(ext) ? [path.join(dir, e.name)] : []);
const strings = v => typeof v === 'string' ? [v]
  : Array.isArray(v) ? v.flatMap(strings)
  : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const runs = text => {
  const w = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + RUN <= w.length; i++) out.add(w.slice(i, i + RUN).join(' '));
  return out;
};
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));

if (!fs.existsSync(SCRAPE)) {
  console.error(`[provenance] FAIL: corpus not found at ${SCRAPE}`);
  process.exit(1);
}

const filesIn = new Map(); // run -> number of scraped files containing it
const corpus = walk(SCRAPE, '.json').filter(f => !f.endsWith('catalog.json'));
for (const f of corpus) {
  const seen = new Set(strings(load(f)).flatMap(s => [...runs(s)]));
  for (const r of seen) filesIn.set(r, (filesIn.get(r) || 0) + 1);
}

const hits = [];
for (const f of walk(DATA, '.json')) {
  const mine = new Set(strings(load(f)).flatMap(s => [...runs(s)]));
  for (const r of mine) {
    const n = filesIn.get(r) || 0;
    if (n > 0 && n <= BOILERPLATE_FILES) hits.push(`${path.relative(DATA, f)}: "${r}"`);
  }
}

if (hits.length) {
  console.error(`[provenance] FAIL: ${hits.length} shared ${RUN}-word runs, e.g.\n  ${hits.slice(0, 5).join('\n  ')}`);
  process.exit(1);
}
console.log(`[provenance] OK: no shared ${RUN}-word run with ${corpus.length} scraped files`);
```

Known limit: the gate catches verbatim and near-verbatim copying, not paraphrase. Paraphrase is the copying risk that remains, so review new content by reading it.

- [ ] **Step 2: Run it on the existing app data**

From `worktrees/ielts-learn/web`:

```bash
IELTS_SCRAPE_DIR=E:/Eng/data/scraped-ielts node scripts/check-ielts-provenance.cjs
```

Expected: `OK`. If it reports hits in the **existing** app data, stop and report the hits to the user before doing any other task. The current content may already derive from the scrape, and that changes the plan.

- [ ] **Step 3: Commit**

```bash
git add web/scripts/check-ielts-provenance.cjs
git commit -m "feat(ielts): add provenance gate against scraped corpus"
```

Success criteria: the gate prints `OK` on the current data; with a wrong `IELTS_SCRAPE_DIR` it fails with the missing-corpus message instead of passing silently.

---

### Task 3: Phase 1 listening, one original test (`l7`, four sections)

**Files:**
- Create: `web/src/ielts/data/parts/listening-7.json` (next free index; `listening-6.json` is the last on develop)
- Regenerate: `web/src/ielts/data/listening.json` (via merge)

**Interfaces:**
- Consumes: `ListeningSection` and `IeltsQuestion` in `web/src/ielts/types.ts` (lines 1–33); the listening layout in the blueprint (Task 1); the shape rules in Global Constraints
- Produces: an array of four `ListeningSection` objects. Ids are `l7-s1` to `l7-s4`; `section` values 1 to 4; exactly 10 questions each (40 total). Question types: `complete` (`answer` is an array of accepted spellings) and `mcq` (`options` as `"A. ..."` strings, `answer` the letter). Use `listening-1.json` as the reference for field order.

- [ ] **Step 1: Read the reference**

Read the first object in `web/src/ielts/data/parts/listening-1.json`. Copy its field order. Ids follow the `l<N>-s<k>` pattern, so the first section is `l7-s1`.

- [ ] **Step 2: Write section 1 (everyday social conversation, two speakers)**

Write a registration or booking conversation in the style of IELTS Listening Section 1. Write 10 `complete` items. Accepted answers include the spelled form wherever a speaker spells a word. Each `why` quotes the script line that gives the answer.

- [ ] **Step 3: Write section 2 (one-speaker monologue, notice or tour)**

One speaker, at least 280 words. Write 10 items mixing `complete` and `mcq`, with three options per `mcq` item to meet the verifier's minimum.

- [ ] **Step 4: Write section 3 (academic discussion, three speakers)**

Two students and a tutor, at least 280 words. Write 10 items with three or four options per `mcq`, plus `complete` items.

- [ ] **Step 5: Write section 4 (single-speaker lecture)**

One speaker, at least 400 words, with signposting. Write 10 `complete` items with word limits in the prompt.

- [ ] **Step 6: Verify keys by reading**

For every question, find the script line that gives the answer and check that the `why` quotes it. Fix any question whose answer is not clearly stated in the script.

- [ ] **Step 7: Merge and verify**

From `worktrees/ielts-learn/web`:

```bash
node scripts/merge-ielts.cjs
node scripts/verify-ielts-content.cjs
```

Expected: the merge prints `[IELTS] merged data files`; `verify-ielts-content.cjs` passes.

- [ ] **Step 8: Commit**

```bash
git add web/src/ielts/data/parts/listening-7.json web/src/ielts/data/listening.json
git commit -m "feat(ielts): add original listening test l7 (4 sections)"
```

Success criteria: four sections keyed `l7-s1` to `l7-s4`; 40 questions; no duplicate ids; every `why` cites its script line; the content verifier passes. The listening mock picks up the new test with no code change, because it groups by key.

---

### Task 4: Phase 1 reading (BLOCKED on D1)

Do not start until D1 is answered. The steps depend on the option chosen.

If **D1-B** is chosen, the work is: author three passages into `web/src/ielts/data/parts/originals-reading-1.json`; add `originals-reading` to the merge in `web/scripts/merge-ielts.cjs`; extend `verify-ielts-reading.cjs` to check `originals-reading.json` without the ladder; add one menu entry in `mock.ts`, then check it against the CLAUDE.md layout rules at 1440 and 390 widths. The exact verifier and menu edits are written after D1 is chosen, so they match the code as it is then.

If **D1-A** is chosen, the work is: append three passages to `reading-8.json` with bands 8 to 8.5 and a band average of at least 8.33; change `PASSAGES` in `verify-ielts-reading.cjs` from 30 to 33.

If **D1-C** is chosen, skip this task and note it in the hand-off.

Success criteria (either option): the reading verifier passes; every `why` cites a passage sentence; the answer keys are verified by reading the passage.

---

### Task 5: Phase 1 writing and speaking, one set

**Files:**
- Create: `web/src/ielts/data/parts/writing1-4.json`, `web/src/ielts/data/parts/writing2-5.json`, `web/src/ielts/data/parts/speaking-part1-3.json`, `web/src/ielts/data/parts/speaking-part2-5.json` (next free indices per develop)
- Regenerate: `web/src/ielts/data/writing1.json`, `writing2.json`, `speaking.json`

**Interfaces:**
- Consumes: `Task1Prompt`, `Task1Chart`, `Task2Prompt`, `SpeakingPart1`, `SpeakingPart2` in `web/src/ielts/types.ts` (lines 34–79). Copy the exact field shapes from the last item of `writing1-1.json`, `writing2-1.json`, `speaking-part1-1.json` and `speaking-part2-1.json`. Do not guess them.
- Produces:
  - one `Task1Prompt`: `id`, `prompt`, `chart` (original `kind`, `title`, `unit`, `labels`, `series` values), `model`, `notes`, `band6`, `criteria`;
  - one `Task2Prompt`: `id`, `essayType` (one of the five architectures), `prompt`, `model`, `notes`, `band6`, `criteria`;
  - one `SpeakingPart1` topic with six questions;
  - one `SpeakingPart2` item: `id`, `cue`, four `bullets`, and `part3` questions.

- [ ] **Step 1: Write the Task 1 chart**

Invent the chart data: labels, series and unit. Do not use any value or image from the scrape. Pick a `kind` the blueprint shows is common.

- [ ] **Step 2: Write the Task 1 model answer**

Write the overview and body from the chart values. Every figure, trend and comparison in the model must match the chart data. Check this by reading the chart against the model line by line.

- [ ] **Step 3: Write the Task 2 prompt and model**

Pick one essay architecture. Write the prompt, a band 7+ model answer and the `band6` version. Follow the paragraph guidance in `src/assets/data/ielts-course.json` and the topic-sentence guidance in `writing2-1.json`.

- [ ] **Step 4: Write speaking Part 1 and Part 2**

Part 1: one topic with six questions, in the shape of `speaking-part1-1.json`. Part 2: one cue card with four bullets and three or four Part 3 questions, in the shape of `speaking-part2-1.json`.

- [ ] **Step 5: Merge and verify**

From `worktrees/ielts-learn/web`:

```bash
node scripts/merge-ielts.cjs
node scripts/verify-ielts-writing.cjs
node scripts/verify-ielts-speaking.cjs
node scripts/verify-ielts-content.cjs
```

Expected: all four pass.

- [ ] **Step 6: Commit**

```bash
git add web/src/ielts/data/parts/writing1-4.json web/src/ielts/data/parts/writing2-5.json web/src/ielts/data/parts/speaking-part1-3.json web/src/ielts/data/parts/speaking-part2-5.json web/src/ielts/data/writing1.json web/src/ielts/data/writing2.json web/src/ielts/data/speaking.json
git commit -m "feat(ielts): add original writing and speaking set 1"
```

Success criteria: the chart and the model agree on every figure; all four verifiers pass; no value or image comes from the scrape (the provenance gate covers this).

---

### Task 6: Integration check and hand-off

**Files:**
- None changed. This task runs checks and reports.

- [ ] **Step 1: Run the provenance gate on all content**

```bash
IELTS_SCRAPE_DIR=E:/Eng/data/scraped-ielts node scripts/check-ielts-provenance.cjs
```

Expected: `OK`.

- [ ] **Step 2: Run the full suite and compare with the baseline**

From `worktrees/ielts-learn/web`: `npm test`. Compare with `baseline-test.txt` from Task 0. Any verifier that passed at baseline must still pass. Any verifier that failed at baseline stays on the list, unchanged. Do not fix unrelated failures.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: the build succeeds. Chunk size warnings are not failures.

- [ ] **Step 4: Check what the cockpit shows**

`src/modules/exam-cockpit-dossier.ts` imports neither the parts nor `reading.json`, so the new listening and writing sets may not reach the cockpit station. Confirm where it gets its content. Report the result. Wiring the cockpit to the parts is out of scope unless you ask for it.

- [ ] **Step 5: Report for the user to confirm**

Success criteria for the user to check on a running build (`ielts.html`):
- The `l7` listening test appears in the listening mock and plays through browser text-to-speech; questions score against the answer keys.
- The writing Task 1 chart renders from the new data; the Task 2 prompt and the speaking prompts display.
- Reading shows the new set only if D1 was answered.
- No scraped text, audio link or image appears anywhere in the app.

Do not write new tests for this check. The user confirms on the build.

---

## Out of Scope

- Reading placement until D1 is answered. A Phase 2 plan to scale the content, written after the user approves Phase 1.
- Importing scrape text, audio, images or links. Blocked by Global Constraints.
- General Training material. The app is Academic only.
- Vocabulary and collocations from the scrape. The app already has its own vocabulary data.
- Wiring the cockpit station to the parts data, until its source is confirmed in Task 6.
- UI and CSS changes, except the D1-B menu entry if that option is chosen.
- **Sort-order trap for Phase 2:** `merge-ielts.cjs` sorts file names as text, so `reading-10.json` sorts before `reading-2.json`. Phase 1's file names stay below ten. Make the sort numeric before any file numbered ten or higher is added.

## Decisions for the User

- **D1:** where the original reading test goes (A, B or C above). Recommended: B.
- Verbatim import, only if you hold rights to the material. This would be a separate plan, not an amendment to this one.
- The boilerplate threshold of 10 scraped files in Task 2. Raise it only if the gate blocks legitimate standard IELTS wording.
