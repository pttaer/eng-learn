# Audit Closeout Status

Date: 2026-10-03. Checked against current `web/` tree. **44 items: 18 resolved, 19 still open, 7 obsolete.**

Context: the monochrome "#FFF/#000" design system has been replaced by a dark-navy/gold theme with a light variant (`web/src/assets/styles/variables.css:7`, `:97`). The home route is now `tree` (skill tree), not the canvas singularity. `lexicon-dossier.ts` no longer exists.

## 2026-09-29-6-pillar-expansion-audit.md

| # | Item (short) | Status | Evidence |
|---|---|---|---|
| 1 | `--bg-card` undefined | resolved | defined `variables.css:12`, `:102` |
| 2 | `--space-6` undefined | resolved | defined `variables.css:57` |
| 3 | `--space-20` undefined | resolved | defined `variables.css:61` |
| 4 | Stark monochrome compliance | obsolete | palette is now navy/gold (`variables.css:10-20`, `--accent-gold`) |
| 5 | SM-2 'good' keeps EF the same (ΔEF=0) | resolved | `srs-engine.ts:92`, no EF change on good |
| 6 | Datasets: 1000 colloc / 3 articles / 120 vocab | resolved | jq: 1000 / `reading.articles`=3 / 120 |
| 7 | 8 routes, 6 urchin nodes, compass 00-07 | obsolete | `router.ts:1` has 10 routes (tree, grammar added); home = skill tree |

## 2026-09-29-web-implementation-audit.md

| # | Item (short) | Status | Evidence |
|---|---|---|---|
| 1 | Off-white grays `#f8f8f8`/`#fafafa` | obsolete | 0 matches in `src/`; monochrome rule dropped |
| 2 | `.dock-btn-flip` 1.5px border | resolved | `atomic-card.css:290-292` has no border-width (1.5px gold borders elsewhere, e.g. `dossiers.css:211`, follow the new theme) |
| 3 | SM-2 'good' adds +0.1 EF | resolved | `srs-engine.ts:92` (ΔEF=0) |
| 4 | Zero chromatic / zero grays rule | obsolete | theme uses gold/cyan/status colors (`variables.css:113-125`) |
| 5 | 4-pillar card table (lexicon-dossier) | obsolete | `lexicon-dossier.ts` gone; 7 dossiers + grammar in `src/modules` |
| 6 | No Anki/external SRS deps | resolved | `package.json` deps: `animejs` only |

## 6-pillar-accessibility-audit.md

| # | Item (short) | Status | Evidence |
|---|---|---|---|
| 1 | ACT-6P-01 colloc hotkeys fire while typing in search | resolved | global guard `main.ts:224-226` (INPUT/TEXTAREA/contentEditable) |
| 2 | ACT-6P-02 Space on a focused button flips the card (vocab) | open | guard skips BUTTON; `vocabulary-dossier.ts:265-280` has no check; `main.ts:244` calls preventDefault |
| 3 | ACT-6P-03 aria-live alert for surprise remind card | open | `vocabulary-dossier.ts:173` sets a label only; no live region |
| 4 | ACT-6P-04 compass trigger a11y + hide closed menu | open (partial) | role/tabindex/aria-expanded/Enter+Space added (`corner-compass.ts:82-85`); closed menu has no `visibility:hidden` (`dossiers.css:230-241`); no `aria-haspopup` |
| 5 | ACT-6P-05 arrow keys switch passes in reading | open | `reading-dossier.ts:985` handles keys only when `currentPass === 3` |
| 6 | ACT-6P-06 tablist/tab roles on article + pass tabs | open | 0 matches for `role="tab"` / `aria-selected` in `src/modules` |
| 7 | ACT-6P-07 search `type="search"` + aria-label | open | `collocations-dossier.ts:96` uses `type="text"`, no aria-label |
| 8 | ACT-6P-08 `--bg-card` undefined | resolved | `variables.css:12` |
| 9 | Keyboard fallback for home nodes | open | home = tree; nodes are SVG `<g>` with no tabindex/role/keydown (`skill-tree-view.ts:217`) |
| 10 | AAA contrast for ink tokens (0.78/0.68 alpha) | obsolete | tokens replaced; see accessibility-audit #6 |

## accessibility-audit.md

| # | Item (short) | Status | Evidence |
|---|---|---|---|
| 1 | ACT-01 lexicon hotkeys fire while typing | resolved | `main.ts:224-226` global guard (lexicon file removed) |
| 2 | 1.2 Escape always navigates away, even while typing or in a modal | open | `main.ts:218-222` runs Escape before the input guard; it also blocks the reading drawer's Escape (`reading-dossier.ts:981`) |
| 3 | 1.3 / ACT-04 compass focus trap + div trigger | open (partial) | same as 6-pillar #4 |
| 4 | 1.4 / ACT-05 hidden card face can still take focus | open (partial) | `aria-hidden` toggled (`atomic-card.ts:69-70`); hidden-face buttons not `inert`/`tabindex=-1` |
| 5 | 1.5 / ACT-03 `:focus-visible` ring | resolved | `hud-base.css:358-363`; inputs `dossiers.css:60`, `:1008` |
| 6 | ACT-02 `--ink-muted` reaches AAA 7:1 | open | dark `#94a3b8`: 7.72:1 on canvas, 6.36:1 on `--bg-card`; light `#64748b`: 4.56:1 (`variables.css:19`, `:110`) |
| 7 | `.compass-item-code` opacity 0.6 | open | `dossiers.css:280` still `opacity: 0.6` |
| 8 | 3.1 reduced-motion CSS misses pseudo-elements + scroll-behavior | open | `hud-base.css:479-485` targets `*` only |
| 9 | 3.2 / ACT-06 JS animation loops ignore reduced motion | open (partial) | honored in `sea-urchin.ts:78`, `cursor-tracker.ts:45`; ignored in `perspective-canvas.ts`, `particle-canvas.ts`, `corner-compass.ts:169`, `speaking-dossier.ts:624` |
| 10 | ACT-07 gyro tilt ignores reduced motion | open | `atomic-card.ts:264` skips touch only |
| 11 | 4.1 / ACT-08 home nav landmark | open | same as 6-pillar #9 |
| 12 | 4.2 / ACT-09 aria-labels / aria-pressed | open (partial) | dock + audio labelled (`atomic-card.ts:148-150`); sound toggle has no `aria-pressed` (`header-hud.ts:71`); audio label is generic |
| 13 | 4.3 / ACT-10 live regions (diff, timer) | open | only `atomic-card.ts:56`; none on writing diff or `timer-display-text` (`speaking-dossier.ts:215`) |

## curriculum-data-audit.md

| # | Item (short) | Status | Evidence |
|---|---|---|---|
| 1 | 1000 colloc, index 1-1000, 4×250 | resolved | jq: 1000 items, 1000 unique indices, each category 250 |
| 2 | Colloc fields non-empty | resolved | 0 items with empty phrase/vietnamese |
| 3 | UTF-8 no BOM, NFC, no mojibake | resolved | all 7 JSON files are NFC with no BOM; 0 `Ã`/U+FFFD |
| 4 | Drills 30 speaking + 30 writing, MEAL complete, rubric | resolved | jq 30/30, 0 empty MEAL, `rubricSummary` present |
| 5 | Habits 30 days | resolved | `habits.json` `.days`=30 |
| 6 | Every habit day has 3 tasks | open (drift) | days 6,10,17,20,23,24,25,27,28,29,30 have 2 tasks |
| 7 | Listening 4 rules / 4 accents / 3 steps / 3 passages | resolved | jq 4/4/3/3 |
| 8 | Source markdown `E:\Eng\*.md` | obsolete | source is now `web/content/**` compiled by `scripts/compile-content.cjs:63` |

## Update 2026-10-03 (UI/UX pass)

Resolved since the table above:
- accessibility #2 Escape: now runs only when unclaimed; blurs inputs; tour listens in capture phase (`main.ts`, `spotlight-tour.ts`).
- 6-pillar/accessibility compass hidden menu: closed menu is `inert` (`corner-compass.ts`).
- Tree keyboard access: nodes + branch cards are focusable buttons with Enter/Space (`skill-tree-view.ts`).
- Reduced motion (#8, #9) is now an in-app setting (Settings → Motion, `html[data-motion="reduce"]`), on by owner's request; OS flag no longer disables motion.
- Habits raw markdown / dead `file:///E:` links: rendered via `formatTask()` (`mission-log.ts`); source links still exist in `web/content/habits/daily-plan.md`.
- Service worker pinned users to stale builds (cache-first navigations) → network-first (`public/sw.js` v1.1.0).

Still open:
- Listening pillar is a stub (3 one-sentence passages).
- Collocations: 9 duplicates, no example sentences, many A2/B1 items.
- Habits: 11 days have 2 tasks instead of 3.
- `cognitive-bandwidth.md` overstates subvocalization suppression.
- Hidden card face buttons still focusable (accessibility #4); `--ink-muted` light 4.56:1 misses AAA.
- Large files (`reading-dossier.ts` ~1000 lines, `audio-synthesizer.ts`, `speaking-dossier.ts`) not split — deferred; no feature work needs it yet.
- anime.js still v3.2.2; v4 has a new API (migration = rewrite `motion-engine.ts` + direct calls).

## Update 2026-10-05 (UX + content accuracy pass)
Resolved: tree label overlap, branch-name/tagline/article-title truncation (wrap everywhere), phone/tablet overflow at 320/390/768, reading screen stacking on phones, grammar formulas ending in a literal "...", hardcoded counters (listening "/03", speaking "/30", collocation "/1000"), static "daily workout" panel now computed from today's real reviews, confusing "Lv 2/5 (1/5)" label, ~45 content fixes (collocations, writing/speaking prompts, grammar double negative, reading articles incl. subvocalization framing, vocabulary examples, 9 listening notes).
Still open: collocations have no example sentences; light-mode muted ink on the sunk surface is ~6.9:1; daily-plan.md checklist section unsynced with its JSON block for 11 days; installer needs a Defender exclusion for web/release before `npm run dist:win`; anime.js v3->v4; big-file split (reading-dossier.ts ~1000 lines).

## Update 2026-10-05 (open-items sweep)
Resolved: collocation example sentences (all 1000, verified by `verify-content-pipeline.cjs`); daily-plan checklist synced with its JSON (30 days x 3 tasks), dead `file:///` links removed; color emoji replaced by SVG icons in Init 17/18 modules and tour; Space/Enter on focused buttons no longer flips cards or starts Blitz; tab roles on reading article/pass tabs; search `type="search"` + label; sound toggle `aria-pressed`; compass `aria-haspopup`, compass code opacity removed; light-mode muted ink now >= 7.3:1 on every surface; card parallax tilt honors the in-app Motion setting; Init 17/18: progression modal claims Escape, lexicon drawer is `inert` when closed, nebula/drawer/blitz honor `html[data-motion="reduce"]`.
Still open: arrow keys switching reading passes (tab pattern); live regions for writing diff and speaking timer; remaining JS loops (`particle-canvas`, `perspective-canvas`, `corner-compass`, `speaking-dossier`) vs the in-app Motion setting; anime.js v3->v4; big-file split; installer needs a Defender exclusion for `web/release` before `npm run dist:win`.
