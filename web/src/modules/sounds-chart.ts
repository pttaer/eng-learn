/**
 * Sounds tab: 44-sound RP phonemic chart. Tapping a symbol opens its example words,
 * and each word is read aloud by browser TTS. Isolated phonemes are not spoken
 * (browser voices cannot reliably produce them), so the example words carry the sound.
 */

import { speakText } from '../core/exercise-engine';
import phonemeData from '../assets/data/phonemes.json';
import { ArticulatoryBiomechanics } from '../core/articulatory-biomechanics';

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
    <p class="drill-note">Tap a symbol to inspect physical articulatory mechanics (jaw drop, tongue placement, formant targets) and hear example words.</p>
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
    const bioProfile = ArticulatoryBiomechanics.getProfile(p.symbol);

    let biomechanicHtml = '';
    if (bioProfile) {
      biomechanicHtml = `
        <div class="biomechanic-card" style="margin-top: 14px; padding: 14px; background: var(--bg-surface-sunk, rgba(0,0,0,0.2)); border-radius: var(--radius-squircle-sm, 10px); border-left: 3px solid var(--accent-gold); font-size: var(--font-body-compact); line-height: 1.5;">
          <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.06em; margin-bottom: 8px;">
            ARTICULATORY BIOMECHANICAL GUIDELINES
          </div>
          <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 10px;">
            <div><strong>🦷 Jaw Aperture (~${bioProfile.jawApertureMm}mm):</strong> <span style="color: var(--ink-secondary);">${bioProfile.jawInstruction}</span></div>
            <div><strong>👅 Tongue Placement:</strong> <span style="color: var(--ink-secondary);">${bioProfile.tonguePosition}</span></div>
            <div><strong>👄 Lip Posture (${bioProfile.lipPosture.toUpperCase()}):</strong> <span style="color: var(--ink-secondary);">${bioProfile.lipInstruction}</span></div>
            ${bioProfile.targetFormants ? `
              <div style="display: flex; gap: 12px; margin-top: 4px; font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--accent-gold);">
                <span>TARGET F1: ${bioProfile.targetFormants.f1}Hz</span>
                <span>TARGET F2: ${bioProfile.targetFormants.f2}Hz</span>
              </div>
            ` : ''}
            ${bioProfile.vietnameseL1Contrast ? `
              <div style="margin-top: 6px; padding: 6px 10px; background: rgba(251,191,36,0.1); border-radius: 6px; color: var(--warning); font-size: var(--font-kicker);">
                <strong>⚠️ Vietnamese L1 Tip:</strong> ${bioProfile.vietnameseL1Contrast}
              </div>
            ` : ''}
          </div>
          <!-- Pitch / Rhythm Guideline -->
          <div style="border-top: 1px solid var(--border-hairline); padding-top: 8px;">
            <div style="font-size: var(--font-kicker); color: var(--ink-muted); margin-bottom: 4px;">Nuclear Stress Pitch Contour (Declarative Fall):</div>
            ${ArticulatoryBiomechanics.generatePitchContourSvg('fall', 240, 42)}
          </div>
        </div>
      `;
    }

    detail.innerHTML = `
      <div class="sound-detail-head"><span class="sound-detail-symbol">/${esc(p.symbol)}/</span>${voicing}</div>
      <div class="sound-words">${p.examples.map(w => `
        <button type="button" class="drill-btn drill-btn-ghost" data-word="${esc(w)}" aria-label="Play ${esc(w)}" style="border-radius: var(--radius-btn, 10px);">${esc(w)} ▶</button>`).join('')}
      </div>
      ${biomechanicHtml}`;
  });

  return root;
}
