# Core Loop & Pedagogical Ecosystem: Design Specification

**Initiative 20**: Closing the 5 critical pedagogical and progression gaps in English Singularity.

---

## 1. Problem Statement & Motivation
Prior to this initiative:
1. **Tree Progression Disconnect**: Only `writing-dossier` advanced tree node mastery (`SkillTreeEngine.setNodeMasteryPct`). The other 4 branches (`grammar`, `collocations`, `speaking`, `reading`) were 100% disconnected from the 40-node Constellation Skill Tree.
2. **Grammar Passive Illusion**: Grammar was passive flashcard flipping. Learners saw the prompt sentence, but could not actively type their syntactic transformation or receive real-time diff evaluation before seeing the answer.
3. **Vocab-Only Placement**: The placement quiz tested 18 questions across vocabulary and collocations only, completely ignoring grammar syntax and reading comprehension.
4. **Hardcoded Advanced Workout**: The 15-Minute Workout banner and 30-day habits were hardcoded to C1/C2 exercises (Franklin copywork, Nation 4-3-2), alienating A1–B1 learners.
5. **Passive Listening**: Listening consisted of passive TTS audio playback without active cloze transcription or comprehension gap-fills.

---

## 2. Architecture & Subsystem Specifications

### 2.1 Whole-Floor Tree Mastery Integration (`skill-tree-engine.ts`)
- **Helper Method**: Introduce `SkillTreeEngine.advanceBranchMastery(branchId: BranchId, level: Cefr, delta = 5): void`.
- It finds `SkillTreeEngine.nodeForLevel(branchId, level)`:
  - Retrieves current mastery percentage.
  - Clamps new value between 0 and 100.
  - Persists to `StorageManager.loadState().treeProgress[node.id]`.
  - Dispatches `tree-mastery-updated` event so HUD / Tree views update reactively.
- **Hook Invocations**:
  - `grammar-dossier.ts`: Upon rating a card `'good'`.
  - `collocations-dossier.ts`: Upon rating a card `'good'` or batch completion.
  - `speaking-dossier.ts`: Upon completing a 4-3-2 round take with collocation hits $\ge 80\%$.
  - `reading-dossier.ts`: Upon completing Pass 4 synthesis précis.

### 2.2 Interactive Syntactic Transformation in Grammar (`grammar-dossier.ts`)
- **Front Face Interactive Console**:
  - Input field `#grammar-transform-input` below prompt sentence and cue.
  - Placeholder: `"Type transformed syntactic resolution (or press Space to flip)..."`
  - Keystroke acoustics wired to `AudioSynthesizer.play('keystroke')`.
  - On `Enter` or `[ Verify Transformation ]` button:
    - Runs Myers diff tokenization (`computeDiffTokens(userText, item.targetTransformation)`).
    - If exact match or $\ge 90\%$ match, displays glowing green token diff and auto-advances to back face with celebration audio.
    - If mismatches exist, renders inline token-by-token diff highlighting omissions and incorrect syntax.

### 2.3 Balanced 24-Question Multi-Skill Placement Engine (`placement.ts`)
- **Balanced Matrix**: 24 items (4 questions per level A1 to C2):
  - Question 1: Vocabulary definition.
  - Question 2: Collocation phrase completion.
  - Question 3: Grammar syntactic transformation / error recognition.
  - Question 4: Reading mini-passage cloze comprehension.
- Distractors drawn exclusively from the same CEFR tier.
- Placement ceiling rule: `PASS_MARK = 3` out of 4 (75% threshold). Stops at first level failed.

### 2.4 Level-Adaptive Daily Workout HUD & Habits
- **Dynamic Workout Banner**:
  - A1: 5 Vocabulary Cards + 1 A1 Collocation drill + 1 Phonetic listen.
  - A2: 5 Vocabulary Cards + 1 A2 Grammar rule + 1 Short reading pass.
  - B1: 8 Collocations + 1 B1 Grammar rule + 1 Paragraph copywork.
  - B2: 10 Collocations + 1 B2 Inversion rule + 1 Speech take.
  - C1: 15 Collocations + 1 Rhetorical copywork + 1 Nation 4-3-2 take.
  - C2: 20 Collocations + 1 Master copywork + 1 C2 Intensive reading analysis.

### 2.5 Active Cloze Transcription Mode in Listening (`listening-dossier.ts`)
- **Interactive Cloze Audio Console**:
  - Mode switch: `[ 📖 Passive Passages ]` vs `[ ✍️ Cloze Transcription ]`.
  - Speed selector: `0.8x`, `1.0x`, `1.2x`.
  - Masked transcript with blank input slots for key phonetic / connected-speech words.
  - Input evaluation with real-time token feedback.

---

## 3. Floor Delegation Contracts
- **Dwight (`dwight-mul1u508`)**: ENG-59 (Balanced 24-Question Placement Engine).
- **Phyllis (`phyllis-mul1ur07`)**: ENG-60 (Interactive Grammar Transformation Console).
- **JimMA (`jim-mum0qdlb`)**: ENG-61 (Whole-Floor Tree Mastery Integration & Test Harness).
- **Jim (`jim-mul1meuh`)**: ENG-62 (Level-Adaptive Daily Workout & Habit Scaling).
- **Andy (`andy-mul1ug04`)**: ENG-63 (Active Cloze Transcription Listening Mode).

---

## 4. Definition of Done & Verification
- All new scripts and updated modules pass TypeScript compilation with 0 errors.
- `npm test` passes 100% across all verify test scripts.
- Tree mastery advances when practicing all 5 skills.
- Regression tests pass cleanly.
