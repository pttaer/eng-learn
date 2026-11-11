# Flow 02: Navigation & System HUD Perfection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or direct surgical implementation to execute this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform all 14 screens / 38 screenshots in `Mobile/vivo/02-navigation-hud` into 10/10 perfection in typography, layout rhythm, Apple-calm dynamics, clarity, visual comfort, and mobile UX.

**Architecture:** 
1. Fix core layout collision engines (NotificationEngine, SpotlightTour, Modal Overlay backdrops).
2. Clean up typography, wrap-breaks, redundant elements, and raw bracketed debug copy across HUD modals (Settings, Level Picker, Drawer, Celestial Radar, Mistake Vault, RPG Progression, Commute Player, Scratchpad).
3. Modernize segmented controls and level selectors to eliminate bulging, asymmetric pills.
4. Regenerate screenshots with `scripts/capture-vivo-audit.cjs` and verify 0 DOM defects.

**Tech Stack:** TypeScript, CSS Design Tokens (`variables.css`, `hud-base.css`, `ux-c.css`), Vite, Puppeteer (audit capture engine).

**Spec:** [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md), [`RULE[e:\Eng\AGENTS.md]`](file:///e:/Eng/AGENTS.md).

## Global Constraints
- Screen Inset: `--pad-screen-left: 12px;` and `--pad-screen-right: 12px;`.
- Universal Button Radius: `border-radius: var(--radius-btn, 10px);`.
- Touch target floor: `min-height: 44px; min-width: 44px;`.
- Breakpoint boundary strictly at 768px.
- Zero decorative stars (`✦` or `★`), clean typography or semantic white star (`☆`).
- Zero bracketed text (`[ Xuất hồ sơ ]` -> `Xuất hồ sơ`).
- WCAG 2.2 AAA contrast compliance on all active badges and controls.
- Universal modal backdrop blur: `--modal-backdrop: rgba(5, 7, 13, 0.78); backdrop-filter: blur(12px);`.
- All floating toasts/bubbles suppressed (`display: none !important`) when modal is open.

---

### Task 1: Toast Engine Layout & Modal Collision Suppression
**Files:**
- Modify: `web/src/core/notification-engine.ts`
- Modify: `web/src/assets/styles/hud-base.css`
- Modify: `scripts/capture-vivo-audit.cjs`

- [ ] Add rule to automatically suppress `#notification-toast-container` whenever `.completion-modal-overlay`, `.modal-overlay`, or `.commute-player-overlay` is present in DOM.
- [ ] On mobile, position toasts at the bottom dock with safe margin or clean dismiss behavior so they never collide with header content.
- [ ] In `scripts/capture-vivo-audit.cjs`, ensure `#notification-toast-container` is cleared in `cleanPopupsAndOverlays`.

### Task 2: Settings Modal & Settings Dossier Layout & Color Contrast Fix
**Files:**
- Modify: `web/src/modules/header-hud.ts`
- Modify: `web/src/modules/settings-dossier.ts`
- Modify: `web/src/core/i18n.ts`

- [ ] In `openSettingsModal()`, fix duplicate title by setting distinct kicker (`t('settings.kicker', 'CÀI ĐẶT HỆ THỐNG')`) and title (`t('settings.storage_title', 'Bộ nhớ & Dữ liệu')`).
- [ ] Fix active locale button text color: Replace `border-color: var(--accent-cyan); color: var(--accent-cyan)` with high-contrast text color `color: var(--bg-canvas, #080a0f) !important` or `var(--ink-on-good)` when active so "Tiếng Việt" is razor-sharp visible!
- [ ] Remove brackets from `[ Xuất hồ sơ ]` and `[ Nhập hồ sơ ]` in both modal and dossier.
- [ ] Unify English/Vietnamese translations in Settings Modal (Mode Scaffolding and Notification Alerts).

### Task 3: Mobile Action Drawer Alignment & Safe Bottom Dock
**Files:**
- Modify: `web/src/modules/header-hud.ts`
- Modify: `web/src/assets/styles/ux-c.css`

- [ ] Ensure all action buttons inside `.mobile-sheet-grid` declare `justify-content: flex-start !important; text-align: left;` with consistent 10px gap between icon and text.
- [ ] Remove duplicate close affordance (remove redundant bottom close button, keep standard header close button, or ensure header dismiss is canonical).
- [ ] Add `padding-bottom: calc(24px + env(safe-area-inset-bottom, 16px))` inside `.mobile-sheet-grid` so "Chế độ Nghe Rảnh tay" and bottom-most actions are never cut off.

### Task 4: CEFR Multi-Skill Assessment (Intro, Question, Celestial Radar)
**Files:**
- Modify: `web/src/modules/multi-skill-quiz-modal.ts`
- Modify: `web/src/core/i18n.ts`
- Modify: `web/src/assets/styles/dossiers.css`
- Modify: `web/src/assets/styles/ux-c.css`

- [ ] Eliminate "SÁNG KIẾN 21" in `i18n.ts` (replace with `RADAR ĐA KỸ NĂNG CEFR` / `CHẨN ĐOÁN NĂNG LỰC`).
- [ ] Fix `5✕` close button collision in question view: move close button into a dedicated top navigation bar or give stepper track proper right margin (`margin-right: 48px`).
- [ ] Hide desktop shortcut hint (`Phím tắt: 1 - 4 để chọn...`) on mobile (`display: none` under 768px).
- [ ] Prevent kicker wrap: streamline `quiz.diagnostic_complete` and `quiz.skill_calibration_hint`.
- [ ] Unify `skill-level-selector`: create a cohesive segmented pill container with uniform 6-column grid so `B2` doesn't bulge out like an isolated box.

### Task 5: RPG Progression Modal De-duplication & Typography
**Files:**
- Modify: `web/src/modules/progression-modal.ts`
- Modify: `web/src/core/achievements-card.ts`
- Modify: `web/src/core/i18n.ts`

- [ ] Fix "TIẾN TRÌNH LÊN HẠNG KẾ TIẾP" text wrap by using clean, concise kicker typography (`TIẾN TRÌNH LÊN CẤP`).
- [ ] Eliminate duplicate hero in `achievementsHtml` when rendered inside `ProgressionModal` (remove redundant repeated stats banner).
- [ ] Improve badge naming from literal numbers ("Mười Câu hỏi" -> "Tập sự: 10 câu hỏi", "Thành thạo: 50 câu hỏi", "Chuyên gia: 200 câu hỏi").

### Task 6: Smart Mistake Vault Layout & Responsive Stats
**Files:**
- Modify: `web/src/core/mistake-vault.ts`
- Modify: `web/src/core/i18n.ts`
- Modify: `web/src/assets/styles/dossiers.css`

- [ ] Fix text wrap on 3 top stat cards: change labels in Vietnamese to concise words ("Chờ ôn", "Đã thuộc", "Tổng cộng") with clean font sizes.
- [ ] Remove duplicate close buttons (top X vs bottom Đóng).
- [ ] Polish L1 transfer diagnostic card action button text.

### Task 7: Living Urchin Canvas Content Polish
**Files:**
- Modify: `web/src/core/perspective-canvas.ts`

- [ ] Replace hardcoded crude `ITEM` string with dynamic vocabulary collocation headwords or subtle glowing rune/glyph nodes.
- [ ] Add an elegant educational floating HUD pill at top: "Chạm hoặc di chuyển để tương tác với Cầu gai Ngôn ngữ".

### Task 8: Constellation Star Map & Skill Node Perk Modal
**Files:**
- Modify: `web/src/modules/skill-tree-view.ts`
- Modify: `web/src/core/i18n.ts`

- [ ] Remove crude ascii `☆ BÀI TẬP [A1]` bracket formatting, use clean Apple-calm typography.
- [ ] Add proper bottom safe-area margin so bottom progress cards ("CẤU TRÚC CÚ PHÁP 50%") are not clipped behind the dock.
- [ ] In `skill-node-modal`, clarify progress text: "Tỷ lệ ghi nhớ: 100% (Mục tiêu: 80%)".

### Task 9: Corner Compass Radial Menu Trigger
**Files:**
- Modify: `scripts/capture-vivo-audit.cjs`
- Modify: `web/src/modules/corner-compass.ts`

- [ ] Ensure `.compass-trigger` is correctly targeted in capture script so the radial compass menu opens cleanly in the screenshot.

### Task 10: Commute Audio Player Polish
**Files:**
- Modify: `web/src/core/commute-audio-player.ts`
- Modify: `web/src/core/i18n.ts`

- [ ] Fix header wrap: change title to concise "VÒNG LẶP ÂM THANH" / "Hands-Free Audio Loop".
- [ ] Unify delay and speed pill button styling into symmetrical segmented bars.

### Task 11: Level Picker Modal Modernization
**Files:**
- Modify: `web/src/modules/header-hud.ts`
- Modify: `web/src/assets/styles/hud-base.css`

- [ ] Remove bracketed text `[ ... ]`.
- [ ] Convert the 6 vertical level options into a clean 2-column or 3-column CEFR grid with level badge, title, and active state.

### Task 12: Floating Scratchpad Window Modernization for Mobile
**Files:**
- Modify: `web/src/modules/floating-note.ts`
- Modify: `web/src/assets/styles/floating-note.css`

- [ ] On mobile (<=768px), render scratchpad with a frosted backdrop overlay and clean modal sizing (`max-width: 92%; max-height: 85dvh;`).
- [ ] De-duplicate triple "Scratchpad & Productivity Hub" titles.
- [ ] Fix textarea top line clipping by adjusting padding and line-height.
- [ ] Clean up category tabs and tool buttons for mobile horizontal scrolling.

### Task 13: Build & Automated Audit Verification
**Files:**
- Run: `npm --prefix web run build:fast`
- Run: `node scripts/capture-vivo-audit.cjs`
- Verify: All 38 screenshots in `Mobile/vivo/02-navigation-hud` regenerated, zero DOM defects, visual inspect check.

