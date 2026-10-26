/**
 * Native SVG Learner Mastery Analytics Dashboard & SERL 2.0 Gauntlet Workbench
 * 
 * Features:
 * 1. 6-Axis CEFR Competency Radar (Reading, Writing, Listening, Speaking, Grammar, Mediation)
 *    rendered with native pure mathematical SVG <polygon> and concentric tiers (A1-C2).
 * 2. 30-Day Predictive IELTS Band Trajectory Corridor with upper/lower +/- 0.5 band confidence corridor.
 * 3. Interactive SERL 2.0 Rehabilitation Micro-Drill Launcher.
 * 4. Zero third-party runtime charting dependencies (100% native SVG and CSS).
 */

import { Cefr } from '../core/cefr';
import { SkillId } from '../utils/storage';
import { SkillTreeEngine } from '../core/skill-tree-engine';
import { SerlGauntletEngine, SerlErrorRecord, RehabMicroDrill } from '../core/serl-gauntlet-engine';
import { icon } from '../utils/icons';

export interface AxisDefinition {
  id: string;
  label: string;
  sublabel: string;
  skillId: SkillId;
  color: string;
}

export const RADAR_AXES: AxisDefinition[] = [
  { id: 'reading', label: 'READING', sublabel: 'Epistemic Deconstruction', skillId: 'reading', color: 'var(--cyan, #38bdf8)' },
  { id: 'writing', label: 'WRITING', sublabel: 'Rhetoric & MEAL Copywork', skillId: 'writing', color: 'var(--accent-gold, #f59e0b)' },
  { id: 'listening', label: 'LISTENING', sublabel: 'Acoustic Decoding & Phonemes', skillId: 'listening', color: 'var(--accent-purple, #a855f7)' },
  { id: 'speaking', label: 'SPEAKING', sublabel: 'Prosody & Spontaneous Fluency', skillId: 'speaking', color: 'var(--good, #10b981)' },
  { id: 'grammar', label: 'GRAMMAR', sublabel: 'Syntactic Clausal Balance', skillId: 'grammar', color: 'var(--accent-blue, #6366f1)' },
  { id: 'mediation', label: 'MEDIATION', sublabel: 'Pragmatic Register Bridge', skillId: 'writing', color: 'var(--accent-teal, #14b8a6)' }
];

export class AnalyticsDossier {
  private container: HTMLElement;
  private activeDrill: RehabMicroDrill | null = null;
  private activeDrillRecord: SerlErrorRecord | null = null;
  private drillTimer: any = null;
  private drillSecondsRemaining: number = 0;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'analytics-dossier-shell';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Learner Mastery Analytics Dashboard');
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';
    this.renderDashboard();
    return this.container;
  }

  public teardown(): void {
    if (this.drillTimer) {
      clearInterval(this.drillTimer);
      this.drillTimer = null;
    }
  }

  private renderDashboard(): void {
    const masteries = this.calculateBranchMasteries();
    const overallBand = AnalyticsDossier.estimateIeltsBand(masteries);
    const radarSvg = AnalyticsDossier.generateRadarSvg(masteries, 320);
    const trajectorySvg = AnalyticsDossier.generateTrajectorySvg(overallBand, 7.5, 480, 180);
    const serlStats = SerlGauntletEngine.getStats();
    const dueErrors = SerlGauntletEngine.getActiveRecords();

    this.container.innerHTML = `
      <div class="analytics-dashboard-grid">
        
        <!-- LEFT COLUMN: CEFR RADAR & IELTS TRAJECTORY -->
        <div class="analytics-visuals-col" style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Radar Card -->
          <div class="analytics-card radar-card" style="background: var(--bg-surface, #0f172a); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px 20px;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <span class="badge-sub" style="font-size: var(--font-kicker); font-weight: 700; letter-spacing: 0.08em; color: var(--cyan, #38bdf8); text-transform: uppercase;">CEFR 6-AXIS HEXAGONAL SPECTRUM</span>
                <h2 style="margin: 2px 0 0; font-size: var(--font-h3); font-weight: 700;">Competency Radar</h2>
              </div>
              <div class="band-pill" style="background: rgba(56, 189, 248, 0.12); border: 1px solid var(--cyan, #38bdf8); padding: 4px 12px; border-radius: 999px; font-size: var(--font-body-compact); font-weight: 700; color: var(--cyan, #38bdf8);">
                IELTS ~${overallBand.toFixed(1)} BAND
              </div>
            </div>

            <div class="radar-container" style="display: flex; justify-content: center; align-items: center; padding: 8px 0;">
              ${radarSvg}
            </div>

            <!-- Axis Readout Badges -->
            <div class="radar-axis-readouts" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; border-top: 1px solid var(--border-hairline, rgba(255,255,255,0.08)); padding-top: 12px;">
              ${RADAR_AXES.map(axis => {
                const val = masteries[axis.id] || 0;
                return `
                  <div class="axis-pill-item" style="display: flex; flex-direction: column; gap: 6px; background: rgba(255,255,255,0.03); padding: 6px 10px; border-radius: 8px;">
                    <span style="font-size: var(--font-kicker); color: var(--ink-muted, #94a3b8); font-weight: 600;">${axis.label}</span>
                    <span style="font-size: var(--font-body-compact); font-weight: 700; color: ${axis.color};">${val}% <small style="font-size: var(--font-kicker); opacity: 0.7;">(${this.pctToCefr(val)})</small></span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- IELTS Trajectory Card -->
          <div class="analytics-card trajectory-card" style="background: var(--bg-surface, #0f172a); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px 20px;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <span class="badge-sub" style="font-size: var(--font-kicker); font-weight: 700; letter-spacing: 0.08em; color: var(--accent-gold, #f59e0b); text-transform: uppercase;">PREDICTIVE 30-DAY CORRIDOR</span>
                <h3 style="margin: 2px 0 0; font-size: var(--font-body); font-weight: 700;">IELTS Band Trajectory</h3>
              </div>
              <span style="font-size: var(--font-kicker); color: var(--ink-muted, #94a3b8);">Target: <strong>Band 7.5</strong> (C1)</span>
            </div>

            <div class="trajectory-svg-container" style="width: 100%; overflow-x: auto;">
              ${trajectorySvg}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: var(--font-kicker); color: var(--ink-muted, #94a3b8); margin-top: 8px;">
              <span>● Day 1 (Baseline)</span>
              <span>--- Projected Curve (±0.5 Band)</span>
              <span>★ Day 30 Target</span>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: SERL 2.0 REHABILITATION GAUNTLET -->
        <div class="analytics-serl-col" style="display: flex; flex-direction: column; gap: 20px;">
          
          <div class="analytics-card serl-card" style="background: var(--bg-surface, #0f172a); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px 20px; flex: 1; display: flex; flex-direction: column;">
            
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <span class="badge-sub" style="font-size: var(--font-kicker); font-weight: 700; letter-spacing: 0.08em; color: var(--accent-purple, #a855f7); text-transform: uppercase;">SERL 2.0 ADAPTIVE ENGINE</span>
                <h2 style="margin: 2px 0 0; font-size: var(--font-h3); font-weight: 700;">Error Rehabilitation Gauntlet</h2>
              </div>
              <div class="serl-count-badge" style="background: rgba(168, 85, 247, 0.15); border: 1px solid var(--accent-purple, #a855f7); color: var(--accent-purple, #a855f7); padding: 4px 10px; border-radius: 999px; font-size: var(--font-kicker); font-weight: 700;">
                ${serlStats.totalDue} DUE / ${serlStats.totalActive} ACTIVE
              </div>
            </div>

            <p style="font-size: var(--font-body-compact); color: var(--ink-secondary, #cbd5e1); margin: 0 0 14px; line-height: 1.5;">
              Every error across Copywork, Mocks, and Acoustic Speaking is recycled into 3-stage micro-drills 
              (<strong>Spot</strong> &rarr; <strong>Repair</strong> &rarr; <strong>Transfer</strong>). 
              Consecutive passes seal long-term neural engrams.
            </p>

            <!-- SERL Telemetry Bar -->
            <div class="serl-telemetry-bar" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;">
              <div style="background: rgba(255,255,255,0.03); padding: 8px 10px; border-radius: 8px; text-align: center;">
                <div style="font-size: var(--font-kicker); color: var(--ink-muted, #94a3b8);">ACTIVE QUEUE</div>
                <div style="font-size: var(--font-body); font-weight: 700; color: var(--accent-purple, #a855f7);">${serlStats.totalActive}</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px 10px; border-radius: 8px; text-align: center;">
                <div style="font-size: var(--font-kicker); color: var(--ink-muted, #94a3b8);">TOTAL LAPSES</div>
                <div style="font-size: var(--font-body); font-weight: 700; color: var(--critical, #f43f5e);">${serlStats.totalLapses}</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); padding: 8px 10px; border-radius: 8px; text-align: center;">
                <div style="font-size: var(--font-kicker); color: var(--ink-muted, #94a3b8);">SEALED ENGRAMS</div>
                <div style="font-size: var(--font-body); font-weight: 700; color: var(--good, #10b981);">${serlStats.totalGraduated}</div>
              </div>
            </div>

            <!-- Active Micro-Drill Container or Queue List -->
            <div id="serl-drill-mount" style="flex: 1; display: flex; flex-direction: column;">
              ${this.renderSerlQueueOrDrill(dueErrors)}
            </div>

          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  private renderSerlQueueOrDrill(dueErrors: SerlErrorRecord[]): string {
    if (this.activeDrill && this.activeDrillRecord) {
      return this.renderActiveDrill(this.activeDrill, this.activeDrillRecord);
    }

    if (dueErrors.length === 0) {
      return `
        <div class="serl-empty-state" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 1px dashed var(--border-subtle, rgba(255,255,255,0.12)); border-radius: 10px; padding: 30px 20px;">
          <div style="font-size: var(--font-h1); margin-bottom: 10px;">✨</div>
          <h4 style="margin: 0 0 6px; font-size: var(--font-h4); font-weight: 700;">Rehabilitation Queue Clear</h4>
          <p style="margin: 0 0 16px; font-size: var(--font-body-compact); color: var(--ink-muted, #94a3b8); max-width: 280px;">
            Zero pending error lapses currently due. As you practice drills and mock exams, mistakes will auto-feed here.
          </p>
          <button class="btn-seed-sample-drill" style="background: rgba(56, 189, 248, 0.1); border: 1px solid var(--cyan, #38bdf8); color: var(--cyan, #38bdf8); padding: 8px 16px; border-radius: 8px; font-size: var(--font-body-compact); font-weight: 600; cursor: pointer;">
            + Test Sample Rehabilitation Micro-Drill
          </button>
        </div>
      `;
    }

    return `
      <div class="serl-queue-list" style="display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--ink-muted, #94a3b8); letter-spacing: 0.05em;">ITEMS READY FOR REHABILITATION:</div>
        ${dueErrors.slice(0, 4).map(err => `
          <div class="serl-queue-item" data-id="${err.id}" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-hairline, rgba(255,255,255,0.06)); border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; flex-direction: column; gap: 6px; max-width: 70%;">
              <span style="font-size: var(--font-kicker); font-weight: 700; color: var(--accent-purple, #a855f7);">${err.category} • ${err.sourceModule.toUpperCase()}</span>
              <span style="font-size: var(--font-body-compact); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink-primary, #fff);">"${err.prompt}"</span>
              <span style="font-size: var(--font-kicker); color: var(--critical, #f43f5e);">Flaw: "${err.learnerInput}" &rarr; <span style="color: var(--good, #10b981);">${err.expectedOutput}</span></span>
            </div>
            <button class="btn-launch-drill" data-id="${err.id}" style="background: var(--accent-purple, #a855f7); border: none; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: var(--font-kicker); font-weight: 700; cursor: pointer;">
              REHAB &rarr;
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderActiveDrill(drill: RehabMicroDrill, _record: SerlErrorRecord): string {
    const stageBadge = drill.stage === 'spot'
      ? 'STAGE 1: SPOT THE FLAW'
      : drill.stage === 'repair'
      ? 'STAGE 2: CONTRASTIVE REPAIR'
      : 'STAGE 3: GENERATIVE PRODUCTION';

    return `
      <div class="serl-drill-arena" style="background: rgba(168, 85, 247, 0.05); border: 1px solid var(--accent-purple, #a855f7); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: var(--font-kicker); font-weight: 700; color: var(--accent-purple, #a855f7);">${stageBadge}</span>
          <span id="drill-countdown" style="font-family: 'JetBrains Mono', monospace; font-size: var(--font-h4); font-weight: 700; color: var(--accent-gold, #f59e0b); display: inline-flex; align-items: center; gap: 4px;">
            ${icon('clock', 13)} ${this.drillSecondsRemaining}s
          </span>
        </div>

        <div style="font-size: var(--font-body-compact); font-weight: 600; color: var(--ink-primary, #fff); line-height: 1.4;">
          ${drill.prompt}
        </div>

        ${drill.l1Tip ? `
          <div style="font-size: var(--font-kicker); color: var(--cyan, #38bdf8); background: rgba(56, 189, 248, 0.08); padding: 6px 10px; border-radius: 6px; display: flex; align-items: center; gap: 6px;">
            ${icon('lightbulb', 13)} Contrastive Guide: ${drill.l1Tip}
          </div>
        ` : ''}

        ${drill.stage === 'spot' && drill.options ? `
          <div class="drill-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${drill.options.map(opt => `
              <button class="btn-drill-option" data-opt="${opt}" style="background: var(--bg-card, #1e293b); border: 1px solid var(--border-subtle, rgba(255,255,255,0.12)); color: var(--ink-primary, #fff); padding: 10px; border-radius: 8px; font-size: var(--font-body-compact); font-weight: 600; cursor: pointer; text-align: left;">
                ${opt}
              </button>
            `).join('')}
          </div>
        ` : `
          <div class="drill-input-box" style="display: flex; gap: 8px;">
            <input type="text" id="drill-answer-input" class="drill-input" placeholder="Type canonical structure..." style="flex: 1; background: var(--bg-surface-sunk, #0b1120); border: 1px solid var(--border-subtle, rgba(255,255,255,0.15)); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: var(--font-body-compact);" />
            <button id="btn-submit-drill-input" style="background: var(--accent-purple, #a855f7); border: none; color: #fff; padding: 8px 16px; border-radius: 6px; font-size: var(--font-body-compact); font-weight: 700; cursor: pointer;">
              SUBMIT
            </button>
          </div>
        `}

        <div id="drill-feedback-msg" style="display: none; font-size: var(--font-body-compact); font-weight: 600; padding: 8px 10px; border-radius: 6px;"></div>

        <button class="btn-cancel-drill" style="align-self: flex-start; background: transparent; border: none; color: var(--ink-muted, #94a3b8); font-size: var(--font-kicker); cursor: pointer; padding: 0;">
          Cancel drill
        </button>
      </div>
    `;
  }

  private bindEvents(): void {
    // Seed sample error button
    this.container.querySelector('.btn-seed-sample-drill')?.addEventListener('click', () => {
      SerlGauntletEngine.recordError({
        sourceModule: 'writing',
        category: 'LEXICAL_COLLOCATION',
        cefrLevel: 'C1',
        prompt: 'Institutional investors relied at macroeconomic forecasts before allocating capital.',
        learnerInput: 'relied at',
        expectedOutput: 'relied on',
        explanation: 'Collocational constraint: "rely" strictly requires the preposition "on", never "at".',
        l1VietnameseTip: 'Người học tiếng Việt hay dịch từ "ở/tại" thành "at". Chuẩn xác: rely on / depend on.'
      });
      this.render();
    });

    // Launch drill buttons
    this.container.querySelectorAll('.btn-launch-drill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (!id) return;
        const records = SerlGauntletEngine.getAllRecords();
        const rec = records.find(r => r.id === id);
        if (rec) {
          this.startDrill(rec);
        }
      });
    });

    // Drill Option buttons (Stage 1)
    this.container.querySelectorAll('.btn-drill-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const opt = (e.currentTarget as HTMLElement).dataset.opt || '';
        this.submitDrillAnswer(opt);
      });
    });

    // Drill Text Input (Stage 2 & 3)
    const submitBtn = this.container.querySelector('#btn-submit-drill-input');
    const input = this.container.querySelector('#drill-answer-input') as HTMLInputElement | null;
    submitBtn?.addEventListener('click', () => {
      if (input) this.submitDrillAnswer(input.value);
    });
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitDrillAnswer(input.value);
      }
    });

    // Cancel drill
    this.container.querySelector('.btn-cancel-drill')?.addEventListener('click', () => {
      this.activeDrill = null;
      this.activeDrillRecord = null;
      if (this.drillTimer) clearInterval(this.drillTimer);
      this.render();
    });
  }

  private startDrill(record: SerlErrorRecord): void {
    this.activeDrillRecord = record;
    this.activeDrill = SerlGauntletEngine.generateMicroDrill(record);
    this.drillSecondsRemaining = this.activeDrill.timeLimitSec;

    if (this.drillTimer) clearInterval(this.drillTimer);
    this.drillTimer = setInterval(() => {
      this.drillSecondsRemaining--;
      const timerEl = this.container.querySelector('#drill-countdown');
      if (timerEl) {
        timerEl.innerHTML = `${icon('clock', 13)} ${this.drillSecondsRemaining}s`;
      }
      if (this.drillSecondsRemaining <= 0) {
        clearInterval(this.drillTimer);
        this.submitDrillAnswer(''); // Timeout lapse
      }
    }, 1000);

    const mount = this.container.querySelector('#serl-drill-mount');
    if (mount) {
      mount.innerHTML = this.renderActiveDrill(this.activeDrill, record);
      this.bindEvents();
    }
  }

  private submitDrillAnswer(answer: string): void {
    if (!this.activeDrillRecord) return;
    if (this.drillTimer) clearInterval(this.drillTimer);

    const result = SerlGauntletEngine.evaluateDrillAnswer(this.activeDrillRecord.id, answer);
    const feedbackEl = this.container.querySelector('#drill-feedback-msg') as HTMLElement | null;
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = result.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
      feedbackEl.style.color = result.success ? 'var(--good, #10b981)' : 'var(--critical, #f43f5e)';
      feedbackEl.textContent = result.feedback;
    }

    setTimeout(() => {
      this.activeDrill = null;
      this.activeDrillRecord = null;
      this.render();
    }, 1600);
  }

  private calculateBranchMasteries(): Record<string, number> {
    const masteries: Record<string, number> = {};
    for (const axis of RADAR_AXES) {
      const branchId = axis.id as any;
      let branchSum = 0;
      let count = 0;
      const allNodes = SkillTreeEngine.getAllNodes();
      for (const node of allNodes) {
        if (node.branchId === branchId) {
          branchSum += SkillTreeEngine.getNodeMasteryPct(node.id);
          count++;
        }
      }
      masteries[axis.id] = count > 0 ? Math.round(branchSum / count) : 40;
    }
    return masteries;
  }

  private pctToCefr(pct: number): Cefr {
    if (pct >= 85) return 'C2';
    if (pct >= 70) return 'C1';
    if (pct >= 55) return 'B2';
    if (pct >= 40) return 'B1';
    if (pct >= 25) return 'A2';
    return 'A1';
  }

  // =========================================================================
  // STATIC SVG GENERATORS (NATIVE MATHEMATICAL SVG, ZERO EXTERNAL LIBS)
  // =========================================================================

  /**
   * Generates a 6-Axis CEFR Hexagonal Competency Radar SVG string
   */
  public static generateRadarSvg(masteries: Record<string, number>, size = 320): string {
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.38;
    const tiers = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const totalAxes = RADAR_AXES.length; // 6

    // 1. Concentric reference hexagonal rings
    let ringsHtml = '';
    tiers.forEach((tier, index) => {
      const tierFraction = (index + 1) / tiers.length;
      const r = R * tierFraction;
      const ringPoints = [];
      for (let i = 0; i < totalAxes; i++) {
        const theta = (2 * Math.PI * i) / totalAxes - Math.PI / 2;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        ringPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      ringsHtml += `
        <polygon points="${ringPoints.join(' ')}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" stroke-dasharray="2,3" />
        <text x="${cx + 4}" y="${(cy - r + 3).toFixed(1)}" font-size="8" fill="var(--ink-muted, #94a3b8)" opacity="0.6">${tier}</text>
      `;
    });

    // 2. Axis spokes & labels
    let spokesHtml = '';
    for (let i = 0; i < totalAxes; i++) {
      const theta = (2 * Math.PI * i) / totalAxes - Math.PI / 2;
      const outerX = cx + R * Math.cos(theta);
      const outerY = cy + R * Math.sin(theta);
      const labelX = cx + (R + 18) * Math.cos(theta);
      const labelY = cy + (R + 18) * Math.sin(theta);
      const axis = RADAR_AXES[i];

      spokesHtml += `
        <line x1="${cx}" y1="${cy}" x2="${outerX.toFixed(1)}" y2="${outerY.toFixed(1)}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
        <text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="700" fill="${axis.color}">
          ${axis.label}
        </text>
      `;
    }

    // 3. Current Learner Mastery Polygon
    const masteryPoints: string[] = [];
    const dotsHtml: string[] = [];
    for (let i = 0; i < totalAxes; i++) {
      const theta = (2 * Math.PI * i) / totalAxes - Math.PI / 2;
      const axis = RADAR_AXES[i];
      const val = Math.max(10, Math.min(100, masteries[axis.id] || 40));
      const r = R * (val / 100);
      const px = cx + r * Math.cos(theta);
      const py = cy + r * Math.sin(theta);
      masteryPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      dotsHtml.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="${axis.color}" stroke="#0f172a" stroke-width="1.5" />`);
    }

    // 4. Target Band 7.5 Polygon (Overlay at 75% uniform)
    const targetPoints: string[] = [];
    for (let i = 0; i < totalAxes; i++) {
      const theta = (2 * Math.PI * i) / totalAxes - Math.PI / 2;
      const r = R * 0.75;
      const px = cx + r * Math.cos(theta);
      const py = cy + r * Math.sin(theta);
      targetPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="cefr-radar-svg" role="img" aria-label="CEFR 6-Axis Competency Radar">
        <g class="radar-grid">
          ${ringsHtml}
          ${spokesHtml}
        </g>
        <!-- Target Band 7.5 Reference Polygon -->
        <polygon points="${targetPoints.join(' ')}" fill="none" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5" stroke-dasharray="4,4" />
        <!-- Actual Mastery Polygon -->
        <polygon points="${masteryPoints.join(' ')}" fill="rgba(56, 189, 248, 0.22)" stroke="var(--cyan, #38bdf8)" stroke-width="2.5" />
        <g class="radar-dots">
          ${dotsHtml.join('')}
        </g>
      </svg>
    `;
  }

  /**
   * Generates a 30-Day IELTS Band Trajectory Projection Curve SVG string
   */
  public static generateTrajectorySvg(currentBand: number, targetBand = 7.5, width = 480, height = 180): string {
    const padX = 40;
    const padY = 25;
    const graphW = width - padX * 2;
    const graphH = height - padY * 2;

    const minBand = 4.0;
    const maxBand = 9.0;
    const bandSpan = maxBand - minBand;

    const getY = (b: number) => padY + graphH * (1 - (b - minBand) / bandSpan);
    const getX = (day: number) => padX + (day / 30) * graphW;

    // Build trajectory curve points across 30 days
    const days = [0, 5, 10, 15, 20, 25, 30];
    const curvePoints: { x: number; y: number }[] = [];
    const upperPoints: { x: number; y: number }[] = [];
    const lowerPoints: { x: number; y: number }[] = [];

    days.forEach(d => {
      const progress = d / 30;
      // Exponential growth curve toward target
      const projected = currentBand + (targetBand - currentBand) * Math.sin((progress * Math.PI) / 2);
      curvePoints.push({ x: getX(d), y: getY(projected) });
      upperPoints.push({ x: getX(d), y: getY(Math.min(9.0, projected + 0.5)) });
      lowerPoints.push({ x: getX(d), y: getY(Math.max(4.0, projected - 0.5)) });
    });

    const trajectoryPath = curvePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    // Shaded confidence corridor polygon
    const corridorPoints = [
      ...upperPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      ...lowerPoints.reverse().map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    ].join(' ');

    // Target line Y
    const targetY = getY(targetBand);

    return `
      <svg width="100%" height="auto" viewBox="0 0 ${width} ${height}" class="ielts-trajectory-svg" style="max-width: 100%; display: block;" role="img" aria-label="IELTS Band Trajectory Projection">
        <!-- Horizontal Grid Lines (Bands 5.0 to 9.0) -->
        ${[5.0, 6.0, 7.0, 8.0, 9.0].map(b => `
          <line x1="${padX}" y1="${getY(b).toFixed(1)}" x2="${(width - padX).toFixed(1)}" y2="${getY(b).toFixed(1)}" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
          <text x="${padX - 8}" y="${getY(b).toFixed(1)}" text-anchor="end" dominant-baseline="central" font-size="9" fill="var(--ink-muted, #94a3b8)">${b.toFixed(1)}</text>
        `).join('')}

        <!-- Target Line -->
        <line x1="${padX}" y1="${targetY.toFixed(1)}" x2="${(width - padX).toFixed(1)}" y2="${targetY.toFixed(1)}" stroke="var(--accent-gold, #f59e0b)" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.8" />
        <text x="${width - padX + 4}" y="${targetY.toFixed(1)}" dominant-baseline="central" font-size="9" font-weight="700" fill="var(--accent-gold, #f59e0b)">★ ${targetBand}</text>

        <!-- Confidence Corridor -->
        <polygon points="${corridorPoints}" fill="rgba(56, 189, 248, 0.12)" />

        <!-- Projected Path -->
        <path d="${trajectoryPath}" fill="none" stroke="var(--cyan, #38bdf8)" stroke-width="2.5" stroke-linecap="round" />

        <!-- Current & Target Points -->
        <circle cx="${curvePoints[0].x.toFixed(1)}" cy="${curvePoints[0].y.toFixed(1)}" r="4" fill="var(--cyan, #38bdf8)" stroke="#0f172a" stroke-width="1.5" />
        <circle cx="${curvePoints[curvePoints.length - 1].x.toFixed(1)}" cy="${curvePoints[curvePoints.length - 1].y.toFixed(1)}" r="5" fill="var(--accent-gold, #f59e0b)" stroke="#0f172a" stroke-width="1.5" />
      </svg>
    `;
  }

  /**
   * Psychometrically estimates the overall IELTS Band (0.0 to 9.0) based on branch masteries
   */
  public static estimateIeltsBand(masteries: Record<string, number>): number {
    const vals = Object.values(masteries);
    if (vals.length === 0) return 5.5;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    // Logistic conversion curve from CEFR mastery percentage [0..100] to IELTS Band [4.0..9.0]
    const rawBand = 4.0 + 5.0 / (1.0 + Math.exp(-0.045 * (avg - 50)));
    // Snaps strictly to official IELTS half-band boundaries (e.g. 5.5, 6.0, 6.5)
    return Math.max(3.5, Math.min(9.0, Math.round(rawBand * 2) / 2));
  }
}
