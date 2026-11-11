# Task 1 Completion Report: Vocab Vault & Morphological Formatting Polish

**Status:** DONE  
**Timestamp:** 2026-11-11T13:18:30+08:00  

---

## 1. Summary of Changes

### A. Card Counter Badge Polish (`web/src/modules/vocabulary-dossier.ts`)
- **Separator Dot Affordance:** Added an elegant separator dot between the card count and review streak indicators:
  ```html
  <span class="vocab-count-indicator"><strong class="card-counter">${t('vocab.card_counter', { current: this.currentIndex + 1, total: totalCount })}</strong></span><span class="vocab-counter-divider" style="opacity: 0.4; margin: 0 6px;">·</span><span class="streak-counter">${t('vocab.reviewed_count', { count: this.reviewCountInRun })}</span>
  ```
- **Consistent Progress Telemetry:** Replaced raw string replacements (`${currentIndex + 1} / ${total}`) in card navigation, rating progression, and undo registration with a centralized `updateProgressCounters()` helper. This guarantees that `"Thẻ 1 / 5 · 0 đã ôn"` remains localized, properly styled, and synchronized across all actions without losing the prefix or separator.

### B. Structured Morphological Breakdown (`ROOT_FORGE` & Card Backs)
- **HTML Matrix Structure:** Replaced raw newline-concatenated string (`Prefix: ... \n Family: ... \n ...`) with clean semantic blocks:
  - **Prefix:** Semantic row with `.morph-label` "Prefix" and `.morph-val`.
  - **Root:** Highlighted row with `.morph-label` "Root" and `.highlight-root` styling (`var(--accent-gold)`).
  - **Suffix:** Semantic row with `.morph-label` "Suffix".
  - **Family:** Responsive pill-chip flex cluster (`.morph-chips` and `.morph-chip`).
  - **Core Analysis:** Dedicated breakdown line with `.morph-label` "Core Analysis".
- **Unified CEFR & Particle Lab Cards:** Applied cohesive `.morph-breakdown-box` formatting across `CEFR_ASCENT` (CEFR level, register, collocates, synonym chips) and `PARTICLE_LAB` (verb, particle highlight, archetype, logic) for 10/10 visual harmony.
- **Defensive HTML Escaping:** Added `escapeHtml()` helper ensuring all dynamic strings from the vocabulary database are sanitized defensively.

### C. Design System & CSS Invariants (`web/src/assets/styles/dossiers.css`)
- Added `.vocab-counter-divider` with subtle opacity and balanced negative spacing.
- Added `.morph-breakdown-box` with:
  - Subtle background tone shift `rgba(255, 255, 255, 0.03)` with hairline border `1px solid rgba(255, 255, 255, 0.06)`, avoiding concentric double outlines.
  - Squircle radius `--radius-squircle-sm: 10px`.
  - Kicker labels: `--font-kicker` (11px floor), `0.08em` tracking, uppercase, mono font.
  - Single breakpoint boundary at 768px (`(width > 768px)`) for desktop 2-column alignment (`110px 1fr`), while maintaining stacked mobile layout for iPhone 6 (375px) resilience.

---

## 2. Verification Results

- **`npm run build:fast` in `web`:**
  - Vite v5.4.21 built production bundle in 2.60s without errors.
- **`npx tsc --noEmit` in `web`:**
  - TypeScript strict check completed with 0 errors.

---

## 3. Modified Files

1. `web/src/modules/vocabulary-dossier.ts`
2. `web/src/assets/styles/dossiers.css`
