# Expansion Plan: 6-Pillar Architecture with Roguelike Vocabulary & Dedicated Collocations Vault

> **Status (2026-10-05):** implemented; the unchecked boxes below were not maintained. See `docs/audits/STATUS.md` for what is still open.

## Architectural Specification & Task Decomposition

**Goal:** Expand the Monochrome "Sea Urchin" Interactive English Web System from 4 gateways to **6 radial gateways** around the Singularity Core, introducing:
1. **Pillar 05: VOCABULARY (Roguelike Multi-Mode Engine)** — featuring 3 modes: (A) Root Forge (AWL & Greek/Latin Roots), (B) CEFR Ascent (Progressive Difficulty B1 -> C2), (C) Particle Lab (Phrasal Verbs by Particle Semantics), with steepness-controlled learning curve, random "Remind Card" drops, and native SM-2 scheduling.
2. **Pillar 06: COLLOCATIONS (Dedicated 1,000 Matrix)** — dedicated vault for the 1,000 collocations across 4 domains with instant search (`Ctrl+K`), domain filtering, and SRS batch queue.
3. **Pillar 01: READ (Intensive Reading & Sentence Mining)** — refactored from collocation carrier into authentic 4-pass reading deconstruction and context sentence mining from `reading.md`.

**Design Mandate:** Strict compliance with [`CLEAN_DESIGN_SYSTEM.md`](file:///E:/Eng/CLEAN_DESIGN_SYSTEM.md) (pure `#FFFFFF` canvas, `#000000` ink, `rgba(0,0,0,0.12)` hairlines, 8pt grid, 2 fonts max, composite-only 60/120 FPS motion, Universal Atomic Card Standard).

---

## 1. Radial Geometry & Node Topology (6 Gateways @ 60°)

```
                         [01 READ] (-90°)
                                ▲
      [06 COLLOC] (-150°)       │       [02 WRITE] (-30°)
                    ↖           │           ↗
                      ┌─────────┴─────────┐
                      │  SEA URCHIN CORE  │
                      └─────────┬─────────┘
                    ↙           │           ↘
       [05 VOCAB] (150°)        │       [03 LISTEN] (30°)
                                ▼
                         [04 SPEAK] (90°)
```

- Spines part on hover to reveal all 6 nodes at exact 60° radial symmetry ($r = 82\text{px}$).
- Node badges: 24px circular monochrome badges with numeric code and label.

---

## 2. Pedagogical Architecture of Pillar 05: VOCABULARY

### 2.1 The 3 Roguelike Modes
1. **Mode A: [ROOT FORGE] — AWL & Morphological Root Deconstruction**
   - Deconstructs words into Prefix + Root + Suffix.
   - Example: Root `CHRON` (time) -> *synchronous*, *anachronism*, *chronic*, *chronometer*.
   - Front: Challenge prompt & root clue -> Flip -> Back: Root breakdown, etymological map, derivative family.
2. **Mode B: [CEFR ASCENT] — Tiered Difficulty (B1 -> B2 -> C1 -> C2)**
   - Progressive difficulty ladder.
   - Level 1 (Easy / B1-B2): High-frequency workhorse vocabulary.
   - Level 2 (Intermediate / C1): Nuanced analytical and executive words.
   - Level 3 (Mastery / C2 & GRE): High-register precision lexicon (*obviate*, *trenchant*, *surreptitious*).
3. **Mode C: [PARTICLE LAB] — Phrasal Verbs by Particle Semantics**
   - Focuses on systematic particle logic rather than arbitrary lists:
     - `UP` (completion, upward velocity: *wind up*, *scale up*, *eat up*).
     - `OUT` (exhaustion, disclosure: *burn out*, *figure out*, *phase out*).
     - `DOWN` (suppression, settling: *crack down*, *cool down*, *pare down*).

### 2.2 Roguelike Mechanics & Anki-Style Learning Curve
- **Progressive Difficulty**: Users unlock higher tiers as their SM-2 mastery score escalates.
- **Random "Remind Cards"**: Every 7–10 cards, the engine injects a random surprise encounter card from an earlier tier or a lapse card to test unexpected recall and combat retention decay. Marked with a special HUD bracket badge: `[SURPRISE FLASH REMIND // ENGRAM CHECK]`.
- **SM-2 Engine Integration**: Canonical SM-2 scheduling ($EF \ge 1.3$, Grade 4 retains constant EF, interval progression $1 \rightarrow 6 \rightarrow \text{round}(I \times EF)$).

---

## 3. Pillar 06: Dedicated COLLOCATIONS Vault
- Extracted into its own dedicated dossier: `collocations-dossier.ts`.
- Retains full 1,000 collocations dataset with 4 categories (`EVERYDAY`, `BUSINESS`, `ACADEMIC`, `IDIOMS`).
- Direct navigation via `#colloc`, `Ctrl+K` instant search, audio pronunciation, and `[⚡ SRS DUE BATCH (20)]` queue.

---

## 4. Pillar 01: READ (Intensive Reading & Contextual Mining)
- Built in `reading-dossier.ts` from `reading.md`.
- Features 4-Pass Intensive Reading text deconstruction:
  - Pass 1: Cold Read & Lexical Marking
  - Pass 2: Syntactic Clause Dissection (Subject-Verb-Object core)
  - Pass 3: Sentence Mining ($i+1$ target cards)
  - Pass 4: Synthesis & Recall

---

## 5. File Changes & Task Plan

### Task 1: Curriculum Dataset Expansion (`src/assets/data/`)
- Update `scripts/parse-curriculum.cjs` to generate:
  - `src/assets/data/vocabulary.json`: 3 modes with 120 curated items across levels B1 to C2, roots, and phrasal particles.
  - `src/assets/data/reading.json`: Intensive reading passages with syntax breakdowns and $i+1$ sentences.
- Re-run parser and verify JSON integrity.

### Task 2: Living Sea Urchin & Compass 6-Node Expansion
- In `src/core/sea-urchin.ts`: Expand `gateways` array to 6 nodes at 60° intervals (`read`, `write`, `listen`, `speak`, `vocab`, `colloc`).
- In `src/modules/corner-compass.ts`: Add `VOCAB` and `COLLOC` to radial quick-menu.
- In `src/core/router.ts`: Register `#vocab` and `#colloc` routes.

### Task 3: Build Dedicated Collocations Dossier (`collocations-dossier.ts`)
- Rename/refactor `lexicon-dossier.ts` into `collocations-dossier.ts` dedicated exclusively to Pillar 06.
- Route `#colloc`.

### Task 4: Build Reading Dossier (`reading-dossier.ts`)
- Implement `reading-dossier.ts` for Pillar 01 (`#read`).
- Displays authentic passage excerpts, syntax tree deconstruction, and $i+1$ contextual sentence mining cards.

### Task 5: Build Roguelike Vocabulary Dossier (`vocabulary-dossier.ts`)
- Implement `vocabulary-dossier.ts` for Pillar 05 (`#vocab`).
- 3 Roguelike mode tabs: `[ROOT FORGE]`, `[CEFR ASCENT]`, `[PARTICLE LAB]`.
- Level/difficulty selector (Level 1 Easy -> Level 3 Mastery).
- Periodic random Remind Card injection generator.
- Full Universal Atomic Card Standard integration with 3D flip.

### Task 6: Shell Integration & Production Build
- In `src/main.ts`: Wire all 6 dossiers into router and global keyboard hotkeys.
- Verify `npm run build` and cohort simulation.
