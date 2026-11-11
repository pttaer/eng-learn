# Task 3 Report: Streamlined Reading Pass 1 & Anti-Control Overload

**Status:** DONE  
**Date:** 2026-11-11  
**Author:** Implementer Subagent  
**Scope:** Pillar 01 - Reading Lab (`web/src/modules/reading-dossier.ts` & `web/src/assets/styles/dossiers.css`)

---

## 1. Summary of Changes

### A. Consolidated Header Controls & De-Cluttered Tiers (`reading-dossier.ts` & `dossiers.css`)
- **Before:** The top of Pass 1 rendered 7 separate vertically stacked layers before the article text:
  1. Reading mode bar (Intensive vs Extensive)
  2. Article selector tabs (`Art 01: ...` with full 80-char titles wrapping 2-3 lines)
  3. CEFR level chips (`LEVEL: A1 A2 B1 B2 C1 C2`)
  4. Monospace telemetry (`CEFR: B2 | SỐ TỪ: 286 | 2.0 MIN @ 140 WPM`)
  5. 4-Pass Stepper (`01 GIST SKIM -> 02 SKELETON -> 03 LEXICON -> 04 SYNTHESIS`)
  6. Pass 1 Skim card (tall vertical card with countdown + 2 full-width buttons ~110px)
  7. Mobile segmented subtabs (`Reading Text` | `Analysis & Exercises` ~68px)
  *Resulting in ~413px of chrome*, pushing the article title and content completely offscreen below the fold on mobile.
- **After:**
  - Grouped controls into a unified `.reading-control-bar` with two compact flex strips:
    - `.reading-controls-primary`: Combines the segmented mode switcher (`🔬 Intensive` / `📖 Extensive`) and article selector tabs (`.article-tabs`).
    - `.reading-controls-secondary`: Combines the CEFR level chips (`levelRowHtml`) and the unified meta strip (`.reading-meta-telemetry`).
  - On mobile (≤768px), `.article-tab` spans hide the lengthy article title and separator (`.art-sep, .art-title { display: none; }`), displaying clean, uniform pills: `[Art 01] [Art 02] [Art 03]`.

### B. Sleek Unified Metadata Strip
- Merged the CEFR badge, word count, and estimated reading time into a single inline pill strip:
  `[Art 01] [B2] • 286 SỐ TỪ • 2.0 MIN @ 140 WPM`
- Preserved all semantic `.telemetry-value` spans and accessibility hooks while reducing telemetry height from ~30px box down to an elegant 24px inline badge strip with `border-radius: var(--radius-pill, 9999px)`.

### C. 4-Pass Stepper Horizontal Pill Navigation
- Replaced the chunky arrow-delimited sequence (`.stepper-arrow`) with a sleek segmented pill bar (`border-radius: var(--radius-btn, 10px)`).
- Active pass displays in accent gold (`background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700;`).
- Completed passes display subtle checkmarks with subtle background tone shift.
- Retained full WAI-ARIA roving tabindex (`0` for active, `-1` for inactive), `role="tab"`, `aria-selected`, and keyboard ArrowRight/ArrowLeft/Home/End navigation.

### D. Compact Pass 1 Cold Read Skim Integration
- Re-architected `.skim-timer-bar` from a vertical multi-row card (~110px) into an integrated single-row bar (~40px) on mobile:
  - Left: compact countdown indicator (`⏱ 01:00` with `role="timer"` and `aria-live="polite"`).
  - Right: inline action controls (`[⏱ Start 60s Skim]` and `[🎯 Focus Headings]`).
- Adjusted `.reading-mobile-tab-bar` padding and spacing while strictly maintaining the mandatory touch target floor (`min-height: 44px`) on `.reading-mobile-tab-btn`.
- **Result:** Article title, source line, and opening paragraph are now immediately visible **above the fold** on mobile screens (iPhone SE 375×667 / 375×812, Vivo 360×803) without needing to scroll.

---

## 2. Verification Results

1. **Test Suite Verification:**
   - Command: `cd web; npm test`
   - Result: **PASS 91/91 verify scripts**
   - Roving tabindex, live regions, mobile split tabs, typography, and calm reading invariant scripts all passed 100%.

2. **Mobile Touch QA Verification:**
   - Script: `web/scripts/verify-mobile-touch-qa.cjs`
   - Tested Viewports:
     - iPhone SE / X (375×812, DPR: 2) -> PASS
     - iPhone 15 Pro (393×852, DPR: 3) -> PASS
     - Android Standard (360×800, DPR: 2) -> PASS
   - Zero horizontal overflow verified across all views.
   - All mobile touch targets ≥ 44×44px verified.

3. **Production Build:**
   - Command: `cd web; npm run build`
   - Result: Built in 2.56s without errors.

---

## 3. Files Modified
- [`web/src/modules/reading-dossier.ts`](file:///e:/Eng/web/src/modules/reading-dossier.ts)
- [`web/src/assets/styles/dossiers.css`](file:///e:/Eng/web/src/assets/styles/dossiers.css)
