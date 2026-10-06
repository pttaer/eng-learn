# Multi-Skill CEFR Diagnostic & Skill-by-Skill Level Calibration: Design Specification

**Initiative 21**: Testing all learner skills one by one, calibrating independent CEFR levels per skill, and unlocking corresponding Constellation Tree branches.

---

## 1. Context & Motivation
Until now, English Singularity tracked a single global `learnerLevel: Cefr` ('A1' through 'C2'). Learners often possess asymmetric language profiles (e.g. C1 passive Vocabulary, but B1 functional Grammar and A2 Speaking).
This initiative introduces:
1. **5-Stage Sequential Skill Diagnostic**: Tests Vocabulary, Grammar, Reading, Listening, and Writing one by one (15 questions total in Quick Diagnostic mode).
2. **Independent Per-Skill CEFR Profile**: Each skill receives its own calibrated level (`A1`–`C2`), alongside an overall aggregate score.
3. **Branch-by-Branch Skill Tree Calibration**: Constellation Tree branches (`grammar`, `collocations`, `reading`, `speaking`, `writing`) unlock according to their specific skill's CEFR level rather than a monolithic global flag.
4. **Celestial Radar Profile Modal**: Visual SVG pentagram / radar visualization comparing learner strengths and areas for growth.
5. **Dossier Calibration**: Each dossier opens by default to the learner's calibrated skill level.

---

## 2. Architecture & Data Model

### 2.1 Storage State Schema (`AppStorageState` v3)
In `web/src/utils/storage.ts`:
```typescript
export type SkillId = 'vocab' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

export interface SkillProfile {
  overall: Cefr;
  skills: Record<SkillId, Cefr>;
  assessedAt: string;
}

export interface AppStorageState {
  version: 3;
  learnerLevel: Cefr; // Overall median level
  skillLevels: Record<SkillId, Cefr>; // Per-skill calibrated levels
  skillProfileHistory?: SkillProfile[];
  placementDone: boolean;
  // ... existing fields (cards, habitStreak, treeProgress, etc.)
}
```

- **Migration from v2**:
  If `skillLevels` is undefined, initialize all 6 skills to `learnerLevel` (default `'B2'` for v1/v2 users, `'A1'` for brand new users).
- **Accessor Methods**:
  - `StorageManager.getSkillLevel(skill: SkillId): Cefr`
  - `StorageManager.setSkillLevel(skill: SkillId, level: Cefr): void`
  - `StorageManager.getSkillProfile(): SkillProfile`
  - `StorageManager.saveSkillProfile(profile: SkillProfile): void`

---

## 3. 5-Stage Diagnostic Engine (`web/src/core/multi-skill-placement.ts`)

### 3.1 Question Battery
15 questions total (3 questions per phase):
- **Stage 1 (Vocabulary & Collocations)**: 3 questions across ladder tiers testing phrase collocation and definition.
- **Stage 2 (Grammar & Syntax)**: 3 questions testing syntactic transformations, inversion, or clausal correction.
- **Stage 3 (Reading Comprehension)**: 3 questions with a mini-passage (2–3 sentences) and inference/cloze.
- **Stage 4 (Listening Comprehension)**: 3 audio prompts (TTS) testing connected speech / liaison identification.
- **Stage 5 (Writing & Precision)**: 3 questions evaluating formal syntactic elegance, PEEL structure, and register.

### 3.2 Scoring Algorithm
- For each skill: evaluates the highest CEFR tier answered correctly with $\ge 2/3$ or highest tier threshold.
- Produces `SkillProfile.skills`:
  - `vocab`: Cefr
  - `grammar`: Cefr
  - `reading`: Cefr
  - `listening`: Cefr
  - `writing`: Cefr
  - `speaking`: Initialized from listening/writing baseline or self-assessment.
- Overall level computed as the median/balanced CEFR index across skills.

---

## 4. UI/UX Flow & Celestial Radar Modal

### 4.1 Diagnostic Flow (`web/src/modules/multi-skill-quiz-modal.ts`)
- Stepper Header: Shows Stage X of 5 with skill badge and progress bar.
- Stage Briefing: 1-sentence prompt describing the skill tested.
- Interactive Question Box: Keyboard-navigable (1, 2, 3, 4, Enter).
- Instant or deferred feedback mode.

### 4.2 Celestial Radar Profile Summary
- SVG Radar Pentagram:
  - 5 axes: Vocabulary, Grammar, Reading, Listening, Writing.
  - Concentric rings for A1, A2, B1, B2, C1, C2.
  - Filled polygon in glowing Celestial Cyan / Gold (`rgba(56, 189, 248, 0.3)`).
- Level Badges: Each skill displays its calibrated level with 1-click manual override if desired.
- Action: `[ Apply Profile & Calibrate App ]` button.

---

## 5. Tree & Dossier Calibrations

### 5.1 Constellation Skill Tree Integration (`web/src/core/skill-tree-engine.ts`)
- `getNodeMasteryPct(nodeId)`:
  - Checks the branch of the node (`branchId`).
  - Reads `StorageManager.getSkillLevel(mappedSkill)`.
  - Tiers below that skill's calibrated level are 100% mastered.
  - The skill's active tier is unlocked (40% default).
  - Tiers above remain locked until prerequisites and drills are completed.

### 5.2 Dossier Default Level Resolution
- `GrammarDossier`: Defaults to `StorageManager.getSkillLevel('grammar')`.
- `CollocationsDossier`: Defaults to `StorageManager.getSkillLevel('vocab')`.
- `ReadingDossier`: Defaults to `StorageManager.getSkillLevel('reading')`.
- `ListeningDossier`: Defaults to `StorageManager.getSkillLevel('listening')`.
- `WritingDossier`: Defaults to `StorageManager.getSkillLevel('writing')`.

---

## 6. Floor Delegation & Work Breakdown
- **Dwight (`dwight-mul1u508`)**: ENG-64 — Core Multi-Skill Diagnostic Engine & Storage v3 Migration.
- **Phyllis (`phyllis-mul1ur07`)**: ENG-65 — Celestial Radar Modal & Multi-Stage Quiz Stepper UI.
- **JimMA (`jim-mum0qdlb`)**: ENG-66 — Per-Branch Constellation Tree Calibration & Dossier Wiring.
- **Jim (`jim-mul1meuh`)**: ENG-67 — Curated Multi-Skill Assessment Question Bank (Reading, Grammar, Vocab items).
- **Andy (`andy-mul1ug04`)**: ENG-68 — Listening Audio Prompts & Acoustic Telemetry for Multi-Skill Quiz.

---

## 7. Verification & Definition of Done
- `verify-multi-skill-placement.cjs`: 100% assertions passing for all 5 skill stages.
- `verify-tree-progression.cjs`: Tree branches unlock accurately according to individual skill levels.
- `npm test`: All verify test suites passing cleanly.
- Production bundle builds with 0 errors.
