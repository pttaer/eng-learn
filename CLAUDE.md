# Project rules

## UI spacing & layout consistency
- Check padding, gaps and alignment on every view, not just the one being edited. Awkward or inconsistent spacing is a bug.
- Spacing scale: 8 inside a group, 16 between groups (`--space-8`, `--space-16`). No ad-hoc margins that stack on top of a parent `gap`.
- All dossier views share one skeleton: toolbars span the 1040 workspace; card and nav bar share one centered column (card width, 760) so edges line up; every view starts at the same top edge.
- Never let a slot be smaller than its content (no `contain: size` on content slots); siblings must not overlap.
- After any layout/CSS change, measure sibling gaps and widths on all routes at desktop (1440) and phone (390) widths, then screenshot and look at them before calling it done.
