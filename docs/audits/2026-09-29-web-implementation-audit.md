# Web Implementation Audit — Monochrome Sea-Urchin English Learning System
**Auditor:** Michael (`michael-mum0t4d1`)  
**Date:** 2026-09-29  
**Source Code:** `E:\Eng\web\`  
**Audited Against:**
- [`CLEAN_DESIGN_SYSTEM.md`](file:///E:/Eng/CLEAN_DESIGN_SYSTEM.md)
- [`2026-09-29-monochrome-sea-urchin-english-web-design.md`](file:///E:/Eng/docs/superpowers/specs/2026-09-29-monochrome-sea-urchin-english-web-design.md)

---

## Executive Summary

| Audit Axis | Verdict | Critical Issues | Total Findings |
| :--- | :---: | :---: | :---: |
| **1. Pure Binary Monochrome Integrity** | ⚠️ PARTIAL PASS | 3 | 9 |
| **2. Universal Atomic Card Standard** | ⚠️ PARTIAL PASS | 2 | 7 |
| **3. SM-2 Spaced Repetition** | ❌ FAIL | 2 | 6 |
| **4. Performance (60/120 FPS)** | ⚠️ PARTIAL PASS | 2 | 24 |

**Overall Verdict: CONDITIONAL PASS — 9 critical/high issues must be resolved before launch.**

---

## 1. Pure Binary Monochrome Integrity

> **Rule:** Strict `#FFFFFF` canvas and `#000000` ink with `rgba(0,0,0,0.10–0.15)` hairlines. Zero grays, zero chromatic bloom.

### 1.1 Violations Found: 9

| # | Severity | File | Line | Code | Violation |
|---|---|---|---|---|---|
| M1 | **HIGH** | [`dossiers.css`](file:///E:/Eng/web/src/assets/styles/dossiers.css#L158) | 158 | `background: #f8f8f8` | Forbidden gray on checked task items |
| M2 | **HIGH** | [`writing-dossier.ts`](file:///E:/Eng/web/src/modules/writing-dossier.ts#L114) | 114 | `background: #fafafa` | Forbidden gray on diff console |
| M3 | **HIGH** | [`speaking-dossier.ts`](file:///E:/Eng/web/src/modules/speaking-dossier.ts#L150) | 150 | `background: #fafafa` | Forbidden gray on prosody check block |
| M4 | MEDIUM | [`variables.css`](file:///E:/Eng/web/src/assets/styles/variables.css#L14) | 14 | `rgba(0,0,0,0.72)` | Alpha 0.72 exceeds design system's 0.10–0.15 hairline range (contextually used for secondary text — may be acceptable for readability, but not in spec) |
| M5 | LOW | [`dossiers.css`](file:///E:/Eng/web/src/assets/styles/dossiers.css#L272) | 272 | `rgba(255,255,255,0.92)` | Semi-transparent white on modal overlay — functionally needed for backdrop but not in approved tokens |
| M6 | LOW | [`perspective-canvas.ts`](file:///E:/Eng/web/src/core/perspective-canvas.ts#L522) | 522 | `rgba(255,255,255,0.8)` | Semi-transparent white for Vietnamese text in void lens |
| M7 | LOW | [`perspective-canvas.ts`](file:///E:/Eng/web/src/core/perspective-canvas.ts#L478) | 478 | `rgba(0,0,0,${sw.alpha})` | Shockwave alpha dynamically ranges 0.01–1.0, exceeds 0.50 cap |
| M8 | LOW | [`atomic-card.css`](file:///E:/Eng/web/src/assets/styles/atomic-card.css#L52) | 52 | `rgba(0,0,0,0.04)` | Box-shadow alpha 0.04 below 0.05 floor |
| M9 | LOW | [`dossiers.css`](file:///E:/Eng/web/src/assets/styles/dossiers.css#L133) | 133 | `rgba(0,0,0,0.04)` | Box-shadow alpha 0.04 below 0.05 floor |

### 1.2 Conformances
- All 14 remaining files (including `hud-base.css`, `sea-urchin.ts`, `atomic-card.ts`, `main.ts`, `storage.ts`) are fully monochrome-compliant.
- Canvas drawing in `sea-urchin.ts` uses strictly `#000000` and `#ffffff`.
- Design token palette in `variables.css` is correctly binary at its core.

### 1.3 Remediation
- **M1/M2/M3:** Replace `#f8f8f8` and `#fafafa` with `var(--bg-canvas)` (`#ffffff`). Use `border` or subtle `rgba(0,0,0,0.05)` background instead of gray for visual differentiation.
- **M4:** Either add `--ink-secondary` to the approved palette in `CLEAN_DESIGN_SYSTEM.md`, or replace with `rgba(0,0,0,0.45)` (the existing `--ink-muted`).
- **M5/M6/M7:** These are functionally motivated (overlay, void lens, shockwave animation). Consider adding a `CANVAS_RENDERING_EXCEPTION` clause to the design system for dynamic canvas alpha.

---

## 2. Universal Atomic Card Standard Consistency

> **Rule:** All 4 pillars must use identical card anatomy: Top Telemetry Header → Front Face → 180° 3D Y-Axis Flip → Back Face → Universal Bottom Dock [`✗`|`⟳`|`✓`].

### 2.1 Compliance Matrix

| Pillar | Shared Component? | 5 Sections? | Keyboard Shortcuts? | Standard Layout? |
| :--- | :---: | :---: | :---: | :---: |
| **Lexicon (Read)** | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Writing (Write)** | ✅ YES | ⚠️ PARTIAL | ✅ YES (textarea guard) | ❌ Bespoke textarea + diff |
| **Listening (Listen)** | ✅ YES | ⚠️ PARTIAL | ✅ YES (textarea guard) | ❌ Bespoke audio buttons + dictation |
| **Speaking (Speak)** | ✅ YES | ⚠️ PARTIAL | ✅ YES | ❌ Bespoke SVG timer + mic canvas |
| **Mission Log** | ❌ NO | ❌ 1/5 only | ❌ Partial | ❌ Completely bespoke |

### 2.2 Critical Issues

| # | Severity | Finding | Location |
|---|---|---|---|
| C1 | **CRITICAL** | **Card body click does not trigger flip.** Despite `cursor: pointer` on `.atomic-card-container`, no click listener exists on the card face/body. Only the dock button `[⟳ FLIP]` triggers flip. Spec says "click OR Space to flip." | [`atomic-card.ts`](file:///E:/Eng/web/src/core/atomic-card.ts#L133-L136) |
| C2 | **HIGH** | **Back Face telemetry header hardcoded.** All pillar backs show `[RESOLUTION // VIETNAMESE & IPA]` regardless of pillar. Incorrect for Writing, Listening, Speaking. Should be `[${pillar} // RESOLUTION]`. | [`atomic-card.ts:157`](file:///E:/Eng/web/src/core/atomic-card.ts#L157) |
| C3 | HIGH | **Mission Log does NOT use AtomicCard component.** Rolls entirely bespoke `.mission-card` with no flip, no bottom dock, no audio trigger. | [`mission-log.ts:89-130`](file:///E:/Eng/web/src/modules/mission-log.ts#L89-L130) |
| C4 | MEDIUM | **Writing, Listening, Speaking inject bespoke interactive widgets** (textarea, SVG timer, mic canvas) that break visual uniformity. These are pedagogically necessary but diverge from the spec's strict identical anatomy. | Various — see §2.1 |

### 2.3 Assessment
- **Lexicon** is the sole pillar that perfectly obeys the Universal Atomic Card Standard.
- The three active-production pillars (Writing, Listening, Speaking) necessarily diverge because their pedagogy demands interactive input (textarea, timer, microphone). This is a **spec-vs-reality tension** — the spec mandates identical anatomy, but the pedagogy requires specialized widgets. Recommend: acknowledge these as **sanctioned extensions** to the card standard, with the rule that they must live WITHIN the card face (front or back), never break the dock or header.
- Mission Log is a valid non-pillar habit tracker, but should still wrap in the card standard for visual consistency.

---

## 3. SM-2 Spaced Repetition — Mathematical Correctness

> **Rule:** Native SM-2 with correct formulas, `STARK_ENG_STATE` localStorage key, batch-20 queue on launch.

### 3.1 Critical Defects

| # | Severity | Finding | Location |
|---|---|---|---|
| S1 | **CRITICAL** | **EF inflation bug.** On `'good'` rating (grade=4), line 83 adds `+0.1` to `easeFactor`. SM-2 formula: `ΔEF = 0.1 − (5−q)(0.08 + (5−q)×0.02)`. For q=4: `ΔEF = 0.1 − 0.1 = 0`. **EF should remain UNCHANGED**, but code inflates it `2.5 → 2.6 → 2.7 → ...`, causing compounding interval over-expansion. | [`srs-engine.ts:83`](file:///E:/Eng/web/src/core/srs-engine.ts#L83) |
| S2 | **CRITICAL** | **`getDueCards()` is never called.** The engine has a correct `getDueCards(deck, states, limit=20)` method, but NO dossier calls it. Lexicon loads all 1,000 items raw. Writing loads all 30. No daily batch of 20 is ever constructed. The SRS queue is architecturally dead code. | [`srs-engine.ts:93-116`](file:///E:/Eng/web/src/core/srs-engine.ts#L93-L116), all dossier `render()` methods |
| S3 | HIGH | **Verify script validates the bug.** `verify-srs.cjs` asserts `easeFactor === 2.6` after first good rating — this is testing the _incorrect_ behavior as correct. | [`verify-srs.cjs:52`](file:///E:/Eng/web/scripts/verify-srs.cjs#L52) |
| S4 | MEDIUM | **Storage schema diverges from spec.** Key `STARK_ENG_STATE` conforms ✅. But: `srsCards` → renamed `cardStates`; `lastCompletedDate` → nested as `streak.lastActiveDate`; `completedHabitDays` → restructured as `habitProgress`; `absorbedArtifacts` → **completely missing**. | [`storage.ts:3-19`](file:///E:/Eng/web/src/utils/storage.ts#L3-L19) |
| S5 | MEDIUM | **getDueCards sort comment lies.** Comment says "most overdue first, unseen next" but unseen cards get `dueA = 0`, sorting them BEFORE overdue items (0 < positive timestamps). | [`srs-engine.ts:106-112`](file:///E:/Eng/web/src/core/srs-engine.ts#L106-L112) |
| S6 | LOW | **Millisecond-offset due dates.** Using `Date.now() + interval * 86400000ms` means a card reviewed at 23:30 isn't due until 23:30 next day. Morning sessions skip due cards. Should normalize to midnight. | [`srs-engine.ts:71,84`](file:///E:/Eng/web/src/core/srs-engine.ts#L71) |

### 3.2 Conformances
- ✅ Interval sequence: `I(1)=1, I(2)=6, I(n>2)=round(I(n-1)×EF)` — correct.
- ✅ Again formula: `n=0, interval=1, EF=max(1.3, EF−0.2)` — correct.
- ✅ EF floor clamp at 1.3 — correct.
- ✅ Zero external Anki dependencies — `package.json` contains only `animejs`, `typescript`, `vite`.

### 3.3 Remediation
- **S1:** Change line 83 to: `// Grade 4: EF unchanged (ΔEF = 0)` — remove the `+0.1` entirely.
- **S2:** Each dossier's `render()` should call `SRSEngine.getDueCards(deck, StorageManager.loadState().cardStates, 20)` instead of loading raw full arrays.
- **S3:** Update `verify-srs.cjs` to assert `easeFactor === 2.5` (unchanged) after good ratings.

---

## 4. Performance — 60/120 FPS Budget

### 4.1 Composite-Only Rule (8 violations)

All `transition: all` declarations and explicit `background`/`color`/`border`/`width`/`height` transitions violate the composite-only mandate.

| # | File | Line | Violation |
|---|---|---|---|
| P1 | [`hud-base.css`](file:///E:/Eng/web/src/assets/styles/hud-base.css#L159) | 159 | Transitions `background`, `color` on `.hud-btn` |
| P2 | [`hud-base.css`](file:///E:/Eng/web/src/assets/styles/hud-base.css#L231) | 231 | Transitions `width`, `height` on `#custom-cursor` |
| P3-P4 | [`atomic-card.css`](file:///E:/Eng/web/src/assets/styles/atomic-card.css#L121) | 121, 195 | `transition: all` on `.card-audio-btn`, `.dock-btn` |
| P5-P8 | [`dossiers.css`](file:///E:/Eng/web/src/assets/styles/dossiers.css) | 54, 109, 150, 248 | `transition: all` or `transition: border` on search input, day chips, task items, menu items |

**Fix:** Replace all `transition: all` with explicit `transition: transform Xms, opacity Xms`. For buttons that need visual state changes on hover, use `::after` pseudo-element with `opacity` transition overlaying the inverted color.

### 4.2 RAF-Gated Cursor (1 violation)

| # | File | Line | Violation |
|---|---|---|---|
| P9 | [`cursor-tracker.ts`](file:///E:/Eng/web/src/core/cursor-tracker.ts#L41-L58) | 41–58 | `pointermove` handler runs 6× `closest()` DOM queries + class mutations on every raw pointer event (up to 1000Hz). Must defer target-lock detection into the existing RAF loop. |

**Conformance:** `atomic-card.ts` lines 224–240 correctly gates parallax tilt via `cancelAnimationFrame`/`requestAnimationFrame`.

### 4.3 Canvas Loop Cleanup (3 violations)

| # | File | Line | Issue |
|---|---|---|---|
| P10 | [`perspective-canvas.ts`](file:///E:/Eng/web/src/core/perspective-canvas.ts#L273-L280) | 273–280 | RAF loop stores no handle; no `cancelAnimationFrame` cleanup on unmount |
| P11 | [`corner-compass.ts`](file:///E:/Eng/web/src/modules/corner-compass.ts#L97-L104) | 97–104 | Mini-urchin RAF loop runs forever with no cleanup |
| P12 | [`speaking-dossier.ts`](file:///E:/Eng/web/src/modules/speaking-dossier.ts#L332) | 332 | Waveform RAF saves handle but no `destroy()` lifecycle method |

### 4.4 Reduced Motion (5 violations — SYSTEMIC)

CSS `@media (prefers-reduced-motion: reduce)` exists in [`hud-base.css:297-303`](file:///E:/Eng/web/src/assets/styles/hud-base.css#L297-L303) ✅, but **zero TypeScript files** check `window.matchMedia('(prefers-reduced-motion: reduce)')`.

All of the following run uninhibited regardless of user preference:
- Canvas particles/entities drifting and rotating (`perspective-canvas.ts`)
- Sea urchin spine magnetic tracking and pulse phase (`sea-urchin.ts`)
- 3D parallax gyro tilt on cards (`atomic-card.ts`)
- Mini-urchin continuous spin (`corner-compass.ts`)
- Cursor reticle trailing lag (`cursor-tracker.ts`)

**Fix:** Add a global `const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;` in `main.ts` and pass it to all core modules. When true: skip canvas entity animation, set spine deflection to 0, disable parallax tilt, set cursor lerp to 1.0 (instant).

### 4.5 AudioContext Lazy Init (1 violation)

| # | File | Line | Issue |
|---|---|---|---|
| P13 | [`speaking-dossier.ts`](file:///E:/Eng/web/src/modules/speaking-dossier.ts#L280-L293) | 280–293 | Creates `new AudioContext()` and calls `getUserMedia({ audio: true })` on component render without user gesture. Violates browser autoplay policy. |

**Conformance:** `AudioSynthesizer.init()` correctly lazy-inits via user gesture listeners ✅.

### 4.6 Universal Timing (7 violations)

| Issue | Detail |
|---|---|
| `--duration-micro: 120ms` | Below the 180ms floor. Used in 9+ places across all CSS files. |
| `.atomic-card-inner` flip: `0.5s` | Above the 280ms ceiling. Card flip should be 260–280ms max. |

**Fix:** Change `--duration-micro` to `180ms`. Change card flip to `280ms` or `var(--duration-normal)` (260ms).

---

## Prioritized Remediation Roadmap

### 🔴 Critical (Must Fix Before Launch)

1. **S1:** Fix SM-2 EF inflation — remove `+0.1` on good rating ([`srs-engine.ts:83`](file:///E:/Eng/web/src/core/srs-engine.ts#L83))
2. **S2:** Wire `getDueCards()` into all dossiers — implement the batch-20 SRS queue
3. **C1:** Add click-to-flip on card body — wire click listener on `.atomic-card-container`

### 🟠 High (Should Fix)

4. **M1/M2/M3:** Purge all gray values (`#f8f8f8`, `#fafafa`) → replace with `#ffffff`
5. **C2:** Make back-face telemetry header dynamic — pass `pillar` to back header label
6. **S3:** Fix `verify-srs.cjs` to validate correct SM-2 behavior
7. **P9:** Defer cursor target-lock detection into RAF loop
8. **Reduced Motion (P14):** Add JS `matchMedia` check for all canvas/parallax/cursor animations

### 🟡 Medium (Recommended)

9. **C3:** Wrap Mission Log in AtomicCard component (or document as sanctioned exception)
10. **P10-P12:** Add `cancelAnimationFrame` cleanup / `destroy()` lifecycle to all RAF loops
11. **P1-P8:** Replace `transition: all` / non-composite transitions with `transform`+`opacity` only
12. **S4:** Align storage schema field names with spec
13. **S5:** Fix `getDueCards` sort: unseen cards should use `Infinity`, not `0`
14. **Timing:** Change `--duration-micro` to `180ms`, card flip to `280ms`

### 🟢 Low (Nice to Have)

15. **M4-M9:** Tighten alpha ranges, add canvas rendering exception to design system
16. **S6:** Normalize due dates to midnight for consistent daily scheduling
17. **P13:** Defer `speaking-dossier.ts` mic access to explicit user gesture (START button)
18. **C4:** Document pillar-specific card extensions as sanctioned deviations

---

## Architecture & Scaffolding Conformances ✅

| Criterion | Status |
|---|---|
| Vite + TypeScript + Vanilla DOM | ✅ Correct stack |
| `prebuild` script wired in `package.json` | ✅ `"prebuild": "node scripts/parse-curriculum.cjs"` |
| JSON data files generated from curriculum | ✅ 4 JSON files totaling ~268KB |
| Router with hash-based navigation | ✅ `router.ts` with `RouteId` enum |
| 2 fonts maximum (Inter + JetBrains Mono) | ✅ Strictly enforced |
| 8pt spatial grid | ✅ Token scale defined in `variables.css` |
| Keyboard shortcuts (Esc, Ctrl+K, Space, 1/2, ←/→) | ✅ All wired in `main.ts` and dossiers |
| Zero external runtime dependencies | ✅ Only build-time deps (vite, typescript, animejs) |
| `STARK_ENG_STATE` localStorage key | ✅ Correct key |

---

*End of Audit Report.*
*Auditor: Michael (`michael-mum0t4d1`) — 2026-09-29*
