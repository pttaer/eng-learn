import { AudioSynthesizer } from './audio-synthesizer';

export interface AtomicCardConfig {
  id: string;
  pillar: string;
  category: string;
  indexStr: string;
  statusBadge: 'NEW' | 'REVIEW' | 'MASTERED';
  front: {
    promptLabel?: string;
    mainText?: string;
    subText?: string;
    phoneticText?: string;
    pacingHint?: string;
    customContent?: HTMLElement;
  };
  back: {
    promptLabel?: string;
    mainText?: string;
    subText?: string;
    explanation?: string;
    formula?: string;
    ipa?: string;
    customContent?: HTMLElement;
  };
  audioText?: string;
  onRate?: (rating: 'again' | 'good') => void;
  onFlip?: (isFlipped: boolean) => void;
}

export type CardConfig = AtomicCardConfig;

export interface AtomicCardHandle {
  element: HTMLElement;
  flip: () => void;
  rate: (rating: 'again' | 'good') => void;
  isFlipped: () => boolean;
  focus: () => void;
  destroy: () => void;
}

export class AtomicCard {
  public static create(config: AtomicCardConfig): AtomicCardHandle {
    const wrapper = document.createElement('div');
    wrapper.className = 'atomic-card-perspective-wrapper interactive';

    const container = document.createElement('div');
    container.className = 'atomic-card-container';
    container.id = `card-${config.id}`;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-roledescription', 'flashcard');
    container.setAttribute('aria-label', `${config.pillar} Drill: ${config.category} ${config.indexStr}`);

    const flipper = document.createElement('div');
    flipper.className = 'atomic-card-inner atomic-card-flipper';
    flipper.setAttribute('aria-live', 'polite');

    let isFlipped = false;

    // Pronunciation via Web Speech API with dialect fallback
    const speakText = (text: string) => {
      AudioSynthesizer.speak(text, 0.95);
    };

    // Flip Action & Focus Management
    const doFlip = () => {
      isFlipped = !isFlipped;
      flipper.classList.toggle('is-flipped', isFlipped);
      faceFront.setAttribute('aria-hidden', String(isFlipped));
      faceBack.setAttribute('aria-hidden', String(!isFlipped));

      const flipBtn = faceFront.querySelector('.btn-flip-trigger') as HTMLButtonElement | null;
      if (flipBtn) {
        flipBtn.setAttribute('aria-expanded', String(isFlipped));
      }

      AudioSynthesizer.play('flip');
      if (config.onFlip) {
        config.onFlip(isFlipped);
      }

      // Shift focus to primary action on the revealed face
      setTimeout(() => {
        if (isFlipped) {
          const target = faceBack.querySelector('.btn-rate-good') as HTMLElement | null;
          target?.focus();
        } else {
          flipBtn?.focus();
        }
      }, 150);
    };

    // Rate Action
    const doRate = (rating: 'again' | 'good') => {
      AudioSynthesizer.play(rating === 'good' ? 'click' : 'alarm');
      if (config.onRate) {
        config.onRate(rating);
      }
    };

    // ==========================================
    // 1. FRONT FACE
    // ==========================================
    const faceFront = document.createElement('div');
    faceFront.className = 'card-face card-face-front face-front';
    faceFront.setAttribute('aria-hidden', 'false');

    // Header Zone
    const frontHeader = document.createElement('div');
    frontHeader.className = 'card-header-bar card-header-hud';
    frontHeader.innerHTML = `
      <div class="card-meta-left header-left">
        <span class="telemetry-badge">[${config.pillar} // ${config.category}]</span>
        <span class="card-badge-status card-status-badge">${config.statusBadge}</span>
      </div>
      <div class="card-meta-right header-right">
        <span class="card-index-counter">${config.indexStr}</span>
        ${config.audioText ? `<button type="button" class="card-audio-btn btn-audio-speak" aria-label="Listen to pronunciation of prompt" title="Listen (P)">🔊 AUDIO</button>` : ''}
      </div>
    `;

    if (config.audioText) {
      const audioBtn = frontHeader.querySelector('.card-audio-btn') as HTMLButtonElement;
      audioBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        speakText(config.audioText!);
      });
    }

    // Body Content Zone
    const frontBody = document.createElement('div');
    frontBody.className = 'card-body card-content-slot';
    if (config.front.customContent) {
      frontBody.appendChild(config.front.customContent);
    } else {
      frontBody.innerHTML = `
        <div class="card-prompt-label">${config.front.promptLabel || 'CHALLENGE // PROMPT'}</div>
        <div class="card-main-text">${config.front.mainText || ''}</div>
        ${config.front.subText ? `<div class="card-sub-text">${config.front.subText}</div>` : ''}
        ${config.front.phoneticText ? `<div class="card-ipa-text card-phonetic-text">${config.front.phoneticText}</div>` : ''}
      `;
    }

    // Bottom Action Dock
    const frontDock = document.createElement('div');
    frontDock.className = 'card-bottom-dock card-action-dock';
    frontDock.innerHTML = `
      <button type="button" class="dock-btn dock-btn-again btn-rate-again" aria-label="Rate repetition Again: failed recall, reset interval"><span style="color: var(--critical); font-weight: 800;">✗</span> Again <span class="kbd-badge">1</span></button>
      <button type="button" class="dock-btn dock-btn-flip btn-flip-trigger" aria-expanded="false" aria-label="Flip card to view answer targets"><span style="color: var(--accent-gold); font-weight: 800;">⟳</span> Flip Reveal <span class="kbd-badge">SPACE</span></button>
      <button type="button" class="dock-btn dock-btn-good btn-rate-good" aria-label="Rate repetition Good: successful recall, advance interval"><span style="color: var(--good); font-weight: 800;">✓</span> Good <span class="kbd-badge">2</span></button>
    `;

    frontDock.querySelector('.btn-rate-again')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doRate('again');
    });

    frontDock.querySelector('.btn-flip-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doFlip();
    });

    frontDock.querySelector('.btn-rate-good')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doRate('good');
    });

    // Body click flips card (unless user clicked on interactive elements)
    frontBody.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('textarea') || target.closest('input')) return;
      doFlip();
    });

    faceFront.appendChild(frontHeader);
    faceFront.appendChild(frontBody);
    faceFront.appendChild(frontDock);

    // ==========================================
    // 2. BACK FACE
    // ==========================================
    const faceBack = document.createElement('div');
    faceBack.className = 'card-face card-face-back face-back';
    faceBack.setAttribute('aria-hidden', 'true');

    const backHeader = document.createElement('div');
    backHeader.className = 'card-header-bar card-header-hud';
    backHeader.innerHTML = `
      <div class="card-meta-left header-left">
        <span class="telemetry-badge">[${config.pillar} // RESOLUTION]</span>
      </div>
      <div class="card-meta-right header-right">
        <span class="card-index-counter">${config.indexStr}</span>
        ${config.audioText ? `<button type="button" class="card-audio-btn btn-audio-speak" aria-label="Listen to pronunciation of prompt" title="Listen (P)">🔊 AUDIO</button>` : ''}
      </div>
    `;

    if (config.audioText) {
      const audioBtn = backHeader.querySelector('.card-audio-btn') as HTMLButtonElement;
      audioBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        speakText(config.audioText!);
      });
    }

    const backBody = document.createElement('div');
    backBody.className = 'card-body card-content-slot';
    if (config.back.customContent) {
      backBody.appendChild(config.back.customContent);
    } else {
      backBody.innerHTML = `
        <div class="card-prompt-label">${config.back.promptLabel || 'RESOLUTION // TRANSLATION'}</div>
        <div class="card-main-text">${config.back.mainText || ''}</div>
        ${config.back.ipa ? `<div class="card-ipa-text">${config.back.ipa}</div>` : ''}
        ${config.back.explanation ? `<div class="card-explanation">${config.back.explanation}</div>` : ''}
        ${config.back.subText ? `<div class="card-sub-text">${config.back.subText}</div>` : ''}
      `;
    }

    const backDock = document.createElement('div');
    backDock.className = 'card-bottom-dock card-rating-dock';
    backDock.innerHTML = `
      <button type="button" class="dock-btn dock-btn-again btn-rate-again" aria-label="Rate repetition Again: failed recall, reset interval"><span style="color: var(--critical); font-weight: 800;">✗</span> Again <span class="kbd-badge">1</span></button>
      <button type="button" class="dock-btn dock-btn-flip btn-flip-back" aria-label="Flip card back to prompt face"><span style="color: var(--accent-gold); font-weight: 800;">⟳</span> Flip Return <span class="kbd-badge">SPACE</span></button>
      <button type="button" class="dock-btn dock-btn-good btn-rate-good" aria-label="Rate repetition Good: successful recall, advance interval"><span style="color: var(--good); font-weight: 800;">✓</span> Good <span class="kbd-badge">2</span></button>
    `;

    backDock.querySelector('.btn-rate-again')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doRate('again');
    });

    backDock.querySelector('.btn-flip-back')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doFlip();
    });

    backDock.querySelector('.btn-rate-good')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doRate('good');
    });

    backBody.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('textarea') || target.closest('input')) return;
      doFlip();
    });

    faceBack.appendChild(backHeader);
    faceBack.appendChild(backBody);
    faceBack.appendChild(backDock);

    flipper.appendChild(faceFront);
    flipper.appendChild(faceBack);
    container.appendChild(flipper);
    wrapper.appendChild(container);

    // ==========================================
    // 3. GYRO 3D PARALLAX TILT
    // ==========================================
    let tiltRaf: number | null = null;
    const maxTilt = 7;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Do not apply parallax gyro tilt on touch screens
      if (tiltRaf) cancelAnimationFrame(tiltRaf);

      tiltRaf = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;

        const normX = (cardX / rect.width) * 2 - 1;
        const normY = (cardY / rect.height) * 2 - 1;

        const rotX = -normY * maxTilt;
        const rotY = normX * maxTilt;

        container.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      });
    };

    const onPointerLeave = () => {
      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      container.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    return {
      element: wrapper,
      flip: doFlip,
      rate: doRate,
      isFlipped: () => isFlipped,
      focus: () => {
        const activeBtn = isFlipped
          ? (faceBack.querySelector('.btn-rate-good') as HTMLElement)
          : (faceFront.querySelector('.btn-flip-trigger') as HTMLElement);
        activeBtn?.focus();
      },
      destroy: () => {
        if (tiltRaf) cancelAnimationFrame(tiltRaf);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerleave', onPointerLeave);
        wrapper.remove();
      }
    };
  }
}
