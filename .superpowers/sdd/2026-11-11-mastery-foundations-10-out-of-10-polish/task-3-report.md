# Task 3 Completion Report: Grammar Codex & Syntax Inversion Clean-up

**Status:** COMPLETED (10/10 Polish Achieved)  
**Date:** 2026-11-11  
**Target Files:**
- `web/src/assets/styles/dossiers.css`
- `web/src/modules/grammar-dossier.ts`
- `web/src/core/i18n.ts`

---

## 1. Objectives Delivered

### 1. Compact Sleek Telemetry HUD on Mobile (`dossiers.css`)
- Under `@media (max-width: 768px)`, `.dossier-grammar .vocab-telemetry-banner` was previously stacking 3 verbose blocks vertically, occupying ~110px of vertical space before the question card.
- Implemented a compact single/2-line HUD with:
  - `flex-direction: row !important; justify-content: space-between !important;`
  - Compact padding `8px 12px !important; margin-bottom: 10px !important; gap: 8px !important;`
  - Equal item distribution `flex: 1 1 0 !important; min-width: 0 !important;` with column alignment and `gap: 2px !important;`
  - Defensive typography: `telemetry-label` at `10px` (`letter-spacing: 0.04em`, `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`), and `telemetry-value` at `12px` bold.
- Reduced overall vertical footprint from **~110px down to ~38-42px**, making the syntax exercise card immediately visible without requiring excessive scrolling.

### 2. Primary SRS Flip Reveal vs. Optional Typing Challenge Clarification (`grammar-dossier.ts` & `i18n.ts`)
- Clarified the transformation input label:
  - Vietnamese: `[ Ô NHẬP BIẾN ĐỔI CÚ PHÁP (TÙY CHỌN TRƯỚC KHI LẬT) ]:`
  - English: `[ SYNTACTIC TRANSFORMATION (OPTIONAL BEFORE FLIP) ]:`
- Promoted `Lật xem đáp án` (`Flip Reveal`) as the primary confident CTA by setting `hideFrontRating: true` in `AtomicCard.create`:
  - Eliminates premature `Again`/`Good` buttons on the front face.
  - Dedicates the bottom dock on the front face to a full-width, prominent `Lật xem đáp án` button with gold accent styling.
  - SRS rating buttons (`Again`, `Good`) are revealed cleanly on the back face once the card is flipped.

### 3. Design System Invariants & Coaxial Focus-Ring Spacing (AGENTS.md Invariants 13, 14, 15)
- Applied universal `--radius-btn: 10px` across the input field, verify button, diff preview container, and flip CTA.
- Configured WCAG 2.2 AAA coaxial dual-layer focus rings (`outline: 2px solid var(--focus-ring-inner) !important; outline-offset: 2px !important; box-shadow: 0 0 0 2px var(--focus-ring-outer) !important;`).
- Added vertical button stack gap `12px !important;` on mobile (`.grammar-input-row`) guaranteeing the mandatory ≥8px negative space buffer around focus rings.
- Enforced symmetrical centering and 8px icon gap (`display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;`).

---

## 2. Verification & Build Results

1. **Verify Test Suite:**
   ```bash
   node web/scripts/verify-grammar-interactive.cjs
   # Results: 6/6 tests passed.
   # ✓ ALL INTERACTIVE GRAMMAR TRANSFORMATION CONSOLE INVARIANTS SATISFIED (ENG-60)
   ```
2. **Full Project Verification:**
   ```bash
   npm --prefix web test
   # tsc --noEmit && node scripts/run-verify.cjs
   # 91/91 verify scripts passed.
   ```
3. **Production Fast Build:**
   ```bash
   npm --prefix web run build:fast
   # vite v5.4.21 building for production...
   # ✓ built in 2.33s (0 errors)
   ```
