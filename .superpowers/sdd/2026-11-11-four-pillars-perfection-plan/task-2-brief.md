# Task 2: Pure Zen Immersion Mode & Floating Rescue Pill Fix

**Location in project:** Global Zen Mode & Reading Lab Zen Immersion (`web/src/core/zen-mode.ts`, `web/src/assets/styles/hud-base.css`).
**Files to modify:**
- `web/src/assets/styles/hud-base.css`
- `web/src/core/zen-mode.ts` (if needed for DOM classes or mobile label)

**Requirements:**
1. In `web/src/assets/styles/hud-base.css`, under `#app.zen-active`:
   Completely hide all auxiliary controls of Reading Dossier:
   ```css
   #app.zen-active .reading-mode-bar,
   #app.zen-active .reading-pass-stepper,
   #app.zen-active .pass-skim-timer-card,
   #app.zen-active .reading-subtabs,
   #app.zen-active .article-meta-telemetry,
   #app.zen-active .dossier-control-bar,
   #app.zen-active .article-tabs {
     display: none !important;
     opacity: 0 !important;
     pointer-events: none !important;
   }
   ```
2. Fix floating rescue pill collision/overlap:
   In `hud-base.css`:
   Currently, `#app.zen-active #workspace-mount` only has `padding-top: clamp(24px, 5vh, 64px) !important;`.
   On mobile, this was too short (~40px), causing the article text when scrolled to collide right under `.zen-floating-pill`.
   Adjust top clearance:
   ```css
   #app.zen-active #workspace-mount {
     padding-top: clamp(68px, 12vh, 100px) !important;
     padding-bottom: clamp(48px, 10vh, 96px) !important;
   }
   ```
3. Polish `.zen-floating-pill`:
   Give it a solid, calm frosted glass backdrop so any content that scrolls beneath it is softly blurred and never bleeds through sharply:
   ```css
   .zen-floating-pill {
     background: rgba(10, 14, 23, 0.92) !important;
     backdrop-filter: blur(16px) saturate(180%) !important;
     -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
     border: 1px solid rgba(255, 255, 255, 0.16) !important;
     box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6) !important;
   }
   ```
4. Mobile-specific polish (`@media (max-width: 768px)`):
   On mobile devices, hide `<kbd class="zen-pill-kbd">Esc</kbd>`:
   ```css
   @media (max-width: 768px) {
     .zen-floating-pill .zen-pill-kbd {
       display: none !important;
     }
     .zen-floating-pill {
       top: 14px;
       padding: 8px 16px;
       gap: 8px;
     }
   }
   ```
5. Verification:
   Run `cd web; npm test` to ensure all 91 tests pass with no syntax errors.
6. Write execution report to `.superpowers/sdd/2026-11-11-four-pillars-perfection-plan/task-2-report.md`.

