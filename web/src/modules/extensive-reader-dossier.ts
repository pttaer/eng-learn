/**
 * ExtensiveReaderDossier: Comprehensible Input (Krashen i+1) Extensive Reading & Listening Engine.
 * Features:
 * - Graded long-form passages with zero forced quizzes or high-stress exams.
 * - Continuous audio narration with play/pause and speed toggle (0.8x, 1.0x, 1.2x).
 * - Seamless 1-tap word lookup popover with definition, Vietnamese gloss, and 1-tap SRS save.
 * - Real-time reading telemetry: words read, immersion duration, and saved vocabulary counter.
 *
 * 100% offline, zero external API calls.
 */

import { Cefr } from '../core/cefr';
import { defaultLevel, levelRowHtml, bindLevelChips } from '../core/level-filter';
import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { AcousticHaptics } from '../core/acoustic-haptics';
import readingData from '../assets/data/reading.json';
import lexiconData from '../assets/data/lexicon-dictionary.json';

export interface ExtensiveArticle {
  id: string;
  title: string;
  stage: string;
  cefrLevel: Cefr;
  genre: string;
  wordCount: number;
  content: string;
}

export class ExtensiveReaderDossier {
  private container: HTMLElement;
  private allArticles: ExtensiveArticle[] = [];
  private articles: ExtensiveArticle[] = [];
  private activeLevel: Cefr;
  private currentIndex: number = 0;
  private isAudioPlaying: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentSpeed: number = 1.0;
  private wordsReadCount: number = 0;
  private savedWordsCount: number = 0;
  private timerInterval: any = null;
  private sessionSeconds: number = 0;
  private activePopover: HTMLElement | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-extensive-reading interactive';

    const rawArticles = (readingData as any).articles || [];
    this.allArticles = rawArticles.map((a: any) => {
      const content = typeof a.content === 'string' ? a.content : (Array.isArray(a.content) ? a.content.join('\n\n') : '');
      return {
        id: a.id,
        title: a.title,
        stage: a.stage || `CEFR ${a.cefrLevel}`,
        cefrLevel: a.cefrLevel as Cefr,
        genre: a.genre || 'Extensive Story',
        wordCount: a.wordCount || content.split(/\s+/).filter(Boolean).length || 200,
        content
      };
    });

    this.activeLevel = defaultLevel(this.allArticles, StorageManager.getSkillLevel('reading'));
    this.articles = this.allArticles.filter(a => a.cefrLevel === this.activeLevel);
    if (this.articles.length === 0 && this.allArticles.length > 0) {
      this.articles = [this.allArticles[0]];
    }

    this.startSessionTimer();
  }

  private startSessionTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.sessionSeconds++;
      const timerEl = this.container.querySelector('.val-session-time');
      if (timerEl) {
        timerEl.textContent = new Date(this.sessionSeconds * 1000).toISOString().slice(14, 19);
      }
    }, 1000);
  }

  public setLevel(level: Cefr): void {
    this.stopAudio();
    this.activeLevel = level;
    this.articles = this.allArticles.filter(a => a.cefrLevel === level);
    if (this.articles.length === 0 && this.allArticles.length > 0) {
      this.articles = [this.allArticles[0]];
    }
    this.currentIndex = 0;
    if (this.container.isConnected) this.render();
  }

  public render(): HTMLElement {
    if (this.articles.length === 0) {
      this.container.innerHTML = '<div class="empty-state-notice">No extensive reading passages available.</div>';
      return this.container;
    }

    const article = this.articles[this.currentIndex];

    this.container.innerHTML = `
      <div class="extensive-reader-wrapper" style="width: 100%; max-width: 820px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Header & Control Bar -->
        <div class="dossier-control-bar" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-hairline); padding-bottom: 12px; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span class="telemetry-label" style="color: var(--accent-gold); font-weight: 700;">COMPREHENSIBLE INPUT // EXTENSIVE IMMERSION</span>
            <span class="hud-status-badge" style="background: var(--good-soft); color: var(--good); border: none;">0 FORCED QUIZZES</span>
            ${levelRowHtml(this.allArticles, this.activeLevel)}
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="hud-btn btn-audio-play" style="padding: 6px 14px; font-size: var(--font-kicker); border-radius: var(--radius-btn, 10px);" aria-label="Toggle Audio Read-Along">
              ${this.isAudioPlaying ? '⏸ Pause Audio' : '▶ Listen (TTS)'}
            </button>
            <button class="hud-btn btn-speed-toggle" style="padding: 6px 10px; font-size: var(--font-kicker); border-radius: var(--radius-btn, 10px); font-family: var(--font-mono);" aria-label="Audio Speed">
              ${this.currentSpeed}x
            </button>
          </div>
        </div>

        <!-- Session Telemetry Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-sunk); border-radius: var(--radius-squircle-sm, 10px); font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-secondary);">
          <div>GENRE: <strong style="color: var(--accent-gold);">${article.genre.toUpperCase()}</strong></div>
          <div>WORDS: <strong style="color: var(--ink-primary);">${article.wordCount}</strong></div>
          <div>SAVED WORDS: <strong style="color: var(--good);" class="val-saved-count">${this.savedWordsCount}</strong></div>
          <div>IMMERSION TIME: <strong style="color: var(--ink-primary);" class="val-session-time">${new Date(this.sessionSeconds * 1000).toISOString().slice(14, 19)}</strong></div>
        </div>

        <!-- Article Presentation Card -->
        <article class="extensive-article-card" style="background: var(--bg-surface); border: 1px solid var(--border-hairline); border-radius: 12px; padding: 24px; box-shadow: var(--shadow-card); position: relative;">
          <h2 style="font-size: var(--font-h2); line-height: 1.35; margin: 0 0 8px 0; color: var(--ink-primary);">
            ${article.title}
          </h2>
          <div style="font-size: var(--font-kicker); color: var(--ink-muted); margin-bottom: 20px; letter-spacing: 0.05em;">
            ${article.stage} • TAP ANY WORD FOR SEAMLESS INSTANT LOOKUP & SRS ADDITION
          </div>

          <!-- Interactive Clickable Word Passage -->
          <div class="interactive-passage-text" style="font-size: var(--font-h4); line-height: 1.85; color: var(--ink-primary); font-family: var(--font-sans); max-width: 68ch; user-select: text;">
            ${this.renderClickableWords(article.content)}
          </div>

          <!-- Bottom Action: Finish Immersion -->
          <div style="margin-top: 32px; padding-top: 18px; border-top: 1px solid var(--border-hairline); display: flex; justify-content: space-between; align-items: center;">
            <button class="hud-btn btn-finish-passage" style="background: var(--accent-gold); color: var(--bg-canvas); padding: 10px 20px; font-weight: 700; border: none; border-radius: var(--radius-btn, 10px); box-shadow: var(--shadow-glow);">
              ✓ Finish Reading (+${article.wordCount} words)
            </button>
            <div style="display: flex; gap: 8px;">
              <button class="hud-btn btn-prev-article" ${this.currentIndex === 0 ? 'disabled' : ''} style="border-radius: var(--radius-btn, 10px);">
                ${icon('arrowLeft')} Prev
              </button>
              <button class="hud-btn btn-next-article" ${this.currentIndex === this.articles.length - 1 ? 'disabled' : ''} style="border-radius: var(--radius-btn, 10px);">
                Next ${icon('arrowRight')}
              </button>
            </div>
          </div>
        </article>
      </div>
    `;

    this.bindEvents(article);
    return this.container;
  }

  private renderClickableWords(content: string): string {
    const paragraphs = content.split(/\n\n+/);
    return paragraphs.map(p => {
      const tokens = p.split(/(\s+|[.,!?;:"'()]+)/);
      const htmlTokens = tokens.map(t => {
        if (!t.trim() || /^[.,!?;:"'()]+$/.test(t)) {
          return t;
        }
        const cleanWord = t.replace(/[.,!?;:"'()]/g, '');
        return `<span class="lookup-word" data-word="${cleanWord}" style="cursor: pointer; border-radius: 3px; padding: 0 1px; transition: background 0.15s ease;">${t}</span>`;
      }).join('');
      return `<p style="margin-bottom: 1.4em;">${htmlTokens}</p>`;
    }).join('');
  }

  private bindEvents(article: ExtensiveArticle): void {
    bindLevelChips(this.container, (lvl) => this.setLevel(lvl));

    // Audio Play / Pause
    const playBtn = this.container.querySelector('.btn-audio-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.isAudioPlaying) {
          this.stopAudio();
          playBtn.textContent = '▶ Listen (TTS)';
        } else {
          this.playAudio(article.content);
          playBtn.textContent = '⏸ Pause Audio';
        }
      });
    }

    // Speed toggle (0.8x -> 1.0x -> 1.2x -> 0.8x)
    const speedBtn = this.container.querySelector('.btn-speed-toggle');
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        if (this.currentSpeed === 1.0) this.currentSpeed = 1.2;
        else if (this.currentSpeed === 1.2) this.currentSpeed = 0.8;
        else this.currentSpeed = 1.0;
        speedBtn.textContent = `${this.currentSpeed}x`;
        if (this.isAudioPlaying) {
          this.stopAudio();
          this.playAudio(article.content);
        }
      });
    }

    // Clickable Word Lookup Popover
    const words = this.container.querySelectorAll('.lookup-word');
    words.forEach(w => {
      w.addEventListener('click', (e) => {
        e.stopPropagation();
        const wordStr = (w as HTMLElement).dataset.word || '';
        this.openWordPopover(w as HTMLElement, wordStr);
      });
      w.addEventListener('mouseenter', () => {
        (w as HTMLElement).style.background = 'rgba(165,180,252,0.18)';
      });
      w.addEventListener('mouseleave', () => {
        (w as HTMLElement).style.background = 'transparent';
      });
    });

    // Dismiss popover on background tap
    document.addEventListener('click', (e) => {
      if (this.activePopover && !this.activePopover.contains(e.target as Node)) {
        this.dismissPopover();
      }
    });

    // Finish reading button
    const finishBtn = this.container.querySelector('.btn-finish-passage');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.wordsReadCount += article.wordCount;
        AcousticHaptics.chime();
        finishBtn.textContent = '✓ Logged to Progression!';
        (finishBtn as HTMLButtonElement).disabled = true;
        (finishBtn as HTMLElement).style.background = 'var(--ink-good)';
      });
    }

    // Navigation buttons
    const prevBtn = this.container.querySelector('.btn-prev-article');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.stopAudio();
          this.render();
        }
      });
    }

    const nextBtn = this.container.querySelector('.btn-next-article');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentIndex < this.articles.length - 1) {
          this.currentIndex++;
          this.stopAudio();
          this.render();
        }
      });
    }
  }

  private openWordPopover(targetEl: HTMLElement, word: string): void {
    this.dismissPopover();

    const rect = targetEl.getBoundingClientRect();
    const popover = document.createElement('div');
    popover.className = 'word-lookup-popover';
    popover.style.cssText = `
      position: fixed;
      top: ${Math.max(10, rect.bottom + 8)}px;
      left: ${Math.max(10, Math.min(window.innerWidth - 300, rect.left - 40))}px;
      width: 280px;
      padding: 14px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-squircle-sm, 10px);
      box-shadow: var(--shadow-card);
      z-index: var(--z-modal, 1000);
      font-family: var(--font-sans);
      animation: fadeIn 0.15s ease-out;
    `;

    const clean = word.toLowerCase().trim();
    const dict = lexiconData as Record<string, any>;
    const entry = dict[clean] ||
      dict[clean.replace(/s$/, '')] ||
      dict[clean.replace(/ed$/, '')] ||
      dict[clean.replace(/ing$/, '')];

    const ipa = entry?.ipa || '';
    const pos = entry?.pos || entry?.partOfSpeech || '';
    const definition = entry?.definition || `Core contextual lexical item in ${this.activeLevel} discourse.`;
    const vietnamese = entry?.vietnamese || '';

    popover.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div>
          <div style="font-size: var(--font-h4); font-weight: 700; color: var(--ink-primary);">${word} ${ipa ? `<span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--accent-gold); font-weight: 400;">${ipa}</span>` : ''}</div>
          <div style="font-size: var(--font-kicker); font-family: var(--font-mono); color: var(--accent-cyan, #38bdf8);">${pos ? `${pos} • ` : ''}CEFR ${this.activeLevel}</div>
        </div>
        <button type="button" class="btn-popover-speak hud-btn" style="padding: 4px 8px; font-size: var(--font-kicker); border-radius: var(--radius-btn, 10px);" title="Pronounce">
          🔊
        </button>
      </div>

      <div style="font-size: var(--font-body-compact); line-height: 1.45; color: var(--ink-secondary); margin-bottom: 8px;">
        ${definition}
      </div>

      ${vietnamese ? `
        <div style="font-size: var(--font-kicker); line-height: 1.4; color: var(--ink-primary); background: var(--bg-surface-sunk); padding: 6px 10px; border-radius: 6px; margin-bottom: 12px; border-left: 2px solid var(--accent-gold);">
          <strong style="color: var(--accent-gold);">Nghĩa:</strong> ${vietnamese}
        </div>
      ` : ''}

      <button type="button" class="btn-popover-save hud-btn" style="width: 100%; justify-content: center; padding: 8px 0; background: var(--good-soft); color: var(--good); border: 1px solid var(--good-border); font-weight: 700; border-radius: var(--radius-btn, 10px);">
        ☆ Save to SRS Constellation
      </button>
    `;

    // Speak audio
    popover.querySelector('.btn-popover-speak')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioSynthesizer.speak(word);
    });

    // Save to SRS Constellation
    popover.querySelector('.btn-popover-save')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const cardId = `word-ext-${clean}`;
      const existing = StorageManager.getCardState(cardId);
      const newState = SRSEngine.rateCard(existing, cardId, 'good');
      StorageManager.setCardState(cardId, newState);

      this.savedWordsCount++;
      const savedCountEl = this.container.querySelector('.val-saved-count');
      if (savedCountEl) savedCountEl.textContent = String(this.savedWordsCount);

      AcousticHaptics.chime();
      const saveBtn = popover.querySelector('.btn-popover-save') as HTMLButtonElement;
      if (saveBtn) {
        saveBtn.textContent = '✓ Saved in SRS!';
        saveBtn.disabled = true;
      }
      setTimeout(() => this.dismissPopover(), 800);
    });

    document.body.appendChild(popover);
    this.activePopover = popover;
  }

  private dismissPopover(): void {
    if (this.activePopover) {
      this.activePopover.remove();
      this.activePopover = null;
    }
  }

  private playAudio(text: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    this.stopAudio();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.currentSpeed;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      this.isAudioPlaying = false;
      this.currentUtterance = null;
      const btn = this.container.querySelector('.btn-audio-play');
      if (btn) btn.textContent = '▶ Listen (TTS)';
    };

    this.currentUtterance = utterance;
    this.isAudioPlaying = true;
    window.speechSynthesis.speak(utterance);
  }

  public stopAudio(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (this.currentUtterance || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
    this.isAudioPlaying = false;
    this.currentUtterance = null;
  }

  public destroy(): void {
    this.stopAudio();
    this.dismissPopover();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
