# Task 3 Brief: Grammar Codex & Syntax Inversion Clean-up

**Files:**
- Modify: `web/src/modules/grammar-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Objectives:**
1. In `web/src/assets/styles/dossiers.css`:
   Under `@media (max-width: 768px)`:
   The `.vocab-telemetry-banner` in grammar currently stacks 3 verbose items:
   - `CHUỖI LUYỆN CÚ PHÁP 0 câu hoàn tất`
   - `HỆ SỐ TẢI NHẬN THỨC Cấp độ Nâng cao`
   - `PHÂN LOẠI CÚ PHÁP MODE A: INVERSION & EMPHASIS`
   This takes up ~110px of vertical space before the question card.
   Convert `.vocab-telemetry-banner` on mobile into a sleek, compact single-line or compact 2-line HUD:
   ```css
   @media (max-width: 768px) {
     .dossier-grammar .vocab-telemetry-banner {
       display: flex;
       flex-direction: row;
       justify-content: space-between;
       padding: 8px 12px;
       margin-bottom: 10px;
       gap: 8px;
     }
     .dossier-grammar .telemetry-item {
       flex: 1;
       text-align: center;
       gap: 2px;
     }
     .dossier-grammar .telemetry-label {
       font-size: 10px;
       letter-spacing: 0.04em;
     }
     .dossier-grammar .telemetry-value {
       font-size: 12px;
     }
   }
   ```
2. In `web/src/modules/grammar-dossier.ts`:
   In `renderActiveCard()`:
   Currently there's confusion between typing the transformation and using SRS flip buttons.
   Label the text input clearly:
   `[ Ô NHẬP BIẾN ĐỔI CÚ PHÁP (TÙY CHỌN TRƯỚC KHI LẬT) ]:`
   And make `Lật xem đáp án` prominent as a clean, confident CTA.
   Ensure the buttons stack and spacing adhere to `--radius-btn: 10px` and Invariant 14 (Focus-ring & clearance).

3. Verify with `npm run build:fast` in `web`.
4. Write report to `e:\Eng\.superpowers\sdd\2026-11-11-mastery-foundations-10-out-of-10-polish\task-3-report.md`.

