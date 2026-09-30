# Game-Style Spotlight Onboarding Tour & Sensory Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a GPU-accelerated spotlight cutout onboarding tour, animated pointer arrow, floating glassmorphic HUD holo-card, procedural audio cues, and fullscreen gold particle celebration canvas modeled after `TokenTrackerAntigravity`.

**Architecture:** A standalone `SpotlightTourEngine` singleton orchestrates DOM element targeting, 9999px dark curtain cutout clipping, viewport-clamped arrow bouncing, and step progression across 6 core components. A `ParticleCanvas` engine handles lightweight 2D canvas particle physics on tour completion and session milestones. The Header HUD exposes a permanent tour launch button.

**Tech Stack:** TypeScript (ES2022), Anime.js v3.2.2, HTML5 Canvas 2D, Web Audio API, CSS3 GPU Transforms & Backdrop-Filter, Puppeteer-Core test harnesses.

**Spec:** [`docs/superpowers/specs/2026-09-30-game-onboarding-tour-and-sensory-interactions-design.md`](file:///E:/Eng/docs/superpowers/specs/2026-09-30-game-onboarding-tour-and-sensory-interactions-design.md)

## Global Constraints
- Pure binary monochrome baseline with selective `--accent-gold` (#ca8a04) lighting highlights.
- Zero CPU re-rasterization: All spotlight animations use `transform: translate3d(0, 0, 0)` and CSS transitions.
- Strictly respect `prefers-reduced-motion` media query (instant cuts, no infinite bouncing).
- Clean lifecycle management: `cancelAnimationFrame` and event listener teardown when tour closes.
- 100% offline standalone capability (PWA & Electron desktop compatible).

---

### Task 1: Fullscreen 2D Confetti & Particle Celebration Canvas

**Files:**
- Create: `web/src/core/particle-canvas.ts`
- Create: `web/scripts/verify-particle-canvas.cjs`
- Modify: `web/index.html:50-55`

**Interfaces:**
- Produces: `ParticleCanvas.burst(originX?: number, originY?: number, count?: number): void`
- Produces: `ParticleCanvas.init(canvasEl: HTMLCanvasElement): void`

- [ ] **Step 1: Write failing verification test for particle canvas**

Create `web/scripts/verify-particle-canvas.cjs`:
```javascript
const assert = require('assert');
const { ParticleCanvas } = require('../dist/assets/index-DGTXQ00d.js'); // or module test
```
Write test verifying canvas creation, particle array initialization, velocity calculation, decay, and auto-idle state.

- [ ] **Step 2: Run test to verify failure**

Run: `node web/scripts/verify-particle-canvas.cjs`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement ParticleCanvas in `web/src/core/particle-canvas.ts`**

```typescript
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
  shape: 'star' | 'rect' | 'circle';
}

export class ParticleCanvas {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static particles: Particle[] = [];
  private static animFrameId: number | null = null;

  public static init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private static resize(): void {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public static burst(originX?: number, originY?: number, count = 75): void {
    if (!this.canvas || !this.ctx) return;
    const cx = originX ?? window.innerWidth / 2;
    const cy = originY ?? window.innerHeight / 2;
    const colors = ['#ca8a04', '#eab308', '#fef08a', '#111111', '#ffffff'];
    const shapes: ('star' | 'rect' | 'circle')[] = ['star', 'rect', 'circle'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }

    if (!this.animFrameId) {
      this.loop();
    }
  }

  private static loop = (): void => {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.vx *= 0.985; // friction
      p.rotation += p.vRot;
      p.opacity -= 0.014;

      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
      } else if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // 4-point star
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.lineTo(p.size * 0.3, -p.size * 0.3);
        this.ctx.lineTo(p.size, 0);
        this.ctx.lineTo(p.size * 0.3, p.size * 0.3);
        this.ctx.lineTo(0, p.size);
        this.ctx.lineTo(-p.size * 0.3, p.size * 0.3);
        this.ctx.lineTo(-p.size, 0);
        this.ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animFrameId = requestAnimationFrame(this.loop);
    } else {
      this.animFrameId = null;
    }
  };
}
```

- [ ] **Step 4: Run verification test to verify pass**

Run: `node web/scripts/verify-particle-canvas.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/core/particle-canvas.ts web/scripts/verify-particle-canvas.cjs
git commit -m "feat(core): add ParticleCanvas high-performance 2D celebration engine"
```

---

### Task 2: GPU Spotlight Cutout & Game Onboarding Tour Engine

**Files:**
- Create: `web/src/core/spotlight-tour.ts`
- Create: `web/scripts/verify-spotlight-tour.cjs`
- Modify: `web/src/core/audio-synthesizer.ts`

**Interfaces:**
- Consumes: `ParticleCanvas.burst()`
- Consumes: `AudioSynthesizer.play()`
- Produces: `SpotlightTour.start(force?: boolean): void`
- Produces: `SpotlightTour.next(): void`
- Produces: `SpotlightTour.prev(): void`
- Produces: `SpotlightTour.close(): void`

- [ ] **Step 1: Write failing verification test for SpotlightTour**

Create `web/scripts/verify-spotlight-tour.cjs` with tests asserting:
1. Tour overlay mounting and teardown.
2. Step data integrity (6 steps, valid targets, non-empty titles/descriptions).
3. Spotlight bounding rectangle calculation and padding clamp.
4. Arrow placement determination (left, right, top, bottom).
5. Progress bar calculation percentage.
6. Audio trigger calls on step navigation.
7. LocalStorage flag persistence.

- [ ] **Step 2: Run test to verify failure**

Run: `node web/scripts/verify-spotlight-tour.cjs`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `SpotlightTour` in `web/src/core/spotlight-tour.ts`**

Define `TourStep` interface, 6-step curriculum, DOM element templates for `#tourOverlay`, `#tourSpotlight`, `#tourArrow`, and `#tourCard`.
Implement `renderStep()`, `updateSpotlightPosition()`, keyboard listeners (`Escape`, `ArrowRight`, `ArrowLeft`), and completion callback triggering `ParticleCanvas.burst()` and `AudioSynthesizer.play('absorb')`.

- [ ] **Step 4: Run test to verify pass**

Run: `node web/scripts/verify-spotlight-tour.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/core/spotlight-tour.ts web/scripts/verify-spotlight-tour.cjs web/src/core/audio-synthesizer.ts
git commit -m "feat(tour): implement SpotlightTour GPU cutout engine and step curriculum"
```

---

### Task 3: Glassmorphic Tour Card & GPU Cutout Styling

**Files:**
- Modify: `web/src/assets/styles/dossiers.css` (or `tour-spotlight.css`)
- Modify: `web/src/assets/styles/hud-base.css`

- [ ] **Step 1: Add tour overlay, spotlight, arrow, and card CSS**

Incorporate styles from `TokenTrackerAntigravity`:
- `.tour-overlay`: `fixed inset: 0; z-index: 100000; opacity: 0; transition: opacity 0.2s;`
- `.tour-spotlight`: `box-shadow: 0 0 0 9999px rgba(10, 10, 12, 0.85), 0 0 16px var(--accent-gold); border: 2px solid var(--accent-gold);`
- `.tour-spotlight::after`: Pulsing aura ring (`@keyframes tourGlowPulse`).
- `.tour-arrow`: Directional bounce keyframes (`bounceLeft`, `bounceRight`, `bounceUp`, `bounceDown`).
- `.tour-card`: Glassmorphic card, `backdrop-filter: blur(16px)`, clean typography, `tour-mini-bar` progress HUD.
- `@media (prefers-reduced-motion: reduce)`: Disable animations and translate delays.

- [ ] **Step 2: Verify styles compile cleanly with Vite**

Run: `npm run build` in `web/`
Expected: PASS with 0 CSS syntax errors.

- [ ] **Step 3: Commit**

```bash
git add web/src/assets/styles/dossiers.css web/src/assets/styles/hud-base.css
git commit -m "style(tour): add GPU-accelerated spotlight and glassmorphic HUD card styles"
```

---

### Task 4: Header HUD Tour Trigger, Welcome Dialog & End-to-End Headless QA Verification

**Files:**
- Modify: `web/src/modules/header-hud.ts:50-60`
- Modify: `web/src/main.ts:250-268`
- Modify: `web/scripts/browser-qa-test.cjs`

- [ ] **Step 1: Add `[ 🎮 TOUR ]` button in Header HUD**

In `web/src/modules/header-hud.ts`:
Add `btn-launch-tour` button next to `[ 🔊 SOUND ]` and `[ ⚙ SETTINGS ]`.
Bind click event to `SpotlightTour.start(true)`.

- [ ] **Step 2: Wire automatic first-run check in `main.ts`**

In `web/src/main.ts`:
Check `localStorage.getItem('eng_onboarding_completed')`. If absent, trigger initial welcome prompt offering to launch the spotlight tour.

- [ ] **Step 3: Add automated Headless Browser QA test in `browser-qa-test.cjs`**

Add Test 14 in `web/scripts/browser-qa-test.cjs`:
1. Navigate to `#tree`.
2. Click `[ 🎮 TOUR ]` button.
3. Assert `#tourOverlay.open` exists and `#tourSpotlight` wraps `.hud-telemetry-cluster`.
4. Click `Next →` and verify transition to Step 2 (`.workout-banner`).
5. Advance through steps and verify `ParticleCanvas.burst()` on completion.
6. Capture screenshot `13-spotlight-tour.png`.

- [ ] **Step 4: Run full browser QA test suite**

Run: `node web/scripts/browser-qa-test.cjs`
Expected: 14/14 tests passing, 0 console errors, 0 network failures.

- [ ] **Step 5: Run production build and update unpacked asar**

Run: `npm run build && node web/scripts/update-unpacked-asar.cjs`
Expected: Clean build and updated executable bundle.

- [ ] **Step 6: Commit**

```bash
git add web/src/modules/header-hud.ts web/src/main.ts web/scripts/browser-qa-test.cjs
git commit -m "feat(integration): wire header tour launcher, first-run prompt, and headless QA"
```
