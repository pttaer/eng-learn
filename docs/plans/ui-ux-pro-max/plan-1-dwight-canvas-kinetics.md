# UI/UX Pro Max Architecture Plan 1: Kinetic Systems & High-Precision Canvas Architecture

**Assignee:** `dwight-mul1u508` (Dwight — Kinetics, Canvas Physics & Low-Level DSP Specialist)  
**Ticket ID:** `ENG-22`  
**Target Module:** [`web/src/core/sea-urchin.ts`](file:///E:/Eng/web/src/core/sea-urchin.ts), [`web/src/core/perspective-canvas.ts`](file:///E:/Eng/web/src/core/perspective-canvas.ts), [`web/src/core/cursor-tracker.ts`](file:///E:/Eng/web/src/core/cursor-tracker.ts)  
**Design Standard:** Strict Binary Monochrome (`#000000` / `#ffffff`), 60/120 FPS Sub-pixel Physics, Zero Jitter, WCAG 2.2 AAA Non-Obscured Visual Feedback.  
**Word Count Target:** $\ge 2,000$ words of concrete, executable code and architectural blueprints.

---

## 1. Executive Summary & Aesthetic Architecture

The visual singularity of the English Mastery HUD relies upon the **Sea Urchin**—a central 7-gateway living geometric construct that radiates magnetic spines outward into a 2.5D perspective grid. Currently, while the concentric hysteresis envelope (`OPEN_TRIGGER_RADIUS = 120px`, `KEEP_ALIVE_ENVELOPE = 220px`) prevents premature spine collapse, the motion dynamics employ linear interpolation (`lerp`) with fixed coefficients. Under varying monitor refresh rates (60Hz, 120Hz ProMotion, 240Hz eSports displays), linear lerping exhibits non-uniform deceleration, temporal micro-stutter, and frame-rate coupling. Furthermore, touch devices (smartphones, iPads) lack hover cursors, rendering the magnetic spine parted state inaccessible without dedicated multi-touch kinematic heuristics.

This engineering plan mandates an overhaul of the entire canvas rendering pipeline into a **High-Precision Spring-Damper Mechanical Engine** with sub-pixel device pixel ratio (DPR) alignment, pointer event coalescing, touch gesture state machines, radial wavefront decoy propagation, and an offscreen rendering worker buffer. Dwight will elevate this construct from a stylized demo into an aerospace-grade HUD with mathematical fluidity and zero visual fatigue.

---

## 2. Mathematical Foundations & Kinetic Formulations

### 2.1 Critically Damped Harmonic Oscillators (Spring-Damper Physics)
Replacing arbitrary lerp steps ($x_{t+1} = x_t + \alpha (x^* - x_t)$) with second-order Newtonian harmonic oscillator physics guarantees that all elements (reticle, gateway nodes, spine tips) track user inputs with organic inertia without overshoot or rubber-banding:

$$F_{\text{net}} = -k (x - x_{\text{target}}) - c v$$

where:
- $k$ is the spring stiffness constant ($k \in [180.0, 320.0]$ depending on spine inertia).
- $c$ is the damping coefficient. To ensure critical damping (zero oscillatory ringing with the fastest possible convergence time):
  $$c = 2 \sqrt{m k}$$
  Assuming unit mass ($m = 1.0$), $c = 2 \sqrt{k}$.

In discrete time with variable time step $\Delta t = \min(t_{\text{current}} - t_{\text{previous}}, 0.033)$ (clamped to prevent explosion on tab backgrounding):
$$a = -k (x - x_{\text{target}}) - c v$$
$$v_{t+\Delta t} = v_t + a \Delta t$$
$$x_{t+\Delta t} = x_t + v_{t+\Delta t} \Delta t$$

### 2.2 Asymmetric Concentric Hysteresis & Angular Parting
The Sea Urchin partitions the unit circle into 7 discrete equiangular sectors:
$$\theta_i = i \cdot \frac{2\pi}{7} - \frac{\pi}{2}, \quad i \in \{0, 1, \dots, 6\}$$

When the pointer vector $\vec{P} = (x_p - x_c, y_p - y_c)$ penetrates the inner threshold $r = \|\vec{P}\| \le R_{\text{open}} = 120\text{px}$, the urchin enters the `ENGAGED` state. The angular distance to gateway $i$ is:
$$\Delta\theta_i = \operatorname{atan2}(y_p - y_c, x_p - x_c) - \theta_i \pmod{2\pi}$$
Normalized to $[-\pi, \pi]$:
$$\Delta\theta_i = (\Delta\theta_i + \pi \pmod{2\pi}) - \pi$$

The angular parting displacement applied to non-targeted spines is governed by a smooth Gaussian bell envelope:
$$\delta\theta(\phi) = \operatorname{sgn}(\phi) \cdot \Omega_{\max} \cdot \exp\left(-\frac{\phi^2}{2 \sigma_\theta^2}\right)$$
where $\Omega_{\max} = 0.42\text{ rad} \approx 24^\circ$ and $\sigma_\theta = 0.55\text{ rad} \approx 31.5^\circ$. This creates an organic magnetic opening that cleaves the spines apart as the reticle approaches any gateway.

### 2.3 High-DPI Sub-Pixel Matrix Alignment
To prevent blurry hairlines on Apple Retina and 4K monitors, the canvas drawing context must scale by the device pixel ratio:
$$\text{DPR} = \max(1, \min(window.devicePixelRatio \parallel 1, 3))$$
All line coordinates must be clamped to half-pixel offsets ($x + 0.5$) for crisp $1\text{px}$ strokes:
$$x_{\text{render}} = \lfloor x \cdot \text{DPR} \rfloor + 0.5$$

---

## 3. Detailed Component Architecture & TypeScript Interfaces

Dwight will create and modify the following files:
1. `web/src/core/spring-physics.ts` (New mathematical core module for multi-dimensional spring vectors).
2. `web/src/core/sea-urchin.ts` (Major upgrade: Spring integration, multi-touch state machine, radial ripple decoys).
3. `web/src/core/perspective-canvas.ts` (Sub-pixel rendering, pointer coalescing, reduced-motion bypass).
4. `web/src/core/cursor-tracker.ts` (High-frequency pointer listeners, velocity vector tracking).
5. `web/scripts/verify-canvas-kinetics.cjs` (Headless simulation test suite asserting stability, convergence times, and zero NaN singularities).

```typescript
// web/src/core/spring-physics.ts
export interface SpringConfig {
  stiffness: number; // k
  damping?: number;   // c (auto-calculated if omitted: 2 * sqrt(k))
  mass?: number;      // m (default: 1.0)
  precision?: number; // threshold for sleep state (default: 0.001)
}

export class SpringVector2D {
  public currentX: number;
  public currentY: number;
  public targetX: number;
  public targetY: number;
  public velocityX: number = 0;
  public velocityY: number = 0;

  private k: number;
  private c: number;
  private m: number;
  private eps: number;

  constructor(initialX: number, initialY: number, config: SpringConfig) {
    this.currentX = initialX;
    this.currentY = initialY;
    this.targetX = initialX;
    this.targetY = initialY;
    this.m = config.mass || 1.0;
    this.k = config.stiffness;
    this.c = config.damping ?? 2 * Math.sqrt(this.m * this.k);
    this.eps = config.precision || 0.001;
  }

  public update(dtSeconds: number): boolean {
    const clampedDt = Math.min(dtSeconds, 0.033);
    const forceX = -this.k * (this.currentX - this.targetX) - this.c * this.velocityX;
    const forceY = -this.k * (this.currentY - this.targetY) - this.c * this.velocityY;

    const ax = forceX / this.m;
    const ay = forceY / this.m;

    this.velocityX += ax * clampedDt;
    this.velocityY += ay * clampedDt;

    this.currentX += this.velocityX * clampedDt;
    this.currentY += this.velocityY * clampedDt;

    const isResting =
      Math.abs(this.targetX - this.currentX) < this.eps &&
      Math.abs(this.targetY - this.currentY) < this.eps &&
      Math.abs(this.velocityX) < this.eps &&
      Math.abs(this.velocityY) < this.eps;

    if (isResting) {
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.velocityX = 0;
      this.velocityY = 0;
      return false; // Sleeping
    }
    return true; // Active
  }

  public snapTo(x: number, y: number): void {
    this.currentX = x;
    this.currentY = y;
    this.targetX = x;
    this.targetY = y;
    this.velocityX = 0;
    this.velocityY = 0;
  }
}
```

---

## 4. Step-by-Step Implementation Blueprint

### Step 4.1: Automated Headless Kinetics Test Suite
Before modifying the DOM or Canvas, create `web/scripts/verify-canvas-kinetics.cjs` to validate the spring math, convergence guarantees, and stability across extreme delta times:

```javascript
// web/scripts/verify-canvas-kinetics.cjs
const assert = require('assert');

class Spring1D {
  constructor(initial, k, damping) {
    this.current = initial;
    this.target = initial;
    this.velocity = 0;
    this.k = k;
    this.c = damping || 2 * Math.sqrt(k);
  }

  step(dt) {
    const force = -this.k * (this.current - this.target) - this.c * this.velocity;
    this.velocity += force * dt;
    this.current += this.velocity * dt;
  }
}

console.log('[KINETICS TEST] Initializing spring oscillator verification...');

// Test 1: Critical Damping Convergence
const spring = new Spring1D(0, 250);
spring.target = 100;
let steps = 0;
const dt = 0.016; // 60fps frame delta

while (steps < 200) {
  spring.step(dt);
  steps++;
  if (Math.abs(spring.current - 100) < 0.05 && Math.abs(spring.velocity) < 0.05) {
    break;
  }
}

console.log(`- Convergence to target achieved in ${steps} steps (${(steps * dt).toFixed(3)}s)`);
assert(steps < 120, 'Spring took too long to converge (> 1.9s)');
assert(Math.abs(spring.current - 100) < 0.1, 'Spring did not converge to target');

// Test 2: Zero Overshoot on Critical Damping
let maxVal = 0;
const springOvershoot = new Spring1D(0, 200);
springOvershoot.target = 50;
for (let i = 0; i < 150; i++) {
  springOvershoot.step(0.016);
  if (springOvershoot.current > maxVal) maxVal = springOvershoot.current;
}
console.log(`- Peak value recorded: ${maxVal.toFixed(3)} (target: 50.0)`);
assert(maxVal <= 50.05, `Overshoot detected in critically damped spring: peak=${maxVal}`);

// Test 3: Numerical Stability under Variable Delta Times (Drop frames simulation)
const jitterSpring = new Spring1D(0, 300);
jitterSpring.target = 1000;
const erraticDts = [0.016, 0.008, 0.033, 0.060, 0.001, 0.016];
for (let i = 0; i < 300; i++) {
  const variableDt = erraticDts[i % erraticDts.length];
  jitterSpring.step(variableDt);
  assert(!isNaN(jitterSpring.current), 'Spring produced NaN under erratic frame rates');
  assert(isFinite(jitterSpring.current), 'Spring exploded to Infinity');
}
console.log(`- Erratic frame rate stability verified: final value = ${jitterSpring.current.toFixed(1)}`);

console.log('✓ All Kinetic Physics mathematical assertions passed cleanly.');
```

### Step 4.2: Upgrading `web/src/core/cursor-tracker.ts` with Coalesced Events
Modern gaming mice report at 1,000Hz (1ms), whereas screen frames render at 60Hz-120Hz. If browsers fire multiple `pointermove` events per frame, standard listeners either cause layout thrashing or drop valuable curvature data. Dwight will upgrade `CursorTracker` to extract coalesced events:

```typescript
// web/src/core/cursor-tracker.ts (Key Enhancements)
export interface PointerVelocity {
  vx: number;
  vy: number;
  speed: number;
}

export class CursorTracker {
  private static instance: CursorTracker;
  public x: number = window.innerWidth / 2;
  public y: number = window.innerHeight / 2;
  public smoothedX: number = window.innerWidth / 2;
  public smoothedY: number = window.innerHeight / 2;
  public velocity: PointerVelocity = { vx: 0, vy: 0, speed: 0 };

  private lastEventTime: number = performance.now();
  private prevX: number = window.innerWidth / 2;
  private prevY: number = window.innerHeight / 2;

  private constructor() {
    this.bindEvents();
  }

  public static get(): CursorTracker {
    if (!CursorTracker.instance) CursorTracker.instance = new CursorTracker();
    return CursorTracker.instance;
  }

  private bindEvents(): void {
    window.addEventListener('pointermove', (e: PointerEvent) => {
      // Process coalesced events for sub-frame trajectory precision
      const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
      for (const ev of events) {
        this.x = ev.clientX;
        this.y = ev.clientY;
      }

      const now = performance.now();
      const dt = Math.max(0.001, (now - this.lastEventTime) / 1000);
      this.velocity.vx = (this.x - this.prevX) / dt;
      this.velocity.vy = (this.y - this.prevY) / dt;
      this.velocity.speed = Math.sqrt(this.velocity.vx ** 2 + this.velocity.vy ** 2);

      this.prevX = this.x;
      this.prevY = this.y;
      this.lastEventTime = now;
    }, { passive: true });
  }

  public updateSmoothing(alpha: number = 0.2): void {
    this.smoothedX += (this.x - this.smoothedX) * alpha;
    this.smoothedY += (this.y - this.smoothedY) * alpha;
  }
}
```

### Step 4.3: Engineering Multi-Touch Kinetic State Machine in `sea-urchin.ts`
On mobile and tablet viewports, there is no mouse hover. Without hover, the Sea Urchin remains collapsed at $R = 24\text{px}$. Dwight will implement a dedicated Touch State Machine:
1. `COLLAPSED`: Spines clustered into dormant singularity.
2. `AIMING`: User touches and drags finger across canvas. Spines part radially toward the touch coordinate. A laser-projected targeting reticle indicates the closest gateway.
3. `COMMITTED`: User lifts finger within $R_{\text{commit}} = 140\text{px}$ of a gateway; triggers immediate route navigation with an absorption implosion.
4. `RESET`: Finger drags beyond boundary ($> 260\text{px}$); smoothly snaps spines back to equilibrium via spring physics.

```typescript
// Touch handling additions in SeaUrchin
private initTouchHandling(): void {
  window.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.isTouchActive = true;
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.handlePointerMove(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e: TouchEvent) => {
    if (this.isTouchActive && e.touches.length === 1) {
      const touch = e.touches[0];
      this.handlePointerMove(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (this.isTouchActive) {
      this.isTouchActive = false;
      if (this.hoveredGatewayIdx >= 0) {
        this.selectGateway(this.hoveredGatewayIdx);
      }
      this.closeGraceCounter = 300;
    }
  }, { passive: true });
}
```

### Step 4.4: High-DPI Canvas Buffer & Concentric Wavefront Ripples
When an interactive gateway is approached, Dwight will render a propagating concentric wavefront ripple on the background canvas:
- Propagates from gateway centroid $(x_{gi}, y_{gi})$ outward to $R = 64\text{px}$.
- Hairline stroke: `1px solid rgba(0, 0, 0, alpha)` where $\alpha = 0.8 \cdot (1 - r / 64)$.
- Decays over 400ms using sinusoidal decay.

---

## 5. Defensive Boundaries & Failure Modes

1. **Window Backgrounding & Inactive Tab Suspension**:
   - When a user minimizes or switches tabs, `requestAnimationFrame` throttles to 1fps or suspends entirely.
   - If `dt` is not clamped, the next resume frame calculates $\Delta t > 10.0\text{s}$, causing spring forces to violently launch elements outside visible coordinates.
   - **Defense:** Enforce strict clamping: `dt = Math.min(dt, 0.033)`. If $\Delta t > 0.1\text{s}$, automatically invoke `spring.snapToTarget()`.
2. **Device Pixel Ratio (DPR) Dynamic Switching**:
   - Moving a browser window between a standard $1.0\times$ monitor and a $2.0\times$ Retina display causes immediate raster blurriness if the backing buffer resolution is not re-synchronized.
   - **Defense:** Listen to `window.matchMedia('(resolution: ' + window.devicePixelRatio + 'dppx)')` and trigger canvas buffer resize on transition.
3. **Reduced Motion Accessibility (`prefers-reduced-motion: reduce`)**:
   - Users with vestibular disorders must not be subjected to intense rotational parallax or pulsating spines.
   - **Defense:** Query `window.matchMedia('(prefers-reduced-motion: reduce)')`. If active, disable all 2.5D tilt angles ($\theta_{\text{pitch}} = 0, \theta_{\text{roll}} = 0$), freeze spine rotation, and replace spring animations with instant opacity fades ($150\text{ms}$).

---

## 6. Verification & Acceptance Criteria

1. **Mathematical Verification Suite**:
   - `node web/scripts/verify-canvas-kinetics.cjs` passes 100% of spring oscillator convergence and stability tests.
2. **Frame Rate Performance Profiling**:
   - Execute Chrome DevTools Performance recording during active 360-degree pointer orbiting.
   - Zero long-tasks ($> 16.6\text{ms}$). Frame rate stays locked at 60fps (or 120fps on ProMotion hardware).
   - CPU utilization of the animation loop remains $< 8\%$ on single-core mobile emulation.
3. **Production Compilation**:
   - `npm run build` compiles with 0 TypeScript warnings or bundle inflation ($< 5\text{KB}$ increase).
4. **Touch & Gestural Accuracy**:
   - Mobile touch dragging accurately opens spines and highlights gateways on viewport widths from $375\text{px}$ to $1024\text{px}$.
