export type FeedbackEvent =
  | { type: 'answer'; result: 'correct' | 'wrong'; why: string; mode: 'practice' | 'exam' }
  | { type: 'hint'; text: string }
  | { type: 'milestone'; label: string }
  | { type: 'streak'; count: number };
