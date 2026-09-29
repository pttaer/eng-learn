# Anime.js Interactive Motion & UI/UX Sensory Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the entire English Mastery web platform from static layouts into an alive, tactile, and sensory experience using Anime.js v3.2.2 — featuring procedural constellation SVG line drawing, elastic staggered star node entrances, rolling telemetry counters (Accuracy %, Net WPM, Streaks), fluid modal springs, and seamless spatial view transitions that eliminate layout jarring while respecting `prefers-reduced-motion`.

**Architecture:** A unified client-side motion conductor (`web/src/core/motion-engine.ts`) wraps Anime.js into reusable, cancel-safe motion primitives (`animateConstellationFilaments`, `staggerNodesEntrance`, `tweenCounter`, `revealModalSpring`, `crossFadeStep`, `routeEnterTransition`). Views invoke these primitives during mounting, step transitions, and user interactions.

**Tech Stack:** Anime.js 3.2.2, TypeScript 5.5, Vite 5.4, SVG DOM API, CSS Transitions, Puppeteer-Core.

**Documentation Authority:** `https://animejs.com/documentation` & `CLEAN_DESIGN_SYSTEM.md` & `ui-ux-pro-max` (Category 7: Animation — context-aware timing, spatial continuity, cancelable transitions, zero layout thrashing).

## Global Constraints

- **Motion Restraint:** Animate with purpose (1-2 focal elements per state change); avoid decorative continuous loops or jitter.
- **Performance:** Composite-only transforms (`transform: translate3d/scale`, `opacity`, `stroke-dashoffset`). Never animate `width`, `height`, `top`, or `left`.
- **Accessibility:** Strict `prefers-reduced-motion` compliance. If enabled, animations resolve instantly (duration: 0ms).
- **Cancellability:** In-flight animations must be cancelled cleanly on route changes or rapid clicks to prevent memory leaks and zombie RAF loops.
- **Palette Consistency:** Respect Soft Paper Ink palette (`#fafaf9`, `#111111`, `#ca8a04`, `rgba(17, 17, 17, 0.12)`).
- **Production Integrity:** 0 TypeScript compiler errors (`tsc`), bundle builds cleanly under 1.5s.

---

### Task 1: Motion Engine Conductor (`motion-engine.ts`)

**Files:**
- Create: `web/src/core/motion-engine.ts`
- Test: `web/scripts/verify-motion-engine.cjs`

**Interfaces:**
- Consumes: `animejs` library.
- Produces: `MotionEngine` with methods:
  - `drawSvgLines(selectorOrEls: string | SVGElement[]): anime.AnimeInstance`
  - `staggerEntrance(selectorOrEls: string | HTMLElement[], options?: { from?: 'bottom' | 'center' | 'top' }): anime.AnimeInstance`
  - `tweenNumber(targetEl: HTMLElement, startVal: number, endVal: number, suffix?: string): anime.AnimeInstance`
  - `springModal(modalEl: HTMLElement, cardEl: HTMLElement): anime.AnimeTimelineInstance`
  - `fadeSlideIn(targetEl: HTMLElement, direction?: 'up' | 'left' | 'right'): anime.AnimeInstance`
  - `isReducedMotion(): boolean`

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-motion-engine.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[MOTION TEST 1] Verifying Motion Engine Conductor...');

const enginePath = path.join(__dirname, '../src/core/motion-engine.ts');
assert(fs.existsSync(enginePath), 'motion-engine.ts must exist');

const engineTs = fs.readFileSync(enginePath, 'utf-8');

// 1. Assert Anime.js imports and methods
assert(engineTs.includes("import anime from 'animejs'"), "motion-engine.ts must import anime from animejs");
assert(engineTs.includes('drawSvgLines'), "motion-engine.ts must export drawSvgLines method");
assert(engineTs.includes('staggerEntrance'), "motion-engine.ts must export staggerEntrance method");
assert(engineTs.includes('tweenNumber'), "motion-engine.ts must export tweenNumber method");
assert(engineTs.includes('springModal'), "motion-engine.ts must export springModal method");
assert(engineTs.includes('fadeSlideIn'), "motion-engine.ts must export fadeSlideIn method");

// 2. Assert reduced-motion guard
assert(engineTs.includes('prefers-reduced-motion') || engineTs.includes('isReducedMotion'), "motion-engine.ts must respect reduced motion");

console.log('✅ [MOTION TEST 1 PASSED] Motion Engine Conductor verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-motion-engine.cjs`  
Expected: FAIL because `motion-engine.ts` does not yet exist.

- [ ] **Step 3: Implement minimal code to make test pass**

Create `web/src/core/motion-engine.ts`:
```typescript
import anime from 'animejs';

export class MotionEngine {
  private static activeAnimations: anime.AnimeInstance[] = [];

  public static isReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Procedurally draws SVG line filaments using strokeDashoffset
   */
  public static drawSvgLines(targets: string | NodeList | SVGElement[]): anime.AnimeInstance | null {
    if (this.isReducedMotion()) return null;

    const anim = anime({
      targets,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 1200,
      delay: (el: any, i: number) => i * 45
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Cascading elastic node entrances
   */
  public static staggerEntrance(
    targets: string | NodeList | HTMLElement[] | SVGElement[],
    options: { from?: 'bottom' | 'center' | 'first' | 'last'; delayStep?: number } = {}
  ): anime.AnimeInstance | null {
    if (this.isReducedMotion()) return null;

    const fromVal = options.from || 'bottom';
    const delayStep = options.delayStep || 35;

    const anim = anime({
      targets,
      scale: [0.3, 1],
      opacity: [0, 1],
      easing: 'easeOutElastic(1, 0.75)',
      duration: 850,
      delay: anime.stagger(delayStep, { from: fromVal as any })
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
  ): anime.AnimeInstance | null {
    if (this.isReducedMotion()) {
      targetEl.textContent = `${Math.round(endVal)}${suffix}`;
      return null;
    }

    const obj = { val: startVal };
    const anim = anime({
      targets: obj,
      val: endVal,
      round: 1,
      easing: 'easeOutExpo',
      duration,
      update: () => {
        targetEl.textContent = `${obj.val}${suffix}`;
      }
    });

    this.trackAnimation(anim);
    return anim;
  }

  /**
   * Fluid spring modal reveal (Backdrop fade + card scale-up)
   */
  public static springModal(modalEl: HTMLElement, cardEl: HTMLElement): anime.AnimeTimelineInstance {
    if (this.isReducedMotion()) {
      modalEl.style.opacity = '1';
      cardEl.style.transform = 'none';
      return anime.timeline();
    }

    const tl = anime.timeline({
      easing: 'easeOutCubic'
    });

    tl.add({
      targets: modalEl,
      opacity: [0, 1],
      duration: 180
    }).add(
      {
        targets: cardEl,
        translateY: [24, 0],
        scale: [0.94, 1],
        opacity: [0, 1],
        duration: 360,
        easing: 'easeOutBack'
      },
      '-=100'
    );

    return tl;
  }

  /**
   * Spatial page/card entrance transition
   */
  public static fadeSlideIn(targetEl: HTMLElement, direction: 'up' | 'down' = 'up'): anime.AnimeInstance | null {
    if (this.isReducedMotion()) {
      targetEl.style.opacity = '1';
      targetEl.style.transform = 'none';
      return null;
    }

    const yOffset = direction === 'up' ? [16, 0] : [-16, 0];
    const anim = anime({
      targets: targetEl,
      translateY: yOffset,
      opacity: [0, 1],
      easing: 'easeOutQuad',
      duration: 300
    });

    this.trackAnimation(anim);
    return anim;
  }

  private static trackAnimation(anim: anime.AnimeInstance): void {
    this.activeAnimations.push(anim);
    anim.complete = () => {
      this.activeAnimations = this.activeAnimations.filter(a => a !== anim);
    };
  }

  public static cancelAll(): void {
    for (const anim of this.activeAnimations) {
      anim.pause();
    }
    this.activeAnimations = [];
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-motion-engine.cjs`  
Expected: `✅ [MOTION TEST 1 PASSED] Motion Engine Conductor verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/core/motion-engine.ts web/scripts/verify-motion-engine.cjs
git commit -m "feat(motion): implement Anime.js motion engine conductor"
```

---

### Task 2: Constellation Skill Tree Animated Illumination

**Files:**
- Modify: `web/src/modules/skill-tree-view.ts`
- Modify: `web/src/assets/styles/dossiers.css`
- Test: `web/scripts/verify-tree-animation.cjs`

**Interfaces:**
- Consumes: `MotionEngine` from `src/core/motion-engine.ts`.
- Produces: Dynamic procedural constellation drawing on mount, cascading star node bounce, tactile star hover glow, and rolling summit progress counter.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-tree-animation.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[MOTION TEST 2] Verifying Animated Constellation Tree...');

const treeTs = fs.readFileSync(path.join(__dirname, '../src/modules/skill-tree-view.ts'), 'utf-8');

// 1. Assert MotionEngine usage in SkillTreeView
assert(treeTs.includes('MotionEngine'), "skill-tree-view.ts must import and use MotionEngine");
assert(treeTs.includes('MotionEngine.drawSvgLines') || treeTs.includes('drawSvgLines'), "skill-tree-view.ts must animate SVG filaments");
assert(treeTs.includes('MotionEngine.staggerEntrance') || treeTs.includes('staggerEntrance'), "skill-tree-view.ts must animate star nodes entrance");

// 2. Assert Modal spring animation
assert(treeTs.includes('MotionEngine.springModal') || treeTs.includes('springModal'), "skill-tree-view.ts must use springModal when opening node dialog");

console.log('✅ [MOTION TEST 2 PASSED] Animated Constellation Tree verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-tree-animation.cjs`  
Expected: FAIL because `SkillTreeView` does not yet call `MotionEngine`.

- [ ] **Step 3: Implement minimal code to make test pass**

Update `web/src/modules/skill-tree-view.ts`:
- Import `MotionEngine` from `../core/motion-engine`.
- In `render()`:
  - After mounting the DOM elements to the container, execute entrance animations:
    ```typescript
    setTimeout(() => {
      // 1. Draw connecting SVG lines procedurally
      const lines = this.container.querySelectorAll('.constellation-line');
      if (lines.length > 0) MotionEngine.drawSvgLines(lines as any);

      // 2. Stagger node stars entrance with elastic bounce
      const nodes = this.container.querySelectorAll('.constellation-node');
      if (nodes.length > 0) MotionEngine.staggerEntrance(nodes as any, { from: 'bottom', delayStep: 30 });

      // 3. Roll up summit progress counter
      const progressEl = this.container.querySelector('.val-progress-pct') as HTMLElement | null;
      if (progressEl) MotionEngine.tweenNumber(progressEl, 0, progress.progressPct, '%');
    }, 40);
    ```
- In `openNodeModal(nodeId)`:
  - Invoke `MotionEngine.springModal(modal, modal.querySelector('.completion-receipt-card')!)`.
- On star node hover:
  - Animate scale pulse (`scale: 1.25`) with Anime.js.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-tree-animation.cjs`  
Expected: `✅ [MOTION TEST 2 PASSED] Animated Constellation Tree verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/skill-tree-view.ts web/scripts/verify-tree-animation.cjs
git commit -m "feat(tree): animate constellation filaments, star nodes, and modal springs"
```

---

### Task 3: Franklin Copywork Smooth Step Choreography & Number Rollups

**Files:**
- Modify: `web/src/modules/writing-dossier.ts`
- Test: `web/scripts/verify-copywork-motion.cjs`

**Interfaces:**
- Consumes: `MotionEngine`.
- Produces: Smooth step transitions (`fadeSlideIn`) between Step 1 (Analyze) -> Step 2 (Type) -> Step 3 (Split-Diff), and rolling counter animation for Accuracy % and Net WPM.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-copywork-motion.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[MOTION TEST 3] Verifying Copywork Motion & Rolling Telemetry...');

const writingTs = fs.readFileSync(path.join(__dirname, '../src/modules/writing-dossier.ts'), 'utf-8');

assert(writingTs.includes('MotionEngine'), "writing-dossier.ts must import MotionEngine");
assert(writingTs.includes('fadeSlideIn'), "writing-dossier.ts must use fadeSlideIn during step changes");
assert(writingTs.includes('tweenNumber'), "writing-dossier.ts must animate Accuracy % and Net WPM via tweenNumber");

console.log('✅ [MOTION TEST 3 PASSED] Copywork motion verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-copywork-motion.cjs`  
Expected: FAIL.

- [ ] **Step 3: Implement minimal code to make test pass**

Update `web/src/modules/writing-dossier.ts`:
- Import `MotionEngine` from `../core/motion-engine`.
- When transitioning steps (`this.currentStep = 'type'` or `'diff'`):
  - Call `MotionEngine.fadeSlideIn(this.container.querySelector('.copywork-card')!)`.
- In Step 3 (Split-Diff):
  - After rendering, animate the telemetry badges:
    ```typescript
    const accEl = this.container.querySelector('.val-accuracy') as HTMLElement;
    const wpmEl = this.container.querySelector('.val-wpm') as HTMLElement;
    if (accEl) MotionEngine.tweenNumber(accEl, 0, metrics.accuracyPct, '%');
    if (wpmEl) MotionEngine.tweenNumber(wpmEl, 0, metrics.netWpm);
    ```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-copywork-motion.cjs`  
Expected: `✅ [MOTION TEST 3 PASSED] Copywork motion verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/writing-dossier.ts web/scripts/verify-copywork-motion.cjs
git commit -m "feat(writing): add smooth step transitions and rolling telemetry animation"
```

---

### Task 4: Global Spatial View Transitions & Headless QA Verification

**Files:**
- Modify: `web/src/main.ts`
- Modify: `web/scripts/browser-qa-test.cjs`

**Interfaces:**
- Consumes: `MotionEngine`.
- Produces: Fluid spatial entrance transition across all dossier views (`#tree`, `#read`, `#write`, `#colloc`, `#grammar`, `#speak`) and clean animation teardown on route change.

- [ ] **Step 1: Write and run test**

Update `web/src/main.ts`:
- In `handleRouteChange(route: RouteId)`:
  - Call `MotionEngine.cancelAll()` before clearing DOM to prevent zombie animations.
  - After appending the active dossier to `this.workspaceMount`, call `MotionEngine.fadeSlideIn(this.workspaceMount, 'up')`.

Update `web/scripts/browser-qa-test.cjs`:
- Verify that navigating across routes executes cleanly with 0 console warnings or frame drops.
- Verify that `isReducedMotion()` returns true when `--prefers-reduced-motion` is active.

- [ ] **Step 2: Run verification test and build**

Run: `node web/scripts/browser-qa-test.cjs`  
Expected: 11 / 11 tests pass with 0 errors.

Run: `npm run build` in `web/`  
Expected: Clean production build compiling under 1.5s.

- [ ] **Step 3: Commit and update Hive records**

```bash
git add web/src/main.ts web/scripts/browser-qa-test.cjs hive/board.md hive/tasks.json hive/agents/god/memory.md
git commit -m "feat(release): Anime.js interactive motion & sensory overhaul complete"
```
