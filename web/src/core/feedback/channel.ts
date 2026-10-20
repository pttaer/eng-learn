import type { FeedbackCue } from './cues';
import type { FeedbackEvent } from './events';

export interface FeedbackChannel {
  readonly id: string;
  handle(event: FeedbackEvent, cue: FeedbackCue, anchor?: HTMLElement): void;
}
