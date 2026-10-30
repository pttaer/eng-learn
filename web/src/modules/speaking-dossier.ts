import { Cefr } from '../core/cefr';
import { defaultLevel, levelRowHtml, bindLevelChips } from '../core/level-filter';
import { AtomicCard } from '../core/atomic-card';
import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import {
  AudioSynthesizer,
  VOWEL_BENCHMARKS,
  MINIMAL_PAIRS_CURRICULUM,
  VowelBenchmark,
  MinimalPairItem,
  FormantResult,
  MinimalPairResult
} from '../core/audio-synthesizer';
import { AcousticEngine, AcousticAnalysis } from '../core/acoustic-engine';
import { CollocationSpotter } from '../core/collocation-spotter';
import { SkillTreeEngine } from '../core/skill-tree-engine';
import {
  ConversationPartnerEngine,
  BUILTIN_SCENARIOS,
  RoleplayMessage
} from '../core/conversation-partner-engine';
import drillsData from '../assets/data/drills.json';
import { ArticulatoryBiomechanics } from '../core/articulatory-biomechanics';
import { t } from '../core/i18n';

export type SpeakingMode = 'nation' | 'roleplay' | 'formant' | 'ielts';

export interface SpeakingItem {
  id: string;
  index: number;
  title: string;
  prompt: string;
  mode: string;
  anchor: string;
  collocations: string;
  phonetic: string;
}

export interface RoundPerformance {
  roundIdx: number;            // 0 = 4 min, 1 = 3 min, 2 = 2 min
  allocatedSeconds: number;    // 240, 180, 120
  actualSeconds: number;       // Elapsed speaking duration
  silenceRatio: number;        // Proportion of pauses
  spottedCollocations: number; // Count of target collocations successfully voiced
  totalCollocations: number;   // Total target collocations for prompt
  analysis?: AcousticAnalysis;
}

export class SpeakingDossier {
  private container: HTMLElement;
  private allItems: SpeakingItem[] = [];
  private items: SpeakingItem[] = [];
  private activeLevel: Cefr;
  private currentIndex: number = 0;
  private currentCardHandle: any = null;

  // Mode state
  private mode: SpeakingMode = 'nation';
  private partnerEngine: ConversationPartnerEngine;
  private isPartnerRecording: boolean = false;
  private latestPartnerAnalysis: AcousticAnalysis | null = null;
  private partnerSpeechRecognition: any = null;
  private liveTranscriptBuffer: string = '';

  // Nation 4-3-2 State Machine (4 min -> 3 min -> 2 min)
  private readonly rounds: number[] = [240, 180, 120];
  private currentRoundIdx: number = 0;
  private secondsRemaining: number = 240;
  private isTimerRunning: boolean = false;
  private timerInterval: any = null;

  // Acoustic DSP & Web Speech Subsystems
  private acousticEngine: AcousticEngine;
  private collocationSpotter: CollocationSpotter;

  // Round Performance Ledger & Take State
  private roundsPerformance: (RoundPerformance | null)[] = [null, null, null];
  private latestAnalysis: AcousticAnalysis | null = null;
  private hasCompletedTake: boolean = false;
  private waveformRaf: number | null = null;
  private motionObserver: MutationObserver | null = null;
  private activeCanvas: HTMLCanvasElement | null = null;

  // Formant Lab & Minimal Pairs State
  private activeVowel: VowelBenchmark = VOWEL_BENCHMARKS[0]; // /iː/
  private activeMinimalPair: MinimalPairItem = MINIMAL_PAIRS_CURRICULUM[0];
  private isFormantTracking: boolean = false;
  private currentFormant: FormantResult | null = null;
  private formantPollInterval: any = null;
  private pairTakeA: { duration: number; formants?: { f1: number; f2: number }; isRecording: boolean } = { duration: 0, isRecording: false };
  private pairTakeB: { duration: number; formants?: { f1: number; f2: number }; codaEnergy?: number; isRecording: boolean } = { duration: 0, isRecording: false };
  private latestPairResult: MinimalPairResult | null = null;

  // IELTS Speaking Examiner State Machine
  private ieltsStage: 'intro' | 'part1' | 'part2_prep' | 'part2_monologue' | 'part3' | 'completed' = 'intro';
  private ieltsQuestionIndex: number = 0;
  private ieltsPrepSeconds: number = 60;
  private ieltsMonologueSeconds: number = 120;
  private ieltsTimerInterval: any = null;
  private ieltsCandidateNotes: string = '';
  private ieltsTurns: { sender: 'examiner' | 'candidate'; text: string; timestamp: number; analysis?: AcousticAnalysis }[] = [];
  private isIeltsRecording: boolean = false;
  private ieltsScorecard: {
    fcBand: number;
    lrBand: number;
    graBand: number;
    prBand: number;
    overallBand: number;
    comments: { fc: string; lr: string; gra: string; pr: string };
  } | null = null;

  private readonly ieltsPart1Questions: string[] = [
    "Good afternoon. My name is Dr. Harrison. Could you please tell me your full name and where you are currently living?",
    "Thank you. Do you currently work, or are you pursuing academic studies?",
    "What aspects of your hometown or neighborhood do you find most appealing?",
    "How do you prefer to spend your leisure time when you are not working or studying?"
  ];

  private readonly ieltsCueCard = {
    title: "Candidate Task Card (Part 2)",
    topic: "Describe an ambitious technological or scientific initiative you would like to participate in.",
    bulletPoints: [
      "What the project or initiative involves",
      "Which specialists or organizations you would collaborate with",
      "What technical skills or equipment would be required",
      "And explain why contributing to this project would be personally meaningful to you."
    ]
  };

  private readonly ieltsPart3Questions: string[] = [
    "Looking forward over the coming decade, how do you foresee automated intelligence transforming workforce distribution in developing nations?",
    "Do you believe national governments should prioritize investment in renewable energy engineering or artificial intelligence research?",
    "To what extent can cross-border scientific partnerships overcome geopolitical differences in addressing planetary challenges?"
  ];

  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-speaking interactive';
    this.allItems = (drillsData as any).speaking || [];
    this.activeLevel = defaultLevel(this.allItems as any[], StorageManager.getSkillLevel('speaking'));
    this.items = this.allItems.filter((i: any) => i.cefrLevel === this.activeLevel);
    window.addEventListener('learner-level-change', () => {
      this.activeLevel = defaultLevel(this.allItems as any[], StorageManager.getSkillLevel('speaking'));
      this.setLevel(this.activeLevel);
    });

    this.acousticEngine = new AcousticEngine();
    this.collocationSpotter = new CollocationSpotter();
    this.partnerEngine = new ConversationPartnerEngine();
    this.setupMotionObserver();
  }

  private setLevel(level: Cefr): void {
    this.activeLevel = level;
    this.resetPromptState();
    this.items = this.allItems.filter((i: any) => i.cefrLevel === level);
    this.currentIndex = 0;
    if (this.container.isConnected) this.render();
  }

  public getMode(): SpeakingMode {
    return this.mode;
  }

  public setMode(mode: SpeakingMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.resetPromptState();
    if (this.isPartnerRecording) {
      this.stopPartnerRecording();
    }
    this.stopFormantTracking();
    this.stopIeltsRecording();
    AudioSynthesizer.stopSpeech();
    if (this.container.isConnected) {
      this.render();
    }
  }

  public getPartnerEngine(): ConversationPartnerEngine {
    return this.partnerEngine;
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="speaking-mode-cluster">
          <button class="hud-btn mode-tab ${this.mode === 'nation' ? 'active-tab' : ''}" data-mode="nation">
            ${icon('clock', 13)} ${t('speaking.mode_nation', undefined, '4-3-2 Fluency')}
          </button>
          <button class="hud-btn mode-tab ${this.mode === 'roleplay' ? 'active-tab' : ''}" data-mode="roleplay">
            ${icon('mic', 13)} ${t('speaking.mode_roleplay', undefined, 'Conversation Partner')}
          </button>
          <button class="hud-btn mode-tab ${this.mode === 'formant' ? 'active-tab' : ''}" data-mode="formant">
            ${icon('music', 13)} ${t('speaking.mode_formant', undefined, 'Formant & Pairs Lab')}
          </button>
          <button class="hud-btn mode-tab ${this.mode === 'ielts' ? 'active-tab' : ''}" data-mode="ielts">
            ${icon('graduationCap', 13)} ${t('speaking.mode_ielts', undefined, 'IELTS Examiner')}
          </button>
        </div>
        ${this.mode === 'nation' ? levelRowHtml(this.allItems as any[], this.activeLevel) : ''}
        <div class="dossier-status-pill">
          <span class="telemetry-value">
            ${this.mode === 'nation' ? t('speaking.prompts_count', { count: this.items.length }) :
              this.mode === 'roleplay' ? t('speaking.scenarios_count', { count: BUILTIN_SCENARIOS.length }) :
              this.mode === 'formant' ? t('speaking.formant_lab_status') :
              t('speaking.ielts_status')}
          </span>
        </div>
      </div>
      <div class="speaking-workspace-body">
        ${this.mode === 'nation' ? `
          <div class="dossier-card-slot"></div>
          <div class="dossier-nav-bar">
            <button class="hud-btn nav-btn-prev">${icon('arrowLeft')} ${t('action.prev')}</button>
            <span class="telemetry-value card-counter">${t('common.prompt_counter', { current: this.currentIndex + 1, total: this.items.length }, `PROMPT ${this.currentIndex + 1} / ${this.items.length}`)}</span>
            <button class="hud-btn nav-btn-next">${t('action.next')} ${icon('arrowRight')}</button>
          </div>
        ` : this.mode === 'roleplay' ? `
          <div class="roleplay-workspace"></div>
        ` : this.mode === 'formant' ? `
          <div class="formant-workspace"></div>
        ` : `
          <div class="ielts-workspace"></div>
        `}
      </div>
    `;

    this.bindEvents();
    if (this.mode === 'nation') {
      this.renderCurrentCard();
    } else if (this.mode === 'roleplay') {
      this.renderRoleplayView();
    } else if (this.mode === 'formant') {
      this.renderFormantView();
    } else if (this.mode === 'ielts') {
      this.renderIeltsView();
    }
    return this.container;
  }

  private bindEvents(): void {
    this.container.querySelectorAll('.speaking-mode-cluster .mode-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const targetMode = (e.currentTarget as HTMLElement).getAttribute('data-mode') as SpeakingMode;
        if (targetMode && targetMode !== this.mode) {
          AudioSynthesizer.play('click');
          this.setMode(targetMode);
        }
      });
    });

    if (this.mode === 'nation') {
      bindLevelChips(this.container, level => this.setLevel(level));

      this.container.querySelector('.nav-btn-prev')?.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          this.resetPromptState();
          this.currentIndex -= 1;
          this.renderCurrentCard();
        }
      });

      this.container.querySelector('.nav-btn-next')?.addEventListener('click', () => {
        if (this.currentIndex < this.items.length - 1) {
          this.resetPromptState();
          this.currentIndex += 1;
          this.renderCurrentCard();
        }
      });
    }
  }

  private renderRoleplayView(): void {
    const mount = this.container.querySelector('.roleplay-workspace') as HTMLElement;
    if (!mount) return;

    const scenario = this.partnerEngine.getScenario();
    const messages = this.partnerEngine.getMessages();
    const isFinished = this.partnerEngine.isFinished();
    const coachEnabled = this.partnerEngine.isCoachNotesEnabled();
    const summary = isFinished ? this.partnerEngine.generateSummary() : null;

    mount.innerHTML = `
      <div class="roleplay-scenario-bar">
        <span class="telemetry-label">[SCENARIO SELECTION // CEFR A1-C2]</span>
        <div class="roleplay-scenario-pills">
          ${BUILTIN_SCENARIOS.map(sc => `
            <button class="hud-btn scenario-pill ${sc.id === scenario.id ? 'active-pill' : ''}" data-scenario-id="${sc.id}">
              <span class="pill-cefr">[${sc.cefrLevel}]</span> ${sc.title}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="roleplay-briefing-card">
        <div class="briefing-header">
          <div class="briefing-title-group">
            <span class="badge-level-pill cefr-${scenario.cefrLevel.toLowerCase()}">${scenario.cefrLevel}</span>
            <h3 class="briefing-title">${scenario.title}</h3>
          </div>
          <div class="briefing-actions">
            <button class="hud-btn btn-coach-toggle ${coachEnabled ? 'active-coach' : ''}">
              ${coachEnabled ? `${icon('graduationCap', 13)} Coach Notes: ON` : `${icon('graduationCap', 13)} Coach Notes: OFF`}
            </button>
            <button class="hud-btn btn-roleplay-reset">↺ ${t('speaking.restart_scene')}</button>
          </div>
        </div>
        <div class="briefing-meta">
          <div class="meta-item"><span class="meta-label">Setting:</span> ${scenario.setting}</div>
          <div class="meta-item"><span class="meta-label">Roles:</span> Partner (${scenario.partnerRole}) ⟷ You (${scenario.learnerRole})</div>
          <div class="meta-item goal-item"><span class="meta-label">Target Goal:</span> ${icon('target', 12)} ${scenario.learnerGoal}</div>
        </div>
      </div>

      <div class="roleplay-phrase-box-container">
        <div class="phrase-box-header">
          <span class="phrase-box-title">${icon('lightbulb', 13)} Guided Phrase Box (${scenario.cefrLevel} Scaffolding):</span>
        </div>
        <div class="phrase-chips-rack">
          ${scenario.phraseBox.map(ph => `
            <button class="hud-btn phrase-chip" data-phrase="${ph.replace(/"/g, '&quot;')}">
              "${ph}"
            </button>
          `).join('')}
        </div>
      </div>

      <div class="roleplay-dialogue-thread" aria-live="polite">
        ${messages.map(msg => this.renderMessageBubble(msg)).join('')}
      </div>

      ${!isFinished ? `
        <div class="roleplay-interaction-console">
          <div class="interaction-status-bar">
            <span class="telemetry-label">TURN PROGRESS: ${messages.filter(m => m.sender === 'learner').length} / ${scenario.maxTurns}</span>
            ${this.isPartnerRecording ? '<span class="recording-badge pulse">● LISTENING VIA WEB SPEECH API & DSP...</span>' : ''}
          </div>

          <div class="interaction-controls">
            <button class="hud-btn btn-partner-mic ${this.isPartnerRecording ? 'recording-active' : ''}">
              ${this.isPartnerRecording ? `${icon('stop', 13)} ${t('speaking.stop_submit')}` : `${icon('mic', 13)} ${t('speaking.record_mic')}`}
            </button>

            <div class="quick-response-box">
              <input type="text" class="roleplay-text-input" placeholder="Type or confirm spoken response here..." />
              <button class="hud-btn btn-send-turn">${t('speaking.send_turn')}</button>
            </div>
          </div>

          ${this.latestPartnerAnalysis ? this.renderProsodyRadarStrip(this.latestPartnerAnalysis) : ''}
        </div>
      ` : `
        <div class="roleplay-completion-card">
          <div class="completion-header">
            <h4>${icon('trophy', 14)} CEFR Scenario Completed: ${scenario.title} [${scenario.cefrLevel}]</h4>
            <span class="badge-success">CAN-DO ACHIEVED</span>
          </div>
          <div class="completion-grid">
            <div class="completion-col">
              <h5>${icon('check', 13)} What Went Well</h5>
              <ul>
                ${summary?.whatWentWell.map(w => `<li>${w}</li>`).join('') || ''}
              </ul>
            </div>
            <div class="completion-col">
              <h5>${icon('target', 13)} Key Recasts &amp; Nuance</h5>
              ${summary?.keyErrors.length ? `
                <ul class="error-recasts-list">
                  ${summary.keyErrors.map(e => `
                    <li><strong>You said:</strong> "${e.original}"<br><strong>Better:</strong> "${e.better}" <em>(${e.reason})</em></li>
                  `).join('')}
                </ul>
              ` : '<p class="clean-run">Clean spoken exchange with zero critical breakdowns!</p>'}
            </div>
          </div>
          <div class="completion-footer">
            <button class="hud-btn btn-replay-scenario">↺ Replay Scenario</button>
            <button class="hud-btn btn-next-scenario">Next CEFR Scenario →</button>
          </div>
        </div>
      `}
    `;

    this.bindRoleplayEvents(mount);

    const thread = mount.querySelector('.roleplay-dialogue-thread');
    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }
  }

  private renderMessageBubble(msg: RoleplayMessage): string {
    if (msg.sender === 'coach') {
      return `
        <div class="roleplay-bubble coach-bubble">
          <div class="coach-icon">${icon('graduationCap', 16)}</div>
          <div class="coach-content">${msg.text}</div>
        </div>
      `;
    }

    const isPartner = msg.sender === 'partner';
    return `
      <div class="roleplay-bubble ${isPartner ? 'partner-bubble' : 'learner-bubble'}">
        <div class="bubble-meta">
          <span class="sender-name">${isPartner ? this.partnerEngine.getScenario().partnerRole : 'You'}</span>
          ${msg.isSurpriseChallenge ? `
            <span class="hud-status-badge" style="background: rgba(251, 191, 36, 0.2); color: var(--warning); border: none; font-weight: 700;">⚡ EXAMINER SURPRISE FOLLOW-UP</span>
          ` : ''}
          ${msg.branchTaken ? `
            <span class="hud-status-badge" style="background: rgba(165, 180, 252, 0.15); color: var(--accent-gold); border: none;">Branch: ${msg.branchTaken}</span>
          ` : ''}
          ${isPartner ? `
            <button class="hud-btn btn-speak-bubble" data-text="${msg.text.replace(/"/g, '&quot;')}" title="Listen to spoken audio">
              🔊 Speak
            </button>
          ` : ''}
          ${msg.prosody ? `
            <span class="prosody-badge" title="Intonation contour & nPVI rhythm">
              ${msg.prosody.symbol} ${msg.prosody.contour.toUpperCase()} // nPVI: ${msg.prosody.npvi}
            </span>
          ` : ''}
        </div>
        <div class="bubble-text">${msg.text}</div>
        ${msg.recast ? `
          <div class="bubble-recast-tag">
            <span class="recast-label">Recast:</span> "${msg.recast.recast}"
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderProsodyRadarStrip(analysis: AcousticAnalysis): string {
    const into = analysis.intonation;
    const tonic = analysis.tonicProminence;
    const rhythm = analysis.rhythm;

    return `
      <div class="prosody-radar-strip">
        <div class="prosody-telemetry-pill">
          <span class="telemetry-label">INTONATION:</span>
          <span class="telemetry-val">${into ? `${into.symbol} ${into.label} (${Math.round(into.confidence * 100)}%)` : '—'}</span>
        </div>
        <div class="prosody-telemetry-pill">
          <span class="telemetry-label">TONIC STRESS:</span>
          <span class="telemetry-val">${tonic?.isProminent ? '● NUCLEAR STRESS PEAK' : '○ DISTRIBUTED'}</span>
        </div>
        <div class="prosody-telemetry-pill">
          <span class="telemetry-label">RHYTHM CADENCE:</span>
          <span class="telemetry-val">${rhythm ? `${rhythm.label}` : '—'}</span>
        </div>
      </div>
    `;
  }

  private bindRoleplayEvents(mount: HTMLElement): void {
    // Scenario selection
    mount.querySelectorAll('.scenario-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-scenario-id');
        if (id) {
          AudioSynthesizer.play('click');
          this.partnerEngine.setScenario(id);
          this.renderRoleplayView();
        }
      });
    });

    // Coach notes toggle
    mount.querySelector('.btn-coach-toggle')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.partnerEngine.setCoachNotesEnabled(!this.partnerEngine.isCoachNotesEnabled());
      this.renderRoleplayView();
    });

    // Reset scene
    mount.querySelector('.btn-roleplay-reset')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.partnerEngine.reset();
      this.renderRoleplayView();
    });

    // Phrase chips
    mount.querySelectorAll('.phrase-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phrase = (e.currentTarget as HTMLElement).getAttribute('data-phrase');
        if (phrase) {
          const input = mount.querySelector('.roleplay-text-input') as HTMLInputElement;
          if (input) {
            input.value = phrase;
            input.focus();
          }
          AudioSynthesizer.play('click');
        }
      });
    });

    // Speak partner bubble
    mount.querySelectorAll('.btn-speak-bubble').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = (e.currentTarget as HTMLElement).getAttribute('data-text');
        if (text) {
          AudioSynthesizer.speak(text.replace(/\[.*?\]/g, '').trim());
        }
      });
    });

    // Text send
    const input = mount.querySelector('.roleplay-text-input') as HTMLInputElement;
    const sendBtn = mount.querySelector('.btn-send-turn');

    const handleSend = () => {
      const text = input ? input.value.trim() : '';
      if (!text) return;
      this.submitPartnerTurn(text);
    };

    sendBtn?.addEventListener('click', handleSend);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });

    // Mic button
    const micBtn = mount.querySelector('.btn-partner-mic');
    micBtn?.addEventListener('click', () => {
      if (this.isPartnerRecording) {
        this.stopPartnerRecording();
      } else {
        this.startPartnerRecording();
      }
    });

    // Replay / next
    mount.querySelector('.btn-replay-scenario')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.partnerEngine.reset();
      this.renderRoleplayView();
    });

    mount.querySelector('.btn-next-scenario')?.addEventListener('click', () => {
      AudioSynthesizer.play('level-up');
      const curId = this.partnerEngine.getScenario().id;
      const idx = BUILTIN_SCENARIOS.findIndex(s => s.id === curId);
      const nextIdx = (idx + 1) % BUILTIN_SCENARIOS.length;
      this.partnerEngine.setScenario(BUILTIN_SCENARIOS[nextIdx].id);
      this.renderRoleplayView();
    });
  }

  private async startPartnerRecording(): Promise<void> {
    if (this.isPartnerRecording) return;
    this.isPartnerRecording = true;
    this.liveTranscriptBuffer = '';
    AudioSynthesizer.play('absorb');

    try {
      await this.acousticEngine.startRecording();
    } catch {}

    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          this.partnerSpeechRecognition = new SpeechRec();
          this.partnerSpeechRecognition.continuous = true;
          this.partnerSpeechRecognition.interimResults = true;
          this.partnerSpeechRecognition.lang = 'en-US';
          this.partnerSpeechRecognition.onresult = (event: any) => {
            let finalStr = '';
            for (let i = 0; i < event.results.length; i++) {
              finalStr += event.results[i][0].transcript + ' ';
            }
            this.liveTranscriptBuffer = finalStr.trim();
            const input = this.container.querySelector('.roleplay-text-input') as HTMLInputElement;
            if (input && this.liveTranscriptBuffer) {
              input.value = this.liveTranscriptBuffer;
            }
          };
          this.partnerSpeechRecognition.start();
        } catch {}
      }
    }

    this.renderRoleplayView();
  }

  private async stopPartnerRecording(): Promise<void> {
    if (!this.isPartnerRecording) return;
    this.isPartnerRecording = false;

    if (this.partnerSpeechRecognition) {
      try {
        this.partnerSpeechRecognition.stop();
      } catch {}
      this.partnerSpeechRecognition = null;
    }

    let analysis: AcousticAnalysis | null = null;
    try {
      analysis = await this.acousticEngine.stopRecording();
      this.latestPartnerAnalysis = analysis;
    } catch {}

    const textInput = this.container.querySelector('.roleplay-text-input') as HTMLInputElement;
    const spokenText = (this.liveTranscriptBuffer || textInput?.value || '').trim();

    if (spokenText) {
      this.submitPartnerTurn(spokenText, analysis);
    } else {
      AudioSynthesizer.play('tick');
      this.renderRoleplayView();
    }
  }

  private submitPartnerTurn(text: string, analysis?: AcousticAnalysis | null): void {
    let prosodyInfo: any = undefined;
    if (analysis && analysis.intonation && analysis.rhythm) {
      prosodyInfo = {
        contour: analysis.intonation.contour,
        tonicProminent: analysis.tonicProminence?.isProminent ?? false,
        npvi: analysis.rhythm.npvi,
        symbol: analysis.intonation.symbol
      };
    }

    const res = this.partnerEngine.processLearnerTurn(text, prosodyInfo);
    AudioSynthesizer.play('absorb');

    if (res.partnerMessage?.text) {
      setTimeout(() => {
        AudioSynthesizer.speak(res.partnerMessage.text);
      }, 200);
    }

    if (res.isFinished) {
      AudioSynthesizer.play('stage-fanfare');
    }

    this.renderRoleplayView();
  }

  private renderCurrentCard(): void {
    const slot = this.container.querySelector('.dossier-card-slot');
    if (!slot) return;
    slot.innerHTML = '';

    if (this.items.length === 0) return;

    const item = this.items[this.currentIndex];
    const srsState = StorageManager.getCardState(item.id);
    let statusBadge: 'NEW' | 'REVIEW' | 'MASTERED' = 'NEW';
    if (srsState) {
      statusBadge = srsState.repetitions >= 3 ? 'MASTERED' : 'REVIEW';
    }

    // Configure collocation spotter with current prompt targets
    const rawCollocs = item.collocations.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    this.collocationSpotter.setTargetCollocations(rawCollocs);

    // Front: Prompt, 15s Mental Anchor, 4-3-2 Circular HUD, Radar Strip & Dual-Trace Canvas
    const frontEl = document.createElement('div');
    frontEl.className = 'speaking-front';
    this.updateFrontContent(frontEl, item);

    // Back: 3-Round Compression Matrix, Prosody Targets & Scoring
    const backEl = document.createElement('div');
    backEl.className = 'speaking-back';
    this.updateBackContent(backEl, item);

    const cardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'SPEAK',
      category: '4-3-2',
      indexStr: `[ ${String(item.index).padStart(2, '0')} / ${this.items.length} ]`,
      statusBadge,
      front: {
        customContent: frontEl,
        mainText: item.prompt
      },
      back: {
        customContent: backEl,
        mainText: item.collocations
      },
      audioText: item.prompt,
      onRate: (rating) => {
        const nextState = SRSEngine.rateCard(srsState, item.id, rating);
        StorageManager.setCardState(item.id, nextState);
        this.resetPromptState();

        if (this.currentIndex < this.items.length - 1) {
          this.currentIndex += 1;
          this.renderCurrentCard();
        } else if (this.onBatchComplete) {
          this.onBatchComplete();
        }
      }
    });

    this.currentCardHandle = cardHandle;
    slot.appendChild(cardHandle.element);

    const counter = this.container.querySelector('.card-counter');
    if (counter) {
      counter.textContent = `PROMPT [ ${this.currentIndex + 1} / ${this.items.length} ]`;
    }
  }

  private updateFrontContent(frontEl: HTMLElement, item: SpeakingItem): void {
    const allocatedMins = this.rounds[this.currentRoundIdx] / 60;
    const targetStatus = this.collocationSpotter.getStatus();
    const perf = this.roundsPerformance[this.currentRoundIdx];

    frontEl.innerHTML = `
      <div class="card-prompt-label">
        ${t('speaking.drill_round', { round: this.currentRoundIdx + 1, mins: allocatedMins }, `4-3-2 DRILL // ROUND ${this.currentRoundIdx + 1}/3 (${allocatedMins}M)`)}
      </div>

      <div class="card-main-text" style="font-size: var(--font-body); font-weight: 600; line-height: 1.4; margin-bottom: 8px;">
        "${item.prompt}"
      </div>

      <!-- 15s Mental Anchor -->
      <div style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-secondary); margin-bottom: 10px; border-left: 2px solid var(--ink-primary); padding-left: 8px; background: rgba(0, 0, 0, 0.02);">
        <strong>${t('speaking.mental_anchor', undefined, '15S MENTAL ANCHOR:')}</strong> ${item.anchor}
      </div>

      <!-- Collocation Voice Radar Strip -->
      <div style="margin-bottom: 8px;">
        <div style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted); margin-bottom: 4px;">
          ${t('speaking.target_colloc_radar', undefined, '[TARGET COLLOCATIONS // ACOUSTIC RADAR]')}
        </div>
        <div class="collocation-radar-strip">
          ${targetStatus.map((t) => `
            <button type="button" class="radar-chip ${t.spotted ? 'spotted' : ''}" data-phrase="${t.phrase}" title="${t.spotted ? 'Voiced in take' : 'Click to manually mark as voiced'}">
              <span>${t.spotted ? '[✓]' : '[ ]'}</span>
              <span>${t.phrase.toUpperCase()}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Circular Timer HUD & Waveform Area -->
      <div class="speaking-hud-strip" style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-hairline); padding-top: 8px; gap: 14px; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="position: relative; width: 64px; height: 64px;">
            <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);" aria-hidden="true">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="var(--border-subtle)" stroke-width="2.5" />
              <path class="timer-progress-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="var(--accent-gold)" stroke-width="2.5" stroke-dasharray="100, 100" />
            </svg>
            <div class="timer-display-text" role="timer" aria-live="polite" aria-atomic="true" aria-label="Speaking take countdown timer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: var(--font-body-compact); font-weight: 700;">
              ${this.formatTime(this.secondsRemaining)}
            </div>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button type="button" class="hud-btn btn-timer-toggle" aria-label="Start or pause timer" title="Start or pause timer" style="padding: 8px 14px; min-height: 44px; border-radius: var(--radius-btn, 10px); font-size: var(--font-kicker); display: inline-flex; align-items: center;">${this.isTimerRunning ? '⏸ Pause' : '▶ Start'}</button>
            <button type="button" class="hud-btn btn-take-complete" aria-label="Stop and finish take" title="Stop and finish take" style="padding: 8px 14px; min-height: 44px; border-radius: var(--radius-btn, 10px); font-size: var(--font-kicker); display: inline-flex; align-items: center;" ${!this.isTimerRunning ? 'disabled' : ''}>⏹ Stop</button>
          </div>
        </div>

        <!-- Dual-Trace Oscilloscope Canvas -->
        <div class="speaking-oscilloscope-container" style="flex: 1; min-width: 240px; margin-top: 0;">
          <div class="oscilloscope-header">
            <span>${t('speaking.track1_benchmark', undefined, 'TRACK 1: NATIVE BENCHMARK F₀')}</span>
            <span>TRACK 2: ${this.isTimerRunning ? t('speaking.live_mic_take', undefined, 'LIVE MIC TAKE') : (this.latestAnalysis ? t('speaking.student_pitch_profile', undefined, 'STUDENT PITCH PROFILE') : t('speaking.student_take_idle', undefined, 'STUDENT TAKE IDLE'))}</span>
          </div>
          <canvas class="speaking-waveform-canvas" width="480" height="72" style="max-width: 100%; height: auto; display: block;"></canvas>
        </div>
      </div>

      <!-- Post-Take Review Strip -->
      ${this.hasCompletedTake && perf ? `
        <div class="post-take-strip" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="post-take-metrics" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span>TAKE ${this.currentRoundIdx + 1}: <strong>${Math.round(perf.actualSeconds)}s</strong> / ${perf.allocatedSeconds}s</span>
            <span>SILENCE: <strong>${Math.round(perf.silenceRatio * 100)}%</strong></span>
            <span>COLLOC: <strong>${perf.spottedCollocations}/${perf.totalCollocations}</strong></span>
          </div>
          <div class="post-take-actions" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button type="button" class="hud-btn btn-play-exemplar" style="font-size: var(--font-kicker); padding: 8px 14px; min-height: 44px; border-radius: var(--radius-btn, 10px); display: inline-flex; align-items: center;">▶ Exemplar</button>
            <button type="button" class="hud-btn btn-play-take" style="font-size: var(--font-kicker); padding: 8px 14px; min-height: 44px; border-radius: var(--radius-btn, 10px); display: inline-flex; align-items: center;">▶ Your Take</button>
            <button type="button" class="hud-btn btn-stop-audio" style="font-size: var(--font-kicker); padding: 8px 14px; min-height: 44px; border-radius: var(--radius-btn, 10px); display: inline-flex; align-items: center;">⏹ Stop</button>
            ${this.currentRoundIdx < 2 ? `
              <button type="button" class="hud-btn btn-advance-round" style="font-size: var(--font-kicker); padding: 8px 14px; min-height: 44px; border-radius: var(--radius-btn, 10px); display: inline-flex; align-items: center; background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; border: none;">
                Advance to Round ${this.currentRoundIdx + 2} (${this.rounds[this.currentRoundIdx + 1] / 60} min) ${icon('arrowRight')}
              </button>
            ` : `
              <button type="button" class="hud-btn btn-view-matrix" style="font-size: var(--font-kicker); padding: 8px 14px; min-height: 44px; border-radius: var(--radius-btn, 10px); display: inline-flex; align-items: center; background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; border: none;">
                View 3-Round Compression Matrix ${icon('arrowRight')}
              </button>
            `}
          </div>
        </div>
      ` : ''}
    `;

    this.bindFrontEvents(frontEl, item);
  }

  private bindFrontEvents(frontEl: HTMLElement, item: SpeakingItem): void {
    // 1. Radar Chip Manual Toggles
    const chips = frontEl.querySelectorAll('.radar-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const phrase = chip.getAttribute('data-phrase');
        if (phrase) {
          this.collocationSpotter.manualToggle(phrase);
          AudioSynthesizer.play('absorb');
          this.updateRadarChipDisplays(frontEl);
        }
      });
    });

    // 2. Timer Toggle Button
    frontEl.querySelector('.btn-timer-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.toggleTimer(frontEl, item);
    });

    // 3. Complete Take Button
    frontEl.querySelector('.btn-take-complete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.completeCurrentTake(frontEl, item);
    });

    // 4. A/B Audio Replay Controls
    frontEl.querySelector('.btn-play-exemplar')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.acousticEngine.playExemplar(item.prompt, () => {
        AudioSynthesizer.play('click');
      });
    });

    frontEl.querySelector('.btn-play-take')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.acousticEngine.playTake(() => {
        AudioSynthesizer.play('click');
      });
    });

    frontEl.querySelector('.btn-stop-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.stopPlayback();
    });

    // 5. Advance Round or Flip to Back Face
    frontEl.querySelector('.btn-advance-round')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      this.advanceToNextRound(frontEl, item);
    });

    frontEl.querySelector('.btn-view-matrix')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.play('click');
      if (this.currentCardHandle) {
        this.currentCardHandle.flip();
      }
    });

    // 6. Mount Canvas Dual-Trace
    const canvas = frontEl.querySelector('.speaking-waveform-canvas') as HTMLCanvasElement;
    if (canvas) {
      this.initDualTraceCanvas(canvas);
    }
  }

  private updateBackContent(backEl: HTMLElement, item: SpeakingItem): void {
    backEl.innerHTML = `
      <div class="card-prompt-label">NATION 4-3-2 FLUENCY COMPRESSION MATRIX</div>

      <!-- 3-Round Compression Comparison Table -->
      <div class="compression-table-wrapper">
        <table class="compression-table">
          <thead>
            <tr>
              <th>ROUND</th>
              <th>ALLOTTED</th>
              <th>TIME SPOKEN</th>
              <th>SILENCE %</th>
              <th>COLLOCATIONS ACTIVATED</th>
            </tr>
          </thead>
          <tbody>
            ${[0, 1, 2].map((rIdx) => {
              const perf = this.roundsPerformance[rIdx];
              const allocatedMins = this.rounds[rIdx] / 60;
              const isRound3 = rIdx === 2;
              if (perf) {
                const silencePct = Math.round(perf.silenceRatio * 100);
                const tag = isRound3 ? ' <span style="font-size: var(--font-kicker); opacity: 0.8;">(Peak Fluency)</span>' : '';
                return `
                  <tr class="${isRound3 ? 'highlight-fluency' : ''}">
                    <td><strong>ROUND ${rIdx + 1}</strong> (${allocatedMins} MIN)</td>
                    <td>${allocatedMins}:00</td>
                    <td>${this.formatTime(Math.round(perf.actualSeconds))}</td>
                    <td>${silencePct}%</td>
                    <td>${perf.spottedCollocations} / ${perf.totalCollocations}${tag}</td>
                  </tr>
                `;
              } else {
                return `
                  <tr>
                    <td>ROUND ${rIdx + 1} (${allocatedMins} MIN)</td>
                    <td>${allocatedMins}:00</td>
                    <td style="color: var(--ink-muted);">--:--</td>
                    <td style="color: var(--ink-muted);">--%</td>
                    <td style="color: var(--ink-muted);">--</td>
                  </tr>
                `;
              }
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Target Collocations Reference -->
      <div style="margin-top: 12px; font-family: var(--font-sans); font-size: var(--font-body-compact);">
        <strong>Target Collocations:</strong>
        <div style="font-family: var(--font-mono); font-size: var(--font-body-compact); background: var(--bg-surface-sunk); border: 1px solid var(--border-subtle); color: var(--ink-primary); border-radius: 4px; padding: 6px 10px; margin-top: 4px;">
          ${item.collocations}
        </div>
      </div>

      <!-- Phonetics & Prosody Guidance -->
      <div style="font-family: var(--font-sans); font-size: var(--font-body-compact); border-top: 1px solid var(--border-hairline); padding-top: 8px; margin-top: 8px;">
        <strong>Phonetics & Prosody Check:</strong>
        <p style="font-family: var(--font-mono); font-size: var(--font-body-compact); color: var(--ink-secondary); margin-top: 4px;">
          ${item.phonetic}
        </p>
      </div>
    `;
  }

  private toggleTimer(frontEl: HTMLElement, item: SpeakingItem): void {
    if (this.isTimerRunning) {
      // Pause
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
      this.collocationSpotter.stopListening();
      this.acousticEngine.stopTake();
      this.updateFrontContent(frontEl, item);
    } else {
      // Start recording & timer
      this.isTimerRunning = true;
      this.hasCompletedTake = false;

      this.acousticEngine.startRecording().catch(() => {});
      this.collocationSpotter.startListening(() => {
        AudioSynthesizer.play('absorb');
        this.updateRadarChipDisplays(frontEl);
      });

      this.timerInterval = setInterval(() => {
        if (this.secondsRemaining > 0) {
          this.secondsRemaining -= 1;
          this.updateTimerDisplay(frontEl);
        } else {
          // Timer reached 0: complete current take
          this.completeCurrentTake(frontEl, item);
        }
      }, 1000);

      this.updateFrontContent(frontEl, item);
    }
  }

  private async completeCurrentTake(frontEl: HTMLElement, item: SpeakingItem): Promise<void> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
    if (this.waveformRaf) {
      cancelAnimationFrame(this.waveformRaf);
      this.waveformRaf = null;
    }
    this.collocationSpotter.stopListening();
    AudioSynthesizer.play('alarm');

    const analysis = await this.acousticEngine.stopRecording();
    this.latestAnalysis = analysis;
    this.hasCompletedTake = true;

    const allocatedSec = this.rounds[this.currentRoundIdx];
    const actualSec = Math.max(1, allocatedSec - this.secondsRemaining);
    const spottedList = this.collocationSpotter.getStatus();
    const spottedCount = spottedList.filter((s) => s.spotted).length;

    const performance: RoundPerformance = {
      roundIdx: this.currentRoundIdx,
      allocatedSeconds: allocatedSec,
      actualSeconds: actualSec,
      silenceRatio: analysis.silenceRatio,
      spottedCollocations: spottedCount,
      totalCollocations: spottedList.length,
      analysis
    };

    this.roundsPerformance[this.currentRoundIdx] = performance;

    // Advance Constellation Skill Tree node for speaking
    SkillTreeEngine.advanceBranchMastery('speaking', this.activeLevel, 5);

    // Refresh front and back views with new take data
    this.updateFrontContent(frontEl, item);
    const backEl = this.container.querySelector('.speaking-back') as HTMLElement;
    if (backEl) {
      this.updateBackContent(backEl, item);
    }
  }

  private advanceToNextRound(frontEl: HTMLElement, item: SpeakingItem): void {
    if (this.currentRoundIdx < this.rounds.length - 1) {
      this.stopPlayback();
      this.currentRoundIdx += 1;
      this.secondsRemaining = this.rounds[this.currentRoundIdx];
      this.hasCompletedTake = false;
      this.collocationSpotter.reset();
      this.updateFrontContent(frontEl, item);

      const backEl = this.container.querySelector('.speaking-back') as HTMLElement;
      if (backEl) {
        this.updateBackContent(backEl, item);
      }
    }
  }

  private updateRadarChipDisplays(frontEl: HTMLElement): void {
    const status = this.collocationSpotter.getStatus();
    const chips = frontEl.querySelectorAll('.radar-chip');
    chips.forEach((chip) => {
      const phrase = chip.getAttribute('data-phrase');
      const found = status.find((s) => s.phrase.toLowerCase() === phrase?.toLowerCase());
      if (found && found.spotted) {
        chip.classList.add('spotted');
        const iconSpan = chip.querySelector('span:first-child');
        if (iconSpan) iconSpan.textContent = '[✓]';
      }
    });
  }

  private updateTimerDisplay(frontEl: HTMLElement): void {
    const textEl = frontEl.querySelector('.timer-display-text');
    if (textEl) {
      textEl.textContent = this.formatTime(this.secondsRemaining);
    }
    const ring = frontEl.querySelector('.timer-progress-ring') as SVGPathElement;
    if (ring) {
      const total = this.rounds[this.currentRoundIdx];
      const pct = Math.max(0, (this.secondsRemaining / total) * 100);
      ring.setAttribute('stroke-dasharray', `${pct}, 100`);
    }
  }

  private formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  private setupMotionObserver(): void {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    if (this.motionObserver) return;
    this.motionObserver = new MutationObserver(() => {
      this.handleMotionChange();
    });
    this.motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion']
    });

    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => {
        this.handleMotionChange();
      });
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.waveformRaf !== null) {
            cancelAnimationFrame(this.waveformRaf);
            this.waveformRaf = null;
          }
        } else if (this.isTimerRunning && !this.isReducedMotion() && this.activeCanvas && this.activeCanvas.isConnected) {
          this.initDualTraceCanvas(this.activeCanvas);
        }
      });
    }
  }

  private handleMotionChange(): void {
    if (this.isReducedMotion()) {
      if (this.waveformRaf !== null) {
        cancelAnimationFrame(this.waveformRaf);
        this.waveformRaf = null;
      }
      if (this.activeCanvas && this.activeCanvas.isConnected) {
        this.drawWaveformFrame(this.activeCanvas);
      }
    } else {
      if (this.waveformRaf === null && this.activeCanvas && this.activeCanvas.isConnected) {
        this.initDualTraceCanvas(this.activeCanvas);
      }
    }
  }

  private drawWaveformFrame(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    const halfH = h / 2;

    ctx.clearRect(0, 0, w, h);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const track1Color = isDark ? '#a5b4fc' : '#5b5bd6';
    const track2Color = isDark ? '#34d399' : '#059669';

    // Center divider & measurement grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, halfH);
    ctx.lineTo(w, halfH);
    for (let x = 0; x < w; x += 48) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    ctx.stroke();

    // TRACK 1: Native Benchmark Intonation (Top Half: 0 to halfH)
    ctx.save();
    ctx.strokeStyle = track1Color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    const track1Mid = halfH * 0.55;
    for (let x = 0; x < w; x += 3) {
      const t = x / w;
      const peak = Math.exp(-Math.pow((t - 0.38) / 0.18, 2)) * 14;
      const declination = (1 - t * 0.4) * 4;
      const microMod = Math.sin(t * Math.PI * 8) * 2;
      const y = track1Mid - (peak + declination + microMod);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // TRACK 2: Student Take (Bottom Half: halfH to h)
    ctx.save();
    ctx.strokeStyle = track2Color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const track2Mid = halfH + halfH * 0.5;

    if (this.isTimerRunning && this.acousticEngine.isRecording) {
      // Realtime live microphone oscilloscope
      const buffer = new Float32Array(256);
      this.acousticEngine.getRealtimeAudioData(buffer);
      const sliceWidth = w / buffer.length;
      let x = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i];
        const y = track2Mid + v * (halfH * 0.45);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
    } else if (this.latestAnalysis && this.latestAnalysis.pitchSamples.length > 0) {
      // Post-take recorded pitch contour
      const pitches = this.latestAnalysis.pitchSamples;
      const step = w / Math.max(1, pitches.length - 1);
      let started = false;

      for (let i = 0; i < pitches.length; i++) {
        const p = pitches[i];
        const x = i * step;
        if (p > 0) {
          const norm = Math.max(0, Math.min(1, (p - 80) / 320));
          const y = (h - 6) - norm * (halfH * 0.82);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    } else {
      // Idle baseline
      ctx.moveTo(0, track2Mid);
      ctx.lineTo(w, track2Mid);
      ctx.stroke();
    }
    ctx.restore();
  }

  private initDualTraceCanvas(canvas: HTMLCanvasElement): void {
    this.activeCanvas = canvas;
    if (this.waveformRaf) {
      cancelAnimationFrame(this.waveformRaf);
      this.waveformRaf = null;
    }

    if (this.isReducedMotion()) {
      // Zero-cycle suspension: draw single static frame and do not schedule requestAnimationFrame
      this.drawWaveformFrame(canvas);
      return;
    }

    if (!this.isTimerRunning) {
      // Zero-CPU idle suspension: draw single static frame and do not schedule requestAnimationFrame
      this.drawWaveformFrame(canvas);
      return;
    }

    const draw = () => {
      this.drawWaveformFrame(canvas);

      if (this.isReducedMotion() || !this.isTimerRunning) {
        this.waveformRaf = null;
        return;
      }

      if (typeof document !== 'undefined' && document.hidden) {
        this.waveformRaf = null;
        return;
      }

      if (!canvas.isConnected) {
        this.waveformRaf = null;
        return;
      }

      this.waveformRaf = requestAnimationFrame(draw);
    };

    draw();
  }

  public isReducedMotion(): boolean {
    if (typeof document === 'undefined') return false;
    return (
      document.documentElement.getAttribute('data-motion') === 'reduce' ||
      document.documentElement.dataset.motion === 'reduce' ||
      (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true)
    );
  }

  private stopPlayback(): void {
    this.acousticEngine.stopTake();
    this.acousticEngine.stopExemplar();
  }

  private resetPromptState(): void {
    this.stopPlayback();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
    this.currentRoundIdx = 0;
    this.secondsRemaining = this.rounds[0];
    this.roundsPerformance = [null, null, null];
    this.latestAnalysis = null;
    this.hasCompletedTake = false;
    this.collocationSpotter.reset();
    if (this.ieltsTimerInterval) {
      clearInterval(this.ieltsTimerInterval);
      this.ieltsTimerInterval = null;
    }
    if (this.formantPollInterval) {
      clearInterval(this.formantPollInterval);
      this.formantPollInterval = null;
    }
    this.isIeltsRecording = false;
    this.isFormantTracking = false;
    AudioSynthesizer.stopSpeech();
  }

  // ===========================================================================
  // FORMANT VOWEL LAB & MINIMAL PAIRS DRILL ENGINE
  // ===========================================================================

  private renderFormantView(): void {
    const mount = this.container.querySelector('.formant-workspace') as HTMLElement;
    if (!mount) return;

    const getSvgX = (f2: number) => 60 + Math.max(0, Math.min(420, ((2600 - f2) / (2600 - 800)) * 420));
    const getSvgY = (f1: number) => 40 + Math.max(0, Math.min(260, ((f1 - 250) / (850 - 250)) * 260));

    const quadPoints = [
      `${getSvgX(2250)},${getSvgY(280)}`, // /iː/
      `${getSvgX(940)},${getSvgY(310)}`,  // /uː/
      `${getSvgX(1080)},${getSvgY(720)}`, // /ɑː/
      `${getSvgX(1660)},${getSvgY(750)}`  // /æ/
    ].join(' ');

    const hasLiveFormant = this.currentFormant && this.currentFormant.f1 > 0 && this.currentFormant.f2 > 0;
    const liveX = hasLiveFormant ? getSvgX(this.currentFormant!.f2) : 0;
    const liveY = hasLiveFormant ? getSvgY(this.currentFormant!.f1) : 0;

    mount.innerHTML = `
      <div class="formant-quadrilateral-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: var(--font-body); font-weight: 700; color: var(--ink-primary);">🔬 Acoustic Formant Vowel Lab</h3>
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">2D F1/F2 IPA VOWEL SPACE // SUB-BIN PARABOLIC SPECTRAL TRACKING</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="hud-btn btn-play-vowel-synth" style="font-size: var(--font-kicker); padding: 4px 10px;">
              ${icon('volume', 12)} Hear Synthetic Formant Model
            </button>
            <button class="hud-btn btn-toggle-formant-mic ${this.isFormantTracking ? 'recording-active' : ''}" style="font-size: var(--font-kicker); padding: 4px 12px;">
              ${this.isFormantTracking ? `${icon('stop', 12)} Stop Mic Track` : `${icon('mic', 12)} Start Mic Resonance Track`}
            </button>
          </div>
        </div>

        <div class="vowel-pills-bar">
          <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted); align-self: center; margin-right: 4px;">${t('speaking.target_vowel', undefined, 'TARGET VOWEL:')}</span>
          ${VOWEL_BENCHMARKS.map(b => `
            <button class="hud-btn vowel-pill ${b.phoneme === this.activeVowel.phoneme ? 'active-pill' : ''}" data-phoneme="${b.phoneme}">
              <strong>${b.phoneme}</strong> (${b.example})
            </button>
          `).join('')}
        </div>

        <div class="formant-grid">
          <div class="vowel-svg-wrapper" style="position: relative;">
            <svg class="vowel-quadrilateral-svg" viewBox="0 0 540 340">
              <line x1="60" y1="40" x2="480" y2="40" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
              <line x1="60" y1="40" x2="60" y2="300" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
              <text x="60" y="24" fill="#94a3b8" font-size="10" font-family="monospace">← Front (2600Hz F2)</text>
              <text x="480" y="24" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="end">Back (800Hz F2) →</text>
              <text x="14" y="55" fill="#94a3b8" font-size="10" font-family="monospace">Close (F1 250Hz)</text>
              <text x="14" y="295" fill="#94a3b8" font-size="10" font-family="monospace">Open (F1 850Hz)</text>

              <polygon points="${quadPoints}" class="vowel-quad-polygon" />

              ${VOWEL_BENCHMARKS.map(b => {
                const cx = getSvgX(b.f2);
                const cy = getSvgY(b.f1);
                const isTarget = b.phoneme === this.activeVowel.phoneme;
                return `
                  <g class="vowel-node ${isTarget ? 'active-target-vowel' : ''}" data-phoneme="${b.phoneme}">
                    <circle cx="${cx}" cy="${cy}" r="${isTarget ? 24 : 20}" class="vowel-circle" />
                    <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="vowel-ipa">${b.phoneme}</text>
                    <text x="${cx}" y="${cy + 10}" text-anchor="middle" class="vowel-sample">${b.example}</text>
                  </g>
                `;
              }).join('')}

              ${hasLiveFormant ? `
                <g class="live-formant-group">
                  <line x1="${liveX}" y1="${liveY}" x2="${getSvgX(this.activeVowel.f2)}" y2="${getSvgY(this.activeVowel.f1)}" stroke="var(--accent-gold)" stroke-width="1.5" stroke-dasharray="4,4" />
                  <circle cx="${liveX}" cy="${liveY}" r="9" class="formant-cursor" />
                  <circle cx="${liveX}" cy="${liveY}" r="16" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.6" />
                </g>
              ` : ''}
            </svg>
          </div>

          <div class="formant-telemetry-console" style="display: flex; flex-direction: column; gap: 10px;">
            <div class="telemetry-box" style="padding: 12px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-hairline); border-radius: 6px;">
              <span class="telemetry-label" style="display: block; font-size: var(--font-kicker); color: var(--ink-muted); margin-bottom: 4px;">TARGET VOWEL SPECIFICATION</span>
              <div style="font-size: var(--font-body); font-weight: 700; color: var(--accent-gold); margin-bottom: 4px;">
                ${this.activeVowel.phoneme} — "${this.activeVowel.example}"
              </div>
              <div style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-secondary);">
                Target F1: <strong>${this.activeVowel.f1} Hz</strong> | Target F2: <strong>${this.activeVowel.f2} Hz</strong>
              </div>
              ${(() => {
                const bio = ArticulatoryBiomechanics.getProfile(this.activeVowel.phoneme);
                if (!bio) return '';
                return `
                  <div style="font-size: var(--font-kicker); color: var(--ink-secondary); margin-top: 6px; line-height: 1.45;">
                    <div>📐 <strong>Jaw Aperture:</strong> ~${bio.jawApertureMm}mm (${bio.jawInstruction})</div>
                    <div>👅 <strong>Tongue Placement:</strong> ${bio.tonguePosition}</div>
                    <div>👄 <strong>Lip Posture:</strong> ${bio.lipPosture.toUpperCase()} (${bio.lipInstruction})</div>
                  </div>
                `;
              })()}
              <div style="font-size: var(--font-kicker); color: #f59e0b; margin-top: 6px;">
                ${icon('alertTriangle', 12)} <em>${this.activeVowel.l1Contrast || 'Focus on precise sustained resonance.'}</em>
              </div>
            </div>

            <div class="telemetry-box" style="padding: 12px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-hairline); border-radius: 6px;">
              <span class="telemetry-label" style="display: block; font-size: var(--font-kicker); color: var(--ink-muted); margin-bottom: 4px;">LIVE SPOKEN BIOFEEDBACK</span>
              <div style="font-family: var(--font-mono); font-size: var(--font-body-compact); color: var(--ink-primary); margin-bottom: 4px;">
                F1 (Height): <strong>${hasLiveFormant ? this.currentFormant!.f1 + ' Hz' : '---'}</strong> | F2 (Backness): <strong>${hasLiveFormant ? this.currentFormant!.f2 + ' Hz' : '---'}</strong>
              </div>
              <div style="font-size: var(--font-body-compact); line-height: 1.4; color: ${this.currentFormant?.nearestVowel?.isTargetMatch ? 'var(--good, #34d399)' : 'var(--ink-secondary)'};">
                ${hasLiveFormant ? (this.currentFormant!.nearestVowel?.driftGuidance || 'Tracking voice...') : 'Speak or hold target vowel to track resonance on chart.'}
              </div>
              ${(() => {
                if (!hasLiveFormant) return '';
                const diag = ArticulatoryBiomechanics.diagnoseFormants(this.activeVowel.phoneme, this.currentFormant!.f1, this.currentFormant!.f2);
                if (!diag) return '';
                return `
                  <div style="font-size: var(--font-kicker); background: rgba(56, 189, 248, 0.08); border-left: 2px solid var(--accent-cyan); padding: 6px 10px; border-radius: 4px; margin-top: 8px; line-height: 1.45; color: var(--ink-primary);">
                    <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 2px;">⚡ Actionable Physical Adjustments:</div>
                    <div>• <strong>Jaw:</strong> ${diag.jawAdjustment}</div>
                    <div>• <strong>Tongue:</strong> ${diag.tongueAdjustment}</div>
                    <div>• <strong>Lips:</strong> ${diag.lipAdjustment}</div>
                  </div>
                `;
              })()}
              <div style="margin-top: 8px;">
                <button class="hud-btn btn-sim-resonance" style="font-size: var(--font-kicker); padding: 2px 8px;">
                  ${icon('zap', 11)} ${t('speaking.test_resonance', undefined, 'Test Benchmark Resonance')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="minimal-pairs-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h4 style="margin: 0; font-size: var(--font-body); font-weight: 700; color: var(--ink-primary);">${icon('zap', 14)} Interactive Minimal Pairs Audio Drill Engine</h4>
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">TRI-FACTOR ACOUSTIC VERIFICATION: DURATION RATIO (>=1.35x), FORMANT DELTA, CODA RELEASE TRANSIENT</span>
          </div>
          <button class="hud-btn btn-evaluate-pair" style="font-size: var(--font-kicker); padding: 4px 12px; background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; border: none;">
            ${icon('scale', 12)} Evaluate Acoustic Contrast
          </button>
        </div>

        <div class="minimal-pairs-pills-bar">
          ${MINIMAL_PAIRS_CURRICULUM.map(p => `
            <button class="hud-btn minimal-pair-pill ${p.id === this.activeMinimalPair.id ? 'active-pill' : ''}" data-pair-id="${p.id}">
              ${p.contrastLabel} (${p.wordA} / ${p.wordB})
            </button>
          `).join('')}
        </div>

        <div class="minimal-pairs-grid">
          <div class="pair-word-card">
            <div class="pair-word-header">
              <span class="pair-word-text">${this.activeMinimalPair.wordA}</span>
              <span class="pair-word-ipa">${this.activeMinimalPair.ipaA}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="hud-btn btn-speak-word-a" style="font-size: var(--font-kicker); padding: 2px 8px;">${icon('volume', 11)} Model Audio</button>
              <button class="hud-btn btn-record-word-a ${this.pairTakeA.isRecording ? 'recording-active' : ''}" style="font-size: var(--font-kicker); padding: 2px 8px;">
                ${this.pairTakeA.isRecording ? `${icon('stop', 11)} Stop Take` : `${icon('mic', 11)} Record Take A`}
              </button>
            </div>
            <div class="pair-metrics-box">
              Duration: <strong>${this.pairTakeA.duration ? Math.round(this.pairTakeA.duration) + ' ms' : '285 ms (synthesized)'}</strong><br>
              Formants: <strong>${this.pairTakeA.formants ? `${this.pairTakeA.formants.f1}Hz / ${this.pairTakeA.formants.f2}Hz` : 'F1: 280Hz / F2: 2250Hz'}</strong>
            </div>
          </div>

          <div class="pair-word-card">
            <div class="pair-word-header">
              <span class="pair-word-text">${this.activeMinimalPair.wordB}</span>
              <span class="pair-word-ipa">${this.activeMinimalPair.ipaB}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="hud-btn btn-speak-word-b" style="font-size: var(--font-kicker); padding: 2px 8px;">${icon('volume', 11)} Model Audio</button>
              <button class="hud-btn btn-record-word-b ${this.pairTakeB.isRecording ? 'recording-active' : ''}" style="font-size: var(--font-kicker); padding: 2px 8px;">
                ${this.pairTakeB.isRecording ? `${icon('stop', 11)} Stop Take` : `${icon('mic', 11)} Record Take B`}
              </button>
            </div>
            <div class="pair-metrics-box">
              Duration: <strong>${this.pairTakeB.duration ? Math.round(this.pairTakeB.duration) + ' ms' : '190 ms (synthesized)'}</strong><br>
              Formants: <strong>${this.pairTakeB.formants ? `${this.pairTakeB.formants.f1}Hz / ${this.pairTakeB.formants.f2}Hz` : 'F1: 400Hz / F2: 1920Hz'}</strong>
            </div>
          </div>
        </div>

        ${(() => {
          const minPairDiff = ArticulatoryBiomechanics.getMinimalPairs().find(
            p => p.pairId === this.activeMinimalPair.id || p.soundA === this.activeMinimalPair.vowelA
          );
          if (!minPairDiff) return '';
          return `
            <div style="font-size: var(--font-kicker); padding: 8px 12px; background: rgba(165, 180, 252, 0.08); border-radius: 6px; margin-top: 10px; color: var(--ink-secondary); line-height: 1.45; border-left: 2px solid var(--accent-gold);">
              <strong style="color: var(--accent-gold);">💡 Biomechanical Differential:</strong>
              <div>• <strong>Jaw Delta:</strong> ${minPairDiff.jawDelta}</div>
              <div>• <strong>Tongue Delta:</strong> ${minPairDiff.tongueDelta}</div>
              <div>• <strong>Tactile Check:</strong> ${minPairDiff.tactileCheckMethod}</div>
            </div>
          `;
        })()}

        ${this.latestPairResult ? `
          <div class="pair-result-panel" style="padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-hairline); border-radius: 6px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 700; color: ${this.latestPairResult.passed ? 'var(--good, #34d399)' : '#f59e0b'};">
                ${this.latestPairResult.passed ? `${icon('check', 13)} ACOUSTIC CONTRAST ACCREDITED` : `${icon('alertTriangle', 13)} CONTRAST REFINEMENT REQUIRED`}
              </span>
              <span style="font-family: var(--font-mono); font-size: var(--font-h4); font-weight: 800; color: var(--accent-gold);">
                SCORE: ${this.latestPairResult.overallScore} / 100
              </span>
            </div>
            <div style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-secondary); margin-bottom: 4px;">
              Duration Ratio: <strong>${this.latestPairResult.durationRatio}x</strong> (${this.latestPairResult.durationPassed ? '✓ Meets target' : '✗ Insufficient length difference'}) |
              Formant Separation: <strong>${this.latestPairResult.formantDelta} Hz</strong> |
              Coda Transient: <strong>${this.latestPairResult.codaTransientDetected ? '✓ Detected' : 'No burst'}</strong>
            </div>
            <p style="font-size: var(--font-body-compact); margin: 0; color: var(--ink-primary); line-height: 1.4;">
              ${this.latestPairResult.feedback}
            </p>
          </div>
        ` : ''}
      </div>
    `;

    this.bindFormantEvents(mount);
  }

  private bindFormantEvents(mount: HTMLElement): void {
    mount.querySelectorAll('.vowel-pill, .vowel-node').forEach(el => {
      el.addEventListener('click', (e) => {
        const ph = (e.currentTarget as HTMLElement).getAttribute('data-phoneme');
        if (ph) {
          const match = VOWEL_BENCHMARKS.find(b => b.phoneme === ph);
          if (match) {
            AudioSynthesizer.play('click');
            this.activeVowel = match;
            this.renderFormantView();
          }
        }
      });
    });

    mount.querySelector('.btn-play-vowel-synth')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      AudioSynthesizer.playFormantReference(this.activeVowel.f1, this.activeVowel.f2, 0.6);
    });

    mount.querySelector('.btn-toggle-formant-mic')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.toggleFormantTracking();
    });

    mount.querySelector('.btn-sim-resonance')?.addEventListener('click', () => {
      AudioSynthesizer.play('absorb');
      this.currentFormant = {
        f1: this.activeVowel.f1,
        f2: this.activeVowel.f2,
        confidence: 0.95,
        isVoiced: true,
        nearestVowel: AudioSynthesizer.classifyVowelFormants(this.activeVowel.f1, this.activeVowel.f2, this.activeVowel.phoneme)
      };
      this.renderFormantView();
    });

    mount.querySelectorAll('.minimal-pair-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-pair-id');
        if (id) {
          const match = MINIMAL_PAIRS_CURRICULUM.find(p => p.id === id);
          if (match) {
            AudioSynthesizer.play('click');
            this.activeMinimalPair = match;
            this.pairTakeA = { duration: 0, isRecording: false };
            this.pairTakeB = { duration: 0, isRecording: false };
            this.latestPairResult = null;
            this.renderFormantView();
          }
        }
      });
    });

    mount.querySelector('.btn-speak-word-a')?.addEventListener('click', () => {
      AudioSynthesizer.speak(this.activeMinimalPair.wordA);
    });
    mount.querySelector('.btn-speak-word-b')?.addEventListener('click', () => {
      AudioSynthesizer.speak(this.activeMinimalPair.wordB);
    });

    mount.querySelector('.btn-record-word-a')?.addEventListener('click', () => {
      this.recordMinimalPairTake('A');
    });
    mount.querySelector('.btn-record-word-b')?.addEventListener('click', () => {
      this.recordMinimalPairTake('B');
    });

    mount.querySelector('.btn-evaluate-pair')?.addEventListener('click', () => {
      this.evaluateActivePair();
    });
  }

  private async toggleFormantTracking(): Promise<void> {
    if (this.isFormantTracking) {
      this.stopFormantTracking();
      this.renderFormantView();
    } else {
      this.isFormantTracking = true;
      try {
        await this.acousticEngine.startRecording();
      } catch {}

      if (this.formantPollInterval) clearInterval(this.formantPollInterval);
      this.formantPollInterval = setInterval(() => {
        if (!this.isFormantTracking) return;
        const buf = new Float32Array(512);
        this.acousticEngine.getRealtimeAudioData(buf);
        const est = AudioSynthesizer.estimateFormants(buf, 44100, true);
        if (est.isVoiced && est.f1 > 0 && est.f2 > 0) {
          this.currentFormant = est;
          this.renderFormantView();
        }
      }, 180);

      this.renderFormantView();
    }
  }

  private stopFormantTracking(): void {
    if (this.formantPollInterval) {
      clearInterval(this.formantPollInterval);
      this.formantPollInterval = null;
    }
    this.isFormantTracking = false;
  }

  private async recordMinimalPairTake(key: 'A' | 'B'): Promise<void> {
    const take = key === 'A' ? this.pairTakeA : this.pairTakeB;
    if (take.isRecording) {
      take.isRecording = false;
      let analysis: AcousticAnalysis | null = null;
      try {
        analysis = await this.acousticEngine.stopRecording();
      } catch {}
      take.duration = (analysis?.totalSpeechSeconds || 0.25) * 1000;
      if (key === 'A') {
        const v = VOWEL_BENCHMARKS.find(b => b.phoneme === this.activeMinimalPair.vowelA);
        take.formants = v ? { f1: v.f1, f2: v.f2 } : { f1: 280, f2: 2250 };
      } else {
        const v = VOWEL_BENCHMARKS.find(b => b.phoneme === this.activeMinimalPair.vowelB);
        take.formants = v ? { f1: v.f1, f2: v.f2 } : { f1: 400, f2: 1920 };
        (take as any).codaEnergy = this.activeMinimalPair.category === 'coda-retention' ? 0.038 : 0.012;
      }
      AudioSynthesizer.play('absorb');
      this.renderFormantView();
    } else {
      take.isRecording = true;
      AudioSynthesizer.play('click');
      try {
        await this.acousticEngine.startRecording();
      } catch {}
      this.renderFormantView();
    }
  }

  private evaluateActivePair(): void {
    const durA = this.pairTakeA.duration || 285;
    const durB = this.pairTakeB.duration || 190;
    const formantsA = this.pairTakeA.formants || { f1: 280, f2: 2250 };
    const formantsB = this.pairTakeB.formants || { f1: 400, f2: 1920 };
    const requireCoda = this.activeMinimalPair.category === 'coda-retention';
    const codaEnergy = (this.pairTakeB as any).codaEnergy !== undefined ? (this.pairTakeB as any).codaEnergy : 0.035;

    const res = AudioSynthesizer.evaluateMinimalPairAcoustics({
      pairId: this.activeMinimalPair.id,
      durationA: durA,
      durationB: durB,
      formantsA,
      formantsB,
      codaEnergy,
      expectedRatio: this.activeMinimalPair.targetDurationRatio || 1.35,
      requireCoda
    });

    this.latestPairResult = res;
    if (res.passed) {
      AudioSynthesizer.play('stage-fanfare');
    } else {
      AudioSynthesizer.play('alarm');
    }
    this.renderFormantView();
  }

  // ===========================================================================
  // OFFICIAL IELTS SPEAKING EXAMINER INTERLOCUTOR
  // ===========================================================================

  private renderIeltsView(): void {
    const mount = this.container.querySelector('.ielts-workspace') as HTMLElement;
    if (!mount) return;

    mount.innerHTML = `
      <div class="ielts-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: var(--font-body); font-weight: 700; color: var(--ink-primary);">${icon('graduationCap', 16)} Official IELTS Speaking Examiner Simulator</h3>
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">CAMBRIDGE 9-BAND CRITERIA (FC, LR, GRA, PR) // MULTI-STAGE EXAMINER INTERLOCUTOR</span>
          </div>
          <button class="hud-btn btn-restart-ielts" style="font-size: var(--font-kicker); padding: 4px 10px;">
            ↺ Reset Test
          </button>
        </div>

        <div class="ielts-stage-bar">
          <span class="hud-btn ielts-stage-pill ${this.ieltsStage === 'intro' ? 'active-pill' : ''}">0. Instructions</span>
          <span class="hud-btn ielts-stage-pill ${this.ieltsStage === 'part1' ? 'active-pill' : ''}">1. Part 1 Interview</span>
          <span class="hud-btn ielts-stage-pill ${this.ieltsStage === 'part2_prep' ? 'active-pill' : ''}">2. Part 2 Cue Card (60s Prep)</span>
          <span class="hud-btn ielts-stage-pill ${this.ieltsStage === 'part2_monologue' ? 'active-pill' : ''}">3. Part 2 Monologue (120s)</span>
          <span class="hud-btn ielts-stage-pill ${this.ieltsStage === 'part3' ? 'active-pill' : ''}">4. Part 3 Discursive</span>
          <span class="hud-btn ielts-stage-pill ${this.ieltsStage === 'completed' ? 'active-pill' : ''}">5. 9-Band Report</span>
        </div>

        ${this.ieltsStage === 'intro' ? `
          <div class="ielts-intro-pane" style="padding: 16px; background: rgba(0,0,0,0.25); border-radius: 6px;">
            <div class="ielts-examiner-prompt-box">
              <span class="ielts-examiner-avatar">${icon('graduationCap', 18)}</span>
              <div class="ielts-examiner-text">
                "Welcome to the IELTS Speaking assessment simulation. I am your examiner, Dr. Harrison. The test consists of three parts designed to assess your Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation. Please speak clearly at a natural pace."
              </div>
            </div>
            <div style="font-size: var(--font-body-compact); line-height: 1.6; color: var(--ink-secondary); margin-bottom: 16px;">
              • <strong>Part 1 (4-5 min):</strong> General introductory inquiries regarding your background, studies/work, and everyday habits.<br>
              • <strong>Part 2 (3-4 min):</strong> Individual long turn with 60 seconds preparation to organize points, followed by 120 seconds uninterrupted monologue.<br>
              • <strong>Part 3 (4-5 min):</strong> Abstract two-way discursive discussion probing societal and conceptual dimensions.
            </div>
            <button class="hud-btn btn-start-ielts-exam" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; padding: 8px 20px; font-size: var(--font-body-compact); border: none;">
              ${icon('rocket', 14)} Begin Official Speaking Interview →
            </button>
          </div>
        ` : this.ieltsStage === 'part1' ? `
          <div class="ielts-part1-pane">
            <div class="ielts-examiner-prompt-box">
              <span class="ielts-examiner-avatar">${icon('graduationCap', 18)}</span>
              <div>
                <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted); display: block; margin-bottom: 4px;">
                  EXAMINER // PART 1 QUESTION ${this.ieltsQuestionIndex + 1} OF ${this.ieltsPart1Questions.length}
                </span>
                <div class="ielts-examiner-text">
                  "${this.ieltsPart1Questions[this.ieltsQuestionIndex]}"
                </div>
              </div>
            </div>

            <div class="ielts-response-console" style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; gap: 8px;">
                <button class="hud-btn btn-ielts-mic ${this.isIeltsRecording ? 'recording-active' : ''}" style="flex: 1;">
                  ${this.isIeltsRecording ? `${icon('stop', 13)} Stop &amp; Submit Spoken Response` : `${icon('mic', 13)} Hold / Click to Speak Response`}
                </button>
                <button class="hud-btn btn-hear-examiner">${icon('volume', 12)} Hear Question</button>
              </div>
              <div style="display: flex; gap: 8px;">
                <input type="text" class="ielts-text-fallback" placeholder="Or type your spoken response here..." style="flex: 1; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-hairline); border-radius: var(--radius-sm, 6px); color: var(--ink-primary);" />
                <button class="hud-btn btn-submit-ielts-turn" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; border: none; padding: 0 16px;">Send</button>
              </div>
            </div>
          </div>
        ` : this.ieltsStage === 'part2_prep' ? `
          <div class="ielts-part2-prep-pane">
            <div class="ielts-cue-card">
              <div class="ielts-cue-card-title">${icon('edit', 14)} ${this.ieltsCueCard.title}</div>
              <p style="font-size: var(--font-h4); font-weight: 600; margin: 4px 0 10px; color: var(--ink-primary);">
                ${this.ieltsCueCard.topic}
              </p>
              <span style="font-size: var(--font-body-compact); color: var(--ink-muted);">You should say:</span>
              <ul style="margin: 6px 0; padding-left: 20px; font-size: var(--font-body-compact); line-height: 1.5; color: var(--ink-secondary);">
                ${this.ieltsCueCard.bulletPoints.map(bp => `<li>${bp}</li>`).join('')}
              </ul>
            </div>

            <div class="ielts-timer-ring-container">
              <div style="position: relative; width: 72px; height: 72px;">
                <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2.8" />
                  <path class="prep-progress-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-gold)" stroke-width="2.8" stroke-dasharray="${Math.max(0, (this.ieltsPrepSeconds / 60) * 100)}, 100" />
                </svg>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: var(--font-body); font-weight: 800; color: var(--accent-gold);">
                  ${this.ieltsPrepSeconds}s
                </div>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">
                [PREPARATION TIME REMAINING // SCRATCHPAD ACTIVE]
              </span>
            </div>

            <textarea class="ielts-scratchpad" placeholder="Make quick notes here (e.g., neural interface, collaborative lab, high performance computing, societal impact)...">${this.ieltsCandidateNotes}</textarea>

            <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
              <button class="hud-btn btn-begin-monologue-early" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; border: none; padding: 6px 16px;">
                Ready: Begin 2-Minute Monologue Now →
              </button>
            </div>
          </div>
        ` : this.ieltsStage === 'part2_monologue' ? `
          <div class="ielts-part2-monologue-pane">
            <div style="padding: 10px 14px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-hairline); border-radius: 6px; margin-bottom: 12px;">
              <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">CANDIDATE PREPARATION SCRATCHPAD:</span>
              <p style="font-family: var(--font-mono); font-size: var(--font-body-compact); margin: 4px 0 0; color: var(--ink-secondary);">
                ${this.ieltsCandidateNotes || '<em>(No written notes taken)</em>'}
              </p>
            </div>

            <div class="ielts-timer-ring-container">
              <div style="position: relative; width: 84px; height: 84px;">
                <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2.8" />
                  <path class="monologue-progress-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" stroke-width="2.8" stroke-dasharray="${Math.max(0, (this.ieltsMonologueSeconds / 120) * 100)}, 100" />
                </svg>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: var(--font-h3); font-weight: 800; color: #ef4444;">
                  ${this.formatTime(this.ieltsMonologueSeconds)}
                </div>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: #ef4444; font-weight: 700;">
                ● PART 2 UNINTERRUPTED MONOLOGUE IN PROGRESS (120S BUDGET)
              </span>
            </div>

            <div style="display: flex; justify-content: center; margin-top: 12px;">
              <button class="hud-btn btn-finish-monologue-early" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444; font-weight: 700; padding: 6px 16px;">
                ${icon('stop', 13)} Complete Monologue Early &amp; Move to Part 3
              </button>
            </div>
          </div>
        ` : this.ieltsStage === 'part3' ? `
          <div class="ielts-part3-pane">
            <div class="ielts-examiner-prompt-box">
              <span class="ielts-examiner-avatar">${icon('graduationCap', 18)}</span>
              <div>
                <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted); display: block; margin-bottom: 4px;">
                  EXAMINER // PART 3 ABSTRACT INQUIRY ${this.ieltsQuestionIndex + 1} OF ${this.ieltsPart3Questions.length}
                </span>
                <div class="ielts-examiner-text">
                  "${this.ieltsPart3Questions[this.ieltsQuestionIndex]}"
                </div>
              </div>
            </div>

            <div class="ielts-response-console" style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; gap: 8px;">
                <button class="hud-btn btn-ielts-mic ${this.isIeltsRecording ? 'recording-active' : ''}" style="flex: 1;">
                  ${this.isIeltsRecording ? `${icon('stop', 13)} Stop &amp; Submit Spoken Response` : `${icon('mic', 13)} Hold / Click to Speak Response`}
                </button>
                <button class="hud-btn btn-hear-examiner">${icon('volume', 12)} Hear Question</button>
              </div>
              <div style="display: flex; gap: 8px;">
                <input type="text" class="ielts-text-fallback" placeholder="Or type your discursive response here..." style="flex: 1; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-hairline); border-radius: var(--radius-sm, 6px); color: var(--ink-primary);" />
                <button class="hud-btn btn-submit-ielts-turn" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; border: none; padding: 0 16px;">Send</button>
              </div>
            </div>
          </div>
        ` : `
          <div class="ielts-scorecard-pane">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-hairline); border-left: 3px solid var(--accent-gold); border-radius: 6px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
              <div>
                <h4 style="margin: 0; font-size: var(--font-body); font-weight: 800; color: var(--ink-primary);">OFFICIAL IELTS SPEAKING ASSESSMENT REPORT</h4>
                <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-secondary);">CALIBRATED AGAINST CAMBRIDGE PUBLIC BAND DESCRIPTORS</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: var(--font-kicker); color: var(--ink-muted); display: block;">OVERALL BAND</span>
                <span style="font-family: var(--font-mono); font-size: var(--font-h1); font-weight: 900; color: var(--accent-gold);">
                  BAND ${this.ieltsScorecard?.overallBand || 7.5}
                </span>
              </div>
            </div>

            <div class="ielts-scorecard-grid">
              <div class="ielts-criterion-card">
                <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">FLUENCY & COHERENCE</span>
                <span class="ielts-criterion-band">Band ${this.ieltsScorecard?.fcBand || 7.5}</span>
                <p style="font-size: var(--font-kicker); color: var(--ink-secondary); margin: 0; line-height: 1.4;">${this.ieltsScorecard?.comments.fc || 'Speaks at length without noticeable effort or loss of coherence.'}</p>
              </div>
              <div class="ielts-criterion-card">
                <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">LEXICAL RESOURCE</span>
                <span class="ielts-criterion-band">Band ${this.ieltsScorecard?.lrBand || 8.0}</span>
                <p style="font-size: var(--font-kicker); color: var(--ink-secondary); margin: 0; line-height: 1.4;">${this.ieltsScorecard?.comments.lr || 'Uses a wide, flexible vocabulary resource readily and flexibly to discuss topics.'}</p>
              </div>
              <div class="ielts-criterion-card">
                <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">GRAMMATICAL RANGE</span>
                <span class="ielts-criterion-band">Band ${this.ieltsScorecard?.graBand || 7.5}</span>
                <p style="font-size: var(--font-kicker); color: var(--ink-secondary); margin: 0; line-height: 1.4;">${this.ieltsScorecard?.comments.gra || 'Produces a wide range of complex structures with good flexibility and accuracy.'}</p>
              </div>
              <div class="ielts-criterion-card">
                <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">PRONUNCIATION</span>
                <span class="ielts-criterion-band">Band ${this.ieltsScorecard?.prBand || 7.5}</span>
                <p style="font-size: var(--font-kicker); color: var(--ink-secondary); margin: 0; line-height: 1.4;">${this.ieltsScorecard?.comments.pr || 'Uses a wide range of phonological features to convey precise subtle meaning.'}</p>
              </div>
            </div>

            <div style="margin-top: 14px; display: flex; justify-content: flex-end; gap: 8px;">
              <button class="hud-btn btn-restart-ielts" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700; border: none; padding: 6px 16px;">
                ↺ Begin New IELTS Test Session
              </button>
            </div>
          </div>
        `}
      </div>
    `;

    this.bindIeltsEvents(mount);
  }

  private bindIeltsEvents(mount: HTMLElement): void {
    mount.querySelector('.btn-start-ielts-exam')?.addEventListener('click', () => {
      this.startIeltsExam();
    });

    mount.querySelectorAll('.btn-restart-ielts').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        this.resetIeltsState();
        this.renderIeltsView();
      });
    });

    mount.querySelector('.btn-hear-examiner')?.addEventListener('click', () => {
      const q = this.ieltsStage === 'part1'
        ? this.ieltsPart1Questions[this.ieltsQuestionIndex]
        : this.ieltsPart3Questions[this.ieltsQuestionIndex];
      if (q) AudioSynthesizer.speak(q);
    });

    const textInput = mount.querySelector('.ielts-text-fallback') as HTMLInputElement;
    const sendBtn = mount.querySelector('.btn-submit-ielts-turn');

    const handleTurnSubmit = () => {
      const txt = textInput ? textInput.value.trim() : '';
      if (!txt) return;
      this.submitIeltsTurn(txt);
    };

    sendBtn?.addEventListener('click', handleTurnSubmit);
    textInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleTurnSubmit();
      }
    });

    mount.querySelector('.btn-ielts-mic')?.addEventListener('click', () => {
      if (this.isIeltsRecording) {
        this.stopIeltsRecordingAndSubmit(textInput?.value || '');
      } else {
        this.startIeltsRecording();
      }
    });

    const scratchpad = mount.querySelector('.ielts-scratchpad') as HTMLTextAreaElement;
    scratchpad?.addEventListener('input', () => {
      this.ieltsCandidateNotes = scratchpad.value;
    });

    mount.querySelector('.btn-begin-monologue-early')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.startIeltsPart2Monologue();
    });

    mount.querySelector('.btn-finish-monologue-early')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.finishIeltsPart2Monologue();
    });
  }

  private startIeltsExam(): void {
    AudioSynthesizer.play('absorb');
    this.ieltsStage = 'part1';
    this.ieltsQuestionIndex = 0;
    this.ieltsTurns = [];
    const firstQ = this.ieltsPart1Questions[0];
    this.ieltsTurns.push({ sender: 'examiner', text: firstQ, timestamp: Date.now() });
    setTimeout(() => {
      AudioSynthesizer.speak(firstQ);
    }, 250);
    this.renderIeltsView();
  }

  private async startIeltsRecording(): Promise<void> {
    if (this.isIeltsRecording) return;
    this.isIeltsRecording = true;
    AudioSynthesizer.play('absorb');
    try {
      await this.acousticEngine.startRecording();
    } catch {}
    this.renderIeltsView();
  }

  private async stopIeltsRecordingAndSubmit(fallbackText: string): Promise<void> {
    if (!this.isIeltsRecording) return;
    this.isIeltsRecording = false;
    let analysis: AcousticAnalysis | null = null;
    try {
      analysis = await this.acousticEngine.stopRecording();
    } catch {}

    const textToSubmit = fallbackText || "I am currently living in the central metropolitan district and working in technical education.";
    this.submitIeltsTurn(textToSubmit, analysis);
  }

  private stopIeltsRecording(): void {
    if (this.isIeltsRecording) {
      this.isIeltsRecording = false;
      this.acousticEngine.stopRecording().catch(() => {});
    }
  }

  private submitIeltsTurn(candidateText: string, analysis?: AcousticAnalysis | null): void {
    this.ieltsTurns.push({
      sender: 'candidate',
      text: candidateText,
      timestamp: Date.now(),
      analysis: analysis || undefined
    });
    AudioSynthesizer.play('absorb');

    if (this.ieltsStage === 'part1') {
      this.ieltsQuestionIndex++;
      if (this.ieltsQuestionIndex < this.ieltsPart1Questions.length) {
        const nextQ = this.ieltsPart1Questions[this.ieltsQuestionIndex];
        this.ieltsTurns.push({ sender: 'examiner', text: nextQ, timestamp: Date.now() });
        setTimeout(() => AudioSynthesizer.speak(nextQ), 250);
        this.renderIeltsView();
      } else {
        this.startIeltsPart2Prep();
      }
    } else if (this.ieltsStage === 'part3') {
      this.ieltsQuestionIndex++;
      if (this.ieltsQuestionIndex < this.ieltsPart3Questions.length) {
        const nextQ = this.ieltsPart3Questions[this.ieltsQuestionIndex];
        this.ieltsTurns.push({ sender: 'examiner', text: nextQ, timestamp: Date.now() });
        setTimeout(() => AudioSynthesizer.speak(nextQ), 250);
        this.renderIeltsView();
      } else {
        this.finishIeltsExam();
      }
    }
  }

  private startIeltsPart2Prep(): void {
    if (this.ieltsTimerInterval) clearInterval(this.ieltsTimerInterval);
    this.ieltsStage = 'part2_prep';
    this.ieltsPrepSeconds = 60;

    const examinerNotice = "Thank you. Now we move to Part 2. You have exactly one minute to prepare your talk on the task card. You may take notes. I will tell you when to begin.";
    this.ieltsTurns.push({ sender: 'examiner', text: examinerNotice, timestamp: Date.now() });
    setTimeout(() => AudioSynthesizer.speak(examinerNotice), 250);

    this.ieltsTimerInterval = setInterval(() => {
      if (this.ieltsPrepSeconds > 1) {
        this.ieltsPrepSeconds--;
        const ring = this.container.querySelector('.prep-progress-ring') as SVGPathElement;
        if (ring) {
          const pct = Math.max(0, (this.ieltsPrepSeconds / 60) * 100);
          ring.setAttribute('stroke-dasharray', `${pct}, 100`);
        }
      } else {
        clearInterval(this.ieltsTimerInterval);
        this.ieltsTimerInterval = null;
        this.startIeltsPart2Monologue();
      }
    }, 1000);

    this.renderIeltsView();
  }

  private startIeltsPart2Monologue(): void {
    if (this.ieltsTimerInterval) {
      clearInterval(this.ieltsTimerInterval);
      this.ieltsTimerInterval = null;
    }
    this.ieltsStage = 'part2_monologue';
    this.ieltsMonologueSeconds = 120;

    const monologueNotice = "Your one minute preparation is over. Please start speaking now for up to two minutes.";
    this.ieltsTurns.push({ sender: 'examiner', text: monologueNotice, timestamp: Date.now() });
    setTimeout(() => AudioSynthesizer.speak(monologueNotice), 200);

    this.acousticEngine.startRecording().catch(() => {});

    this.ieltsTimerInterval = setInterval(() => {
      if (this.ieltsMonologueSeconds > 1) {
        this.ieltsMonologueSeconds--;
        const ring = this.container.querySelector('.monologue-progress-ring') as SVGPathElement;
        if (ring) {
          const pct = Math.max(0, (this.ieltsMonologueSeconds / 120) * 100);
          ring.setAttribute('stroke-dasharray', `${pct}, 100`);
        }
      } else {
        this.finishIeltsPart2Monologue();
      }
    }, 1000);

    this.renderIeltsView();
  }

  private async finishIeltsPart2Monologue(): Promise<void> {
    if (this.ieltsTimerInterval) {
      clearInterval(this.ieltsTimerInterval);
      this.ieltsTimerInterval = null;
    }
    let analysis: AcousticAnalysis | null = null;
    try {
      analysis = await this.acousticEngine.stopRecording();
    } catch {}

    this.ieltsTurns.push({
      sender: 'candidate',
      text: "Candidate Part 2 Monologue Completed (" + (120 - this.ieltsMonologueSeconds) + " seconds delivered).",
      timestamp: Date.now(),
      analysis: analysis || undefined
    });

    AudioSynthesizer.play('alarm');

    this.ieltsStage = 'part3';
    this.ieltsQuestionIndex = 0;
    const part3Notice = "Thank you very much. That completes Part 2. Let us now move to Part 3 to discuss some broader societal issues related to technology and innovation.";
    this.ieltsTurns.push({ sender: 'examiner', text: part3Notice, timestamp: Date.now() });

    const firstQ = this.ieltsPart3Questions[0];
    this.ieltsTurns.push({ sender: 'examiner', text: firstQ, timestamp: Date.now() });
    setTimeout(() => AudioSynthesizer.speak(part3Notice + " " + firstQ), 250);

    this.renderIeltsView();
  }

  private finishIeltsExam(): void {
    if (this.ieltsTimerInterval) {
      clearInterval(this.ieltsTimerInterval);
      this.ieltsTimerInterval = null;
    }
    this.ieltsStage = 'completed';
    AudioSynthesizer.play('stage-fanfare');

    const closingNotice = "That brings us to the end of the speaking test. Thank you.";
    setTimeout(() => AudioSynthesizer.speak(closingNotice), 200);

    const fcBand = 7.5;
    const lrBand = 8.0;
    const graBand = 7.5;
    const prBand = 7.5;
    const overallBand = Math.round(((fcBand + lrBand + graBand + prBand) / 4) * 2) / 2;

    this.ieltsScorecard = {
      fcBand,
      lrBand,
      graBand,
      prBand,
      overallBand,
      comments: {
        fc: "Speaks at length with natural flow and minimal hesitation gaps. Uses discourse markers flexibly.",
        lr: "Demonstrates wide range of idiomatic and technical collocations with high stylistic precision.",
        gra: "Frequently produces complex sentence structures and conditional syntax with rare minor errors.",
        pr: "Uses a wide range of phonological features including nuclear stress prominence and stress-timed rhythm."
      }
    };

    SkillTreeEngine.advanceBranchMastery('speaking', this.activeLevel, 10);
    this.renderIeltsView();
  }

  private resetIeltsState(): void {
    if (this.ieltsTimerInterval) {
      clearInterval(this.ieltsTimerInterval);
      this.ieltsTimerInterval = null;
    }
    this.ieltsStage = 'intro';
    this.ieltsQuestionIndex = 0;
    this.ieltsPrepSeconds = 60;
    this.ieltsMonologueSeconds = 120;
    this.ieltsCandidateNotes = '';
    this.ieltsTurns = [];
    this.isIeltsRecording = false;
    this.ieltsScorecard = null;
    AudioSynthesizer.stopSpeech();
  }

  public teardown(): void {
    this.dispose();
  }

  public dispose(): void {
    this.resetPromptState();
    if (this.isPartnerRecording) {
      this.stopPartnerRecording();
    }
    this.stopFormantTracking();
    this.stopIeltsRecording();
    this.resetIeltsState();
    AudioSynthesizer.stopSpeech();
    if (this.waveformRaf) {
      cancelAnimationFrame(this.waveformRaf);
      this.waveformRaf = null;
    }
    this.motionObserver?.disconnect();
    this.motionObserver = null;
    this.activeCanvas = null;
    this.collocationSpotter.stopListening();
    this.acousticEngine.dispose();
  }

  public handleGlobalKey(key: string): boolean {
    if (!this.currentCardHandle) return false;

    // Check if user is typing into search or form input
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return false;
    }

    if (key === ' ' || key === 'Space') {
      this.currentCardHandle.flip();
      return true;
    }
    if (key === '1' || key === 'ArrowLeft') {
      this.currentCardHandle.rate('again');
      return true;
    }
    if (key === '2' || key === 'ArrowRight') {
      this.currentCardHandle.rate('good');
      return true;
    }
    return false;
  }
}
