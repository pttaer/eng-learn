import { UsageTracker } from '../../usage-tracker';
import type { FeedbackChannel } from '../channel';

// Counts practice answers for the progress view. Exam answers never reach channels (the hub drops them).
export const statsChannel: FeedbackChannel = {
  id: 'stats',
  handle(event) {
    if (event.type === 'answer') UsageTracker.recordAnswer();
  }
};
