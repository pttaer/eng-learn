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

// Emotion rules (spec: 2026-10-20-feedback-layer-design, "Emotion rules").
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
