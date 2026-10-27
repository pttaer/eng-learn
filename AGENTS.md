# English Singularity & Academic IELTS - Workspace Guidelines

> **Authority:** Native Antigravity agent configuration and operational invariants.  
> **Canonical Design Spec:** [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md)  
> **Agent Layout Rule:** [`.agents/rules/canonical-spacing.md`](file:///e:/Eng/.agents/rules/canonical-spacing.md)

---

## 1. UI/UX Design System Invariants

1. **The Gold Standard Exemplar:** IELTS Academic Writing View ([`Mobile/1.0.0/37-mobile-ielts-writing.png`](file:///e:/Eng/Mobile/1.0.0/37-mobile-ielts-writing.png) / [`web/src/ielts/views/writing.ts`](file:///e:/Eng/web/src/ielts/views/writing.ts)) defines the canonical layout rhythm:
   - Screen Inset: single source of truth `--pad-screen-left: 12px;` and `--pad-screen-right: 12px;` in `variables.css`.
   - Card Surface: `padding: 16px`, `border-radius: 12px` (or `--radius-squircle-md`), `border: 1px solid var(--border-hairline)`, internal vertical gap `8px`.
   - Buttons: `padding: 8px 18px`, `border-radius: 9px` (or `--radius-squircle-sm`), stacked with `8px`–`12px` gap. Tap floor ≥ 44px on touch devices.
   - Layout Skeleton: Toolbars span the 1040px max workspace; cards and nav bars share one centered 760px column.
2. **Mobile-First & Breakpoints:** Base styles written for mobile. Exactly **one breakpoint boundary at 768px** (`max-width: 768px` for mobile, `(width > 768px)` for desktop). No arbitrary 600, 640, 800, 820, 840, or 900px queries.
3. **Mobile Safe Dock Clearance:** Views under fixed bottom navigation keep `--safe-bottom-dock: 84px` + `env(safe-area-inset-bottom)` on ≤768px.
4. **Touch Floor & Input Zoom Prevention:**
   - Every interactive element on mobile has `min-height: var(--touch-target-min, 44px); min-width: var(--touch-target-min, 44px)`.
   - Form inputs, selects, and textareas use `font-size: max(16px, var(--font-body))` on mobile to prevent iOS Safari auto-zoom on focus.
5. **Apple-Calm Dynamics & Acoustic Haptics:**
   - Squircle tokens: `--radius-squircle-sm: 10px`, `--radius-squircle-md: 16px`, `--radius-squircle-lg: 24px`, `--radius-pill: 9999px`.
   - Native Web Audio haptics via `AcousticHaptics`: `tap()`, `flip()`, `chime()`, `nudge()`.
   - Universal 4-second Undo toast via `UndoManager` with hotkey `Z` (auto-suppressed when editing inputs).
6. **Defensive Input Normalisation:** Sanitize smart quotes (`’‘` -> `'`, `“”` -> `"`) and strip trailing punctuation in exercise engines so autocorrect never causes false negatives.
7. **Strict Prohibitions:**
   - No vertical stacking of horizontal tabs on mobile (use horizontal scroll).
   - No crushed tables (use horizontal scroll, `min-width: 600px; white-space: nowrap !important;`).
   - No fixed-height nested scroll boxes for content lists on mobile.
   - Never use `contain: size` on content slots.
   - Kickers: 11px floor (`--font-kicker`), 0.08em tracking, uppercase. Zero 9px/10px literals.
   - No double outlines / concentric borders (never place a bordered card or container directly inside another bordered card/surface; use surface tone shift or elevation instead of nested strokes).

---

## 2. Specification-to-Code Fidelity Mandate

- Never quote or document design tokens from memory or speculative design plans.
- Always cross-reference exact names and values in [`web/src/assets/styles/variables.css`](file:///e:/Eng/web/src/assets/styles/variables.css) (`--shadow-tactile`, `--border-hairline`, `--pad-modal`, etc.) and implementation TypeScript engines.
- When updating [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md), update [`.agents/rules/canonical-spacing.md`](file:///e:/Eng/.agents/rules/canonical-spacing.md), [`CLAUDE.md`](file:///e:/Eng/CLAUDE.md), and [`AGENTS.md`](file:///e:/Eng/AGENTS.md) in lockstep sync.

---

## 3. IELTS App Architectural Rules

- IELTS is an isolated suite (`web/ielts.html`, `web/src/ielts/`), Academic only.
- Audio listening uses browser SpeechSynthesis text-to-speech only.
- All scoring is 100% computed locally offline. Zero external API calls, zero LLM dependencies.
- Every question must carry an explanatory `why` with the exact passage evidence line.

