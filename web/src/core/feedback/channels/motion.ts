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
