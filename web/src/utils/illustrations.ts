/**
 * unDraw Illustration Registry & Injection Engine
 * 
 * Provides theme-reactive, vector-scaled unDraw illustrations.
 * Inlines raw SVGs at build-time with CSS variable binding:
 *   --undraw-accent: var(--accent-gold, #a5b4fc) [Obsidian Dark]
 *   --undraw-accent: var(--accent-gold, #5b5bd6) [Paper Light]
 */

import bookLoverRaw from '../assets/illustrations/book-lover_m9n3.svg?raw';
import completedRaw from '../assets/illustrations/completed_vjc6.svg?raw';
import conversationRaw from '../assets/illustrations/conversation_15p8.svg?raw';
import essayWritingRaw from '../assets/illustrations/essay-writing_nlru.svg?raw';
import examPrepRaw from '../assets/illustrations/exam-prep_nmly.svg?raw';
import knowledgeRaw from '../assets/illustrations/knowledge_0ty5.svg?raw';
import learningRaw from '../assets/illustrations/learning_qt7d.svg?raw';
import noDataRaw from '../assets/illustrations/no-data_ig65.svg?raw';
import personalSettingsRaw from '../assets/illustrations/personal-settings_8xv3.svg?raw';
import podcastListenerRaw from '../assets/illustrations/podcast-listener_dpel.svg?raw';
import readySetGoRaw from '../assets/illustrations/ready-set-go_wr4s.svg?raw';
import sortingThoughtsRaw from '../assets/illustrations/sorting-thoughts_b0kt.svg?raw';
import specialOccasionRaw from '../assets/illustrations/special-occasion_ffh6.svg?raw';
import thinkingModeRaw from '../assets/illustrations/thinking-mode_7czd.svg?raw';
import toTheStarsRaw from '../assets/illustrations/to-the-stars_tz9v.svg?raw';

export type IllustrationKey =
  | 'book-lover'
  | 'completed'
  | 'conversation'
  | 'essay-writing'
  | 'exam-prep'
  | 'knowledge'
  | 'learning'
  | 'no-data'
  | 'personal-settings'
  | 'podcast-listener'
  | 'ready-set-go'
  | 'sorting-thoughts'
  | 'special-occasion'
  | 'thinking-mode'
  | 'to-the-stars';

export type IllustrationAlias =
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'vocab'
  | 'settings'
  | 'ielts'
  | 'blitz'
  | 'grammar'
  | 'strategy'
  | 'empty'
  | 'success'
  | 'welcome'
  | 'stars'
  | 'celebration'
  | 'milestone'
  | 'occasion';

export type IllustrationName = IllustrationKey | IllustrationAlias;

const ILLUSTRATIONS: Record<IllustrationKey, string> = {
  'book-lover': bookLoverRaw,
  'completed': completedRaw,
  'conversation': conversationRaw,
  'essay-writing': essayWritingRaw,
  'exam-prep': examPrepRaw,
  'knowledge': knowledgeRaw,
  'learning': learningRaw,
  'no-data': noDataRaw,
  'personal-settings': personalSettingsRaw,
  'podcast-listener': podcastListenerRaw,
  'ready-set-go': readySetGoRaw,
  'sorting-thoughts': sortingThoughtsRaw,
  'special-occasion': specialOccasionRaw,
  'thinking-mode': thinkingModeRaw,
  'to-the-stars': toTheStarsRaw,
};

const ALIASES: Record<IllustrationAlias, IllustrationKey> = {
  reading: 'book-lover',
  listening: 'podcast-listener',
  speaking: 'conversation',
  writing: 'essay-writing',
  vocab: 'knowledge',
  settings: 'personal-settings',
  ielts: 'exam-prep',
  blitz: 'ready-set-go',
  grammar: 'thinking-mode',
  strategy: 'thinking-mode',
  empty: 'no-data',
  success: 'completed',
  welcome: 'learning',
  stars: 'to-the-stars',
  celebration: 'special-occasion',
  milestone: 'special-occasion',
  occasion: 'special-occasion',
};

export interface IllustrationOptions {
  size?: 'hero' | 'card' | 'banner' | 'empty' | 'compact';
  className?: string;
  ariaLabel?: string;
  style?: string;
}

export function illustration(name: IllustrationName, options: IllustrationOptions = {}): string {
  const key: IllustrationKey = (name in ALIASES)
    ? ALIASES[name as IllustrationAlias]
    : (name as IllustrationKey);

  const raw = ILLUSTRATIONS[key];
  if (!raw) return '';

  const size = options.size || 'card';
  const extraClass = options.className ? ` ${options.className}` : '';
  const styleAttr = options.style ? ` style="${options.style}"` : '';
  const a11yAttr = options.ariaLabel
    ? ` role="img" aria-label="${options.ariaLabel.replace(/"/g, '&quot;')}"`
    : ' aria-hidden="true" focusable="false"';

  // Strip any leading XML declaration or whitespace before matching root <svg> tag
  const cleaned = raw.replace(/<\?xml[\s\S]*?\?>/i, '').trim();

  // Inject classes and accessibility attributes into the root <svg> tag
  return cleaned.replace(
    /^<svg\b/,
    `<svg class="app-illustration size-${size}${extraClass}"${a11yAttr}${styleAttr}`
  );
}
