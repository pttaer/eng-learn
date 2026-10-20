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
