# Feedback Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Commit steps run only after the user says "commit". The worktree has many unrelated uncommitted changes: `git add` only the files listed in the task.

**Goal:** One feedback hub that turns answer, hint, milestone, and streak events into sound, motion, haptic, and text, shared by the English Singularity side and the IELTS side.

**Architecture:** Views emit typed events. A pure cue table maps each event to a cue. A hub fans each cue out to independent channels (sound, haptic, motion, text). Each channel wraps an existing engine (`AudioSynthesizer`, `HapticEngine`, `MotionEngine`) and owns no state. Exam-mode answers are dropped in the hub.

**Tech Stack:** TypeScript, Vite, animejs 3.2.2, existing `AudioSynthesizer` (Web Audio, procedural), `HapticEngine` (Vibration API). No new dependency.

**Spec:** `E:\Eng\docs\superpowers\specs\2026-10-20-feedback-layer-design.md`

## Global Constraints

- No new dependency. No audio files. Sounds stay procedural via `AudioSynthesizer`.
- No change to scoring, answer keys, or `why`/`rationale`/`explanation` text.
- No LLM calls. IELTS listening stays browser TTS only.
- Reduced motion honored: motion channel does nothing; sound, haptic, and text still fire.
- Exam-simulation views emit no events.
- Spacing scale 8 inside a group, 16 between groups (`E:\Eng\CLAUDE.md`).
- Verify with `npm run build` in `web/` (runs `tsc && vite build`). If it fails in a file outside this plan, stop and report it; do not fix unrelated errors.
- User checks behavior in the browser. Do not write self-made tests as the verify step.

---

### Task 1: Event types and cue table

**Files:**
- Create: `web/src/core/feedback/events.ts`
- Create: `web/src/core/feedback/cues.ts`

**Interfaces:**
- Consumes: `SoundEffectType` from `web/src/core/audio-synthesizer.ts`; `HapticPattern` from `web/src/core/haptic-engine.ts`.
- Produces: `FeedbackEvent` (union), `FeedbackCue` (interface), `MotionCue` (type), `cueFor(event: FeedbackEvent): FeedbackCue` (pure).

- [ ] **Step 1: Create the event types**

`web/src/core/feedback/events.ts`:

```ts
export type FeedbackEvent =
  | { type: 'answer'; result: 'correct' | 'wrong'; why: string; mode: 'practice' | 'exam' }
  | { type: 'hint'; text: string }
  | { type: 'milestone'; label: string }
  | { type: 'streak'; count: number };
```

- [ ] **Step 2: Create the cue table**

`web/src/core/feedback/cues.ts`:

```ts
import type { SoundEffectType } from '../audio-synthesizer';
import type { HapticPattern } from '../haptic-engine';
import type { FeedbackEvent } from './events';

export type MotionCue = 'pop' | 'riseIn';

export interface FeedbackCue {
  sound?: SoundEffectType;
  motion?: MotionCue;
  haptic?: HapticPattern;
  copy?: string;
}

// Emotion rules (spec: feedback-layer-design, "Emotion rules").
// Correct: bright, short, positive. Wrong: soft, no buzzer, no shake; copy names the rule, never the learner.
// Milestones and streaks stay rare.
function withWhy(prefix: string, why: string): string {
  return why ? `${prefix} ${why}` : prefix;
}

export function cueFor(event: FeedbackEvent): FeedbackCue {
  switch (event.type) {
    case 'answer':
      return event.result === 'correct'
        ? { sound: 'chime', motion: 'pop', haptic: 'success', copy: withWhy('Correct.', event.why) }
        : { sound: 'ping', haptic: 'warning', copy: withWhy('Not quite.', event.why) };
    case 'hint':
      return { sound: 'tick', haptic: 'selection', copy: event.text };
    case 'milestone':
      return { sound: 'stage-fanfare', motion: 'riseIn', haptic: 'success', copy: event.label };
    case 'streak':
      return { sound: 'streak-fire', haptic: 'medium', copy: `${event.count} in a row` };
  }
}
```

- [ ] **Step 3: Check it compiles**

Run (from `E:\Eng\web`): `npx tsc --noEmit`
Expected: no new errors in `src/core/feedback/`.

- [ ] **Step 4: Commit**

```bash
git add web/src/core/feedback/events.ts web/src/core/feedback/cues.ts
git commit -m "feat(feedback): add event types and cue table"
```

---

### Task 2: Channel interface and four channels

**Files:**
- Create: `web/src/core/feedback/channel.ts`
- Create: `web/src/core/feedback/channels/sound.ts`
- Create: `web/src/core/feedback/channels/haptic.ts`
- Create: `web/src/core/feedback/channels/motion.ts`
- Create: `web/src/core/feedback/channels/text.ts`

**Interfaces:**
- Consumes: `FeedbackEvent`, `FeedbackCue` (Task 1); `AudioSynthesizer.play(type: SoundEffectType)`; `HapticEngine.trigger(pattern: HapticPattern)`; `MotionEngine.pop(el)`, `MotionEngine.riseIn(targets)`.
- Produces: `FeedbackChannel` interface; `soundChannel`, `hapticChannel`, `motionChannel`, `textChannel` (each `FeedbackChannel`).

- [ ] **Step 1: Create the channel interface**

`web/src/core/feedback/channel.ts`:

```ts
import type { FeedbackCue } from './cues';
import type { FeedbackEvent } from './events';

export interface FeedbackChannel {
  readonly id: string;
  handle(event: FeedbackEvent, cue: FeedbackCue, anchor?: HTMLElement): void;
}
```

- [ ] **Step 2: Create the sound channel**

`web/src/core/feedback/channels/sound.ts`:

```ts
import { AudioSynthesizer } from '../../audio-synthesizer';
import type { FeedbackChannel } from '../channel';

export const soundChannel: FeedbackChannel = {
  id: 'sound',
  handle(_event, cue) {
    if (cue.sound) AudioSynthesizer.play(cue.sound);
  }
};
```

- [ ] **Step 3: Create the haptic channel**

`web/src/core/feedback/channels/haptic.ts`:

```ts
import { HapticEngine } from '../../haptic-engine';
import type { FeedbackChannel } from '../channel';

export const hapticChannel: FeedbackChannel = {
  id: 'haptic',
  handle(_event, cue) {
    if (cue.haptic) HapticEngine.trigger(cue.haptic);
  }
};
```

- [ ] **Step 4: Create the motion channel**

`web/src/core/feedback/channels/motion.ts`:

```ts
import { MotionEngine } from '../../motion-engine';
import type { FeedbackChannel } from '../channel';

export const motionChannel: FeedbackChannel = {
  id: 'motion',
  handle(_event, cue, anchor) {
    if (!anchor || !cue.motion) return;
    if (cue.motion === 'pop') {
      MotionEngine.pop(anchor);
    } else {
      MotionEngine.riseIn([anchor]);
    }
  }
};
```

- [ ] **Step 5: Create the text channel**

`web/src/core/feedback/channels/text.ts`:

```ts
import type { FeedbackChannel } from '../channel';

// Writes into [data-feedback-slot] inside the anchor. No slot = no-op, so views opt in by adding the slot.
export const textChannel: FeedbackChannel = {
  id: 'text',
  handle(_event, cue, anchor) {
    if (!cue.copy || !anchor) return;
    const slot = anchor.querySelector<HTMLElement>('[data-feedback-slot]');
    if (!slot) return;
    slot.textContent = cue.copy;
    slot.hidden = false;
  }
};
```

- [ ] **Step 6: Check it compiles**

Run (from `E:\Eng\web`): `npx tsc --noEmit`
Expected: no new errors in `src/core/feedback/`.

- [ ] **Step 7: Commit**

```bash
git add web/src/core/feedback/channel.ts web/src/core/feedback/channels/
git commit -m "feat(feedback): add channel interface and sound, haptic, motion, text channels"
```

---

### Task 3: Hub and shared singleton

**Files:**
- Create: `web/src/core/feedback/hub.ts`
- Create: `web/src/core/feedback/index.ts`

**Interfaces:**
- Consumes: `FeedbackEvent` (Task 1), `cueFor` (Task 1), `FeedbackChannel` (Task 2), the four channels (Task 2).
- Produces: `createFeedbackHub(channels: FeedbackChannel[]): FeedbackHub`; `FeedbackHub.emit(event: FeedbackEvent, anchor?: HTMLElement): void`; shared `feedback: FeedbackHub` singleton exported from `web/src/core/feedback/index.ts`.

- [ ] **Step 1: Create the hub**

`web/src/core/feedback/hub.ts`:

```ts
import type { FeedbackChannel } from './channel';
import { cueFor } from './cues';
import type { FeedbackEvent } from './events';

export interface FeedbackHub {
  emit(event: FeedbackEvent, anchor?: HTMLElement): void;
}

export function createFeedbackHub(channels: FeedbackChannel[]): FeedbackHub {
  return {
    emit(event, anchor) {
      if (event.type === 'answer' && event.mode === 'exam') return;
      const cue = cueFor(event);
      for (const channel of channels) {
        channel.handle(event, cue, anchor);
      }
    }
  };
}
```

- [ ] **Step 2: Create the index with the shared singleton**

`web/src/core/feedback/index.ts`:

```ts
import { createFeedbackHub } from './hub';
import { soundChannel } from './channels/sound';
import { hapticChannel } from './channels/haptic';
import { motionChannel } from './channels/motion';
import { textChannel } from './channels/text';

export const feedback = createFeedbackHub([soundChannel, hapticChannel, motionChannel, textChannel]);
export type { FeedbackEvent } from './events';
```

- [ ] **Step 3: Check it compiles**

Run (from `E:\Eng\web`): `npx tsc --noEmit`
Expected: no new errors in `src/core/feedback/`.

- [ ] **Step 4: Commit**

```bash
git add web/src/core/feedback/hub.ts web/src/core/feedback/index.ts
git commit -m "feat(feedback): add hub and shared singleton"
```

---

### Task 4: IELTS reading drills emit answer events

**Files:**
- Modify: `web/src/ielts/views/reading-drills.ts` (import near top; checkBtn handler at lines 698-705)

**Interfaces:**
- Consumes: `feedback` (Task 3); `ReadingDrillItem.rationale: string` (existing field).
- Produces: nothing new.

Note: `renderFeedback` keeps the full rationale banner. The text channel finds no `[data-feedback-slot]` here, so it does nothing. Sound, haptic, and pop on `feedbackBox` run.

- [ ] **Step 1: Add the import**

Add with the other imports at the top of `web/src/ielts/views/reading-drills.ts`:

```ts
import { feedback } from '../../core/feedback';
```

- [ ] **Step 2: Emit after the answer is checked**

Replace the checkBtn handler (currently lines 698-705):

```ts
    checkBtn.addEventListener('click', () => {
      const answer = userAnswers[drill.id];
      const isCorrect = evaluateAnswer(drill, answer);
      drillEvaluations[drill.id] = { attempted: true, correct: isCorrect };
      feedbackBox.hidden = false;
      renderFeedback(feedbackBox, drill, isCorrect);
      feedback.emit(
        { type: 'answer', result: isCorrect ? 'correct' : 'wrong', why: drill.rationale, mode: 'practice' },
        feedbackBox
      );
      updateHud();
    });
```

- [ ] **Step 3: Check it compiles**

Run (from `E:\Eng\web`): `npx tsc --noEmit`
Expected: no new errors in `reading-drills.ts`.

- [ ] **Step 4: Commit**

```bash
git add web/src/ielts/views/reading-drills.ts
git commit -m "feat(ielts): emit answer feedback events in reading drills"
```

---

### Task 5: IELTS diagnostic emits answer events

**Files:**
- Modify: `web/src/ielts/views/diagnostic.ts` (import near top; option click handler around lines 186-194)

**Interfaces:**
- Consumes: `feedback` (Task 3); `questions` array in scope in the same render function (it is used at line 127); item fields `id`, `correctIndex`, `explanation` (existing).
- Produces: nothing new.

- [ ] **Step 1: Add the import**

Add with the other imports at the top of `web/src/ielts/views/diagnostic.ts`:

```ts
import { feedback } from '../../core/feedback';
```

- [ ] **Step 2: Emit after re-render, anchored to the new card**

Current handler body:

```ts
          userAnswers[qId] = optIdx;
          render();
```

Replace with:

```ts
          userAnswers[qId] = optIdx;
          render();
          const answered = questions.find(item => item.id === qId);
          const card = document.getElementById(`q-${qId}`);
          if (answered && card) {
            feedback.emit(
              {
                type: 'answer',
                result: optIdx === answered.correctIndex ? 'correct' : 'wrong',
                why: answered.explanation,
                mode: 'practice'
              },
              card
            );
          }
```

Check: confirm `questions` is in scope at the handler. Confirm `answered.explanation` is a `string`. If it is optional, use `answered.explanation ?? ''`.

- [ ] **Step 3: Check it compiles**

Run (from `E:\Eng\web`): `npx tsc --noEmit`
Expected: no new errors in `diagnostic.ts`.

- [ ] **Step 4: Commit**

```bash
git add web/src/ielts/views/diagnostic.ts
git commit -m "feat(ielts): emit answer feedback events in diagnostic"
```

---

### Task 6: Multi-skill quiz emits answer and stage milestone

**Files:**
- Modify: `web/src/modules/multi-skill-quiz-modal.ts` (import near top; `handleAnswer` at lines 733-756)

**Interfaces:**
- Consumes: `feedback` (Task 3); `DiagnosticQuestionItem.answer` (number), `.explanation?: string` (existing).
- Produces: nothing new.

Phase 1 limit: no anchor is passed, so this modal gets sound and haptic only. Motion and text need markup anchors. That is a later change.

- [ ] **Step 1: Add the import**

Add with the other imports at the top of `web/src/modules/multi-skill-quiz-modal.ts`:

```ts
import { feedback } from '../core/feedback';
```

- [ ] **Step 2: Replace the sound calls with events**

Replace `handleAnswer` (lines 733-756) with:

```ts
  private handleAnswer(choiceIdx: number): void {
    AudioSynthesizer.stopSpeech();
    this.activeListeningComponent?.teardown();
    this.activeListeningComponent = null;

    const q = this.currentStageQuestions[this.stageQuestionIndex];
    const isCorrect = choiceIdx === q.answer;

    this.stageAskedCounts[this.currentStageIndex]++;
    if (isCorrect) {
      this.stageCorrectCounts[this.currentStageIndex]++;
    }
    feedback.emit({
      type: 'answer',
      result: isCorrect ? 'correct' : 'wrong',
      why: q.explanation ?? '',
      mode: 'practice'
    });

    this.stageQuestionIndex++;
    if (this.stageQuestionIndex >= this.currentStageQuestions.length) {
      // Stage finished
      feedback.emit({ type: 'milestone', label: 'Stage complete' });
      this.advanceStage();
    } else {
      this.renderQuestion();
    }
  }
```

`AudioSynthesizer` stays imported because `stopSpeech` and other calls still use it.

- [ ] **Step 3: Check it compiles**

Run (from `E:\Eng\web`): `npx tsc --noEmit`
Expected: no new errors in `multi-skill-quiz-modal.ts`.

- [ ] **Step 4: Commit**

```bash
git add web/src/modules/multi-skill-quiz-modal.ts
git commit -m "feat(feedback): emit answer and stage milestone events in multi-skill quiz"
```

---

### Task 7: Blitz emits answer and streak events

**Files:**
- Modify: `web/src/modules/blitz-dossier.ts` (import near top; `submitAnswer` at lines 522-565)

**Interfaces:**
- Consumes: `feedback` (Task 3); `BlitzPrompt.explanation: string` (line 108, existing); `this.currentPrompt` (already checked non-null at line 523).
- Produces: nothing new.

Blitz keeps its own timer ticks, the end-of-batch `tour-fanfare`, and the particle burst. It loses the direct `absorb`, `streak-fire`, and `alarm` calls.

- [ ] **Step 1: Add the import**

Add with the other imports at the top of `web/src/modules/blitz-dossier.ts`:

```ts
import { feedback } from '../core/feedback';
```

- [ ] **Step 2: Replace the answer branches**

In `submitAnswer`, after `const isCorrect = choiceIndex === this.currentPrompt.correctIndex;` add:

```ts
    const why = this.currentPrompt.explanation;
```

Then replace the `if (isCorrect) { ... } else { ... }` block (current lines 533-564) with:

```ts
    if (isCorrect) {
      this.correctCount += 1;
      this.streak += 1;
      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak;
      }

      const mult = this.getMultiplier();
      const points = 100 * mult;
      this.score += points;

      if (chosenBtn) {
        chosenBtn.classList.add('flash-correct');
      }

      // Streak milestones replace the plain correct cue so two sounds do not stack.
      if (this.streak === 5 || this.streak === 10 || this.streak === 15) {
        feedback.emit({ type: 'streak', count: this.streak }, chosenBtn ?? undefined);
        ParticleCanvas.burst(window.innerWidth / 2, window.innerHeight * 0.4, 25);
      } else {
        feedback.emit({ type: 'answer', result: 'correct', why, mode: 'practice' }, chosenBtn ?? undefined);
      }
    } else {
      this.streak = 0;
      if (chosenBtn) {
        chosenBtn.classList.add('flash-wrong');
      }
      if (otherBtn) {
        otherBtn.classList.add('flash-correct-hint');
      }
      feedback.emit({ type: 'answer', result: 'wrong', why, mode: 'practice' }, chosenBtn ?? undefined);
    }
```

- [ ] **Step 3: Check it compiles**

Run (from `E:\Eng\web`): `npx tsc --noEmit`
Expected: no new errors in `blitz-dossier.ts`. `AudioSynthesizer` is still used there (chime, tick, tour-fanfare), so the import stays.

- [ ] **Step 4: Commit**

```bash
git add web/src/modules/blitz-dossier.ts
git commit -m "feat(feedback): emit answer and streak events in blitz"
```

---

### Task 8: Motion helpers and skill-tree hover fix

**Files:**
- Modify: `web/src/core/motion-engine.ts` (add two methods before `trackAnimation`, currently line 225)
- Modify: `web/src/modules/skill-tree-view.ts` (constellation node loop, lines 594-629)

**Interfaces:**
- Consumes: `anime` (already imported in motion-engine.ts); `MotionEngine.isReducedMotion()`; `MotionEngine.trackAnimation` (private, same class).
- Produces: `MotionEngine.hoverScale(el: HTMLElement | SVGElement, on: boolean): void`; `MotionEngine.press(el: HTMLElement | SVGElement): void`.

- [ ] **Step 1: Add the two methods to MotionEngine**

Insert before `private static trackAnimation`:

```ts
  /**
   * Hover scale for one target. Cancels the running tween on the same element first,
   * so fast pointer sweeps do not stack tweens.
   */
  public static hoverScale(el: HTMLElement | SVGElement, on: boolean): void {
    if (this.isReducedMotion()) return;
    anime.remove(el);
    const anim = anime({
      targets: el,
      scale: on ? 1.3 : 1.0,
      duration: on ? 600 : 320,
      easing: on ? 'easeOutElastic(1, 0.6)' : 'easeOutQuart'
    });
    this.trackAnimation(anim);
  }

  /**
   * Press bounce on click. Cancels the running tween on the same element first.
   */
  public static press(el: HTMLElement | SVGElement): void {
    if (this.isReducedMotion()) return;
    anime.remove(el);
    const anim = anime({
      targets: el,
      scale: [0.92, 1.08, 1.0],
      duration: 350,
      easing: 'easeOutElastic(1, 0.5)'
    });
    this.trackAnimation(anim);
  }
```

- [ ] **Step 2: Route the skill-tree node handlers through the helpers**

Replace the constellation node loop (currently lines 594-629) with:

```ts
    // SVG Node clicks & hover animations
    this.container.querySelectorAll('.constellation-node').forEach(nodeEl => {
      const circleEl = nodeEl.querySelector('.node-circle');

      nodeEl.addEventListener('mouseenter', () => {
        if (circleEl) MotionEngine.hoverScale(circleEl as SVGElement, true);
      });

      nodeEl.addEventListener('mouseleave', () => {
        if (circleEl) MotionEngine.hoverScale(circleEl as SVGElement, false);
      });

      nodeEl.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        MotionEngine.press(nodeEl as HTMLElement);
        const nodeId = (nodeEl as HTMLElement).dataset.nodeId;
        if (nodeId) {
          this.openNodeModal(nodeId);
        }
      });
```

Check: the original `click` handler's closing `});` and the code after it (up to the next block) stay as they are. Only the listeners above change.

- [ ] **Step 3: Check it compiles**

Run (from `E:\Eng\web`): `npx tsc --noEmit`
Expected: no new errors in `motion-engine.ts` or `skill-tree-view.ts`. `MotionEngine` stays imported in `skill-tree-view.ts`. The `anime` calls in that file were only the three replaced here, so remove line 2 (`import anime from 'animejs';`) in `skill-tree-view.ts` as part of this task. Confirm with `git grep -n "anime" -- web/src/modules/skill-tree-view.ts` that only `MotionEngine` and `AudioSynthesizer` remain.

- [ ] **Step 4: Commit**

```bash
git add web/src/core/motion-engine.ts web/src/modules/skill-tree-view.ts
git commit -m "fix(motion): cancel prior tween on skill-tree node hover and press"
```

---

### Task 9: Exam-mode guard and build check

**Files:**
- Check only: `web/src/ielts/views/mock.ts`, `web/src/modules/exam-cockpit-dossier.ts`, `web/src/ielts/views/speaking-simulator.ts`

**Interfaces:**
- Consumes: all of the above.
- Produces: nothing.

- [ ] **Step 1: Confirm no exam view emits events**

Run (from `E:\Eng`): `git grep -n "feedback.emit" -- web/src/ielts/views/mock.ts web/src/modules/exam-cockpit-dossier.ts web/src/ielts/views/speaking-simulator.ts`
Expected: no output. If a match appears, remove that emit call, because exam-simulation views must emit nothing.

- [ ] **Step 2: Build**

Run (from `E:\Eng\web`): `npm run build`
Expected: exit 0. If it fails in a file outside this plan, stop and report the error.

- [ ] **Step 3: Hand off to the user for browser checks**

Give the user this list. Do not write tests:

1. IELTS reading drill, correct answer: chime plays, feedback box pops, rationale shows.
2. IELTS reading drill, wrong answer: ping plays, no buzzer, rationale shows. On Android, a haptic fires.
3. IELTS diagnostic: answering a question plays a sound and pops that card.
4. Mock and exam cockpit: zero sound and motion on answers.
5. Reduced motion on (`html[data-motion="reduce"]`): no pop. Sound still plays.
6. Mute on: all sound cues stop immediately.
7. Blitz: correct answers play the chime, streak 5/10/15 play streak-fire, wrong answers play ping.
8. Skill tree: fast mouse sweep over nodes does not jitter. Scale returns to 1.0 on leave.
9. Audition sound choices by ear. Swap ids only in `web/src/core/feedback/cues.ts`.

- [ ] **Step 4: Commit (only if the user asked; no code changed in this task unless Step 1 required a fix)**

---

## Self-Review

**Spec coverage:**
- Units (`events`, `cues`, `hub`, `index`, four channels): Tasks 1-3.
- Event contract: Task 1.
- Cue table: Task 1 (`cueFor`).
- Emotion rules: encoded in `cues.ts` comments (Task 1) and in the cue values.
- Modes (practice and exam): Task 3 hub guard; Task 9 check that exam views emit nothing.
- Device behavior: no CSS or layout change in phase 1, so the 1440/390 measurement is not triggered. The text slot is not added to any view, so the text channel is a no-op for now. Deferred.
- Reduced motion and mute: handled by the existing engines (Task 2 channels call them).
- Rollout 1 (core and mount): Tasks 1-3. The spec's "mount at boot" is met by the views importing the singleton. No entry-point edit is needed.
- Rollout 2 (IELTS practice answers): Tasks 4-5. `listening-traps.ts` is intentionally untouched.
- Rollout 3 (main-side answers): Tasks 6-7. `exam-cockpit-dossier.ts` untouched, per the exam rule.
- Rollout 4 (milestones and streaks): stage milestone (Task 6) and blitz streak (Task 7). Not covered: the `header-hud.ts` level-up trigger (around line 891). It is progression, not an answer, so it is deferred to sub-project B. Spec rollout 4 is partly deferred for this reason.
- Rollout 5 (motion fix): Task 8.
- Success criteria: Task 9 step 3.

**Placeholder scan:** No TBD or TODO. Code steps contain code. Two steps say "confirm" (Task 5 scope and `explanation` type); each names the exact check.

**Type consistency:**
- `FeedbackEvent` fields match in every emit call: `answer` uses `result`, `why`, `mode`; `streak` uses `count`; `milestone` uses `label`.
- `FeedbackChannel.handle(event, cue, anchor?)` is used identically in the four channels and in `hub.ts`.
- `cueFor` returns `FeedbackCue` (non-null). The hub therefore has no null branch. Task 3 matches this.
- `hoverScale` and `press` accept `HTMLElement | SVGElement`. Task 8 casts `Element` to `SVGElement` and `HTMLElement` at the call sites.
- `feedback` singleton is exported from `core/feedback/index.ts` and imported by path `../core/feedback` or `../../core/feedback` from the views.
