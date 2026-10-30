# Views Flow, Screenshot & Code Audit (2026-10-30)

Status: complete. Eight passes returned: six screenshot batches (A to F), a prior-audit status check, and a code-side route and overlay map. Nothing was edited. No browser was run.

Branch `feat/ielts-path-reading-focus`, last commit `e651436` (2026-10-30 07:42).

Tags used on each claim:

- **[H]** checked by file hash (byte-identical or not). Strong evidence.
- **[C]** checked in code, with file and line.
- **[V]** visual only. Taken from a reviewer's report and not re-checked. Pixel sizes are rough.
- **[S]** stale. The capture predates the last commit, so confirm in the current build.
- **[X]** a reviewer's claim that the hash or code check contradicts. Treat as wrong.

Current captures are only `Mobile/vivo/` (captured 2026-10-30 09:33). Everything in `flows/` (2026-10-28) and `screenshots/` (2026-10-29 or earlier) is **[S]**.

---

## 1. Summary

The layout problems are real and widespread. The evidence used to judge them is worse than the README admits, so fix the evidence before the layout.

- **The vivo set is mostly copies.** 139 captures contain 104 distinct images. 35 files are byte copies in 19 duplicate groups **[H]**.
- **20 captures show the same exam-exit dialog,** not the screen in their filename **[H]**. This covers IELTS views 07 to 15 in both positions. Those views were never audited.
- **Four "report" captures show the base page.** The `01b`, `02b`, `03b` and `05b` band and diagnostic reports are byte-identical to `01`, `02`, `03` and `05` **[H]**.
- **All 11 `flows/08-assessments` captures are copies of screens in other folders** **[H]**. The band readiness report, the three scorecards, the taxonomy report and the speaking assessment were not seen in any current capture.
- **`phone_real_current.png` is not a PNG.** It is UTF-16 text **[H]**.
- **The "0 defects" result is not evidence.** The detector has no inner-overflow check and tests tap targets at 40px with `&&` **[C]**. The earlier 2026-10-29 audit found 13 to 27 inner overflows per route at 360px **[C]**. The current detector cannot see that class.

Top issues, ranked by user impact:

1. **Wrong or misleading data on screens.** Examples: a 92% score shown with "absolute accuracy" copy **[C]**; "1 speakers" **[C]**; a strategy tab that says 46 while the page shows 71 cards **[C]**; an IELTS overview with band 7.0 tiles beside "not ready for 7.0" text **[V]**; a writing diff showing 0 WPM after 9 words **[V]**.
2. **The floating Notes button covers CTAs.** It hides calls to action on most mobile screens reviewed **[V]**. Section 7, S1.
3. **Dead ends.** Several modals have no visible close: the radar result, the multi-skill question, the exam band report, the Mistake Vault button cut off at the bottom. The Zen reading mode has no header and no exit **[V]**.
4. **The separate IELTS app is not linked from the main app.** No UI link to `ielts.html` exists. The only route to it is notification deep links **[C]**. The main app does have an "IELTS COCKPIT" entry for the in-app CD-IELTS mock, so IELTS content is reachable, but split across two apps with two designs. Section 2.10.
5. **The exam-exit guard fires on non-exam screens.** This is why 20 captures are blank **[C]**. Section 2.8.
6. **Tap targets under 44px, unequal tab widths, double outlines, mobile ellipsis.** These repeat across almost every screen **[V]** and some are confirmed in CSS **[C]**. Section 7.
7. **Three documents disagree on the screen inset** (12px or 24px). Section 2.1.
8. **Patch layering.** 2,414 `!important` declarations and 1,024 inline `style=` attributes. Section 2.5.
9. **Dev jargon and glyphs leak into learner copy.** Examples: "Apple-calm", "760px", "INITIATIVE 21", raw IDs like `BE_AND_HAVE`, and sparkle emoji on kickers **[V]**, with the sparkle sources confirmed in code **[C]**.

---

## 2. Why it looks messy (root causes)

### 2.1 Four documents, three answers for the screen inset

| Source | Says | Evidence |
|---|---|---|
| CLAUDE.md (project rules) | 24px screen/workspace inset | "24px screen/workspace inset with flush-left alignment" |
| `web/src/assets/styles/variables.css` | 12px left and right, all viewports | lines 178-179 |
| AGENTS.md | 12px, single source of truth | "`--pad-screen-left: 12px`" |
| `docs/TYPOGRAPHY_SPACING_RULES.md` | Tier 1: 12px mobile / 24px desktop | line 48 |
| `.agents/rules/canonical-spacing.md` | Its own diagram uses `padding: 12px 24px` on the header and 24px on the workspace | lines 16-21; lines 49-51 say 12px |

Only the 12px value is implemented. No media query overrides `--pad-screen-left` at desktop width **[C]**. Every "does it match the spec" judgement therefore depends on which document you trust. Batch B's reviewers measured about 12px on phones and about 32px in Zen mode **[V]**.

### 2.2 The gold-reference image was deleted

`Mobile/1.0.0/` does not exist in the working tree **[C]**. Four rule documents name `Mobile/1.0.0/37-mobile-ielts-writing.png` as the gold standard for padding, gaps and radii.

The folder was deleted in commit `2a60e47` ("Update full flow new ver"), which removed 48 files. The image is recoverable: `git show 2a60e47~1:Mobile/1.0.0/37-mobile-ielts-writing.png` **[C]**. Restoring it is a decision for you (section 10).

### 2.3 The vivo detector is too weak to produce "0 defects"

`scripts/capture-vivo-audit.cjs` writes `AUDIT-REPORT.json` (line 866). The file contains `[]` **[C]**. The vivo README reports "0 defects" from it. The detector is `inspectDomDefects` (lines 66 to 150).

| Check | What it tests | Gap **[C]** |
|---|---|---|
| Root horizontal overflow | `document.scrollWidth > viewport + 1` | Fine. |
| Element beyond viewport | `rect.right > vw + 2` | Catches elements that leave the viewport. Misses content overflowing its own box. |
| Ellipsis truncation | Only when the element is truncated at capture time | Skips elements in scrollable containers. |
| Tap target | `rect.height < 40 && rect.width < 40` (line 144) | Threshold is 40px, not the spec's 44px. `&&` means a 30px-tall, 200px-wide button passes. |
| **Inner overflow** | **Not checked.** `scrollWidth` appears only in the root and ellipsis branches. | This is the class the 2026-10-29 audit found. |

### 2.4 The earlier overflow audit did find the problem

`screenshots/overflow_audit_360.json` (2026-10-29, 360px) lists inner overflows **[C]**:

| Route | Issues | Examples (scrollWidth vs clientWidth, px) |
|---|---|---|
| `#tree` | 13 | `btn-level` "B2" 48 vs 42; `btn-enter-dossier` 50 vs 44 (five instances); `lexicon-srs-btn` 334 vs 328 |
| `#read` | 27 | `btn-mode-intensive` 263 vs 257; `article-tab` 292 vs 286, with viewport bleed on tabs 2 and 3 |
| `#write` | 23 | `dossier-control-bar` 344 vs 336; `copywork-header-row` 315 vs 310; `level-tab` 48 vs 42 |
| `#listen` | 17 | `btn-play-slow` 95 vs 89; `btn-play-audio` 92 vs 86 |

Most overflows are 4 to 6px. The classes still exist in source (`btn-enter-dossier` and `btn-continue-workout` in `web/src/modules/skill-tree-view.ts`; `btn-level` and `btn-streak-pill` in `hud-base.css`) **[C]**. The overflow is probably still there. The current capture cannot confirm or deny it.

### 2.5 Patch layering

| Measure | Count | Where **[C]** |
|---|---|---|
| `!important` declarations | 2,414 | all CSS |
| `!important` in the override stylesheet | 1,176 of 2,235 lines | `web/src/assets/styles/ux-c.css` ("MOBILE RESPONSIVE ENGINE & UI/UX PRO-MAX ADAPTIVE OVERRIDES") |
| Inline `style="..."` attributes | 1,024 | TypeScript views and modules (116 `.ts` files) |
| Base style files | `dossiers.css` 8,624 lines, `ielts/ielts.css` 6,354, `hud-base.css` 2,596 | |

When a base rule, an override and an inline style set the same property, the winner depends on load order and `!important`. That is the likely reason one fix breaks another screen. This is inferred from file structure and has not been reproduced in a browser.

### 2.6 Tokens exist but are bypassed

| Rule (CLAUDE.md) | Measured **[C]** | Notes |
|---|---|---|
| Typography uses tokens; no arbitrary px sizes | 107 literal `font-size` px vs 970 token uses | Off-scale literals: `19px` at `dossiers.css:528` (`!important`); `18px` at `ielts/ielts.css:6344`; `13.5px` at `apple-toast.css:43`, `dossiers.css:545`, `dossiers.css:619`, `ux-c.css:1414`; `11.5px` at `dossiers.css:3275` and `:3286`. Also `12px` appears 20 times and no 12px token exists. |
| Buttons use `--radius-btn` (10px) | 351 literal `border-radius` px vs 157 `var(...)` uses | Includes non-button elements, so it overstates the button problem. |
| `--radius-btn` defined once | Defined twice: `variables.css:77` and `:301`, both 10px | A future edit to one copy is silently overridden. |
| Layers use `--z-*` tokens | Tokens at `variables.css:216-231` (top `--z-cursor: 9999`). About 29 literal `z-index` numbers in six files. | `tour-spotlight.css` uses 100000 to 100005. |
| Two typefaces max | `--font-mono` and `--font-sans` widely used; `'JetBrains Mono'` hard-coded in 13 places; `Segoe UI, Roboto` stacks forced with `!important` | A second copy of the mono token. |

Compliant **[C]**: no `✦` or `★` in `web/src`; no `contain: size`; no real media query at 600, 640, 760, 800, 820, 840 or 900px. The "760px" and "480px" strings are only in comments at `hud-base.css:793, 984, 1360, 1381`, and those comments describe queries that no longer exist.

### 2.7 Mobile ellipsis

The spec bans `text-overflow: ellipsis` on mobile titles and labels.

- **Confirmed inside `@media (max-width: 768px)`:** `ux-c.css:135, 1209, 1420` (all `!important`); `hud-base.css:1502, 1536`; `ielts/ielts.css:1694, 3918, 4383, 5217, 5318`. That is 10 **[C]**.
- **Total in source: 25.** The other 15 are in inline styles (`header-hud.ts:746, 781`, `progression-modal.ts:96`, `mission-log.ts:134`, `analytics-dossier.ts:212`, `settings-dossier.ts:327`), `dossiers.css` (six lines), `atomic-card.css:331` and `floating-note.css:162, 302`. Their mobile scope is not checked **[C]**.

### 2.8 The exam-exit guard fires on screens that are not exams

The 20 blank captures are caused by `isIeltsTestInProgress()` in `web/src/ielts/confirm-dialog.ts:16-24` **[C]**. It returns true when:

- `#btn-pause-toggle` exists, or
- any `.ie-stage .ie-testbar button:last-child` is enabled and no `.ie-result` is visible (line 21).

The second selector is loose. Any enabled last button in a test bar on any IELTS page counts as "exam running". Every navigation then shows the dialog ("Xác nhận rời khỏi bài thi"). This matches the captures, but it is not reproduced in a browser. The guard is called from `ielts/main.ts:300`, `:445` and `:469`. The fix is to tie the check to an explicit exam state (for example, a started flag set by the mock or reading engine) instead of DOM probing.

### 2.9 Copy and data bugs with code causes

| Symptom | Cause **[C]** |
|---|---|
| 11 of 12 correct (92%) gets "absolute accuracy" copy | `renderGauntletScorecard()` in `modules/tenses-dossier.ts`. Scores of 85% or more all get the C1/C2 title and the `tenses.grade_c1_comment` text ("độ chuẩn xác tuyệt đối"). Only a perfect score should get that wording. |
| "1 speakers" on listening cards | `core/i18n.ts:731` (`'{count} speakers'`) has no singular form. Used at `ielts/views/listening.ts:195`. |
| Strategy tab says "46 Tactical Blueprints" while the page shows 71 cards | The label is hard-coded at `ielts/views/strategy.ts:676` and `:692`. The live count is at `:811` (`filtered.length`). |
| Timer shows "00:60" | `modules/reading-dossier.ts:827` and `:987` hard-code the `00:` prefix before the seconds: `` `00:${String(this.skimSecondsRemaining).padStart(2, '0')}` ``. At 60 seconds the display is "00:60". The IELTS formatter (`ielts/ui.ts:10`) is correct and is not the cause. |

### 2.10 The IELTS side is split off from the main app

- **No UI link to the separate IELTS app.** `ielts.html` is referenced only from notification payloads (`core/notification-catalog.ts`, `core/notification-engine.ts:80-84`). The main app's `index.html` and modules have no link to it **[C]**. The vivo capture script reaches IELTS by URL (`scripts/capture-vivo-audit.cjs:698`: `ielts.html#home`), which would hide this gap from the captures.
- **The main app does have an IELTS entry.** The header button "IELTS COCKPIT" (`modules/header-hud.ts:188`) opens the in-app CD-IELTS exam cockpit, and the cockpit route is in the mobile bottom nav **[C]**. So IELTS mock content is reachable, but through the cockpit, not the IELTS app.
- **`ielts.html` loads neither `hud-base.css` nor `dossiers.css`** (it loads `variables.css`, `floating-note.css`, `scroll-affordance.css`, `ielts.css`) **[C]**. Overlays that rely on those files, such as `.mistake-vault-modal-overlay` and `.commute-player-overlay` (from `hud-base.css`) and `.completion-modal-overlay` (from `dossiers.css`/`ux-c.css`), are probably unstyled in the IELTS app. Not visually checked.
- **Notification routes `#collocations` and `#mistakes` are invalid.** `notification-catalog.ts:237, 396, 596-623` use them. The router's valid list (`router.ts:28`) has `colloc` and no `mistakes`, so they fall back to the tree **[C]**.

### 2.11 Glyphs

- No `★` or `✦` in code **[C]**. Black stars in the reports come from stale captures **[S]**.
- `☆` on titles is allowed by the spec. It appears at `core/i18n.ts:1351, 1416`, `core/spotlight-tour.ts:26` and `core/serl-gauntlet-engine.ts:366` **[C]**.
- `✨` is not in the spec's allowed list and conflicts with "clean typography". It appears at `core/i18n.ts:1880` and `core/notification-catalog.ts:119, 206, 961, 966` **[C]**.

---

## 3. Coverage and capture integrity

### 3.1 Review batches

| Batch | Scope | Listed | Viewed | Findings (as reported) | Note |
|---|---|---|---|---|---|
| A | vivo 01 to 02 (onboarding, navigation) | 36 | 36 | 44 (5 P0, 23 P1, 16 P2) | Two "identical scroll" claims are **[X]** (section 3.2). |
| B | vivo 03 to 04 (pillars, mastery) | 44 | 44 | 51 (4 P0, 25 P1, 22 P2) | "Scrolled shot identical" for lexicon (B-38) is **[X]**. |
| C | vivo 05 and IELTS 01 to 10b | 59 | 59 | about 46 (about 11 P0) | Included vivo 11 to 15 by mistake; deduplicated against D. C-02 is **[X]**. |
| D | vivo IELTS 11 to 15, flows 07, flows 08, flows 06 bottoms | 27 | 27 | 46 (8 P0, 24 P1, 14 P2) | Most are blocked or copies (section 3.2). The rest is **[S]** except vivo 11 to 15. |
| E | `screenshots/` popups, flow-mobile, view, floating note, phone | 68 | 67 | 77 (14 P0, 41 P1, 22 P2) | All **[S]**. `phone_real_current.png` is corrupt **[H]**. |
| F | `screenshots/` desktop 01 to 36 | 35 | 35 | 56 (3 P0, 28 P1, 25 P2) | All **[S]**. The only desktop evidence in the repo. |

About 320 findings in total, before deduplication. The counts are the reviewers' own and are approximate. Pixel estimates are rough (about 2.5 image px per CSS px).

### 3.2 Hash results

| Result | Detail **[H]** |
|---|---|
| Exam-exit dialog stands in for 20 captures | IELTS 07 to 15, `-01-top`: 10 files, one hash. `-02-scrolled`: 10 files, one hash. Vivo 11 to 15 are in both groups. |
| Report captures show the base page | `01b` = `01`; `02b` = `02`; `03b` = `03`; `05b` = `05`. Identical in all three positions for each pair. |
| Settings modal and settings dossier are the same screen | `04-settings-modal` = `05-settings-dossier` in all three positions. |
| Corner-compass captures are reading captures | `11-corner-compass-02` and `-03` = `01-reading-pass1-02` and `-03`. |
| Batch A "scroll shots identical" claim is wrong | Radar, 06b, 06c, 07, 08 and 12 scrolled shots are **not** identical to their tops. **[X]** |
| Batch C "writing cockpit = reading cockpit" is wrong | `06-exam-cockpit-writing` and `05-exam-cockpit-reading` differ. **[X]** |
| Batch B "lexicon scrolled = top" is wrong | `09-lexicon-drawer-01-top` and `-02-scrolled` differ. **[X]** |
| All 11 `flows/08-assessments` files are copies | `01` = `flows/01` placement result; `02` = `06b` intro; `03` = `06c` question; `04` = radar top; `05` = `08b` scorecard; `06` = `flows/06 02` launcher (also `02b` top); `07` = `flows/06 01` overview; `08` = `flows/06 03` passage list; `09` = `flows/06 05` section list; `10` = `flows/06 10b` top (what that shows is not confirmed); `11` = `flows/05 07` band modal. |
| Flows 06 bottom captures for report pages are copies | `01b-03` = `01-03`; `02b-03` = `02-03`; `03b-03` = `03-03`; `05b-03` = `05-03`. |
| `phone_real_current.png` is not an image | Starts with `ff fe eb 00 50 00 4e 00`, which is UTF-16 text, not the PNG signature. |

Totals: vivo 139 files, 19 duplicate groups, 35 extra copies, **104 distinct images**.

### 3.3 Coverage gaps and README mismatches

- **No current capture** of: IELTS band readiness report, reading, listening and speaking scorecards, speaking assessment feedback, taxonomy report, exam band modal, or IELTS views 07 to 15 (blocked). These must be recaptured.
- **No current desktop (1440px) capture** exists **[S]** for the rule set in CLAUDE.md.
- The five flows "bottom" captures have no vivo counterpart. Nine vivo "scrolled" captures have no flows counterpart.
- **README mismatches.** Batch A reports that `03-spotlight-tour` shows a streak toast and `03-mobile-drawer` shows a settings-shortcut list **[V]**. Batch A also reports `11-corner-compass` shows reading, and the hash check confirms it for `-02` and `-03` **[H]**. Batch E reports `popup-14` shows the full strategy page and `popup-15` shows the placement modal again **[V]**.

---

## 4. Views flow

Code-side route and overlay map, from the mapping pass. Every claim is **[C]** unless marked otherwise. Nothing was run.

### 4.1 Main app routes (hash router)

Routing lives in `web/src/core/router.ts` (route union line 1; valid list line 28; aliases 30-35). Unknown hashes fall back to `tree` (line 36). The mount switch is `web/src/main.ts:387-456`. Hash-only pseudo-routes `#placement` and `#quiz` open the placement quiz over the tree (`main.ts:272`).

| # | Route | Mounts | Reached from |
|---|---|---|---|
| 1 | tree (default) | SkillTreeView | HUD back button; bottom nav Tree; contextual dock Done; unclaimed Escape (`main.ts:525`); Blitz, Settings and Tenses back links; spotlight tour; any unknown hash |
| 2 | read | ReadingDossier | Skill-tree branch; compass 01; workout chip; alias `#reading` |
| 3 | write | WritingDossier | Tree branch; compass 02; alias `#writing` |
| 4 | listen | ListeningDossier | Compass 03; workout chip; alias `#listening`. **No skill-tree branch.** |
| 5 | speak | SpeakingDossier | Tree branch; compass 04; alias `#speaking` |
| 6 | vocab | VocabularyDossier | Compass 05; workout chip. **No skill-tree branch.** |
| 7 | colloc | CollocationsDossier | Tree branch; compass 06; Ctrl+K |
| 8 | grammar | GrammarDossier | Tree branch; compass 07; Tenses back link |
| 9 | tenses | TensesDossier | Compass 08; mobile sheet; grammar dossier link |
| 10 | habits | MissionLog | **Compass 09 only.** Compass is hidden on the tree, so this is two hops from the tree. |
| 11 | singularity | PerspectiveCanvas (no workspace) | Compass 00; completion receipt Close; canvas |
| 12 | blitz | BlitzDossier | HUD Blitz; bottom nav Blitz; tree espresso button |
| 13 | mediate | MediationDossier | HUD; mobile sheet; tree branch; hotkey M |
| 14 | analytics | AnalyticsDossier | HUD; mobile sheet |
| 15 | cockpit | ExamCockpitDossier | HUD; bottom nav; hotkey C |
| 16 | drills | DrillsDossier | Compass 10; mobile sheet |
| 17 | settings | SettingsDossier | HUD Settings; exam pill and countdown; mobile sheet |

Aliases only: `reading`, `writing`, `listening`, `speaking`.

### 4.2 IELTS app routes (`web/src/ielts/main.ts`)

Routes resolve at `ielts/main.ts:376-378`; the full list is at `:96-133`. Unknown hashes go to home. Primary nav is `PRIMARY_NAV` (`:56-66`, 9 items). A subnav banner (`:135-156`) appears for reading, listening, writing and speaking.

| # | Route | Reached from | Exits |
|---|---|---|---|
| 1 | home | Brand; nav Overview; unknown hash | Nav; 8 suite cards |
| 2 | diagnostic | Nav; home card | Nav; roadmap links |
| 3 | reading | Nav; home card; subnav; `path.ts:8` | Nav; link to drills |
| 4 | reading-drills | Subnav; home sub-link | Back to Full Passages |
| 5 | listening | Nav; subnav; home card; notification | Nav; subnav |
| 6 | listening-traps | Subnav; home sub-link | Subnav only |
| 7 | writing | Nav; subnav; home; diagnostic links | Nav; subnav |
| 8 | writing-studio | Subnav; home sub-link | Subnav |
| 9 | speaking | Nav; subnav | Nav; subnav |
| 10 | speaking-simulator | Subnav; home sub-link | Back to Speaking |
| 11 | vocab | Nav; `path.ts:71` | Nav |
| 12 | path | **Home card only** (`grep '#path'` = 1 hit) | Nav (highlights Overview) |
| 13 | strategy | Nav; home card; diagnostic link | Nav |
| 14 | mock | Nav; home card; diagnostic link; notification | Back to Mock Overview; nav |

Cross-app: IELTS to main is `<a class="ie-back" href="./index.html">` (`ielts/main.ts:272`), guarded by the exam check (`:299-316`). **Main to IELTS: no UI link** (section 2.10).

### 4.3 Main-app navigation chrome

- **Header HUD** (`modules/header-hud.ts`, render at `:125-213`): back button (`:557`), CEFR level chip (level picker), streak pill (tree, scroll to workout), budget (cycles 15/30/60, no navigation), exam pill (settings), mobile menu button (action sheet), RADAR (multi-skill modal), BLITZ, MEDIATION, ANALYTICS, COCKPIT (routes), EXPORT and IMPORT (file download and picker), LVL/XP pill (progression modal), toggles (cognitive mode, Zen, theme, locale, ambient, sound), TOUR (spotlight), Settings (route). On mobile (under 768px) most buttons are hidden except the streak pill and the menu button (`hud-base.css:1405`).
- **Mobile bottom nav** (`header-hud.ts:215-236`): Tree, Blitz, Radar (modal), Cockpit, More (action sheet). Hidden on desktop and on the cockpit. The contextual dock replaces it while a drill sets actions; its first item, Done, returns to the tree.
- **Mobile action sheet** (`header-hud.ts:720-995`): budget, exam, locale, progression, mediation, drills, analytics, tenses, mistake vault, commute audio, theme, sound, music, Zen, tour, export, import, settings. Close via header X, footer Close, backdrop, or Escape. Drills and Tenses set `window.location.hash` directly, bypassing the navigation callbacks.
- **Corner compass** (`modules/corner-compass.ts`, bottom right, hidden on tree and singularity): items 00 to 10. Not in the compass: Blitz, Mediation, Analytics, Cockpit, Settings. No Escape handler.
- **Skill tree** (`modules/skill-tree-view.ts`, `core/skill-tree-data.ts`): branches route to grammar, colloc, write, speak, read and mediate. **No branch for listen, vocab, habits, tenses or drills.** Workout chips are the only tree path to listen and vocab.
- **Keyboard** (`main.ts:463-529`): Ctrl/Cmd+K to colloc; M to mediate; C to cockpit; unclaimed Escape to tree.

### 4.4 Overlays

Legend: Esc = Escape handled by the overlay itself; BD = backdrop click closes.

| # | Overlay | Opener | Close controls | Esc | BD | Evidence |
|---|---|---|---|---|---|---|
| 1 | Placement quiz | First run; `#placement`; level picker; settings | Skip buttons | yes (= skip) | no | `placement-quiz.ts:57,82,110` |
| 2 | Multi-skill quiz / Radar | HUD Radar; bottom nav; level picker; settings | `Close` (results only) | yes | ? | `multi-skill-quiz-modal.ts:907,939` |
| 3 | Level picker | HUD level chip | `Cancel` | yes | no | `header-hud.ts:680,691` |
| 4 | Mobile action sheet | Menu button; bottom nav More | X and `Close` | yes | yes | `header-hud.ts:748,826,841,857` |
| 5 | Settings modal (`openSettingsModal`) | **None (dead code)** | `Close Settings` | yes | yes | `header-hud.ts:997-1240` |
| 6 | Status dialog | Import or export result | `OK` | Esc or Enter | no | `header-hud.ts:1360-1400` |
| 7 | Confirm dialog | Blitz and cockpit deactivate | Cancel / Confirm | yes | no | `header-hud.ts:1424-1470` |
| 8 | Progression modal | HUD LVL pill; sheet; settings | X, `Close`, backdrop | yes | yes | `progression-modal.ts:62-99,182` |
| 9 | Skill node modal | Tree node; perk badge | `Close` only | **NO** | **NO** | `skill-tree-view.ts:849-872` |
| 10 | Completion receipt | `onBatchComplete` | `Close` (also navigates to singularity) | **NO** | **NO** | `main.ts:532-574` |
| 11 | Welcome toast | First run | DISMISS / START TOUR (hard-coded English) | no | n/a | `main.ts:576-609` |
| 12 | Spotlight tour | HUD Tour; sheet; settings | X, Skip | yes | ? | `spotlight-tour.ts:129,142,283` |
| 13 | Lexicon drawer | Word clicks in dossiers | X, bottom Close, backdrop | yes | yes | `lexicon-drawer.ts:283,319,368-377` |
| 14 | Floating note window | Bubble; Alt+N | Minimize | yes (minimize) | n/a | `floating-note.ts:26,438` |
| 15 | Mistake Vault | Sheet; IELTS header Vault | X, `Close`, backdrop | **NO** | yes | `mistake-vault.ts:71,106,172` |
| 16 | Commute player | Sheet; IELTS header Audio | X (`Close Audio Player`), backdrop | **NO** | yes | `commute-audio-player.ts:297,348,398` |
| 17 | Zen pill | Zen toggle | X and Esc via ZenMode | yes | n/a | `zen-mode.ts:176-336` |
| 18 | Reading vocab drawer | Word click in Reading | `✕ Close` and bottom `Close` | yes | ? | `reading-dossier.ts:734,761,1221` |
| 19 | Cockpit test hub | Cockpit open or change test | **Only** `✕ Preview Exam Station (Untimed)` | **NO** | **NO** | `exam-cockpit-dossier.ts:475,515,1235` |
| 20 | Cockpit submit confirm | Submit | `Return to Test` | **NO** | **NO** | `exam-cockpit-dossier.ts:1592-1640` |
| 21 | Cockpit score report | After submit | `Close Score Report` / `Đóng báo cáo kết quả`; hub return; retake | **NO** | **NO** | `exam-cockpit-dossier.ts:1736-1870` |
| 22 | Mediation exemplar | Exemplar toggle | `Close` | **NO** | **NO** | `mediation-dossier.ts:870-905` |
| 23 | Notification toast | Notification engine | `x` (`Dismiss`) and 6s auto-dismiss | n/a | n/a | `notification-engine.ts:494-518` |
| 24 | Compass radial menu | Compass trigger | Re-click, outside click | **NO** | yes | `corner-compass.ts:146,172` |
| 25 | IELTS confirm dialog | Exam guard | Keep Working / Leave Exam | yes | no | `ielts/confirm-dialog.ts:62-115` |
| 26 | IELTS preflight rules | Writing view | Close button in markup | yes | ? | `ielts/views/writing.ts:73,155-158` |
| 27 | IELTS strategy tip | Strategy card | Bottom `Close`, backdrop | yes | yes | `ielts/views/strategy.ts:1018-1044` |

Route changes force-close most overlays (`main.ts:347-357`), so a stuck overlay clears on navigation. An unclaimed Escape while a no-Escape overlay is open navigates to the tree (`main.ts:525`).

### 4.5 Structural issues from the map

| Sev | # | Issue | Evidence **[C]** |
|---|---|---|---|
| P0 | E1 | No UI link from the main app to the separate IELTS app. Reached by notification deep links and by URL only. The in-app IELTS COCKPIT is a different surface. | Section 2.10 |
| P0 (probable) | E2 | IELTS page loads no `hud-base.css`, `dossiers.css` or `ux-c.css`, yet reuses overlays styled only there. Header Audio and Vault buttons and the writing preflight modal are likely unstyled. **Visual check needed before treating as confirmed.** | `ielts.html:14-18`; `ielts/main.ts:325,329`; `writing.ts:72` |
| P1 | E3 | Notification deep links `#collocations` and `#mistakes` are invalid and fall back to the tree. | `router.ts:28,36`; `notification-catalog.ts:237,396,596-623` |
| P1 | E4 | Cockpit test hub has one close control (`✕ Preview Exam Station`), with no Escape and no backdrop. Cockpit submit and mediation exemplar also lack Escape. | `exam-cockpit-dossier.ts:515` |
| P1 | E5 | Overlays without Escape fall through to `navigate('tree')`. On the cockpit submit modal, Escape leaves the exam route (the guard then stacks a second dialog). On Vault, Commute, node modal and receipt, it silently drops the user to the tree. | `main.ts:525`; `mistake-vault.ts`; `commute-audio-player.ts`; `skill-tree-view.ts:849` |
| P1 | E6 | `openSettingsModal` (240 lines) is dead code: no external caller. `closeActiveOverlay()` is never called and targets ids that no longer exist. | `header-hud.ts:253-259, 997`; no callers |
| P1 | E7 | Habits is reachable only from the compass (item 09). On mobile, the bottom nav and sheet have no habits item. Listen and vocab have no skill-tree branch. | `main.ts:385`; `corner-compass.ts:55`; `skill-tree-data.ts` |
| P2 | E8 | Compass and sheet gaps: the compass lacks Blitz, Mediation, Analytics, Cockpit and Settings. | `corner-compass.ts:19-62`; `header-hud.ts:768-822` |
| P2 | E9 | Singularity has no chrome back button on desktop. Exit is a canvas pillar click or Escape. | `main.ts:375-380`; `header-hud.ts:119` |
| P2 | E10 | Cockpit on mobile hides the bottom nav. The only exits are the header back chip, Done or hotkeys. | `ux-c.css:96-98` |
| P2 | E11 | `path` (IELTS) is reachable only from the overview "Guided 7.0 Path" card. | `ielts/main.ts:130,166` |
| P2 | E12 | Close labels for the same action vary: `Close`, `Cancel`, `Done`, `OK`, `Dismiss`, `Close Settings`, `Close Score Report`, `Return to Test`, `✕ Preview Exam Station`, `✕ Close`, `Keep Working`. VI `common.close` is a lone `Đóng`, which CLAUDE.md forbids, used by about eight modals. | `i18n.ts:17,18,42,115,634,1938,2554` |
| P2 | E13 | Hard-coded English in chrome: completion receipt body, welcome toast, HUD `BUDGET:`, `EXAM:`, `Ended`, `Gentle`, `Cockpit`, mobile sheet aria-label. VI users see mixed language. | `main.ts:541-556, 592-596`; `header-hud.ts:149-156, 201-202` |
| P2 | E14 | Completion receipt `Close` also navigates to singularity, so it is not a pure close. | `main.ts:566-571` |
| P2 | E15 | Duplicate `setBeforeNavigate` registration; only the last stays. | `main.ts:232-245` |
| P2 | E16 | Skill node modal has no Escape or backdrop. "Train Prereq" and "Practice Drill" both go to the same `routeTarget`, so the prerequisite is not targeted. | `skill-tree-view.ts:872-886` |
| P2 | E17 | IELTS `isIeltsTestInProgress` is a CSS-selector heuristic and may miss states on reading-drills, speaking-simulator and vocab. | `ielts/confirm-dialog.ts:16-45` |

No orphan routes were found (all 17 main and 14 IELTS routes have at least one entry). Three are weak entries: habits, path, and singularity exit. Two buttons "open nothing": the dead code in E6 and the notification deep links in E3.

---

## 5. Prior audits (dedupe)

Still open as of 2026-10-20 per `docs/audits/STATUS.md` (already triaged there): JS animation loops in `particle-canvas`, `perspective-canvas`, `corner-compass` and `speaking-dossier` against the in-app Motion setting (a later entry says these were fixed; needs confirmation); large-file split (`audio-synthesizer.ts` 2,711 lines, `speaking-dossier.ts` 2,153); Defender exclusion for `web/release`; IELTS answer keys checked by script, not by a human; 11 habit days with two tasks; 5 pre-existing npm test failures; duplicate vocabulary words (journey, opinion).

The 49 findings in `docs/UI_UX_DESIGN_AUDIT_REPORT.md` (UX-n) and `docs/BRUTAL_UI_UX_AUDIT_AND_CRITIQUE.md` (BR-n) were checked against code at `e651436`. Full table: Appendix A.

| Status | Count |
|---|---|
| Fixed | 25 |
| Still present | 7 |
| Partial | 4 |
| Cannot verify from code (needs a 360px capture) | 13 |

Still present **[C]**:

1. `hud-base.css:634-635` and `ux-c.css:160,178`: back and level buttons stay 36px on touch (UX-1.3a, UX-1.3b). Spec floor is 44px.
2. `dossiers.css:2473-2474`: progression close button is 32px (UX-4.3b).
3. `dossiers.css:182,1101,1200,3237`: nav and header widths are 680px, not the 760px card column (UX-3.1).
4. `dossiers.css:3177,3194`: lexicon drawer uses `82vh` (UX-4.2b). Use `dvh`, as the settings modal does.
5. `dossiers.css:8623`: blanket `var(--radius-md, 8px) !important` (UX-3.4). Conflicts with the 10px button token.
6. `dossiers.css:8166,8236`: `.dossier-tenses` 1080px and `.tenses-card-question` 820px (UX-3.1b).

Partial: UX-5.4a (`.cd-theme-select` 11px; floor in `ux-c.css:65`), UX-5.4b (13px body text on inputs), BR-1.1 (skill-card taglines clamp to two lines, not one line with ellipsis), BR-2.1 (bottom-dock clearance present at `dossiers.css:645,2431`; per-view coverage unverified).

Cannot verify from code: BR-1.2 to BR-1.5, BR-4.1, BR-4.2, BR-5.2, BR-6.1 to BR-6.4. These need a 360px capture.

---

## 6. Screen findings by flow

Organised by the README flow folders. P0 and the most important P1 items are listed. P2 counts are given per flow. IDs are the reviewers' own (A-, B-, C-, D-, E-, F-). Where a reviewer's report did not name a file, the item is marked "file not identified".

### 6.1 Flow 01-02: onboarding, navigation and HUD (vivo, batch A) **[H, V]**

Current capture. Five P0 items:

| ID | Screen | Observed | Fix |
|---|---|---|---|
| A-18 | 04-settings-modal-02 (identical to 05-settings-dossier-02) | "BẬT" badge breaks into "BẬ / T" | Badge is `nowrap`, spec rule |
| A-24 | 06-celestial-radar-01 | Axis and ring labels about 5px, overlapping | 11px floor; enlarge chart |
| A-25 | 06-celestial-radar-01 | WRITING row clipped; no close or save visible | Visible exit; full row |
| A-30 | 07-rpg-progression-01 | "THÀNH TỰU" button with clipped semicircle artifact; low contrast | Fix button shape and contrast |
| A-35 | 09-star-map-canvas-01 | Node labels about 4px, overlapping | Zoom-to-fit or larger labels |

P1 highlights:

- Notes button covers content on the deck, settings, star map and reading (A-09, A-17, A-36, A-41). Section 7, S1.
- Timer shows "00:60" (A-38). Section 7, S2.
- Commute player shows the answer before play (A-43).
- Skill cards show "43% 4/8" and "53% 3/5": percentage and fraction disagree (A-08).
- Developer jargon in learner copy: "SÁNG KIẾN 21", "Apple-calm", "760px" (A-21, A-22). Section 7, S11.
- Mixed EN/VI in the streak toast, Mistake Vault card and reading tabs (A-04, A-33, A-40).
- "8 PHENOMENA" badge wraps to two lines (A-33). Badge rule.
- Double focus ring on primary CTAs (A-01).
- Radar level chips and 1-to-5 strips under 44px (A-26, A-27).
- Mistake Vault "Đóng" cut off at the viewport bottom (A-32).
- Multi-skill question modal has no visible exit (A-29).
- Star glyph on the deck kicker (A-10). File not confirmed; check whether it is ☆ (allowed) or ✦/★ (banned).

P2: about 16.

### 6.2 Flow 03: four-pillar labs, reading and writing (vivo, batch B) **[H, V]**

| ID | Screen | Observed | Fix |
|---|---|---|---|
| B-08 | 05-writing-diff-03 | WPM shows 0 after 9 words in 3 seconds; errors show 164 for 79 characters; 25% accuracy in green | Fix the metric calculation. **Not located in code.** |
| B-09 | 05-writing-diff-02/03 | Error-analysis panel unreadable ("ORvaer-the-Ipast-five") | Check diff renderer letter-spacing and struck-text overlay (see F-10 and S14) |
| B-47 | 04-writing-type-01, 06-listening-01, 02-vocab-back-01 | Notes button (about 144×43px) covers CTA labels | Section 7, S1 |

P1 highlights:

- Reading timer "00:60" (B-01). S2.
- Reading tabs: search icon floats about 36px from its label; labels wrap; only the left tab is pill-shaped (B-02).
- Zen mode: no header, back or bottom nav; about 100px black void at the top; side inset about 32px (B-06). Dead end.
- Rating buttons in English in a 2×2 grid, while the vocab cards use Vietnamese in one row (B-10). S3.
- Tab pills wrap to two lines in listening (B-13).
- Speaking mode tabs are two plus two full-width rows; active tab is outline-only (B-16). S5.
- Middle label in "Học lại / Lật xem đáp án / Nhớ tốt" is smaller and nearly touches its border (B-18).
- Bordered boxes inside bordered cards (B-27; also in flow 04). S4.
- Stat labels inline with values; values wrap (B-29, flow 04).

P2: about 15 (English strings in a Vietnamese screen, arrow glyph problems, label case).

### 6.3 Flow 04: mastery foundations (vivo, batch B) **[H, V, C]**

| ID | Screen | Observed | Fix |
|---|---|---|---|
| B-38 | 09-lexicon-drawer-01/02 | "+ Add to S…" half-covered by Notes; button cut by bottom nav; example clipped. The scrolled and top shots are **not** identical **[X for that claim]**. | Sticky footer above the nav; scrollable body |
| B-35 | 08b-scorecard-01 | 11/12 (92%) with one ✗; copy says "độ chuẩn xác tuyệt đối" **[C]** | Top tier for 100% only, or reword (section 2.9) |
| B-36 | 08b-scorecard-01/02 | Title wraps, orphan "THÌ"; no link to review the wrong tense | Full-width CTA; review link |
| B-37 | 08-gauntlet-01/02 | "Pronounce" in English where the drill says "Phát âm"; "QUESTION 1 OF 12" in English | Localise |

P1 highlights:

- Vocab segmented tabs unequal; gutter 16px here vs 12px elsewhere (B-20). S5, S8.
- Definition paragraph runs the Vietnamese gloss inline (B-22).
- Lexicon chips about 29px tall with about 5px gaps (B-25). S6.
- List card "0004 make a mistake" clipped at the panel bottom (nested box) (B-26).
- Stat labels inline with values (B-29).
- Tenses drill hint label "DẤU HIỆU NHẬN BIẾT" crushed into a ~35px column, four lines (B-30).
- Tenses codex "PRESENT" badge stretches to title width (B-32).
- Tenses question card: options and hint sit inside bordered boxes (B-27). S4.
- Cambridge drills: tab row unequal and in English; title centred (B-40).
- Email builder: eight phrase tiles show the selected outline while "YOUR DRAFT" is the empty placeholder (B-44). Tone slider thumb about 14px (B-45).

P2: about 25.

### 6.4 Flow 05: speed, mediation and habits (vivo, batch C) **[H, V, C]**

- **P0 (C-24, file not identified):** exam band modal score-bar labels run together ("Band 0.0Band 5.0Band 6.5Band 7.5Band 9.0") and there is no visible close button. The batch C report does not name the file. The band modal exists in the vivo set only through the copies noted in section 3.2, so treat C-24 as **unverified**. D-33 reports the same labels on the flows 08 copy.
- **P1 (C-19):** analytics header says "Target: Band 7.5"; the chart target and day-30 point are at 7.0 **[V]**.
- **P1:** exam cockpit reading shows "Engineerin…" with an ellipsis (S7).
- **P1:** radar and chart axis labels about 8px (S13).
- **P1:** bordered boxes nested in bordered cards (S4).
- **P2:** English and Vietnamese mixed within screens (S3).
- C-02 ("writing cockpit = reading cockpit") is **[X]**. The bytes differ.

### 6.5 Flow 06: IELTS academic, vivo 01 to 10b (batch C) **[H, V, C]**

Current capture, with copies removed.

- **P0 (C-40, C-41):** reading drill synonym table breaks "straightforwa/rd" mid-word; bottom buttons crushed ("← Quay lại" wraps to two lines; the second button is hidden).
- **P1 (C-31):** overview shows band tiles 7.0 and 7.5 with an overall 7.5, but the card says "Chưa sẵn sàng cho 7.0" and "đã làm 0/2 bài thi thử". Data inconsistency.
- **P1 (C-35):** "Đánh giá Tiến độ (0/20)" is enabled with 0 answered and covered by the Notes button. Section 4.4 (diagnostic submit).
- **P1:** IELTS overview cards have no visible tap affordance or arrows (BR-6.2, E-61).
- **P1:** IELTS listening passage cards have no start CTA (C).
- **Copies (H):** `01b`, `02b`, `03b`, `05b` show the base pages (section 3.2). Their band and report content has not been seen.

### 6.6 Flow 06, vivo 11 to 15 (batch D) **[H]**

Not audited. All 10 files are the exam-exit dialog (section 2.8). D-01 is confirmed.

### 6.7 Flows 07 and 08: widget and assessments (flows, batch D) **[S, H]**

- **Flows 07 widget (D-05):** Quests tab says "2/3 Done (67%)" and the bar is about 67%, but the checklist shows only "15 SRS Cards". Standard size says "Lv.4 • 2/3 Quests". Count, bar and checklist must agree.
- **Flows 08:** all 11 files are copies of screens in other folders **[H]**, so these assessments were not audited. The items below come from the reviewer's reading of the copied images. Re-check them against the real screens after recapture.
  - Radar copy (same bytes as `flows/02` radar top, which batch A also reviewed as A-24 and A-25): "Làm lại Chẩn đoán" overflows and crowds "Đóng" (**P0** D-15); axis labels about 6px (D-13); heading says "5 TRỤC" with six rows listed (D-14).
  - Level chips about 28×32px (D-16). Pill clipped at right edge (D-17). Header buttons about 47×35px (D-24). Back link "← Về English Sing" clipped mid-word by the IELTS 7.0 badge (D-23, also in flows 06).
  - Gauge labels off-scale (D-33). Gaps of 0 to 4px between text blocks (D-34). Double outline on "Danh sách đề" (D-35).

### 6.8 Flows 06 bottom captures (flows, batch D) **[S, V]**

- Writing prompts (D-37): titles clipped with an ellipsis. S7.
- Blueprints (D-38, D-39): bordered placeholder inside an outlined card; phrase chips about 42px; copy button enabled at 0 words.
- Strategy codex (D-40, D-41): meta layout and badge colour differ between cards; a prose formula is in mono.
- Mock exam (D-42): "Chưa sẵn sàng cho 7.0" beside tiles 7.0, 7.5 and overall 7.5, with "0/2 mock tests" and no CTA.
- Strategy modal bottom (D-44): shows the strategy list, not the modal with examiner notes and close. Filled gold stars "⭐ 3.4" (D-45). No ⭐ in code **[C]**, so likely stale.

### 6.9 Older desktop captures (screenshots 01 to 36, batch F) **[S]**

- **P0:** speaking studio action row clipped; "Flip Reveal" keycap cut to "SP." (F-13). Habits day strip clipped at "21" with days 22 to 30 not visible (F-22). Star-map labels about 6px (F-35).
- **P1:** toolbar wraps to two right-aligned rows about 160px tall (F-03). Stepper labels about 10px, under the 11px floor (F-06). Zen mode keeps all chrome; only the content narrows (F-08). Garbled diff line (F-10, same as B-09). Level tab pills about 32×20px (F-23). RPG modal captured scrolled with no title or close (F-28). "INITIATIVE 21" jargon (F-30). Stats box with zero padding (F-20).
- **P1, code-verified:** "1 speakers" (F-50, section 2.9). "46 blueprints" vs 71 cards (F-54, section 2.9).
- **P2:** 25.

### 6.10 Older popups, floating note and flow-mobile (screenshots, batch E) **[S]**

`phone_real_current.png` is excluded (E-01, not a valid image **[H]**).

- **P0:**
  - Mobile drawer: half-clipped button inside a fixed-height scroll box (E-07).
  - Dropdown shows "Tieu c…" with an ellipsis; tab strip about 20px tall (E-20).
  - IELTS mobile header overflows: right icon cut, section tabs clipped (E-22).
  - Language toggle shows a blank Vietnamese pill; "Đóng" button clipped (E-35).
  - Exam submit counts glued: "Đã làm40 Chưa làm0 Gắn cờ" (E-37).
  - Speaking kicker ellipsis; 350px card on a 1440 page; overlapping action text (E-44).
  - Gauntlet stat labels collide; "Ease 2.50 (standard tier)" leaks internal data (E-47).
  - Floating button covers "NỘP BÀI" submit (E-54).
  - IELTS filter row: selects float apart; search is an empty 380×240 rectangle; "1,502" vs "1502" (E-67).
  - Maximized floating note runs off the right and bottom; header buttons cut off (E-73).
  - Scratchpad title clipped; roadmap header covered on small screens (E-75).
- **P1 highlights:** lone "Đóng" as the only close (E-08, E-27, E-31); bracketed labels "[ … ]" and mixed names (E-34); emoji on buttons (E-36); MASTERED shown with TOTAL REVIEWS 0 and STREAK 0 DAYS (E-39); raw IDs like `BE_AND_HAVE` (E-48); floating-note stars "☆" and "★" (E-71). The "★" is **[S]**, since current code has no ★.
- **P2:** 22.

---

## 7. Cross-cutting issues (the systemic causes)

These cut across flows. Each appears in several batches.

| ID | Issue | Evidence | Root cause | Fix |
|---|---|---|---|---|
| S1 | Floating Notes button covers CTAs and content | A-09, A-17, A-36, A-41; B-47, B-48; C ("about 40 of 59 top shots"); E-41, E-54, E-74 | Fixed button with no reserved bottom clearance (`floating-note.css`, `modules/floating-note.ts`) | Reserve bottom clearance (84px dock plus safe area) or move the button into the top bar on phones; hide it while a modal is open |
| S2 | Timer shows "00:60" | B-01, A-38, E-10, E-41 | **Located:** `modules/reading-dossier.ts:827, 987` hard-code `00:` before the seconds (section 2.9) | Format minutes and seconds properly; test the 60-second rollover |
| S3 | Mixed EN/VI and untranslated copy | B-03, B-10, B-11, B-37, B-40; C (many); D-11, D-28; E-24, E-27, E-30, E-31; F-25; E13 | Hard-coded English strings and `t()` fallbacks in templates | Route all visible copy through i18n; add a check for English strings in VI mode |
| S4 | Bordered boxes inside bordered cards (double outline) | B-27, D-21, D-31, D-38; E-19, E-42, E-66; F-26, F-29, F-45 | Inner stroke on nested containers in `dossiers.css` and `ux-c.css` | Tonal fill on the inner box; zero inner stroke (spec rule) |
| S5 | Tabs and segmented controls with unequal widths | B-16, B-20, D-15, E-11, E-14, F-37 | Missing `grid-template-columns: repeat(N, 1fr)` on tab rows | One shared tab-row class with equal columns and one-line labels |
| S6 | Tap targets under 44px | A-26, A-27; B-25, B-49; D-16, D-24; F-23; E-74; C (day cells, chips, back link) | 36px buttons at `hud-base.css:634` and `ux-c.css:160,178`; detector uses 40px with `&&` (`capture-vivo-audit.cjs:144`) | 44px floor on touch; fix the detector |
| S7 | Clipped or ellipsis-truncated text | D-23, D-37; E-20, E-44, E-72, E-75; C ("Engineerin…"); E-60 (IELTS 21 chips) | The 10 mobile ellipsis rules (section 2.7) | Let labels wrap; remove the ellipsis rules |
| S8 | Screen inset is 12px, not 24px | B-50, E-23; A-12; B-06 | Spec contradiction (section 2.1) | Decision (section 10) |
| S9 | Dead ends and missing exits | A-25, A-29, A-32; B-06, B-36, B-46; C (exam band report, listening cards); D-07, D-12; E-65, E-68; lone "Đóng" in E; E4, E5 | Overlays not wired to a visible close; Escape-only exits on touch | Add a visible close to every overlay; hide the keyboard hint on touch |
| S10 | Wrong or inconsistent data | B-08, B-35 **[C]**; A-08, A-43; C-19, C-31; D-05, D-14, D-42; E-37, E-39, E-47, E-48; F-50 **[C]**, F-54 **[C]** | Hard-coded strings (strategy count, grade copy), missing plural forms, calculation errors (WPM, accuracy) not located | Compute counts and copy from data; test the score tiers |
| S11 | Developer jargon and internal labels shown to learners | A-21 ("SÁNG KIẾN 21"), A-22 ("Apple-calm", "760px"); F-30 ("INITIATIVE 21"), F-56 ("Band 9.0 Conversion Modal"); E-47 ("standard tier"); E-48 (raw IDs) | Debug labels left in templates | Strip internal labels; map IDs to display names |
| S12 | Decorative glyphs | ✨ on kickers (`core/i18n.ts:1880`, notification titles); ☆ on titles (allowed); emoji on buttons (E-36, E-62); ⭐ and 👁 (D-45, D-46) | Glyphs in i18n strings | Remove ✨; keep ☆ only where the spec allows it |
| S13 | Text below the 11px floor | A-24 (5px), A-35 (4px), D-13 (6px), F-35 (6px), E-06 (9–10px), E-28, E-32; C (about 8px chart labels) | Literal font sizes; chart labels not tokenised | Map to the kicker token; tokenise chart labels |
| S14 | Diff renderer garbles text | B-09 ("ORvaer-the-Ipast-five"), F-10 ("M Rarely h a m ve i n s") | Wide letter-spacing and struck-text overlay in the diff view (not located) | Word-level diff with normal spacing |

---

## 8. Fix plan (prioritized)

Each item names the check that proves it is done.

**P0: fix the evidence, then the worst visible breakage**

1. **Fix the detector.** In `scripts/capture-vivo-audit.cjs`: add an inner-overflow check (`scrollWidth > clientWidth + 1` on buttons, chips and tabs, excluding real scroll containers); fail tap targets under 44px on touch; write the report even when empty, with a count. *Done when:* the 2026-10-29 `#tree` and `#read` overflows reproduce on the current build.
2. **Add a duplicate check to the capture script.** Fail the run when two captures share a hash, and name the pairs. *Done when:* the run would have flagged the 19 groups in section 3.2.
3. **Fix the exam-exit guard** (`ielts/confirm-dialog.ts:16-24`). Replace the DOM probe with an explicit exam state. *Done when:* IELTS views 07 to 15 render their own content, and the dialog appears only during a running test.
4. **Recapture the missing screens:** band readiness, the three scorecards, speaking assessment feedback, taxonomy report, exam band modal, IELTS views 07 to 15, and the flows 08 screens. *Done when:* no capture is byte-identical to another capture of a different screen.
5. **Reserve space for the Notes button** (S1). *Done when:* the detector finds no CTA overlapped by the button at 360px and 390px.
6. **Fix the data bugs with known causes:**
   - Tenses top tier (section 2.9). *Done when:* 11/12 shows neutral-positive copy and only 12/12 shows the "absolute" wording.
   - "1 speakers" (`core/i18n.ts:731`). Add a singular form. *Done when:* 1 shows "1 speaker".
   - Hard-coded "46" (`ielts/views/strategy.ts:676, 692`). Use the live count. *Done when:* the tab and the badge agree.
   - Timer (`reading-dossier.ts:827, 987`). Format minutes and seconds. *Done when:* 60 seconds shows as "01:00".
   - Writing-diff WPM and accuracy (B-08). Find the calculation first.
   - Overview tiles vs "not ready" text (C-31, D-42). Reconcile with the data.
   - Diagnostic submit at 0 answers (C-35, E-58). Disable until at least one answer.
7. **Add visible exits** to the radar result, multi-skill question, exam band report, Mistake Vault, and Zen mode (S9). Replace the cockpit hub's single close with a visible one. *Done when:* every overlay has a visible close control reachable by touch.
8. **Decide how IELTS is reached** (section 10, decision 5). Either add a visible entry point in the main app, or document that the separate IELTS app is reached only by notification links and URL. *Done when:* the decision is recorded and the IELTS app's navigation matches it.
9. **Fix the broken IELTS reading drill** (C-40, C-41). *Done when:* the synonym table does not break words and the bottom buttons do not wrap.
10. **Fix the invalid notification routes** (`#collocations`, `#mistakes`) in `core/notification-catalog.ts`, or add the aliases to the router. *Done when:* each notification lands on its intended view.

**P1: rule conflicts and visible spec violations**

11. **Check the IELTS app's styling** (E2). Load the missing stylesheets, or confirm the overlays do not need them. *Done when:* the Audio, Vault and preflight overlays render correctly in `ielts.html`.
12. **Choose one screen inset** (section 10, decision 1). Apply the chosen value in `variables.css` and update the four documents to match.
13. **Restore or re-point the gold reference** (section 10, decision 2).
14. **Remove mobile ellipsis** (S7). Replace the 10 confirmed rules and the other 15 with wrapping. *Done when:* no `text-overflow: ellipsis` remains under `@media (max-width: 768px)`.
15. **Shared tab-row and touch-target fixes** (S5, S6). Apply once in the shared components, not per screen. *Done when:* every tab row has equal columns and every touch control is at least 44px.
16. **Remove nested double outlines** (S4). *Done when:* no bordered box sits inside a bordered card on the reviewed screens.
17. **Replace off-scale font sizes** (`19px`, `18px`, `13.5px`, `11.5px`, and the sub-11px labels in S13). Remove the duplicate `--radius-btn` at `variables.css:301`. *Done when:* no literal font-size outside `variables.css` and one `--radius-btn` definition.
18. **Strip developer jargon and sparkle glyphs** (S11, S12). Replace or delete the strings listed in those rows. *Done when:* the strings no longer appear in `i18n.ts` or the screens.
19. **Fix the writing-diff rendering** (S14). *Done when:* the diff line reads as normal words.

**P2: maintainability and drift**

20. Bring the tour overlay into the z-index scale (`tour-spotlight.css` 100000 to 100005) and replace the other literal `z-index` values by token.
21. Correct the breakpoint comments at `hud-base.css:793, 984, 1360, 1381`.
22. Stop adding `!important` to `ux-c.css`. Fold overrides into base rules when each screen is touched. A multi-week job.
23. Move the inline `style="..."` attributes in the most-touched modules (`header-hud.ts`, `progression-modal.ts`, `mission-log.ts`) to classes.
24. Replace the 13 hard-coded `'JetBrains Mono'` declarations with `var(--font-mono)`.
25. Fix the prior-audit items still present in section 5 (items 1 to 6).
26. Remove the dead code in E6 (`openSettingsModal`, `closeActiveOverlay`).

---

## 9. What is not verified

- **No browser run.** Every visual claim comes from a captured image or from a reviewer's report. Pixel sizes are estimates.
- **The vivo detector was read, not run.**
- **The flows and screenshots folders predate the last commit** and are marked [S]. Only the vivo folder is current.
- **Hash checks prove duplication, not what a screen shows.** Where a copy's content was described by a reviewer, it is [V].
- **Reviewer claims were not re-checked one by one.** Only those marked [H] or [C] were verified. Batches A and C had claims that the hashes contradicted (section 3.2).
- **Four reviewers could not write their own files** (the write was refused). Their findings are condensed in this file. The full per-row tables are not on disk.
- **Not located in code:** the writing-diff WPM and accuracy calculation (B-08), and the diff renderer's letter-spacing (B-09, F-10).
- **The exam-guard root cause is code-verified, not reproduced in a browser.**
- **The IELTS overlay styling problem (E2) is probable, not confirmed.**

---

## 10. Advice and decisions needed

My recommendation, in order:

1. **Fix the evidence first.** Do items 1 to 5 of section 8 before judging any layout. Without them, every "0 defects" and every "wrong screen" is unreliable in both directions.
2. **Then fix the data and dead-end P0s** (items 6 to 10). These cause the worst user harm: wrong scores and counts, screens with no exit, and broken notification links.
3. **Then the systemic CSS work** (items 11 to 19), done once in shared components. Per-screen patches add to the 2,414 `!important` declarations and make the next fix harder.

Decisions I need from you:

1. **Screen inset.** 12px (what the code and every mobile capture use) or 24px (what CLAUDE.md says)? My recommendation: 12px on mobile, and a single 24px desktop value under `(width > 768px)`. That matches the spec's tier table. Then update CLAUDE.md, AGENTS.md and `canonical-spacing.md` to say the same thing.
2. **Gold reference.** The image is recoverable from git history: `git show 2a60e47~1:Mobile/1.0.0/37-mobile-ielts-writing.png`. Should I restore the folder (`git checkout 2a60e47~1 -- Mobile/1.0.0`), or do you want the rules to point at a file that is still in the repo? My recommendation: restore it, since four rule documents already depend on it.
3. **Gate.** Should the fixed detector run as a gate, and at which widths? My recommendation: 360 and 390 for mobile, 1440 for desktop, failing on any inner overflow, touch target under 44px, or duplicate hash.
4. **Sparkle and star glyphs.** Remove ✨ from kickers and notifications, and keep ☆ only where the spec allows it? My recommendation: yes.
5. **IELTS entry point.** Should the separate IELTS app get a visible link from the main app, or stay reachable only by notification and URL? The in-app cockpit already offers IELTS mock content. My recommendation: decide this before fixing the IELTS overlays, because the answer changes which app needs styling and navigation work.
6. **Score wording.** Should "absolute accuracy" be reserved for 100%, with a separate neutral-positive comment for 85% to 99%? My recommendation: yes.

---

## Appendix A. Prior audit status (49 findings, checked against code at `e651436`)

Paths are relative to `web/src`. IDs: UX-n = `docs/UI_UX_DESIGN_AUDIT_REPORT.md`; BR-n = `docs/BRUTAL_UI_UX_AUDIT_AND_CRITIQUE.md`.

| Source | ID | Finding (short) | Status | Evidence | Note |
|---|---|---|---|---|---|
| UI_UX | UX-1.1 | 20 arbitrary breakpoints (600/640/760/800/900/1100/480/840) | FIXED | no such `@media` left in assets/styles, ielts.css (only comments hud-base.css:793) | remaining hits are max-width properties, not queries |
| UI_UX | UX-1.2 | 10px literal in toast kbd | FIXED | assets/styles/apple-toast.css:77 (kicker token) | |
| UI_UX | UX-1.3a | .hud-btn.btn-back-tree/btn-level 36px | STILL PRESENT | assets/styles/hud-base.css:634-635 | not fine-pointer gated |
| UI_UX | UX-1.3b | ux-c.css mobile header btns 36px | STILL PRESENT | assets/styles/ux-c.css:160,178 (min-width 36px !important) | |
| UI_UX | UX-1.3c | .apple-toast-btn ~24px tap | FIXED | apple-toast.css:60 min-height 44px | |
| UI_UX | UX-1.4a | missing --radius-pill | FIXED | variables.css:75 | |
| UI_UX | UX-1.4b | --pad-btn 8px 16px | FIXED | variables.css:188 (8px 18px) | |
| UI_UX | UX-1.4c | 3px radius on deck progress bar | CANNOT VERIFY FROM CODE | grep for `border-radius: 3px` in hud-base.css returned 0 | likely fixed; low severity |
| UI_UX | UX-2.1 | synonym table unwrapped in reading-drills | FIXED | ielts/views/reading-drills.ts:570 `.ie-table-wrap` | |
| UI_UX | UX-2.2 | ielts.css 640/760 queries | FIXED | no such @media in ielts.css | |
| UI_UX | UX-2.3 | .ie-diag-filter-tabs missing from mobile scroll list | FIXED | ielts/ielts.css:1393 | |
| UI_UX | UX-2.4 | test host div unstyled | FIXED | reading.ts:636, listening.ts:202, mock.ts:98 use `ie-stage` | |
| UI_UX | UX-3.1 | 680px nav/header vs 760 card | STILL PRESENT | assets/styles/dossiers.css:182,1101,1200,3237 (680px) | |
| UI_UX | UX-3.1b | .dossier-tenses 1080px / .tenses-card-question 820px | STILL PRESENT | dossiers.css:8166, 8236 | |
| UI_UX | UX-3.2a | #btn-module-toggle 10px | FIXED | no 10px literal in dossiers.css | |
| UI_UX | UX-3.2b | skill-tree-view 10.5px CEFR badge | FIXED | no 10.5px in modules/skill-tree-view.ts | |
| UI_UX | UX-3.3 | 11 arbitrary media queries in dossiers.css | FIXED | none found by @media grep | |
| UI_UX | UX-3.4 | blanket 8px radius override | STILL PRESENT | dossiers.css:8623 `var(--radius-md, 8px) !important` | |
| UI_UX | UX-3.5 | ellipsis on grammar/listening dossier prompts | FIXED | no `ellipsis` in modules/grammar-dossier.ts, listening-dossier.ts | |
| UI_UX | UX-4.1 | tour buttons lack .tour-card-actions class | FIXED | core/spotlight-tour.ts:140 | |
| UI_UX | UX-4.2a | multi-skill modal 90vh | FIXED | no 90vh in modules/multi-skill-quiz-modal.ts | |
| UI_UX | UX-4.2b | lexicon drawer 82vh | STILL PRESENT | assets/styles/dossiers.css:3177,3194 | |
| UI_UX | UX-4.3a | .tour-card-close 28px | FIXED | tour-spotlight.css:264-265 (44px) | |
| UI_UX | UX-4.3b | .progression-btn-close 32px | STILL PRESENT | dossiers.css:2473-2474 | |
| UI_UX | UX-4.4 | settings modal no max-height/dvh | FIXED | modules/header-hud.ts:1005 max-height 90dvh; overflow-y auto | |
| UI_UX | UX-5.1 | smart quotes stripped before normalise | FIXED | modules/listening-dossier.ts:44-47 normalises first; multi-skill-quiz-modal.ts:285 | |
| UI_UX | UX-5.2 | undo-manager Ctrl+Z precedence bug | FIXED | core/undo-manager.ts:19 early return when editing | |
| UI_UX | UX-5.3 | haptics mute desync | FIXED | core/acoustic-haptics.ts:13; audio-synthesizer.ts:464,659 call setMuted | |
| UI_UX | UX-5.4a | .cd-theme-select 11px !important on mobile | PARTIAL | dossiers.css:6132 is font-size kicker (11px), no !important now; 16px floor in ux-c.css:65 | confirm floor wins on phone |
| UI_UX | UX-5.4b | inline inputs 13px (body-compact) | PARTIAL | multi-skill-quiz-modal.ts:361,675; header-hud.ts:1010 use --font-body-compact (mostly non-input text) | needs check whether any input/select still uses it |
| UI_UX | UX-5.5 | speaking compression-table unwrapped | FIXED | modules/speaking-dossier.ts:889 wrapper; dossiers.css:1389 | |
| BRUTAL | BR-1.1 | skill-card subtitles truncated "Hermeneu..." | PARTIAL | taglines still long: core/skill-tree-data.ts:518; deck-branch-tagline clamp ux-c.css:1428 | clamp 2 lines, not ellipsis one-line; needs 360px screenshot |
| BRUTAL | BR-1.2 | "0 / 14" wraps to 2 lines | CANNOT VERIFY FROM CODE | ielts/views/reading-drills.ts:450,505 renders "0 / 14" in `.ie-hud-num` | no nowrap seen; screenshot at 360 settles it |
| BRUTAL | BR-1.3 | orphan "ĐỔI" on grammar card | CANNOT VERIFY FROM CODE | visual wrap | |
| BRUTAL | BR-1.4 | habit day carousel clipped "0..." | CANNOT VERIFY FROM CODE | visual | |
| BRUTAL | BR-1.5 | Back button "← Về English ..." ellipsis | CANNOT VERIFY FROM CODE | visual | |
| BRUTAL | BR-2.1 | content under bottom dock (reading, speaking, settings) | PARTIAL | safe-bottom-dock padding at dossiers.css:645,2431 | per-view coverage needs device check |
| BRUTAL | BR-3.1 | Placement modal mixed EN/VI | FIXED | core/i18n.ts:3074-3079 vi title/intro/buttons all VI; en 1154-1159; modules/placement-quiz.ts:76-82 via t() | |
| BRUTAL | BR-3.2 | "Phím cách" hint on touch | FIXED | no "Phím cách" in code; listening.flip_hint i18n.ts:3508 no spacebar | |
| BRUTAL | BR-3.3 | CEFR labels "A1 (A1)" | CANNOT VERIFY FROM CODE | no matching template found in header-hud.ts | probably fixed |
| BRUTAL | BR-4.1 | progression modal 5 concentric borders | CANNOT VERIFY FROM CODE | visual; rule in dossiers.css/ux-c.css | screenshot needed |
| BRUTAL | BR-4.2 | speed blitz nested bordered cards | CANNOT VERIFY FROM CODE | visual | |
| BRUTAL | BR-5.1 | `✦` on drawer title and grammar tab | FIXED | 0 matches for ✦ in *.ts/*.css/*.html under web/src; drawer title header-hud.ts:746 uses menu icon | |
| BRUTAL | BR-5.2 | rainbow neon borders in mobile drawer | CANNOT VERIFY FROM CODE | header-hud.ts:740-800 still has inline hex border colours (10 hits) | check inline styles vs screenshot |
| BRUTAL | BR-5.3 | dashed pill borders (speaking) | FIXED | only `dashed` mention is a purge comment ux-c.css:2229 | |
| BRUTAL | BR-6.1 | IELTS home cards bloated by bottom CTA | CANNOT VERIFY FROM CODE | visual | |
| BRUTAL | BR-6.2 | IELTS reading/writing cards no tap affordance | CANNOT VERIFY FROM CODE | no card-arrow class found in ielts.css | needs screenshot |
| BRUTAL | BR-6.3 | writing blueprints 3-tier controls | CANNOT VERIFY FROM CODE | visual | |
| BRUTAL | BR-6.4 | speaking sim button widths unequal | CANNOT VERIFY FROM CODE | buttons ielts/views/speaking-simulator.ts:704-705,780 | screenshot |

Counts (49 rows): FIXED 25; STILL PRESENT 7; PARTIAL 4; CANNOT VERIFY FROM CODE 13.
