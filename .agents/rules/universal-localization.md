# Rule: Universal Localization & Immediate i18n Standard

> **MANDATORY SPECIFICATION FOR ALL AGENTS AND DEVELOPERS**  
> **Source Engine:** Core Internationalization Engine ([`web/src/core/i18n.ts`](file:///e:/Eng/web/src/core/i18n.ts)).  
> **Operational Invariants:** [`AGENTS.md`](file:///e:/Eng/AGENTS.md) & [`CLAUDE.md`](file:///e:/Eng/CLAUDE.md). Both documents must stay in strict lockstep sync.  
> **Scope:** Entire application suite (CEFR Skill Tree, 6 Mastery Dossiers, Placement Quiz, 12 Tenses, IELTS Academic Suite, Navigation HUD, Modals & Cockpits).

From now on, **localization is a strict, non-negotiable architectural requirement** across the entire application. Every new UI text MUST be localized immediately upon introduction.

---

## 1. Zero Hardcoded UI Text Policy

1. **Immediate Localization Requirement:**
   - Every single user-facing text element introduced in TypeScript, JavaScript, or HTML templates must be wrapped in `t('key')` or declared via DOM attribute `data-i18n`.
   - Never commit raw English or Vietnamese literal strings in UI components, buttons, tabs, modal dialogs, kickers, badges, input placeholders, tooltips (`title`), accessibility labels (`aria-label`), progress receipts, or toast alerts.

2. **Full Scope of Localization:**
   - **Visible Content:** Headings (`h1`–`h4`), paragraph prose, lead descriptions, card titles, table headers, list items, pill badges, and step roadmaps.
   - **Interactive Actions:** Button labels, tab titles, segmented switchers, and dropdown options.
   - **Telemetry & Metadata:** Status indicators (`statusLabel`), countdown timers, word/sentence counters, accuracy meters, CEFR level descriptors, and rank titles.
   - **Feedback & Prompts:** Explanations, why-prompts, error alerts, confirmation dialogs, score receipts, and celebratory toasts.
   - **Attributes:** `placeholder`, `title`, `aria-label`, and `aria-description`.

---

## 2. Symmetrical Dictionary Parity Mandate

1. **Lockstep Synchronisation (`EN_DICTIONARY` & `VI_DICTIONARY`):**
   - Whenever a new key is added to `EN_DICTIONARY`, the exact same key must simultaneously be added to `VI_DICTIONARY` with an idiomatic, natural, and pedagogically accurate Vietnamese translation.
   - The key count in `EN_DICTIONARY` and `VI_DICTIONARY` must remain mathematically identical at all times (zero missing keys in either direction).

2. **Parameter Interpolation Consistency:**
   - If a translation contains parameterized tokens like `{count}`, `{current}`, `{total}`, `{band}`, or `{date}`, both English and Vietnamese entries must contain the exact same token names.

3. **Semantic Key Naming Convention:**
   - Use structured dot-notation: `<module>.<feature>_<element>` (e.g. `writing.phrasebank_btn`, `card.pillar.read`, `diag.step_n`, `vault.hero_title`).
   - Dynamic enumerated values (such as ranks, categories, chart kinds, or CEFR levels) must have all valid keys fully declared in both dictionaries (e.g. `card.cat.<category_slug>`, `rank.<rank_slug>`, `chart.<kind>`).

---

## 3. Enforcement & Verification

1. **Pre-Commit Verification Suite:**
   - Run `node web/scripts/verify-i18n.cjs` before marking any UI or feature task complete.
   - Verification must confirm 0 missing keys, 0 empty translations, and 100% parameter symmetry.
2. **TypeScript Compilation:**
   - Run `tsc --noEmit` from the `web/` directory to ensure all `t()` calls and imports resolve cleanly without type errors.

