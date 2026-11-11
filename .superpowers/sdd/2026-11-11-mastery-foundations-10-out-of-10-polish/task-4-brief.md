# Task 4 Brief: 12 Tenses Zero-Scroll Mobile Optimization (Fix Above-The-Fold Quiz Clipping)

**Files:**
- Modify: `web/src/modules/tenses-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css` (or `tenses.css` if present)

**Objectives:**
1. In `web/src/modules/tenses-dossier.ts`:
   - View mode toggle buttons (`.view-mode-toggle`):
     On mobile (<= 768px), display them as a uniform 3-column grid (`grid-template-columns: repeat(3, 1fr)`) with compact labels:
     - Drill: `${icon('dice', 12)} Luyện` (or `${icon('dice', 12)} ${t('tenses.drill_short', undefined, 'Luyện')}`)
     - Gauntlet: `${icon('target', 12)} Thử thách`
     - Codex: `${icon('book', 12)} Cẩm nang`
     (Or use short responsive text so they never wrap).
   - In active `drill` mode on mobile:
     The `tenses-control-bar` (4 tabs + dropdown) and `tenses-telemetry-cluster` (3 big items) currently take up ~250px!
     On mobile, compress `tenses-telemetry-cluster` into a sleek 1-line HUD:
     `Đúng: X/Y (Z%) · Chuỗi: 🔥 N · Kho: 102 câu`
     And keep `tenses-family-tabs` compact horizontal scroller with hidden or streamlined dropdown on drill mode, OR collapse the filter bar while drilling.
   - Most importantly: The question card (`.tenses-card-question`), signal hint (`.tense-signal-callout`), and all 4 choices (`.tenses-choice-btn` A, B, C, D) must fit comfortably on a 360x803 (Vivo) or 375x667 (iPhone 6) screen WITHOUT vertical scrolling!

2. In `dossiers.css`:
   - `.view-mode-toggle`:
     ```css
     @media (max-width: 768px) {
       .view-mode-toggle {
         display: grid !important;
         grid-template-columns: repeat(3, 1fr) !important;
         width: 100% !important;
         gap: 4px !important;
       }
       .tenses-choice-btn {
         padding: 8px 14px !important;
         min-height: 44px !important;
         margin-bottom: 6px !important;
       }
       .tenses-card-question {
         padding: 12px 14px !important;
         margin-bottom: 8px !important;
       }
       .tenses-telemetry-cluster {
         display: flex !important;
         flex-direction: row !important;
         justify-content: space-between !important;
         padding: 6px 12px !important;
         margin-bottom: 8px !important;
       }
     }
     ```

3. Verify with `npm run build:fast` in `web`.
4. Write report to `e:\Eng\.superpowers\sdd\2026-11-11-mastery-foundations-10-out-of-10-polish\task-4-report.md`.

