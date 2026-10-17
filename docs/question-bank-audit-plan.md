# Question bank audit: remaining work

This is a handoff plan for finishing the answer-quality audit. Work through the tasks in order. Every task ends with a check command; a task is done only when its check passes.

## The user's complaint (what "fixed" means)

1. **Translation and meaning questions:** the wrong options must be *related* to the right answer (same topic, same word class, a shared word or a nearby meaning). They must not come from a completely different category.
2. **Giveaways:** the answer must not be visible in the question. Examples: a stem that copies the passage sentence with one word blanked, a label that prints the target, or a correct option that is the only one echoing the passage wording.
3. **Second right answer:** no item may have two defensible options, including UK/US variants and synonyms.

## Ground rules

- **Edit sources, never compiled output.**
  - `web/content/**/*.md` compiles to `web/src/assets/data/*.json` through `node web/scripts/compile-content.cjs`.
  - `web/src/ielts/data/parts/*.json` merges to `web/src/ielts/data/*.json` through `node web/scripts/merge-ielts.cjs`.
- Keep each JSON file's existing indentation: `reading-1`, `reading-2` and `listening-1` use 2 spaces, `listening-2` uses 1 space. Every file ends with a newline.
- IELTS rules (from `E:\Eng\CLAUDE.md`):
  - Academic only.
  - Every key verified against the passage or script.
  - Every question has a `why` that quotes the evidence line.
  - No copyrighted Cambridge text.
- Don't touch `roster.json`. It was already modified before this work started.
- Don't commit unless the user asks.
- Don't change the logic files that are already fixed: `web/src/core/decoys.ts`, `web/src/core/placement.ts`, `web/src/modules/blitz-dossier.ts`, the `initQuestions` block in `web/src/modules/exam-cockpit-dossier.ts`, `web/src/core/serl-gauntlet-engine.ts`, and the gap-fill code in `web/src/modules/multi-skill-quiz-modal.ts`.

## Already done (don't redo)

- **Speed Blitz generator** (`blitz-dossier.ts`):
  - Decoys come from `core/decoys.ts`, ranked by shared words, category and level, plus Vietnamese meaning similarity.
  - Synonyms and same-meaning twins are rejected.
  - The verb blank only appears for verb-initial phrases. It shows the Vietnamese meaning, and a list of "also correct" verbs (`ALSO_CORRECT`) keeps those verbs from being used as decoys.
  - The definition match requires the same word class, and skips definitions that contain the word itself.
- **First-run placement quiz** (`core/placement.ts`):
  - Grammar questions now come from the curated grammar MCQs in `diagnostic-questions.json`. The old version used unrelated sentences as distractors.
  - Vocab and collocation questions use related decoys.
  - Cloze questions take decoys with the same part of speech from other passages, and skip any item whose target word can't be blanked.
  - Fake `"A1 option 1"` filler options are removed.
  - `scripts/verify-placement.cjs` fixtures were updated to match.
- **Exam Cockpit** (`exam-cockpit-dossier.ts`):
  - The 40 template questions with arbitrary keys were replaced with 40 real questions tied to the three passages.
  - The split is 5 TRUE, 4 FALSE and 4 NOT GIVEN; MCQ keys are A4, B3, C3 and D3.
  - Gap answers are copied exactly from the passage.
- **Multi-skill diagnostic modal:**
  - The listening gap-fill no longer prints `TARGET: <answer>`.
  - Wrong typed answers now score as wrong; before, they counted as correct.
  - A typed answer allows one attempt.
- **SERL "spot the flaw" drill:** shows the learner's version against the corrected version. The old generic decoys were fragments or were themselves wrong.
- **Content fixes:**
  - `diagnostic-questions.md`: 30 items.
  - `01-diagnostics-foundations.md`: 20 items, key positions rebalanced.
  - IELTS reading parts: keys, why-lines, MCQ letter balance and NOT GIVEN share.
  - IELTS listening parts: keys, giveaways, distractors and letter balance.
  - `listening-traps.ts` and `reading-drills.ts`.

## Task 1: Paraphrase 20 copied reading stems

Files: `web/src/ielts/data/parts/reading-1.json` and `reading-2.json`.

These prompts reuse the passage sentence nearly word for word:

`r01-q07 r02-q08 r03-q06 r03-q07 r03-q08 r03-q09 r04-q06 r04-q08 r05-q07 r05-q09 r05-q14 r06-q05 r06-q06 r08-q08 r09-q06 r09-q08 r11-q01 r11-q08 r11-q09 r12-q06`

For each item:

1. Rewrite only `prompt`, using different word order, synonyms and a different sentence structure.
2. Keep the `answer` identical; it must still be copied exactly from the passage.
3. Keep the gap grammatical and within any word limit stated in the prompt.
4. For `r06-q05` and `r11-q01` (TFNG), re-check the key after paraphrasing.
5. For `r05-q14`, paraphrase the stem only.
6. If `why` quoted the old prompt, update it; `why` must quote the passage.

Save the checker below to your scratchpad (not the repo) and run it from `E:\Eng\web`. **Done when** it prints `clean`.

```js
// copy-check.cjs
const fs = require('fs');
let bad = 0;
for (const f of ['reading-1', 'reading-2']) {
  const d = JSON.parse(fs.readFileSync(`src/ielts/data/parts/${f}.json`, 'utf8'));
  for (const s of d) {
    const src = s.paragraphs.map(p => p.text).join(' ').toLowerCase();
    const w = src.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/);
    const g = new Set();
    for (let i = 0; i + 6 <= w.length; i++) g.add(w.slice(i, i + 6).join(' '));
    for (const q of s.questions) {
      const pw = q.prompt.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
      let h = 0;
      for (let i = 0; i + 6 <= pw.length; i++) if (g.has(pw.slice(i, i + 6).join(' '))) h++;
      if (h >= 2) { bad++; console.log('copied stem:', q.id); }
      const ans = [].concat(q.answer);
      if (['complete', 'short'].includes(q.type) && !ans.some(a => src.includes(String(a).toLowerCase()))) {
        bad++; console.log('answer not in passage:', q.id, ans);
      }
    }
  }
}
console.log(bad ? `${bad} problems` : 'clean');
```

## Task 2: Review the vocabulary, collocation and reading content edits

A stopped agent left 12 changed files under `web/content/collocations`, `web/content/vocabulary`, `web/content/grammar` and `web/content/reading`, about 20 lines in total.

1. Run `git diff -- web/content/collocations web/content/vocabulary web/content/grammar web/content/reading`.
2. For every changed line, confirm the new Vietnamese gloss, definition or answer is correct for the sense used in its example sentence.
3. Revert any line that is not clearly better (`git checkout -p`).

Then run this scan after compiling (`node web/scripts/compile-content.cjs`). Save it to your scratchpad and run it from `E:\Eng\web`.

```js
// gloss-check.cjs
const D = n => require(require('path').resolve('src/assets/data', n));
const vocab = D('vocabulary.json'), colloc = D('collocations.json'), reading = D('reading.json').articles;
// a) definition contains the headword (giveaway in the Blitz definition match)
for (const v of vocab) {
  const def = (v.definition || '').toLowerCase();
  if (v.wordOrChunk.toLowerCase().split(/\s+/).some(t => t.length >= 4 && def.includes(t.slice(0, Math.max(4, t.length - 3)))))
    console.log('def leaks word:', v.id, v.wordOrChunk, '|', v.definition);
}
// b) same phrase twice with different glosses
const seen = {};
for (const c of colloc) {
  const k = c.phrase.toLowerCase();
  if (seen[k] && seen[k] !== c.vietnamese) console.log('dup phrase:', c.phrase, '|', seen[k], '|', c.vietnamese);
  seen[k] = c.vietnamese;
}
// c) mined target word missing from its context sentence (breaks the placement cloze)
for (const a of reading) for (const m of a.fourPassProtocol?.pass3SentenceMining || [])
  if (!new RegExp('\\b' + m.targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(m.contextSentence))
    console.log('cloze target missing:', a.id, m.targetWord, '|', m.contextSentence);
```

Handle each finding as follows:

- **a)** Rewrite the definition in the `.md` source without the headword or its stem. Known hits: `prospectus`, `gainsay`, `scrape through`.
- **b)** Keep one entry with the most accurate gloss.
- **c)** Fix the `contextSentence` (or `targetWord`) in the reading `.md` so the word appears as a whole word.

**Done when** the scan prints nothing, or only items you judged acceptable and listed in your report.

## Task 3: TRUE / FALSE / NOT GIVEN balance per passage

The goal: no passage has all its TFNG/YNNG keys the same, and every passage has at least one NOT GIVEN. Run from `E:\Eng\web`:

```js
const fs = require('fs');
for (const f of ['reading-1', 'reading-2']) for (const s of JSON.parse(fs.readFileSync(`src/ielts/data/parts/${f}.json`, 'utf8'))) {
  const k = s.questions.filter(q => ['tfng', 'ynng'].includes(q.type)).map(q => q.answer);
  if (new Set(k).size < 2 || !k.includes('NOT GIVEN')) console.log(s.id, k.join(','));
}
```

To fix a flagged passage, rewrite a statement into a genuine FALSE (contradicted by the text) or NOT GIVEN (the topic is mentioned but the specific claim is absent), and update `why`. The `type` must match the answers: `tfng` uses TRUE/FALSE/NOT GIVEN, and `ynng` uses YES/NO/NOT GIVEN for the writer's views only.

## Task 4: Rebuild and verify

Run from `E:\Eng\web`:

```sh
node scripts/compile-content.cjs
node scripts/merge-ielts.cjs
npx tsc --noEmit -p .
for f in verify-placement verify-blitz-mode verify-beautification-blitz verify-ielts-content verify-reading-drills \
         verify-listening-traps-lab verify-diagnostic-questions verify-diagnostic-view verify-ielts-course-pipeline \
         verify-cd-ielts verify-full-mock-sync verify-exam-cockpit verify-eng123-cockpit-sync verify-serl-gauntlet \
         verify-multi-skill-diagnostic verify-diagnostic-audio verify-listening-diagnostic verify-cat-adaptive \
         verify-compiler-diagnostic verify-writing-strategy; do
  node scripts/$f.cjs > /dev/null 2>&1 && echo "PASS $f" || echo "FAIL $f"
done
npm run build
```

Then run `git status` and check:

- Compiled JSON changed only where its source changed. `compiledAt` churn in `ielts-course.json` is expected.
- `roster.json` is untouched by you.

**If a verify script fails,** read the assertion before changing anything.

- Fix the content if the content is wrong.
- Only update a script when it asserts the old broken behaviour, for example fake template questions, and say so in the report.

**Done when** everything passes and the build succeeds.

## Task 5: Report to the user

Give one short line per area: what was wrong, what changed, how many items. Then list the spot-checks for the user to do in the app:

- **Speed Blitz:** play one 60-second round. Decoys should be related (same topic or word class), and no option should be a synonym of the answer.
- **First-run level test:** open it with `PlacementQuiz.open()` from the console, or clear storage. Grammar questions should look like real fill-in-the-blank sentences.
- **Multi-skill diagnostic, listening stage:** no `TARGET:` label, and a wrong typed answer counts as wrong.
- **Exam Cockpit:** questions match the passage on screen (Falkirk Wheel, Collecting, Language).
- **IELTS app Reading and Listening:** sample a few questions per passage.

## Out of scope (mention, don't fix)

- `web/src/assets/data/ielts.json` and `ielts-mock.json` are compiled but not imported anywhere, so they are dead output.
- In `core/multi-skill-placement.ts`, `synthesizeQuestion` and `createPlaceholderQuestion` still produce filler options, but no UI path uses them; the modal uses `diagnostic-questions.json` directly. The battery's `slice(0,4)` can also drop the correct option. Both only matter if that builder is ever wired to the UI.
