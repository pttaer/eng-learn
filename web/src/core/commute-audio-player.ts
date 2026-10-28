import { HapticEngine } from './haptic-engine';
import { icon } from '../utils/icons';
import { t } from './i18n';

export interface CommuteAudioItem {
  id: string;
  category: string;
  prompt: string;
  answer: string;
  meaning: string;
  contextSentence?: string;
}

interface CollocationRow {
  id: string;
  phrase: string;
  vietnamese: string;
  example?: string;
  category?: string;
}

const FALLBACK_ITEMS: CommuteAudioItem[] = [
  { id: '1', category: 'Academic', prompt: 'Take something for ...', answer: 'granted', meaning: '', contextSentence: 'She took his continuous support for granted.' },
  { id: '2', category: 'Idiom', prompt: 'Bite the ...', answer: 'bullet', meaning: '', contextSentence: 'He decided to bite the bullet and sit the examination.' },
  { id: '3', category: 'Collocation', prompt: 'Substantial ...', answer: 'evidence', meaning: '', contextSentence: 'The researchers presented substantial evidence.' }
];

// Blank the longest content word (4+ letters, else the last word) so the learner has to recall it.
function toItem(row: CollocationRow): CommuteAudioItem | null {
  const words = row.phrase.split(' ');
  let blank = words.length - 1;
  let best = 0;
  words.forEach((w, i) => {
    const len = w.replace(/[^A-Za-z]/g, '').length;
    if (len >= 4 && len > best) {
      best = len;
      blank = i;
    }
  });
  const answer = words[blank].replace(/[^A-Za-z]/g, '');
  if (!answer) return null;
  return {
    id: row.id,
    category: row.category || 'Collocation',
    prompt: words.map((w, i) => (i === blank ? '...' : w)).join(' '),
    answer,
    meaning: row.vietnamese,
    contextSentence: row.example || row.phrase
  };
}

export class CommuteAudioPlayer {
  private static isPlaying = false;
  private static currentIndex = 0;
  private static playlist: CommuteAudioItem[] = [];
  private static playlistLoad: Promise<void> | null = null;
  private static silentAudioEl: HTMLAudioElement | null = null;
  private static delayMs = 3000;
  private static speechRate = 1.0;
  private static modalEl: HTMLElement | null = null;
  private static pauseTimer: number | null = null;
  // Every state change bumps this. Callbacks from a superseded speech chain see the mismatch and stop.
  private static runId = 0;
  private static hashListenerAttached = false;

  // 0.5 s of 8 kHz 8-bit silence, so the loop has real duration. Whether iOS Safari
  // keeps background audio alive on it is unverified and needs a device test.
  private static SILENT_WAV_URI = 'data:audio/wav;base64,UklGRsQPAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAPAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

  public static init(): void {
    if (!this.silentAudioEl) {
      const audio = document.createElement('audio');
      audio.loop = true;
      audio.src = this.SILENT_WAV_URI;
      audio.preload = 'auto';
      audio.style.display = 'none';
      document.body.appendChild(audio);
      this.silentAudioEl = audio;
    }

    if (!this.hashListenerAttached) {
      this.hashListenerAttached = true;
      // Leaving for another screen stops the loop, so it never talks over other audio (e.g. IELTS Listening)
      window.addEventListener('hashchange', () => {
        if (this.isPlaying || this.modalEl) this.close();
      });
    }

    this.setupMediaSession();
  }

  private static ensurePlaylist(): Promise<void> {
    if (this.playlist.length > 0) return Promise.resolve();
    if (!this.playlistLoad) {
      // Dynamic import: the collocation data loads on first open, not with every bundle
      this.playlistLoad = import('../assets/data/collocations.json')
        .then((mod) => {
          const rows = (mod as unknown as { default: CollocationRow[] }).default;
          this.playlist = rows
            .slice(0, 100)
            .map(toItem)
            .filter((item): item is CommuteAudioItem => item !== null);
        })
        .catch(() => {
          this.playlist = [];
        })
        .then(() => {
          if (this.playlist.length === 0) this.playlist = FALLBACK_ITEMS;
          this.currentIndex = 0;
          this.updatePlayerUI();
        });
    }
    return this.playlistLoad;
  }

  private static setupMediaSession(): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.previous();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.next();
      });
    } catch {
      // mediaSession actions unsupported or restricted
    }
  }

  private static updateMediaMetadata(item: CommuteAudioItem): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.prompt,
        artist: `English Singularity — ${item.category}`,
        album: 'Hands-Free Commute Audio Loop'
      });
    } catch {}
  }

  public static play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Silent anchor keeps iOS Safari's background audio thread alive
    if (this.silentAudioEl) {
      this.silentAudioEl.play().catch(() => {});
    }

    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }

    const run = this.nextRun();
    this.updatePlayerUI();
    void this.ensurePlaylist().then(() => this.playCurrentItem(run));
  }

  public static pause(): void {
    this.isPlaying = false;
    this.nextRun();
    this.stopSpeech();
    if (this.silentAudioEl) {
      this.silentAudioEl.pause();
    }
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    this.updatePlayerUI();
  }

  public static toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public static next(): void {
    this.stepTo((this.currentIndex + 1) % Math.max(1, this.playlist.length));
  }

  public static previous(): void {
    const count = Math.max(1, this.playlist.length);
    this.stepTo((this.currentIndex - 1 + count) % count);
  }

  private static stepTo(index: number): void {
    if (this.playlist.length === 0) return;
    const run = this.nextRun();
    this.stopSpeech();
    this.currentIndex = index;
    HapticEngine.trigger('selection');
    if (this.isPlaying) {
      this.playCurrentItem(run);
    } else {
      this.updatePlayerUI();
    }
  }

  private static nextRun(): number {
    this.runId += 1;
    if (this.pauseTimer) {
      window.clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    return this.runId;
  }

  private static stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private static playCurrentItem(run: number): void {
    if (!this.isPlaying || run !== this.runId || this.playlist.length === 0) return;

    const item = this.playlist[this.currentIndex];
    this.updateMediaMetadata(item);
    this.updatePlayerUI();

    // Step 1: speak the prompt with the word blanked out
    this.speakUtterance(item.prompt, run, () => {
      // Step 2: active-recall pause
      this.pauseTimer = window.setTimeout(() => {
        this.pauseTimer = null;
        // Step 3: reveal the word, then the model sentence
        this.speakUtterance(`${item.answer}. ${item.contextSentence ?? ''}`, run, () => {
          // Step 4: short gap, then the next item
          this.pauseTimer = window.setTimeout(() => {
            this.pauseTimer = null;
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
            this.playCurrentItem(run);
          }, 1500);
        });
      }, this.delayMs);
    });
  }

  private static speakUtterance(text: string, run: number, onEnd: () => void): void {
    if (run !== this.runId) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd();
      return;
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = this.speechRate;
    utt.lang = 'en-US';

    utt.onend = () => {
      if (run === this.runId) onEnd();
    };
    utt.onerror = (ev) => {
      if (run !== this.runId) return; // superseded by our own pause/step: ignore
      // Another speech user (e.g. IELTS Listening) took the synth: yield instead of talking over it
      if (ev.error === 'interrupted' || ev.error === 'canceled') {
        this.pause();
        return;
      }
      onEnd();
    };

    window.speechSynthesis.speak(utt);
  }

  public static open(): void {
    this.init();
    if (this.modalEl) {
      this.modalEl.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'commute-player-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Hands-Free Commute Audio Loop');

    const sheet = document.createElement('div');
    sheet.className = 'commute-player-sheet';

    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    this.modalEl = overlay;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    this.renderPlayer(sheet);
    void this.ensurePlaylist();
  }

  // Closing the sheet always stops playback, so the loop never runs unseen
  public static close(): void {
    this.pause();
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

  private static updatePlayerUI(): void {
    if (!this.modalEl) return;
    const item = this.playlist[this.currentIndex];
    if (!item) return;

    const promptEl = this.modalEl.querySelector('.commute-item-prompt');
    const answerEl = this.modalEl.querySelector('.commute-item-answer');
    const meaningEl = this.modalEl.querySelector('.commute-item-meaning');
    const categoryEl = this.modalEl.querySelector('.commute-item-category');
    const indexEl = this.modalEl.querySelector('.commute-item-index');
    const playBtn = this.modalEl.querySelector('.commute-btn-play');

    if (promptEl) promptEl.textContent = item.prompt;
    if (answerEl) answerEl.textContent = item.answer;
    if (meaningEl) meaningEl.textContent = item.meaning;
    if (categoryEl) categoryEl.textContent = item.category;
    if (indexEl) indexEl.textContent = `${this.currentIndex + 1} / ${this.playlist.length}`;
    if (playBtn) {
      playBtn.innerHTML = this.isPlaying ? icon('pause', 22) : icon('play', 22);
      playBtn.setAttribute('aria-label', this.isPlaying ? t('commute.pause_loop', undefined, 'Pause Loop') : t('commute.play_loop', undefined, 'Play Loop'));
    }
  }

  private static renderPlayer(container: HTMLElement): void {
    const item = this.playlist[this.currentIndex] || { prompt: 'Loading...', answer: '', meaning: '', category: 'Collocations' };

    container.innerHTML = `
      <div class="commute-player-header">
        <div class="commute-brand-group">
          <span class="commute-kicker">${t('commute.kicker', undefined, 'HANDS-FREE COMMUTE & WALK')}</span>
          <h2 class="commute-title">${icon('headphones', 18)} ${t('commute.title', undefined, 'Autonomous Audio Loop')}</h2>
        </div>
        <button type="button" class="commute-btn-close" aria-label="${t('commute.close_player', undefined, 'Close Audio Player')}">✕</button>
      </div>

      <div class="commute-display-card">
        <div class="commute-badge-row">
          <span class="commute-item-category">${item.category}</span>
          <span class="commute-item-index">${this.currentIndex + 1} / ${this.playlist.length}</span>
        </div>

        <div class="commute-prompt-wrapper">
          <span class="commute-sub-label">${t('commute.prompt_label', undefined, 'PROMPT // ACTIVE RECALL')}</span>
          <div class="commute-item-prompt">${item.prompt}</div>
        </div>

        <div class="commute-answer-wrapper">
          <span class="commute-sub-label">${t('commute.target_resolution', undefined, 'TARGET RESOLUTION')}</span>
          <div class="commute-item-answer">${item.answer}</div>
          <div class="commute-item-meaning">${item.meaning}</div>
        </div>
      </div>

      <div class="commute-controls-row">
        <button type="button" class="commute-btn-ctrl commute-btn-prev" aria-label="Previous Track">${icon('skipBack', 20)}</button>
        <button type="button" class="commute-btn-ctrl commute-btn-play" aria-label="${this.isPlaying ? t('commute.pause_loop', undefined, 'Pause Loop') : t('commute.play_loop', undefined, 'Play Loop')}">
          ${this.isPlaying ? icon('pause', 22) : icon('play', 22)}
        </button>
        <button type="button" class="commute-btn-ctrl commute-btn-next" aria-label="Next Track">${icon('skipForward', 20)}</button>
      </div>

      <div class="commute-settings-grid">
        <div class="commute-setting-item">
          <span class="setting-label">${t('commute.recall_pause', undefined, 'Recall Pause')}</span>
          <div class="commute-pill-group">
            <button type="button" class="pill-btn ${this.delayMs === 2000 ? 'is-active' : ''}" data-delay="2000">2s</button>
            <button type="button" class="pill-btn ${this.delayMs === 3000 ? 'is-active' : ''}" data-delay="3000">3s</button>
            <button type="button" class="pill-btn ${this.delayMs === 4000 ? 'is-active' : ''}" data-delay="4000">4s</button>
          </div>
        </div>

        <div class="commute-setting-item">
          <span class="setting-label">${t('commute.voice_speed', undefined, 'Voice Speed')}</span>
          <div class="commute-pill-group">
            <button type="button" class="pill-btn ${this.speechRate === 0.8 ? 'is-active' : ''}" data-rate="0.8">0.8x</button>
            <button type="button" class="pill-btn ${this.speechRate === 1.0 ? 'is-active' : ''}" data-rate="1.0">1.0x</button>
            <button type="button" class="pill-btn ${this.speechRate === 1.2 ? 'is-active' : ''}" data-rate="1.2">1.2x</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('.commute-btn-close')?.addEventListener('click', () => this.close());

    container.querySelector('.commute-btn-play')?.addEventListener('click', () => {
      this.toggle();
    });

    container.querySelector('.commute-btn-prev')?.addEventListener('click', () => {
      this.previous();
    });

    container.querySelector('.commute-btn-next')?.addEventListener('click', () => {
      this.next();
    });

    container.querySelectorAll('[data-delay]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const d = Number((e.currentTarget as HTMLElement).dataset.delay);
        this.delayMs = d;
        container.querySelectorAll('[data-delay]').forEach(b => b.classList.remove('is-active'));
        (e.currentTarget as HTMLElement).classList.add('is-active');
        HapticEngine.trigger('light');
      });
    });

    container.querySelectorAll('[data-rate]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const r = Number((e.currentTarget as HTMLElement).dataset.rate);
        this.speechRate = r;
        container.querySelectorAll('[data-rate]').forEach(b => b.classList.remove('is-active'));
        (e.currentTarget as HTMLElement).classList.add('is-active');
        HapticEngine.trigger('light');
      });
    });
  }
}

// Global exposure
(window as any).CommuteAudioPlayer = CommuteAudioPlayer;
