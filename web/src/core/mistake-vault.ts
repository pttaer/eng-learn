import { SerlGauntletEngine, SerlErrorRecord, ErrorCategory } from './serl-gauntlet-engine';
import { HapticEngine } from './haptic-engine';
import { AudioSynthesizer } from './audio-synthesizer';
import { icon } from '../utils/icons';
import { Cefr } from './cefr';
import { t } from './i18n';
import { L1VietnameseDiagnosticEngine } from './l1-vietnamese-diagnostic';
import { SemanticParaphraseEvaluator } from './semantic-paraphrase-evaluator';

export class MistakeVault {
  private static isInitialized = false;
  private static modalEl: HTMLElement | null = null;
  private static activeRecord: SerlErrorRecord | null = null;
  private static timerInterval: number | null = null;
  private static remainingSeconds: number = 0;
  private static feedbackTimeout: number | null = null;

  public static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen to universal mistake events across all dossiers & apps
    window.addEventListener('mistake:logged', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // No silent defaults: level, category and the learner's wrong form are all required
      if (!detail?.prompt || !detail?.expectedOutput || !detail?.learnerInput || !detail?.cefrLevel || !detail?.category) return;

      SerlGauntletEngine.recordError({
        sourceModule: detail.sourceModule || 'general',
        category: detail.category as ErrorCategory,
        cefrLevel: detail.cefrLevel as Cefr,
        ieltsBandEquivalent: detail.ieltsBandEquivalent,
        prompt: detail.prompt,
        learnerInput: detail.learnerInput,
        expectedOutput: detail.expectedOutput,
        explanation: detail.explanation || 'Recorded for rehabilitation',
        l1VietnameseTip: detail.l1VietnameseTip || ''
      });

      this.updateVaultBadges();
    });
  }

  public static updateVaultBadges(): void {
    const dueCount = SerlGauntletEngine.getActiveRecords().length;
    document.querySelectorAll('.mistake-vault-counter').forEach(el => {
      el.textContent = String(dueCount);
      (el as HTMLElement).style.display = dueCount > 0 ? 'inline-flex' : 'none';
    });
  }

  public static open(): void {
    this.init();
    if (this.modalEl) {
      this.modalEl.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'mistake-vault-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Smart Mistake Vault & Recovery Gauntlet');

    const sheet = document.createElement('div');
    sheet.className = 'mistake-vault-sheet';

    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    this.modalEl = overlay;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    this.renderHome(sheet);
  }

  public static close(): void {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.feedbackTimeout) {
      window.clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = null;
    }
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

  private static renderHome(container: HTMLElement): void {
    const stats = SerlGauntletEngine.getStats();
    const activeRecords = SerlGauntletEngine.getActiveRecords();
    const allRecords = SerlGauntletEngine.getAllRecords();

    container.innerHTML = `
      <div class="vault-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
        <div class="vault-title-group" style="min-width: 0; flex: 1;">
          <span class="vault-kicker" style="white-space: normal; line-height: 1.3; word-break: break-word;">${t('vault.kicker', undefined, 'SPACED ERROR REHABILITATION (SERL 2.0)')}</span>
          <h2 class="vault-title" style="white-space: normal; line-height: 1.3; font-size: 16px; margin: 4px 0 0 0;">${icon('target', 20)} ${t('vault.title', undefined, 'Smart Mistake Vault')}</h2>
        </div>
        <button type="button" class="vault-btn-close btn-modal-close" aria-label="${t('common.close', undefined, 'Close')}">✕</button>
      </div>

      <div class="vault-stats-grid">
        <div class="vault-stat-card is-accent">
          <span class="stat-num">${activeRecords.length}</span>
          <span class="stat-label">${t('vault.pending_recovery', undefined, 'Pending Recovery')}</span>
        </div>
        <div class="vault-stat-card">
          <span class="stat-num">${stats.totalGraduated}</span>
          <span class="stat-label">${t('vault.engrams_sealed', undefined, 'Engrams Sealed')}</span>
        </div>
        <div class="vault-stat-card">
          <span class="stat-num">${allRecords.length}</span>
          <span class="stat-label">${t('vault.total_logged', undefined, 'Total Logged')}</span>
        </div>
      </div>

      <div class="vault-main-action">
        ${activeRecords.length > 0 ? `
          <button type="button" class="vault-btn-primary btn-start-blitz">
            ${icon('zap', 18)} ${t('vault.start_blitz', { count: activeRecords.length }, `Start Recovery Blitz (${activeRecords.length} Due)`)}
          </button>
        ` : `
          <div class="vault-empty-state">
            <span class="empty-icon" style="color: var(--good, #22c55e); font-size: var(--font-h1);">✓</span>
            <h3>${t('vault.all_stabilized', undefined, 'All Engrams Stabilized')}</h3>
            <p>${t('vault.no_mistakes', undefined, 'No mistakes are currently pending rehabilitation. Logged errors will queue here.')}</p>
          </div>
        `}
      </div>

      ${allRecords.length > 0 ? `
        <div class="vault-history-section">
          <h3 class="vault-section-title">${t('vault.active_registry', undefined, 'Active Error Registry')}</h3>
          <div class="vault-records-list">
            ${allRecords.slice(0, 15).map(r => `
              <div class="vault-record-item ${r.status === 'graduated' ? 'is-graduated' : ''}">
                <div class="record-meta">
                  <span class="record-source">[${r.sourceModule.toUpperCase()}]</span>
                  <span class="record-streak">Streak: ${r.rehabStreak}/3</span>
                </div>
                <div class="record-prompt">${r.prompt}</div>
                <div class="record-expected">Target: <b>${r.expectedOutput}</b></div>
                ${r.l1VietnameseTip ? `<div class="record-tip">💡 ${r.l1VietnameseTip}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Vietnamese L1 Transfer & Error Taxonomy Diagnostic -->
      <div class="vault-l1-section" style="margin-top: 18px; padding: 14px; background: rgba(165,180,252,0.06); border: 1px solid var(--border-hairline); border-radius: var(--radius-squircle-sm, 10px);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="vault-kicker" style="color: var(--accent-gold);">VIETNAMESE EFL L1 TRANSFER DIAGNOSTIC</span>
          <span class="hud-status-badge" style="background: var(--warning-soft); color: var(--warning); border: none;">8 PHENOMENA</span>
        </div>
        <p style="font-size: var(--font-body-compact); color: var(--ink-secondary); margin-bottom: 12px; line-height: 1.45;">
          Systematic interlanguage tracking for suffix omission (-s/-ed), preposition calquing, aspect conflation (đã/rồi), and zero copula adjectives.
        </p>
        <button type="button" class="vault-btn-primary btn-start-l1-loop" style="width: 100%; justify-content: center; background: rgba(165,180,252,0.15); color: var(--accent-gold); border: 1px solid var(--border-subtle); border-radius: var(--radius-btn, 10px); min-height: 44px; font-weight: 700;">
          🎯 Start Vietnamese L1 Targeted Remediation Loop
        </button>
      </div>

      <div class="apple-modal-footer">
        <button type="button" class="apple-bottom-close-btn btn-modal-close" aria-label="${t('common.close', undefined, 'Close')}">
          ${t('common.close', undefined, 'Close')}
        </button>
      </div>
    `;

    container.querySelectorAll('.vault-btn-close, .btn-modal-close').forEach(b => {
      b.addEventListener('click', () => this.close());
    });
    container.querySelector('.btn-start-blitz')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      this.startBlitzDrill(container);
    });
    container.querySelector('.btn-start-l1-loop')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      HapticEngine.trigger('selection');
      this.startL1Remediation(container, 0);
    });
  }

  private static startBlitzDrill(container: HTMLElement): void {
    const dueRecords = SerlGauntletEngine.getActiveRecords();
    if (dueRecords.length === 0) {
      this.renderHome(container);
      return;
    }

    const record = dueRecords[0];
    this.activeRecord = record;
    const drill = SerlGauntletEngine.generateMicroDrill(record);
    this.remainingSeconds = drill.timeLimitSec;

    if (this.timerInterval) clearInterval(this.timerInterval);

    container.innerHTML = `
      <div class="vault-header">
        <div class="vault-title-group">
          <span class="vault-kicker">RECOVERY BLITZ // STAGE: ${drill.stage.toUpperCase()}</span>
          <h2 class="vault-title">Rehabilitation Drill</h2>
        </div>
        <div class="vault-timer-badge"><span class="timer-count">${this.remainingSeconds}</span>s</div>
      </div>

      <div class="vault-drill-card">
        <div class="drill-instructions">${drill.instructions}</div>
        <div class="drill-prompt-box">
          <div class="drill-prompt-text">${drill.prompt}</div>
          ${drill.l1Tip ? `<div class="drill-hint-box">💡 ${t('common.hint', undefined, 'Hint')}: ${drill.l1Tip}</div>` : ''}
        </div>

        ${drill.options && drill.options.length > 0 ? `
          <div class="drill-options-grid">
            ${drill.options.map(opt => `
              <button type="button" class="vault-option-btn" data-val="${opt}">${opt}</button>
            `).join('')}
          </div>
        ` : `
          <div class="drill-input-group">
            <input type="text" class="vault-text-input" placeholder="${t('vault.input_placeholder', undefined, 'Type the canonical target formulation...')}" autofocus />
            <button type="button" class="vault-btn-submit">${icon('check', 16)} ${t('common.verify', undefined, 'Verify')}</button>
          </div>
        `}
        <div class="drill-feedback-mount" style="min-height: 24px; margin-top: 12px;"></div>
      </div>
    `;

    const timerCountEl = container.querySelector('.timer-count');
    this.timerInterval = window.setInterval(() => {
      this.remainingSeconds--;
      if (timerCountEl) timerCountEl.textContent = String(Math.max(0, this.remainingSeconds));

      if (this.remainingSeconds <= 0) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.handleAnswer('', container);
      }
    }, 1000);

    const submitBtn = container.querySelector('.vault-btn-submit');
    const inputEl = container.querySelector<HTMLInputElement>('.vault-text-input');

    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitBtn?.dispatchEvent(new Event('click'));
      }
    });

    submitBtn?.addEventListener('click', () => {
      const val = inputEl?.value.trim() || '';
      this.handleAnswer(val, container);
    });

    container.querySelectorAll('.vault-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = (btn as HTMLElement).dataset.val || '';
        this.handleAnswer(val, container);
      });
    });
  }

  private static handleAnswer(answer: string, container: HTMLElement): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (!this.activeRecord) return;

    const result = SerlGauntletEngine.evaluateDrillAnswer(this.activeRecord.id, answer);
    const feedbackMount = container.querySelector('.drill-feedback-mount');

    if (result.success) {
      HapticEngine.trigger(result.graduated ? 'success' : 'light');
      AudioSynthesizer.play('chime');
      if (feedbackMount) {
        feedbackMount.innerHTML = `
          <div class="drill-result-banner is-success">
            <b>✓ CORRECT!</b> ${result.feedback}
          </div>
        `;
      }
    } else {
      HapticEngine.trigger('warning');
      AudioSynthesizer.play('alarm');
      if (feedbackMount) {
        feedbackMount.innerHTML = `
          <div class="drill-result-banner is-failure">
            <b>✗ REVISION NEEDED:</b> Correct: "${this.activeRecord.expectedOutput}". Interval reset.
          </div>
        `;
      }
    }

    if (this.feedbackTimeout) window.clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = window.setTimeout(() => {
      this.feedbackTimeout = null;
      if (!this.modalEl) return; // sheet closed during feedback
      const remaining = SerlGauntletEngine.getActiveRecords();
      if (remaining.length > 0) {
        this.startBlitzDrill(container);
      } else {
        this.renderHome(container);
      }
    }, 1800);
  }

  public static startL1Remediation(container: HTMLElement, drillIdx: number = 0): void {
    const drills = L1VietnameseDiagnosticEngine.getRemediationDrills();
    if (drillIdx >= drills.length) {
      AudioSynthesizer.play('stage-fanfare');
      container.innerHTML = `
        <div class="vault-header">
          <div class="vault-title-group">
            <span class="vault-kicker">L1 TRANSFER REMEDIATION</span>
            <h2 class="vault-title">Loop Complete!</h2>
          </div>
        </div>
        <div style="padding: 24px; text-align: center;">
          <div style="font-size: 48px; color: var(--good); margin-bottom: 12px;">✓</div>
          <h3 style="color: var(--ink-primary); margin-bottom: 8px;">All 6 Contrastive L1 Drills Mastered</h3>
          <p style="color: var(--ink-muted); margin-bottom: 24px;">Your Vietnamese interlanguage error patterns have been systematically recalibrated.</p>
          <button type="button" class="vault-btn-primary btn-back-home" style="border-radius: var(--radius-btn, 10px); min-height: 44px; padding: 10px 20px;">
            Back to Mistake Vault
          </button>
        </div>
      `;
      container.querySelector('.btn-back-home')?.addEventListener('click', () => this.renderHome(container));
      return;
    }

    const drill = drills[drillIdx];

    container.innerHTML = `
      <div class="vault-header">
        <div class="vault-title-group">
          <span class="vault-kicker">L1 CONTRASTIVE DRILL [${drillIdx + 1} / ${drills.length}]</span>
          <h2 class="vault-title">${drill.title}</h2>
        </div>
      </div>

      <div class="vault-drill-card" style="padding: 16px;">
        <div class="drill-instructions" style="margin-bottom: 12px; font-weight: 600;">${drill.prompt}</div>

        <!-- Faulty sentence card -->
        <div style="padding: 12px; background: rgba(248, 113, 113, 0.12); border-left: 3px solid var(--critical); border-radius: var(--radius-squircle-sm, 10px); margin-bottom: 12px; font-size: var(--font-body); color: var(--ink-primary);">
          <strong>${t('vault.interlanguage_fault', undefined, 'Interlanguage Fault')}:</strong> "${drill.faultySentence}"
        </div>

        <!-- Vietnamese contrastive root cause explanation -->
        <div style="padding: 10px 12px; background: var(--bg-surface-sunk); border-radius: var(--radius-squircle-sm, 10px); margin-bottom: 16px; font-size: var(--font-kicker); line-height: 1.5; color: var(--ink-secondary);">
          <strong style="color: var(--accent-gold);">💡 ${t('vault.l1_root_cause', undefined, 'L1 Root Cause')}:</strong> ${drill.contrastiveAnalysis}
        </div>

        <div class="drill-input-group" style="display: flex; gap: 8px;">
          <input type="text" class="vault-text-input l1-input" placeholder="${t('vault.input_l1_placeholder', undefined, 'Type the corrected sentence here...')}" autofocus style="min-height: 44px; flex: 1; padding: 0 12px; border-radius: var(--radius-btn, 10px);" />
          <button type="button" class="vault-btn-submit btn-verify-l1" style="min-height: 44px; border-radius: var(--radius-btn, 10px); padding: 0 16px;">${icon('check', 16)} ${t('common.verify', undefined, 'Verify')}</button>
        </div>

        <div class="l1-feedback-mount" style="min-height: 24px; margin-top: 14px;"></div>
      </div>

      <div class="apple-modal-footer" style="margin-top: 14px;">
        <button type="button" class="apple-bottom-close-btn btn-exit-l1" aria-label="${t('vault.exit_drill', undefined, 'Exit Drill')}">
          ${t('vault.return_to_vault', undefined, 'Return to Vault')}
        </button>
      </div>
    `;

    const inputEl = container.querySelector<HTMLInputElement>('.l1-input');
    const verifyBtn = container.querySelector('.btn-verify-l1');
    const exitBtn = container.querySelector('.btn-exit-l1');
    const feedbackMount = container.querySelector('.l1-feedback-mount');

    exitBtn?.addEventListener('click', () => this.renderHome(container));

    const checkAnswer = () => {
      const typed = (inputEl?.value || '').trim();
      if (!typed) return;

      const normalizeInput = (str: string) => str
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[.,!?;:]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const normTyped = normalizeInput(typed);
      const normTarget = normalizeInput(drill.expectedCorrection);

      // Defensively accept exact match or semantically equivalent paraphrase with L1 error resolved
      const isExact = normTyped === normTarget;
      const isParaphrase = !isExact &&
        SemanticParaphraseEvaluator.evaluate(drill.expectedCorrection, typed).isAcceptableParaphrase &&
        !L1VietnameseDiagnosticEngine.analyzeSentence(typed).some(f => f.type === drill.type);

      if (isExact || isParaphrase) {
        AudioSynthesizer.play('chime');
        HapticEngine.trigger('success');
        if (feedbackMount) {
          feedbackMount.innerHTML = `
            <div style="padding: 12px; background: var(--good-soft); border-left: 3px solid var(--good); border-radius: 6px; color: var(--ink-good); font-size: var(--font-body-compact); margin-bottom: 10px;">
              <b>${t('vault.drill_correct', undefined, '✓ CORRECT!')}</b> ${drill.vietnameseExplanation}
            </div>
            <button type="button" class="vault-btn-primary btn-next-l1" style="width: 100%; justify-content: center; border-radius: var(--radius-btn, 10px); min-height: 44px; font-weight: 700;">
              ${t('vault.next_drill', { current: drillIdx + 2, total: drills.length }, `Next Drill (${drillIdx + 2}/${drills.length}) →`)}
            </button>
          `;
          container.querySelector('.btn-next-l1')?.addEventListener('click', () => {
            this.startL1Remediation(container, drillIdx + 1);
          });
        }
      } else {
        AudioSynthesizer.play('alarm');
        HapticEngine.trigger('warning');
        if (feedbackMount) {
          feedbackMount.innerHTML = `
            <div style="padding: 12px; background: var(--critical-soft); border-left: 3px solid var(--critical); border-radius: 6px; color: var(--critical); font-size: var(--font-body-compact);">
              <b>${t('vault.drill_incorrect', undefined, '✗ INCORRECT:')}</b> ${t('vault.standard_answer', undefined, 'Standard answer:')} "${drill.expectedCorrection}"
              <div style="margin-top: 4px; font-size: var(--font-kicker); color: var(--ink-secondary);">${drill.vietnameseExplanation}</div>
            </div>
          `;
        }
      }
    };

    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkAnswer();
    });
    verifyBtn?.addEventListener('click', checkAnswer);
  }
}

// Automatically initialize listener when imported
MistakeVault.init();
(window as any).MistakeVault = MistakeVault;
