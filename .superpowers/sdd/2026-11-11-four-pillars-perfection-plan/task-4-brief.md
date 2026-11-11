# Task 4: Speaking Studio Mobile Tab Strip Fix (AGENTS.md Rule 7)

**Location in project:** Speaking Studio (Trụ cột 04 - Acoustic Speaking Studio) in `web/src/assets/styles/ux-c.css` and `web/src/assets/styles/dossiers.css`.
**Files to modify:**
- `web/src/assets/styles/ux-c.css`
- `web/src/assets/styles/dossiers.css`

**Requirements:**
1. Currently in `web/src/assets/styles/ux-c.css:844`, under `@media (max-width: 768px)`:
   ```css
   .speaking-mode-cluster {
     display: flex !important;
     flex-wrap: wrap !important;
     gap: 8px !important;
     width: 100% !important;
   }
   ```
   This wraps the 4 speaking mode buttons (`Độ trôi chảy 4-3-2`, `Bạn Đàm thoại AI`, `Phòng Luyện Âm & Cặp từ`, `Giám khảo IELTS`) across 3 separate lines, wasting ~140px vertical space and violating `AGENTS.md` Rule 7:
   *"Strict Prohibitions: No vertical stacking of horizontal tabs on mobile (use horizontal scroll)."*
2. Fix `.speaking-mode-cluster` on mobile (≤768px):
   - Set `flex-wrap: nowrap !important;`
   - Set `overflow-x: auto !important;`
   - Set `-webkit-overflow-scrolling: touch !important;`
   - Set `scrollbar-width: none !important;`
   - Set `.speaking-mode-cluster::-webkit-scrollbar { display: none !important; }`
   - Set `.speaking-mode-cluster > * { flex: 0 0 auto !important; white-space: nowrap !important; }`
3. Ensure every mode button maintains `--radius-btn: 10px`, min-height 44px, and clean padding (`8px 16px`).
4. Verification:
   Run `cd web; npm test` to ensure 91/91 scripts pass.
5. Write report to `.superpowers/sdd/2026-11-11-four-pillars-perfection-plan/task-4-report.md`.

