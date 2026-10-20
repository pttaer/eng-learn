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
