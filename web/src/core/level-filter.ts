import { Cefr, CEFR_ORDER, effectiveLevel } from './cefr';
import { StorageManager } from '../utils/storage';

interface Leveled { cefrLevel?: string }

/** CEFR levels that have at least one item, in ladder order. */
export function levelsWithContent(items: Leveled[]): Cefr[] {
  const present = new Set(items.map(i => i.cefrLevel));
  return CEFR_ORDER.filter(l => present.has(l));
}

/** Learner's level (or specified preferred level), or the nearest level that has content. */
export function defaultLevel(items: Leveled[], preferredLevel?: Cefr): Cefr {
  return effectiveLevel(preferredLevel ?? StorageManager.getLearnerLevel(), new Set(levelsWithContent(items)));
}

export function levelChipsHtml(levels: Cefr[], active: Cefr): string {
  return levels
    .map(l => `<button class="hud-btn level-tab ${l === active ? 'active' : ''}" data-cefr="${l}" aria-pressed="${l === active}">${l}</button>`)
    .join('');
}

export function bindLevelChips(root: HTMLElement, onPick: (level: Cefr) => void): void {
  root.querySelectorAll('.level-tab').forEach(chip => {
    chip.addEventListener('click', () => onPick((chip as HTMLElement).dataset.cefr as Cefr));
  });
}

/** Chip row markup shared by the pillar control bars. */
export function levelRowHtml(items: Leveled[], active: Cefr): string {
  return `<div class="vocab-level-selector"><span class="telemetry-label" style="margin-right: 8px;">LEVEL:</span>${levelChipsHtml(levelsWithContent(items), active)}</div>`;
}
