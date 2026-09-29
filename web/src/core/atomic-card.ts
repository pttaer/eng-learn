import { AudioSynthesizer } from './audio-synthesizer';

export interface CardConfig {
  id: string;
  pillar: string;
  category: string;
  indexStr: string;
  statusBadge: 'NEW' | 'REVIEW' | 'MASTERED';
  front: {
    promptLabel?: string;
    mainText: string;
    subText?: string;
    customContent?: HTMLElement;
  };
  back: {
    promptLabel?: string;
    mainText: string;
    subText?: string;
    ipa?: string;
    customContent?: HTMLElement;
  };
  audioText?: string;
  onRate?: (rating: 'again' | 'good') => void;
  onFlip?: (isFlipped: boolean) => void;
}

export class AtomicCard {
  public static create(config: CardConfig): {
    element: HTMLElement;
    flip: () => void;
    rate: (rating: 'again' | 'good') => void;
    isFlipped: () => boolean;
  } {
    const wrapper = document.createElement('div');
    wrapper.className = 'atomic-card-perspective-wrapper interactive';

    const container = document.createElement('div');
    container.className = 'atomic-card-container';

    const inner = document.createElement('div');
    inner.className = 'atomic-card-inner';

    let isFlipped = false;

    // --- Helper: Pronunciation via Web Speech API with dialect fallback ---
    const speakText = (text: string) => {
      AudioSynthesizer.speak(text, 0.95);
    };

    // --- Flip Action ---
    const doFlip = () => {
      isFlipped = !isFlipped;
      if (isFlipped) {
        inner.classList.add('is-flipped');
      } else {
        inner.classList.remove('is-flipped');
      }
      AudioSynthesizer.play('flip');
      if (config.onFlip) {
        config.onFlip(isFlipped);
      }
    };

    // --- Rate Action ---
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
    faceFront.className = 'card-face card-face-front';

    // Header Zone
    const frontHeader = document.createElement('div');
    frontHeader.className = 'card-header-bar';
    frontHeader.innerHTML = `
      <div class="card-meta-left">
        <span>[${config.pillar} // ${config.category}]</span>
        <span class="card-badge-status">${config.statusBadge}</span>
      </div>
      <div class="card-meta-right">
        <span>${config.indexStr}</span>
        ${config.audioText ? `<button class="card-audio-btn" title="Pronounce">🔊 AUDIO</button>` : ''}
      </div>
    `;

    if (config.audioText) {
      const audioBtn = frontHeader.querySelector('.card-audio-btn') as HTMLButtonElement;
      audioBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        speakText(config.audioText!);
      });
    }

    // Body Zone
    const frontBody = document.createElement('div');
    frontBody.className = 'card-body';
    if (config.front.customContent) {
      frontBody.appendChild(config.front.customContent);
    } else {
      frontBody.innerHTML = `
        <div class="card-prompt-label">${config.front.promptLabel || 'CHALLENGE // PROMPT'}</div>
        <div class="card-main-text">${config.front.mainText}</div>
        ${config.front.subText ? `<div class="card-sub-text">${config.front.subText}</div>` : ''}
      `;
    }

    // Dock Zone
    const frontDock = document.createElement('div');
    frontDock.className = 'card-bottom-dock';
    frontDock.innerHTML = `
      <button class="dock-btn dock-btn-again">[ ✗ ] AGAIN <span class="kbd-badge">1</span></button>
      <button class="dock-btn dock-btn-flip">[ ⟳ FLIP REVEAL ] <span class="kbd-badge">SPACE</span></button>
      <button class="dock-btn dock-btn-good">[ ✓ ] GOOD <span class="kbd-badge">2</span></button>
    `;

    frontDock.querySelector('.dock-btn-again')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doRate('again');
    });

    // Card Body Click flips card (unless clicking on interactive controls)
    frontBody.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('textarea') || target.closest('input')) return;
      doFlip();
    });

    frontDock.querySelector('.dock-btn-flip')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doFlip();
    });

    frontDock.querySelector('.dock-btn-good')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doRate('good');
    });

    faceFront.appendChild(frontHeader);
    faceFront.appendChild(frontBody);
    faceFront.appendChild(frontDock);

    // ==========================================
    // 2. BACK FACE
    // ==========================================
    const faceBack = document.createElement('div');
    faceBack.className = 'card-face card-face-back';

    const backHeader = document.createElement('div');
    backHeader.className = 'card-header-bar';
    backHeader.innerHTML = `
      <div class="card-meta-left">
        <span>[${config.pillar} // RESOLUTION]</span>
      </div>
      <div class="card-meta-right">
        <span>${config.indexStr}</span>
        ${config.audioText ? `<button class="card-audio-btn" title="Pronounce">🔊 AUDIO</button>` : ''}
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
    backBody.className = 'card-body';
    if (config.back.customContent) {
      backBody.appendChild(config.back.customContent);
    } else {
      backBody.innerHTML = `
        <div class="card-prompt-label">${config.back.promptLabel || 'RESOLUTION // TRANSLATION'}</div>
        <div class="card-main-text">${config.back.mainText}</div>
        ${config.back.ipa ? `<div class="card-ipa-text">${config.back.ipa}</div>` : ''}
        ${config.back.subText ? `<div class="card-sub-text">${config.back.subText}</div>` : ''}
      `;
    }

    const backDock = document.createElement('div');
    backDock.className = 'card-bottom-dock';
    backDock.innerHTML = `
      <button class="dock-btn dock-btn-again">[ ✗ ] AGAIN <span class="kbd-badge">1</span></button>
      <button class="dock-btn dock-btn-flip">[ ⟳ FLIP RETURN ] <span class="kbd-badge">SPACE</span></button>
      <button class="dock-btn dock-btn-good">[ ✓ ] GOOD <span class="kbd-badge">2</span></button>
    `;

    backDock.querySelector('.dock-btn-again')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doRate('again');
    });

    backDock.querySelector('.dock-btn-flip')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doFlip();
    });

    backDock.querySelector('.dock-btn-good')?.addEventListener('click', (e) => {
      e.stopPropagation();
      doRate('good');
    });

    // Back Body Click flips card back (unless clicking on interactive controls)
    backBody.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('textarea') || target.closest('input')) return;
      doFlip();
    });

    faceBack.appendChild(backHeader);
    faceBack.appendChild(backBody);
    faceBack.appendChild(backDock);

    inner.appendChild(faceFront);
    inner.appendChild(faceBack);
    container.appendChild(inner);
    wrapper.appendChild(container);

    // ==========================================
    // 3. GYRO 3D PARALLAX TILT
    // ==========================================
    let tiltRaf: number | null = null;
    const maxTilt = 7; // degrees

    const onPointerMove = (e: PointerEvent) => {
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
      isFlipped: () => isFlipped
    };
  }
}
