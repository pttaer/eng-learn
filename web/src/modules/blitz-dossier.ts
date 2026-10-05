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
import collocationsData from '../assets/data/collocations.json';
import vocabularyData from '../assets/data/vocabulary.json';

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
          <span class="blitz-glow-badge">${icon('zap', 12)} ROGUELIKE SPEED RUN</span>
          <span class="blitz-high-score-badge">HIGH SCORE: <strong>${this.highScore.toLocaleString()} PTS</strong></span>
        </div>

        <h1 class="blitz-ready-title" id="blitz-ready-title">60-SECOND RAPID BLITZ</h1>
        <p class="blitz-ready-desc">
          Push your linguistic intuition to absolute cognitive limits. 60 seconds of high-velocity collocation
          and C2 lexical recall. Chain correct answers to trigger exponential combo multipliers!
        </p>

        <div class="blitz-mechanics-grid">
          <div class="blitz-mechanic-card">
            <div class="mechanic-icon">${icon('clock', 22)}</div>
            <div class="mechanic-title">60s Clock</div>
            <div class="mechanic-detail">Non-stop rapid-fire decision timer. Clock ticks down continuously.</div>
          </div>
          <div class="blitz-mechanic-card">
            <div class="mechanic-icon">${icon('flame', 22)}</div>
            <div class="mechanic-title">Combo Multipliers</div>
            <div class="mechanic-detail">5 Streak = 2x • 10 Streak = 3x • 15+ Streak = 4x Max Surge.</div>
          </div>
          <div class="blitz-mechanic-card">
            <div class="mechanic-icon">${icon('keyboard', 22)}</div>
            <div class="mechanic-title">Instant Hotkeys</div>
            <div class="mechanic-detail">Press <kbd>[1]</kbd> or <kbd>[←]</kbd> for Left • <kbd>[2]</kbd> or <kbd>[→]</kbd> for Right.</div>
          </div>
        </div>

        <div class="blitz-ready-actions">
          <button type="button" class="hud-btn blitz-start-btn" id="blitz-start-btn" aria-label="Start 60-Second Blitz Drill">
            ${icon('zap')} START BLITZ DRILL
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
            <span class="metric-label">SCORE</span>
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
            <span class="metric-label">ACCURACY</span>
            <span class="metric-value metric-accuracy" id="blitz-accuracy-val">${accuracy}%</span>
          </div>
        </header>

        <!-- Combo Gauge Multiplier -->
        <div class="blitz-combo-gauge-container">
          <div class="blitz-combo-pill multiplier-${multiplier}" id="blitz-combo-pill">
            <span class="multiplier-text">${multiplier}X MULTIPLIER</span>
            <span class="streak-text">${icon('flame', 12)} ${this.streak} STREAK</span>
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
          <span class="blitz-glow-badge">BLITZ RUN CONCLUDED</span>
          ${stats.isNewHighScore ? `<span class="blitz-new-record-badge">${icon('trophy', 12)} NEW ALL-TIME HIGH SCORE!</span>` : ''}
        </div>

        <h1 class="blitz-summary-title" id="blitz-summary-title">SPRINT COMPLETE</h1>
        <div class="summary-score-hero">
          <div class="hero-score-number">${stats.score.toLocaleString()}</div>
          <div class="hero-score-label">TOTAL SCORE POINTS</div>
        </div>

        <div class="summary-stats-grid">
          <div class="summary-stat-box">
            <span class="stat-label">ACCURACY</span>
            <span class="stat-val highlight-green">${stats.accuracy}%</span>
            <span class="stat-sub">${stats.correctCount} / ${stats.totalAnswered} Correct</span>
          </div>

          <div class="summary-stat-box">
            <span class="stat-label">MAX COMBO</span>
            <span class="stat-val highlight-gold">${stats.maxStreak} ${icon('flame', 12)}</span>
            <span class="stat-sub">Peak Multiplier</span>
          </div>

          <div class="summary-stat-box">
            <span class="stat-label">XP REWARD</span>
            <span class="stat-val highlight-purple">+${stats.xpEarned} XP</span>
            <span class="stat-sub">Dispatched to RPG Hub</span>
          </div>
        </div>

        <div class="summary-action-cluster">
          <button type="button" class="hud-btn blitz-action-btn btn-restart-blitz" id="btn-restart-blitz" aria-label="Play Another Blitz Run">
            ${icon('zap')} PLAY AGAIN
          </button>
          <button type="button" class="hud-btn blitz-action-btn btn-return-tree" id="btn-return-tree" aria-label="Return to Constellation Skill Tree">
            ${icon('compass')} BACK TO TREE
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

      // Check for streak milestone upgrade
      if (this.streak === 5 || this.streak === 10 || this.streak === 15) {
        AudioSynthesizer.play('streak-fire');
        ParticleCanvas.burst(window.innerWidth / 2, window.innerHeight * 0.4, 25);
      } else {
        AudioSynthesizer.play('absorb');
      }
    } else {
      this.streak = 0;
      if (chosenBtn) {
        chosenBtn.classList.add('flash-wrong');
      }
      if (otherBtn) {
        otherBtn.classList.add('flash-correct-hint');
      }
      AudioSynthesizer.play('alarm');
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
        <span class="multiplier-text">${mult}X MULTIPLIER</span>
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
   */
  private generatePrompt(): BlitzPrompt {
    const roll = Math.random();

    // 1. Collocation Completion (40% chance)
    if (roll < 0.40 && Array.isArray(collocationsData) && collocationsData.length > 0) {
      const item = collocationsData[Math.floor(Math.random() * collocationsData.length)];
      const words = item.phrase.trim().split(/\s+/);

      if (words.length >= 2) {
        const firstWord = words[0];
        const rest = words.slice(1).join(' ');
        const stem = `_____ ${rest}`;

        // Select decoy from other first words or verbs
        const decoys = ['make', 'take', 'do', 'have', 'give', 'keep', 'hold', 'bring', 'draw', 'bear', 'render', 'exert'];
        const filteredDecoys = decoys.filter(d => d.toLowerCase() !== firstWord.toLowerCase());
        const decoy = filteredDecoys[Math.floor(Math.random() * filteredDecoys.length)] || 'make';

        const isLeftCorrect = Math.random() < 0.5;

        return {
          id: `blitz-${Date.now()}-${Math.random()}`,
          category: 'collocation-stem',
          promptTitle: 'COLLOCATION // PARTNER COMPLETION',
          stem: `Complete the natural C1/C2 phrase: <br/><strong class="stem-highlight">${stem}</strong>`,
          optionA: isLeftCorrect ? firstWord : decoy,
          optionB: isLeftCorrect ? decoy : firstWord,
          correctIndex: isLeftCorrect ? 0 : 1,
          explanation: `Accurate collocation: "${item.phrase}" (${item.vietnamese}).`
        };
      }
    }

    // 2. Collocation Meaning Translation (30% chance)
    if (roll < 0.70 && Array.isArray(collocationsData) && collocationsData.length > 1) {
      const targetIdx = Math.floor(Math.random() * collocationsData.length);
      const target = collocationsData[targetIdx];

      let decoyIdx = Math.floor(Math.random() * collocationsData.length);
      while (decoyIdx === targetIdx) {
        decoyIdx = Math.floor(Math.random() * collocationsData.length);
      }
      const decoy = collocationsData[decoyIdx];

      const isLeftCorrect = Math.random() < 0.5;

      return {
        id: `blitz-${Date.now()}-${Math.random()}`,
        category: 'collocation-vn',
        promptTitle: 'COLLOCATION // MEANING IDENTIFICATION',
        stem: `Select the idiomatic Vietnamese meaning for: <br/><strong class="stem-highlight">${target.phrase}</strong>`,
        optionA: isLeftCorrect ? target.vietnamese : decoy.vietnamese,
        optionB: isLeftCorrect ? decoy.vietnamese : target.vietnamese,
        correctIndex: isLeftCorrect ? 0 : 1,
        explanation: `"${target.phrase}" translates naturally to "${target.vietnamese}".`
      };
    }

    // 3. Academic Vocabulary Definition (30% chance)
    if (Array.isArray(vocabularyData) && vocabularyData.length > 1) {
      const targetIdx = Math.floor(Math.random() * vocabularyData.length);
      const target = vocabularyData[targetIdx];

      let decoyIdx = Math.floor(Math.random() * vocabularyData.length);
      while (decoyIdx === targetIdx) {
        decoyIdx = Math.floor(Math.random() * vocabularyData.length);
      }
      const decoy = vocabularyData[decoyIdx];

      const isLeftCorrect = Math.random() < 0.5;

      return {
        id: `blitz-${Date.now()}-${Math.random()}`,
        category: 'vocab-definition',
        promptTitle: 'C2 LEXICON // DEFINITION MATCH',
        stem: `Which academic term fits: <br/><em class="stem-definition">"${target.definition}"</em>?`,
        optionA: isLeftCorrect ? target.wordOrChunk : decoy.wordOrChunk,
        optionB: isLeftCorrect ? decoy.wordOrChunk : target.wordOrChunk,
        correctIndex: isLeftCorrect ? 0 : 1,
        explanation: `"${target.wordOrChunk}" — ${target.definition} (${target.vietnamese}).`
      };
    }

    // Fallback safe prompt
    return {
      id: 'blitz-fallback',
      category: 'collocation-stem',
      promptTitle: 'RAPID FLASH COLLOCATION',
      stem: 'Complete: <strong class="stem-highlight">_____ resemblance</strong>',
      optionA: 'bear',
      optionB: 'make',
      correctIndex: 0,
      explanation: 'Accurate native collocation is "bear resemblance".'
    };
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

  public teardown(): void {
    this.teardownTimer();
    if (this.keyListener) {
      document.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
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
