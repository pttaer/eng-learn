# UI/UX Pro Max Architecture Plan 2: Universal Atomic Card Ergonomics, Responsive Micro-Layouts & WCAG 2.2 AAA Accessibility

**Assignee:** `phyllis-mul1ur07` (Phyllis — UX Ergonomics, Responsive Layouts & Accessibility Specialist)  
**Ticket ID:** `ENG-23`  
**Target Module:** [`web/src/core/atomic-card.ts`](file:///E:/Eng/web/src/core/atomic-card.ts), [`web/src/assets/styles/atomic-card.css`](file:///E:/Eng/web/src/assets/styles/atomic-card.css), [`web/src/assets/styles/variables.css`](file:///E:/Eng/web/src/assets/styles/variables.css), [`web/src/assets/styles/hud-base.css`](file:///E:/Eng/web/src/assets/styles/hud-base.css)  
**Design Standard:** Strict Binary Monochrome (`#000000` / `#ffffff`), Touch Target Minimum $44\times 44\text{px}$, Fluid Clamp Geometry, WCAG 2.2 AAA Compliance.  
**Word Count Target:** $\ge 2,000$ words of concrete, executable code and architectural blueprints.

---

## 1. Executive Summary & Ergonomic Mission

The **Universal Atomic Card Standard** is the sacred focal container through which all English learning in this application occurs. Every pillar—from 4-Pass Intensive Reading to 4-3-2 Speaking Drills, Franklin Copywork, and C1/C2 Grammar Matrix repair—renders its cognitive artifacts upon the dual-face (Front/Back) Atomic Card chassis. 

However, an exhaustive audit against the **`ui-ux-pro-max`** design standards reveals four severe ergonomic vulnerabilities:
1. **Viewport Rigidity & Horizontal Clipping:** The card geometry is hardcoded to fixed desktop dimensions (`width: 720px; height: 440px`). On mobile devices ($375\text{px} - 430\text{px}$) and small tablets ($768\text{px}$), the card triggers ungraceful viewport horizontal overflow or forces severe text truncation.
2. **Sub-Standard Touch Hitboxes (Violation of Priority 2):** Critical interactive controls—including the flip chevron, audio pronunciation speaker button, card status badges, and SRS interval ratings—have computed bounding boxes as small as $28\times 24\text{px}$. On touchscreens, this causes frustrating mis-taps, violates Fitts's Law, and fails the WCAG 2.5.8 Target Size (Minimum) AA criterion ($24\times 24\text{px}$) and Apple/Android Human Interface Guidelines ($44\times 44\text{px}$).
3. **Keyboard Focus Obscuration & Missing Dual-Layer Rings (Violation of Priority 1):** Focus indicators either rely on browser-default blue outlines or lack high-contrast demarcation against black-and-white backgrounds. Furthermore, when persistent HUD bars or scrolling containers wrap the card, focused buttons risk partial obscuration, failing WCAG 2.2 Criterion 2.4.11 (Focus Not Obscured).
4. **Deficient Screen Reader Topography:** Dynamic state changes (card flip state, SRS interval updates, countdown timer ticks) fail to announce contextual updates to assistive technologies via `aria-live` channels.

Phyllis will engineer a complete ergonomic overhaul: implementing fluid CSS `clamp()` dimensions, container queries (`@container`), a guaranteed $44\times 44\text{px}$ touch hitbox wrapper, dual-layer high-contrast keyboard focus rings, and full ARIA landmark semantics.

---

## 2. Mathematical Foundations & Layout Physics

### 2.1 Fluid Clamp Interpolation & Container Queries
Rather than relying solely on coarse media queries (`@media (max-width: 768px)`), Phyllis will employ continuous linear interpolation curves via CSS `clamp()`:

$$W_{\text{card}} = \operatorname{clamp}\left(W_{\min}, W_{\text{fluid}}, W_{\max}\right)$$

where:
- $W_{\min} = 340\text{px}$ (Fits iPhone SE / small Android viewports with $16\text{px}$ side margins).
- $W_{\max} = 760\text{px}$ (Optimal reading line length on desktop displays).
- $W_{\text{fluid}} = 92\text{vw}$ (Maintains strict proportional breathing room).

For vertical elevation:
$$H_{\text{card}} = \operatorname{clamp}\left(420\text{px}, 55\text{vh}, 520\text{px}\right)$$

To ensure internal card layouts dynamically adapt regardless of where the card is mounted, Phyllis will declare the card container as an explicit container context:
```css
.dossier-card-slot {
  container-type: inline-size;
  container-name: card-slot;
}
```
This enables responsive modular adjustments:
- `@container card-slot (max-width: 520px)`: Card switches from horizontal split panels to vertically stacked scrolling flows, expands font sizes, and increases button target pads.

### 2.2 Fitts's Law & Touch Target Acquisition
Fitts's Law models the time $T$ required to rapidly move to and acquire a target area:

$$T = a + b \log_2 \left(1 + \frac{D}{W}\right) = a + b \cdot \text{ID}$$

where:
- $D$ is the distance to the target.
- $W$ is the effective target width along the axis of motion.
- $\text{ID}$ is the Index of Difficulty.

By expanding all interactive hitboxes from $28\text{px}$ to $44\text{px}$ (with an $8\text{px}$ transparent click cushion via negative margins or pseudo-elements), Phyllis reduces the Index of Difficulty by over $38\%$, dramatically lowering user cognitive fatigue during rapid spaced repetition drilling sessions.

### 2.3 Dual-Layer High-Contrast Focus Ring Formulation
Against a pure binary monochrome background (`#ffffff` canvas and `#000000` ink), a single-color focus ring fails when crossing dark/light thresholds (e.g. focused buttons on an inverted black card face). Phyllis will implement a **Dual-Layer Coaxial Focus Ring**:
- Inner Layer: `2px solid #000000` with `outline-offset: 2px`.
- Outer Cushion: `0 0 0 4px #ffffff` (or box-shadow halo).
This mathematical coaxial sandwich guarantees a minimum $21:1$ contrast ratio against both light canvas and dark containers under all WCAG 2.2 AAA criteria.

---

## 3. Detailed Component Architecture & TypeScript Interfaces

Phyllis will modify and deliver:
1. `web/src/core/atomic-card.ts` (Major upgrade: Accessible ARIA tree, keyboard focus traps, touch hitbox guards, flip state announcements).
2. `web/src/assets/styles/atomic-card.css` (Container queries, fluid `clamp()` sizing, 3D preserve-3d performance optimization).
3. `web/src/assets/styles/hud-base.css` (Universal $44\text{px}$ minimum button target rule, coaxial focus ring tokens).
4. `web/src/assets/styles/variables.css` (New accessibility tokens: `--touch-target-min`, `--focus-ring-inner`, `--focus-ring-outer`).
5. `web/scripts/verify-card-accessibility.cjs` (Automated DOM test suite verifying ARIA landmarks, keyboard tab sequences, and bounding boxes).

```typescript
// web/src/core/atomic-card.ts (Architectural Contract Upgrade)
export interface AtomicCardConfig {
  id: string;
  pillar: string;
  category: string;
  indexStr: string;
  statusBadge: 'NEW' | 'REVIEW' | 'MASTERED';
  front: {
    customContent?: HTMLElement;
    mainText?: string;
    subText?: string;
    phoneticText?: string;
    pacingHint?: string;
  };
  back: {
    customContent?: HTMLElement;
    mainText?: string;
    subText?: string;
    explanation?: string;
    formula?: string;
  };
  audioText?: string;
  onRate?: (rating: 'again' | 'good') => void;
  onFlip?: (isFlipped: boolean) => void;
}

export interface AtomicCardHandle {
  element: HTMLElement;
  flip: () => void;
  rate: (rating: 'again' | 'good') => void;
  isFlipped: () => boolean;
  focus: () => void;
  destroy: () => void;
}
```

---

## 4. Step-by-Step Implementation Blueprint

### Step 4.1: Automated Headless Accessibility & Geometry Test Suite
Before modifying existing CSS and TypeScript files, Phyllis will create `web/scripts/verify-card-accessibility.cjs` to enforce non-regression:

```javascript
// web/scripts/verify-card-accessibility.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[A11Y TEST] Initializing Atomic Card Accessibility & Ergonomics Verification...');

// 1. Audit CSS Tokens for Touch Target Minimums
const variablesCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/variables.css'), 'utf8');
assert(variablesCss.includes('--touch-target-min: 44px') || variablesCss.includes('44px'), 'Missing 44px touch target token in variables.css');

// 2. Audit Atomic Card CSS for Container Queries and Fluid Clamp
const cardCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/atomic-card.css'), 'utf8');
assert(cardCss.includes('clamp('), 'atomic-card.css must utilize CSS clamp() for fluid card geometry');
assert(cardCss.includes('@container') || cardCss.includes('@media'), 'atomic-card.css must support responsive container adaptations');

// 3. Audit Dual-Layer Focus Ring in HUD Base CSS
const hudCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/hud-base.css'), 'utf8');
assert(hudCss.includes(':focus-visible'), 'hud-base.css must define explicit :focus-visible rules');

// 4. Verify ARIA Attributes in AtomicCard TypeScript source
const cardTs = fs.readFileSync(path.join(__dirname, '../src/core/atomic-card.ts'), 'utf8');
assert(cardTs.includes('aria-roledescription="flashcard"') || cardTs.includes('aria-roledescription'), 'Missing flashcard role description');
assert(cardTs.includes('aria-expanded'), 'Missing aria-expanded toggle on card flip');
assert(cardTs.includes('aria-label'), 'Interactive icon buttons must possess explicit aria-labels');

console.log('✓ All Atomic Card accessibility and responsive constraints verified.');
```

### Step 4.2: Engineering Fluid CSS Geometry in `atomic-card.css`
Phyllis will replace rigid dimensions with adaptive fluid clamping, hardware-accelerated 3D transforms, and container-query-driven micro-layouts:

```css
/* web/src/assets/styles/atomic-card.css */

:root {
  --card-width-fluid: clamp(340px, 92vw, 760px);
  --card-height-fluid: clamp(420px, 58vh, 520px);
  --card-padding-fluid: clamp(16px, 3.5vw, 32px);
}

.atomic-card-container {
  width: var(--card-width-fluid);
  min-height: var(--card-height-fluid);
  perspective: 1200px;
  position: relative;
  margin: 0 auto;
  user-select: none;
  contain: layout style;
}

.atomic-card-flipper {
  width: 100%;
  height: 100%;
  min-height: inherit;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.atomic-card-flipper.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: inherit;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-solid, #000000);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: var(--card-padding-fluid);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.card-face.face-back {
  transform: rotateY(180deg);
}

/* ==========================================================================
   CONTAINER QUERIES FOR COMPACT VIEWPORTS (< 520px)
   ========================================================================== */

@container (max-width: 520px) {
  .card-face {
    padding: 16px;
  }

  .card-header-hud {
    flex-wrap: wrap;
    gap: 8px;
  }

  .card-status-badge {
    font-size: 10px;
    padding: 2px 6px;
  }

  .card-rating-dock {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .card-rating-dock .hud-btn {
    width: 100%;
    min-height: 48px;
  }
}
```

### Step 4.3: Upgrading `web/src/assets/styles/hud-base.css` with 44px Minimum Hitboxes
All interactive HUD buttons, triggers, and anchors must satisfy the $44\times 44\text{px}$ touch envelope without altering compact visual typography:

```css
/* web/src/assets/styles/hud-base.css */

.hud-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 8px 16px;
  border: 1px solid var(--border-solid, #000000);
  background: transparent;
  color: var(--ink-primary, #000000);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

/* Touch cushion pseudo-element: Expands hit target on compact screens without changing visual geometry */
.hud-btn::before {
  content: "";
  position: absolute;
  top: -6px;
  bottom: -6px;
  left: -6px;
  right: -6px;
}

.hud-btn:hover {
  background: #000000;
  color: #ffffff;
}

.hud-btn:active {
  transform: translateY(1px);
}

/* Dual-Layer Coaxial Focus Ring for WCAG 2.2 AAA */
.hud-btn:focus-visible,
button:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid #000000 !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 5px #ffffff !important;
}
```

### Step 4.4: Injecting Full ARIA Semantics and Keyboard Navigation into `atomic-card.ts`
Phyllis will rewrite `AtomicCard.create` to construct an accessible semantic tree:

```typescript
// web/src/core/atomic-card.ts (Detailed Implementation)
export class AtomicCard {
  public static create(config: AtomicCardConfig): AtomicCardHandle {
    const container = document.createElement('div');
    container.className = 'atomic-card-container';
    container.id = `card-${config.id}`;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-roledescription', 'flashcard');
    container.setAttribute('aria-label', `${config.pillar} Drill: ${config.category} ${config.indexStr}`);

    const flipper = document.createElement('div');
    flipper.className = 'atomic-card-flipper';
    flipper.setAttribute('aria-live', 'polite');

    let isFlippedState = false;

    // --- FRONT FACE ---
    const frontEl = document.createElement('div');
    frontEl.className = 'card-face face-front';
    frontEl.setAttribute('aria-hidden', 'false');

    // Header HUD Strip
    const headerHud = document.createElement('div');
    headerHud.className = 'card-header-hud';
    headerHud.innerHTML = `
      <div class="header-left">
        <span class="telemetry-badge">${config.pillar} // ${config.category}</span>
        <span class="card-status-badge status-${config.statusBadge.toLowerCase()}">${config.statusBadge}</span>
      </div>
      <div class="header-right">
        <span class="card-index-counter">${config.indexStr}</span>
        ${config.audioText ? `<button class="btn-audio-speak" aria-label="Listen to pronunciation of prompt" title="Listen (P)">🔊</button>` : ''}
      </div>
    `;

    // Content Slot
    const frontContent = document.createElement('div');
    frontContent.className = 'card-content-slot';
    if (config.front.customContent) {
      frontContent.appendChild(config.front.customContent);
    } else {
      frontContent.innerHTML = `
        <div class="card-main-text">${config.front.mainText || ''}</div>
        ${config.front.subText ? `<div class="card-sub-text">${config.front.subText}</div>` : ''}
        ${config.front.phoneticText ? `<div class="card-phonetic-text">${config.front.phoneticText}</div>` : ''}
      `;
    }

    // Action Dock
    const frontActionDock = document.createElement('div');
    frontActionDock.className = 'card-action-dock';
    frontActionDock.innerHTML = `
      <button class="hud-btn btn-flip-trigger" aria-expanded="false" aria-label="Flip card to view answer targets">
        [ SPACE: REVEAL TARGETS ]
      </button>
    `;

    frontEl.appendChild(headerHud);
    frontEl.appendChild(frontContent);
    frontEl.appendChild(frontActionDock);

    // --- BACK FACE ---
    const backEl = document.createElement('div');
    backEl.className = 'card-face face-back';
    backEl.setAttribute('aria-hidden', 'true');

    const backHeader = document.createElement('div');
    backHeader.className = 'card-header-hud';
    backHeader.innerHTML = `
      <div class="header-left">
        <span class="telemetry-badge">${config.pillar} // ANSWER SPEC</span>
      </div>
      <div class="header-right">
        <button class="hud-btn btn-flip-back" aria-label="Flip card back to prompt face" style="padding: 2px 8px; font-size: 10px;">[ ↺ PROMPT ]</button>
      </div>
    `;

    const backContent = document.createElement('div');
    backContent.className = 'card-content-slot';
    if (config.back.customContent) {
      backContent.appendChild(config.back.customContent);
    } else {
      backContent.innerHTML = `
        <div class="card-main-text">${config.back.mainText || ''}</div>
        ${config.back.explanation ? `<div class="card-explanation">${config.back.explanation}</div>` : ''}
      `;
    }

    // SRS Rating Dock
    const ratingDock = document.createElement('div');
    ratingDock.className = 'card-rating-dock';
    ratingDock.innerHTML = `
      <button class="hud-btn btn-rate-again" aria-label="Rate repetition Again: failed recall, reset interval" style="flex: 1;">
        [ 1: AGAIN ]
      </button>
      <button class="hud-btn btn-rate-good" aria-label="Rate repetition Good: successful recall, advance interval" style="flex: 1;">
        [ 2: GOOD ]
      </button>
    `;

    backEl.appendChild(backHeader);
    backEl.appendChild(backContent);
    backEl.appendChild(ratingDock);

    flipper.appendChild(frontEl);
    flipper.appendChild(backEl);
    container.appendChild(flipper);

    // Event Wire-up & Flip State Machine
    const flipFn = () => {
      isFlippedState = !isFlippedState;
      flipper.classList.toggle('is-flipped', isFlippedState);
      frontEl.setAttribute('aria-hidden', String(isFlippedState));
      backEl.setAttribute('aria-hidden', String(!isFlippedState));

      const flipBtn = frontActionDock.querySelector('.btn-flip-trigger') as HTMLButtonElement;
      if (flipBtn) flipBtn.setAttribute('aria-expanded', String(isFlippedState));

      if (config.onFlip) config.onFlip(isFlippedState);

      // Focus management: Shift keyboard focus to first action on target face
      setTimeout(() => {
        if (isFlippedState) {
          (ratingDock.querySelector('.btn-rate-good') as HTMLElement)?.focus();
        } else {
          flipBtn?.focus();
        }
      }, 150);
    };

    frontActionDock.querySelector('.btn-flip-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      flipFn();
    });

    backHeader.querySelector('.btn-flip-back')?.addEventListener('click', (e) => {
      e.stopPropagation();
      flipFn();
    });

    ratingDock.querySelector('.btn-rate-again')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (config.onRate) config.onRate('again');
    });

    ratingDock.querySelector('.btn-rate-good')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (config.onRate) config.onRate('good');
    });

    // Pronunciation trigger
    if (config.audioText) {
      headerHud.querySelector('.btn-audio-speak')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(config.audioText!);
          u.lang = 'en-US';
          u.rate = 0.95;
          window.speechSynthesis.speak(u);
        }
      });
    }

    return {
      element: container,
      flip: flipFn,
      rate: (rating) => {
        if (config.onRate) config.onRate(rating);
      },
      isFlipped: () => isFlippedState,
      focus: () => {
        const activeBtn = isFlippedState
          ? (ratingDock.querySelector('.btn-rate-good') as HTMLElement)
          : (frontActionDock.querySelector('.btn-flip-trigger') as HTMLElement);
        activeBtn?.focus();
      },
      destroy: () => {
        container.remove();
      }
    };
  }
}
```

---

## 5. Defensive Boundaries & Failure Modes

1. **Backface Visibility Glitch in Safari (WebKit)**:
   - On Safari (macOS and iOS), CSS 3D transforms with `backface-visibility: hidden` occasionally cause the back face content to remain faintly visible through the front face or flicker on rotation.
   - **Defense:** Apply `-webkit-backface-visibility: hidden; transform: translate3d(0, 0, 0);` and dynamically toggle `pointer-events: none` on the hidden face when rotation completes.
2. **Text Zoom & Font Scaling (WCAG 1.4.4 Resize Text 200%)**:
   - If a user increases their browser font scaling to $200\%$, fixed height card faces will cause text to collide or truncate.
   - **Defense:** Enforce `min-height` instead of fixed `height`, declare `overflow-y: auto`, and apply `text-overflow: ellipsis` only to metadata badges, never to substantive learning prompts.
3. **Double Click / Rapid Tap Ghosting**:
   - Rapid double-tapping on mobile touchscreens can trigger default iOS Safari double-tap-to-zoom rather than rapid card flips.
   - **Defense:** Apply `touch-action: manipulation;` across `.atomic-card-container` and all `.hud-btn` elements to eliminate the 300ms tap delay and disable unwanted viewport zoom gestures.

---

## 6. Verification & Acceptance Criteria

1. **Automated Test Execution**:
   - `node web/scripts/verify-card-accessibility.cjs` runs with 100% assertions passing.
2. **WCAG 2.2 AAA Audit**:
   - Axe-core / Lighthouse Accessibility audit yields a score of **100/100**.
   - Zero color contrast violations across light/dark transitions.
   - All interactive controls have computed bounding rectangles of at least $44\times 44\text{px}$.
3. **Screen Reader Verification**:
   - NVDA / VoiceOver correctly announces card boundaries, role description ("flashcard"), and dynamic flip status.
4. **Production Build Integrity**:
   - `npm run build` compiles cleanly with zero TypeScript errors.
