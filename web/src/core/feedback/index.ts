import { createFeedbackHub } from './hub';
import { soundChannel } from './channels/sound';
import { hapticChannel } from './channels/haptic';
import { motionChannel } from './channels/motion';
import { textChannel } from './channels/text';

export const feedback = createFeedbackHub([soundChannel, hapticChannel, motionChannel, textChannel]);
export type { FeedbackEvent } from './events';
