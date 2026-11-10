/**
 * EscapePathPanel: Interactive UI for deprogramming Vietnamese exam habits.
 * Modes:
 * 1. Calque Radar (Contrastive L1 Spotting)
 * 2. Chunk Jigsaw (Anti-Linear Assembly)
 * 3. De-Slop Studio (Anti-Template Paraphrase)
 */

import {
  EscapePathEngine,
  ESCAPE_SPOTTING_BANK,
  ESCAPE_JIGSAW_BANK,
  ESCAPE_PARAPHRASE_BANK
} from '../core/escape-path-engine';
import { AcousticHaptics } from '../core/acoustic-haptics';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { t } from '../core/i18n';

type EscapeMode = 'radar' | 'jigsaw' | 'deslop';

export function renderEscapePathPanel(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'escape-path-workspace';

  let currentMode: EscapeMode = 'radar';
  let spottingIndex = 0;
  let jigsawIndex = 0;
  let paraphraseIndex = 0;

  // Jigsaw local state
  let assembledTiles: string[] = [];
  let availableTiles: string[] = [];

  function draw(): void {
    const progress = EscapePathEngine.getProgress();

    root.innerHTML = `
      <section class="escape-panel-card">
        <div class="escape-head-row">
          <div>
            <span class="drill-kicker">${t('escape.kicker_cognitive', undefined, 'COGNITIVE ORTHOPEDICS // THE ESCAPE PATH')}</span>
            <h3 class="escape-title">${t('escape.deprogramming_title', undefined, 'Deprogramming Vietnamese Exam Habits')}</h3>
          </div>
          <div class="escape-telemetry-badge">
            <span class="drill-mono">XP: ${progress.totalScore}</span>
          </div>
        </div>

        <p class="drill-note">
          Vietnamese students are trained to translate word-by-word into multiple-choice tests.
          The Escape Path deprograms these fossilized habits through contrastive radar spotting, formulaic chunk assembly, and anti-template de-slopping.
        </p>

        <div class="escape-mode-bar" role="tablist">
          <button type="button" class="escape-mode-btn ${currentMode === 'radar' ? 'active' : ''}" data-mode="radar">
            🎯 1. Calque Radar (${progress.spottingCompleted.length}/${ESCAPE_SPOTTING_BANK.length})
          </button>
          <button type="button" class="escape-mode-btn ${currentMode === 'jigsaw' ? 'active' : ''}" data-mode="jigsaw">
            🧩 2. Chunk Jigsaw (${progress.jigsawCompleted.length}/${ESCAPE_JIGSAW_BANK.length})
          </button>
          <button type="button" class="escape-mode-btn ${currentMode === 'deslop' ? 'active' : ''}" data-mode="deslop">
            ⚡ 3. De-Slop Studio (${progress.paraphraseCompleted.length}/${ESCAPE_PARAPHRASE_BANK.length})
          </button>
        </div>

        <div class="escape-stage-mount"></div>
      </section>
    `;

    // Bind mode tabs
    root.querySelectorAll('.escape-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AcousticHaptics.tap();
        currentMode = (btn as HTMLElement).dataset.mode as EscapeMode;
        draw();
      });
    });

    const mount = root.querySelector('.escape-stage-mount') as HTMLElement;
    if (currentMode === 'radar') renderRadarMode(mount);
    else if (currentMode === 'jigsaw') renderJigsawMode(mount);
    else renderDeslopMode(mount);
  }

  function renderRadarMode(container: HTMLElement): void {
    const item = ESCAPE_SPOTTING_BANK[spottingIndex];
    const isDone = EscapePathEngine.getProgress().spottingCompleted.includes(item.id);

    container.innerHTML = `
      <div class="escape-exercise-card">
        <div class="escape-item-meta">
          <span class="drill-kicker">STAGE 1: DECONSTRUCTION // DRILL ${spottingIndex + 1} OF ${ESCAPE_SPOTTING_BANK.length}</span>
          <span class="drill-mono cefr-chip">${item.cefr}</span>
        </div>
        <h4 class="escape-item-title">${item.title}</h4>
        <p class="escape-prompt-guide">${item.contextPrompt}</p>

        <div class="token-cloud-box">
          ${item.tokens.map((tok, idx) => `
            <button type="button" class="escape-token-btn" data-token-idx="${idx}">${tok.text}</button>
          `).join('')}
        </div>

        <div class="radar-feedback-card" style="display: ${isDone ? 'block' : 'none'};">
          <div class="feedback-badge-good">✓ L1 TRAP NEUTRALIZED</div>
          <div class="radar-explanation-body">
            <strong>Nguyên nhân L1:</strong> ${item.contrastiveL1Rationale}
          </div>
        </div>

        <div class="escape-footer-nav">
          <button type="button" class="drill-btn prev-btn" ${spottingIndex === 0 ? 'disabled' : ''}>${t('escape.previous', undefined, 'Previous')}</button>
          <button type="button" class="drill-btn next-btn" ${spottingIndex === ESCAPE_SPOTTING_BANK.length - 1 ? 'disabled' : ''}>${t('escape.next_drill', undefined, 'Next Drill')}</button>
        </div>
      </div>
    `;

    container.querySelectorAll('.escape-token-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number((btn as HTMLElement).dataset.tokenIdx);
        const tok = item.tokens[idx];
        const feedbackCard = container.querySelector('.radar-feedback-card') as HTMLElement;

        if (tok.isFault) {
          AcousticHaptics.chime();
          btn.classList.add('token-fault-hit');
          btn.innerHTML = `<span class="fault-struck">${tok.text}</span> → <span class="fault-fixed">${tok.replacement || 'Ø'}</span>`;
          EscapePathEngine.markCompleted('spotting', item.id, 15);
          feedbackCard.style.display = 'block';
          feedbackCard.innerHTML = `
            <div class="feedback-badge-good">✓ L1 TRANSFER TRAP NEUTRALIZED</div>
            <p class="radar-explanation-text"><strong>Linguistic Invalidation:</strong> ${tok.faultExplanation}</p>
            <p class="radar-explanation-vn"><strong>Bản chất lỗi L1:</strong> ${item.contrastiveL1Rationale}</p>
          `;
        } else {
          AcousticHaptics.nudge();
          btn.classList.add('token-false-touch');
          setTimeout(() => btn.classList.remove('token-false-touch'), 600);
        }
      });
    });

    container.querySelector('.prev-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      spottingIndex = Math.max(0, spottingIndex - 1);
      draw();
    });
    container.querySelector('.next-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      spottingIndex = Math.min(ESCAPE_SPOTTING_BANK.length - 1, spottingIndex + 1);
      draw();
    });
  }

  function renderJigsawMode(container: HTMLElement): void {
    const item = ESCAPE_JIGSAW_BANK[jigsawIndex];
    const isDone = EscapePathEngine.getProgress().jigsawCompleted.includes(item.id);

    if (availableTiles.length === 0 && assembledTiles.length === 0) {
      // Shuffle correct tiles and distractors
      const pool = [...item.correctOrder, ...item.distractors];
      availableTiles = pool.sort(() => Math.random() - 0.5);
      assembledTiles = [];
    }

    container.innerHTML = `
      <div class="escape-exercise-card">
        <div class="escape-item-meta">
          <span class="drill-kicker">STAGE 2: SCAFFOLDING // CHUNK JIGSAW ${jigsawIndex + 1} OF ${ESCAPE_JIGSAW_BANK.length}</span>
          <span class="drill-mono cefr-chip">${item.cefr}</span>
        </div>
        <h4 class="escape-item-title">${item.title}</h4>
        <p class="escape-goal-text"><strong>Intent:</strong> ${item.communicativeGoal}</p>

        <div class="assembly-slot-box ${assembledTiles.length > 0 ? 'has-tiles' : ''}">
          <span class="slot-placeholder">${assembledTiles.length === 0 ? t('escape.jigsaw_placeholder', undefined, 'Tap chunks below in natural sequence (avoid word-by-word traps)...') : ''}</span>
          ${assembledTiles.map((t, idx) => `
            <button type="button" class="assembled-tile-chip" data-idx="${idx}">${t} ✕</button>
          `).join('')}
        </div>

        <div class="tile-palette-box">
          <span class="palette-label">AVAILABLE MULTI-WORD CHUNKS:</span>
          <div class="tiles-flex">
            ${availableTiles.map((t, idx) => `
              <button type="button" class="palette-tile-btn" data-idx="${idx}">${t}</button>
            `).join('')}
          </div>
        </div>

        <div class="jigsaw-actions-row">
          <button type="button" class="drill-btn check-jigsaw-btn">${t('escape.check_assembly', undefined, 'Check Assembly')}</button>
          <button type="button" class="drill-btn reset-jigsaw-btn">${t('common.reset', undefined, 'Reset')}</button>
        </div>

        <div class="jigsaw-feedback-card" style="display: ${isDone ? 'block' : 'none'};">
          <div class="feedback-badge-good">✓ FORMULAIC SEQUENCE VALIDATED</div>
          <p class="jigsaw-note-text"><strong>Frame Note:</strong> ${item.grammaticalFrameNote}</p>
          <p class="jigsaw-vn-text"><strong>Thoát ly L1:</strong> ${item.vietnameseContrast}</p>
        </div>

        <div class="escape-footer-nav">
          <button type="button" class="drill-btn prev-btn" ${jigsawIndex === 0 ? 'disabled' : ''}>${t('escape.previous', undefined, 'Previous')}</button>
          <button type="button" class="drill-btn next-btn" ${jigsawIndex === ESCAPE_JIGSAW_BANK.length - 1 ? 'disabled' : ''}>${t('escape.next_drill', undefined, 'Next Drill')}</button>
        </div>
      </div>
    `;

    // Click available tile -> move to assembled
    container.querySelectorAll('.palette-tile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AcousticHaptics.tap();
        const idx = Number((btn as HTMLElement).dataset.idx);
        const tile = availableTiles.splice(idx, 1)[0];
        assembledTiles.push(tile);
        renderJigsawMode(container);
      });
    });

    // Click assembled tile -> return to palette
    container.querySelectorAll('.assembled-tile-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        AcousticHaptics.tap();
        const idx = Number((btn as HTMLElement).dataset.idx);
        const tile = assembledTiles.splice(idx, 1)[0];
        availableTiles.push(tile);
        renderJigsawMode(container);
      });
    });

    // Reset button
    container.querySelector('.reset-jigsaw-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      availableTiles = [];
      assembledTiles = [];
      renderJigsawMode(container);
    });

    // Check button
    container.querySelector('.check-jigsaw-btn')?.addEventListener('click', () => {
      const feedback = container.querySelector('.jigsaw-feedback-card') as HTMLElement;
      const isMatch = assembledTiles.length === item.correctOrder.length &&
        assembledTiles.every((t, i) => t === item.correctOrder[i]);

      if (isMatch) {
        AcousticHaptics.chime();
        EscapePathEngine.markCompleted('jigsaw', item.id, 20);
        feedback.style.display = 'block';
        feedback.innerHTML = `
          <div class="feedback-badge-good">✓ FORMULAIC SEQUENCE VALIDATED (NO L1 WORD-BY-WORD CALQUE)</div>
          <p class="jigsaw-note-text"><strong>Grammatical Frame:</strong> ${item.grammaticalFrameNote}</p>
          <p class="jigsaw-vn-text"><strong>Thoát ly L1:</strong> ${item.vietnameseContrast}</p>
        `;
      } else {
        AcousticHaptics.nudge();
        feedback.style.display = 'block';
        const hasDistractor = assembledTiles.some(t => item.distractors.includes(t));
        feedback.innerHTML = `
          <div class="feedback-badge-bad">✕ SEQUENCE MISMATCH</div>
          <p class="jigsaw-note-text">${hasDistractor ? '⚠️ You selected a Vietnamese literal calque tile! English does not assemble words this way.' : 'The chunks are not in canonical native order. Try assembling the frame again.'}</p>
        `;
      }
    });

    container.querySelector('.prev-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      jigsawIndex = Math.max(0, jigsawIndex - 1);
      availableTiles = [];
      assembledTiles = [];
      draw();
    });
    container.querySelector('.next-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      jigsawIndex = Math.min(ESCAPE_JIGSAW_BANK.length - 1, jigsawIndex + 1);
      availableTiles = [];
      assembledTiles = [];
      draw();
    });
  }

  function renderDeslopMode(container: HTMLElement): void {
    const item = ESCAPE_PARAPHRASE_BANK[paraphraseIndex];
    const isDone = EscapePathEngine.getProgress().paraphraseCompleted.includes(item.id);

    container.innerHTML = `
      <div class="escape-exercise-card">
        <div class="escape-item-meta">
          <span class="drill-kicker">STAGE 3: RECONSTRUCTION // DE-SLOP STUDIO ${paraphraseIndex + 1} OF ${ESCAPE_PARAPHRASE_BANK.length}</span>
          <span class="drill-mono cefr-chip">${item.cefr}</span>
        </div>
        <h4 class="escape-item-title">${item.title}</h4>

        <div class="bloated-sentence-box">
          <span class="kicker-muted">BLOATED CRAM-SCHOOL TEMPLATE (BAND 5.5 - 6.0):</span>
          <p class="bloated-text">"${item.bloatedSentence}"</p>
          <div class="detected-cliche-pill">❌ Cliché detected: <strong>${item.detectedCliche}</strong></div>
        </div>

        <div class="deslop-guidelines">
          <div class="guideline-chip">Catalyst Verb: <strong>${item.catalystKeyword}</strong></div>
          <div class="guideline-chip">Word Ceiling: <strong>&le; ${item.maxWordCount} words</strong></div>
        </div>

        <div class="deslop-input-area">
          <label for="deslop-textarea" class="kicker-muted">YOUR CONCISE ACADEMIC REWRITE (BAND 8.5+):</label>
          <textarea id="deslop-textarea" class="deslop-textarea" rows="2" placeholder="${t('escape.deslop_placeholder', { catalyst: item.catalystKeyword }, `Rewrite concisely without cram clichés using catalyst '${item.catalystKeyword}'...`)}"></textarea>
          <div class="deslop-action-bar">
            <button type="button" class="drill-btn evaluate-deslop-btn">${t('escape.evaluate_deslop', undefined, 'Evaluate De-Slop')}</button>
            <button type="button" class="drill-btn reveal-model-btn">${t('escape.reveal_model', undefined, 'Reveal Band 8.5 Model')}</button>
          </div>
        </div>

        <div class="deslop-feedback-card" style="display: ${isDone ? 'block' : 'none'};">
          <div class="feedback-badge-good">✓ DE-SLOP SUCCESSFUL</div>
          <p class="model-rewrite-box"><strong>Band 8.5 Model:</strong> "${item.exemplaryRewrite}"</p>
          <p class="deslop-analysis-vn"><strong>Phân tích tinh gọn:</strong> ${item.vietnameseAnalysis}</p>
        </div>

        <div class="escape-footer-nav">
          <button type="button" class="drill-btn prev-btn" ${paraphraseIndex === 0 ? 'disabled' : ''}>${t('escape.previous', undefined, 'Previous')}</button>
          <button type="button" class="drill-btn next-btn" ${paraphraseIndex === ESCAPE_PARAPHRASE_BANK.length - 1 ? 'disabled' : ''}>${t('escape.next_drill', undefined, 'Next Drill')}</button>
        </div>
      </div>
    `;

    const textarea = container.querySelector('#deslop-textarea') as HTMLTextAreaElement;
    const feedback = container.querySelector('.deslop-feedback-card') as HTMLElement;

    container.querySelector('.evaluate-deslop-btn')?.addEventListener('click', () => {
      const result = EscapePathEngine.evaluateParaphrase(textarea.value, item);
      if (result.passed) {
        AcousticHaptics.chime();
        EscapePathEngine.markCompleted('paraphrase', item.id, 25);
        feedback.style.display = 'block';
        feedback.innerHTML = `
          <div class="feedback-badge-good">✓ ${result.feedback}</div>
          <p class="model-rewrite-box"><strong>Band 8.5 Native Model:</strong> "${item.exemplaryRewrite}"</p>
          <p class="deslop-analysis-vn"><strong>Phân tích học thuật:</strong> ${item.vietnameseAnalysis}</p>
        `;
      } else {
        AcousticHaptics.nudge();
        feedback.style.display = 'block';
        feedback.innerHTML = `
          <div class="feedback-badge-bad">✕ REVISION CRITIQUE</div>
          <p class="deslop-analysis-vn">${result.feedback}</p>
        `;
      }
    });

    container.querySelector('.reveal-model-btn')?.addEventListener('click', () => {
      AcousticHaptics.flip();
      feedback.style.display = 'block';
      feedback.innerHTML = `
        <div class="feedback-badge-neutral">ℹ BAND 8.5 NATIVE MODEL</div>
        <p class="model-rewrite-box">"${item.exemplaryRewrite}"</p>
        <p class="deslop-analysis-vn"><strong>Phân tích học thuật:</strong> ${item.vietnameseAnalysis}</p>
      `;
      AudioSynthesizer.speak(item.exemplaryRewrite, { accent: 'uk-rp' });
    });

    container.querySelector('.prev-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      paraphraseIndex = Math.max(0, paraphraseIndex - 1);
      draw();
    });
    container.querySelector('.next-btn')?.addEventListener('click', () => {
      AcousticHaptics.tap();
      paraphraseIndex = Math.min(ESCAPE_PARAPHRASE_BANK.length - 1, paraphraseIndex + 1);
      draw();
    });
  }

  draw();
  return root;
}
