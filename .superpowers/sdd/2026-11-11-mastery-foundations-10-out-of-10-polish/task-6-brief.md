# Task 6 Brief: Cambridge Drills Tabs, Card-As-Button & Email Sandbox Polish

**Files:**
- Modify: `web/src/modules/drills-dossier.ts`
- Modify: `web/src/assets/styles/drills.css`
- Modify: `web/src/modules/email-builder.ts`

**Objectives:**
1. In `web/src/assets/styles/drills.css`:
   - Fix 3-row wrapping of `.drill-chips`:
     ```css
     .drill-chips {
       display: flex !important;
       flex-wrap: nowrap !important;
       overflow-x: auto !important;
       scrollbar-width: none !important;
       -webkit-overflow-scrolling: touch;
       gap: 8px !important;
       padding: 4px 0 !important;
       margin-bottom: 8px !important;
     }
     .drill-chips::-webkit-scrollbar {
       display: none !important;
     }
     .drill-chip {
       white-space: nowrap !important;
       flex-shrink: 0 !important;
     }
     ```
   - Enforce uniform 3-column grid on `.drills-tabs` per Invariant 16:
     ```css
     .drills-tabs {
       display: grid !important;
       grid-template-columns: repeat(3, 1fr) !important;
       width: 100% !important;
       gap: 6px !important;
     }
     ```

2. Implement Card-as-Button on `.drill-card` per Invariant 9:
   In `web/src/modules/drills-dossier.ts`:
   Make the entire `.drill-card` an interactive card button:
   ```html
   <article class="drill-card" data-action="open" data-value="${s.id}" style="cursor: pointer;" tabindex="0" role="button" aria-label="${esc(s.title)}">
     <div class="drill-card-head-row" style="display: flex; justify-content: space-between; align-items: flex-start;">
       <div class="drill-card-meta"><span class="drill-kicker">${esc(s.skill)}</span><span class="drill-mono">${s.cefrLevel}</span><span class="drill-mono">${s.minutes} min</span></div>
       <span class="drill-card-arrow" aria-hidden="true" style="font-size: 18px; color: var(--accent-gold); opacity: 0.8;">→</span>
     </div>
     <h3 class="drill-card-title">${esc(s.title)}</h3>
     <p class="drill-card-objective">${esc(s.objective)}</p>
   </article>
   ```
   Remove the bulky full-width `<button class="drill-btn">Start</button>` at the bottom of the card! This cuts ~40px off every card, eliminates repetitive buttons, and satisfies Invariant 9.

3. In `web/src/modules/email-builder.ts`:
   Add a convenient "Sao chép thư" (Copy to clipboard) button next to "Xóa bản nháp":
   When clicked, it copies the draft text and shows a brief feedback toast or status indicator.

4. Verify with `npm run build:fast` in `web`.
5. Write report to `e:\Eng\.superpowers\sdd\2026-11-11-mastery-foundations-10-out-of-10-polish\task-6-report.md`.

