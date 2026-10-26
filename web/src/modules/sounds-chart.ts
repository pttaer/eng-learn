/**
 * Sounds tab: 44-sound RP phonemic chart. Tapping a symbol opens its example words,
 * and each word is read aloud by browser TTS. Isolated phonemes are not spoken
 * (browser voices cannot reliably produce them), so the example words carry the sound.
 */

import { speakText } from '../core/exercise-engine';
import phonemeData from '../assets/data/phonemes.json';

interface Phoneme {
  symbol: string;
  kind: 'monophthong' | 'diphthong' | 'consonant';
  examples: string[];
  voicing?: 'voiced' | 'voiceless';
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const KIND_LABEL: Record<Phoneme['kind'], string> = {
  monophthong: 'Vowels',
  diphthong: 'Diphthongs',
  consonant: 'Consonants',
};

export function renderSoundsPanel(): HTMLElement {
  const phonemes = (phonemeData as { phonemes: Phoneme[] }).phonemes;
  const root = document.createElement('div');
  root.className = 'sounds-panel';

  const kinds: Phoneme['kind'][] = ['monophthong', 'diphthong', 'consonant'];
  const groups = kinds.map(kind => {
    const items = phonemes.filter(p => p.kind === kind);
    const tiles = items.map(p => `
      <button type="button" class="sound-tile" data-sound="${esc(p.symbol)}" aria-label="Sound ${esc(p.symbol)}">${esc(p.symbol)}</button>`).join('');
    return `<section class="sounds-group"><h3 class="drill-kicker">${KIND_LABEL[kind]} • ${items.length}</h3><div class="sounds-grid">${tiles}</div></section>`;
  }).join('');

  root.innerHTML = `
    <p class="drill-note">Tap a symbol to hear its example words. Words are read aloud; the sound itself is in the stressed syllable.</p>
    ${groups}
    <div class="sound-detail" aria-live="polite"></div>`;

  const detail = root.querySelector('.sound-detail') as HTMLElement;

  root.addEventListener('click', e => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-sound], [data-word]');
    if (!target) return;
    if (target.dataset.word !== undefined) {
      speakText(target.dataset.word, 'uk');
      return;
    }
    const symbol = target.dataset.sound as string;
    const p = phonemes.find(x => x.symbol === symbol);
    if (!p) return;
    root.querySelectorAll('.sound-tile').forEach(t => t.classList.toggle('is-selected', (t as HTMLElement).dataset.sound === symbol));
    const voicing = p.voicing ? `<span class="drill-mono">${p.voicing}</span>` : '';
    detail.innerHTML = `
      <div class="sound-detail-head"><span class="sound-detail-symbol">/${esc(p.symbol)}/</span>${voicing}</div>
      <div class="sound-words">${p.examples.map(w => `
        <button type="button" class="drill-btn drill-btn-ghost" data-word="${esc(w)}" aria-label="Play ${esc(w)}">${esc(w)} ▶</button>`).join('')}
      </div>`;
  });

  return root;
}
