# English Singularity & Academic IELTS - Workspace Guidelines

> **Authority:** Native Antigravity agent configuration and operational invariants.  
> **Canonical Design Spec:** [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md)  
> **Agent Layout Rule:** [`.agents/rules/canonical-spacing.md`](file:///e:/Eng/.agents/rules/canonical-spacing.md)

---

## 1. UI/UX Design System Invariants

1. **The Gold Standard Exemplar:** IELTS Academic Writing View ([`Mobile/1.0.0/37-mobile-ielts-writing.png`](file:///e:/Eng/Mobile/1.0.0/37-mobile-ielts-writing.png) / [`web/src/ielts/views/writing.ts`](file:///e:/Eng/web/src/ielts/views/writing.ts)) defines the canonical layout rhythm:
   - Screen Inset: single source of truth `--pad-screen-left: 12px;` and `--pad-screen-right: 12px;` in `variables.css`.
   - Card Surface: `padding: 16px`, `border-radius: 12px` (or `--radius-squircle-md`), `border: 1px solid var(--border-hairline)`, internal vertical gap `8px`.
   - Buttons: `padding: 8px 18px`, `border-radius: 10px` (or `--radius-btn` / `--radius-squircle-sm`), stacked with `8px`–`12px` gap. Tap floor ≥ 44px on touch devices. All buttons share the exact same radius token `--radius-btn: 10px` regardless of button width.
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
   - No decorative diamond stars (`✦`) or black filled stars (`★`) on titles or kickers. Only clean text or 5-pointed white star (`☆`) when semantically necessary.
   - No redundant bottom action buttons in mobile grid tiles (use Card-as-Button with unbordered `44×44px` top-right arrow affordance).
8. **Canonical Z-Index, Contrast & Skeleton Shimmer:**
   - Layer stacking MUST bind to canonical scale tokens (`--z-sunk` through `--z-cursor`). No arbitrary `9999` or `10000` literals.
   - Status indicators pair semantic colors with WCAG 2.2 AAA contrast tokens (`--ink-good`, `--ink-on-good`, etc.).
   - Asynchronous loading states use `.skeleton-box` / `.skeleton-shimmer` with `--shimmer-base` and `--shimmer-highlight`.
9. **Card-as-Button Grid & Hero Balancing Invariants ([`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md) §12):**
   - **Card-as-Button:** The entire tile is clickable (`cursor: pointer`), indicated by an unbordered, backgroundless `44×44px` top-right arrow (`border: none; background: transparent;`). Never squeeze full-width buttons into tile bottoms.
   - **Hero vs. Grid Balance:** Distribute vertical budget proportionally. Summary heroes (e.g. Roadmap banner ~125px) absorb height so grid cards below remain compact (~170px) with balanced whitespace (~40px), eliminating cavernous voids.
   - **Defensive Multi-Row Telemetry:** Separate telemetry on narrow screens (Row 1: Kicker + Rank; Row 2: Metric + Count; Row 3: Progress track) to prevent text overlap. Clamp variable-length task text with `max-width`.
   - **Zero-Scroll vs. Natural Scroll:** Zero-Scroll applies strictly to compact summary decks and dashboards that naturally fit one screen. Views with rich or expansive content (Reading, Writing, Lexicon, Strategy, Exam Cockpit) must scroll naturally (`overflow-y: auto`) with standard dock clearance. Never force rich views into an unscrollable box.
   - **iPhone 6 (375×667px) Resilience Test:** Every view must remain fully flexible and functional down to 375×667px with zero horizontal overflow, no clipped cards, and smooth vertical scrolling when content exceeds viewport height.
10. **Badge & Pill Anti-Wrap Invariant:**
    - Inline badges, CEFR level chips, or category pills (`.skill-badge-pill`, `.hud-badge`, `.hud-pill`) strictly declare `white-space: nowrap; flex-shrink: 0; border: none;` using Apple-calm subtle background shifts (`var(--soft-gold)`, etc.) to eliminate concentric double borders inside cards and prevent multi-line word breaks inside pills.
11. **Defensive Assessment Telemetry (No `undefined` / `NaN%`):**
    - All scorecard and exam receipt engines must defensively calculate finite numerical defaults from `rawScore` when detailed sub-scores or passage breakdowns are omitted. Never expose raw `undefined` or `NaN%` in UI receipts.
12. **Modal Language & Action Button Consistency:**
    - Maintain 100% language consistency across modal cards (e.g. `Close Score Report` for Cambridge tests, `Đóng báo cáo kết quả` for Vietnamese; never a lone `Đóng` in an English report); primary actions must declare clean semantic styling without disruptive programmatic focus rings.
13. **Universal Button Border-Radius Invariant (`--radius-btn: 10px`):**
    - Every single interactive button across the application (short chips like `B2`, medium action buttons, full-width CTAs like `Flip Reveal`, `Evaluate Reconstruction`, and `Apply Profile`) must share the exact same radius token: `border-radius: var(--radius-btn, 10px);`. Button width or length does not dictate radius. Circle icon buttons (`border-radius: 50%`) are the only exception.
14. **Focus-Ring & Outline Clearance Invariant:**
    - Coaxial dual-layer focus rings (`outline: 2px solid var(--focus-ring-inner); outline-offset: 2px; box-shadow: 0 0 0 2px var(--focus-ring-outer);`) must never collide with adjacent UI elements. Vertical button stacks enforce `gap: 12px !important;` (`.action-stack`, `.modal-actions`, etc.) to guarantee ≥8px negative space buffer around the outline. Action clusters maintain `margin-top: 18px`–`22px` from preceding text descenders or cards. Horizontal action strips with text hints (e.g. `.quiz-footer-strip`) collapse to `column-reverse` with 44px touch floor on narrow screens (≤768px).
15. **Button Icon Padding & Spacing Invariant (Symmetrical Centering & Anti-Lopsided Layout):**
    - Every button containing an icon MUST declare inline-flex with vertical and horizontal centering (`display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;`). Never use ad-hoc `margin-left` or `margin-right` on text spans; `gap` controls icon-to-text distance cleanly. Padding must be symmetrically balanced (`padding: 10px 16px` or `8px 18px`), keeping icon distance from the left edge equal to text distance from the right edge. Icons must declare `flex-shrink: 0; display: block;` to lock onto the vertical center axis of font descenders without baseline sag. Step/roadmap rows must use structured flex cards (`align-items: center; justify-content: space-between;`) with `flex-shrink: 0; align-self: center !important;` on action buttons, preventing buttons from wrapping onto arbitrary second lines. Multi-button modals must preserve 100% language consistency across action and dismiss buttons.
16. **File Explorer Folder Tabs & Uniform Grid Distribution Invariant:**
    - Tab headers across multi-tab widgets/cards MUST declare an exact uniform grid distribution (`display: grid; grid-template-columns: repeat(N, 1fr); width: 100%; gap: 4px;` in CSS or `layout_width="0dp"` with equal `layout_weight="1"` in Android XML). Every single tab slot is mathematically identical (e.g. 25.0% width for 4 tabs), preventing active tab pills from stretching unevenly across states.
    - Each tab declares File Explorer index tab shoulders (`border-radius: 8px 8px 0 0`). The active tab shares the exact same elevated background tone (`#182030`) as the folder body below, featuring a top accent indicator (`box-shadow: inset 0 2.5px 0 0 var(--accent, #a5b4fc);`) and seamless zero-divider base (`border-bottom: 1px solid var(--folder-surface)` / `margin-bottom: -1px; z-index: 3`). Inactive tabs remain recessed behind (`#11151f`, muted `#64748b`). Tab labels pair 1 emoji/icon with 1 concise noun (`📖 Word`, `🧠 Quiz`, `🎯 Quests`, `⚡ Pillars`).

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

