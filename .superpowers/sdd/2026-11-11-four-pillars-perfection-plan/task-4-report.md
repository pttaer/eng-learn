# Task 4 Report: Speaking Studio Mobile Tab Strip Fix (AGENTS.md Rule 7)

**Status:** DONE  
**Date:** 2026-11-11  
**Author:** Implementer Subagent  
**Scope:** Pillar 04 - Speaking Studio (`web/src/assets/styles/ux-c.css` & `web/src/assets/styles/dossiers.css`)

---

## 1. Summary of Changes

### A. Mobile Horizontal Scroll Conversion (`web/src/assets/styles/ux-c.css`)
- **Before:** Under `@media (max-width: 768px)`, `.speaking-mode-cluster` was grouped with `.view-mode-toggle` and declared:
  ```css
  display: flex !important;
  flex-wrap: wrap !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
  gap: 8px !important;
  width: 100% !important;
  ```
  With `.speaking-mode-cluster > *` declaring `flex: 1 1 auto !important; white-space: normal !important;`, the 4 mode tabs (`Độ trôi chảy 4-3-2`, `Bạn Đàm thoại AI`, `Phòng Luyện Âm & Cặp từ`, `Giám khảo IELTS`) wrapped across 3 separate lines on narrow mobile viewports (≤768px), wasting ~140px of vertical space and directly violating `AGENTS.md` Rule 7:
  > *"Strict Prohibitions: No vertical stacking of horizontal tabs on mobile (use horizontal scroll)."*

- **After:** Separated `.speaking-mode-cluster` into an independent horizontal scroll track:
  ```css
  .speaking-mode-cluster {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 8px !important;
    width: 100% !important;
    padding-bottom: 4px !important;
    scrollbar-width: none !important;
  }

  .speaking-mode-cluster::-webkit-scrollbar {
    display: none !important;
  }

  .speaking-mode-cluster > * {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
    min-height: 44px !important;
    padding: 8px 16px !important;
    border-radius: var(--radius-btn, 10px) !important;
  }
  ```
  This creates a sleek, single-line horizontal scroll track with zero scrollbar clutter and zero vertical wrapping.

### B. Button Alignment, Padding, & Invariant Compliance (`web/src/assets/styles/dossiers.css`)
- Updated `.speaking-mode-cluster .mode-tab`:
  - Enforced `border-radius: var(--radius-btn, 10px);` (Invariant 13: Universal Button Border-Radius).
  - Enforced `min-height: 44px;` and `padding: 8px 16px;` (clean symmetrical padding).
  - Added `display: inline-flex; align-items: center; justify-content: center; gap: 8px;` and `.speaking-mode-cluster .mode-tab svg { flex-shrink: 0; display: block; }` (Invariant 15: Symmetrical Centering & Anti-Lopsided Layout).
  - Enforced `white-space: nowrap;` so that mode tab labels remain crisp and readable on a single line.

---

## 2. Verification Results

1. **Test Suite Verification:**
   - Command: `cd web; npm test` (`tsc --noEmit && node scripts/run-verify.cjs`)
   - Result: **PASS 91/91 verify scripts**
   - Architectural invariant suites (`verify-spoken-partner.cjs`, `verify-formant-lab.cjs`, and mobile responsive suites) passed with 100% success.

2. **Production Build Verification:**
   - Command: `cd web; npm run build`
   - Result: Built in 2.40s with zero errors. All chunks rendered cleanly.

---

## 3. Files Modified
- [`web/src/assets/styles/ux-c.css`](file:///e:/Eng/web/src/assets/styles/ux-c.css)
- [`web/src/assets/styles/dossiers.css`](file:///e:/Eng/web/src/assets/styles/dossiers.css)
