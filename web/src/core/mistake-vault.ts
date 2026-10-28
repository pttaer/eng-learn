import { SerlGauntletEngine, SerlErrorRecord, ErrorCategory } from './serl-gauntlet-engine';
import { HapticEngine } from './haptic-engine';
import { AudioSynthesizer } from './audio-synthesizer';
import { icon } from '../utils/icons';
import { Cefr } from './cefr';
import { t } from './i18n';

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
      <div class="vault-header">
        <div class="vault-title-group">
          <span class="vault-kicker">${t('vault.kicker', undefined, 'SPACED ERROR REHABILITATION (SERL 2.0)')}</span>
          <h2 class="vault-title">${icon('target', 20)} ${t('vault.title', undefined, 'Smart Mistake Vault')}</h2>
        </div>
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
          ${drill.l1Tip ? `<div class="drill-hint-box">💡 Gợi ý: ${drill.l1Tip}</div>` : ''}
        </div>

        ${drill.options && drill.options.length > 0 ? `
          <div class="drill-options-grid">
            ${drill.options.map(opt => `
              <button type="button" class="vault-option-btn" data-val="${opt}">${opt}</button>
            `).join('')}
          </div>
        ` : `
          <div class="drill-input-group">
            <input type="text" class="vault-text-input" placeholder="Type the canonical target formulation..." autofocus />
            <button type="button" class="vault-btn-submit">${icon('check', 16)} Verify</button>
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
}

// Automatically initialize listener when imported
MistakeVault.init();
(window as any).MistakeVault = MistakeVault;
