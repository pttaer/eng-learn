# Effortless "Apple-Calm" UI/UX & Cognitive Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Urchin English web application into a soothing, visually exquisite, and cognitively effortless experience (inspired by Apple iOS human-centered design) that reduces learning anxiety and cognitive friction for slow or overwhelmed learners without sacrificing any academic rigor.

**Architecture:** Implement a unified tactile foundation featuring Apple-style continuous curvature (squircles), soft ambient depth, and spring physics in CSS; build a zero-dependency procedural Web Audio acoustic haptics engine; establish a universal 4-second Forgiving Undo manager; and infuse progressive disclosure, ambient hints, and humanized micro-copy across all 6 learning pillars, IELTS views, and placement quizzes.

**Tech Stack:** TypeScript (ESNext), Vanilla CSS (Design System Tokens, Spring Transitions), HTML5 Canvas / Web Audio API, Vite.

**Spec:** `docs/superpowers/specs/2026-10-23-effortless-apple-calm-ui-ux-design.md`

## Global Constraints

- **No Regression Policy:** Every existing academic feature, CEFR ladder, IELTS drill, and keyboard shortcut must remain fully functional.
- **Performance Budget:** Zero external audio or heavy image assets; all haptics and acoustic cues must be synthesized via procedural Web Audio API.
- **WCAG 2.2 AAA Contrast:** All text must maintain >= 7.0:1 contrast ratio against its direct background surface.
- **Reduced Motion Respect:** All spring animations and transitions must honor `@media (prefers-reduced-motion: reduce)`.
- **Pure Vanilla CSS:** No Tailwind or external styling dependencies; extend existing custom property architecture in `variables.css`.

---

### Task 1: Design System & Motion Tokens (`variables.css` & `apple-motion.css`)

**Files:**
- Create: `web/src/assets/styles/apple-motion.css`
- Modify: `web/src/assets/styles/variables.css:40-90`
- Modify: `web/src/assets/styles/hud-base.css:1-50`

**Interfaces:**
- Consumes: Existing CSS custom properties (`--bg-surface`, `--bg-card`, `--ink-primary`).
- Produces: 
  - Token variables: `--radius-squircle-sm`, `--radius-squircle-md`, `--radius-squircle-lg`, `--shadow-ambient`, `--shadow-tactile`, `--spring-bounce`, `--spring-smooth`, `--spring-press`.
  - Utility classes: `.apple-squircle`, `.apple-press`, `.apple-shake`, `.ambient-hint-pulse`, `.focus-dim`.

- [ ] **Step 1: Write test/verification script for CSS tokens and animations**
  Create a test script `web/tests/apple-motion-tokens.test.ts` to assert that `--spring-bounce`, `--radius-squircle-md`, and `--shadow-ambient` are defined and valid CSS values.

- [ ] **Step 2: Add squircle and spring physics tokens to `variables.css`**
  Implement `--radius-squircle-sm: 10px`, `--radius-squircle-md: 16px`, `--radius-squircle-lg: 24px`, `--shadow-ambient`, `--spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)`, and soften `--border-subtle` to `rgba(255, 255, 255, 0.08)`.

- [ ] **Step 3: Create `apple-motion.css`**
  Add keyframes `@keyframes apple-shake` (smooth horizontal spring wobble for wrong answer cues), `@keyframes ambient-hint-pulse` (subtle 5s breathing glow), and `.apple-press` (`transform: scale(0.975); transition: transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)`).

- [ ] **Step 4: Import `apple-motion.css` into `hud-base.css` and verify build**
  Run `npm run build` in `web/` to confirm clean compilation.

- [ ] **Step 5: Commit changes**
  Commit with message `feat(ui): add apple-motion tokens, continuous curvature squircles and spring physics`.

---

### Task 2: Acoustic Haptics Engine (`acoustic-haptics.ts`)

**Files:**
- Create: `web/src/core/acoustic-haptics.ts`
- Test: `web/tests/acoustic-haptics.test.ts`
- Modify: `web/src/core/notification-engine.ts:1-40`

**Interfaces:**
- Consumes: Web Audio API (`AudioContext`).
- Produces: 
  - `AcousticHaptics.tap()`: Crisp micro wooden/glass tap (~400Hz -> 120Hz exponential drop, 25ms).
  - `AcousticHaptics.flip()`: Paper turn swoosh (filtered noise bandpass, 45ms).
  - `AcousticHaptics.chime()`: Harmonic major third chord (659Hz + 880Hz, soft ambient decay).
  - `AcousticHaptics.nudge()`: Warm low-frequency double pluck (330Hz -> 293Hz, no buzzer sound).
  - `AcousticHaptics.setMuted(boolean)`: User preference toggle.

- [ ] **Step 1: Write unit tests in `web/tests/acoustic-haptics.test.ts`**
  Mock Web Audio API context and assert `tap()`, `flip()`, `chime()`, and `nudge()` instantiate sound synthesis nodes and support `setMuted(true)`.

- [ ] **Step 2: Implement `AcousticHaptics` singleton in `web/src/core/acoustic-haptics.ts`**
  Handle browser autoplay policies (lazy init on first user touch/click) and synthesize tones procedurally with clean gain ramps to avoid clicks/pops.

- [ ] **Step 3: Connect acoustic cues to notifications**
  In `notification-engine.ts`, call `AcousticHaptics.chime()` on streak or achievement unlock and `AcousticHaptics.tap()` on interactive drawer toggles.

- [ ] **Step 4: Run test suite**
  Run `npm test` or vitest to verify all audio synthesis tests pass.

- [ ] **Step 5: Commit changes**
  Commit with message `feat(audio): implement zero-asset procedural acoustic haptics engine`.

---

### Task 3: Universal Forgiving Undo Manager & Floating Pill Toast (`undo-manager.ts` & `apple-toast.css`)

**Files:**
- Create: `web/src/core/undo-manager.ts`
- Create: `web/src/assets/styles/apple-toast.css`
- Test: `web/tests/undo-manager.test.ts`
- Modify: `web/src/assets/styles/hud-base.css:20-50`

**Interfaces:**
- Consumes: Action callbacks `() => void`.
- Produces:
  - `UndoManager.register(description: string, undoFn: () => void, timeoutMs?: number)`
  - `UndoManager.undo()`
  - Floating UI pill `.apple-toast-undo` displaying human text, animated circular SVG timer, and clickable "Hoàn tác (Z)".

- [ ] **Step 1: Write unit tests for `UndoManager`**
  Verify registering an action executes `undoFn` when triggered, expires cleanly after timeout, and handles keyboard shortcut `Z` / `Ctrl+Z`.

- [ ] **Step 2: Implement `UndoManager` in `web/src/core/undo-manager.ts`**
  Manage stack of reversible actions and mount a subtle bottom-centered floating pill with spring entrance (`translateY(20px)` -> `translateY(0)`).

- [ ] **Step 3: Style the undo toast in `apple-toast.css`**
  Apply frosted glass styling (`backdrop-filter: blur(16px)`, `background: rgba(18, 23, 34, 0.85)` in dark mode, squircle-full pill shape, subtle ambient shadow).

- [ ] **Step 4: Register global keyboard listener for `Z` / `Ctrl+Z`**
  Ensure listener respects text input fields (ignores when user is typing in a search bar or text box).

- [ ] **Step 5: Verify build & commit**
  Commit with message `feat(ux): implement universal 4-second forgiving undo manager and apple toast`.

---

### Task 4: Cognitive Scaffolding in Vocab & Flashcards (`vocabulary-dossier.ts` & `atomic-card.css`)

**Files:**
- Modify: `web/src/modules/vocabulary-dossier.ts:150-320`
- Modify: `web/src/assets/styles/atomic-card.css:50-150`

**Interfaces:**
- Consumes: `AcousticHaptics`, `UndoManager`, `variables.css`.
- Produces:
  - Progressive disclosure card: Default view displays Word + Core Meaning + Contextual Sentence; etymology, CEFR level badge, and SRS statistics reveal on tapping a subtle "Khám phá thêm" tag.
  - Idle ambient hint: After 5 seconds of inactivity, flip button pulses softly with `.ambient-hint-pulse`.
  - Forgiving review rating: Submitting a card rating (Again/Good/Easy) registers an undo action in `UndoManager`.
  - Spring flip kinematics: Card flip utilizes `--spring-bounce` rotation physics.

- [ ] **Step 1: Write verification test for vocab progressive disclosure**
  Verify default rendered markup does not expose heavy statistics until expanded.

- [ ] **Step 2: Update `atomic-card.css` with spring flip and tactile press**
  Add `.atomic-card-spring-flip` with `perspective: 1000px`, `transform-style: preserve-3d`, and cubic-bezier spring easing.

- [ ] **Step 3: Integrate idle timer for ambient hint in `vocabulary-dossier.ts`**
  Start a 5000ms idle timer that applies `.ambient-hint-pulse` to the primary action if untouched.

- [ ] **Step 4: Wire `UndoManager` and `AcousticHaptics` into rating commits**
  Playing `AcousticHaptics.flip()` on card flip, `AcousticHaptics.tap()` on ratings, and registering `UndoManager.register('Đánh giá từ vựng', ...)` so users can seamlessly undo an accidental rating.

- [ ] **Step 5: Verify in browser and commit**
  Commit with message `feat(vocab): elevate vocabulary dossier with progressive disclosure, ambient hints, and tactile flip`.

---

### Task 5: Focus Zen Mode & Clausal Dissection in Reading Dossier (`reading-dossier.ts` & `dossiers.css`)

**Files:**
- Modify: `web/src/modules/reading-dossier.ts:70-220`
- Modify: `web/src/assets/styles/dossiers.css:120-250`

**Interfaces:**
- Consumes: `AcousticHaptics`, `--radius-squircle-md`, `--shadow-ambient`.
- Produces:
  - Paragraph Focus Mode: Active paragraph is highlighted at 100% opacity; inactive paragraphs settle to 45% opacity to eliminate distraction for slow readers.
  - Segmented Control Tabs: Replaces flat buttons with an Apple-style pill segmented control with sliding active highlight.
  - Clausal Dissection Drawer: Smooth bottom sheet with drag handle and spring slide-up.

- [ ] **Step 1: Style Apple-like Segmented Controls in `dossiers.css`**
  Implement `.apple-segmented-control` with background pill track and smooth sliding indicator.

- [ ] **Step 2: Implement Paragraph Focus Mode in `reading-dossier.ts`**
  Add click/keyboard focus tracker that applies `.paragraph-dimmed` to non-focused paragraphs with a 200ms ease transition.

- [ ] **Step 3: Add smooth spring drawer for Pass 2 (Syntax & Clausal Dissection)**
  Replace raw blockquotes with a tactile card container featuring clear color-coded subject-verb-object chips with high contrast and readable line height (1.7).

- [ ] **Step 4: Enable keyboard navigation across all passes**
  Ensure `ArrowLeft`/`ArrowRight` switch passes smoothly, and `Space` triggers audio pronunciation or next section without page jumping.

- [ ] **Step 5: Commit changes**
  Commit with message `feat(reading): implement focus zen mode, segmented tabs, and tactile syntax dissection`.

---

### Task 6: Stress-Free Placement Quiz & Exam Cockpit (`placement-quiz.ts` & `ielts/views/`)

**Files:**
- Modify: `web/src/modules/placement-quiz.ts:1-200`
- Modify: `web/src/ielts/views/diagnostic.ts:50-180`
- Modify: `web/src/ielts/ielts.css:100-200`

**Interfaces:**
- Consumes: `AcousticHaptics`, `UndoManager`, `.apple-shake`.
- Produces:
  - Conversational stepper: Welcoming human introduction and reassuring progress indicator ("Bước 3 trên 12: Bạn đang làm rất tốt").
  - Tactile option selection: Cards highlight with smooth border glow and micro-press scale.
  - Gentle retry animation: If wrong choice selected, option card triggers `.apple-shake` with warm honey tone and `AcousticHaptics.nudge()` instead of red alert buzzer.

- [ ] **Step 1: Write tests for placement quiz answer feedback and undo**
  Verify state rollback and absence of harsh alert strings.

- [ ] **Step 2: Redesign option cards in `placement-quiz.ts`**
  Transform option buttons into spacious, squircle-shaped cards with generous 16px padding and prominent letter badges (A, B, C, D).

- [ ] **Step 3: Apply `.apple-shake` and warm amber cues on incorrect answers**
  Replace harsh red borders with warm amber-glow and soft explanation card.

- [ ] **Step 4: Demystify IELTS diagnostic cockpit in `ielts/views/diagnostic.ts`**
  Add "Take a breath" transition between test sections; replace cold percentile stats with encouraging band trajectory statements.

- [ ] **Step 5: Commit changes**
  Commit with message `feat(quiz): humanize placement quiz and ielts diagnostic with stress-free tactile interactions`.

---

### Task 7: Global Header, Corner Compass & Navigation Harmony (`header-hud.ts` & `corner-compass.ts`)

**Files:**
- Modify: `web/src/modules/header-hud.ts:30-150`
- Modify: `web/src/modules/corner-compass.ts:20-110`
- Modify: `web/src/assets/styles/hud-base.css:80-160`

**Interfaces:**
- Consumes: `AcousticHaptics`, `--radius-squircle-sm`, Frosted glass styles.
- Produces:
  - Frosted glass header bar (`backdrop-filter: blur(20px)`, subtle bottom separator).
  - Humanized dual-labels: Every pillar button features an icon, clear name, and friendly subtitle.
  - Tactile Corner Compass: Smooth radial dial with haptic sound tick when rotating between pillars.

- [ ] **Step 1: Upgrade header to frosted glass styling**
  Apply `.apple-frosted-nav` with translucent background, high contrast text, and subtle ambient shadow.

- [ ] **Step 2: Add warm human subtitles to pillar buttons**
  - READ: "Đọc sâu & Thấm câu"
  - VOCAB: "Từ vựng nhịp riêng"
  - COLLOC: "Cặp từ tự nhiên"
  - GRAMMAR: "Bản đồ ngữ pháp"
  - IELTS: "Luyện thi tự tin"

- [ ] **Step 3: Enhance Corner Compass interaction**
  Add smooth spring rotation transition and invoke `AcousticHaptics.tap()` on opening and node selection.

- [ ] **Step 4: Build check & commit**
  Commit with message `feat(nav): modernize frosted header hud and tactile corner compass with humanized subtitles`.

---

### Task 8: Full Visual Regression, Audio Verification & Final Review

**Files:**
- Modify: `scripts/capture_every_mobile_view.cjs`
- Execute: Playwright mobile view captures across all 45 screens.

- [ ] **Step 1: Run complete unit test suite**
  Execute `npm test` across all test files to verify zero regressions.

- [ ] **Step 2: Run mobile capture script**
  Run `node scripts/capture_every_mobile_view.cjs` to generate full set of updated screenshots in `Mobile/1.0.0/`.

- [ ] **Step 3: Inspect visual quality**
  Verify that borders are softened, squircle radii are consistent, typography breathes comfortably, and contrast passes WCAG AAA.

- [ ] **Step 4: Final commit & push readiness**
  Commit all screenshots and documentation with message `chore: refresh visual regression mobile captures for apple-calm ui overhaul`.
