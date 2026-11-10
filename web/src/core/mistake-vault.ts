import { SerlGauntletEngine, SerlErrorRecord, ErrorCategory } from './serl-gauntlet-engine';
import { HapticEngine } from './haptic-engine';
import { AudioSynthesizer } from './audio-synthesizer';
import { icon } from '../utils/icons';
import { Cefr } from './cefr';
import { t } from './i18n';
import { L1VietnameseDiagnosticEngine } from './l1-vietnamese-diagnostic';
import { SemanticParaphraseEvaluator } from './semantic-paraphrase-evaluator';
import { AdversaryRegistry } from './adversary/adversary-registry';
import { ProgressionEngine } from './progression-engine';
import { illustration } from '../utils/illustrations';

export class MistakeVault {
  private static isInitialized = false;
  private static modalEl: HTMLElement | null = null;
  private static activeRecord: SerlErrorRecord | null = null;
  private static timerInterval: number | null = null;
  private static remainingSeconds: number = 0;
  private static feedbackTimeout: number | null = null;
  private static escHandler: ((e: KeyboardEvent) => void) | null = null;

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

      try {
        AdversaryRegistry.recordEncounter({
          sourceModule: detail.sourceModule || 'general',
          category: detail.category as ErrorCategory,
          academicTitle: detail.academicTitle || `${detail.category} Bottleneck`,
          cefrLevel: detail.cefrLevel as Cefr,
          prompt: detail.prompt,
          userResponse: detail.learnerInput,
          expectedAnswer: detail.expectedOutput,
          passed: false,
          linguisticExplanation: detail.explanation || 'Recorded for cognitive adversary tracking',
          l1VietnameseTip: detail.l1VietnameseTip || ''
        });
      } catch (err) {
        // Safe degrade if adversary tracking fails
      }

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

    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    };
    window.addEventListener('keydown', this.escHandler, true);

    const isL1 = typeof window !== 'undefined' && (window.location.hash.includes('l1') || window.location.hash.includes('trap'));
    if (isL1) {
      this.startL1Remediation(sheet, 0);
    } else {
      this.renderHome(sheet);
    }
  }

  public static close(): void {
    if (this.escHandler) {
      window.removeEventListener('keydown', this.escHandler, true);
      this.escHandler = null;
    }
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

      <!-- Hero L1 Vietnamese Trap Breaker Card (Elevated for High Engagement) -->
      <div class="vault-hero-l1-card" style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, rgba(202, 138, 4, 0.12), rgba(165, 180, 252, 0.08)); border: 1px solid var(--accent-gold, #ca8a04); border-radius: var(--radius-squircle-md, 16px); box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: var(--font-kicker); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase;">⚡ VIETNAMESE L1 TRAP BREAKER</span>
          <span style="font-size: 11px; font-weight: 700; background: rgba(202, 138, 4, 0.2); color: var(--accent-gold); padding: 2px 8px; border-radius: var(--radius-pill, 9999px);">${t('vault.classic_traps_count', { count: 11 }, '11 BẪY KINH ĐIỂN')}</span>
        </div>
        <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: var(--ink-primary); line-height: 1.3;">
          ${t('vault.hero_title', undefined, '🎯 Tiêu diệt thói quen dịch thô tiếng Việt (The Escape Path)')}
        </h3>
        <p style="font-size: var(--font-body-compact); color: var(--ink-secondary); margin: 0 0 12px 0; line-height: 1.45;">
          ${t('vault.hero_desc', undefined, 'Khắc phục 11 bẫy chuyển di: discuss about, although... but, there have, informations, open light, plays indispensable role...')}
        </p>
        <button type="button" class="vault-btn-primary btn-start-l1-loop" style="width: 100%; justify-content: center; background: var(--accent-gold, #ca8a04); color: #000; font-weight: 700; border: none; border-radius: var(--radius-btn, 10px); min-height: 44px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; touch-action: manipulation;">
          ${icon('zap', 18)} ${t('vault.start_l1_loop', undefined, 'Chém bẫy phản xạ ngay (60s) →')}
        </button>
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

      <div class="vault-main-action" style="margin-top: 14px;">
        ${activeRecords.length > 0 ? `
          <button type="button" class="vault-btn-primary btn-start-blitz" style="width: 100%; justify-content: center; min-height: 44px; border-radius: var(--radius-btn, 10px); font-weight: 700; display: inline-flex; align-items: center; gap: 8px;">
            ${icon('zap', 18)} ⚔️ ${t('vault.start_blitz', { count: activeRecords.length }, `Phục thù lỗi sai (${activeRecords.length} câu)`)}
          </button>
        ` : `
          <div class="vault-empty-state" style="padding: 18px 14px; text-align: center; background: var(--bg-surface-sunk, rgba(0,0,0,0.2)); border-radius: var(--radius-squircle-sm, 10px);">
            <div class="app-illustration-wrap" style="margin-bottom: var(--space-8, 8px);">
              ${illustration('completed', { size: 'compact', ariaLabel: t('vault.all_stabilized', undefined, 'All Engrams Stabilized') })}
            </div>
            <div style="font-weight: 700; font-size: 14px; color: var(--ink-primary); margin: 4px 0;">${t('vault.all_stabilized', undefined, 'All Engrams Stabilized')}</div>
            <p style="font-size: var(--font-kicker); color: var(--ink-muted); margin: 0;">${t('vault.no_mistakes', undefined, 'Không còn lỗi tồn đọng. Các câu làm sai trong test sẽ tự động lưu vào đây.')}</p>
          </div>
        `}
      </div>

      ${allRecords.length > 0 ? `
        <div class="vault-history-section" style="margin-top: 18px;">
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

      <div class="apple-modal-footer" style="margin-top: 18px;">
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
          <span class="vault-kicker">${t('vault.recovery_blitz_kicker', { stage: drill.stage.toUpperCase() }, `RECOVERY BLITZ // STAGE: ${drill.stage.toUpperCase()}`)}</span>
          <h2 class="vault-title">${t('vault.rehab_drill_title', undefined, 'Rehabilitation Drill')}</h2>
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

    try {
      AdversaryRegistry.recordEncounter({
        sourceModule: 'serl_gauntlet',
        category: this.activeRecord.category,
        academicTitle: `${this.activeRecord.category} Bottleneck`,
        cefrLevel: this.activeRecord.cefrLevel,
        prompt: this.activeRecord.prompt,
        userResponse: answer,
        expectedAnswer: this.activeRecord.expectedOutput,
        passed: result.success,
        linguisticExplanation: this.activeRecord.explanation,
        l1VietnameseTip: this.activeRecord.l1VietnameseTip
      });
    } catch (e) {
      // Degrade gracefully
    }

    const feedbackMount = container.querySelector('.drill-feedback-mount');

    if (result.success) {
      HapticEngine.trigger(result.graduated ? 'success' : 'light');
      AudioSynthesizer.play('chime');
      ProgressionEngine.addXP(20);
      if (feedbackMount) {
        feedbackMount.innerHTML = `
          <div class="drill-result-banner is-success">
            <b>${t('vault.correct_xp', { xp: 20 }, '✓ CORRECT (+20 XP)!')}</b> ${result.feedback}
          </div>
        `;
      }
    } else {
      HapticEngine.trigger('warning');
      AudioSynthesizer.play('alarm');
      if (feedbackMount) {
        feedbackMount.innerHTML = `
          <div class="drill-result-banner is-failure">
            <b>${t('vault.revision_needed', undefined, '✗ REVISION NEEDED:')}</b> Correct: "${this.activeRecord.expectedOutput}". Interval reset.
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
      ProgressionEngine.addXP(50);
      container.innerHTML = `
        <div class="vault-header">
          <div class="vault-title-group">
            <span class="vault-kicker">${t('vault.l1_transfer_kicker', undefined, 'L1 TRANSFER REMEDIATION')}</span>
            <h2 class="vault-title">${t('vault.all_traps_cleared', { xp: 50 }, '🎉 Toàn bộ bẫy đã được phá giải (+50 XP)!')}</h2>
          </div>
        </div>
        <div style="padding: 24px; text-align: center;">
          <div style="font-size: 48px; color: var(--good, #22c55e); margin-bottom: 12px;">✓</div>
          <h3 style="color: var(--ink-primary); margin-bottom: 8px;">${t('vault.mastered_l1_traps', undefined, 'Đã làm chủ 6 bẫy tư duy người Việt (L1)')}</h3>
          <p style="color: var(--ink-muted); margin-bottom: 24px; font-size: var(--font-body-compact); line-height: 1.45;">
            ${t('vault.remediation_complete_desc', undefined, 'Phản xạ ngôn ngữ của bạn đã được hiệu chỉnh: loại bỏ hoàn toàn các lỗi dịch thô discuss about, although... but, there have.')}
          </p>
          <button type="button" class="vault-btn-primary btn-back-home" style="border-radius: var(--radius-btn, 10px); min-height: 44px; padding: 10px 24px; font-weight: 700; background: var(--accent-gold); color: #000; border: none; cursor: pointer;">
            ${t('vault.back_to_vault', undefined, '← Về Mistake Vault')}
          </button>
        </div>
      `;
      container.querySelector('.btn-back-home')?.addEventListener('click', () => this.renderHome(container));
      return;
    }

    const drill = drills[drillIdx];

    // One-touch 1-thumb choice options: alternate order predictably
    const isFirstCorrect = drillIdx % 2 === 0;
    const choiceOptions = isFirstCorrect
      ? [drill.expectedCorrection, drill.faultySentence]
      : [drill.faultySentence, drill.expectedCorrection];

    container.innerHTML = `
      <div class="vault-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
        <div class="vault-title-group" style="min-width: 0; flex: 1;">
          <span class="vault-kicker" style="color: var(--accent-gold);">⚡ L1 TRAP BREAKER [${drillIdx + 1} / ${drills.length}]</span>
          <h2 class="vault-title" style="font-size: 15px; margin: 4px 0 0 0;">${drill.title}</h2>
        </div>
        <span class="vault-timer-badge" style="font-size: 12px; font-weight: 700; color: var(--accent-cyan); background: rgba(56,189,248,0.1); padding: 4px 8px; border-radius: 6px;">+25 XP</span>
      </div>

      <div class="vault-drill-card" style="padding: 16px;">
        <div class="drill-instructions" style="margin-bottom: 12px; font-weight: 600; color: var(--ink-primary);">${drill.prompt}</div>

        <!-- Faulty sentence card -->
        <div style="padding: 12px; background: rgba(248, 113, 113, 0.12); border-left: 3px solid var(--critical, #ef4444); border-radius: var(--radius-squircle-sm, 10px); margin-bottom: 12px; font-size: var(--font-body); color: var(--ink-primary);">
          <strong style="color: var(--critical, #ef4444);">${t('vault.interlanguage_fault', undefined, 'Bẫy tiếng Việt (L1 Fault)')}:</strong> "${drill.faultySentence}"
        </div>

        <!-- Vietnamese contrastive root cause explanation -->
        <div style="padding: 10px 12px; background: var(--bg-surface-sunk, rgba(0,0,0,0.25)); border-radius: var(--radius-squircle-sm, 10px); margin-bottom: 16px; font-size: var(--font-kicker); line-height: 1.5; color: var(--ink-secondary);">
          <strong style="color: var(--accent-gold);">💡 ${t('vault.l1_root_cause', undefined, 'Nguyên nhân nhầm')}:</strong> ${drill.contrastiveAnalysis}
        </div>

        <!-- 1-Thumb One-Touch Choice Options -->
        <div class="drill-options-grid" style="margin-bottom: 14px; display: grid; gap: 8px;">
          <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.05em; text-transform: uppercase;">
            CHỌN CÂU CHUẨN XÁC BẢN XỨ (ONE-TOUCH):
          </div>
          ${choiceOptions.map((opt, optIdx) => `
            <button type="button" class="vault-option-btn l1-option-btn" data-val="${opt}" style="min-height: 48px; border-radius: var(--radius-btn, 10px); padding: 10px 14px; font-size: var(--font-body-compact); text-align: left; display: flex; align-items: center; gap: 10px; line-height: 1.4; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--ink-primary); cursor: pointer; touch-action: manipulation;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: rgba(255,255,255,0.06); font-weight: 700; font-size: 11px; flex-shrink: 0; color: var(--ink-secondary);">
                ${String.fromCharCode(65 + optIdx)}
              </span>
              <span style="flex: 1;">${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Optional keyboard text input for desktop learners -->
        <details style="margin-top: 8px; margin-bottom: 12px;">
          <summary style="font-size: 12px; color: var(--ink-muted); cursor: pointer; padding: 4px 0;">${t('vault.keyboard_mode_summary', undefined, 'Hoặc tự gõ câu sửa (Keyboard mode)...')}</summary>
          <div class="drill-input-group" style="display: flex; gap: 8px; margin-top: 8px;">
            <input type="text" class="vault-text-input l1-input" placeholder="${t('vault.input_l1_placeholder', undefined, 'Gõ câu tiếng Anh chuẩn xác...')}" style="min-height: 44px; flex: 1; padding: 0 12px; border-radius: var(--radius-btn, 10px); background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--ink-primary);" />
            <button type="button" class="vault-btn-submit btn-verify-l1" style="min-height: 44px; border-radius: var(--radius-btn, 10px); padding: 0 16px; background: var(--accent-gold); color: #000; font-weight: 700; border: none; cursor: pointer;">${icon('check', 16)} ${t('common.verify', undefined, 'Kiểm tra')}</button>
          </div>
        </details>

        <div class="l1-feedback-mount" style="min-height: 24px; margin-top: 14px;"></div>
      </div>

      <div class="apple-modal-footer" style="margin-top: 14px;">
        <button type="button" class="apple-bottom-close-btn btn-exit-l1" aria-label="${t('vault.exit_drill', undefined, 'Exit Drill')}">
          ${t('vault.return_to_vault', undefined, 'Quay lại Mistake Vault')}
        </button>
      </div>
    `;

    const inputEl = container.querySelector<HTMLInputElement>('.l1-input');
    const verifyBtn = container.querySelector('.btn-verify-l1');
    const exitBtn = container.querySelector('.btn-exit-l1');
    const feedbackMount = container.querySelector('.l1-feedback-mount');

    exitBtn?.addEventListener('click', () => this.renderHome(container));

    const handleEvaluation = (userAnswer: string) => {
      const normalizeInput = (str: string) => str
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[.,!?;:]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const normTyped = normalizeInput(userAnswer);
      const normTarget = normalizeInput(drill.expectedCorrection);

      // Defensively accept exact match or semantically equivalent paraphrase with L1 error resolved
      const isExact = normTyped === normTarget;
      const isParaphrase = !isExact &&
        SemanticParaphraseEvaluator.evaluate(drill.expectedCorrection, userAnswer).isAcceptableParaphrase &&
        !L1VietnameseDiagnosticEngine.analyzeSentence(userAnswer).some(f => f.type === drill.type);

      if (isExact || isParaphrase) {
        AudioSynthesizer.play('chime');
        HapticEngine.trigger('success');
        ProgressionEngine.addXP(25);
        if (feedbackMount) {
          feedbackMount.innerHTML = `
            <div style="padding: 12px; background: var(--good-soft, rgba(34,197,94,0.12)); border-left: 3px solid var(--good, #22c55e); border-radius: 6px; color: var(--ink-good, #22c55e); font-size: var(--font-body-compact); margin-bottom: 10px; line-height: 1.45;">
              <b>${t('vault.correct_xp', { xp: 25 }, '✓ CHÍNH XÁC (+25 XP)!')}</b> ${drill.vietnameseExplanation}
            </div>
            <button type="button" class="vault-btn-primary btn-next-l1" style="width: 100%; justify-content: center; border-radius: var(--radius-btn, 10px); min-height: 44px; font-weight: 700; background: var(--good, #22c55e); color: #000; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              ${t('vault.next_drill', { current: drillIdx + 2, total: drills.length }, `Tiếp tục bài ${drillIdx + 2}/${drills.length} →`)}
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
            <div style="padding: 12px; background: var(--critical-soft, rgba(239,68,68,0.12)); border-left: 3px solid var(--critical, #ef4444); border-radius: 6px; color: var(--critical, #ef4444); font-size: var(--font-body-compact); line-height: 1.45;">
              <b>${t('vault.l1_trap_caught', undefined, '✗ DÍNH BẪY TIẾNG VIỆT:')}</b> ${t('vault.standard_answer', undefined, 'Câu chuẩn bản xứ:')} "${drill.expectedCorrection}"
              <div style="margin-top: 4px; font-size: var(--font-kicker); color: var(--ink-secondary);">${drill.vietnameseExplanation}</div>
            </div>
          `;
        }
      }
    };

    container.querySelectorAll('.l1-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val') || '';
        handleEvaluation(val);
      });
    });

    const checkAnswer = () => {
      const typed = (inputEl?.value || '').trim();
      if (!typed) return;
      handleEvaluation(typed);
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
