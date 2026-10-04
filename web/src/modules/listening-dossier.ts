import { AtomicCard } from '../core/atomic-card';
import { icon } from '../utils/icons';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import listeningData from '../assets/data/listening.json';

export class ListeningDossier {
  private container: HTMLElement;
  private passages: any[] = [];
  private currentIndex: number = 0;
  private currentCardHandle: any = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-listening interactive';
    this.passages = (listeningData as any).samplePassages || [];
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs">
          <span class="telemetry-label">Pillar 03 · Active Transcription & Phonetics</span>
        </div>
        <div class="dossier-status-pill">
          <span class="telemetry-value">3-PASS ACTIVE PROTOCOL</span>
        </div>
      </div>
      <div class="dossier-card-slot"></div>
      <div class="dossier-nav-bar">
        <button class="hud-btn nav-btn-prev">${icon('arrowLeft')} Prev Passage</button>
        <span class="telemetry-value card-counter">Passage ${this.currentIndex + 1} / ${this.passages.length}</span>
        <button class="hud-btn nav-btn-next">Next Passage ${icon('arrowRight')}</button>
      </div>
    `;

    this.bindEvents();
    this.renderCurrentCard();
    return this.container;
  }

  private bindEvents(): void {
    this.container.querySelector('.nav-btn-prev')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
        this.renderCurrentCard();
      }
    });

    this.container.querySelector('.nav-btn-next')?.addEventListener('click', () => {
      if (this.currentIndex < this.passages.length - 1) {
        this.currentIndex += 1;
        this.renderCurrentCard();
      }
    });
  }

  private renderCurrentCard(): void {
    const slot = this.container.querySelector('.dossier-card-slot');
    if (!slot) return;
    slot.innerHTML = '';

    if (this.passages.length === 0) return;

    const item = this.passages[this.currentIndex];
    const srsState = StorageManager.getCardState(item.id);
    let statusBadge: 'NEW' | 'REVIEW' | 'MASTERED' = 'NEW';
    if (srsState) {
      statusBadge = srsState.repetitions >= 3 ? 'MASTERED' : 'REVIEW';
    }

    // Front: Active Transcription Station (Pass 1 & Pass 2)
    const frontEl = document.createElement('div');
    frontEl.className = 'listening-front';
    frontEl.innerHTML = `
      <div class="card-prompt-label">Pass 1 & 2 · Active Audio Transcription</div>
      <div style="font-family: var(--font-sans); font-size: 15px; font-weight: 600; margin-bottom: 8px;">
        Topic: ${item.title}
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <button class="hud-btn btn-play-audio" style="font-size: 11px; padding: 4px 10px;">▶ Play 1.0x</button>
        <button class="hud-btn btn-play-slow" style="font-size: 11px; padding: 4px 10px;">⏵ Play 0.8x</button>
      </div>
      <textarea class="listening-transcribe-box" placeholder="Pass 2: Transcribe word-for-word here..." rows="3" style="width: 100%; font-family: var(--font-mono); font-size: 12px; padding: 10px; border: 1px solid var(--border-subtle); background: var(--bg-surface-sunk); color: var(--ink-primary); border-radius: 6px; outline: none; resize: none;"></textarea>
      <div style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted); margin-top: 6px;">
        Listen at least twice before pressing Space / Flip to reveal phonetic analysis.
      </div>
    `;

    const speak = (rate: number) => {
      AudioSynthesizer.speak(item.audioText, rate);
    };

    frontEl.querySelector('.btn-play-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      speak(1.0);
    });

    frontEl.querySelector('.btn-play-slow')?.addEventListener('click', (e) => {
      e.stopPropagation();
      speak(0.8);
    });

    // Back: Pass 3 Phonetic Gap Analysis & IPA
    const backEl = document.createElement('div');
    backEl.className = 'listening-back';
    backEl.innerHTML = `
      <div class="card-prompt-label">Pass 3 · Phonetic Gap Analysis & Transcript</div>
      <div class="card-main-text" style="font-size: 14px; font-weight: 600; margin-bottom: 6px;">
        "${item.audioText}"
      </div>
      <div class="card-ipa-text" style="font-size: 11px; margin-bottom: 8px; background: var(--bg-surface-sunk); color: var(--accent-gold); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 4px 8px;">
        IPA: ${item.ipa}
      </div>
      <div style="font-family: var(--font-mono); font-size: 11px; line-height: 1.4; border-top: 1px dashed var(--border-hairline); padding-top: 6px;">
        <strong>CONNECTED SPEECH PHENOMENA:</strong><br />
        ${item.traps}
      </div>
    `;

    const cardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'LISTEN',
      category: 'PHONETICS',
      indexStr: `0${this.currentIndex + 1} / 03`,
      statusBadge,
      front: {
        customContent: frontEl,
        mainText: item.title
      },
      back: {
        customContent: backEl,
        mainText: item.audioText
      },
      audioText: item.audioText,
      onRate: (rating) => {
        const nextState = SRSEngine.rateCard(srsState, item.id, rating);
        StorageManager.setCardState(item.id, nextState);

        if (this.currentIndex < this.passages.length - 1) {
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
      counter.textContent = `Passage ${this.currentIndex + 1} / ${this.passages.length}`;
    }
  }

  public handleGlobalKey(key: string): boolean {
    if (!this.currentCardHandle) return false;

    const active = document.activeElement;
    if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
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
