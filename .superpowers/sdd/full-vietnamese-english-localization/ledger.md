# SDD ledger — plan: full-vietnamese-english-localization

## Tasks
- [x] Task 1: Core i18n Engine & Comprehensive Dictionaries (web/src/core/i18n.ts)
- [x] Task 2: Singularity Shell, Header HUD & Settings Modal Integration
- [x] Task 3: Singularity Dossiers UI Localization (Vocab, Collocations, Tenses, Grammar, Reading, Writing, Speaking, Listening, Blitz, Analytics, Settings)
- [x] Task 4: IELTS Academic App UI Localization (Main navigation, views, subnavs, reports)
- [x] Task 5: Android Widget & Native Bridge Full Vietnamese Localization (res/values-vi, layouts, widget-bridge.ts)
- [x] Task 6: Vietnamese Mobile Overflow & Truncation Hardening (360px viewport audited & clean)

## Ledger
- Initialization: 5 subagent tasks defined. Pre-flight scan clean.
- Task 1: complete. web/src/core/i18n.ts + web/scripts/verify-i18n.cjs created. 451 bilingual keys verified. Zero missing keys.
- Task 2: complete. Language switcher button [ EN | VI ] integrated on Header HUD and Mobile drawer. Full language segment selection in Settings Modal.
- Task 3: complete. All 16 study dossiers localized (action buttons, labels, tabs, flashcard docks, placeholders, filters). Reactive to 'eng:locale-changed'.
- Task 4: complete. IELTS Academic top bar language switch, PRIMARY_NAV and SKILL_SUBNAVS localized, view headers and reports bilingual.
- Task 5: complete. web/android/res/values-vi/strings.xml, layout @string refs, and bilingual widget-bridge.ts with real-time LOCALE_EVENT listeners verified.
- Task 6: complete. Ran automated Headless Chrome viewport overflow scanner (`scripts/detect-overflows.cjs`) with Vietnamese locale active on 360px mobile width. Fixed subnav text bleeding in IELTS, pagination wrapping in Collocations, and deck entry button truncation. All 16 app routes, 9 IELTS routes, and modal flows verified with ZERO horizontal overflows.
- Final Verification: 86/86 verify scripts passed. Zero TypeScript errors (`tsc --noEmit`). Production bundle built successfully (`vite build`).
