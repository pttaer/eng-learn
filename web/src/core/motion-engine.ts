import { animate, createTimeline, spring, stagger, svg, utils } from 'animejs';
import type { JSAnimation, Timeline } from 'animejs';

export class MotionEngine {
  private static activeAnimations: JSAnimation[] = [];

  public static isReducedMotion(): boolean {
    if (typeof document === 'undefined') return false;
    if (document.documentElement.dataset.motion === 'reduce') return true;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }

  /**
   * Procedurally draws SVG line filaments using svg.createDrawable
   */
  public static drawSvgLines(targets: string | NodeList | SVGElement[]): JSAnimation | null {
    if (this.isReducedMotion()) return null;

    try {
      let elements: any = targets;
      if (typeof targets !== 'string') {
        elements = Array.from(targets as any).filter((el: any) => el && el.isConnected);
        if (elements.length === 0) return null;
      }

      const anim = animate(svg.createDrawable(elements), {
        draw: ['0 0', '0 1'],
        ease: 'inOutSine',
        duration: 1200,
        delay: stagger(45)
      });

      this.trackAnimation(anim);
      return anim;
    } catch (e) {
      return null;
    }
  }

  /**
   * Cascading elastic node entrances, in the order given
   */
  public static staggerEntrance(
    targets: string | NodeList | HTMLElement[] | SVGElement[],
    options: { delayStep?: number } = {}
  ): JSAnimation | null {
    if (this.isReducedMotion()) return null;

    const delayStep = options.delayStep || 35;

    const anim = animate(targets, {
      scale: [0.3, 1],
      opacity: [0, 1],
      ease: 'outElastic(1, .75)',
      duration: 850,
      delay: stagger(delayStep),
      onComplete: () => {
        const els = typeof targets === 'string' ? document.querySelectorAll<HTMLElement>(targets) : targets;
        Array.from(els as ArrayLike<HTMLElement>).forEach(el => el.style.removeProperty('opacity'));
      }
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Interpolates numerical counters (e.g. Accuracy 0% -> 94%)
   */
  public static tweenNumber(
    targetEl: HTMLElement,
    startVal: number,
    endVal: number,
    suffix: string = '',
    duration: number = 800
  ): JSAnimation | null {
    if (this.isReducedMotion()) {
      targetEl.textContent = `${Math.round(endVal)}${suffix}`;
      return null;
    }

    const obj = { val: startVal };
    const anim = animate(obj, {
      val: endVal,
      modifier: (v: number) => Math.round(v),
      ease: 'outExpo',
      duration,
      onUpdate: () => {
        targetEl.textContent = `${obj.val}${suffix}`;
      }
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Fluid spring modal reveal (Backdrop fade + card scale-up)
   */
  public static springModal(modalEl: HTMLElement, cardEl: HTMLElement): Timeline {
    if (this.isReducedMotion()) {
      modalEl.style.opacity = '1';
      cardEl.style.transform = 'none';
      return createTimeline();
    }

    const tl = createTimeline({
      defaults: { ease: 'outCubic' }
    });

    tl.add(modalEl, {
      opacity: [0, 1],
      duration: 180
    }).add(
      cardEl,
      {
        y: [24, 0],
        scale: [0.94, 1],
        opacity: [0, 1],
        duration: 360,
        ease: 'outBack'
      },
      '-=100'
    );

    return tl;
  }

  /**
   * Spatial page/card entrance transition
   */
  public static fadeSlideIn(targetEl: HTMLElement, direction: 'up' | 'down' = 'up'): JSAnimation | null {
    if (this.isReducedMotion()) {
      targetEl.style.opacity = '1';
      targetEl.style.transform = 'none';
      return null;
    }

    const yOffset = direction === 'up' ? [20, 0] : [-20, 0];
    const anim = animate(targetEl, {
      y: yOffset,
      opacity: [0, 1],
      ease: 'outQuart',
      duration: 460
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Soft staggered rise for cards and list items
   */
  public static riseIn(targets: string | NodeList | HTMLElement[], delayStep = 45): JSAnimation | null {
    if (this.isReducedMotion()) return null;
    const anim = animate(targets, {
      y: [14, 0],
      opacity: [0, 1],
      ease: 'outQuart',
      duration: 560,
      delay: stagger(delayStep, { start: 80 })
    });
    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Progress bars grow from zero to their data-pct width
   */
  public static fillBars(targets: string | NodeList | HTMLElement[]): JSAnimation | null {
    if (this.isReducedMotion()) return null;
    utils.set(targets, { width: '0%' });
    const anim = animate(targets, {
      width: (el: unknown) => `${(el as HTMLElement).dataset.pct ?? 0}%`,
      ease: 'outCubic',
      duration: 1000,
      delay: stagger(70, { start: 300 })
    });
    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Slow endless breathing glow; paused by cancelAll() on route change
   */
  public static breathe(targets: string | NodeList | SVGElement[] | HTMLElement[]): JSAnimation | null {
    if (this.isReducedMotion()) return null;
    const anim = animate(targets, {
      opacity: [0.25, 0.75],
      scale: [0.94, 1.1],
      alternate: true,
      loop: true,
      ease: 'inOutSine',
      duration: 2400,
      delay: stagger(220)
    });
    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Hover lift with a gentle spring settle
   */
  public static lift(el: HTMLElement | SVGElement, on: boolean, amount = 3): void {
    if (this.isReducedMotion()) return;
    utils.remove(el);
    animate(el, { y: on ? -amount : 0, ease: spring({ stiffness: 90, damping: 14 }) });
  }

  /**
   * Quick confirmation pop (checkbox ticked, answer graded)
   */
  public static pop(el: HTMLElement | SVGElement): void {
    if (this.isReducedMotion()) return;
    utils.remove(el);
    animate(el, { scale: [1, 1.12, 1], ease: 'outQuad', duration: 420 });
  }

  /**
   * Hover scale for one target. Cancels the running tween on the same element first,
   * so fast pointer sweeps do not stack tweens.
   */
  public static hoverScale(el: HTMLElement | SVGElement, on: boolean): void {
    if (this.isReducedMotion()) return;
    utils.remove(el);
    const anim = animate(el, {
      scale: on ? 1.3 : 1.0,
      duration: on ? 600 : 320,
      ease: on ? 'outElastic(1, .6)' : 'outQuart'
    });
    this.trackAnimation(anim);
  }

  /**
   * Press bounce on click. Cancels the running tween on the same element first.
   */
  public static press(el: HTMLElement | SVGElement): void {
    if (this.isReducedMotion()) return;
    utils.remove(el);
    const anim = animate(el, {
      scale: [0.92, 1.08, 1.0],
      duration: 350,
      ease: 'outElastic(1, .5)'
    });
    this.trackAnimation(anim);
  }

  private static trackAnimation(anim: JSAnimation): void {
    this.activeAnimations.push(anim);
    anim.then(() => {
      this.activeAnimations = this.activeAnimations.filter(a => a !== anim);
    });
  }

  public static cancelAll(): void {
    for (const anim of this.activeAnimations) {
      anim.pause();
    }
    this.activeAnimations = [];
  }

  public static getActiveAnimationCount(): number {
    return this.activeAnimations.length;
  }
}
