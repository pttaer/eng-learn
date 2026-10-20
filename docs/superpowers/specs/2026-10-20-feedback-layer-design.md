# Feedback layer: design

Date: 2026-10-20
Scope: both apps. English Singularity (main side) and IELTS (`web/ielts.html`, `web/src/ielts/`).
Status: approach A chosen by user. Remaining sections decided by the author per user direction ("auto proceed, advise only"). Changes listed under Decisions can be reversed in one file each.

## Goal

Every answer, hint, milestone, and streak gives the learner feedback in a consistent way across sound, motion, haptic, and text. Feedback names the task rule, never the learner. Each wrong answer points to the next step.

## Non-goals

- No new dependency. No audio files. Sounds stay procedural via `AudioSynthesizer`.
- No change to scoring, answer keys, or `why` text.
- No LLM calls. IELTS listening stays browser TTS only.
- No reward economy (XP bursts, companion character). That is sub-project B, built later on this layer.
- No anime.js v4 migration.
- No feedback in exam-simulation mode.

## Units

```
web/src/core/feedback/
  events.ts          types only. No DOM, no audio.
  cues.ts            pure function: event -> cue (sound, motion, haptic, copy). All emotion and timing choices live here.
  hub.ts             createFeedbackHub(channels): emit(event, anchor?) fans out to channels. Drops answer events whose mode is 'exam'.
  index.ts           exports the shared `feedback` singleton (one hub with the default channels).
  channels/
    sound.ts         AudioSynthesizer.play(cue.sound)
    haptic.ts        HapticEngine.trigger(cue.haptic)
    motion.ts        MotionEngine.pop / riseIn on anchor
    text.ts          writes cue.copy into [data-feedback-slot] inside anchor; no slot, no-op
```

Rules:
- Views emit events. New code never calls `AudioSynthesizer` or `MotionEngine` directly.
- Channel interface: `handle(event, cue, anchor?)`. Add a channel = one file plus one registration. Remove = unregister.
- `feedback/` imports core engines only. It never imports `ielts/` or `modules/`. Both apps import `feedback/`.
- No preferences module. Each engine already owns its state: mute (`AudioSynthesizer.isMute`), haptic enabled (`HapticEngine.isEnabled`), reduced motion (`MotionEngine.isReducedMotion`). The hub does not copy them.

## Event contract

```ts
type FeedbackEvent =
  | { type: 'answer'; result: 'correct' | 'wrong'; why: string; mode: 'practice' | 'exam' }
  | { type: 'hint'; text: string }
  | { type: 'milestone'; label: string }
  | { type: 'streak'; count: number };
```

`why` reuses the existing per-question evidence line. No new copy is written for answers.

## Cue table

| Event | Sound | Motion (on anchor) | Haptic | Text |
|---|---|---|---|---|
| answer correct | `chime` | `pop` | `success` | "Correct. {why}" |
| answer wrong | `ping` | none | `warning` | "Not quite. {why}" |
| hint | `tick` | none | `selection` | hint text |
| milestone | `stage-fanfare` | `riseIn` | `success` | label |
| streak | `streak-fire` | none | `medium` | "{count} in a row" |

Sound ids are existing ones. Audition by ear and swap in `cues.ts` only.

## Emotion rules (encoded in `cues.ts` comments)

- Correct answers get a bright, short, positive cue. Positive activating emotion supports persistence ([Camacho-Morles et al. 2021](https://repository.essex.ac.uk/32635/1/Camacho-Morles%20et%20al%20Educ%20Psych%20Review%202021%20Meta-Analysis%20Activity%20Achievement%20Emotions.pdf)).
- Wrong answers get a soft cue, no buzzer, no shake. Copy names the rule that was missed. Feedback aimed at the self lowers performance; feedback aimed at the task helps ([Kluger & DeNisi 1996](https://albany.edu/faculty/ts460/pad634/Files/2361-KlugerDeNisiFeedbackcapHighlighted.pdf)).
- Every cue is short so it does not compete with reading or listening content. No background music in any practice flow. Lyrics and non-preferred music impair reading comprehension; the effect is small ([neural study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7596708/)).
- Milestones and streaks are the emotional peaks. Keep them rare so they keep their effect. Emotional arousal aids consolidation of the material ([Schümann & Sommer 2018](https://learnmem.cshlp.org/content/25/6/283.short)). Applying this to vocab and band milestones is a hypothesis, not tested here.

## Modes

- `practice`: all channels active.
- `exam`: answer events carry `mode: 'exam'` and the hub drops them. Exam-simulation views emit no hint, milestone, or streak events either.

## Device behavior

- 390 phone: feedback slot spans the content column with a 16px side gutter. Copy wraps. Haptics fire on Android; iOS Safari has no `navigator.vibrate` and degrades silently.
- 1440 desktop: feedback slot sits inside the 760px card column. No haptics.
- Spacing: 8 inside the feedback group, 16 between groups (`E:\Eng\CLAUDE.md`). No `contain: size` on the slot. Measure sibling gaps and widths at 1440 and 390 before done.
- Reduced motion: motion channel does nothing. Sound, haptic, and text still fire.
- Mute: `AudioSynthesizer` mute silences sound cues. No extra toggle is added.

## Rollout

1. Core module: `events.ts`, `cues.ts`, `hub.ts`, `index.ts`, four channels. Both app entry points (`web/src/main.ts`, `web/src/ielts/main.ts`) import the shared `feedback` singleton so it is bundled. No boot call needed.
2. IELTS practice answers: `ielts/views/reading-drills.ts` (checkBtn handler around line 698, `renderFeedback` at line 746), `ielts/views/diagnostic.ts`. `listening-traps.ts` keeps its trap sound as-is; it is a teaching cue, not answer feedback.
3. Main-side answers: `modules/multi-skill-quiz-modal.ts`, `modules/blitz-dossier.ts` (answer sounds around lines 431-563). `exam-cockpit-dossier.ts` is exam mode: no hub calls.
4. Milestones and streaks: `blitz-dossier.ts` streak-fire, stage fanfare, and the existing level-up trigger in `header-hud.ts` (around line 891).
5. Motion fix, part of this layer: add `MotionEngine.hoverScale(el, on)` that calls `anime.remove` and `trackAnimation`. `skill-tree-view.ts` lines 598-629 use it. Fixes hover stacking found in the anime.js review.

## Success criteria (user confirms in browser; no self-written tests)

- IELTS reading drill, correct answer: chime plays, answer pulses, copy shows the `why` line.
- IELTS reading drill, wrong answer: ping plays, no buzzer, copy shows the rule missed. Android: haptic fires.
- Exam mode: zero sound, motion, or text cues on answers.
- Reduced motion on: no pop or riseIn. Sound and text still fire.
- Mute on: all sound cues silent immediately.
- Skill tree: fast hover across nodes does not jitter. Scale returns to 1.0.
- 390 and 1440: feedback slot gaps 8 and 16, no overlap, no horizontal scroll.

## Risks

- Cue fatigue. Mitigation: cues only on answers and milestones, never on plain clicks.
- Scope creep into sub-project B. Mitigation: stop at this layer.
- Existing direct `AudioSynthesizer.play` calls in `header-hud.ts` and others stay. Migrate later; they are clicks, not feedback events.

## Decisions made by the author (reversible)

- Keep anime.js 3.2.2. No v4 migration.
- Drop a preferences module. Engines already hold their own state.
- Use existing sound ids. Retune by ear in `cues.ts`.
- Exam mode drops all feedback.
