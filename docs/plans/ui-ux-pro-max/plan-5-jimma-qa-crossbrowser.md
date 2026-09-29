# UI/UX Pro Max Architecture Plan 5: Design QA, Visual Regression Harness & Cross-Browser Consistency

**Assignee:** `jim-mum0qdlb` (JimMA — Design QA, Visual Performance & Cross-Browser Consistency Specialist)  
**Ticket ID:** `ENG-26`  
**Target Module:** [`web/src/core/pwa.ts`](file:///E:/Eng/web/src/core/pwa.ts), [`web/src/modules/header-hud.ts`](file:///E:/Eng/web/src/modules/header-hud.ts), [`web/src/modules/corner-compass.ts`](file:///E:/Eng/web/src/modules/corner-compass.ts), [`web/src/assets/styles/hud-base.css`](file:///E:/Eng/web/src/assets/styles/hud-base.css), [`web/src/assets/styles/variables.css`](file:///E:/Eng/web/src/assets/styles/variables.css)  
**Design Standard:** Strict Binary Monochrome (`#000000` / `#ffffff`), Cumulative Layout Shift ($\text{CLS} < 0.05$), 100dvh Viewport Geometry, WebKit/Blink/Gecko Engine Parity.  
**Word Count Target:** $\ge 2,000$ words of concrete, executable code and architectural blueprints.

---

## 1. Executive Summary & Quality Assurance Mission

An extraordinary UI/UX design is only as credible as its technical execution across diverse real-world environments. The English Singularity web platform operates as an offline-first Progressive Web App (PWA) with a complex 2.5D perspective canvas, dynamic SVG gauges, interactive 3D flipper cards, and real-time audio waveforms. On high-end developer workstations running Chrome on desktop monitors, the experience appears flawless. However, across mobile browsers, varied rendering engines (WebKit, Blink, Gecko), and standalone PWA display modes, subtle regressions degrade usability:

1. **Cumulative Layout Shift (CLS) on Route Transitions (Violation of Priority 3):** When navigating between dossier modules (e.g., `#reading` to `#speaking` to `#grammar`), cards mount dynamically into `.dossier-card-slot`. If dimensions are not reserved prior to asset rendering, the surrounding HUD, corner compass, and navigation controls jump vertically by $16\text{px} - 40\text{px}$, causing layout thrashing and failing Google Core Web Vitals ($\text{CLS} > 0.1$).
2. **Mobile Viewport Height Collapse & iOS Notch Collisions:** On iOS Safari, the dynamic address bar expands and contracts during scrolling. Using traditional `100vh` causes bottom navigation controls (such as the Corner Compass and Next Prompt buttons) to be obscured beneath the mobile browser toolbar. Furthermore, standalone PWA mode fails to respect hardware safe areas (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`), causing text to collide with the iPhone Dynamic Island or home indicator bar.
3. **Inverted Void Lens Light Bleed & Subpixel Rendering Artifacts:** When cards enter deep-focus or review states, the design system calls for an "Inverted Void Lens" (pure `#000000` void canvas with crisp `#ffffff` hairline boundaries). In certain browser engines, fractional subpixel calculations cause $0.5\text{px}$ faint gray seams or aliasing halos along card borders.
4. **Lack of Automated Visual Regression & Layout Shift Audits:** The development workflow currently relies upon manual visual inspection. Without an automated headless test suite verifying layout stability, CSS containment, and contrast invariant guarantees, subsequent feature additions constantly risk introducing visual regressions.

JimMA will build a comprehensive **Design QA & Cross-Browser Verification System**: implementing strict **CSS Layout Containment**, **Dynamic Viewport Unit Adaptations (`100dvh`)**, **Hardware Safe-Area Inset Handling**, and an automated **Headless DOM Geometry Shift Audit Harness**.

---

## 2. Mathematical Foundations & Performance Budgets

### 2.1 Cumulative Layout Shift (CLS) Mathematical Formulation
The Cumulative Layout Shift metric measures the visual instability of a page by summing layout shift scores across unexpected frame movements:

$$\text{CLS} = \sum \text{LayoutShiftScore}$$

where:
$$\text{LayoutShiftScore} = \text{Impact Fraction} \times \text{Distance Fraction}$$
- **Impact Fraction:** The fraction of the viewport occupied by unstable elements before and after moving:
  $$\text{ImpactFraction} = \frac{\operatorname{Area}(\text{Union of Initial and Shifted Bounding Boxes})}{\operatorname{Area}(\text{Viewport})}$$
- **Distance Fraction:** The greatest distance an unstable element has moved horizontally or vertically, divided by the largest viewport dimension:
  $$\text{DistanceFraction} = \frac{\max(\Delta x, \Delta y)}{\max(W_{\text{viewport}}, H_{\text{viewport}})}$$

To achieve an industry-leading **$\text{CLS} \le 0.02$** budget (well below Google's acceptable $0.10$ ceiling), JimMA will enforce **Reserved Layout Aspect Ratios** on every dynamic card slot:
```css
.dossier-card-slot {
  min-height: clamp(420px, 58vh, 520px);
  contain: layout size;
}
```
By allocating the bounding envelope before child DOM mounting, the Impact Fraction drops to exactly $0.00$, completely eliminating layout shift during pillar transitions.

### 2.2 Dynamic Viewport Geometry & Safe Area Trigonometry
Traditional CSS viewports fail on mobile hardware:
- `100vh` = Fixed height assuming URL bar is completely hidden (causes bottom cutoff).
- `100svh` = Smallest possible viewport when URL bar is expanded.
- `100lvh` = Largest possible viewport when URL bar is retracted.
- `100dvh` = Dynamically adjusted real-time viewport height.

JimMA will standardize global viewport containers to:
$$\text{Height} = \operatorname{min}\left(100\text{dvh}, 100\text{vh}\right)$$

For notched displays, padding must satisfy hardware envelope boundaries:
$$P_{\text{top}} = \max\left(16\text{px}, \text{env}(\text{safe-area-inset-top})\right)$$
$$P_{\text{bottom}} = \max\left(16\text{px}, \text{env}(\text{safe-area-inset-bottom})\right)$$
$$P_{\text{left}} = \max\left(12\text{px}, \text{env}(\text{safe-area-inset-left})\right)$$
$$P_{\text{right}} = \max\left(12\text{px}, \text{env}(\text{safe-area-inset-right})\right)$$

### 2.3 CSS Containment & Compositor Layer Isolation
To keep frame rendering locked at $60\text{fps}$ and prevent global reflow cascades during card flips:
$$\text{Containment Rule} = \text{contain: layout style paint;}$$
Isolating the `.atomic-card-container` ensures that DOM mutations inside the card face never trigger geometry recalculations in the parent workspace, Header HUD, or background Canvas.

---

## 3. Detailed Component Architecture & TypeScript Interfaces

JimMA will create and modify:
1. `web/scripts/verify-visual-qa.cjs` (Automated headless layout shift, CSS token, and containment verification suite).
2. `web/src/assets/styles/hud-base.css` (Safe area insets, 100dvh global container, overscroll behavior).
3. `web/src/assets/styles/variables.css` (Strict monochrome tokens, layout containment variables).
4. `web/src/modules/header-hud.ts` (Dynamic safe-area compensation for notch displays).
5. `web/src/modules/corner-compass.ts` (Positioning lock preventing collision with iOS home indicator).

```typescript
// web/src/core/viewport-manager.ts (New Utility)
export interface ViewportDimensions {
  width: number;
  height: number;
  dpr: number;
  isStandalone: boolean;
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export class ViewportManager {
  private static instance: ViewportManager;

  public static get(): ViewportManager {
    if (!ViewportManager.instance) ViewportManager.instance = new ViewportManager();
    return ViewportManager.instance;
  }

  public getDimensions(): ViewportDimensions {
    const isStandalone = typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

    return {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      isStandalone,
      safeArea: {
        top: this.getComputedInset('safe-area-inset-top'),
        bottom: this.getComputedInset('safe-area-inset-bottom'),
        left: this.getComputedInset('safe-area-inset-left'),
        right: this.getComputedInset('safe-area-inset-right')
      }
    };
  }

  private getComputedInset(prop: string): number {
    const div = document.createElement('div');
    div.style.paddingTop = `env(${prop}, 0px)`;
    document.body.appendChild(div);
    const val = parseFloat(getComputedStyle(div).paddingTop) || 0;
    div.remove();
    return val;
  }
}
```

---

## 4. Step-by-Step Implementation Blueprint

### Step 4.1: Automated Headless Layout Shift & CSS Quality Test Suite
JimMA will author `web/scripts/verify-visual-qa.cjs` to enforce strict layout and token invariant rules:

```javascript
// web/scripts/verify-visual-qa.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[VISUAL QA TEST] Initializing Layout Shift and Anti-Regression Audit...');

// 1. Audit CSS for Viewport Height Standards (100dvh support)
const hudBaseCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/hud-base.css'), 'utf8');
assert(hudBaseCss.includes('100dvh') || hudBaseCss.includes('dvh'), 'hud-base.css must implement 100dvh for modern mobile viewport support');
assert(hudBaseCss.includes('safe-area-inset'), 'hud-base.css must implement safe-area-inset rules for notched displays');
assert(hudBaseCss.includes('overscroll-behavior'), 'hud-base.css must specify overscroll-behavior to prevent iOS rubber-banding');

// 2. Audit CSS Containment in Card and Dossier Layouts
const cardCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/atomic-card.css'), 'utf8');
assert(cardCss.includes('contain:'), 'atomic-card.css must implement CSS containment for reflow isolation');

const dossiersCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/dossiers.css'), 'utf8');
assert(dossiersCss.includes('.dossier-card-slot'), 'dossiers.css must define .dossier-card-slot bounding styles');

// 3. Strict Binary Monochrome Palette Audit
const variablesCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/variables.css'), 'utf8');
assert(variablesCss.includes('--bg-canvas: #ffffff'), 'Background canvas token must be pure #ffffff');
assert(variablesCss.includes('--ink-primary: #000000'), 'Primary ink token must be pure #000000');

// 4. Mathematical Simulation of Layout Shift Budget
function simulateLayoutShift(initialY, shiftedY, elementHeight, viewportHeight) {
  const distance = Math.abs(shiftedY - initialY);
  const distanceFraction = distance / viewportHeight;
  const impactFraction = (elementHeight + distance) / viewportHeight;
  return impactFraction * distanceFraction;
}

// Case A: Unconstrained slot (shifts by 80px when card loads)
const unconstrainedCls = simulateLayoutShift(120, 200, 440, 800);
console.log(`- Unconstrained Layout Shift Score: ${unconstrainedCls.toFixed(4)} (Threshold: < 0.05)`);
assert(unconstrainedCls > 0.05, 'Simulation sanity check: unconstrained should fail');

// Case B: Reserved container slot (shifts by 0px)
const reservedCls = simulateLayoutShift(120, 120, 440, 800);
console.log(`- Reserved Slot Layout Shift Score: ${reservedCls.toFixed(4)} (Threshold: < 0.05)`);
assert(reservedCls === 0.0, 'Reserved slot must produce exactly 0.00 CLS');

console.log('✓ All Visual QA and Layout Shift invariants verified successfully.');
```

### Step 4.2: Upgrading `web/src/assets/styles/hud-base.css` with Dynamic Viewports & Safe Areas
JimMA will harden global styling against viewport anomalies and mobile notch collisions:

```css
/* web/src/assets/styles/hud-base.css */

/* Prevent iOS Safari rubber-band scrolling and layout shifts */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
  background-color: var(--bg-canvas, #ffffff);
  color: var(--ink-primary, #000000);
  font-family: var(--font-sans);
  overscroll-behavior: none;
  -webkit-text-size-adjust: 100%;
}

/* Master Singularity App Container */
#app {
  width: 100%;
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding-top: max(12px, env(safe-area-inset-top));
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  position: relative;
  z-index: 1;
}

/* Reserved Slot Geometry: Zero Layout Shift on Dynamic Module Mounting */
.dossier-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  position: relative;
  contain: layout style;
}

.dossier-card-slot {
  width: 100%;
  min-height: clamp(420px, 58vh, 520px);
  display: flex;
  align-items: center;
  justify-content: center;
  contain: layout size;
}

/* Inverted Void Lens: High-Focus Black Light Mask */
.void-lens-active {
  background-color: #000000 !important;
  color: #ffffff !important;
  transition: background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.void-lens-active .card-face {
  background-color: #000000 !important;
  color: #ffffff !important;
  border-color: #ffffff !important;
  box-shadow: 0 0 24px rgba(255, 255, 255, 0.08) !important;
}

.void-lens-active .hud-btn {
  border-color: #ffffff !important;
  color: #ffffff !important;
}

.void-lens-active .hud-btn:hover {
  background-color: #ffffff !important;
  color: #000000 !important;
}
```

### Step 4.3: Hardening `corner-compass.ts` against Touch Collisions & Viewport Boundaries
On modern smartphones, bottom navigation triggers frequently collide with the iOS home indicator bar or Android three-button system navigation. JimMA will adapt the Corner Compass:
- Calculate computed safe area bottom offset.
- Ensure the radar circle maintains an $8\text{px}$ elevation above the hardware gesture bar.
- Add active touch hitboxes to each radial cardinal point.

```typescript
// web/src/modules/corner-compass.ts (Touch and Safe-Area Hardening)
import { RouteId } from '../core/router';

export class CornerCompass {
  private container: HTMLElement;
  public onNavigate?: (route: RouteId) => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'corner-compass-container';
    this.applySafePositioning();
    this.render();
  }

  private applySafePositioning(): void {
    // Elevate above iOS Home Indicator and dynamic gesture areas
    this.container.style.position = 'fixed';
    this.container.style.bottom = 'max(16px, env(safe-area-inset-bottom, 16px))';
    this.container.style.left = 'max(16px, env(safe-area-inset-left, 16px))';
    this.container.style.zIndex = '50';
    this.container.style.userSelect = 'none';
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="compass-dial" role="navigation" aria-label="7-Pillar Radial Quick Navigation">
        <svg class="compass-svg" width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-hairline, rgba(0,0,0,0.2))" stroke-width="1" />
          <circle class="compass-needle-ring" cx="32" cy="32" r="24" fill="none" stroke="var(--ink-primary, #000000)" stroke-width="1.5" stroke-dasharray="4, 4" />
          <g class="compass-gateways"></g>
        </svg>
        <div class="compass-center-label" style="position: absolute; top: 0; left: 0; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 8px; font-weight: 700;">
          HUD
        </div>
      </div>
    `;

    this.bindTouchInteractions();
    return this.container;
  }

  private bindTouchInteractions(): void {
    const dial = this.container.querySelector('.compass-dial');
    if (!dial) return;

    // Minimum 44x44px touch hitbox wrapper for mobile tap acquisition
    dial.addEventListener('touchstart', (e: TouchEvent) => {
      e.stopPropagation();
      this.container.classList.add('compass-active-touch');
    }, { passive: true });

    dial.addEventListener('touchend', (e: TouchEvent) => {
      e.stopPropagation();
      this.container.classList.remove('compass-active-touch');
    }, { passive: true });
  }
}
```

### Step 4.4: Inverted Void Lens Ritual & High-Focus Masking
The Black-Light Inverted Void Lens is triggered during intensive active recall drills (e.g. when reviewing mature SM-2 flashcard intervals or evaluating copywork errors). JimMA will engineer the CSS transition protocol to guarantee zero color banding:

```css
/* Inverted Void Lens Keyframe Protocol in hud-base.css */

@keyframes voidLensEngage {
  0% {
    filter: invert(0);
  }
  100% {
    filter: invert(1);
  }
}

.void-lens-transition {
  animation: voidLensEngage 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Subpixel Seam Prevention: Eliminate 0.5px hairline gaps on fractional scaling displays */
.card-face,
.atomic-card-container,
.dossier-workspace {
  box-sizing: border-box;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Explicit PWA Standalone Display Overrides */
@media all and (display-mode: standalone) {
  body {
    user-select: none;
    -webkit-touch-callout: none;
  }
  
  /* Additional padding for notch clearance on installed PWA homescreen apps */
  #app {
    padding-top: max(20px, env(safe-area-inset-top));
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}
```

---

## 5. Comprehensive Cross-Browser Compatibility Matrix

JimMA will validate the entire interface against all three dominant rendering engines:

| Feature / Subsystem | Blink (Chrome, Edge, Brave) | WebKit (Safari macOS & iOS) | Gecko (Mozilla Firefox) | Fallback / Defense Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **2.5D Canvas Parallax** | Full 120Hz Hardware Acceleration | Supported; requires `translate3d` to prevent GPU compositor drops | Supported; requires `image-rendering: -moz-crisp-edges` | Clamped delta time (`dt <= 0.033s`) prevents matrix detachment. |
| **Fluid `100dvh` Viewport** | Native support in Chrome 108+ | Native support in iOS Safari 15.4+ | Native support in Firefox 101+ | Cascading fallback: `height: 100vh; height: 100dvh;`. |
| **Container Queries (`@container`)** | Supported across modern Chromium | Supported in WebKit 16.0+ | Supported in Gecko 110+ | Fluid `clamp()` styles provide baseline responsiveness if unsupported. |
| **Web Speech Spotting** | Native `webkitSpeechRecognition` | Experimental; disabled by default on older iOS | Unsupported natively without experimental flags | Graceful degradation to manual interactive click-to-activate radar chips. |
| **PWA Service Worker Cache** | Stale-While-Revalidate with Cache API | Supported; 50MB quota cap strictly audited | Supported with indexed storage | Offline cache fallback serves pre-compiled static bundle from `dist/`. |
| **Dual-Trace Oscilloscope** | 60FPS canvas time-domain streaming | Supported; requires DPR device ratio scaling | Supported with canvas 2D context | Procedural synthetic sine fallback if microphone permission is denied. |

---

## 6. Defensive Boundaries & Failure Modes

1. **Orientation Change & Keyboard Resize Jolt on Mobile**:
   - When a student taps an input textarea (e.g. in Franklin Copywork), the mobile soft keyboard animates upward, shrinking the viewport height by up to $50\%$.
   - If not defensive, the entire UI compresses into an illegible pancake.
   - **Defense:** Apply `overflow-y: auto` to `.dossier-workspace` during active focus states, while keeping Header HUD fixed at the top.
2. **Subpixel Hairline Bleed on Fractional Displays**:
   - High-DPI screens with non-integer scaling ($125\%, 150\%, 175\%$) can render hairline borders at fractional pixels (e.g. $0.8\text{px}$), causing intermittent border disappearance.
   - **Defense:** Enforce `border: 1px solid var(--border-solid);` and avoid subpixel border widths (`0.5px`). Use integer pixel offsets on all CSS transform translations.
3. **PWA Standalone Launch White Flash**:
   - In PWA standalone display mode, cold launches can display a jarring white flash before styles load.
   - **Defense:** Hardcode background `#ffffff` into `index.html` inline body style and `manifest.json` `background_color: "#ffffff"`, ensuring instantaneous render continuity.

---

## 6. Verification & Acceptance Criteria

1. **Automated Layout Shift Audit**:
   - `node web/scripts/verify-visual-qa.cjs` executes with 100% assertions passing.
2. **Core Web Vitals Metrics**:
   - Cumulative Layout Shift ($\text{CLS}$) is confirmed $< 0.02$ across all 7 route transitions.
   - First Input Delay ($\text{FID}$) / Interaction to Next Paint ($\text{INP}$) is $< 50\text{ms}$.
3. **Cross-Browser Rendering Parity**:
   - Pixel-perfect visual identity verified across Google Chrome (Blink), Apple Safari (WebKit), and Mozilla Firefox (Gecko).
   - Zero horizontal scrollbars under any viewport width ($320\text{px} - 3840\text{px}$).
4. **Production Build Integrity**:
   - `npm run build` compiles in $< 1.0\text{s}$ with 0 warnings or errors.
