/**
 * CEFR Split-Screen Mediation Workbench & Pragmatics UI (ENG-98)
 * Pillar 08: Council of Europe (2020) Mediation & Online Pragmatics
 * 
 * Features:
 * - 45% Left Source Dossier + 55% Right Active Composition Console
 * - Council of Europe 2020 4-Pillar Rubric: Fidelity, Selection, Reformulation, Register
 * - Real-time Myers token diff comparison against reference benchmark
 * - Compression ratio tracking (Output / Source %) with target word envelopes
 * - Pragmatic Netiquette Linter (catches passive-aggressive / curt tone, rewards downtoners)
 * - 4 Distinct Modes: Text Streamlining, Data & Visuals, Pragmatic Repair, Rapid Blitz
 * - Multi-tier CEFR progression (A2 through C2) with level filtering
 * - Mobile segmented tab switcher (<768px) with zero horizontal overflow
 * - WCAG 2.2 AAA accessibility, >=44px hitboxes, coaxial focus rings
 */

import { Cefr } from '../core/cefr';
import { icon } from '../utils/icons';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { StorageManager } from '../utils/storage';
import { ProgressionEngine } from '../core/progression-engine';
import { ScrollAffordance } from '../core/scroll-affordance';

export type MediationMode = 'TEXT_STREAMLINE' | 'DATA_EXPLAIN' | 'PRAGMATIC_REPAIR' | 'SPEED_BLITZ';

export interface MediationScenario {
  id: string;
  mode: MediationMode;
  level: Cefr;
  title: string;
  recipient: string;
  channel: string;
  goal: string;
  sourceText: string;
  sourceType: 'text' | 'table' | 'chat';
  targetWordRange: [number, number];
  keyAnchors: string[];
  forbiddenVerbatimChunks: string[];
  exemplarModel: string;
  vietnameseExplanation?: string;
  pragmaticRules?: {
    discouragedPhrases: string[];
    recommendedPhrases: string[];
    feedbackTip: string;
  };
}

export interface DiffWordToken {
  type: 'match' | 'insert' | 'delete';
  value: string;
}

export interface MediationEvaluation {
  wordCount: number;
  compressionRatio: number;
  scoreFidelity: number;      // 0 - 100
  scoreSelection: number;     // 0 - 100
  scoreReformulation: number; // 0 - 100
  scoreRegister: number;      // 0 - 100
  compositeScore: number;     // 0 - 100
  matchedAnchors: string[];
  missingAnchors: string[];
  verbatimPenalties: string[];
  pragmaticFlags: Array<{ phrase: string; fix: string; isPositive: boolean }>;
  diffTokens: DiffWordToken[];
  awardedCefr: Cefr;
  isPassed: boolean;
}

// Built-in curated pedagogical scenarios covering A2 to C2 across all 4 modes
export const MEDIATION_SCENARIOS: MediationScenario[] = [
  {
    id: 'med-stream-c1-01',
    mode: 'TEXT_STREAMLINE',
    level: 'C1',
    title: 'Incident Briefing: Distributed Deadlock',
    recipient: 'Chief Operating Officer (Non-Technical Executive)',
    channel: 'Executive Slack Urgent Briefing',
    goal: 'Condense this 240-word technical incident postmortem into a crisp 40-60 word executive brief specifying: root cause, customer blast radius, downtime duration, and permanent prevention.',
    sourceType: 'text',
    sourceText: `At 04:12 UTC, during automated database migration shard rebalancing, the primary consensus coordinator encountered an unforeseen distributed deadlock between transaction isolation locks and distributed WAL replicas. This condition caused worker thread pool exhaustion across all 32 ingest worker nodes in the EU-West cluster. Consequently, 14,200 active enterprise checkout requests received HTTP 504 gateway timeouts between 04:12 and 04:47 UTC (total outage duration: 35 minutes). Our site reliability engineering team manually intervened by isolating the corrupted shard partition and executing a rolling reboot of the consensus layer at 04:41 UTC. Full system telemetry returned to nominal latency by 04:47 UTC. We have verified zero persistent data corruption or financial transaction loss. To permanently avert recursion, engineering has committed a patch enforcing strict monotonic lock ordering and reduced connection timeout thresholds from 30s to 4s.`,
    targetWordRange: [38, 62],
    keyAnchors: ['deadlock', 'database', '35 minutes', 'checkout', 'reboot', 'patch', 'lock ordering', 'zero data loss'],
    forbiddenVerbatimChunks: [
      'during automated database migration shard rebalancing',
      'worker thread pool exhaustion across all 32 ingest worker nodes',
      'received HTTP 504 gateway timeouts',
      'enforcing strict monotonic lock ordering'
    ],
    exemplarModel: `A database locking deadlock caused a 35-minute checkout outage affecting 14,200 customer transactions in EU-West. SRE teams rebooted the cluster to restore full service by 04:47 UTC, with zero data or transaction loss. A software patch fixing lock ordering has been deployed to permanently prevent recurrence.`,
    vietnameseExplanation: 'Bản tóm tắt điều hành (Executive Summary) yêu cầu lược bỏ các thuật ngữ chuyên sâu không cần thiết (WAL replicas, shard rebalancing, thread pool), giữ lại 4 dữ kiện sống còn: Nguyên nhân cốt lõi (database lock), Thời gian & phạm vi gián đoạn (35 phút, 14.200 giao dịch), Tình trạng dữ liệu (0 mất mát), và Biện pháp khắc phục vĩnh viễn (software patch).',
    pragmaticRules: {
      discouragedPhrases: ['obviously', 'as you know', 'devs screwed up', 'terrible failure'],
      recommendedPhrases: ['restored full service', 'permanently prevent', 'zero data loss', 'mitigated'],
      feedbackTip: 'Maintain objective, calm executive tone; focus on impact resolution rather than defensive blame.'
    }
  },
  {
    id: 'med-data-b2-01',
    mode: 'DATA_EXPLAIN',
    level: 'B2',
    title: 'Explaining API Latency Surge to Commercial Team',
    recipient: 'Head of Sales & Account Management',
    channel: 'Client Advisory Email Draft',
    goal: 'Explain the 3-phase latency telemetry data to non-technical sales directors in 45-65 words using precise trend verbs and hedged estimations.',
    sourceType: 'table',
    sourceText: `METRIC LOG: API P99 RESPONSE TIME (Oct 08 - Oct 11)
- Oct 08 (Baseline): Stable at 120ms (Nominal operating range)
- Oct 09 09:00: Sudden spike to 1,840ms (+1430% surge due to third-party payment gateway throttling)
- Oct 10 14:00: Gradual decline to 410ms after routing traffic through secondary fallback rail
- Oct 11 08:00: Complete stabilization at 125ms (All payment rails operational)`,
    targetWordRange: [42, 68],
    keyAnchors: ['latency', 'spike', 'payment gateway', 'fallback', 'stabilized', 'normal', '125ms'],
    forbiddenVerbatimChunks: [
      'Sudden spike to 1,840ms (+1430% surge due to third-party payment gateway throttling)',
      'routing traffic through secondary fallback rail'
    ],
    exemplarModel: `API response times experienced a temporary surge on October 9th, jumping to 1,840ms due to third-party payment gateway throttling. The technical team routed traffic through secondary providers, allowing performance to steadily improve before fully stabilizing at nominal baseline levels (125ms) by October 11th.`,
    vietnameseExplanation: 'Giải thích biểu đồ/dữ liệu số liệu cho đối tác kinh doanh: sử dụng các động từ chỉ xu hướng tự nhiên (experienced a temporary surge, steadily improve, fully stabilizing) và giải thích nguyên nhân khách quan một cách chuyên nghiệp.',
    pragmaticRules: {
      discouragedPhrases: ['huge disaster', 'system crashed completely', 'our fault'],
      recommendedPhrases: ['experienced a temporary surge', 'nominal baseline levels', 'steadily improved'],
      feedbackTip: 'Frame performance data transparently with reassuring trend verbs and clear status confirmation.'
    }
  },
  {
    id: 'med-prag-b1-01',
    mode: 'PRAGMATIC_REPAIR',
    level: 'B1',
    title: 'De-escalating Heated Pull Request Review Comment',
    recipient: 'Senior Colleague / Lead Architect',
    channel: 'GitHub Pull Request Inline Comment',
    goal: 'Transform this blunt, confrontational code review comment into a constructive, polite query (30-50 words) using Brown & Levinson negative face softeners.',
    sourceType: 'chat',
    sourceText: `You completely wrote this wrong. Your query is going to crash the production database under high load because you didn't add any index. Delete this whole function and rewrite it properly like I told you last week.`,
    targetWordRange: [28, 52],
    keyAnchors: ['index', 'query', 'performance', 'consider', 'production', 'load'],
    forbiddenVerbatimChunks: [
      'You completely wrote this wrong',
      'Delete this whole function and rewrite it properly'
    ],
    exemplarModel: `Thanks for working on this! I was wondering if we might need an index here to protect database performance under heavy production load. Could we perhaps consider refactoring this query along the approach we discussed last week?`,
    vietnameseExplanation: 'Chuyển hóa nhận xét gay gắt thành lời góp ý xây dựng theo nguyên tắc Brown & Levinson: Dùng quá khứ phân từ/khiêm tốn (I was wondering if), câu hỏi thay vì mệnh lệnh (Could we perhaps consider), và downtoner làm mềm áp lực (perhaps, might).',
    pragmaticRules: {
      discouragedPhrases: ['wrong', 'delete this', 'as i told you', 'crash'],
      recommendedPhrases: ['i was wondering if', 'could we perhaps', 'consider', 'thanks for'],
      feedbackTip: 'Replace accusations with open questions and modal softeners (might, could, perhaps).'
    }
  },
  {
    id: 'med-stream-a2-01',
    mode: 'TEXT_STREAMLINE',
    level: 'A2',
    title: 'Relaying Schedule & Room Change for Team Member',
    recipient: 'Elena (Colleague who is traveling)',
    channel: 'WhatsApp Quick Message',
    goal: 'Relay the essential meeting details (new room, new time, and what to bring) from the notice below in 20-35 words.',
    sourceType: 'text',
    sourceText: `ANNOUNCEMENT: All staff attending the quarterly product demonstration please take notice. Due to air conditioning maintenance in Conference Hall B, today's session scheduled for 2:00 PM has been moved to Conference Room 4A on the fourth floor. The session will now begin at 2:30 PM. Everyone must bring their company laptops and badge passes for security entrance. Lunch sandwiches will be served outside at 1:45 PM.`,
    targetWordRange: [18, 38],
    keyAnchors: ['Room 4A', '2:30', 'laptop', 'badge'],
    forbiddenVerbatimChunks: [
      'Due to air conditioning maintenance in Conference Hall B',
      'today\'s session scheduled for 2:00 PM has been moved to Conference Room 4A'
    ],
    exemplarModel: `Hi Elena, today's product demo has moved to Room 4A at 2:30 PM. Please remember to bring your company laptop and security badge!`,
    vietnameseExplanation: 'Truyền đạt thông tin cụ thể (Relaying specific info): Lọc đúng 3 yếu tố Elena cần (Phòng mới 4A, Giờ mới 2:30 PM, Đồ cần mang: laptop + thẻ nhân viên). Bỏ qua chi tiết bảo trì máy lạnh hay tiệc bánh sandwich.',
    pragmaticRules: {
      discouragedPhrases: ['you must read the whole memo', 'maintenance'],
      recommendedPhrases: ['moved to', 'at 2:30', 'remember to bring'],
      feedbackTip: 'Keep it warm and direct; deliver time, room, and equipment clearly.'
    }
  },
  {
    id: 'med-blitz-c2-01',
    mode: 'SPEED_BLITZ',
    level: 'C2',
    title: 'Diplomatic Netiquette: Passive-Aggressive Email Repair',
    recipient: 'Disgruntled Enterprise Client Director',
    channel: 'Client Escalation Email',
    goal: 'Rapidly rewrite this passive-aggressive client response into a polished, tactful de-escalation message in 35-55 words.',
    sourceType: 'chat',
    sourceText: `Per my previous email which you clearly didn't read, we already explained that this feature isn't in your tier. If you actually checked page 12 of your contract you would see this. Send the signed change order ASAP if you want us to do anything.`,
    targetWordRange: [30, 56],
    keyAnchors: ['recap', 'tier', 'contract', 'change order', 'pleased', 'discuss', 'scope'],
    forbiddenVerbatimChunks: [
      'Per my previous email which you clearly didn\'t read',
      'If you actually checked page 12 of your contract',
      'Send the signed change order ASAP'
    ],
    exemplarModel: `Just to follow up on our previous correspondence, this specific capability falls outside the current contract tier outlined in Section 12. We would be delighted to expand your scope via an addendum; please let us know if you would like to discuss next steps.`,
    vietnameseExplanation: 'Chữa lành các cụm từ thụ động gây hấn (passive-aggressive): Thay "Per my last email" bằng "Just to follow up", bỏ "you clearly didn\'t read", thay "ASAP" bằng lời mời thảo luận nhã nhặn.',
    pragmaticRules: {
      discouragedPhrases: ['per my previous email', 'clearly didn\'t read', 'actually checked', 'asap'],
      recommendedPhrases: ['just to follow up', 'falls outside', 'delighted to', 'please let us know'],
      feedbackTip: 'Eliminate all patronizing sarcasm; protect client face with polite business framing.'
    }
  }
];

export class MediationDossier {
  private container: HTMLElement;
  private currentMode: MediationMode = 'TEXT_STREAMLINE';
  public currentLevel: Cefr = 'C1';
  private currentScenarioIndex: number = 0;
  private currentScenarios: MediationScenario[] = [];

  private activeMobileTab: 'source' | 'workbench' = 'workbench';
  public lastEvaluation: MediationEvaluation | null = null;
  public isEvaluating: boolean = false;

  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'mediation-dossier-shell';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-roledescription', 'mediation-workbench');
    this.container.setAttribute('aria-label', 'CEFR Split-Screen Mediation Workbench');

    this.initScenarios();
  }

  private initScenarios(): void {
    const learnerLevel = StorageManager.getLearnerLevel();
    this.currentLevel = learnerLevel || 'C1';
    this.filterScenarios();
  }

  private filterScenarios(): void {
    // Filter by mode and optionally level
    let filtered = MEDIATION_SCENARIOS.filter(s => s.mode === this.currentMode);
    if (filtered.length === 0) {
      filtered = MEDIATION_SCENARIOS;
    }
    this.currentScenarios = filtered;
    this.currentScenarioIndex = 0;
    this.lastEvaluation = null;
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';
    const scenario = this.getCurrentScenario();
    if (!scenario) {
      this.container.innerHTML = `<div class="dossier-empty-state">No mediation scenarios found for current filter.</div>`;
      return this.container;
    }

    this.container.innerHTML = `
      <!-- Top Control Bar (Mode Tabs & Level Filter) -->
      <header class="mediation-control-bar" role="toolbar" aria-label="Mediation Navigation Toolbar">
        <div class="control-row">
          <div class="mediation-category-selector" role="tablist" aria-label="Mediation Modes">
            <button class="hud-btn mode-tab ${this.currentMode === 'TEXT_STREAMLINE' ? 'active' : ''}" data-mode="TEXT_STREAMLINE" role="tab" aria-selected="${this.currentMode === 'TEXT_STREAMLINE'}">
              ${icon('book', 12)} <span class="tab-label">Text Streamlining</span>
            </button>
            <button class="hud-btn mode-tab ${this.currentMode === 'DATA_EXPLAIN' ? 'active' : ''}" data-mode="DATA_EXPLAIN" role="tab" aria-selected="${this.currentMode === 'DATA_EXPLAIN'}">
              ${icon('target', 12)} <span class="tab-label">Data &amp; Visuals</span>
            </button>
            <button class="hud-btn mode-tab ${this.currentMode === 'PRAGMATIC_REPAIR' ? 'active' : ''}" data-mode="PRAGMATIC_REPAIR" role="tab" aria-selected="${this.currentMode === 'PRAGMATIC_REPAIR'}">
              ${icon('zap', 12)} <span class="tab-label">Pragmatic Netiquette</span>
            </button>
            <button class="hud-btn mode-tab ${this.currentMode === 'SPEED_BLITZ' ? 'active' : ''}" data-mode="SPEED_BLITZ" role="tab" aria-selected="${this.currentMode === 'SPEED_BLITZ'}">
              ${icon('clock', 12)} <span class="tab-label">Rapid Blitz</span>
            </button>
          </div>

          <div class="mediation-pagination-cluster">
            <button class="hud-btn btn-prev-scenario" title="Previous Scenario" aria-label="Previous Scenario" ${this.currentScenarioIndex === 0 ? 'disabled' : ''}>
              ${icon('arrowLeft', 12)}
            </button>
            <span class="mediation-page-indicator">
              SCENARIO <strong>${this.currentScenarioIndex + 1}</strong> / ${this.currentScenarios.length}
            </span>
            <button class="hud-btn btn-next-scenario" title="Next Scenario" aria-label="Next Scenario" ${this.currentScenarioIndex >= this.currentScenarios.length - 1 ? 'disabled' : ''}>
              ${icon('arrowRight', 12)}
            </button>
          </div>
        </div>

        <!-- Mobile Segmented Tab Selector (<768px viewport) -->
        <div class="mediation-mobile-toggle-bar" role="tablist" aria-label="Mobile Workbench Pane View">
          <button class="mobile-toggle-btn ${this.activeMobileTab === 'source' ? 'active' : ''}" data-pane="source" role="tab" aria-selected="${this.activeMobileTab === 'source'}">
            ${icon('book', 12)} <span>1. Source Document</span>
          </button>
          <button class="mobile-toggle-btn ${this.activeMobileTab === 'workbench' ? 'active' : ''}" data-pane="workbench" role="tab" aria-selected="${this.activeMobileTab === 'workbench'}">
            ${icon('zap', 12)} <span>2. Composition</span>
          </button>
        </div>
      </header>

      <!-- Main Split-Screen Grid Workspace (45% Left / 55% Right) -->
      <main class="mediation-split-grid ${this.activeMobileTab === 'source' ? 'show-source-mobile' : 'show-workbench-mobile'}">
        
        <!-- Left Pane: Authentic Source Dossier (45%) -->
        <section class="mediation-source-panel" aria-label="Source Document Dossier">
          <div class="panel-header-strip">
            <div class="badge-cluster">
              <span class="hud-status-badge badge-tier">${scenario.level}</span>
              <span class="hud-status-badge badge-recipient" title="Target Recipient Persona">👤 ${scenario.recipient}</span>
              <span class="hud-status-badge badge-channel" title="Target Communication Channel">💬 ${scenario.channel}</span>
            </div>
            <span class="target-envelope-pill">TARGET: ${scenario.targetWordRange[0]}-${scenario.targetWordRange[1]} WORDS</span>
          </div>

          <div class="panel-goal-banner">
            <span class="goal-icon">${icon('target', 14)}</span>
            <span class="goal-text"><strong>GOAL:</strong> ${scenario.goal}</span>
          </div>

          <div class="source-document-scroll" tabindex="0" role="region" aria-label="Authentic Source Content">
            <div class="source-document-header">
              <span class="doc-title">${scenario.title}</span>
              <span class="doc-meta">[Source Length: ${this.countWords(scenario.sourceText)} words]</span>
            </div>
            <div class="source-document-body ${scenario.sourceType}">
              ${this.formatSourceText(scenario.sourceText, scenario.sourceType)}
            </div>
          </div>

          <div class="source-telemetry-footer">
            <div class="anchor-tags-wrapper">
              <span class="anchor-label">KEY CONCEPTS TO MEDIATE:</span>
              <div class="anchor-chips-row">
                ${scenario.keyAnchors.map(a => `<span class="anchor-chip" title="Key concept">${a}</span>`).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- Right Pane: Active Mediation Composition Console (55%) -->
        <section class="mediation-workbench-panel" aria-label="Active Mediation Console">
          <div class="workbench-header-strip">
            <div class="workbench-title-group">
              <span class="telemetry-label">Active Mediation Composition</span>
              <span class="telemetry-sub">Synthesize and adapt for recipient without copying verbatim text</span>
            </div>
            <div class="word-count-badge" id="live-word-count-badge">
              0 / ${scenario.targetWordRange[1]} WORDS
            </div>
          </div>

          <div class="workbench-input-wrapper">
            <textarea 
              id="mediation-textarea" 
              class="mediation-textarea" 
              placeholder="Draft your mediated communication here${matchMedia('(pointer: coarse)').matches ? '' : ' (Press Ctrl+Enter to evaluate)'}..."
              aria-label="Mediation Draft Input"
              spellcheck="false"
            ></textarea>
          </div>

          <div class="workbench-actions-bar">
            <button class="hud-btn btn-evaluate-resolution" id="btn-evaluate" title="Evaluate Resolution against CEFR Mediation Rubric (Ctrl+Enter)">
              ${icon('zap', 14)} <span class="btn-text">Evaluate Response <span class="kbd-badge kbd-only">[Ctrl+Enter]</span></span>
            </button>
            <button class="hud-btn btn-toggle-exemplar" id="btn-exemplar" title="Inspect Exemplar Benchmark">
              ${icon('eye', 14)} <span class="btn-text">Model Benchmark</span>
            </button>
            <button class="hud-btn btn-reset-draft" id="btn-reset" title="Clear Draft">
              ${icon('rotateCcw', 14)} <span class="btn-text">Clear</span>
            </button>
          </div>

          <!-- Live Diff & 4-Pillar Evaluation Console -->
          <div class="mediation-feedback-console" id="mediation-feedback-console" aria-live="polite" tabindex="0">
            ${this.renderInitialFeedbackPlaceholder()}
          </div>
        </section>

      </main>
    `;

    this.bindEvents();
    return this.container;
  }

  private getCurrentScenario(): MediationScenario | null {
    if (this.currentScenarios.length === 0) return null;
    return this.currentScenarios[this.currentScenarioIndex] || this.currentScenarios[0];
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private formatSourceText(text: string, type: 'text' | 'table' | 'chat'): string {
    if (type === 'table') {
      const lines = text.split('\n');
      return `<pre class="preformatted-source-table">${lines.map(l => this.escapeHtml(l)).join('\n')}</pre>`;
    }
    if (type === 'chat') {
      return `<blockquote class="chat-transcript-quote">${this.escapeHtml(text)}</blockquote>`;
    }
    return `<p class="source-paragraph">${this.escapeHtml(text)}</p>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private renderInitialFeedbackPlaceholder(): string {
    return `
      <div class="feedback-placeholder-state">
        <div class="placeholder-icon">${icon('target', 24)}</div>
        <div class="placeholder-title">Awaiting Evaluation</div>
        <p class="placeholder-text">
          Compose your synthesized resolution above and <span class="desktop-only">press <kbd>Ctrl+Enter</kbd> or </span>click <strong>Evaluate Response</strong> to inspect rubric feedback.
        </p>
      </div>
    `;
  }

  private bindEvents(): void {
    // Mode tabs
    const modeTabs = this.container.querySelectorAll('.mediation-category-selector .mode-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        const mode = tab.getAttribute('data-mode') as MediationMode;
        if (mode && mode !== this.currentMode) {
          this.currentMode = mode;
          this.filterScenarios();
          this.render();
        }
      });
    });

    const modeTrack = this.container.querySelector('.mediation-category-selector') as HTMLElement | null;
    if (modeTrack) {
      ScrollAffordance.attach(modeTrack);
    }

    // Mobile pane toggle buttons
    const mobileBtns = this.container.querySelectorAll('.mobile-toggle-btn');
    mobileBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        const pane = btn.getAttribute('data-pane') as 'source' | 'workbench';
        if (pane) {
          this.activeMobileTab = pane;
          mobileBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-pane') === pane));
          const grid = this.container.querySelector('.mediation-split-grid');
          if (grid) {
            grid.classList.toggle('show-source-mobile', pane === 'source');
            grid.classList.toggle('show-workbench-mobile', pane === 'workbench');
          }
        }
      });
    });

    // Pagination
    this.container.querySelector('.btn-prev-scenario')?.addEventListener('click', () => {
      if (this.currentScenarioIndex > 0) {
        AudioSynthesizer.play('click');
        this.currentScenarioIndex--;
        this.lastEvaluation = null;
        this.render();
      }
    });

    this.container.querySelector('.btn-next-scenario')?.addEventListener('click', () => {
      if (this.currentScenarioIndex < this.currentScenarios.length - 1) {
        AudioSynthesizer.play('click');
        this.currentScenarioIndex++;
        this.lastEvaluation = null;
        this.render();
      }
    });

    // Textarea live word counter & keystrokes
    const textarea = this.container.querySelector('#mediation-textarea') as HTMLTextAreaElement | null;
    const wordBadge = this.container.querySelector('#live-word-count-badge');
    let lastKeystrokeTime = 0;

    textarea?.addEventListener('input', () => {
      const text = textarea.value;
      const count = this.countWords(text);
      const scenario = this.getCurrentScenario();
      if (wordBadge && scenario) {
        wordBadge.textContent = `${count} / ${scenario.targetWordRange[1]} WORDS`;
        const [minW, maxW] = scenario.targetWordRange;
        if (count >= minW && count <= maxW) {
          wordBadge.className = 'word-count-badge in-range';
        } else if (count > maxW) {
          wordBadge.className = 'word-count-badge over-range';
        } else {
          wordBadge.className = 'word-count-badge';
        }
      }

      // Keystroke acoustics
      const now = performance.now();
      if (now - lastKeystrokeTime >= 40) {
        lastKeystrokeTime = now;
        AudioSynthesizer.play('keystroke');
      }
    });

    // Keyboard shortcut inside textarea: Ctrl+Enter / Cmd+Enter evaluates
    textarea?.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.evaluateDraft();
      }
    });

    // Evaluate button
    this.container.querySelector('#btn-evaluate')?.addEventListener('click', () => {
      this.evaluateDraft();
    });

    // Exemplar button
    this.container.querySelector('#btn-exemplar')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.toggleExemplarModal();
    });

    // Reset button
    this.container.querySelector('#btn-reset')?.addEventListener('click', () => {
      if (textarea) {
        AudioSynthesizer.play('click');
        textarea.value = '';
        if (wordBadge) wordBadge.textContent = `0 / ${this.getCurrentScenario()?.targetWordRange[1] || 0} WORDS`;
        const feedbackEl = this.container.querySelector('#mediation-feedback-console');
        if (feedbackEl) feedbackEl.innerHTML = this.renderInitialFeedbackPlaceholder();
        textarea.focus();
      }
    });
  }

  public handleGlobalKey(key: string): boolean {
    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
    if (isInput) return false;

    if (key === 'ArrowLeft' && this.currentScenarioIndex > 0) {
      AudioSynthesizer.play('click');
      this.currentScenarioIndex--;
      this.render();
      return true;
    }
    if (key === 'ArrowRight' && this.currentScenarioIndex < this.currentScenarios.length - 1) {
      AudioSynthesizer.play('click');
      this.currentScenarioIndex++;
      this.render();
      return true;
    }
    return false;
  }

  /**
   * Evaluates draft according to Council of Europe 2020 4-Pillar Rubric
   */
  public evaluateDraft(): MediationEvaluation | null {
    const textarea = this.container.querySelector('#mediation-textarea') as HTMLTextAreaElement | null;
    const scenario = this.getCurrentScenario();
    if (!textarea || !scenario) return null;

    const userText = textarea.value.trim();
    if (userText.length === 0) {
      AudioSynthesizer.play('alarm');
      const feedbackEl = this.container.querySelector('#mediation-feedback-console');
      if (feedbackEl) {
        feedbackEl.innerHTML = `
          <div class="feedback-error-alert" role="alert">
            ${icon('alarm', 16)} Please draft your mediated resolution before evaluating.
          </div>
        `;
      }
      textarea.focus();
      return null;
    }

    const evaluation = this.computeEvaluation(userText, scenario);
    this.lastEvaluation = evaluation;
    this.renderEvaluationFeedback(evaluation, scenario);

    if (evaluation.isPassed) {
      AudioSynthesizer.play('absorb');
      ProgressionEngine.addXP(45);
      ProgressionEngine.recordActivity('studio', 1);
      if (this.onBatchComplete) {
        this.onBatchComplete();
      }
    } else {
      AudioSynthesizer.play('alarm');
    }

    return evaluation;
  }

  public computeEvaluation(userText: string, scenario: MediationScenario): MediationEvaluation {
    const userWords = userText.trim().split(/\s+/).filter(Boolean);
    const wordCount = userWords.length;
    const sourceWordCount = this.countWords(scenario.sourceText);
    const compressionRatio = Math.round((wordCount / (sourceWordCount || 1)) * 100);

    // 1. Fidelity Score: Key concept anchors identified
    const lowerUserText = userText.toLowerCase();
    const matchedAnchors: string[] = [];
    const missingAnchors: string[] = [];

    for (const anchor of scenario.keyAnchors) {
      const lowerAnchor = anchor.toLowerCase();
      if (lowerUserText.includes(lowerAnchor) || this.fuzzyIncludes(lowerUserText, lowerAnchor)) {
        matchedAnchors.push(anchor);
      } else {
        missingAnchors.push(anchor);
      }
    }
    const scoreFidelity = Math.round((matchedAnchors.length / (scenario.keyAnchors.length || 1)) * 100);

    // 2. Selection Score: Word count envelope adherence
    const [minWords, maxWords] = scenario.targetWordRange;
    let scoreSelection = 100;
    if (wordCount < minWords) {
      const delta = minWords - wordCount;
      scoreSelection = Math.max(10, Math.round(100 - (delta / minWords) * 70));
    } else if (wordCount > maxWords) {
      const delta = wordCount - maxWords;
      scoreSelection = Math.max(10, Math.round(100 - (delta / maxWords) * 70));
    }

    // 3. Reformulation Score: Penalize verbatim copying of source chunks
    const verbatimPenalties: string[] = [];
    let scoreReformulation = 100;
    for (const forbidden of scenario.forbiddenVerbatimChunks) {
      if (lowerUserText.includes(forbidden.toLowerCase())) {
        verbatimPenalties.push(forbidden);
        scoreReformulation -= 25;
      }
    }
    scoreReformulation = Math.max(0, Math.min(100, scoreReformulation));

    // 4. Register & Pragmatics Score: Politeness markers & netiquette linter
    const pragmaticFlags: Array<{ phrase: string; fix: string; isPositive: boolean }> = [];
    let scoreRegister = 80;

    // Discouraged toxic phrases
    const toxicPhrases = [
      { bad: 'per my last email', fix: 'just to follow up on our previous note' },
      { bad: 'per my previous email', fix: 'just to recap our Monday alignment' },
      { bad: 'as stated before', fix: 'to ensure we remain fully aligned' },
      { bad: 'obviously', fix: 'it is worth highlighting' },
      { bad: 'you forgot', fix: 'we may also want to ensure' },
      { bad: 'asap', fix: 'at your earliest convenience / by [time]' },
      { bad: 'you completely wrote this wrong', fix: 'could we perhaps consider refactoring this' },
      { bad: 'delete this whole', fix: 'it might be worth revisiting' }
    ];

    for (const item of toxicPhrases) {
      if (lowerUserText.includes(item.bad)) {
        scoreRegister -= 20;
        pragmaticFlags.push({ phrase: item.bad, fix: item.fix, isPositive: false });
      }
    }

    // Recommended politeness softeners (Brown & Levinson)
    const softeners = [
      'could we', 'would it be', 'i was wondering', 'perhaps', 'just wanted to',
      'appreciate', 'thank you', 'please let us know', 'to follow up', 'might consider'
    ];
    let softenerCount = 0;
    for (const s of softeners) {
      if (lowerUserText.includes(s)) {
        softenerCount++;
      }
    }
    if (softenerCount >= 2) {
      scoreRegister += 20;
    } else if (softenerCount === 1) {
      scoreRegister += 10;
    }
    scoreRegister = Math.max(0, Math.min(100, scoreRegister));

    // Composite Weighted Score
    const compositeScore = Math.round(
      scoreFidelity * 0.35 +
      scoreSelection * 0.25 +
      scoreReformulation * 0.20 +
      scoreRegister * 0.20
    );

    // CEFR Band Award
    let awardedCefr: Cefr = 'A2';
    if (compositeScore >= 90) awardedCefr = 'C2';
    else if (compositeScore >= 75) awardedCefr = 'C1';
    else if (compositeScore >= 60) awardedCefr = 'B2';
    else if (compositeScore >= 45) awardedCefr = 'B1';

    const isPassed = compositeScore >= 70 && verbatimPenalties.length === 0;

    // Token-level Myers Diff against Exemplar Model
    const diffTokens = this.computeWordDiff(scenario.exemplarModel, userText);

    return {
      wordCount,
      compressionRatio,
      scoreFidelity,
      scoreSelection,
      scoreReformulation,
      scoreRegister,
      compositeScore,
      matchedAnchors,
      missingAnchors,
      verbatimPenalties,
      pragmaticFlags,
      diffTokens,
      awardedCefr,
      isPassed
    };
  }

  private fuzzyIncludes(text: string, anchor: string): boolean {
    const words = anchor.split(' ');
    return words.every(w => text.includes(w));
  }

  /**
   * Myers-style Word-Level Diff Tokenizer
   */
  public computeWordDiff(target: string, candidate: string): DiffWordToken[] {
    const tWords = target.trim().split(/\s+/).filter(Boolean);
    const cWords = candidate.trim().split(/\s+/).filter(Boolean);
    const m = tWords.length;
    const n = cWords.length;

    // LCS Dynamic Programming Table
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (tWords[i - 1].toLowerCase() === cWords[j - 1].toLowerCase()) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to reconstruct diff tokens
    const tokens: DiffWordToken[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && tWords[i - 1].toLowerCase() === cWords[j - 1].toLowerCase()) {
        tokens.unshift({ type: 'match', value: cWords[j - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        tokens.unshift({ type: 'insert', value: cWords[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        tokens.unshift({ type: 'delete', value: tWords[i - 1] });
        i--;
      }
    }

    return tokens;
  }

  private renderEvaluationFeedback(evalResult: MediationEvaluation, scenario: MediationScenario): void {
    const feedbackEl = this.container.querySelector('#mediation-feedback-console');
    if (!feedbackEl) return;

    const diffHtml = evalResult.diffTokens.map(tok => {
      const escaped = this.escapeHtml(tok.value);
      if (tok.type === 'match') {
        return `<span class="diff-word-match">${escaped}</span>`;
      } else if (tok.type === 'insert') {
        return `<span class="diff-word-insert" title="Your unique phrasing / synthesis">${escaped}</span>`;
      } else {
        return `<span class="diff-word-delete" title="Omitted benchmark element">${escaped}</span>`;
      }
    }).join(' ');

    feedbackEl.innerHTML = `
      <div class="evaluation-result-card ${evalResult.isPassed ? 'status-passed' : 'status-revision'}">
        
        <!-- Scorecard Header -->
        <div class="evaluation-header-bar">
          <div class="verdict-group">
            <span class="verdict-icon">${evalResult.isPassed ? '✓' : '⚠'}</span>
            <span class="verdict-title">${evalResult.isPassed ? 'Mediation Criteria Met' : 'Revision Recommended'}</span>
            <span class="hud-status-badge cefr-award-badge">${evalResult.awardedCefr} BAND</span>
          </div>
          <div class="composite-score-box">
            <span class="score-number">${evalResult.compositeScore}</span>
            <span class="score-denom">/ 100</span>
          </div>
        </div>

        <!-- 4-Pillar CEFR Rubric Grid -->
        <div class="rubric-metrics-grid">
          <div class="metric-card ${evalResult.scoreFidelity >= 75 ? 'metric-good' : 'metric-warn'}">
            <span class="metric-label">1. FIDELITY (F)</span>
            <span class="metric-val">${evalResult.scoreFidelity}%</span>
            <span class="metric-desc">${evalResult.matchedAnchors.length}/${scenario.keyAnchors.length} key concepts</span>
          </div>
          <div class="metric-card ${evalResult.scoreSelection >= 75 ? 'metric-good' : 'metric-warn'}">
            <span class="metric-label">2. SELECTION (S)</span>
            <span class="metric-val">${evalResult.scoreSelection}%</span>
            <span class="metric-desc">${evalResult.wordCount} words (${evalResult.compressionRatio}% size)</span>
          </div>
          <div class="metric-card ${evalResult.scoreReformulation >= 75 ? 'metric-good' : 'metric-warn'}">
            <span class="metric-label">3. REFORMULATION (R)</span>
            <span class="metric-val">${evalResult.scoreReformulation}%</span>
            <span class="metric-desc">${evalResult.verbatimPenalties.length === 0 ? 'Zero verbatim leaks' : `${evalResult.verbatimPenalties.length} leaks`}</span>
          </div>
          <div class="metric-card ${evalResult.scoreRegister >= 75 ? 'metric-good' : 'metric-warn'}">
            <span class="metric-label">4. REGISTER (A)</span>
            <span class="metric-val">${evalResult.scoreRegister}%</span>
            <span class="metric-desc">Tone &amp; Netiquette</span>
          </div>
        </div>

        <!-- Pragmatic Linter Warning / Praise -->
        ${evalResult.pragmaticFlags.length > 0 ? `
          <div class="pragmatic-linter-alert">
            <span class="alert-icon">${icon('zap', 14)}</span>
            <div class="alert-content">
              <strong>Pragmatic Tone Flags Detected:</strong>
              <ul>
                ${evalResult.pragmaticFlags.map(f => `
                  <li>Phrasing <code>"${this.escapeHtml(f.phrase)}"</code> reads harsh/curt. Suggestion: <em>"${this.escapeHtml(f.fix)}"</em></li>
                `).join('')}
              </ul>
            </div>
          </div>
        ` : ''}

        <!-- Verbatim Warning -->
        ${evalResult.verbatimPenalties.length > 0 ? `
          <div class="verbatim-linter-alert">
            <span class="alert-icon">⚠</span>
            <div class="alert-content">
              <strong>Verbatim Copying Detected:</strong> Rephrase in your own words instead of copying source phrases:
              <code>${this.escapeHtml(evalResult.verbatimPenalties.join(', '))}</code>
            </div>
          </div>
        ` : ''}

        <!-- Myers Word-Level Diff Preview -->
        <div class="myers-diff-preview-box">
          <div class="diff-header-row">
            <span class="telemetry-label">[ MYERS WORD-LEVEL SEMANTIC DIFF (VS BENCHMARK) ]</span>
            <div class="diff-legend">
              <span class="legend-chip legend-match">Match</span>
              <span class="legend-chip legend-insert">Your Synthesis</span>
              <span class="legend-chip legend-delete">Benchmark Element</span>
            </div>
          </div>
          <div class="diff-stream-container">
            ${diffHtml}
          </div>
        </div>

      </div>
    `;
  }

  private toggleExemplarModal(): void {
    const scenario = this.getCurrentScenario();
    if (!scenario) return;

    const modal = document.createElement('div');
    modal.className = 'completion-modal-overlay interactive';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Exemplar Mediation Benchmark');

    modal.innerHTML = `
      <div class="completion-receipt-card exemplar-modal-card">
        <div class="telemetry-label" style="margin-bottom: 8px;">[EXEMPLAR MEDIATION BENCHMARK // ${scenario.level}]</div>
        <h3 style="font-family: var(--font-mono); font-size: var(--font-body); font-weight: 700; margin-bottom: 12px; color: var(--accent-gold);">
          ${scenario.title}
        </h3>
        
        <div class="exemplar-text-box" style="background: var(--bg-surface-sunk); padding: 14px; border: 1px solid var(--border-subtle); border-radius: 6px; font-size: var(--font-h4); line-height: 1.6; margin-bottom: 16px; color: var(--ink-primary);">
          "${this.escapeHtml(scenario.exemplarModel)}"
        </div>

        ${scenario.vietnameseExplanation ? `
          <div class="vietnamese-pedagogy-box" style="background: var(--bg-surface); padding: 12px; border-left: 3px solid var(--accent-gold); margin-bottom: 16px; font-size: var(--font-body-compact); line-height: 1.5; color: var(--ink-secondary);">
            <strong>Phân tích sư phạm (CEFR Companion 2020):</strong><br>
            ${this.escapeHtml(scenario.vietnameseExplanation)}
          </div>
        ` : ''}

        <button class="hud-btn btn-close-modal" style="width: 100%; justify-content: center; padding: 10px; font-weight: 700;">
          [ CLOSE BENCHMARK ]
        </button>
      </div>
    `;

    modal.querySelector('.btn-close-modal')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      modal.remove();
    });

    document.body.appendChild(modal);
    (modal.querySelector('.btn-close-modal') as HTMLElement)?.focus();
  }

  public teardown(): void {
    this.lastEvaluation = null;
    document.querySelectorAll('.exemplar-modal-card').forEach(c => c.closest('.completion-modal-overlay')?.remove());
  }
}
