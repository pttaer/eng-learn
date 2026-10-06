# Core Loop & Pedagogical Ecosystem: Implementation Plan

**Initiative 20**: Closing the 5 critical pedagogical and progression gaps across the floor.

---

### Task 1: Balanced 24-Question Multi-Skill Diagnostic Placement Engine
- **Ticket**: `ENG-59`
- **Owner**: `dwight-mul1u508`
- **Deliverables**:
  1. `web/src/core/placement.ts`: Expand question builder to construct 24 questions (4 per level A1-C2: 1 vocab, 1 collocation, 1 grammar, 1 reading cloze). Pass mark: 3/4 per level.
  2. `web/src/modules/placement-quiz.ts`: Support multi-skill questions with clear type pills (`[ VOCAB ]`, `[ COLLOCATION ]`, `[ GRAMMAR ]`, `[ READING ]`).
  3. `web/scripts/verify-placement.cjs`: Update verification test asserting 24 questions, 4 per tier, distractor parity, and ceiling scoring logic.

---

### Task 2: Interactive Syntactic Transformation Console in Grammar Dossier
- **Ticket**: `ENG-60`
- **Owner**: `phyllis-mul1ur07`
- **Deliverables**:
  1. `web/src/modules/grammar-dossier.ts`: Add front-face transformation input field, `[ Verify Transformation ]` action, Myers diff token calculation, audio feedback, and keyboard shortcuts (`Enter` to verify, `Space` to flip).
  2. `web/src/assets/styles/dossiers.css`: Style `#grammar-transform-input`, `.grammar-verify-btn`, and inline diff preview tags.
  3. `web/scripts/verify-grammar-interactive.cjs`: Verification test checking interactive input, diff calculation, and accessibility.

---

### Task 3: Whole-Floor Constellation Tree Mastery Feedback Integration
- **Ticket**: `ENG-61`
- **Owner**: `jim-mum0qdlb`
- **Deliverables**:
  1. `web/src/core/skill-tree-engine.ts`: Implement `advanceBranchMastery(branchId: BranchId, level: Cefr, delta?: number)`.
  2. Wire invocations across all 4 dossiers:
     - `grammar-dossier.ts`: Advance grammar node upon rating 'good' (+5%).
     - `collocations-dossier.ts`: Advance collocations node upon rating 'good' (+5%).
     - `speaking-dossier.ts`: Advance speaking node upon take completion (+5%).
     - `reading-dossier.ts`: Advance reading node upon Pass 4 completion (+10%).
  3. `web/scripts/verify-tree-progression.cjs`: Automated test verifying mastery increments across all 5 branches.

---

### Task 4: Level-Adaptive Daily Workout Plan & Habit Scaling
- **Ticket**: `ENG-62`
- **Owner**: `jim-mul1meuh`
- **Deliverables**:
  1. `web/content/habits/daily-plan.md` & `habits.json`: Add level-specific daily workout routines for A1, A2, B1, and B2.
  2. `web/src/modules/skill-tree-view.ts`: Make Today's 15-Minute Workout banner dynamically reflect `StorageManager.getLearnerLevel()`.
  3. `web/src/modules/mission-log.ts`: Update habit checklist rendering to filter or highlight active level habits.
  4. `web/scripts/verify-adaptive-workout.cjs`: Verification test checking level scaling.

---

### Task 5: Active Cloze Transcription Mode in Listening Dossier
- **Ticket**: `ENG-63`
- **Owner**: `andy-mul1ug04`
- **Deliverables**:
  1. `web/src/modules/listening-dossier.ts`: Add mode toggle for `[ Cloze Transcription ]`, playback speed controls (0.8x, 1.0x, 1.2x), blanked keyword slots, real-time typing evaluation, and mechanical keystroke sounds.
  2. `web/src/assets/styles/dossiers.css`: Style cloze audio player, masked inputs, and correct/incorrect status tags.
  3. `web/scripts/verify-listening-cloze.cjs`: Automated verification test.
