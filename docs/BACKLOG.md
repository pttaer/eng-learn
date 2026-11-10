# Mission Backlog: Autonomous Overhaul (Mobile, Vietnamese Learners)

> **Authority:** Autonomous Execution Backlog  
> **Status:** Active  
> **Order of Execution:** Strictly by Stream Priority (A -> B -> C -> D -> E -> F -> G)

---

## Stream A: Reading Skill (Highest Priority, Best Effort)
- [x] **A.1** Audit `web/src/ielts/data/parts/reading-*.json` (parts 1–7): Run automated scan for copied stems, answer key ambiguities, distractor quality, and TFNG/YNNG distribution.
- [x] **A.2** Paraphrase copied stems in `reading-1.json` and `reading-2.json` (r01-q07, r02-q08, r03-q06..q09, r04-q06, r04-q08, r05-q07, r05-q09, r05-q14, r06-q05..q06, r08-q08, r09-q06, r09-q08, r11-q01, r11-q08, r11-q09, r12-q06).
- [x] **A.3** Audit and balance TFNG/YNNG keys across all passages (ensure >=1 NOT GIVEN, no monolithic keys, evidence anchors strictly verified).
- [x] **A.4** Audit `web/content/reading.md`: Verify all A1–C2 intensive reading passages, cold read thesis, comprehension checks, syntax dissections, and sentence mining cloze targets.
- [x] **A.5** Audit `web/src/ielts/views/reading-drills.ts` (all 14 IELTS attack drills): check distractors, prompt clarity, Vietnamese explanations, and why-evidence.
- [x] **A.6** Audit `web/src/modules/reading-dossier.ts`, `web/src/modules/extensive-reader-dossier.ts`, and `web/src/modules/exam-cockpit-dossier.ts` reading questions.
- [x] **A.7** Compile content and merge IELTS parts (`compile-content.cjs`, `merge-ielts.cjs`) and verify zero regression.
- [x] **A.8** Write comprehensive audit log to `docs/reading-audit.md`.
- [x] **A.9** Build automated regression check `web/scripts/verify-reading-quality-audit.cjs` to enforce key presence, evidence anchoring, non-copied stems, and distractor validity.

---

## Stream B: Localization (Permanent Mandatory Requirement)
- [x] **B.1** Insert verbatim `LOCALIZATION RULE` into `CLAUDE.md` and `AGENTS.md`.
- [x] **B.2** Audit all UI files for hardcoded text strings (modules, views, widgets, notifications, modals).
- [x] **B.3** Extract hardcoded strings into `web/src/core/i18n.ts` with 100% symmetrical parity between `EN_DICTIONARY` and `VI_DICTIONARY`.
- [x] **B.4** Enhance `web/scripts/verify-i18n.cjs` to detect hardcoded user-facing strings and enforce locale key parity.
- [x] **B.5** Run verification and test UI under Vietnamese locale for text overflow or diacritic clipping.

---

## Stream C: Responsive Single-Screen Layouts (Mobile)
- [x] **C.1** Document screen layout contract in `docs/layout-contract.md` (screen name, scroll allowed: YES/NO, zero-scroll vs natural scroll constraints).
- [x] **C.2** Audit and optimize zero-scroll views (Constellation Tree, RPG Deck, Cockpit HUD, Placement modal):
  - Use flex/dynamic scaling instead of fixed px heights.
  - Implement adaptive node sizing, font scaling with min/max, label auto-wrapping.
  - Ensure safe area insets and system font scaling compliance.
- [x] **C.3** Run automated 360dp overflow and layout resilience suite (`audit-360-overflow.cjs`, `detect-overflows.cjs`).
- [x] **C.4** Harmonize 4px/8px spacing rhythms and touch target floors (>=44px) across all routes.

---

## Stream D: Learning-View Design (Research-Backed)
- [x] **D.1** Conduct literature review on cognitive load, reading readability, Duolingo/Anki/Kindle/Medium patterns, and WCAG accessibility.
- [x] **D.2** Author comprehensive research findings and design tokens in `docs/learning-ui-research.md`.
- [x] **D.3** Apply research tokens across all learning views (`atomic-card.css`, `dossiers.css`, `drills.css`, `ielts.css`):
  - Comfortable body size (>=16sp), 1.4–1.6 line height, 45–75ch measure.
  - Clear visual distinction between English stimulus and Vietnamese helper text.
  - High-contrast diacritic-safe typography and disambiguated letterforms.
  - Single primary CTA per viewport with >=44px touch targets.

---

## Stream E: Widget Integration
- [x] **E.1** Implement deep-linking routes in Android widget provider (`SingularityWidgetProvider.java`, `MainActivity.java`, `widget-bridge.ts`) handling cold start, warm start, logged out, and fallback states.
- [x] **E.2** Redo widget layout typography and hierarchy across all sizes (small, medium, expanded) with localized strings and high contrast in light/dark themes.
- [x] **E.3** Verify widget rendering via `generate-widget-preview.cjs` and preview assets.

---

## Stream F: Notifications and Retention
- [x] **F.1** Execute 10 research passes across Duolingo, Calm/Headspace, Strava/Nike, Fintech/habits, Social, Gaming, Timing/cadence, Copywriting/A-B, Opt-in timing, Platform ethics -> write to `docs/notification-research.md`.
- [x] **F.2** Author `## Conclusions` section synthesizing retention strategy.
- [x] **F.3** Implement in-app retention architecture:
  - Value-first permission pre-prompt modal.
  - Localized notification catalog with streak saver, daily nudge, taper comeback (1, 3, 7, 14 days), milestones.
  - User controls: quiet hours (22:00–08:00), per-category toggles, snooze, timezone handling, reboot reschedule via `BootReceiver.java`.
- [x] **F.4** Create in-app notification debug console / tester to inspect scheduled alarms and triggers.

---

## Stream G: Vietnamese-Learner Path (Research-Backed)
- [x] **G.1** Execute 3 research passes:
  - Pass 1: Vietnamese EFL study habits, grammar-translation, rote learning, L1 phonological interference (finals, clusters, tones).
  - Pass 2: Vietnamese test landscape (THPT national exam, school curriculum, IELTS/TOEIC pressure, anxiety).
  - Pass 3: World Englishes & Global accents (US, UK, AU, Indian, Singaporean), connected speech, bridging exam to natural.
  - Output to `docs/vn-learner-research.md`.
- [x] **G.2** Synthesize learning path framework in `docs/vn-learner-research.md`.
- [x] **G.3** Implement in-app features:
  - Escape path / bridging curriculum from exam grammar to real-world fluency.
  - World Englishes accent cadence models in `audio-synthesizer.ts`.
  - Targeted L1 error-pattern feedback cards for Vietnamese learners.

---

## Stream H: Advanced Pedagogy & Architecture Superpowers

### H.1 Writing Instant Feedback & Manchester Phrasebank Upgrader
- [x] **H.1.1** Implement heuristics in `writing-heuristics.ts` (Argument Structure Claim➔Cause➔Evidence, Phrasebank Upgrader, Paragraph Cohesion).
- [x] **H.1.2** Add interactive diagnostics card & copy buttons in `web/src/ielts/views/writing.ts` and styles in `ielts.css`.
- [x] **H.1.3** Author regression suite `verify-writing-heuristics-deep.cjs`.

### H.2 Daily Guided Workout / Spaced Curriculum Flow
- [x] **H.2.1** Create data models and local storage state in `web/src/ielts/daily-workout/types.ts` & `storage.ts`.
- [x] **H.2.2** Create Manchester Phrasebank cloze drill generator in `phrasebank-drills.ts`.
- [x] **H.2.3** Create deterministic session generator across 15/30/45/60 min budgets in `generator.ts`.
- [x] **H.2.4** Build interactive 4-step workout runner view `web/src/ielts/views/daily-workout.ts` with audio/haptics.
- [x] **H.2.5** Integrate overview hero card and `#workout` route in `web/src/ielts/main.ts`.
- [x] **H.2.6** Verify 96/96 tests, 31/31 mobile routes (360dp), and 2,100 i18n keys with 100% parity.

### H.3 App Decoupling Architecture (Singularity vs. IELTS Cockpit)
- [x] **H.3.1** Phase 1: Create boundary guard `verify-decoupling-integrity.cjs` & cut hardcoded `ielts.html` redirects in `header-hud.ts` and `main.ts`.
- [x] **H.3.2** Phase 2: Build self-contained IELTS bottom navigation (`ielts-nav.ts`, `ielts-nav.css`) and wire into `web/src/ielts/main.ts`.
- [x] **H.3.3** Phase 3: Multi-target Vite bundling (`APP_TARGET=singularity|ielts` in `vite.config.ts`) and target npm scripts.
- [x] **H.3.4** Phase 4: Dual-APK generation (`AndroidManifest-ielts.xml`, `build-apk.cjs --app=ielts`).
- [x] **H.3.5** Full verification: test suite (97/97 PASS), boundary check (PASS), dual-APK generation (`English-Singularity-debug.apk` + `IELTS-Cockpit-debug.apk`), and 360dp mobile audit (31/31 PASS).

---

## Stream P2: Phase 2 On-Device Install & Full UI/UX Test Sweep
- [x] **P2.1** Device Bootstrap: Stack detection (Offline WebView + Java AppWidgets + AlarmManager), device detection (OPPO Reno4 CPH2065, Android 12, 1080×2400 / 480dpi / 360×800dp).
- [x] **P2.2** Save original phone settings to `docs/device-test-report.md`.
- [x] **P2.3** Build and install `English-Singularity-debug.apk` and `IELTS-Cockpit-debug.apk` via `install -r`.
- [x] **P2.4** Author `docs/screen-inventory.md` mapping all 28 views, 6 modals/overlays, 4 widgets, and notification intents to canonical layout contracts.
- [x] **P2.5** Real-device execution: Diagnostic Placement Modal (`M01`), feedback state, Spotlight Tour (`M06`), and Skill Grid (`S01`). Captured screenshots to `docs/screens/`.
- [x] **P2.6** Sweep 1 defect audit: Uncovered touch target floor issues (<44px) on `.btn-continue-workout` (32px), `.view-switch-btn` (38px), `.btn-toggle-mute` (38px), `.ie-workout-budget-btn` (36px).
- [x] **P2.7** Surgical root-cause fixes: Applied `--touch-target-min: 44px` across `ux-c.css`, `settings-dossier.ts`, and `ielts.css`.
- [x] **P2.8** Build test harness `tests/device/run-sweep.cjs` running full 10-point UX rubric on 360×800dp viewport across all 28 screens.
- [x] **P2.9** Sweep 2 execution: All 28 screens scored >= 4.0 on every rubric item (Zero defects < 4).
- [x] **P2.10** Document human sensory items in `docs/needs-human-review.md` and blocker runbook in `docs/BLOCKERS.md`.
- [x] **P2.11** Rebuild both APKs cleanly and verify 97/97 verify tests, 2,105/2,105 i18n keys matched, and 31/31 mobile routes clean.
