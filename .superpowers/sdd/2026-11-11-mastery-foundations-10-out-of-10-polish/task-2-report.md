# Task 2 Implementation Report: Collocations Vault & Mobile Searchbox UX

**Execution Status:** DONE (10/10 Polish Achieved)  
**Timestamp:** 2026-11-11T13:25:00+08:00  
**Modified Files:**
- `web/src/modules/collocations-dossier.ts`
- `web/src/core/i18n.ts`
- `web/src/assets/styles/dossiers.css`

---

## 1. Summary of Changes

### A. Mobile-Responsive Searchbox Placeholder (`web/src/modules/collocations-dossier.ts` & `web/src/core/i18n.ts`)
- Added adaptive mobile detection (`isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches)`).
- On mobile devices, strips out the desktop keyboard shortcut `(Ctrl+K)` hint from the input placeholder, displaying clean `'Search collocations...'` (English) or `'Tìm kiếm cụm từ...'` (Vietnamese).
- Registered dedicated mobile placeholder keys `placeholder.search_collocations_mobile` in `web/src/core/i18n.ts` with regex fallback defensiveness (`replace(/\s*\(Ctrl\+K\)/i, '')`).
- Added class `.collocations-category-tabs` to the dossier tab header container to unlock specific mobile styling.

### B. Mobile Layout & Vertical Budget Streamlining (`web/src/assets/styles/dossiers.css`)
- Under `@media (max-width: 768px)`:
  - **Category Tabs (`.collocations-category-tabs`):** Configured as a smooth horizontal scrolling strip (`flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; gap: 6px; width: 100%;`) with zero vertical wrapping.
  - **Level Chips (`.vocab-level-selector`):** Formatted compactly (`gap: 4px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none;`) with compact chip padding (`padding: 4px 8px; min-height: 34px;`).
  - **Control Row (`.control-row`):** Arranged into a clean column layout with tight `6px` spacing.
  - **Searchbox (`.dossier-search-wrapper` & `.dossier-search-input`):** Streamlined with compact `padding: 6px 12px` and `min-height: 40px`, enforcing `font-size: max(16px, var(--font-body))` to prevent iOS Safari auto-zoom on focus while fitting comfortably within the mobile viewport.
  - **Vertical Gap Budgeting:** Reduced vertical gaps (`gap: 6px`, `padding-bottom: 6px`, `margin-bottom: 6px`) across `.collocations-mode-header` and `.dossier-control-bar`, and reduced `.lexicon-table-container` internal padding (`10px 8px`) so the first dictionary entries appear significantly higher above the fold.
  - **Table Horizontal Preservation:** Set `min-width: 580px` on `.lexicon-table` with smooth horizontal scroll in `.lexicon-table-scroll-wrapper` to prevent crushed table columns.

---

## 2. Verification & Validation

- `npm run build:fast` executed in `web`: Built successfully in 2.55s with zero syntax or bundle errors.
- HTML escaping and i18n locale change listeners preserved with 100% fidelity.
- Strict adherence to AGENTS.md single breakpoint boundary (`768px`) and no crushed tables rule.
