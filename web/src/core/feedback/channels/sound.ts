import { AudioSynthesizer } from '../../audio-synthesizer';
import type { FeedbackChannel } from '../channel';

export const soundChannel: FeedbackChannel = {
  id: 'sound',
  handle(_event, cue) {
    if (cue.sound) AudioSynthesizer.play(cue.sound);
  }
};
