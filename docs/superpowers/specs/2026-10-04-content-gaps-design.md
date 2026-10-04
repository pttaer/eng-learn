# Content Gaps & Hygiene Pass — Design

## Understanding
Goal: close the open items from `docs/audits/STATUS.md` that are content/tooling, not features. For the learner: more listening practice, collocations that are all unique, every habit day with a full 3-task workout. For the maintainer: lighter repo, fresh installer. User said "decide yourself", motion/design untouched.

## Scope (in)
1. **Collocation dupes** — 9 phrases appear twice. Replace the later occurrence with a new unique phrase of the same category (keeps total at 1000, index/ids stable). Add a uniqueness assertion to `verify-content-pipeline`.
2. **Habit days** — days 6,10,17,20,23,24,25,27,28,29,30 have 2 tasks. Append a third 10m SRS-review task. Assert every day has ≥3 tasks.
3. **Listening** — 3 → 9 passages in `content/listening/phonetics-passages.md` (JSON block feeds `listening.json`). Raise the test floor to 9.
4. **Light-mode `--ink-muted`** — `#64748b` → `#475569` (AAA 7:1 on white).
5. **Repo** — untrack vendored `.claude/skills/` (`git rm -r --cached` + `.gitignore`); files stay on disk.
6. **Installer** — `npm run dist:win && npm run test:installer`.

## Out of scope
Splitting `reading-dossier.ts` (own spec, own plan), anime.js v4, collocation example sentences (1000 items, needs authoring pass), subvocalization wording.

## Constraints
Content only via `web/content/**/*.md` → `compile-content.cjs` (never hand-edit `src/assets/data/*.json`). `npm test` must stay 24/24. No push without request.

## Success
`npm test` green; 1000 unique phrases; 30 days × ≥3 tasks; 9 listening passages render in the dossier; installer test passes.
