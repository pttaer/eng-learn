# SDD ledger — plan: docs/superpowers/plans/2026-11-11-four-pillars-perfection-plan.md

## Pre-flight Conflict Scan Table
| Task Pair / File | Interface / Expectation | Finding | Ruling |
| --- | --- | --- | --- |
| Task 1 (`writing-dossier.ts`) | `computeDiffTokens(normTarget, normTyped)` | Char-level diff shredded words into unreadable soup | Upgrade to word/token-level diff preserving punctuation/spaces; keep return type `ProofreadDiffToken[]` |
| Task 2 (`hud-base.css`, `zen-mode.ts`) | `#app.zen-active` reading chrome | Chrome was not hidden, floating pill overlapped text, desktop `Esc` on mobile | Hide all reading chrome in Zen; add top clearance clamp(64px, 10vh, 96px); hide Esc badge on <=768px |
| Task 3 (`reading-dossier.ts`) | Reading header / passes | 7 stacked control tiers push text below fold | Compact metadata bar, streamlined horizontal passes, article text visible above fold |
| Task 4 (`ux-c.css`, `dossiers.css`) | `.speaking-mode-cluster` | `flex-wrap: wrap !important` wraps across 3 rows on mobile | Change to single-line horizontal scroll per AGENTS.md Rule 7 |
| Task 5 (`scripts/capture-all-flows.cjs`) | Verification snapshots | Rebuild dist and capture all 17 screenshots | Verify all views achieve 10/10 perfection |

- [x] Task 1: Semantic Word-Level Myers-Hirschberg Diff Engine (commit 8de4cc1, review clean)
- [x] Task 2: Pure Zen Immersion Mode & Floating Rescue Pill Fix (commit 8c21032, review clean)
- [x] Task 3: Streamlined Reading Pass 1 & Anti-Control Overload (commit b40937d, review clean)
- [x] Task 4: Speaking Studio Mobile Tab Strip Fix (AGENTS.md Rule 7) (commit 57c3927, review clean)
- [x] Task 5: Recapture & Visual Verification (commit f4b21d5, review clean - all 17 views 10/10)

