import { Cefr, CEFR_ORDER, effectiveLevel } from './cefr';
import { StorageManager } from '../utils/storage';

interface Leveled { cefrLevel?: string }

/** CEFR levels that have at least one item, in ladder order. */
export function levelsWithContent(items: Leveled[]): Cefr[] {
  const present = new Set(items.map(i => i.cefrLevel));
  return CEFR_ORDER.filter(l => present.has(l));
}

/** Learner's level, or the nearest level that has content. */
export function defaultLevel(items: Leveled[]): Cefr {
  return effectiveLevel(StorageManager.getLearnerLevel(), new Set(levelsWithContent(items)));
}

export function levelChipsHtml(levels: Cefr[], active: Cefr): string {
  return levels
    .map(l => `<button class="hud-btn level-tab ${l === active ? 'active' : ''}" data-cefr="${l}" aria-pressed="${l === active}">${l}</button>`)
    .join('');
}
