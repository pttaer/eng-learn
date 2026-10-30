import { Cefr, CEFR_ORDER, CEFR_LABELS, cefrIndex } from '../core/cefr';
import { SkillId, ALL_SKILLS, SkillProfile, StorageManager } from '../utils/storage';
import { icon, IconName } from '../utils/icons';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import diagnosticDataRaw from '../assets/data/diagnostic-questions.json';
import { feedback } from '../core/feedback';
import { t } from '../core/i18n';

export interface DiagnosticQuestionItem {
  id: string;
  level: Cefr;
  skill: string;
  stage: number;
  prompt: string;
  context?: string;
  options: string[];
  answer: number;
  explanation?: string;
  vietnamese?: string;
  audioText?: string;
  audioPrompt?: string;
  ipa?: string;
  phonetics?: string;
  gapTarget?: string;
}

export interface StageDefinition {
  stageNumber: number;
  skillId: SkillId;
  name: string;
  label: string;
  iconName: IconName;
  briefing: string;
}

export const STAGES: readonly StageDefinition[] = [
  {
    stageNumber: 1,
    skillId: 'vocab',
    name: 'Vocabulary & Collocations',
    label: 'VOCAB',
    iconName: 'book',
    briefing: 'Evaluating lexical precision, academic word choices, and high-frequency collocations.'
  },
  {
    stageNumber: 2,
    skillId: 'grammar',
    name: 'Grammar & Syntax',
    label: 'GRAMMAR',
    iconName: 'zap',
    briefing: 'Assessing syntactic structures, clausal condensation, inversion, and repair.'
  },
  {
    stageNumber: 3,
    skillId: 'reading',
    name: 'Reading Comprehension',
    label: 'READING',
    iconName: 'eye',
    briefing: 'Testing inference, contextual discourse decoding, and academic cloze comprehension.'
  },
  {
    stageNumber: 4,
    skillId: 'listening',
    name: 'Listening & Phonetics',
    label: 'LISTENING',
    iconName: 'volume',
    briefing: 'Decoding connected speech, catenation, elision, weak forms, and assimilation.'
  },
  {
    stageNumber: 5,
    skillId: 'writing',
    name: 'Writing & Precision',
    label: 'WRITING',
    iconName: 'landmark',
    briefing: 'Evaluating rhetorical register, cohesive devices, and formal syntactic elegance.'
  }
];

// Fallback curated questions for listening (Stage 4) across A1-C2
// Fallback curated questions for listening (Stage 4) across A1-C2
const CURATED_LISTENING_QUESTIONS: DiagnosticQuestionItem[] = [
  {
    id: 'diag-a1-listen',
    level: 'A1',
    skill: 'listening',
    stage: 4,
    prompt: 'Listen to the greeting. Which words show weak form reduction in connected speech?',
    context: 'Pay attention to how function words sound in natural, rapid speech.',
    audioText: 'Nice to meet you. How are you?',
    phonetics: "Function words 'to' and 'are' reduce in unstressed position; content words stay full.",
    gapTarget: 'to are',
    options: [
      "Function words 'to' and 'are'",
      "Content words 'nice' and 'you'",
      "Stressed syllables 'meet' and 'how'",
      "All words equally stressed"
    ],
    answer: 0,
    explanation: "In natural speech, unstressed function words 'to' and 'are' reduce to weak forms. Content and stressed words retain their full pronunciation.",
    vietnamese: "Khi nói chuyện tự nhiên, các từ chức năng như 'to' và 'are' thường đọc lướt ở dạng yếu (weak form), nhường trọng âm cho các từ mang nghĩa chính."
  },
  {
    id: 'diag-a2-listen',
    level: 'A2',
    skill: 'listening',
    stage: 4,
    prompt: 'Listen to the question. Identify the phrase where sound changes occur between words:',
    context: 'Listen for how consonants and vowels blend at word boundaries.',
    audioText: 'Could you tell me the way to the station?',
    phonetics: 'Palatal assimilation: the /d/ in "Could" + /j/ of "you" merge into /dʒ/.',
    gapTarget: 'could you',
    options: [
      "'tell me' shows linking with no sound change",
      "'Could you' undergoes palatal assimilation: /d/ + /j/ merge to /dʒ/",
      "'the way' creates an intrusive vowel",
      "'station' exhibits elision of the middle vowel"
    ],
    answer: 1,
    explanation: "'Could you' demonstrates palatal assimilation where the final /d/ and initial /j/ combine into /dʒ/, a common feature in rapid English speech.",
    vietnamese: "'Could you' là hiện tượng đồng hóa âm (palatal assimilation): âm /d/ cuối gặp âm /j/ đầu từ sau sẽ hòa thành /dʒ/."
  },
  {
    id: 'diag-b1-listen',
    level: 'B1',
    skill: 'listening',
    stage: 4,
    prompt: 'Listen to the sentence. Which phrase shows smooth linking across word boundaries?',
    context: 'Focus on how the words connect naturally when spoken quickly.',
    audioText: 'What looks like patience is usually just a system that keeps working while you are not looking at it.',
    phonetics: 'Word-internal linking: consonants carry into following vowels creating fluid rhythm.',
    gapTarget: 'looking at it',
    options: [
      "'looking at it' links smoothly with no break between words",
      "'what looks' shows stress shift to the second word",
      "'system that' demonstrates complete elision of final /m/",
      "'while you' preserves a full glottal stop"
    ],
    answer: 0,
    explanation: "In fast speech, 'looking at it' links together into [lʊkɪŋæt̚ɪt], carrying consonants into the next vowels without pauses between words.",
    vietnamese: "Khi nói nhanh, cụm 'looking at it' được nối âm liền mạch [lʊkɪŋæt̚ɪt], không bị ngắt quãng giữa các từ."
  },
  {
    id: 'diag-b2-listen',
    level: 'B2',
    skill: 'listening',
    stage: 4,
    prompt: 'Listen to the phrase and identify which sound change occurs at the word boundary:',
    context: 'Focus on consonant behavior where words meet in natural speech tempo.',
    audioText: 'Without arbitrary limitations to direct their focus, most creators fall prey to the paralysis of infinite choice.',
    phonetics: "Stop deletion: /t/ in 'most' deletes before /k/ in 'creators' (both alveolar/velar stops).",
    gapTarget: 'most creators',
    options: [
      "Linking: final consonant carries into the vowel of next word",
      "Gemination: the /t/ doubles before the following stop",
      "Stop elision: /t/ in 'most' disappears before /k/ in 'creators'",
      "Assimilation: /t/ becomes /k/ before 'creators'"
    ],
    answer: 2,
    explanation: "In rapid speech, the final /t/ in 'most' is deleted when followed by another stop /k/ in 'creators', creating the abbreviated [moʊs kriˈeɪtəz].",
    vietnamese: "Trong ngữ lưu nhanh, âm /t/ cuối từ 'most' được lược bỏ khi đứng liền trước phụ âm tắc /k/ của 'creators'."
  },
  {
    id: 'diag-c1-listen',
    level: 'C1',
    skill: 'listening',
    stage: 4,
    prompt: 'Listen to the opening of the passage. Which phrase demonstrates smooth linking in rapid speech?',
    context: 'Pay attention to how unstressed syllables blend together naturally.',
    audioText: 'In an era dominated by algorithmic feed optimization, the human cognitive bandwidth has become the ultimate scarce commodity.',
    phonetics: 'Nasal+vowel linking: /ɪn/ + /ən/ + /ˈɪərə/ flow as one acoustic unit in rapid tempo.',
    gapTarget: 'in an era',
    options: [
      "Consonant drop: all initial consonants delete to accelerate speech",
      "Vowel linking: unstressed vowels merge across word boundaries seamlessly",
      "Syllable reduction: secondary syllables lose all vowel quality",
      "Stress shift: main stress transfers to the final word of the phrase"
    ],
    answer: 1,
    explanation: "The phrase 'in an era' shows characteristic vowel linking where unstressed vowels flow together in rapid connected speech without clear word breaks.",
    vietnamese: "Cụm 'in an era' nối liền các nguyên âm không nhấn với nhau, tạo thành luồng âm thanh mượt mà không ngắt quãng."
  },
  {
    id: 'diag-c2-listen',
    level: 'C2',
    skill: 'listening',
    stage: 4,
    prompt: 'Listen to the passage. Identify the phonological features of rapid native-like delivery:',
    context: 'Focus on the naturalness and fluency of the connected speech.',
    audioText: 'The ephemeral cadence of colloquial discourse often obfuscates deeply entrenched dialectal idiosyncrasies.',
    phonetics: 'Native delivery: unreleased stops, vowel reduction in weak syllables, elastic rhythm to content.',
    gapTarget: 'colloquial discourse',
    options: [
      'Identical syllable length with careful enunciation of all vowels',
      'Each word pronounced as listed in dictionary without connected speech changes',
      'Monotone pitch on all syllables without rising or falling intonation',
      'Unreleased stops, vowel reduction, and variable timing on content words'
    ],
    answer: 3,
    explanation: 'Fast natural speech drops or leaves final stops unreleased, reduces unstressed vowels, and stretches stressed words for emphasis.',
    vietnamese: "Người bản xứ khi nói nhanh thường nuốt âm tắc cuối (unreleased stop), giảm nhẹ các nguyên âm không mang trọng âm và nhấn mạnh vào từ quan trọng."
  }
];

export interface ListeningPromptOptions {
  question: DiagnosticQuestionItem;
  speechRate?: number;
  onRateChange?: (rate: number) => void;
  onAnswer?: (choiceIndex: number, isCorrect: boolean) => void;
  onGapSubmit?: (userText: string, isCorrect: boolean) => void;
}

export class ListeningPromptComponent {
  private element: HTMLElement;
  private question: DiagnosticQuestionItem;
  private speechRate: number = 1.0;
  private isHintOpen: boolean = false;
  private onRateChange?: (rate: number) => void;
  private onAnswer?: (choiceIndex: number, isCorrect: boolean) => void;
  private onGapSubmit?: (userText: string, isCorrect: boolean) => void;

  constructor(options: ListeningPromptOptions) {
    this.question = options.question;
    this.speechRate = options.speechRate ?? 1.0;
    this.onRateChange = options.onRateChange;
    this.onAnswer = options.onAnswer;
    this.onGapSubmit = options.onGapSubmit;

    this.element = document.createElement('div');
    this.element.className = 'listening-prompt-card';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public isHintVisible(): boolean {
    return this.isHintOpen;
  }

  public playAudio(rate?: number): void {
    const r = rate ?? this.speechRate;
    const textToSpeak = this.question.audioPrompt || this.question.audioText || this.question.context || this.question.prompt;
    AudioSynthesizer.speak(textToSpeak, r);
  }

  public setSpeed(rate: number): void {
    this.speechRate = rate;
    this.element.querySelectorAll<HTMLElement>('.btn-speed').forEach(btn => {
      const s = Number(btn.dataset.speed);
      const isActive = Math.abs(s - this.speechRate) < 0.01;
      btn.classList.toggle('active-speed', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    AudioSynthesizer.play('click');
    this.playAudio(rate);
    this.onRateChange?.(rate);
  }

  public togglePhoneticHint(): boolean {
    this.isHintOpen = !this.isHintOpen;
    const hintBox = this.element.querySelector('.phonetic-hint-box') as HTMLElement | null;
    const hintBtn = this.element.querySelector('.btn-phonetic-hint') as HTMLElement | null;

    if (hintBox) {
      hintBox.style.display = this.isHintOpen ? 'block' : 'none';
      if (this.isHintOpen) {
        feedback.emit({ type: 'hint', text: '' }, hintBox);
      } else {
        AudioSynthesizer.play('click');
      }
    }
    if (hintBtn) {
      hintBtn.setAttribute('aria-expanded', String(this.isHintOpen));
      hintBtn.classList.toggle('active', this.isHintOpen);
    }
    return this.isHintOpen;
  }

  public verifyGap(userText: string): boolean {
    const cleanUser = userText.trim().toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[^a-z0-9']/g, '');
    const target = this.question.gapTarget || this.question.options[this.question.answer];
    const cleanTarget = target.trim().toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[^a-z0-9']/g, '');
    const isCorrect = cleanUser.length > 0 && cleanUser === cleanTarget;

    const inputEl = this.element.querySelector('.listening-gap-input') as HTMLInputElement | null;
    const feedbackEl = this.element.querySelector('.listening-gap-feedback') as HTMLElement | null;

    // One attempt, like a tap on an option
    this.element.querySelectorAll<HTMLInputElement | HTMLButtonElement>('.listening-gap-input, .btn-verify-gap').forEach(el => { el.disabled = true; });

    if (inputEl) {
      inputEl.classList.remove('is-correct', 'is-incorrect');
      inputEl.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
    }

    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      if (isCorrect) {
        feedbackEl.className = 'listening-gap-feedback match-success';
        feedbackEl.textContent = `✓ Correct! Connected-speech target: "${target}"`;
        AudioSynthesizer.play('absorb');
      } else {
        feedbackEl.className = 'listening-gap-feedback match-mismatch';
        feedbackEl.textContent = `✗ Not quite. The linked phrase was: "${target}"`;
        AudioSynthesizer.play('alarm');
      }
    }

    this.onAnswer?.(isCorrect ? this.question.answer : -1, isCorrect);
    this.onGapSubmit?.(userText, isCorrect);
    return isCorrect;
  }

  public teardown(): void {
    AudioSynthesizer.stopSpeech();
  }

  private render(): void {
    const q = this.question;
    const phoneticsContent = q.phonetics || q.ipa || 'Natural connected speech catenation, weak forms & liaison.';

    this.element.innerHTML = `
      <!-- Audio Player Strip with Speed Controls & Phonetic Hint Trigger -->
      <div class="listening-player-strip" style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-8); padding: 10px 14px; background: var(--bg-surface-sunk); border-radius: 6px; margin-bottom: var(--space-12);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" class="hud-btn btn-listening-play" style="font-weight: 700; color: var(--cyan, #38bdf8); border-color: var(--cyan, #38bdf8); padding: 8px 14px;">
            ${icon('volume', 14)}<span>▶ Play Audio</span>
          </button>
          <button type="button" class="hud-btn btn-phonetic-hint" aria-expanded="false" style="font-size: var(--font-kicker); padding: 6px 10px;">
            ${icon('lightbulb', 13)} Phonetic Hint
          </button>
        </div>
        <div class="listening-speed-group" role="group" aria-label="Playback speed" style="display: flex; align-items: center; gap: 4px;">
          <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted); margin-right: 4px;">SPEED:</span>
          <button type="button" class="hud-btn speed-chip btn-speed ${Math.abs(this.speechRate - 0.8) < 0.01 ? 'active-speed' : ''}" data-speed="0.8" aria-pressed="${Math.abs(this.speechRate - 0.8) < 0.01}">0.8x</button>
          <button type="button" class="hud-btn speed-chip btn-speed ${Math.abs(this.speechRate - 1.0) < 0.01 ? 'active-speed' : ''}" data-speed="1.0" aria-pressed="${Math.abs(this.speechRate - 1.0) < 0.01}">1.0x</button>
          <button type="button" class="hud-btn speed-chip btn-speed ${Math.abs(this.speechRate - 1.2) < 0.01 ? 'active-speed' : ''}" data-speed="1.2" aria-pressed="${Math.abs(this.speechRate - 1.2) < 0.01}">1.2x</button>
        </div>
      </div>

      <!-- Phonetic Hint Callout -->
      <div class="phonetic-hint-box" style="display: none; margin-bottom: var(--space-12); padding: 10px 14px; background: var(--bg-surface-sunk); border-left: 3px solid var(--cyan, #38bdf8); border-radius: 4px; font-family: var(--font-mono); font-size: var(--font-body-compact); color: var(--ink-secondary);">
        <div style="font-weight: 700; color: var(--cyan, #38bdf8); margin-bottom: 4px; font-size: var(--font-kicker);">PHONETIC PHENOMENA:</div>
        <div>${this.escape(phoneticsContent)}</div>
      </div>

      <!-- Connected-Speech Gap-Fill Console -->
      <div class="connected-speech-gap-card" style="margin-bottom: var(--space-16); padding: 12px 14px; background: var(--bg-surface-sunk); border: 1px solid var(--border-subtle); border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted);">
            CONNECTED-SPEECH GAP-FILL // TYPE THE LINKED PHRASE:
          </span>
        </div>
        <div class="listening-gap-input-row" style="display: flex; gap: 8px; align-items: center;">
          <input type="text" class="listening-gap-input" placeholder="Type linked words (or select option below)..." autocomplete="off" spellcheck="false" style="flex: 1; min-height: var(--touch-target-min, 44px); box-sizing: border-box; padding: 8px 12px; font-family: var(--font-mono); font-size: max(16px, var(--font-body)); background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm, 6px); color: var(--ink-primary); outline: none;">
          <button type="button" class="hud-btn btn-verify-gap" style="min-height: var(--touch-target-min, 44px); padding: 8px 14px; font-weight: 700; font-size: var(--font-body-compact); border-color: var(--accent-gold); color: var(--accent-gold);">
            Verify Gap
          </button>
        </div>
        <div class="listening-gap-feedback" style="display: none; margin-top: 6px; font-family: var(--font-mono); font-size: var(--font-kicker);"></div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const playBtn = this.element.querySelector('.btn-listening-play');
    playBtn?.addEventListener('click', () => {
      this.playAudio();
    });

    const hintBtn = this.element.querySelector('.btn-phonetic-hint');
    hintBtn?.addEventListener('click', () => {
      this.togglePhoneticHint();
    });

    this.element.querySelectorAll<HTMLElement>('.btn-speed').forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = Number(btn.dataset.speed) || 1.0;
        this.setSpeed(speed);
      });
    });

    const input = this.element.querySelector('.listening-gap-input') as HTMLInputElement | null;
    const verifyBtn = this.element.querySelector('.btn-verify-gap') as HTMLButtonElement | null;

    input?.addEventListener('input', () => {
      AudioSynthesizer.playMechanicalClick();
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (input.value.trim()) {
          this.verifyGap(input.value);
        }
      }
    });

    verifyBtn?.addEventListener('click', () => {
      if (input && input.value.trim()) {
        this.verifyGap(input.value);
      }
    });
  }

  private escape(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

export class MultiSkillQuizModal {
  private overlay: HTMLElement;
  private opener: HTMLElement | null;
  private onDone: () => void;
  private keyHandler: (e: KeyboardEvent) => void;

  // Question bank indexed by stage (1..5)
  private questionsByStage: Map<number, DiagnosticQuestionItem[]> = new Map();

  // Active quiz state
  private currentStageIndex = 0; // 0..4 (corresponds to STAGES[0..4])
  private stageQuestionIndex = 0; // 0..2 (3 questions per stage)
  private currentStageQuestions: DiagnosticQuestionItem[] = [];

  // Calibrated results per skill
  private calibratedLevels: Record<SkillId, Cefr>;
  private stageCorrectCounts: number[] = [0, 0, 0, 0, 0];
  private stageAskedCounts: number[] = [0, 0, 0, 0, 0];

  // Speech rate for listening playback
  private speechRate: number = 1.0;
  private activeListeningComponent: ListeningPromptComponent | null = null;
  private static activeInstance: MultiSkillQuizModal | null = null;

  public static open(initialView: 'quiz' | 'radar' = 'quiz', onDone: () => void = () => {}): MultiSkillQuizModal {
    this.closeActive();
    const inst = new MultiSkillQuizModal(initialView, onDone);
    this.activeInstance = inst;
    return inst;
  }

  public static openRadarOnly(onDone: () => void = () => {}): MultiSkillQuizModal {
    return this.open('radar', onDone);
  }

  public static closeActive(): void {
    if (this.activeInstance) {
      this.activeInstance.close();
      this.activeInstance = null;
    }
  }

  private constructor(initialView: 'quiz' | 'radar', onDone: () => void) {
    this.onDone = onDone;
    this.opener = document.activeElement as HTMLElement | null;

    // Load initial profile from storage
    const currentProfile = StorageManager.getSkillProfile();
    this.calibratedLevels = { ...currentProfile.skills };

    // Build question bank
    this.initQuestionBank();

    // Create modal DOM overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'multi-skill-quiz-modal';
    this.overlay.className = 'completion-modal-overlay interactive multi-skill-modal-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', 'CEFR Multi-Skill Diagnostic & Skill Radar');
    document.body.appendChild(this.overlay);

    // Global keyboard trap
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.close();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        const optionBtn = this.overlay.querySelectorAll<HTMLElement>('.placement-option')[n - 1];
        if (optionBtn) {
          e.preventDefault();
          optionBtn.click();
        }
      }
    };
    document.addEventListener('keydown', this.keyHandler, true);

    if (initialView === 'radar') {
      this.renderRadarResults();
    } else {
      this.renderIntro();
    }
  }

  private initQuestionBank(): void {
    const rawList: DiagnosticQuestionItem[] = Array.isArray(diagnosticDataRaw)
      ? (diagnosticDataRaw as DiagnosticQuestionItem[])
      : [];

    // Group items by stage
    for (let s = 1; s <= 5; s++) {
      let stageItems = rawList.filter(item => item.stage === s);
      if (s === 4) {
        // Stage 4: Listening questions
        stageItems = stageItems.length > 0 ? stageItems : CURATED_LISTENING_QUESTIONS;
      }
      this.questionsByStage.set(s, stageItems);
    }
  }

  private card(inner: string, maxWidth: string = '620px'): void {
    this.overlay.innerHTML = `
      <div class="completion-receipt-card multi-skill-card" style="max-width: ${maxWidth}; width: 100%; max-height: 90dvh; overflow-y: auto;">
        ${inner}
      </div>
    `;
  }

  // =========================================================================
  // VIEW: INTRO
  // =========================================================================
  private renderIntro(): void {
    this.card(`
      <div class="quiz-telemetry-header" style="margin-bottom: var(--space-12); display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-8);">
          <span class="telemetry-label" style="letter-spacing: 0.08em; font-weight: 700;">${t('quiz.initiative', undefined, 'INITIATIVE 21')}</span>
          <span class="skill-badge-pill">${icon('target', 12)} ${t('quiz.celestial_radar', undefined, 'CELESTIAL RADAR')}</span>
        </div>
        <div class="telemetry-label" style="color: var(--ink-muted); font-size: var(--font-kicker); letter-spacing: 0.06em;">
          ${t('quiz.diagnostic_kicker', undefined, 'MULTI-SKILL CEFR DIAGNOSTIC')}
        </div>
      </div>
      <h2 style="font-size: var(--font-h1); font-weight: 800; margin: 0 0 var(--space-8) 0; letter-spacing: -0.02em;">
        ${t('quiz.intro_title', undefined, 'Calibrate Your Language Proficiency')}
      </h2>
      <p style="font-size: var(--font-h4); line-height: 1.6; margin-bottom: var(--space-16); color: var(--ink-secondary);">
        ${t('quiz.intro_desc', undefined, 'Unlike traditional single-level tests, language mastery is asymmetric. This diagnostic evaluates 5 distinct skills (Vocabulary, Grammar, Reading, Listening, and Writing) with 3 adaptive questions each (15 questions total · ~2 minutes).')}
      </p>
      
      <div class="stepper-header" style="margin-bottom: var(--space-20);">
        <div class="stepper-steps-track">
          ${STAGES.map((st, i) => `
            <div class="stepper-step">
              <span class="step-num">${i + 1}</span>
              <span class="step-label">${st.label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="action-stack modal-actions" style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 20px;">
        <button class="hud-btn quiz-start-btn" style="width: 100%; justify-content: center; padding: 12px 0; font-weight: 700; background: var(--accent-gold); color: var(--bg-canvas); border-color: var(--accent-gold);">
          ${icon('zap', 14)} ${t('quiz.start_diagnostic', undefined, 'Start Diagnostic (15 Questions)')}
        </button>
        <button class="hud-btn quiz-radar-direct-btn" style="width: 100%; justify-content: center; padding: 10px 0; font-weight: 600;">
          ${icon('target', 14)} ${t('quiz.view_radar', undefined, 'View Current Radar Profile')}
        </button>
        <button class="apple-bottom-close-btn quiz-cancel-btn">
          ${t('quiz.cancel_keep', undefined, 'Cancel & Keep Current Levels')}
        </button>
      </div>
    `);

    this.overlay.querySelector('.quiz-start-btn')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.startQuiz();
    });
    this.overlay.querySelector('.quiz-radar-direct-btn')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.renderRadarResults();
    });
    this.overlay.querySelector('.quiz-cancel-btn')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.close();
    });

    (this.overlay.querySelector('.quiz-start-btn') as HTMLElement | null)?.focus();
  }

  // =========================================================================
  // QUIZ ENGINE & STEPPER RUNNER
  // =========================================================================
  public startQuiz(): void {
    this.currentStageIndex = 0;
    this.stageQuestionIndex = 0;
    this.stageCorrectCounts = [0, 0, 0, 0, 0];
    this.stageAskedCounts = [0, 0, 0, 0, 0];
    this.loadStageQuestions(this.currentStageIndex);
    this.renderQuestion();
  }

  private loadStageQuestions(stageIdx: number): void {
    const stageNum = stageIdx + 1;
    const pool = this.questionsByStage.get(stageNum) || [];

    // Select 3 questions across the CEFR spectrum:
    // 1. A2/B1 tier (Elementary/Intermediate)
    // 2. B2 tier (Upper-Intermediate)
    // 3. C1/C2 tier (Advanced/Mastery)
    const lower = pool.filter(q => q.level === 'A1' || q.level === 'A2' || q.level === 'B1');
    const mid = pool.filter(q => q.level === 'B2');
    const upper = pool.filter(q => q.level === 'C1' || q.level === 'C2');

    const q1 = lower.length > 0 ? lower[Math.floor(Math.random() * lower.length)] : pool[0];
    const q2 = mid.length > 0 ? mid[Math.floor(Math.random() * mid.length)] : pool[Math.min(1, pool.length - 1)];
    const q3 = upper.length > 0 ? upper[Math.floor(Math.random() * upper.length)] : pool[Math.min(2, pool.length - 1)];

    this.currentStageQuestions = [q1, q2, q3].filter(Boolean);
    if (this.currentStageQuestions.length === 0) {
      // resile to any 3 items from pool
      this.currentStageQuestions = pool.slice(0, 3);
    }
  }

  private renderQuestion(): void {
    const stageDef = STAGES[this.currentStageIndex];
    const totalQuestions = 15;
    const globalQIndex = this.currentStageIndex * 3 + this.stageQuestionIndex + 1;
    const progressPct = Math.round(((globalQIndex - 1) / totalQuestions) * 100);

    const q = this.currentStageQuestions[this.stageQuestionIndex];
    if (!q) {
      this.advanceStage();
      return;
    }

    const isListening = stageDef.skillId === 'listening';

    this.card(`
      <!-- Stepper Header -->
      <div class="stepper-header">
        <div class="stepper-steps-track">
          ${STAGES.map((st, i) => {
            let stateClass = '';
            if (i < this.currentStageIndex) stateClass = 'completed';
            else if (i === this.currentStageIndex) stateClass = 'active';
            return `
              <div class="stepper-step ${stateClass}">
                <span class="step-num">${i < this.currentStageIndex ? '✓' : i + 1}</span>
                <span class="step-label">${st.label}</span>
              </div>
            `;
          }).join('')}
        </div>
        <div class="stepper-progress-bar-bg" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100">
          <div class="stepper-progress-bar-fill" style="width: ${progressPct}%;"></div>
        </div>
      </div>

      <!-- Question Subheader: Defensive Multi-Row Telemetry -->
      <div class="quiz-telemetry-header" style="margin-bottom: var(--space-12); display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-8);">
          <span class="telemetry-label" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--ink-primary); font-size: var(--font-kicker); letter-spacing: 0.06em;">
            ${icon(stageDef.iconName, 13)} ${stageDef.name.toUpperCase()}
          </span>
          <span class="skill-badge-pill">${q.level}</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-8); font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted); letter-spacing: 0.06em;">
          <span>${t('quiz.stage_info', { stage: this.currentStageIndex + 1, question: this.stageQuestionIndex + 1 }, `STAGE ${this.currentStageIndex + 1}/5 · QUESTION ${this.stageQuestionIndex + 1}/3`)}</span>
          <span style="white-space: nowrap;">${t('quiz.total_info', { current: globalQIndex, total: totalQuestions }, `TOTAL ${globalQIndex}/${totalQuestions}`)}</span>
        </div>
      </div>

      <div style="font-size: var(--font-body-compact); color: var(--ink-muted); margin-bottom: var(--space-8); line-height: 1.4;">
        ${stageDef.briefing}
      </div>

      <div style="font-size: var(--font-h3); font-weight: 700; margin-bottom: var(--space-8); line-height: 1.4;">
        ${this.escape(q.prompt)}
      </div>

      ${q.context ? `
        <div class="quiz-context-box" style="font-size: var(--font-h4); line-height: 1.5; color: var(--ink-secondary); padding: 10px 14px; background: var(--bg-surface-sunk); border-left: 3px solid var(--accent-gold); border-radius: 4px; margin-bottom: var(--space-16);">
          ${this.escape(q.context)}
        </div>
      ` : '<div style="margin-bottom: var(--space-12);"></div>'}

      ${isListening ? `
        <!-- Listening Prompt Component Mount Point -->
        <div id="listening-component-mount" style="margin-bottom: var(--space-16);"></div>
      ` : ''}

      <!-- Options Group -->
      <div role="group" aria-label="Choose the answer" data-feedback-scope class="action-stack" style="width: 100%; display: flex; flex-direction: column; gap: 12px;">
        ${q.options.map((opt, i) => `
          <button class="hud-btn placement-option quiz-option" data-i="${i}" style="width: 100%; box-sizing: border-box; justify-content: flex-start; padding: 12px 14px; text-align: left; white-space: normal; height: auto; text-transform: none; line-height: 1.4; border-radius: var(--radius-btn, 10px);">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: var(--bg-surface-sunk); color: var(--accent-gold); font-size: var(--font-kicker); font-weight: 800; margin-right: 10px; flex-shrink: 0;">${i + 1}</span>
            <span>${this.escape(opt)}</span>
          </button>
        `).join('')}
        <div class="quiz-feedback-slot" data-feedback-slot hidden style="font-size: var(--font-h4); line-height: 1.5; color: var(--ink-secondary); padding: 10px 14px; background: var(--bg-surface-sunk); border-left: 3px solid var(--accent-gold); border-radius: var(--radius-squircle-sm, 10px);"></div>
      </div>

      <!-- Action Strip -->
      <div class="quiz-footer-strip" style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 20px; font-size: var(--font-kicker); color: var(--ink-muted); width: 100%;">
        <span class="quiz-hotkeys-hint" style="line-height: 1.4;">${t('quiz.hotkeys_hint', undefined, 'Hotkeys: 1 - 4 to select · Esc to exit')}</span>
        <button class="hud-btn quiz-skip-stage-btn apple-press" style="min-height: 44px; padding: 8px 14px; font-size: var(--font-kicker); border-radius: var(--radius-btn, 10px);">
          ${t('quiz.skip_stage', undefined, 'Skip Stage →')}
        </button>
      </div>
    `);

    this.activeListeningComponent?.teardown();
    this.activeListeningComponent = null;

    // Wire options
    this.overlay.querySelectorAll<HTMLElement>('.placement-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleAnswer(Number(btn.dataset.i));
      });
    });

    // Wire listening prompt component
    if (isListening) {
      const mount = this.overlay.querySelector('#listening-component-mount');
      if (mount) {
        this.activeListeningComponent = new ListeningPromptComponent({
          question: q,
          speechRate: this.speechRate,
          onRateChange: (rate) => {
            this.speechRate = rate;
          },
          // Typed gap answers score once (-1 = wrong); short pause so the feedback line is readable
          onAnswer: (choiceIdx) => {
            this.overlay.querySelectorAll<HTMLButtonElement>('.placement-option').forEach(b => { b.disabled = true; });
            setTimeout(() => this.handleAnswer(choiceIdx), 700);
          }
        });
        mount.appendChild(this.activeListeningComponent.getElement());

        // Auto-play audio prompt once when question loads
        setTimeout(() => {
          this.activeListeningComponent?.playAudio();
        }, 250);
      }
    }

    // Wire skip stage
    this.overlay.querySelector('.quiz-skip-stage-btn')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.advanceStage();
    });

    // Focus first option for keyboard accessibility
    (this.overlay.querySelector('.placement-option') as HTMLElement | null)?.focus();
  }

  private handleAnswer(choiceIdx: number): void {
    AudioSynthesizer.stopSpeech();
    this.activeListeningComponent?.teardown();
    this.activeListeningComponent = null;

    const q = this.currentStageQuestions[this.stageQuestionIndex];
    const isCorrect = choiceIdx === q.answer;

    this.stageAskedCounts[this.currentStageIndex]++;
    if (isCorrect) {
      this.stageCorrectCounts[this.currentStageIndex]++;
    }
    // Motion pops the chosen option; text lands in the answer group's slot. Typed gap answers (-1) fall back to the group.
    const chosen = this.overlay.querySelectorAll<HTMLElement>('.placement-option')[choiceIdx];
    const scope = this.overlay.querySelector<HTMLElement>('[data-feedback-scope]');
    feedback.emit({
      type: 'answer',
      result: isCorrect ? 'correct' : 'wrong',
      why: q.explanation ?? '',
      mode: 'practice'
    }, chosen ?? scope ?? undefined);

    this.stageQuestionIndex++;
    if (this.stageQuestionIndex >= this.currentStageQuestions.length) {
      // Stage finished
      feedback.emit({ type: 'milestone', label: t('quiz.stage_complete', undefined, 'Stage complete') });
      this.advanceStage();
    } else {
      this.renderQuestion();
    }
  }

  private advanceStage(): void {
    AudioSynthesizer.stopSpeech();
    this.activeListeningComponent?.teardown();
    this.activeListeningComponent = null;

    // Calibrate this stage's skill level based on correct answers
    const stageDef = STAGES[this.currentStageIndex];
    const correct = this.stageCorrectCounts[this.currentStageIndex] || 0;
    const calibrated = this.resolveSkillCefr(stageDef.skillId, correct);
    this.calibratedLevels[stageDef.skillId] = calibrated;

    AudioSynthesizer.play('stage-fanfare');

    this.currentStageIndex++;
    this.stageQuestionIndex = 0;

    if (this.currentStageIndex < STAGES.length) {
      this.loadStageQuestions(this.currentStageIndex);
      this.renderQuestion();
    } else {
      // All 5 stages finished!
      // Calibrate Speaking skill from Listening and Writing baseline
      const listenIdx = cefrIndex(this.calibratedLevels.listening);
      const writeIdx = cefrIndex(this.calibratedLevels.writing);
      const speakingIdx = Math.round((listenIdx + writeIdx) / 2);
      this.calibratedLevels.speaking = CEFR_ORDER[speakingIdx] || 'B1';

      AudioSynthesizer.play('radar-reveal');
      this.renderRadarResults();
    }
  }

  private resolveSkillCefr(_skill: SkillId, correctCount: number): Cefr {
    // 3 questions asked:
    // 3 correct -> C2 (Mastery)
    // 2 correct -> C1 (Effective Operational Proficiency)
    // 1 correct -> B1 (Intermediate)
    // 0 correct -> A1 (Breakthrough)
    if (correctCount >= 3) return 'C2';
    if (correctCount === 2) return 'C1';
    if (correctCount === 1) return 'B1';
    return 'A1';
  }

  public playSpeechPrompt(text: string, rate?: number): void {
    AudioSynthesizer.speak(text, rate ?? this.speechRate);
  }

  // =========================================================================
  // VIEW: CELESTIAL RADAR RESULTS & CALIBRATION SUMMARY
  // =========================================================================
  private renderRadarResults(): void {
    AudioSynthesizer.play('radar-reveal');
    const overallLevel = this.calculateOverallCefr(this.calibratedLevels);
    const radarSvg = MultiSkillQuizModal.generateRadarSvg(this.calibratedLevels, 320);

    this.card(`
      <div class="quiz-telemetry-header" style="margin-bottom: var(--space-12); display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-8);">
          <span class="telemetry-label" style="letter-spacing: 0.08em; font-weight: 700;">${t('quiz.diagnostic_complete', undefined, 'DIAGNOSTIC COMPLETE')}</span>
          <span class="skill-badge-pill">${icon('target', 12)} ${t('quiz.overall', { level: overallLevel }, `${overallLevel} OVERALL`)}</span>
        </div>
        <div class="telemetry-label" style="color: var(--ink-muted); font-size: var(--font-kicker); letter-spacing: 0.06em;">
          ${t('quiz.radar_title', undefined, 'CEFR 5-AXIS SKILL RADAR')}
        </div>
      </div>

      <div style="text-align: center; margin-bottom: var(--space-8);">
        <h2 style="font-size: var(--font-h1); font-weight: 800; margin: 0; letter-spacing: -0.02em;">
          ${CEFR_LABELS[overallLevel]}
        </h2>
        <p style="font-size: var(--font-body-compact); color: var(--ink-secondary); margin: 4px 0 0 0;">
          ${t('quiz.radar_desc', undefined, 'Multi-skill diagnostic calibrated across 5 core language axes.')}
        </p>
      </div>

      <!-- Celestial Radar SVG Pentagram -->
      <div class="radar-chart-container">
        ${radarSvg}
      </div>

      <!-- Skill Breakdown & Manual Override Grid -->
      <div class="telemetry-label" style="margin-bottom: var(--space-8);">
        ${t('quiz.skill_calibration_hint', undefined, 'Skill Calibration · Tap Level to Adjust')}
      </div>

      <div class="skill-breakdown-grid">
        ${ALL_SKILLS.map(skill => {
          const current = this.calibratedLevels[skill];
          const skillLabel = skill === 'vocab' ? 'Vocabulary' : skill.charAt(0).toUpperCase() + skill.slice(1);
          return `
            <div class="skill-card-item">
              <div class="skill-card-header">
                <span class="skill-card-name">${skillLabel}</span>
                <span class="skill-level-chip" id="chip-${skill}">${current}</span>
              </div>
              <div class="skill-level-selector" data-skill="${skill}">
                ${CEFR_ORDER.map(l => `
                  <button class="skill-level-btn ${l === current ? 'active' : ''}" data-level="${l}" title="${skillLabel} ${l}">${l}</button>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Actions -->
      <div class="action-stack radar-actions-cluster" style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 22px;">
        <button class="hud-btn btn-apply-profile" style="width: 100%; justify-content: center; padding: 12px 0; font-weight: 700; background: var(--accent-gold); color: var(--bg-canvas); border-color: var(--accent-gold);">
          ${icon('zap', 14)} ${t('quiz.apply_profile', undefined, 'Apply Profile & Calibrate App')}
        </button>
        <div style="display: flex; gap: 12px;">
          <button class="hud-btn btn-retake-quiz" style="flex: 1; justify-content: center; padding: 8px 0;">
            ${icon('target', 12)} ${t('quiz.retake_diagnostic', undefined, 'Retake Diagnostic')}
          </button>
          <button class="apple-bottom-close-btn btn-cancel-results" style="flex: 1; justify-content: center;">
            ${t('common.close', undefined, 'Close')}
          </button>
        </div>
      </div>
    `, '660px');

    // Wire skill manual override buttons
    this.overlay.querySelectorAll<HTMLElement>('.skill-level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.closest('.skill-level-selector') as HTMLElement | null;
        const skill = parent?.dataset.skill as SkillId;
        const level = btn.dataset.level as Cefr;
        if (skill && level) {
          AudioSynthesizer.play('click');
          this.calibratedLevels[skill] = level;
          // Re-render radar view smoothly
          this.renderRadarResults();
        }
      });
    });

    // Wire Apply Profile
    this.overlay.querySelector('.btn-apply-profile')?.addEventListener('click', () => {
      this.applyAndSaveProfile();
    });

    // Wire Retake
    this.overlay.querySelector('.btn-retake-quiz')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.startQuiz();
    });

    // Wire Close
    this.overlay.querySelector('.btn-cancel-results')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.close();
    });

    (this.overlay.querySelector('.btn-apply-profile') as HTMLElement | null)?.focus({ preventScroll: true });
  }

  private applyAndSaveProfile(): void {
    const overall = this.calculateOverallCefr(this.calibratedLevels);

    // 1. Save all independent skill levels
    for (const skill of ALL_SKILLS) {
      StorageManager.setSkillLevel(skill, this.calibratedLevels[skill]);
    }

    // 2. Save overall level & placement status
    StorageManager.setLearnerLevel(overall);
    StorageManager.setPlacementDone();

    // 3. Save historical SkillProfile
    const profile: SkillProfile = {
      overall,
      skills: { ...this.calibratedLevels },
      assessedAt: new Date().toISOString()
    };
    StorageManager.saveSkillProfile(profile);

    // 4. Acoustic cue and reactive event dispatch
    AudioSynthesizer.play('tour-fanfare');
    window.dispatchEvent(new CustomEvent('learner-level-change'));

    // 5. Close and trigger onDone
    this.close();
    this.onDone();
  }

  private calculateOverallCefr(skills: Record<SkillId, Cefr>): Cefr {
    const indices = ALL_SKILLS.map(s => cefrIndex(skills[s] || 'A1')).sort((a, b) => a - b);
    const medianIdx = Math.round(indices[Math.floor(indices.length / 2)]);
    return CEFR_ORDER[medianIdx] || 'B1';
  }

  // =========================================================================
  // CELESTIAL RADAR SVG PENTAGRAM GENERATOR
  // =========================================================================
  public static generateRadarSvg(skills: Record<SkillId, Cefr>, size: number = 320): string {
    const cx = 160;
    const cy = 130;
    const maxRadius = 80;
    const labelRadius = 104;

    // 5 radar axes matching the 5 tested skills
    const axes: Array<{ skill: SkillId; label: string }> = [
      { skill: 'vocab', label: 'VOCABULARY' },
      { skill: 'grammar', label: 'GRAMMAR' },
      { skill: 'reading', label: 'READING' },
      { skill: 'listening', label: 'LISTENING' },
      { skill: 'writing', label: 'WRITING' }
    ];

    const numAxes = axes.length; // 5

    // Angle helper (0 = top, rotating clockwise by 72 deg)
    const getAngle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;

    // 1. Concentric Pentagram Rings for A1 to C2 (t = 1/6 to 6/6)
    const ringsMarkup = CEFR_ORDER.map((tier, k) => {
      const r = maxRadius * ((k + 1) / 6);
      const points = axes.map((_, i) => {
        const angle = getAngle(i);
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');

      // Tier label placed along the top spoke
      const labelY = cy - r + 8;
      return `
        <polygon points="${points}" class="radar-ring radar-ring-${tier}" stroke="var(--ink-muted, #94a3b8)" stroke-width="0.8" stroke-dasharray="2,3" fill="none" opacity="0.35" />
        <text x="${cx + 3}" y="${labelY.toFixed(1)}" class="radar-tier-label" font-size="8" fill="var(--ink-muted, #94a3b8)" opacity="0.7">${tier}</text>
      `;
    }).join('');

    // 2. Axis Spoke Lines & Labels
    const spokesMarkup = axes.map((axis, i) => {
      const angle = getAngle(i);
      const outerX = cx + maxRadius * Math.cos(angle);
      const outerY = cy + maxRadius * Math.sin(angle);
      const textX = cx + labelRadius * Math.cos(angle);
      const textY = cy + labelRadius * Math.sin(angle);
      const skillLevel = skills[axis.skill] || 'A1';

      return `
        <line x1="${cx}" y1="${cy}" x2="${outerX.toFixed(1)}" y2="${outerY.toFixed(1)}" class="radar-axis-spoke" stroke="var(--ink-muted, #94a3b8)" stroke-width="1" opacity="0.3" />
        <text x="${textX.toFixed(1)}" y="${textY.toFixed(1)}" class="radar-axis-label" text-anchor="middle" dominant-baseline="central" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="var(--ink-secondary, #cbd5e1)">
          ${axis.label} (${skillLevel})
        </text>
      `;
    }).join('');

    // 3. Calibrated Learner Value Polygon
    const valuePoints = axes.map((axis, i) => {
      const level = skills[axis.skill] || 'A1';
      const r = maxRadius * ((cefrIndex(level) + 1) / 6);
      const angle = getAngle(i);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return { x, y, ptStr: `${x.toFixed(1)},${y.toFixed(1)}` };
    });

    const polygonPtsStr = valuePoints.map(p => p.ptStr).join(' ');

    const nodesMarkup = valuePoints.map(p => `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" class="radar-node-dot" fill="var(--accent-gold, #a5b4fc)" stroke="var(--bg-canvas, #080a0f)" stroke-width="2" />
    `).join('');

    const svgHeight = Math.round(size * 240 / 320);

    return `
      <svg width="${size}" height="${svgHeight}" viewBox="0 0 320 240" class="celestial-radar-svg" role="img" aria-label="Celestial Radar Proficiency Chart">
        <defs>
          <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Concentric polygon rings -->
        ${ringsMarkup}
        <!-- Axis Spokes -->
        ${spokesMarkup}
        <!-- Learner Calibrated Filled Polygon -->
        <polygon points="${polygonPtsStr}" class="radar-value-polygon" fill="rgba(165, 180, 252, 0.25)" stroke="var(--accent-gold, #a5b4fc)" stroke-width="2.5" filter="url(#radar-glow)" />
        <!-- Node Dots -->
        ${nodesMarkup}
      </svg>
    `;
  }

  private close(): void {
    AudioSynthesizer.stopSpeech();
    this.activeListeningComponent?.teardown();
    this.activeListeningComponent = null;
    document.removeEventListener('keydown', this.keyHandler, true);
    this.overlay.remove();
    MultiSkillQuizModal.activeInstance = null;
    this.opener?.focus();
  }

  private escape(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

// Expose on window for runtime diagnostics and automated verification
if (typeof window !== 'undefined') {
  (window as any).MultiSkillQuizModal = MultiSkillQuizModal;
  (window as any).ListeningPromptComponent = ListeningPromptComponent;
}
