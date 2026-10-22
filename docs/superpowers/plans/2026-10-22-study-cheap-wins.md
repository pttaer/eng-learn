# Study Cheap Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three small IELTS practice aids: Part 2 stamina rungs with phase cues, a 60-second timer on the Task 1 paraphrase step, and a practice-only 0.8x replay of the evidence line for missed listening questions.

**Architecture:** Each task edits one existing IELTS view and reuses helpers already in the code: `countdown`/`fmtTime` (`web/src/ielts/ui.ts`), `playSection` with its `rate` option (`web/src/ielts/tts.ts`), and `QuestionForm.reveal().wrong` (`web/src/ielts/questions.ts`, `web/src/ielts/scoring.ts`). No new modules, data changes, or dependencies.

**Tech Stack:** TypeScript, vanilla DOM via the `h()` helper, Vite, browser `speechSynthesis`.

**Spec:** None exists for this work. The requirements are rows 9, 14 and 15 of the 2026-10-22 audit of the "Smarter study" proposal, restated in each task below.

## Global Constraints

- Font sizes use semantic tokens only (`--font-h1` to `--font-h4`, `--font-kicker`, `--font-body`, `--font-prompt`). No arbitrary px sizes.
- Spacing follows the 4px/8px rhythm (`--gap-section`, `--gap-block`, `--gap-group`, `--gap-element`). No ad-hoc margins stacked on a parent `gap`.
- Mobile-first. Only breakpoint: `max-width: 768px` for mobile, `(width > 768px)` for desktop. Do not add 600/640/760/800/820/840/900 queries. 360px only for small-phone tweaks.
- Interactive buttons are at least 44px (`--touch-target-min`) on touch devices. Use `ie-btn` or `ie-btn-sm` (44px base).
- Smallest text is 11px (`--font-kicker`).
- After any layout change, measure sibling gaps and widths at 1440 and 390, then screenshot and look before calling it done.
- IELTS is a separate app (`web/ielts.html`, `web/src/ielts/`), Academic only. Listening uses browser TTS only. Scoring is local. No external API, no LLM calls, no new dependency.
- Do not change any answer key or `why` text.
- Surgical changes only: touch the lines this plan names, match existing style, no refactors.
- `speaking-simulator.ts`, `writing-studio.ts` and `listening.ts` already have uncommitted edits from earlier work. Edit on top of them. Do not revert, reformat or stage them.
- Do not commit unless the user asks.
- Verification: no new test files (CLAUDE.md section 4: the user tests manually). Each task uses a compile check, a browser check, and the layout measurement above. These replace the TDD steps in the writing-plans template.

## File Map

| File | Task | Change |
|---|---|---|
| `web/src/ielts/views/speaking-simulator.ts` | 1 | Part 2 lab: 20s and 60s rung buttons, phase prompts on the 2-minute timer |
| `web/src/ielts/views/writing-studio.ts` | 2 | Task 1 Step 1: 60-second paraphrase timer |
| `web/src/ielts/views/listening.ts` | 3 | Practice mode only: "Hear at 0.8x" on evidence lines of missed questions |

Paths are relative to the repo root `E:\Eng`.

---

## Task 1: Part 2 stamina rungs and phase prompts

**Files:**
- Modify: `web/src/ielts/views/speaking-simulator.ts:777-802` (speech section inside `renderPart2`, which starts at line 686)
- Test: none (see Global Constraints)

**Interfaces:**
- Consumes: `countdown(seconds: number, onTick: (left: number) => void, onEnd: () => void): Countdown` and `fmtTime(sec: number): string` from `web/src/ielts/ui.ts`. Both are already imported at `speaking-simulator.ts:15`, together with the `Countdown` type.
- Produces: nothing used outside this function. Local helper `startSpeech(seconds: number, cues: boolean): void` inside `renderPart2`.

- [ ] **Step 1: Record the baseline** (tsc baseline ran; before-screenshots not captured)

Run from `web/`:

```bash
npx tsc --noEmit
```

Note any errors already present. Start the dev server with `npm run dev` and open the IELTS app page (`ielts.html`) at the URL Vite prints. Open the Speaking view and choose the "Part 2: Cue Card Lab" tab (`speaking-simulator.ts:579`). In Chrome, resize to 1440x900 and then 390x844, screenshot the 2-minute speech row, and note the button heights.

- [x] **Step 2: Replace lines 777-802 with the block below**

Replace the existing block from `const speechTimerRow = h('div', 'ie-testbar');` through `speechSection.append(speechTimerRow);`. Leave lines 770-775 (the speech section heading) as they are.

```ts
    const speechTimerRow = h('div', 'ie-testbar');
    const speechClock = h('span', 'ie-clock', '02:00');
    const startTalkBtn = h('button', 'ie-btn ie-btn-primary', 'Start 2-Minute Speech Timer');
    const quickBtn = h('button', 'ie-btn', '20s answer');
    const elabBtn = h('button', 'ie-btn', '60s answer');
    const rungRow = h('div', 'ie-chips');
    rungRow.append(quickBtn, elabBtn);
    const phaseCue = h('p', 'ie-note', 'Phase prompts appear during the 2-minute timer.');
    const startButtons = [startTalkBtn, quickBtn, elabBtn];
    let speechCd: Countdown | null = null;

    // cues=true shows the prompt for the current stage of the 2-minute answer.
    const startSpeech = (seconds: number, cues: boolean): void => {
      if (speechCd) speechCd.stop();
      startButtons.forEach(b => { b.disabled = true; });
      if (!cues) phaseCue.textContent = 'Phase prompts appear during the 2-minute timer.';
      speechCd = countdown(seconds, left => {
        speechClock.textContent = fmtTime(left);
        if (cues) {
          const elapsed = seconds - left;
          phaseCue.textContent = elapsed < 30 ? 'Who and where' : elapsed < 75 ? 'What happened' : 'Why it mattered to you';
        }
      }, () => {
        speechClock.textContent = '00:00 (Finished)';
        startButtons.forEach(b => { b.disabled = false; });
      });
    };

    startTalkBtn.addEventListener('click', () => startSpeech(120, true));
    quickBtn.addEventListener('click', () => startSpeech(20, false));
    elabBtn.addEventListener('click', () => startSpeech(60, false));

    const resetTalkBtn = h('button', 'ie-btn', 'Reset');
    resetTalkBtn.addEventListener('click', () => {
      if (speechCd) speechCd.stop();
      speechClock.textContent = '02:00';
      phaseCue.textContent = 'Phase prompts appear during the 2-minute timer.';
      startButtons.forEach(b => { b.disabled = false; });
    });

    speechTimerRow.append(speechClock, startTalkBtn, resetTalkBtn);
    speechSection.append(speechTimerRow, rungRow, phaseCue);
```

Prompts map to the 2-minute timeline from the audit: 0-29s "Who and where", 30-74s "What happened", 75-120s "Why it mattered to you".

- [x] **Step 3: Compile**

```bash
npx tsc --noEmit
```

Expected: no new errors compared with Step 1.

- [x] **Step 4: Check the behaviour in the browser** (probe passed at both widths: prompts at 02:00, 01:31, 01:30 and 00:45; buttons disabled while running; the 20s run resets the stale prompt; Reset restores the idle state)

- Start the 2-minute timer. The prompt reads "Who and where" at 02:00, "What happened" at 01:30, and "Why it mattered to you" at 00:45.
- While a run is active, all three start buttons are disabled.
- The 20s run ends at 00:00 "(Finished)" and re-enables the buttons. Same for 60s.
- Reset stops a run, restores 02:00, restores the default prompt text, and re-enables the buttons.

- [x] **Step 5: Layout check at 1440 and 390**

Measured with probe v3 at both widths: no overflow in either row. At 390 the two rung buttons share one line, each 44px tall, with a 12px gap from the row above. At 1440, Reset sits on the same line as Start. Pre-existing and left alone: at 390, the clock, Start and Reset stack, because Start (250px) plus Reset (79px) is wider than the 282px row. HEAD has the same three items in the same row. See Decision 6.

Use the Chrome tools to run these in the page:

```js
({ overflow: document.documentElement.scrollWidth > window.innerWidth,
   buttons: [...document.querySelectorAll('.ie-testbar .ie-btn')].map(b => Math.round(b.getBoundingClientRect().height)) })
```

Success: `overflow` is false at 390. Every button is at least 44px tall at 390. If the row overflows, shorten the labels. Do not add px values in CSS. Check that gaps between the row and its siblings use the token scale. Screenshot both widths.

---

## Task 2: 60-second timer on the Task 1 paraphrase step

**Files:**
- Modify: `web/src/ielts/views/writing-studio.ts:1` (import line)
- Modify: `web/src/ielts/views/writing-studio.ts:928` (insert after the Step 1 header, before the textarea at line 929)
- Modify: `web/src/ielts/views/writing-studio.ts:1038` (insert after the focus-binding block, which ends at line 1038)
- Test: none

**Interfaces:**
- Consumes: `countdown` and `fmtTime` from `web/src/ielts/ui.ts`. Import them alongside `esc` and `h`.
- Produces: nothing used outside this function.

Scope: this applies to the Task 1 Step 1 introduction only (the sentence that names metric, categories and timeframe). The Task 2 introduction at around line 1153 is not changed. The two-paraphrase "roulette" variant is also not in scope.

- [ ] **Step 1: Record the baseline** (tsc baseline ran; before-screenshots not captured)

Run `npx tsc --noEmit` from `web/`. Open the writing studio on the Task 1 tab. At 1440 and 390, screenshot Step 1 and measure the gap between the step header and the textarea.

- [x] **Step 2: Change the import on line 1**

Replace:

```ts
import { esc, h } from '../ui';
```

with:

```ts
import { countdown, esc, fmtTime, h } from '../ui';
```

- [x] **Step 3: Insert the timer row after line 928**

Insert this between the closing `</div>` of `ie-step-head` (line 928) and the textarea (line 929), inside the Step 1 card template string:

```html
          <div class="ie-testbar ie-t1-intro-timer">
            <span class="ie-clock">01:00</span>
            <button type="button" class="ie-btn ie-btn-sm ie-t1-intro-start">Start 60-second paraphrase</button>
          </div>
```

- [x] **Step 4: Wire the button after line 1038**

Insert after the closing `});` of the focus-binding block (line 1038):

```ts
    const introClock = card.querySelector<HTMLElement>('.ie-t1-intro-timer .ie-clock')!;
    const introStart = card.querySelector<HTMLButtonElement>('.ie-t1-intro-start')!;
    introStart.addEventListener('click', () => {
      introStart.disabled = true;
      countdown(60, left => {
        introClock.textContent = fmtTime(left);
      }, () => {
        introClock.textContent = '00:00 (Time up)';
        introStart.disabled = false;
      });
    });
```

Known ceiling: there is no stop or reset. If the user leaves the tab during the minute, the interval finishes and updates a detached node. This is harmless. Do not add cleanup for it.

- [x] **Step 5: Compile**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [x] **Step 6: Check the behaviour in the browser** (probe: button disabled while running, clock runs 01:00 to 00:00 "Time up", button re-enables, textarea took typing. Task 2 introduction unchanged: no writing-studio hunk within 5 lines of the card at line 1169, and its text matches HEAD.)

Click "Start 60-second paraphrase". The clock counts 01:00 down to 00:00 "(Time up)". The button is disabled while running and re-enabled at the end. The textarea accepts typing during the countdown. The Task 2 introduction is unchanged.

- [x] **Step 7: Layout check at 1440 and 390** (probe: timer row 8px above and below; phone button 44px; no overflow; screenshots taken. The 14px textarea-to-feedback gap was already there before this change. The desktop timer row is 113px tall because the narrow step card wraps it. Left alone by decision.)

The timer row sits between the step header and the textarea. The gaps above and below it match the gaps between the other Step 1 siblings. The button is at least 44px tall at 390. No horizontal overflow (same probe as Task 1, Step 5, run on this view). Screenshot both widths.

---

## Task 3: Practice-only "Hear at 0.8x" for evidence lines of missed questions

**Files:**
- Modify: `web/src/ielts/views/listening.ts`. Add the helper immediately before the doc comment at line 23.
- Modify: `web/src/ielts/views/listening.ts:64` (add a `replay` variable after `let cur = 0;`).
- Modify: `web/src/ielts/views/listening.ts:113-124` (the `forms.forEach` in the submit handler). Insert after the `const tr = ...` line (122), before `panes[i].append(tr);` (123).
- Modify: `web/src/ielts/views/listening.ts:136-139` (the returned cleanup).
- Test: none

**Interfaces:**
- Consumes: `playSection(sec: ListeningSection, opts: PlaySectionOptions): Playback` and `ttsAvailable()` from `web/src/ielts/tts.ts:101,83`. Both are already imported. `AccentCadenceType`, `esc` and `h` are already imported. `QuestionForm.reveal(): SetScore` returns `wrong: string[]` of question IDs (`web/src/ielts/questions.ts:58`, `web/src/ielts/scoring.ts:16,28`).
- Produces: `export function evidenceLineIndexes(sec: ListeningSection, questionIds: Set<string>): Set<number>`. Returns the script line indexes quoted in the `why` text of the given questions.

Why this design: 279 of 280 listening questions quote text that appears in the script. That measures presence, not accuracy. An earlier matcher marked unrelated lines, so the shipped matcher was checked by hand on the 9 multi-line questions. Only missed questions get buttons, which limits the buttons to the lines a learner needs. Exam mode gets no buttons, so the mock stays as the exam simulation.

- [ ] **Step 1: Record the baseline** (tsc baseline ran; before-screenshots not captured)

Run `npx tsc --noEmit` from `web/`. Open Listening, Practice mode (not the mock), pick a section, answer at least one question wrong, and submit. Screenshot the open transcript at 1440 and 390.

- [x] **Step 2: Add the helper above line 23**

Insert immediately before the doc comment on line 23:

```ts
// Quotes in a `why` are matched to script lines after case and punctuation are stripped.
const normText = (t: string): string => t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Script line indexes quoted in the `why` of the given questions. */
export function evidenceLineIndexes(sec: ListeningSection, questionIds: Set<string>): Set<number> {
  const out = new Set<number>();
  for (const q of sec.questions) {
    if (!questionIds.has(q.id)) continue;
    // A quote opens after a space, bracket or start and closes before space or punctuation, so "there's" does not split it.
    // Ellipses split one quote into separate segments, since a single script line rarely holds the whole span.
    const quotes = [...(q.why || '').matchAll(/(?:^|[\s(\u201C\u2018"])["\u201C\u2018']([^"\u201C\u201D\u2018\u2019]{4,}?)["\u201D\u2019'](?=[\s.,;:!?)]|$)/g)]
      .flatMap(m => (m[1] ?? '').split(/\.{3}|\u2026/))
      .map(normText)
      .filter(qq => qq.length > 0);
    sec.script.forEach((line, i) => {
      const t = ' ' + normText(line.text) + ' ';
      if (quotes.some(qq => t.includes(' ' + qq + ' '))) out.add(i);
    });
  }
  return out;
}
```

Matching rules: quotes open after a space, bracket or start, and close before space or punctuation, so apostrophes inside words do not split them. Ellipses split a quote into segments. Each segment must match as whole words in the script line. Measured on all 280 questions: 279 get marks (l7-s4-q09 has no quoted text), at most 3 lines per question, and 9 questions mark more than one line. Each of those 9 was checked by reading the full line.

- [x] **Step 3: Declare the replay handle**

After `let cur = 0;` (line 64), add:

```ts
  let replay: Playback | null = null;
```

- [x] **Step 4: Insert the buttons in the submit handler**

Insert after line 122 (`const tr = ...`), before `panes[i].append(tr);`:

```ts
      if (!exam && ttsAvailable()) {
        const marked = evidenceLineIndexes(sections[i], new Set(s.wrong));
        tr.querySelectorAll('p').forEach((p, j) => {
          if (!marked.has(j)) return;
          const replayBtn = h('button', 'ie-btn ie-btn-sm', 'Hear at 0.8x');
          replayBtn.addEventListener('click', () => {
            replay?.stop();
            replay = playSection({ ...sections[i], script: [sections[i].script[j]] }, { rate: 0.8, accent: accentSelect.value as AccentCadenceType });
          });
          p.append(replayBtn);
        });
      }
```

`s` is the `const s = f.reveal()` already on line 114. The transcript paragraphs are in script order, so `j` matches the script index. The `<summary>` is not a `<p>`.

- [x] **Step 5: Stop replay when the view unmounts**

Change the cleanup at lines 136-139 to:

```ts
  return () => {
    playback?.stop();
    replay?.stop();
    setExamRoomAmbience(false);
  };
```

- [x] **Step 6: Compile**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [x] **Step 7: Check the behaviour in the browser** (probe v3, both widths: 11 buttons, equal to the expected 11, on section 1; main Play records one utterance; first replay adds 1 cancel call; second click on another line adds 2 (stop plus new playSection); the replay uses the same voice as Play for the same speaker (Microsoft Zira, both); leaving the view adds cancel calls, so playback stops; exam mock has zero buttons.)

- Practice mode, after Submit: lines quoted by a missed question show "Hear at 0.8x". Lines quoted only by correct answers show nothing.
- Clicking it plays only that one line, slower, in the same speaker's voice. The one-line section reuses the speaker-to-voice map.
- Clicking another line stops the first one.
- Exam mode (the mock): no buttons appear.
- Leaving the view stops playback.
- `web/src/ielts/data/listening.json` is unchanged. Check with `git diff --stat -- web/src/ielts/data/listening.json`. It is expected to be empty for this task.

- [x] **Step 8: Layout check at 1440 and 390** (probe: no overflow; phone buttons 44px; inline at 1440; wraps inside the paragraph at 390; screenshots taken)

The button sits inline with its transcript line at 1440. At 390 it wraps within the paragraph, with no horizontal overflow. It is at least 44px tall on touch. Screenshot a transcript with a marked line at both widths.

---

## Final checks

- [x] Run `npx tsc --noEmit` from `web/` once after all three tasks.
- [x] Run `node scripts/run-verify.cjs` from `web/` before Task 1 and after Task 3. Record the pass counts. The count must not drop. Result: 82/82 before and after the fixes.
- [x] Run `git diff --stat` from `E:\Eng`. The changes should be limited to the three view files plus the three files that were already modified. The data folder should show no new changes from this plan.
- [x] Report to the user. Do not commit unless they ask.

## Decisions to confirm before executing

1. Scope: audit rows 9, 14 and 15 only. The MCQ shortest-option fix is not in this plan. The audit said to fix it first, so it needs its own plan.
2. The paraphrase timer covers Task 1 Step 1 only.
3. Listening replay covers missed questions only, in practice mode only.
4. Rung labels are "20s answer" and "60s answer". Revised from "20-second answer" and "60-second elaboration" so both rungs fit on one line at 390px. "Elaboration" is dropped, so the second rung now means a 60-second answer.
5. TDD steps are replaced by compile, browser and layout checks, because CLAUDE.md section 4 says the user tests manually.
6. Resolved. The rung buttons moved to their own row, using the existing `.ie-chips` flex-wrap row, so no new CSS. Desktop Reset now shares a line with Start. The phone stack of clock, Start and Reset is pre-existing and left alone. Redesigning that row is a separate task if you want it.

## Self-review

- Spec coverage: rows 9, 14 and 15 each map to a task. Row 9 is split: the re-speak is implemented, and the 3-second audio slice is out of scope because TTS has no audio clip to slice.
- Placeholder scan: no TBD, TODO or "similar to" references. Every code step has its code.
- Name consistency: `startSpeech` (Task 1), `introStart` and `introClock` (Task 2), `evidenceLineIndexes`, `normText` and `replay` (Task 3) each appear with the same spelling everywhere they are used.
