# Task 6 Completion Report: Cambridge Drills Tabs, Card-As-Button & Email Sandbox Polish

**Status:** DONE  
**Date:** 2026-11-11  

---

## 1. Summary of Work

Eliminated the two major Invariant violations on the Cambridge Drills view (Màn 10) and polished the business email sandbox:
1. Replaced the 3-row vertical wrapping of skill chips (`.drill-chips`) with a sleek single-row horizontal scroll strip adhering to **Invariant 7** and **Invariant 10**.
2. Implemented Card-as-Button on `.drill-card` adhering to **Invariant 9**, eliminating the redundant full-width "Start" button, cutting ~40px off every card, and adding an unbordered 44×44px top-right arrow affordance.
3. Enforced a uniform 3-column grid on `.drills-tabs` ('Drills', 'Sounds', 'Email') adhering to **Invariant 16**.
4. Enhanced `web/src/modules/email-builder.ts` with a "Sao chép thư" (Copy draft) button next to "Xóa bản nháp", featuring native clipboard write with fallback, audio-haptic chime, icon and label feedback, and inline status indicator.

---

## 2. Changes Applied

### A. `web/src/assets/styles/drills.css`
1. **Horizontal Scroll Strip for Skill Chips (Invariant 7 & Invariant 10):**
   - Separated `.drill-chips` from the multi-line wrap declaration.
   - Declared `flex-wrap: nowrap !important; overflow-x: auto !important; scrollbar-width: none !important; -webkit-overflow-scrolling: touch; gap: 8px !important; padding: 4px 0 !important; margin-bottom: 8px !important;`.
   - Hidden webkit scrollbar (`display: none !important;`).
   - Declared `white-space: nowrap !important; flex-shrink: 0 !important;` on `.drill-chip`.
2. **Uniform 3-Column Tab Layout (Invariant 16):**
   - Configured `.drills-tabs` as `display: grid !important; grid-template-columns: repeat(3, 1fr) !important; width: 100% !important; gap: 6px !important;`.
   - Set `.drill-tab` to `display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; text-align: center; width: 100%;`.
3. **Card-as-Button Interactive Surface (Invariant 9 & Invariant 14):**
   - Declared `cursor: pointer;`, `user-select: none;`, and smooth transition transforms on `.drill-card`.
   - Added hover state (`border-color: var(--accent-gold); background: var(--surface-card-hover);`) and active scale (`scale(0.99)`).
   - Added coaxial dual-layer focus ring on `.drill-card:focus-visible` (`outline: 2px solid var(--focus-ring-inner); box-shadow: 0 0 0 2px var(--focus-ring-outer);`).
   - Styled `.drill-card-arrow` as an unbordered, backgroundless 44×44px top-right affordance with hover translation.

### B. `web/src/modules/drills-dossier.ts`
1. **Card-as-Button Markup Implementation:**
   - Transformed `<article class="drill-card">` into the interactive element with `data-action="open"`, `data-value="${s.id}"`, `tabindex="0"`, `role="button"`, and `aria-label="${esc(s.title)}"`.
   - Added top-right arrow affordance `<span class="drill-card-arrow" aria-hidden="true">→</span>`.
   - Removed the bulky full-width bottom `<button class="drill-btn">Start</button>`.
2. **A11y & Acoustic Haptics:**
   - Added `keydown` listener to root for `Enter` and `Space` activating non-button `[role="button"][data-action]` elements.
   - Integrated `AcousticHaptics.tap()` across tab selection, skill chips, card opening, and back navigation.
   - Localized tab buttons using `t('drills.tab_' + tTab.id, undefined, tTab.label)`.

### C. `web/src/modules/email-builder.ts`
1. **Copy Draft Action Button:**
   - Added a primary button next to "Xóa bản nháp" (`data-clear`):
     ```html
     <button type="button" class="drill-btn" data-copy style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
       <span class="copy-icon" aria-hidden="true" style="font-size: 16px;">📋</span>
       <span class="copy-label">${t('email.copy_draft', undefined, 'Copy draft')}</span>
     </button>
     <button type="button" class="drill-btn drill-btn-ghost" data-clear>${t('email.clear_draft', undefined, 'Clear draft')}</button>
     <span class="email-copy-feedback" aria-live="polite" style="..."></span>
     ```
   - Complies with **Invariant 13** (`--radius-btn: 10px`), **Invariant 15** (symmetrical centering with 8px gap), and touch target minimum 44px.
2. **Clipboard Engine & Feedback Dynamics:**
   - Uses `navigator.clipboard.writeText` with textarea `document.execCommand('copy')` fallback.
   - Plays `AcousticHaptics.chime()` on success and `AcousticHaptics.nudge()` if draft is empty.
   - Temporarily swaps button icon to `✓` and label to `t('email.copied')` for 2 seconds alongside the polite inline status element.
   - Plays `AcousticHaptics.tap()` on tile selection, scenario change, and clear draft.

### D. `web/src/core/i18n.ts`
- Added localization entries for `'email.copy_draft'` and `'email.copied'` in both `EN_DICTIONARY` ("Copy draft", "Copied!") and `VI_DICTIONARY` ("Sao chép thư", "Đã sao chép!").

---

## 3. Verification Results

1. **Production Build:**
   - `npm --prefix web run build:fast`:
   - 205 modules transformed and compiled with **zero errors** in 2.51s.
2. **Drill Sets & Content Integrity:**
   - `node scripts/verify-drill-sets.cjs`:
   - Output: `verify-drill-sets: OK (36 sets, 172 items, 44 phonemes, 25 tiles)`.
3. **i18n Key Synchronization:**
   - `node scripts/verify-i18n.cjs`:
   - Output: `[i18n-verify] Found 1863 EN keys and 1863 VI keys. All 113 required spec keys and 1863 total keys verified successfully.`
4. **TypeScript Verification:**
   - `npx tsc --noEmit` exited with code 0 (zero errors).
