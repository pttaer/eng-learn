# Task 2 Brief: Collocations Vault & Mobile Searchbox UX

**Files:**
- Modify: `web/src/modules/collocations-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Objectives:**
1. In `web/src/modules/collocations-dossier.ts`:
   Remove desktop hint `(Ctrl+K)` on mobile devices:
   Detect mobile:
   ```ts
   const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches);
   const placeholderText = isMobile
     ? (t('placeholder.search_collocations_mobile', undefined, 'Tìm kiếm cụm từ...') || t('placeholder.search_collocations').replace(/\s*\(Ctrl\+K\)/i, ''))
     : t('placeholder.search_collocations');
   ```
   Use `placeholderText` in the search input element.

2. In `web/src/assets/styles/dossiers.css`:
   Under `@media (max-width: 768px)`, streamline `.collocations-category-tabs`, `.vocab-level-selector`, and `.control-row`:
   - Keep category tabs as a smooth horizontal scrolling strip (`flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; gap: 6px;`).
   - Keep CEFR chips compact (`gap: 4px;`).
   - Make `.dossier-search-wrapper` compact with padding `6px 12px` and `min-height: 40px`.
   - Reduce vertical gaps so the first dictionary entries appear higher above the fold.

3. Verify with `npm run build:fast` in `web`.
4. Write report to `e:\Eng\.superpowers\sdd\2026-11-11-mastery-foundations-10-out-of-10-polish\task-2-report.md`.

