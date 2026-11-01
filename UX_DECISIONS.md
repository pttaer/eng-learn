# UX Architecture Decisions

## ADR-001: Universal Button Border Radius Enforcement
- **Context**: Inconsistent button radii across dossiers, HUD, atomic cards, and IELTS views (ranging from 3px, 4px, 6px, 8px).
- **Rule**: AGENTS.md § 1.13 / `.agents/rules/canonical-spacing.md` § 12.11 - Universal Button Border-Radius Invariant (`--radius-btn: 10px`).
- **Decision**: Update all button component classes to bind strictly to `var(--radius-btn, 10px)` regardless of button size or width. Circle icon buttons (`border-radius: 50%`) remain the only exception.

---

## Autopilot decisions (ui-ux-autopilot)

Added 10:51 alongside ADR-001 above. Both writers share this checkout; neither file is overwritten.

- **D1 · Design rules:** `<PATH/TO/DESIGN_RULES.md>` = `docs/TYPOGRAPHY_SPACING_RULES.md` + `.agents/rules/canonical-spacing.md` + repo `CLAUDE.md` UI rules. Per cycle, re-read the sections the task touches, not the whole file.
- **D2 · Gates per commit:** `web`: `npm test` (tsc + 91 verify scripts) → `npm run test:mobile` → `npm run build:fast` → targeted probe at 360/390/1440 with screenshots. Baseline 10:45: test 91/91, test:mobile pass. Full vivo sweep every ~5 commits.
- **D3 · Lint:** no lint script. `tsc --noEmit` (inside `npm test`) is the lint gate. No eslint, no new dependency.
- **D4 · No human gate:** user said no human is available. Brainstorming approval gate skipped (user opted out of questions). Learning-mode "ask user to write code" skipped.
- **D5 · Commit hygiene:** branch `ui-ux-autopilot` only, never push. Stage explicit paths only; commit with `git commit -- <paths>` so other writers' staged work is excluded. `web/src/assets/data/ielts-course.json` is rewritten by `npm test`; never staged, never reverted. Message `ui: <what changed>` + `Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>`.
- **D6 · Notes bubble on phone:** pending probe (AP-04/AP-05). Default plan: ≤768px bubble sits above the content inset, view bottom padding clears it. Final choice logged here after probing.
- **D7 · Truncation → wrap:** mobile titles and telemetry labels wrap, no `text-overflow: ellipsis` (§11). Short badges stay one unit (`nowrap`); long telemetry badges wrap as a whole.
- **D8 · Native checkboxes:** `input.task-checkbox` stays native. Hit area = label row, min 44px. The raw-input flag is a false positive when the label is the target.
- **D9 · Scroll-position artifacts:** audit `covered` at the scroll edge may be capture noise. Scroll into view and re-measure before fixing.
