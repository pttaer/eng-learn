# Project rules

## UI spacing & layout consistency
- Canonical Specification: Strictly follow [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md) for all typography scales, padding tiers, and 4px/8px gap rhythms.
- Typography Hierarchy: Use semantic tokens (`--font-h1`, `--font-h2`, `--font-h3`, `--font-h4`, `--font-kicker`, `--font-body`, `--font-prompt`). Never use arbitrary pixel sizes like 19px, 21px, etc.
- Spacing Scale: Follow the 4px/8px rhythm (`--gap-section`: 32/16px, `--gap-block`: 20/12px, `--gap-group`: 12/8px, `--gap-element`: 8/6px). No ad-hoc margins that stack on top of a parent `gap`.
- Padding Tiers: Use `--pad-screen`, `--pad-workspace`, `--pad-card`, `--pad-card-compact`, `--pad-modal`, `--pad-btn`.
- Mobile-first: write base styles for mobile. One breakpoint boundary: `max-width: 768px` for mobile, `(width > 768px)` for desktop. 360px only for small-phone tweaks. Do not add new 600/640/760/800/820/840/900 queries.
- Mobile Safe Clearance: Views under the fixed mobile bottom nav (≤768px) keep `--safe-bottom-dock: 84px` plus `env(safe-area-inset-bottom)`. Above 768px it is 0. IELTS has no bottom nav and uses `--pad-workspace`.
- Touch Targets: All interactive buttons, chips, and pills must be at least 44px (`--touch-target-min`) on every touch device, with horizontal side-by-side flex docks. Only fine-pointer desktops (`(hover: hover) and (pointer: fine)`) may use 36px.
- Text floor: smallest text is `--font-kicker` (11px). Mobile inputs, selects and textareas use `max(16px, var(--font-body))` to stop iOS zoom.
- All dossier views share one skeleton: toolbars span the 1040 workspace; card and nav bar share one centered column (card width, 760) so edges line up; every view starts at the same top edge.
- Never let a slot be smaller than its content (no `contain: size` on content slots); siblings must not overlap.
- Check padding, gaps and alignment on every view, not just the one being edited. Awkward or inconsistent spacing is a bug.
- Two typefaces max: `--font-sans` for reading and UI, `--font-mono` for telemetry, kickers, CEFR levels, timers, indices and keycaps.
- Anti-patterns (see spec §6): no vertical stacking of horizontal tabs on mobile; no crushed tables (wrap in horizontal scroll, `min-width: 600px`, `white-space: nowrap`); no corner compass or watermark over the mobile bottom nav; rating buttons stay in one row.
- After any layout/CSS change, measure sibling gaps and widths on all routes at desktop (1440) and phone (390) widths, then screenshot and look at them before calling it done.

## IELTS app rules
- IELTS is a separate app side (`web/ielts.html`, `web/src/ielts/`), Academic only.
- Listening uses browser text-to-speech only.
- All scoring is computed locally by our own code. No external API, no LLM calls, no new dependency.
- Claude verifies every answer key; each question carries a `why` with the evidence line.
