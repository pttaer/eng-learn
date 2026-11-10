/**
 * WorldEnglishesPanel: Cross-border accent ear-tuner and connected speech demasking engine.
 * Modes:
 * 1. 4-Quadrant Accent Matrix (US, UK, AU, IN)
 * 2. Ghost Word Hunter (Connected Speech Demasking)
 */

import {
  WORLD_ACCENTS_BANK,
  GHOST_WORDS_BANK,
  EscapePathEngine,
  type GhostWordDemaskingItem
} from '../core/escape-path-engine';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { AcousticHaptics } from '../core/acoustic-haptics';
import { t } from '../core/i18n';

type WorldMode = 'matrix' | 'ghosts';

export function renderWorldEnglishesPanel(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'world-englishes-workspace';

  let currentMode: WorldMode = 'matrix';
  let matrixIndex = 0;
  let ghostIndex = 0;
  let activeAccentKey = 'uk';
  let ghostsRevealed = false;

  function draw(): void {
    root.innerHTML = `
      <section class="world-panel-card">
        <div class="world-head-row">
          <div>
            <span class="drill-kicker">CROSS-BORDER COMPREHENSION // WORLD ENGLISHES</span>
            <h3 class="world-title">Decoding Global Accents & Connected Speech</h3>
          </div>
        </div>

        <p class="drill-note">
          Vietnamese students struggle with real English because English is <strong>stress-timed</strong> with vowel reduction to Schwa (/ə/),
          while Vietnamese is <strong>syllable-timed</strong>. Train your ears to decode connected speech elision and navigate global dialects.
        </p>

        <div class="world-mode-bar" role="tablist">
          <button type="button" class="world-mode-btn ${currentMode === 'matrix' ? 'active' : ''}" data-mode="matrix">
            🌐 1. Dialect Cross-Comparator (US / UK / AU / IN)
          </button>
          <button type="button" class="world-mode-btn ${currentMode === 'ghosts' ? 'active' : ''}" data-mode="ghosts">
            👻 2. Ghost Word Hunter (Connected Speech Demasking)
          </button>
        </div>

        <div class="world-stage-mount"></div>
      </section>
    `;

    // Bind mode tabs
    root.querySelectorAll('.world-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AcousticHaptics.tap();
        currentMode = (btn as HTMLElement).dataset.mode as WorldMode;
        ghostsRevealed = false;
        draw();
      });
    });

    const mount = root.querySelector('.world-stage-mount') as HTMLElement;
    if (currentMode === 'matrix') renderMatrixMode(mount);
    else renderGhostMode(mount);
  }

  function renderMatrixMode(container: HTMLElement): void {
    const item = WORLD_ACCENTS_BANK[matrixIndex];
    const currentCadence = item.cadences[activeAccentKey] || item.cadences.uk;

    container.innerHTML = `
      <div class="matrix-card">
        <div class="matrix-item-meta">
          <span class="drill-kicker">DIALECT MATRIX // SCENARIO ${matrixIndex + 1} OF ${WORLD_ACCENTS_BANK.length}</span>
        </div>
        <h4 class="matrix-item-title">${item.title}</h4>

        <div class="matrix-sentence-box">
          <p class="matrix-utterance-text">"${item.utterance}"</p>
        </div>

        <div class="quadrant-switcher" role="group" aria-label="${t('world.select_accent_aria', undefined, 'Select global accent')}">
          <button type="button" class="quadrant-btn ${activeAccentKey === 'us' ? 'active' : ''}" data-accent="us">
            <span class="flag-icon">🇺🇸</span>
            <span class="cadence-name">${t('englishes.general_american', undefined, 'General American')}</span>
          </button>
          <button type="button" class="quadrant-btn ${activeAccentKey === 'uk' ? 'active' : ''}" data-accent="uk">
            <span class="flag-icon">🇬🇧</span>
            <span class="cadence-name">${t('englishes.uk_rp', undefined, 'British RP')}</span>
          </button>
          <button type="button" class="quadrant-btn ${activeAccentKey === 'au' ? 'active' : ''}" data-accent="au">
            <span class="flag-icon">🇦🇺</span>
            <span class="cadence-name">${t('englishes.australian', undefined, 'Australian')}</span>
          </button>
          <button type="button" class="quadrant-btn ${activeAccentKey === 'in' ? 'active' : ''}" data-accent="in">
            <span class="flag-icon">🇮🇳</span>
            <span class="cadence-name">${t('englishes.indian_english', undefined, 'Indian English')}</span>
          </button>
        </div>

        <div class="cadence-details-card">
          <div class="cadence-details-head">
            <span class="cadence-title">${currentCadence.label}</span>
            <button type="button" class="drill-btn play-cadence-btn">▶ ${t('world.listen_cadence', undefined, 'Listen Cadence')}</button>
          </div>
          <div class="cadence-ipa-line">${currentCadence.ipa}</div>
          <p class="cadence-desc-line"><strong>${t('world.phonetic_profile_label', undefined, 'Key Phonetic Profile:')}</strong> ${currentCadence.characteristics}</p>
        </div>

        <div class="divergence-table-wrap">
          <span class="kicker-muted">${t('world.divergence_breakdown', undefined, 'PHONETIC DIVERGENCE BREAKDOWN ACROSS DIALECTS:')}</span>
          <table class="divergence-table">
            <thead>
              <tr>
                <th>${t('common.word', undefined, 'Word')}</th>
                <th>🇺🇸 US</th>
                <th>🇬🇧 UK</th>
                <th>🇦🇺 AU</th>
                <th>🇮🇳 IN</th>
                <th>${t('englishes.th_linguistic_marker', undefined, 'Linguistic Marker')}</th>
              </tr>
            </thead>
            <tbody>
              ${item.divergenceFeatures.map(f => `
                <tr>
                  <td><strong>${f.word}</strong></td>
                  <td class="ipa-cell">${f.us}</td>
                  <td class="ipa-cell">${f.uk}</td>
                  <td class="ipa-cell">${f.au}</td>
                  <td class="ipa-cell">${f.in}</td>
                  <td class="feature-note-cell">${f.featureNote}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="escape-footer-nav">
          <button type="button" class="drill-btn prev-btn" ${matrixIndex === 0 ? 'disabled' : ''}>${t('world.prev_scenario', undefined, 'Previous Scenario')}</button>
          <button type="button" class="drill-btn next-btn" ${matrixIndex === WORLD_ACCENTS_BANK.length - 1 ? 'disabled' : ''}>${t('world.next_scenario', undefined, 'Next Scenario')}</button>
        </div>
      </div>
    `;

    // Quadrant switcher
    container.querySelectorAll('.quadrant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AcousticHaptics.flip();
        activeAccentKey = (btn as HTMLElement).dataset.accent || 'uk';
        const cadence = item.cadences[activeAccentKey];
        AudioSynthesizer.speak(item.audioPrompt, { accent: cadence.accentId });
        renderMatrixMode(container);
      });
    });

    // Listen button
    container.querySelector('.play-cadence-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      const cadence = item.cadences[activeAccentKey];
      AudioSynthesizer.speak(item.audioPrompt, { accent: cadence.accentId });
    });

    // Nav buttons
    container.querySelector('.prev-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      matrixIndex = Math.max(0, matrixIndex - 1);
      draw();
    });
    container.querySelector('.next-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      matrixIndex = Math.min(WORLD_ACCENTS_BANK.length - 1, matrixIndex + 1);
      draw();
    });
  }

  function renderGhostMode(container: HTMLElement): void {
    const item = GHOST_WORDS_BANK[ghostIndex];

    container.innerHTML = `
      <div class="ghost-card">
        <div class="matrix-item-meta">
          <span class="drill-kicker">CONNECTED SPEECH DEMASKING // DRILL ${ghostIndex + 1} OF ${GHOST_WORDS_BANK.length}</span>
        </div>
        <h4 class="matrix-item-title">${item.title}</h4>

        <div class="ghost-sentence-display">
          <p class="ghost-audio-sentence">
            "${ghostsRevealed ? item.fullSentence : maskSentence(item)}"
          </p>
        </div>

        <div class="ghost-audio-controls">
          <button type="button" class="drill-btn play-connected-btn">▶ Listen Connected (1.0x)</button>
          <button type="button" class="drill-btn play-stretched-btn">🐢 Listen Stretched (0.8x)</button>
          <button type="button" class="drill-btn demask-toggle-btn">${ghostsRevealed ? 'Hide Ghost Words' : '👻 Reveal Ghost Words'}</button>
        </div>

        <div class="ghost-demask-body" style="display: ${ghostsRevealed ? 'block' : 'none'};">
          <div class="ghost-tokens-grid">
            ${item.ghostTokens.map(g => `
              <div class="ghost-token-card">
                <div class="ghost-token-header">
                  <span class="ghost-word-name">${g.word}</span>
                  <span class="ghost-reduction-tag">${g.reductionType.toUpperCase()}</span>
                </div>
                <div class="ghost-ipa-compare">
                  <div><strong>Citation:</strong> <span class="ipa-span">${g.citationIpa}</span></div>
                  <div><strong>Connected:</strong> <span class="ipa-span-highlight">${g.connectedIpa}</span></div>
                </div>
                <p class="ghost-explanation-text">${g.explanation}</p>
              </div>
            `).join('')}
          </div>

          <div class="ghost-pedagogical-box">
            <span class="kicker-muted">VIETNAMESE AUDITORY PERCEPTION TIP:</span>
            <p class="ghost-vn-tip">${item.pedagogicalTip}</p>
          </div>
        </div>

        <div class="escape-footer-nav">
          <button type="button" class="drill-btn prev-btn" ${ghostIndex === 0 ? 'disabled' : ''}>${t('escape.previous', undefined, 'Previous')}</button>
          <button type="button" class="drill-btn next-btn" ${ghostIndex === GHOST_WORDS_BANK.length - 1 ? 'disabled' : ''}>${t('world.next_drill', undefined, 'Next Drill')}</button>
        </div>
      </div>
    `;

    container.querySelector('.play-connected-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      AudioSynthesizer.speak(item.audioText, { rate: 1.0, accent: 'uk-rp' });
    });

    container.querySelector('.play-stretched-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      AudioSynthesizer.speak(item.audioText, { rate: 0.8, accent: 'uk-rp' });
    });

    container.querySelector('.demask-toggle-btn')?.addEventListener('click', () => {
      ghostsRevealed = !ghostsRevealed;
      if (ghostsRevealed) {
        AcousticHaptics.chime();
        EscapePathEngine.markCompleted('ghost', item.id, 15);
      } else {
        AcousticHaptics.tap();
      }
      renderGhostMode(container);
    });

    container.querySelector('.prev-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      ghostIndex = Math.max(0, ghostIndex - 1);
      ghostsRevealed = false;
      draw();
    });
    container.querySelector('.next-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      ghostIndex = Math.min(GHOST_WORDS_BANK.length - 1, ghostIndex + 1);
      ghostsRevealed = false;
      draw();
    });
  }

  function maskSentence(item: GhostWordDemaskingItem): string {
    let masked = item.fullSentence;
    item.ghostTokens.forEach(g => {
      const reg = new RegExp(`\\b${g.word}\\b`, 'gi');
      masked = masked.replace(reg, `[ • • • ]`);
    });
    return masked;
  }

  draw();
  return root;
}
