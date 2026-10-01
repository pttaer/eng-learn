# Design Spec: RPG Progression Hub, In-Text Lexicon Drawer & AWL 500 Corpus

## 1. Objective & Scope
Transform the English Singularity learning platform into a gamified, immersive C2 learning ecosystem:
1. **RPG Progression Hub**: Daily quest tracking, XP/Level state machine, streak multipliers, and HUD progress integration.
2. **In-Text Lexicon Drawer**: Universal sliding HUD drawer providing zero-latency O(1) etymology, IPA, Vietnamese translation, and 1-click SRS card saving on any clicked word or text selection.
3. **Zen Focus Mode**: Instant distraction-free study immersion (hotkey `Z`) with viewport dimming and subtle generative binaural audio.
4. **AWL 500 & Root-Forge Expansion**: 500 curated Academic Word List items categorized by Greco-Latin roots and academic domains.
5. **C2 Reading Masterworks**: 3 foundational essays with syntactic annotations and copywork prompts.

---

## 2. Architecture & Components

```mermaid
flowchart TD
    MD[web/content/vocabulary/awl-corpus.md<br/>web/content/reading/*.md] --> CC[web/scripts/compile-content.cjs]
    CC --> JSON[web/src/assets/data/lexicon-dictionary.json<br/>reading.json, vocabulary.json]
    
    JSON --> LD[lexicon-drawer.ts<br/>O(1) Offline Dictionary Lookup]
    JSON --> RD[reading-dossier.ts<br/>Annotated C2 Essays]
    
    PE[progression-engine.ts<br/>XP / Level / Quests] --> PM[progression-modal.ts<br/>HUD Modal]
    PE --> HH[header-hud.ts<br/>[ LVL X • XP ] pill]
    
    ZM[zen-mode.ts<br/>Hotkey Z / Audio Hum] --> APP[#app / Viewport]
```

### Component Details:
1. **`progression-engine.ts`**:
   - Storage key: `eng_progression_v1`.
   - Pure state schema: `{ xp: number, level: number, streak: number, lastActiveDate: string, quests: DailyQuest[] }`.
   - Level formula: `Math.floor(Math.sqrt(xp / 100)) + 1`.
   - Event emitter pattern: `onProgressUpdate(cb)` to notify HUD and modal.
2. **`progression-modal.ts`**:
   - Glassmorphic modal showcasing Level badge, daily quest progress bars (e.g. 0/20 collocations reviewed, 0/1 copywork exercise), and streak counter.
3. **`lexicon-drawer.ts`**:
   - Global singleton mounted to `#hud-overlay`.
   - Intercepts clicks on `.lexicon-word` or text selection inside reading/writing/drills.
   - Instant O(1) dictionary query against `lexicon-dictionary.json`.
   - Displays: Word, IPA, Part of Speech, Greco-Latin Root family, Definition, Vietnamese translation, Collocation examples, and `[+ Add to SRS Deck]` (bridges directly into `SRSEngine`).
4. **`zen-mode.ts`**:
   - Toggles `zen-active` class on `#app`.
   - In zen mode: dims constellation background to `#030303`, hides auxiliary nav buttons, centers and clamps text measure to 65ch.
   - Activates soft 40Hz gamma binaural focus tone via `AudioContext` oscillator in `audio-synthesizer.ts` (gain clamped to 0.05).
5. **`compile-content.cjs`**:
   - Parses `web/content/vocabulary/awl-corpus.md` into 500 normalized dictionary tokens.
   - Emits `web/src/assets/data/lexicon-dictionary.json` mapping lowercase word stems to rich metadata.

---

## 3. Floor Fleet Allocation (Subagent-Driven Development)
1. **Dwight (`dwight-mul1u508`)**: Task 1 — `progression-engine.ts` & `progression-modal.ts` with local storage persistence.
2. **Andy (`andy-mul1ug04`)**: Task 2 — `zen-mode.ts` & Audio Synthesizer focus drone integration.
3. **Phyllis (`phyllis-mul1ur07`)**: Task 3 — `lexicon-drawer.ts` & styling (`dossiers.css`).
4. **Jim (`jim-mul1meuh`)**: Task 4 — AWL 500 corpus (`awl-corpus.md`) & 3 C2 Reading masterworks in `web/content/`.
5. **JimMA (`jim-mum0qdlb`)**: Task 5 — Compiler update (`compile-content.cjs`), test suite (`verify-progression-lexicon.cjs`), and production build verification.

---

## 4. Verification & Testing
- Unit test: `web/scripts/verify-progression-lexicon.cjs` (tests XP leveling, quest completion, O(1) dictionary lookup, zen mode toggle).
- Build test: `npm run build` in `web/` compiling cleanly with 0 TypeScript errors.
- End-to-end test: Headless browser QA verification.
