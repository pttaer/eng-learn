import './scroll-affordance.css';
import { icon } from '../utils/icons';

/**
 * Universal Scroll Affordance Engine
 * Detects horizontally scrollable tracks and provides floating HUD chevron scroll arrows
 * indicating scrollability and providing one-tap smooth scrolling.
 */
export class ScrollAffordance {
  public static attach(scrollEl: HTMLElement, options: { scrollAmount?: number } = {}): () => void {
    if (!scrollEl) {
      return () => {};
    }

    if (scrollEl.dataset.hasScrollArrows === 'true') {
      const existingUpdate = (scrollEl as any).__scrollAffordanceUpdate;
      if (typeof existingUpdate === 'function') {
        existingUpdate();
      }
      return () => {};
    }
    scrollEl.dataset.hasScrollArrows = 'true';

    // Wrap in .hud-scroll-track if not already wrapped
    let track = scrollEl.parentElement;
    if (!track || !track.classList.contains('hud-scroll-track')) {
      track = document.createElement('div');
      track.className = 'hud-scroll-track';
      scrollEl.parentNode?.insertBefore(track, scrollEl);
      track.appendChild(scrollEl);
    }

    // Left Arrow Button
    const leftBtn = document.createElement('button');
    leftBtn.type = 'button';
    leftBtn.className = 'hud-scroll-arrow hud-scroll-arrow-left';
    leftBtn.setAttribute('aria-label', 'Scroll left');
    leftBtn.setAttribute('tabindex', '-1');
    leftBtn.innerHTML = icon('chevronLeft', 16);

    // Right Arrow Button
    const rightBtn = document.createElement('button');
    rightBtn.type = 'button';
    rightBtn.className = 'hud-scroll-arrow hud-scroll-arrow-right';
    rightBtn.setAttribute('aria-label', 'Scroll right');
    rightBtn.setAttribute('tabindex', '-1');
    rightBtn.innerHTML = icon('chevronRight', 16);

    track.insertBefore(leftBtn, scrollEl);
    track.appendChild(rightBtn);

    const getAmount = () => options.scrollAmount || Math.max(120, Math.round(scrollEl.clientWidth * 0.7));

    // Ensure flex children behave properly inside .hud-scroll-track
    scrollEl.style.minWidth = '0';
    if (!scrollEl.style.flex) {
      scrollEl.style.flex = '1 1 auto';
    }

    const update = () => {
      if (!scrollEl.isConnected) {
        requestAnimationFrame(() => {
          if (scrollEl.isConnected) update();
        });
        return;
      }
      const maxScroll = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
      const canScrollLeft = scrollEl.scrollLeft > 4;
      const canScrollRight = maxScroll > 6 && scrollEl.scrollLeft < (maxScroll - 4);

      leftBtn.classList.toggle('is-visible', canScrollLeft);
      rightBtn.classList.toggle('is-visible', canScrollRight);
      track?.classList.toggle('can-scroll-left', canScrollLeft);
      track?.classList.toggle('can-scroll-right', canScrollRight);
    };

    (scrollEl as any).__scrollAffordanceUpdate = update;

    leftBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollEl.scrollBy({ left: -getAmount(), behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollEl.scrollBy({ left: getAmount(), behavior: 'smooth' });
    });

    scrollEl.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => update());
      resizeObserver.observe(scrollEl);
      if (track) resizeObserver.observe(track);
    }

    // Initial updates across animation frames & intervals
    update();
    requestAnimationFrame(update);
    setTimeout(update, 50);
    setTimeout(update, 150);
    setTimeout(update, 350);
    setTimeout(update, 750);

    return () => {
      window.removeEventListener('resize', update);
      resizeObserver?.disconnect();
      leftBtn.remove();
      rightBtn.remove();
      delete (scrollEl as any).__scrollAffordanceUpdate;
      delete scrollEl.dataset.hasScrollArrows;
    };
  }

  public static readonly CANDIDATES = [
    '.view-mode-toggle',
    '.tenses-family-tabs',
    '.dossier-tabs',
    '.day-picker-track',
    '.reading-mobile-tab-bar',
    '.cd-mobile-tab-bar',
    '.constellation-view-switcher',
    '.speaking-mode-cluster',
    '.listening-mode-cluster',
    '.dossier-protocol-tabs',
    '.article-tabs',
    '.vocab-level-selector',
    '.grammar-level-selector',
    '.habit-level-chips',
    '.mediation-category-selector',
    '.cd-matrix-track',
    '.cd-filter-tabs',
    '.ie-tabs',
    '.ie-visual-tabs',
    '.ie-arch-tabs',
    '.ie-strategy-tabs',
    '.ie-traps-filter-tabs',
    '.ie-question-picker',
    '.ie-drill-picker',
    '.ie-nav-tabs'
  ];

  public static scan(root: HTMLElement = document.body): void {
    ScrollAffordance.CANDIDATES.forEach(sel => {
      root.querySelectorAll<HTMLElement>(sel).forEach(el => {
        ScrollAffordance.attach(el);
      });
    });
  }

  private static observerInitialized = false;

  public static initGlobalObserver(): void {
    if (ScrollAffordance.observerInitialized || typeof MutationObserver === 'undefined') {
      return;
    }
    ScrollAffordance.observerInitialized = true;

    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) {
        requestAnimationFrame(() => ScrollAffordance.scan(document.body));
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    ScrollAffordance.scan(document.body);
  }
}
