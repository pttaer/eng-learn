import { icon } from '../utils/icons';
import { AudioSynthesizer } from './audio-synthesizer';
import { HapticEngine } from './haptic-engine';
import { AcousticHaptics } from './acoustic-haptics';
import { t } from './i18n';

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
  hideFrontRating?: boolean;
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
    container.className = 'atomic-card-container atomic-card dossier-card';
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
      faceFront.inert = isFlipped;
      faceBack.inert = !isFlipped;

      const flipBtn = faceFront.querySelector('.btn-flip-trigger') as HTMLButtonElement | null;
      if (flipBtn) {
        flipBtn.setAttribute('aria-expanded', String(isFlipped));
      }

      AcousticHaptics.flip();
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

    // Rate Action (Forgiving & Gentle)
    const doRate = (rating: 'again' | 'good') => {
      if (rating === 'again') {
        AcousticHaptics.nudge();
        container.classList.remove('apple-shake');
        void container.offsetWidth;
        container.classList.add('apple-shake');
        setTimeout(() => container.classList.remove('apple-shake'), 360);
      } else {
        AcousticHaptics.tap();
        AudioSynthesizer.play('click');
      }
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

    const statusLabel = config.statusBadge === 'NEW' 
      ? t('card.status_new', undefined, 'NEW')
      : (config.statusBadge === 'REVIEW' ? t('card.status_review', undefined, 'REVIEW') : t('card.status_mastered', undefined, 'MASTERED'));

    // Header Zone
    const frontHeader = document.createElement('div');
    frontHeader.className = 'card-header-bar card-header-hud';
    frontHeader.innerHTML = `
      <div class="card-meta-left header-left">
        <span class="telemetry-badge">[${t('card.pillar.' + config.pillar.toLowerCase(), undefined, config.pillar)} // ${t('card.cat.' + config.category.toLowerCase().replace(/[^a-z0-9]+/g, '_'), undefined, config.category)}]</span>
        <span class="card-badge-status card-status-badge">${statusLabel}</span>
      </div>
      <div class="card-meta-right header-right">
        <span class="card-index-counter">${config.indexStr}</span>
        ${config.audioText ? `<button type="button" class="card-audio-btn btn-audio-speak" aria-label="Listen to pronunciation of prompt" title="Listen (P)">${icon('volume')} ${t('card.audio', undefined, 'AUDIO')}</button>` : ''}
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
        <div class="card-prompt-label">${config.front.promptLabel || t('card.challenge_prompt', undefined, 'CHALLENGE // PROMPT')}</div>
        <div class="card-main-text">${config.front.mainText || ''}</div>
        ${config.front.subText ? `<div class="card-sub-text">${config.front.subText}</div>` : ''}
        ${config.front.phoneticText ? `<div class="card-ipa-text card-phonetic-text">${config.front.phoneticText}</div>` : ''}
      `;
    }

    // Bottom Action Dock
    const frontDock = document.createElement('div');
    frontDock.className = 'card-bottom-dock card-action-dock';
    if (config.hideFrontRating) {
      frontDock.innerHTML = `
        <button type="button" class="dock-btn dock-btn-flip btn-flip-trigger" aria-expanded="false" aria-label="Flip card to view answer targets"><span style="color: var(--accent-gold); font-weight: 800;">⟳</span> ${t('card.flip_reveal', undefined, 'Flip Reveal')} <span class="kbd-badge">SPACE</span></button>
      `;
      frontDock.querySelector('.btn-flip-trigger')?.addEventListener('click', (e) => {
        e.stopPropagation();
        doFlip();
      });
    } else {
      frontDock.innerHTML = `
        <button type="button" class="dock-btn dock-btn-again btn-rate-again" aria-label="Rate repetition Again: failed recall, reset interval"><span style="color: var(--critical); font-weight: 800;">✗</span> ${t('card.again', undefined, 'Again')} <span class="kbd-badge">1</span></button>
        <button type="button" class="dock-btn dock-btn-flip btn-flip-trigger" aria-expanded="false" aria-label="Flip card to view answer targets"><span style="color: var(--accent-gold); font-weight: 800;">⟳</span> ${t('card.flip_reveal', undefined, 'Flip Reveal')} <span class="kbd-badge">SPACE</span></button>
        <button type="button" class="dock-btn dock-btn-good btn-rate-good" aria-label="Rate repetition Good: successful recall, advance interval"><span style="color: var(--good); font-weight: 800;">✓</span> ${t('card.good', undefined, 'Good')} <span class="kbd-badge">2</span></button>
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
    }

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
    faceBack.inert = true; // hidden face must not take focus until flipped
    faceBack.className = 'card-face card-face-back face-back';
    faceBack.setAttribute('aria-hidden', 'true');

    const backHeader = document.createElement('div');
    backHeader.className = 'card-header-bar card-header-hud';
    backHeader.innerHTML = `
      <div class="card-meta-left header-left">
        <span class="telemetry-badge">[${t('card.pillar.' + config.pillar.toLowerCase(), undefined, config.pillar)} // ${t('card.resolution', undefined, 'RESOLUTION')}]</span>
      </div>
      <div class="card-meta-right header-right">
        <span class="card-index-counter">${config.indexStr}</span>
        ${config.audioText ? `<button type="button" class="card-audio-btn btn-audio-speak" aria-label="Listen to pronunciation of prompt" title="Listen (P)">${icon('volume')} ${t('card.audio', undefined, 'AUDIO')}</button>` : ''}
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
        <div class="card-prompt-label">${config.back.promptLabel || t('card.resolution_translation', undefined, 'RESOLUTION // TRANSLATION')}</div>
        <div class="card-main-text">${config.back.mainText || ''}</div>
        ${config.back.ipa ? `<div class="card-ipa-text">${config.back.ipa}</div>` : ''}
        ${config.back.explanation ? `<div class="card-explanation">${config.back.explanation}</div>` : ''}
        ${config.back.subText ? `<div class="card-sub-text">${config.back.subText}</div>` : ''}
      `;
    }

    const backDock = document.createElement('div');
    backDock.className = 'card-bottom-dock card-rating-dock';
    backDock.innerHTML = `
      <button type="button" class="dock-btn dock-btn-again btn-rate-again" aria-label="Rate repetition Again: failed recall, reset interval"><span style="color: var(--critical); font-weight: 800;">✗</span> ${t('card.again', undefined, 'Again')} <span class="kbd-badge">1</span></button>
      <button type="button" class="dock-btn dock-btn-flip btn-flip-back" aria-label="Flip card back to prompt face"><span style="color: var(--accent-gold); font-weight: 800;">⟳</span> ${t('card.flip_return', undefined, 'Flip Return')} <span class="kbd-badge">SPACE</span></button>
      <button type="button" class="dock-btn dock-btn-good btn-rate-good" aria-label="Rate repetition Good: successful recall, advance interval"><span style="color: var(--good); font-weight: 800;">✓</span> ${t('card.good', undefined, 'Good')} <span class="kbd-badge">2</span></button>
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
    // 3. MOBILE GESTURE SWIPE DECK & GYRO TILT
    // ==========================================
    const hintLeft = document.createElement('div');
    hintLeft.className = 'card-swipe-hint hint-left';
    hintLeft.innerHTML = '<span>◄ AGAIN</span>';

    const hintRight = document.createElement('div');
    hintRight.className = 'card-swipe-hint hint-right';
    hintRight.innerHTML = '<span>GOOD ►</span>';

    container.appendChild(hintLeft);
    container.appendChild(hintRight);

    let tiltRaf: number | null = null;
    const maxTilt = 7;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || isSwiping) return; // Do not apply parallax gyro tilt on touch screens or during drag
      if (document.documentElement.getAttribute('data-motion') === 'reduce') return;
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
      if (isSwiping) return;
      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      container.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };

    // --- Gesture Drag Physics State ---
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isPointerDown = false;
    let isSwiping = false;
    let startTime = 0;
    let dragEndedAt = 0;
    let crossedThreshold = false;
    let activePointerId: number | null = null;

    const onSwipePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select')) return;

      isPointerDown = true;
      isSwiping = false;
      crossedThreshold = false;
      startX = e.clientX;
      startY = e.clientY;
      currentX = e.clientX;
      currentY = e.clientY;
      startTime = Date.now();
      activePointerId = e.pointerId;
    };

    const onSwipePointerMove = (e: PointerEvent) => {
      if (!isPointerDown || e.pointerId !== activePointerId) return;
      currentX = e.clientX;
      currentY = e.clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;

      if (!isSwiping) {
        // Horizontal drags only; vertical movement is page scroll
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
          isSwiping = true;
          try {
            container.setPointerCapture(e.pointerId);
          } catch {}
        }
      }

      if (isSwiping) {
        e.preventDefault();
        container.style.transition = 'none';
        const rot = (dx / 320) * 14;
        container.style.transform = `translate3d(${dx}px, ${dy * 0.35}px, 0) rotate(${rot}deg)`;

        // Update hints
        if (dx < -30) {
          hintLeft.style.opacity = String(Math.min(1, (-dx - 30) / 70));
          hintRight.style.opacity = '0';
        } else if (dx > 30) {
          hintRight.style.opacity = String(Math.min(1, (dx - 30) / 70));
          hintLeft.style.opacity = '0';
        } else {
          hintLeft.style.opacity = '0';
          hintRight.style.opacity = '0';
        }

        // Haptic feedback at decision boundary
        if (Math.abs(dx) >= 100) {
          if (!crossedThreshold) {
            crossedThreshold = true;
            HapticEngine.trigger('selection');
          }
        } else {
          crossedThreshold = false;
        }
      }
    };

    const resetCardPosition = () => {
      container.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      container.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      hintLeft.style.opacity = '0';
      hintRight.style.opacity = '0';
    };

    // Used after a committed swipe when the parent did not replace this card
    const resetCardAfterRate = () => {
      container.style.transition = 'none';
      container.style.transform = '';
      container.style.opacity = '';
    };

    const onSwipePointerUp = (e: PointerEvent) => {
      if (!isPointerDown || e.pointerId !== activePointerId) return;
      isPointerDown = false;
      activePointerId = null;

      try {
        if (container.hasPointerCapture(e.pointerId)) {
          container.releasePointerCapture(e.pointerId);
        }
      } catch {}

      if (!isSwiping) return;
      isSwiping = false;
      dragEndedAt = Date.now();

      const dx = currentX - startX;
      const dy = currentY - startY;
      const elapsed = Date.now() - startTime;
      const velocity = Math.abs(dx) / Math.max(1, elapsed);

      if (dx > 100 || (dx > 60 && velocity > 0.45)) {
        // Swipe Right -> Good
        HapticEngine.trigger('light');
        container.style.transition = 'transform 0.28s ease-out, opacity 0.28s ease-out';
        container.style.transform = `translate3d(${window.innerWidth}px, ${dy}px, 0) rotate(22deg)`;
        container.style.opacity = '0';
        setTimeout(() => {
          doRate('good');
          if (wrapper.isConnected) resetCardAfterRate();
        }, 200);
      } else if (dx < -100 || (dx < -60 && velocity > 0.45)) {
        // Swipe Left -> Again
        HapticEngine.trigger('warning');
        container.style.transition = 'transform 0.28s ease-out, opacity 0.28s ease-out';
        container.style.transform = `translate3d(-${window.innerWidth}px, ${dy}px, 0) rotate(-22deg)`;
        container.style.opacity = '0';
        setTimeout(() => {
          doRate('again');
          if (wrapper.isConnected) resetCardAfterRate();
        }, 200);
      } else {
        // Spring back to center
        resetCardPosition();
      }
    };

    // A cancelled pointer (browser took the gesture) never commits a rating
    const onSwipePointerCancel = (e: PointerEvent) => {
      if (!isPointerDown || e.pointerId !== activePointerId) return;
      isPointerDown = false;
      activePointerId = null;
      if (isSwiping) {
        isSwiping = false;
        dragEndedAt = Date.now();
        resetCardPosition();
      }
    };

    // A drag that ends on the card must not also register as a tap (which flips it)
    const suppressClickAfterDrag = (e: MouseEvent) => {
      if (Date.now() - dragEndedAt < 400) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointerdown', onSwipePointerDown);
    container.addEventListener('pointermove', onSwipePointerMove);
    container.addEventListener('pointerup', onSwipePointerUp);
    container.addEventListener('pointercancel', onSwipePointerCancel);
    container.addEventListener('click', suppressClickAfterDrag, true);

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
        container.removeEventListener('pointerdown', onSwipePointerDown);
        container.removeEventListener('pointermove', onSwipePointerMove);
        container.removeEventListener('pointerup', onSwipePointerUp);
        container.removeEventListener('pointercancel', onSwipePointerCancel);
        container.removeEventListener('click', suppressClickAfterDrag, true);
        wrapper.remove();
      }
    };
  }
}
