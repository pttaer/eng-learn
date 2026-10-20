import { createFeedbackHub } from './hub';
import { soundChannel } from './channels/sound';
import { hapticChannel } from './channels/haptic';
import { motionChannel } from './channels/motion';
import { textChannel } from './channels/text';
import { statsChannel } from './channels/stats';

export const feedback = createFeedbackHub([soundChannel, hapticChannel, motionChannel, textChannel, statsChannel]);
export type { FeedbackEvent } from './events';
