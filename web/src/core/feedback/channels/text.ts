import type { FeedbackChannel } from '../channel';

// Writes into the [data-feedback-slot] inside the anchor's scope: the nearest [data-feedback-scope] ancestor,
// or the anchor itself. No slot = no-op, so views opt in by adding the slot.
export const textChannel: FeedbackChannel = {
  id: 'text',
  handle(_event, cue, anchor) {
    if (!cue.copy || !anchor) return;
    const scope = anchor.closest<HTMLElement>('[data-feedback-scope]') ?? anchor;
    const slot = scope.querySelector<HTMLElement>('[data-feedback-slot]');
    if (!slot) return;
    slot.textContent = cue.copy;
    slot.hidden = false;
  }
};
