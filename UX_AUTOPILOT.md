# UX Autopilot log (ui-ux-autopilot)

Own file, so the shared `UX_BACKLOG.md` / `UX_DECISIONS.md` writers cannot wipe it. Source audit: `web/screenshots/vivo-360x802/report.json` (fresh @ e4fef9b) + `vivo-findings.md`.

Gates per commit: `npm test` → `npm run test:mobile` → `npm run build:fast` → probe at 360 (`scratchpad/probe/probe.cjs`).

## Decisions

- **D1 Rules:** `docs/TYPOGRAPHY_SPACING_RULES.md` + `.agents/rules/canonical-spacing.md` + `CLAUDE.md`. Re-read the sections a task touches.
- **D2 No human gate:** user said no human available. Brainstorming approval gate and "ask user to code" skipped.
- **D3 Lint:** none exists. `tsc --noEmit` inside `npm test` is the gate. No new dependency.
- **D4 Commits:** `ui: <what>` + Co-Authored-By trailer. Explicit paths only (`git commit -- <paths>`). Never stage `web/src/assets/data/ielts-course.json` (rewritten by `npm test`).
- **D5 Truncation → wrap:** mobile labels/titles wrap, no `text-overflow: ellipsis` (rule §11). Short badges stay one unit (`nowrap`).
- **D6 IELTS Notes disc (phone, no bottom nav):** icon-only 44px disc (`floating-note.css`), default y = bottom edge (`floating-note.ts`), clamp drops the 96px nav reserve when no `.hud-bottom-nav`, `.ie-main` bottom padding clears it (`ielts.css`). Main app keeps bubble hidden (2b6d656).
- **D7 Native checkboxes:** hit area = label row (60–81px measured). Raw 20px input is not the target.
- **D8 Audit `covered` at scroll edge:** capture artifact. Scroll into view and re-measure before fixing.
- **D9 Modal sheet lists:** list scroll inside a modal sheet (`.mobile-sheet-grid`, 507px) allowed. §11 nested-scroll rule targets content pages, not sheets.

## Done

| Item | Fix | Commit |
|---|---|---|
| AP-01 telemetry badge ellipsis | wrap as unit, `flex-wrap` row | 5e13dcf (swept in) |
| AP-04 / AP-05 IELTS Notes over titles | disc + bottom pad + clamp | ea4e1ba / 51436ee (swept in) |
| AP-06 reading timer/focus 40px | `.skim-timer-actions .hud-btn` 44px | 34615a7 |
| AP-07 radar level chips 43px wide | `min-width: 44px` | 34615a7 |
| AP-08 tree workout chips 13px tall | `min-height: 44px`, text wraps | 34615a7 |
| AP-10 deck tagline 2-line clamp | clamp removed | 34615a7 |
| AP-09 habit checkbox | D7, label row ≥44 | no change |
| AP-11 cockpit test-card titles | wrap in `ux-c.css` tail block | in HEAD (swept in) |
| AP-14 reading-drills badge | 51436ee; vocab table = other writer TASK-008 | — |
| AP-15 mistake vault VI gap | 4 `vault.l1_*` keys EN+VI, `t()` in `mistake-vault.ts` | 1926083 |
| AP-19 IELTS band Overall orphan | `.ie-bandcell-main` spans both columns | in HEAD (swept in) |

## Closed without change

- AP-02 Me sheet Notes "covered" by footer: false positive. Notes sits below the `.mobile-sheet-grid` fold; scrolled into view it is clear.
- AP-03 Settings band pills under nav: not reproduced. `#workspace-mount` pb is 84px.
- AP-23 Me sheet nested scroll: D9.
- AP-25 radar/level-tab/vocab-search/sheet-dock items: verify list, pending re-probe.

## Open queue (in order)

- AP-12 Progression stat label ellipsis: source not found in CSS (no `text-overflow` on `.telemetry-label`). Verify with Me sheet → progression open before touching.
- AP-13 Analytics radar labels "8px": measure rendered bbox; SVG viewBox scaling may be a false positive. Enlarge only if rendered <11px.
- AP-16 Sub-tab rows wrap inconsistently (writing-studio, reading, speaking mode row). Uniform grid or nowrap scroller.
- AP-17 Vocab: chevron overlaps "Tất cả Band đi…", empty star tile, crowded chip row.
- AP-18 Strategy search placeholder clipped mid-word: shorter copy.
- AP-20 Listening traps: empty placeholder box at bottom → empty-state copy or remove.
- AP-21 Writing task list: "CO₂ Emissions…" chevron touches title → gap.
- AP-22 Action rows cramped ("Học lại", "Lật xem đáp án"): verify by probe first.
- AP-24 Primary style drift (white "01" chip, white primary in colloc/tenses vs periwinkle) → `--accent` token.
- Mistake vault loop-complete screen still has EN kicker `L1 TRANSFER REMEDIATION` (`mistake-vault.ts` ~339): add key if in scope.

## Coordination

Another writer shares this checkout and commits to this branch (`ui:` commits 5e13dcf, 348f1b3, a1b3dfc, 51436ee, ea4e1ba, 3140f36, 642ed80). Some of my edits were swept into their commits. Their backlog TASK-006..009 overlaps AP-14. Avoid their files when they have uncommitted hunks (`git diff -- <file>` first).
