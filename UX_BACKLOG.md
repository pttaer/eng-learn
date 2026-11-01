# UX Backlog

## High Priority

- [ ] **TASK-002**: Align `confirm-dialog.ts` with canonical z-index token (`var(--z-modal, 900)`), squircle radius token fallback (`16px`), and action stack clearance gap (`12px`).
- [ ] **TASK-003**: Add universal mobile form control font-size rule (`font-size: max(16px, var(--font-body))`) in `hud-base.css` to defensively prevent iOS Safari auto-zoom on focus.
- [ ] **TASK-004**: Fix IELTS Reading Drills HUD badge double border and ad-hoc margin in `reading-drills.ts` (enforce `white-space: nowrap; flex-shrink: 0; border: none;` and flex gap).
- [ ] **TASK-005**: Fix Cambridge Score Report modal bilingual button consistency in `exam-cockpit-dossier.ts` (ensure `cockpit.btn_test_catalog` has Vietnamese fallback matching sibling buttons).
