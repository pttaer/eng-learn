/**
 * 60-Second Roguelike Speed Blitz Mode
 * High-intensity rapid-fire flash drill module for fast collocation and vocabulary recall.
 * Features:
 * - 60s Circular SVG HUD countdown timer with tension pulse
 * - Randomized fast two-choice collocation and vocabulary prompts
 * - Rolling combo meter (1x -> 4x multiplier) with tactile audio
 * - Real-time accuracy and score calculation
 * - Fullscreen particle celebrations on finish
 * - XP rewards synced directly into ProgressionEngine
 * - Left/Right Arrow and 1/2 keyboard controls with WCAG 2.2 AAA accessibility
 */

import { icon } from '../utils/icons';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { ParticleCanvas } from '../core/particle-canvas';
import { ProgressionEngine } from '../core/progression-engine';
import { feedback } from '../core/feedback';
import collocationsData from '../assets/data/collocations.json';
import vocabularyData from '../assets/data/vocabulary.json';
import { pickDecoys, meaningsOverlap } from '../core/decoys';
import { I18n, t } from '../core/i18n';
import { HeaderHUD } from './header-hud';

/** Verbs whose collocations are worth blanking; phrases starting with a noun or adjective are skipped. */
const BLANKABLE_VERBS = new Set(['make', 'take', 'have', 'do', 'get', 'give', 'keep', 'pay', 'break', 'catch', 'set', 'run', 'hold', 'reach', 'draw', 'gain', 'raise', 'bear', 'bring', 'meet', 'lose', 'miss', 'tell', 'say', 'play', 'strike', 'cut', 'save', 'spend', 'waste', 'follow', 'pose', 'conduct', 'carry', 'attract', 'commit', 'launch', 'exert', 'render']);
const DECOY_VERBS = ['make', 'take', 'have', 'do', 'get', 'give', 'keep', 'pay', 'catch', 'hold', 'set', 'reach', 'gain', 'raise', 'bring', 'meet', 'lose', 'draw', 'bear', 'run', 'tell', 'say'];

/** Verbs that are also natural with a given phrase ending, so they can never be the decoy. */
const ALSO_CORRECT: Record<string, string[]> = {
  'a decision': ['make', 'take', 'reach'],
  'a look': ['have', 'take'],
  'a shower': ['have', 'take'],
  'a bath': ['have', 'take'],
  'a break': ['have', 'take'],
  'a rest': ['have', 'take', 'get'],
  'a walk': ['have', 'take'],
  'a seat': ['have', 'take'],
  'a nap': ['have', 'take'],
  'a holiday': ['have', 'take'],
  'a swim': ['have', 'take'],
  'a chance': ['have', 'take', 'get'],
  'a deal': ['make', 'do', 'strike', 'cut', 'get'],
  'a cold': ['have', 'catch', 'get'],
  'the flu': ['have', 'catch', 'get'],
  'the bus': ['get', 'catch', 'take'],
  'a bus': ['get', 'catch', 'take'],
  'the train': ['get', 'catch', 'take'],
  'a train': ['get', 'catch', 'take'],
  'a taxi': ['get', 'take', 'catch'],
  'a flight': ['get', 'catch', 'take'],
  'a job': ['get', 'have'],
  'a meal': ['have', 'make'],
  'breakfast': ['have', 'make'],
  'lunch': ['have', 'make'],
  'dinner': ['have', 'make'],
  'a party': ['have', 'hold', 'give'],
  'a meeting': ['have', 'hold'],
  'a conversation': ['have', 'hold'],
  'attention': ['pay', 'draw', 'attract'],
  'a question': ['ask', 'raise', 'pose'],
  'a risk': ['take', 'run'],
  'a profit': ['make', 'turn'],
  'time': ['spend', 'take', 'save', 'have', 'waste', 'keep'],
  'money': ['make', 'save', 'spend', 'lose', 'get', 'have', 'raise'],
  'an example': ['give', 'set', 'take'],
  'a speech': ['give', 'make', 'deliver'],
  'a call': ['make', 'give', 'take', 'get'],
  'a phone call': ['make', 'give', 'take', 'get'],
  'advice': ['give', 'get', 'take'],
  'a photo': ['take', 'get', 'have'],
  'a picture': ['take', 'draw', 'paint', 'get'],
  'homework': ['do', 'have', 'get']
};

const ADJECTIVE_DEF_STARTS = new Set(['able', 'unable', 'having', 'showing', 'relating', 'related', 'characterized', 'characterised', 'full', 'lacking', 'not', 'very', 'extremely', 'unwilling', 'willing', 'existing', 'being', 'of', 'causing', 'tending', 'likely', 'marked', 'capable', 'easily', 'highly', 'deeply', 'happy', 'feeling', 'pleasant', 'difficult', 'easy', 'never', 'done', 'made', 'used', 'based', 'free', 'completely', 'too', 'more', 'less', 'so', 'in', 'belonging']);

const NOUN_DEF_MODIFIERS = new Set(['small', 'large', 'big', 'little', 'young', 'old', 'long', 'short', 'white', 'black', 'red', 'green', 'yellow', 'brown', 'sweet', 'round', 'soft', 'thin', 'thick', 'tall', 'special', 'common', 'female', 'male', 'wild', 'official', 'written', 'printed', 'formal', 'informal', 'any', 'money', 'food', 'water', 'part']);

/** Rough word class from dictionary-style definitions: "A/An/The ..." noun, "To ..." or imperative verb, "Able/Having/..." adjective. */
function definitionKind(definition: string, word: string): 'noun' | 'adj' | 'verb' {
  const first = definition.trim().toLowerCase().split(/[^a-z]+/).filter(Boolean)[0] || '';
  if (first === 'a' || first === 'an' || first === 'the' || first === 'someone' || first === 'something' || first === 'person' || first === 'people') return 'noun';
  if (first === 'to') return 'verb';
  // The headword's own suffix is the next best signal (equanimity, fastidious, mitigate).
  const w = word.toLowerCase();
  if (!w.includes(' ')) {
    if (/(ity|ness|tion|sion|ment|ance|ence|ism|ship|dom|hood)$/.test(w)) return 'noun';
    if (/(ous|ive|ful|ic|al|able|ible|ent|ant|less|ary)$/.test(w)) return 'adj';
    if (/(ize|ise|ify|ate)$/.test(w)) return 'verb';
  }
  // "Small white seeds that we cook..." — an adjective opening a noun definition
  if (NOUN_DEF_MODIFIERS.has(first)) return 'noun';
  if (ADJECTIVE_DEF_STARTS.has(first)) return 'adj';
  return 'verb';
}

function definitionLeaksWord(definition: string, word: string): boolean {
  const def = definition.toLowerCase();
  return word.toLowerCase().split(/\s+/).some(t => t.length >= 4 && def.includes(t.slice(0, Math.max(4, t.length - 3))));
}

export interface BlitzPrompt {
  id: string;
  category: 'collocation-stem' | 'collocation-vn' | 'vocab-definition';
  promptTitle: string;
  stem: string;
  optionA: string;
  optionB: string;
  correctIndex: 0 | 1;
  explanation: string;
}

export interface BlitzStats {
  score: number;
  correctCount: number;
  totalAnswered: number;
  accuracy: number;
  maxStreak: number;
  xpEarned: number;
  isNewHighScore: boolean;
}

const BLITZ_DURATION_SECONDS = 60;
const CIRCUMFERENCE = 2 * Math.PI * 52; // r = 52px -> ~326.72px
const HIGH_SCORE_STORAGE_KEY = 'eng_blitz_highscore';

export class BlitzDossier {
  private container: HTMLElement;
  private state: 'READY' | 'RUNNING' | 'FINISHED' = 'READY';

  private timeRemaining: number = BLITZ_DURATION_SECONDS;
  private timerInterval: any = null;

  private score: number = 0;
  private streak: number = 0;
  private maxStreak: number = 0;
  private correctCount: number = 0;
  private totalAnswered: number = 0;
  private highScore: number = 0;

  private currentPrompt: BlitzPrompt | null = null;
  private isProcessingAnswer: boolean = false;

  private keyListener: ((e: KeyboardEvent) => void) | null = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'blitz-dossier-shell';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-roledescription', 'blitz-arena');
    this.container.setAttribute('aria-label', '60-Second Speed Blitz Arena');

    this.loadHighScore();
  }

  private loadHighScore(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
        this.highScore = saved ? parseInt(saved, 10) || 0 : 0;
      } catch {
        this.highScore = 0;
      }
    }
  }

  private saveHighScore(score: number): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(score));
        this.highScore = score;
      } catch {
        // storage disabled guard
      }
    }
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';
    this.bindKeyboardListener();

    if (this.state === 'READY') {
      this.renderReadyScreen();
    } else if (this.state === 'RUNNING') {
      this.renderActiveArena();
    } else if (this.state === 'FINISHED') {
      this.renderSummaryScreen();
    }

    return this.container;
  }

  /**
   * 1. Ready / Instructions Screen
   */
  private renderReadyScreen(): void {
    this.container.innerHTML = `
      <div class="blitz-ready-card" role="dialog" aria-labelledby="blitz-ready-title">
        <div class="blitz-badge-cluster">
          <span class="blitz-glow-badge">${icon('zap', 12)} ${t('blitz.rapid_recall', undefined, 'Rapid Recall Drill')}</span>
          <span class="blitz-high-score-badge">${t('blitz.best_score', undefined, 'Best Score:')} <strong>${this.highScore.toLocaleString()} pts</strong></span>
        </div>

        <h1 class="blitz-ready-title" id="blitz-ready-title">${t('blitz.subtitle')}</h1>
        <p class="blitz-ready-desc">
          ${t('blitz.ready_desc', undefined, 'Test your lexical fluency with a timed rapid-recall session. 60 seconds of high-frequency collocation and advanced vocabulary practice. Chain correct answers to build your streak multiplier!')}
        </p>

        <div class="blitz-mechanics-grid">
          <div class="blitz-mechanic-card">
            <div class="mechanic-icon">${icon('clock', 22)}</div>
            <div class="mechanic-title">${t('blitz.clock_60s', undefined, '60s Clock')}</div>
            <div class="mechanic-detail">${t('blitz.mechanic_clock_desc', undefined, 'Non-stop rapid-fire decision timer. Clock ticks down continuously.')}</div>
          </div>
          <div class="blitz-mechanic-card">
            <div class="mechanic-icon">${icon('flame', 22)}</div>
            <div class="mechanic-title">${t('blitz.streak_multipliers', undefined, 'Streak Multipliers')}</div>
            <div class="mechanic-detail">${t('blitz.mechanic_streak_desc', undefined, '5 Streak = 2x • 10 Streak = 3x • 15+ Streak = 4x Max Surge.')}</div>
          </div>
          <div class="blitz-mechanic-card mechanic-hotkeys">
            <div class="mechanic-icon">${icon('keyboard', 22)}</div>
            <div class="mechanic-title">${t('blitz.instant_hotkeys', undefined, 'Instant Hotkeys')}</div>
            <div class="mechanic-detail">Press <kbd>[1]</kbd> or <kbd>[←]</kbd> for Left • <kbd>[2]</kbd> or <kbd>[→]</kbd> for Right.</div>
          </div>
        </div>

        <div class="blitz-ready-actions">
          <button type="button" class="hud-btn blitz-start-btn" id="blitz-start-btn" aria-label="Start 60-Second Blitz Drill">
            ${icon('zap')} ${t('blitz.start')}
          </button>
          <span class="blitz-hotkey-hint">Press <kbd>Space</kbd> or <kbd>Enter</kbd> to Launch</span>
        </div>
      </div>
    `;

    const startBtn = this.container.querySelector('#blitz-start-btn') as HTMLButtonElement | null;
    startBtn?.addEventListener('click', () => {
      this.startBlitz();
    });
    startBtn?.focus();
  }

  /**
   * 2. Active 60-Second Game Arena Screen
   */
  private renderActiveArena(): void {
    const multiplier = this.getMultiplier();
    const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : 100;
    const progressOffset = CIRCUMFERENCE - (this.timeRemaining / BLITZ_DURATION_SECONDS) * CIRCUMFERENCE;

    this.container.innerHTML = `
      <div class="blitz-arena-shell" role="region" aria-label="Active Blitz Sprint">
        <!-- Top Telemetry Strip -->
        <header class="blitz-hud-strip">
          <div class="blitz-hud-metric">
            <span class="metric-label">${t('blitz.score_label', undefined, 'SCORE')}</span>
            <span class="metric-value metric-score" id="blitz-score-val">${this.score.toLocaleString()}</span>
          </div>

          <!-- Circular SVG Countdown Timer -->
          <div class="blitz-circular-timer-wrap ${this.timeRemaining <= 10 ? 'is-urgent' : ''}">
            <svg class="blitz-timer-svg" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="timer-track" cx="60" cy="60" r="52"></circle>
              <circle
                class="timer-progress"
                id="blitz-timer-circle"
                cx="60"
                cy="60"
                r="52"
                stroke-dasharray="${CIRCUMFERENCE}"
                stroke-dashoffset="${progressOffset}"
              ></circle>
            </svg>
            <div class="timer-number-overlay" id="blitz-timer-number" aria-label="${this.timeRemaining} seconds remaining">
              ${this.timeRemaining}s
            </div>
          </div>

          <div class="blitz-hud-metric text-right">
            <span class="metric-label">${t('blitz.accuracy_label', undefined, 'ACCURACY')}</span>
            <span class="metric-value metric-accuracy" id="blitz-accuracy-val">${accuracy}%</span>
          </div>
        </header>

        <!-- Combo Gauge Multiplier -->
        <div class="blitz-combo-gauge-container">
          <div class="blitz-combo-pill multiplier-${multiplier}" id="blitz-combo-pill">
            <span class="multiplier-text">${multiplier}X ${t('blitz.multiplier_label', undefined, 'MULTIPLIER')}</span>
            <span class="streak-text">${icon('flame', 12)} ${this.streak} ${t('blitz.streak_label', undefined, 'STREAK')}</span>
          </div>
        </div>

        <!-- Rapid Prompt Card Mount -->
        <main class="blitz-card-mount" id="blitz-card-mount" aria-live="assertive">
          ${this.renderPromptCardHTML()}
        </main>
      </div>
    `;

    this.attachChoiceListeners();
  }

  private renderPromptCardHTML(): string {
    if (!this.currentPrompt) return '';
    const p = this.currentPrompt;

    return `
      <div class="blitz-prompt-card">
        <div class="prompt-category-badge">${p.promptTitle}</div>
        <div class="prompt-stem-text">${p.stem}</div>

        <div class="blitz-choices-grid">
          <button
            type="button"
            class="hud-btn blitz-choice-btn btn-choice-0"
            data-choice="0"
            aria-label="Option 1: ${this.escapeHtml(p.optionA)}"
          >
            <span class="choice-key-tag">[1] ←</span>
            <span class="choice-text">${this.escapeHtml(p.optionA)}</span>
          </button>

          <button
            type="button"
            class="hud-btn blitz-choice-btn btn-choice-1"
            data-choice="1"
            aria-label="Option 2: ${this.escapeHtml(p.optionB)}"
          >
            <span class="choice-key-tag">[2] →</span>
            <span class="choice-text">${this.escapeHtml(p.optionB)}</span>
          </button>
        </div>
      </div>
    `;
  }

  private attachChoiceListeners(): void {
    const choiceButtons = this.container.querySelectorAll('.blitz-choice-btn');
    choiceButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const choiceAttr = btn.getAttribute('data-choice');
        if (choiceAttr !== null) {
          const choiceIndex = parseInt(choiceAttr, 10) as 0 | 1;
          this.submitAnswer(choiceIndex);
        }
      });
    });
  }

  /**
   * 3. Summary / Scoreboard Screen
   */
  private renderSummaryScreen(): void {
    const stats = this.calculateFinalStats();

    this.container.innerHTML = `
      <div class="blitz-summary-card" role="dialog" aria-labelledby="blitz-summary-title">
        <div class="summary-badge-strip">
          <span class="blitz-glow-badge">${t('blitz.concluded', undefined, 'BLITZ RUN CONCLUDED')}</span>
          ${stats.isNewHighScore ? `<span class="blitz-new-record-badge">${icon('trophy', 12)} ${t('blitz.new_high_score', undefined, 'NEW ALL-TIME HIGH SCORE!')}</span>` : ''}
        </div>

        <h1 class="blitz-summary-title" id="blitz-summary-title">${t('blitz.sprint_complete', undefined, 'SPRINT COMPLETE')}</h1>
        <div class="summary-score-hero">
          <div class="hero-score-number">${stats.score.toLocaleString()}</div>
          <div class="hero-score-label">${t('blitz.total_score', undefined, 'TOTAL SCORE POINTS')}</div>
        </div>

        <div class="summary-stats-grid">
          <div class="summary-stat-box">
            <span class="stat-label">${t('blitz.stat_accuracy', undefined, 'ACCURACY')}</span>
            <span class="stat-val highlight-green">${stats.accuracy}%</span>
            <span class="stat-sub">${stats.correctCount} / ${stats.totalAnswered} ${t('blitz.correct_count', undefined, 'Correct')}</span>
          </div>

          <div class="summary-stat-box">
            <span class="stat-label">${t('blitz.max_combo', undefined, 'MAX COMBO')}</span>
            <span class="stat-val highlight-gold">${stats.maxStreak} ${icon('flame', 12)}</span>
            <span class="stat-sub">${t('blitz.peak_multiplier', undefined, 'Peak Multiplier')}</span>
          </div>

          <div class="summary-stat-box">
            <span class="stat-label">${t('blitz.xp_reward', undefined, 'XP REWARD')}</span>
            <span class="stat-val highlight-purple">+${stats.xpEarned} XP</span>
            <span class="stat-sub">Dispatched to RPG Hub</span>
          </div>
        </div>

        <div class="summary-action-cluster">
          <button type="button" class="hud-btn blitz-action-btn btn-restart-blitz" id="btn-restart-blitz" aria-label="Play Another Blitz Run">
            ${icon('zap')} ${t('blitz.play_again', undefined, 'PLAY AGAIN')}
          </button>
          <button type="button" class="hud-btn blitz-action-btn btn-return-tree" id="btn-return-tree" aria-label="Return to Constellation Skill Tree">
            ${icon('compass')} ${t('blitz.back_to_tree', undefined, 'BACK TO TREE')}
          </button>
        </div>
      </div>
    `;

    const restartBtn = this.container.querySelector('#btn-restart-blitz') as HTMLButtonElement | null;
    restartBtn?.addEventListener('click', () => {
      this.startBlitz();
    });
    restartBtn?.focus();

    const returnBtn = this.container.querySelector('#btn-return-tree') as HTMLButtonElement | null;
    returnBtn?.addEventListener('click', () => {
      window.location.hash = '#tree';
    });
  }

  /**
   * Starts a fresh 60-second Blitz sprint.
   */
  public startBlitz(): void {
    this.teardownTimer();

    this.state = 'RUNNING';
    this.timeRemaining = BLITZ_DURATION_SECONDS;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.isProcessingAnswer = false;

    this.currentPrompt = this.generatePrompt();
    this.render();

    AudioSynthesizer.play('chime');

    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 1;

      if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
        AudioSynthesizer.play('tick');
      }

      if (this.timeRemaining <= 0) {
        this.finishBlitz();
      } else {
        this.updateTimerDisplay();
      }
    }, 1000);
  }

  private updateTimerDisplay(): void {
    const timerNumberEl = this.container.querySelector('#blitz-timer-number');
    const timerCircleEl = this.container.querySelector('#blitz-timer-circle') as SVGCircleElement | null;
    const timerWrapEl = this.container.querySelector('.blitz-circular-timer-wrap');

    if (timerNumberEl) {
      timerNumberEl.textContent = `${this.timeRemaining}s`;
    }

    if (timerCircleEl) {
      const progressOffset = CIRCUMFERENCE - (this.timeRemaining / BLITZ_DURATION_SECONDS) * CIRCUMFERENCE;
      timerCircleEl.style.strokeDashoffset = String(progressOffset);
    }

    if (timerWrapEl) {
      if (this.timeRemaining <= 10) {
        timerWrapEl.classList.add('is-urgent');
      } else {
        timerWrapEl.classList.remove('is-urgent');
      }
    }
  }

  /**
   * Concludes the Blitz session and computes final results.
   */
  private finishBlitz(): void {
    this.teardownTimer();
    this.state = 'FINISHED';

    const stats = this.calculateFinalStats();

    if (stats.isNewHighScore) {
      this.saveHighScore(stats.score);
    }

    // Award XP and log activity to RPG progression engine
    try {
      ProgressionEngine.addXP(stats.xpEarned);
      ProgressionEngine.recordActivity('srs', stats.correctCount);
    } catch {
      // Progression engine integration guard
    }

    // Fullscreen celebration
    ParticleCanvas.burst(window.innerWidth / 2, window.innerHeight / 2, 90);
    AudioSynthesizer.play('tour-fanfare');

    if (this.onBatchComplete) {
      this.onBatchComplete();
    }

    this.render();
  }

  private calculateFinalStats(): BlitzStats {
    const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : 0;
    const xpEarned = Math.max(10, Math.floor(this.score / 50) + this.correctCount * 5);
    const isNewHighScore = this.score > this.highScore && this.score > 0;

    return {
      score: this.score,
      correctCount: this.correctCount,
      totalAnswered: this.totalAnswered,
      accuracy,
      maxStreak: this.maxStreak,
      xpEarned,
      isNewHighScore
    };
  }

  /**
   * Handles user choice submission (0 or 1).
   */
  public submitAnswer(choiceIndex: 0 | 1): void {
    if (this.state !== 'RUNNING' || !this.currentPrompt || this.isProcessingAnswer) return;

    this.isProcessingAnswer = true;
    this.totalAnswered += 1;
    const isCorrect = choiceIndex === this.currentPrompt.correctIndex;
    const why = this.currentPrompt.explanation;

    const chosenBtn = this.container.querySelector(`.btn-choice-${choiceIndex}`) as HTMLButtonElement | null;
    const otherIndex = choiceIndex === 0 ? 1 : 0;
    const otherBtn = this.container.querySelector(`.btn-choice-${otherIndex}`) as HTMLButtonElement | null;

    if (isCorrect) {
      this.correctCount += 1;
      this.streak += 1;
      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak;
      }

      const mult = this.getMultiplier();
      const points = 100 * mult;
      this.score += points;

      if (chosenBtn) {
        chosenBtn.classList.add('flash-correct');
      }

      // Streak milestones replace the plain correct cue so two sounds do not stack.
      if (this.streak === 5 || this.streak === 10 || this.streak === 15) {
        feedback.emit({ type: 'streak', count: this.streak }, chosenBtn ?? undefined);
        ParticleCanvas.burst(window.innerWidth / 2, window.innerHeight * 0.4, 25);
      } else {
        feedback.emit({ type: 'answer', result: 'correct', why, mode: 'practice' }, chosenBtn ?? undefined);
      }
    } else {
      this.streak = 0;
      if (chosenBtn) {
        chosenBtn.classList.add('flash-wrong');
      }
      if (otherBtn) {
        otherBtn.classList.add('flash-correct-hint');
      }
      feedback.emit({ type: 'answer', result: 'wrong', why, mode: 'practice' }, chosenBtn ?? undefined);
    }

    this.updateHUDValues();

    // Advance to next prompt with brief visual settle delay
    setTimeout(() => {
      if (this.state === 'RUNNING') {
        this.currentPrompt = this.generatePrompt();
        const cardMount = this.container.querySelector('#blitz-card-mount');
        if (cardMount) {
          cardMount.innerHTML = this.renderPromptCardHTML();
          this.attachChoiceListeners();
        }
      }
      this.isProcessingAnswer = false;
    }, 140);
  }

  private updateHUDValues(): void {
    const scoreValEl = this.container.querySelector('#blitz-score-val');
    if (scoreValEl) {
      scoreValEl.textContent = this.score.toLocaleString();
    }

    const accuracyValEl = this.container.querySelector('#blitz-accuracy-val');
    if (accuracyValEl) {
      const acc = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : 100;
      accuracyValEl.textContent = `${acc}%`;
    }

    const comboPillEl = this.container.querySelector('#blitz-combo-pill');
    if (comboPillEl) {
      const mult = this.getMultiplier();
      comboPillEl.className = `blitz-combo-pill multiplier-${mult}`;
      comboPillEl.innerHTML = `
        <span class="multiplier-text">${mult}X ${t('blitz.multiplier_label', undefined, 'MULTIPLIER')}</span>
        <span class="streak-text">${icon('flame', 12)} ${this.streak} STREAK</span>
      `;
    }
  }

  private getMultiplier(): number {
    if (this.streak >= 15) return 4;
    if (this.streak >= 10) return 3;
    if (this.streak >= 5) return 2;
    return 1;
  }

  /**
   * Generates a randomized prompt from collocations or vocabulary data.
   * Retries when a roll can't produce a fair item (no verb to blank, definition leaks the word, no related decoy).
   */
  private generatePrompt(): BlitzPrompt {
    for (let attempt = 0; attempt < 20; attempt++) {
      const roll = Math.random();
      const prompt = roll < 0.40 ? this.collocationStemPrompt()
        : roll < 0.70 ? this.collocationMeaningPrompt()
          : this.vocabDefinitionPrompt();
      if (prompt) return prompt;
    }

    // Fallback safe prompt
    return {
      id: 'blitz-fallback',
      category: 'collocation-stem',
      promptTitle: 'RAPID FLASH COLLOCATION',
      stem: 'Complete the phrase meaning <em>"phạm sai lầm"</em>: <br/><strong class="stem-highlight">_____ a mistake</strong>',
      optionA: 'make',
      optionB: 'do',
      correctIndex: 0,
      explanation: 'Natural collocation is "make a mistake", never "do a mistake".'
    };
  }

  private twoChoice(category: BlitzPrompt['category'], promptTitle: string, stem: string, correct: string, decoy: string, explanation: string): BlitzPrompt {
    const isLeftCorrect = Math.random() < 0.5;
    return {
      id: `blitz-${Date.now()}-${Math.random()}`,
      category,
      promptTitle,
      stem,
      optionA: isLeftCorrect ? correct : decoy,
      optionB: isLeftCorrect ? decoy : correct,
      correctIndex: isLeftCorrect ? 0 : 1,
      explanation
    };
  }

  /** 1. Collocation completion: blank the verb; the decoy is another common collocation verb that is wrong here. */
  private collocationStemPrompt(): BlitzPrompt | null {
    const item = collocationsData[Math.floor(Math.random() * collocationsData.length)];
    const words = item.phrase.trim().split(/\s+/);
    const verb = words[0].toLowerCase();
    if (words.length < 2 || !BLANKABLE_VERBS.has(verb)) return null;
    const rest = words.slice(1).join(' ');
    const restKey = rest.toLowerCase();

    const decoys = DECOY_VERBS.filter(v => {
      if (v === verb || ALSO_CORRECT[restKey]?.includes(v)) return false;
      // A bank phrase with this verb is only a fair decoy if it means something else (keep vs break a promise).
      const twin = collocationsData.find(c => c.phrase.toLowerCase() === `${v} ${restKey}`);
      return !twin || !meaningsOverlap(twin.vietnamese, item.vietnamese);
    });
    if (decoys.length === 0) return null;
    const decoy = decoys[Math.floor(Math.random() * decoys.length)];

    return this.twoChoice(
      'collocation-stem',
      'COLLOCATION // PARTNER COMPLETION',
      `Complete the phrase meaning <em>"${this.escapeHtml(item.vietnamese)}"</em>: <br/><strong class="stem-highlight">_____ ${this.escapeHtml(rest)}</strong>`,
      words[0],
      decoy,
      `Accurate collocation: "${item.phrase}" (${item.vietnamese}).`
    );
  }

  /** 2. Meaning identification: the decoy is a related collocation (shared word, same category/level) with a different meaning. */
  private collocationMeaningPrompt(): BlitzPrompt | null {
    const target = collocationsData[Math.floor(Math.random() * collocationsData.length)];
    const [decoy] = pickDecoys(target, collocationsData, 1, {
      answer: c => c.vietnamese,
      text: c => c.phrase,
      bonus: c => (c.category === target.category ? 2 : 0) + (c.cefrLevel === target.cefrLevel ? 1 : 0)
    });
    if (!decoy) return null;

    return this.twoChoice(
      'collocation-vn',
      'COLLOCATION // MEANING IDENTIFICATION',
      `Select the idiomatic Vietnamese meaning for: <br/><strong class="stem-highlight">${this.escapeHtml(target.phrase)}</strong>`,
      target.vietnamese,
      decoy.vietnamese,
      `"${target.phrase}" translates naturally to "${target.vietnamese}". "${decoy.phrase}" means "${decoy.vietnamese}".`
    );
  }

  /** 3. Definition match: skip definitions that contain the word; the decoy has the same type and length, ideally the same root. */
  private vocabDefinitionPrompt(): BlitzPrompt | null {
    const target = vocabularyData[Math.floor(Math.random() * vocabularyData.length)];
    if (!target.definition || definitionLeaksWord(target.definition, target.wordOrChunk)) return null;
    const wordCount = (v: { wordOrChunk: string }) => v.wordOrChunk.trim().split(/\s+/).length;
    const root = (v: { breakdown?: { root?: string } }) => v.breakdown?.root;

    const [decoy] = pickDecoys(target, vocabularyData, 1, {
      answer: v => v.wordOrChunk,
      text: v => v.wordOrChunk,
      meaning: v => v.vietnamese,
      accept: v => v.mode === target.mode && wordCount(v) === wordCount(target) && definitionKind(v.definition, v.wordOrChunk) === definitionKind(target.definition, target.wordOrChunk),
      bonus: v => (root(target) && root(v) === root(target) ? 3 : 0) + (v.cefrLevel === target.cefrLevel ? 1 : 0)
    });
    if (!decoy) return null;

    return this.twoChoice(
      'vocab-definition',
      'C2 LEXICON // DEFINITION MATCH',
      `Which academic term fits: <br/><em class="stem-definition">"${this.escapeHtml(target.definition)}"</em>?`,
      target.wordOrChunk,
      decoy.wordOrChunk,
      `"${target.wordOrChunk}" — ${target.definition} (${target.vietnamese}).`
    );
  }

  /**
   * Keyboard Navigation & Rapid Response Hotkeys
   */
  private bindKeyboardListener(): void {
    if (this.keyListener) return;

    this.keyListener = (e: KeyboardEvent) => {
      // Guard against input/textarea focus
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }
      // Space/Enter on a focused button (e.g. header HUD) activates that button, not the drill
      if ((e.key === ' ' || e.key === 'Enter') && activeEl?.closest('button, a')) return;

      if (this.state === 'READY') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.startBlitz();
        }
      } else if (this.state === 'RUNNING') {
        if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          this.submitAnswer(0);
        } else if (e.key === '2' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.submitAnswer(1);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.finishBlitz();
        }
      } else if (this.state === 'FINISHED') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.startBlitz();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          window.location.hash = '#tree';
        }
      }
    };

    document.addEventListener('keydown', this.keyListener);
  }

  private teardownTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public async canDeactivate(): Promise<boolean> {
    if (this.state !== 'RUNNING') return true;
    const isVi = I18n.getLocale() === 'vi';
    return HeaderHUD.showConfirmDialog({
      title: isVi ? 'XÁC NHẬN THOÁT BLITZ' : 'EXIT SPEED BLITZ',
      message: isVi
        ? 'Bạn đang trong lượt chạy Speed Blitz 60 giây. Nếu thoát lúc này, kết quả của vòng chơi sẽ bị huỷ.\nBạn có chắc chắn muốn thoát không?'
        : 'A 60-second Speed Blitz sprint is in progress. Exiting now will cancel this run.\nAre you sure you want to exit?',
      confirmText: isVi ? 'Thoát' : 'Exit',
      cancelText: isVi ? 'Tiếp tục' : 'Continue',
      type: 'warning'
    });
  }

  public teardown(): void {
    this.teardownTimer();
    if (this.keyListener) {
      document.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
    }
    if (this.state === 'RUNNING') {
      this.state = 'READY';
    }
  }

  private escapeHtml(raw: string): string {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
