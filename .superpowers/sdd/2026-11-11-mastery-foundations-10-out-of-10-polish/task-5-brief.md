# Task 5 Brief: Lexicon Detail Drawer Mobile Clearance & Backdrop

**Files:**
- Modify: `web/src/modules/lexicon-drawer.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Objectives:**
1. In `web/src/assets/styles/dossiers.css`:
   - Under `@media (max-width: 768px)`:
     - `.lexicon-drawer` must have `z-index: var(--z-modal, 1200);` (above fixed bottom nav which is around 900-1000).
     - `.lexicon-drawer-footer` must have proper bottom padding so the "Đóng" button (`#lexicon-bottom-close`) is NEVER cut off:
       `padding: 12px 16px max(16px, env(safe-area-inset-bottom)) !important;`
     - Adjust `.lexicon-drawer-body` max-height to `max-height: calc(min(80vh, 80dvh) - 180px);` so the entire footer fits cleanly inside the viewport without pushing the close button below the screen edge.
   - Ensure the modal backdrop has `--modal-backdrop` and blur:
     `backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;` per Invariant 17.

2. In `web/src/modules/lexicon-drawer.ts`:
   - Ensure the close button text and action button text have consistent typography and 44px tap floor.

3. Verify with `npm run build:fast` in `web`.
4. Write report to `e:\Eng\.superpowers\sdd\2026-11-11-mastery-foundations-10-out-of-10-polish\task-5-report.md`.

