# Task 5 Completion Report: Lexicon Detail Drawer Mobile Clearance & Backdrop

**Status:** DONE  
**Date:** 2026-11-11  

---

## 1. Summary of Work

Resolved the issue in the Universal Lexicon Detail Drawer where the secondary 'Đóng' (Close) button was cut off at the bottom on mobile screens, and ensured the modal backdrop blur and stacking order strictly adhere to **Invariant 17** (Universal Popup & Modal Backdrop Blur).

---

## 2. Changes Applied

### A. `web/src/assets/styles/dossiers.css`
1. **Z-Index Layering & Backdrop Blur (Invariant 17 & Invariant 8):**
   - Elevated `.lexicon-drawer` to `z-index: var(--z-modal, 1200);` across desktop and mobile, ensuring it hovers comfortably above the fixed mobile bottom navigation bar (`.hud-bottom-nav`, z-index 1000).
   - Elevated `.lexicon-drawer-backdrop` to `z-index: calc(var(--z-modal, 1200) - 1);` (1199), completely dimming background elements including the bottom navigation bar.
   - Enforced `background: var(--modal-backdrop, rgba(5, 7, 13, 0.78)) !important;`, `backdrop-filter: blur(12px) !important;`, and `-webkit-backdrop-filter: blur(12px) !important;`.
2. **Mobile Viewport Clearance & Anti-Cutoff Sizing:**
   - Updated `.lexicon-drawer-footer` under `@media (max-width: 768px)` to declare:
     ```css
     padding: 12px 16px max(16px, env(safe-area-inset-bottom)) !important;
     flex-shrink: 0;
     ```
     guaranteeing the secondary close button (`#lexicon-bottom-close`) is 100% visible and well clear of the screen edge and mobile gesture bar.
   - Adjusted `.lexicon-drawer-body` max-height to:
     ```css
     max-height: calc(min(78vh, 78dvh) - 170px);
     ```
     preventing content body expansion from shoving the footer off-screen.
   - Added `flex-shrink: 0;` on `.lexicon-drawer-header`.
3. **Accessibility Focus Ring:**
   - Added `.btn-lexicon-bottom-close:focus-visible` to the coaxial dual-layer focus ring rule (`outline: 2px solid #000000; box-shadow: 0 0 0 5px #ffffff;`).

### B. `web/src/modules/lexicon-drawer.ts`
1. **Clean Localization & Typography:**
   - Standardized button labels to use localized strings:
     - `+ ${t('lexicon.bookmark_srs', undefined, 'Add to SRS Deck')}`
     - `✓ ${t('lexicon.in_srs', undefined, 'In SRS Deck')}`
     - `${t('common.close', undefined, 'Close')}` (renders as 'Đóng' in Vietnamese, 'Close' in English).
2. **Touch Target Standard:**
   - Maintained ≥44px tap floor and `--radius-btn: 10px` consistency.

---

## 3. Verification

- Executed `npm --prefix web run build:fast`:
  - 205 modules transformed and compiled with zero errors in 2.25s.
