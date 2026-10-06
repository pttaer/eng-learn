# Multi-Skill CEFR Diagnostic & Level Calibration: Implementation Plan

**Initiative 21**: Testing all learner skills one by one to calibrate independent CEFR levels and configure the app.

---

### Task 1: Core Multi-Skill Diagnostic Engine & Storage v3 Migration
- **Ticket**: `ENG-64`
- **Owner**: `dwight-mul1u508`
- **Deliverables**:
  1. `web/src/utils/storage.ts`: Bump to `CURRENT_VERSION = 3`. Add `skillLevels: Record<SkillId, Cefr>`, migration from v2 preserving existing `learnerLevel`, accessor methods `getSkillLevel`, `setSkillLevel`, `getSkillProfile`.
  2. `web/src/core/multi-skill-placement.ts`: Diagnostic engine with 5-stage sequential question runner, per-skill CEFR calculation, and overall median level resolver.
  3. `web/scripts/verify-multi-skill-diagnostic.cjs`: Verification test asserting schema v3 migration, multi-stage question generation, distractor validation, and scoring invariants.

---

### Task 2: Celestial Radar Modal & Multi-Stage Quiz Stepper UI
- **Ticket**: `ENG-65`
- **Owner**: `phyllis-mul1ur07`
- **Deliverables**:
  1. `web/src/modules/multi-skill-quiz-modal.ts`: Accessible dialog modal featuring 5-stage stepper (Skill 1 of 5 through 5 of 5), keyboard selection (1-4, Enter), and instant stage transitions.
  2. Celestial Radar SVG Pentagram: Concentric A1-C2 rings with filled glowing cyan/gold polygon representing learner proficiency.
  3. `web/src/modules/header-hud.ts`: Add `[ 🎯 DIAGNOSTIC ]` button or trigger inside Level Picker to launch the Multi-Skill Diagnostic anytime.
  4. `web/src/assets/styles/dossiers.css`: Styles for `.radar-chart-container`, `.stepper-header`, `.skill-badge-pill`, and results card.

---

### Task 3: Per-Branch Constellation Tree Calibration & Dossier Wiring
- **Ticket**: `ENG-66`
- **Owner**: `jim-mum0qdlb`
- **Deliverables**:
  1. `web/src/core/skill-tree-engine.ts`: Update `getNodeMasteryPct(nodeId)` to evaluate the branch's specific skill level via `StorageManager.getSkillLevel()` instead of single global level.
  2. Wire default level resolution across all dossiers:
     - `grammar-dossier.ts`: `defaultLevel` uses `StorageManager.getSkillLevel('grammar')`.
     - `collocations-dossier.ts`: uses `StorageManager.getSkillLevel('vocab')`.
     - `reading-dossier.ts`: uses `StorageManager.getSkillLevel('reading')`.
     - `listening-dossier.ts`: uses `StorageManager.getSkillLevel('listening')`.
     - `writing-dossier.ts`: uses `StorageManager.getSkillLevel('writing')`.
  3. `web/scripts/verify-branch-calibration.cjs`: Verification test asserting that setting different skill levels (e.g. Vocab C1, Grammar A2) unlocks the correct corresponding branch tiers in the tree.

---

### Task 4: Curated Multi-Skill Assessment Question Bank
- **Ticket**: `ENG-67`
- **Owner**: `jim-mul1meuh`
- **Deliverables**:
  1. `web/src/assets/data/diagnostic-questions.json`: Curated 30-item question matrix across all 5 skills $\times$ 6 CEFR tiers (A1 through C2):
     - Stage 1: Vocabulary & Collocation definitions.
     - Stage 2: Grammar syntax transformations and error spotters.
     - Stage 3: Reading mini-inference passages.
     - Stage 5: Writing precision & rhetorical register comparisons.
  2. High-quality Vietnamese translations and distractor parity within the same CEFR tier.

---

### Task 5: Listening Audio Prompts & Acoustic Telemetry for Multi-Skill Quiz
- **Ticket**: `ENG-68`
- **Owner**: `andy-mul1ug04`
- **Deliverables**:
  1. Listening Stage in `multi-skill-quiz-modal.ts`: Audio speech prompt playback with 0.8x / 1.0x / 1.2x speed controls, phonetics cue, and connected-speech gap identification.
  2. Procedural soundscape integration: stage completion chimes, radar polygon entrance animation sound, and celebration fanfares.
  3. Regression testing with `verify-audio-sensory.cjs`.
