import { HapticEngine } from '../../haptic-engine';
import type { FeedbackChannel } from '../channel';

export const hapticChannel: FeedbackChannel = {
  id: 'haptic',
  handle(_event, cue) {
    if (cue.haptic) HapticEngine.trigger(cue.haptic);
  }
};
