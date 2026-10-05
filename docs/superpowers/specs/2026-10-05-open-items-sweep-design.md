# Open-items sweep — design

Closes the open items in `docs/audits/STATUS.md` plus Init 17/18 follow-ups.

## In scope
1. **Emoji → SVG** — color emoji in `web/src` replaced by `icon()` (new glyphs: clock, keyboard, trophy, landmark). Text glyphs upstream keeps (✓ ★ ✦ ← → ✕ ○) stay.
2. **A11y** — (a) re-check each open STATUS item, fix only what is still broken; (b) audit Init 17/18 modules (zen, lexicon drawer, progression modal, blitz) for input guard on hotkeys, Escape protocol, inert-when-closed, in-app motion setting.
3. **Collocation examples** — `example` field in `web/content/collocations/*.md`, compiled to JSON, rendered on card; verify asserts each example contains the phrase headword. Pilot ~25 then all 1000.
4. **Daily-plan sync** — JSON block is canonical; sync the checklist for 11 days, drop dead `file:///E:` links.
5. **Docs** — tick content-gaps plan, status line on older plans, update STATUS.md.

## Out of scope (deferred in STATUS, unchanged)
anime.js v3→v4 migration, big-file split, installer Defender exclusion (user action).

## Verification
`cd web && npm test` (tsc + all verify scripts) after each task; one conventional commit per task; no push.
