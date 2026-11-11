# Task 1 Brief: Vocab Vault & Morphological Formatting Polish

**Files:**
- Modify: `web/src/modules/vocabulary-dossier.ts`
- Modify: `web/src/assets/styles/dossiers.css`

**Objectives:**
1. Fix the card counter badge in `web/src/modules/vocabulary-dossier.ts`:
   Currently it renders:
   ```html
   <div class="vocab-progress-badge">
     <span class="vocab-count-indicator"><strong class="card-counter">${t('vocab.card_counter', { current: this.currentIndex + 1, total: totalCount })}</strong></span>
     <span class="streak-counter">${t('vocab.reviewed_count', { count: this.reviewCountInRun })}</span>
   </div>
   ```
   This prints `"Thẻ 1 / 5 0 đã ôn"` without separation.
   Update it to include an elegant separator dot or clean pill styling:
   `<span class="vocab-count-indicator"><strong class="card-counter">${t('vocab.card_counter', { current: this.currentIndex + 1, total: totalCount })}</strong></span><span class="vocab-counter-divider" style="opacity: 0.4; margin: 0 6px;">·</span><span class="streak-counter">${t('vocab.reviewed_count', { count: this.reviewCountInRun })}</span>`

2. In `vocabulary-dossier.ts`, format the morphological breakdown for `ROOT_FORGE` on the back of the card:
   Currently it is concatenated as:
   `backSubText = `Prefix: ${b.prefix} • Root: ${b.root} • Suffix: ${b.suffix}\nFamily: ${b.derivationalFamily.join(', ')}\n${b.morphologyAnalysis}`;`
   This results in an unreadable text-wall on mobile.
   Format this into clean, structured HTML with semantic chips/blocks or lines:
   - Prefix: `contra- (Latin: against, opposite)`
   - Root: `dict (Latin dicere: to speak)`
   - Suffix: `None (zero suffix)`
   - Family: `contradiction, contradictory, contradictorily`
   - Core Analysis: `contra- (against) + dict (speak) -> speak against a claim`
   Style these with `.morph-breakdown-box`, `.morph-item`, `.morph-label`, `.morph-val` in `dossiers.css`.
   Ensure `AtomicCard` or the card face container properly renders this HTML or updates `backSubText` cleanly.

3. Verify by running `npm run build:fast` inside `web` directory.

