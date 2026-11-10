# Daily Guided Workout / Spaced Curriculum Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the self-service catalog (1,502 vocab items, 37 reading passages, 78 writing prompts, 28 listening sections, 46 strategy blueprints, 14 Manchester Phrasebank sections) into an intelligent, offline Daily Guided Workout that eliminates learner analysis paralysis through structured 15, 30, 45, and 60-minute sessions.

**Architecture:** A modular, offline-first curriculum engine in `web/src/ielts/daily-workout/`. Pure generation logic (`generator.ts`) deterministically compiles a daily session based on time budget, SRS overdue cards, star topics, unattempted reading questions, and phrasebank cloze drills. State persistence (`storage.ts`) records step completion, while a dedicated stepper view (`views/daily-workout.ts`) renders an Apple-calm 4-step workout flow with immediate pedagogical feedback, audio haptics, and a celebratory completion receipt.

**Tech Stack:** TypeScript (strict, vanilla DOM), Web Audio API (`AudioSynthesizer`), LocalStorage, Vite 5, Node.js test harness (`assert`).

**Spec:** Requirement Item 1: "Từ 'Kho tự chọn' thành 'Lộ trình mỗi ngày' (Daily Guided Workout / Spaced Curriculum Flow)" from IELTS Cockpit Roadmap.

---

## Global Constraints

1. **100% Offline & Local Execution:** Zero external network calls, zero LLM dependencies; all question scoring, phrasebank cloze drills, and SRS calculations run entirely client-side.
2. **Canonical Design System Invariants:** 
   - Screen insets: `--pad-screen-left: 12px;`, `--pad-screen-right: 12px;`
   - Touch targets: `min-height: 44px; min-width: 44px;` on all interactive buttons and inputs.
   - Button radius: strictly `border-radius: var(--radius-btn, 10px);`.
   - Single breakpoint boundary at 768px (`max-width: 768px`).
   - Symmetrical icon centering (`display: inline-flex; align-items: center; justify-content: center; gap: 8px;`).
3. **Storage Partitioning:** All workout session state is isolated in `localStorage` under `IELTS_DAILY_WORKOUT_STATE` and `IELTS_VOCAB_SRS`; Singularity state (`STARK_ENG_STATE`) is never modified.
4. **Time Budget Calibration:** Support 15 min (Micro Blitz), 30 min (Balanced Foundation), 45 min (Targeted Sprint), and 60 min (Full Mastery Cockpit).
5. **No Regressions:** Existing IELTS views and verify scripts (`web/scripts/verify-*.cjs`) must remain fully functional.

---

## File Structure

| Path | Responsibility |
|---|---|
| `web/src/ielts/daily-workout/types.ts` | Data models and interfaces for session configuration, steps, drills, and progress state |
| `web/src/ielts/daily-workout/storage.ts` | Persistence layer for daily session state, step completion, and streak tracking |
| `web/src/ielts/daily-workout/phrasebank-drills.ts` | Sentence completion / cloze drill generator using Manchester Academic Phrasebank data |
| `web/src/ielts/daily-workout/generator.ts` | Pure deterministic workout generator allocating exercises across 15/30/45/60 min budgets |
| `web/src/ielts/views/daily-workout.ts` | Interactive 4-step workout view with progress runner, exercise cards, and completion receipt |
| `web/src/ielts/main.ts` | Routing registration (`#workout`), overview hero card integration, and time budget sync |
| `web/src/ielts/ielts.css` | Design-system compliant styles for workout hero, stepper, phrasebank cloze, and scorecard |
| `web/scripts/verify-daily-workout.cjs` | Comprehensive automated test harness running under Node.js |

---

## Phase 1: Core Data Models & Session Persistence

### Task 1: Daily Workout Data Types & Storage Manager

**Files:**
- Create: `web/src/ielts/daily-workout/types.ts`
- Create: `web/src/ielts/daily-workout/storage.ts`
- Create: `web/scripts/verify-daily-workout.cjs`

**Interfaces:**
- Consumes: `SRSCardState` from `web/src/core/srs-engine.ts`, `StorageManager` from `web/src/utils/storage.ts`.
- Produces: `DailyWorkoutSession`, `DailyWorkoutStep`, `DailyWorkoutProgressState`, `DailyWorkoutStorage` class with `loadWorkoutState()`, `saveWorkoutState()`, `markStepComplete()`, and `getWorkoutStreak()`.

- [ ] **Step 1: Write the failing test for types and storage persistence**

Create `web/scripts/verify-daily-workout.cjs`:
```javascript
/**
 * Automated Verification Suite for Daily Guided Workout (Item 1)
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== VERIFYING DAILY GUIDED WORKOUT (ITEM 1) ===');

// Mock localStorage for Node test environment
const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

// 1. Check file existence
const typesPath = path.resolve(__dirname, '../src/ielts/daily-workout/types.ts');
const storagePath = path.resolve(__dirname, '../src/ielts/daily-workout/storage.ts');

assert.ok(fs.existsSync(typesPath), 'web/src/ielts/daily-workout/types.ts must exist');
assert.ok(fs.existsSync(storagePath), 'web/src/ielts/daily-workout/storage.ts must exist');
console.log('✓ File existence verified for types and storage');

// 2. Verify storage methods and structure
const storageCode = fs.readFileSync(storagePath, 'utf8');
assert.ok(storageCode.includes('class DailyWorkoutStorage'), 'Must declare DailyWorkoutStorage class');
assert.ok(storageCode.includes('loadWorkoutState'), 'Must export loadWorkoutState method');
assert.ok(storageCode.includes('saveWorkoutState'), 'Must export saveWorkoutState method');
assert.ok(storageCode.includes('markStepComplete'), 'Must export markStepComplete method');
assert.ok(storageCode.includes('getWorkoutStreak'), 'Must export getWorkoutStreak method');
console.log('✓ DailyWorkoutStorage interface validated');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: FAIL with "web/src/ielts/daily-workout/types.ts must exist".

- [ ] **Step 3: Create types.ts and storage.ts**

Create `web/src/ielts/daily-workout/types.ts`:
```typescript
import { SRSCardState } from '../../core/srs-engine';

export type TimeBudgetMinutes = 15 | 30 | 45 | 60;

export type WorkoutStepType = 'vocab' | 'reading' | 'phrasebank' | 'strategy';

export interface VocabCardItem {
  id: string;
  word: string;
  topic: string;
  band: number;
  definition: string;
  example: string;
  collocations: string[];
  vietnamese?: string;
}

export interface ReadingQuestionItem {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  answer: string | string[];
  why: string;
}

export interface ReadingDrillItem {
  passageId: string;
  title: string;
  topic: string;
  band: number;
  excerptParagraphs: string[];
  questions: ReadingQuestionItem[];
}

export interface PhrasebankDrillItem {
  id: string;
  sectionId: string;
  sectionTitle: string;
  category: string;
  template: string;
  clozeTarget: string;
  promptSentence: string;
  options: string[];
  explanation: string;
}

export interface StrategyTipItem {
  id: string;
  skill: string;
  title: string;
  sectionRef: string;
  tips: string[];
  traps: string[];
  formula: string;
}

export interface DailyWorkoutStep {
  index: number;
  type: WorkoutStepType;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  completed: boolean;
  data: {
    vocabCards?: VocabCardItem[];
    readingDrill?: ReadingDrillItem;
    phrasebankDrills?: PhrasebankDrillItem[];
    strategyTip?: StrategyTipItem;
  };
}

export interface DailyWorkoutSession {
  dateKey: string;
  timeBudget: TimeBudgetMinutes;
  createdAt: number;
  steps: DailyWorkoutStep[];
  totalEstimatedMinutes: number;
}

export interface StepCompletionRecord {
  stepIndex: number;
  type: WorkoutStepType;
  completedAt: number;
  score?: { correct: number; total: number };
}

export interface DailyWorkoutProgressState {
  dateKey: string;
  timeBudget: TimeBudgetMinutes;
  completedStepIndexes: number[];
  stepRecords: Record<number, StepCompletionRecord>;
  completed: boolean;
  completedAt?: number;
}

export interface WorkoutStreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
  totalWorkoutsCompleted: number;
}
```

Create `web/src/ielts/daily-workout/storage.ts`:
```typescript
import { DailyWorkoutProgressState, DailyWorkoutSession, StepCompletionRecord, TimeBudgetMinutes, WorkoutStreakData } from './types';

const WORKOUT_STATE_KEY = 'IELTS_DAILY_WORKOUT_STATE';
const WORKOUT_STREAK_KEY = 'IELTS_DAILY_WORKOUT_STREAK';

export class DailyWorkoutStorage {
  public static getTodayDateKey(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  public static loadWorkoutState(dateKey: string = this.getTodayDateKey()): DailyWorkoutProgressState {
    try {
      const raw = localStorage.getItem(WORKOUT_STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyWorkoutProgressState;
        if (parsed && parsed.dateKey === dateKey) {
          return parsed;
        }
      }
    } catch {
      /* storage blocked or corrupt: return empty state */
    }
    return {
      dateKey,
      timeBudget: 30,
      completedStepIndexes: [],
      stepRecords: {},
      completed: false
    };
  }

  public static saveWorkoutState(state: DailyWorkoutProgressState): void {
    try {
      localStorage.setItem(WORKOUT_STATE_KEY, JSON.stringify(state));
    } catch {
      /* storage quota exceeded or disabled */
    }
  }

  public static markStepComplete(
    dateKey: string,
    stepIndex: number,
    record: StepCompletionRecord,
    totalSteps: number = 4
  ): DailyWorkoutProgressState {
    const state = this.loadWorkoutState(dateKey);
    if (!state.completedStepIndexes.includes(stepIndex)) {
      state.completedStepIndexes.push(stepIndex);
      state.completedStepIndexes.sort((a, b) => a - b);
    }
    state.stepRecords[stepIndex] = record;

    if (state.completedStepIndexes.length >= totalSteps) {
      state.completed = true;
      state.completedAt = Date.now();
      this.incrementStreak(dateKey);
    }

    this.saveWorkoutState(state);
    return state;
  }

  public static getWorkoutStreak(): WorkoutStreakData {
    try {
      const raw = localStorage.getItem(WORKOUT_STREAK_KEY);
      if (raw) {
        const data = JSON.parse(raw) as WorkoutStreakData;
        if (data && typeof data.currentStreak === 'number') {
          return data;
        }
      }
    } catch {
      /* fallback on fresh data */
    }
    return { currentStreak: 0, lastCompletedDate: null, totalWorkoutsCompleted: 0 };
  }

  public static incrementStreak(todayDateKey: string): WorkoutStreakData {
    const streakData = this.getWorkoutStreak();
    if (streakData.lastCompletedDate === todayDateKey) {
      return streakData; // Already credited today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = this.getTodayDateKey(yesterday);

    if (streakData.lastCompletedDate === yesterdayKey) {
      streakData.currentStreak += 1;
    } else {
      streakData.currentStreak = 1;
    }

    streakData.lastCompletedDate = todayDateKey;
    streakData.totalWorkoutsCompleted += 1;

    try {
      localStorage.setItem(WORKOUT_STREAK_KEY, JSON.stringify(streakData));
    } catch {
      /* storage blocked */
    }
    return streakData;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: PASS with "✓ DailyWorkoutStorage interface validated".

- [ ] **Step 5: Commit**

```bash
git add web/src/ielts/daily-workout/types.ts web/src/ielts/daily-workout/storage.ts web/scripts/verify-daily-workout.cjs
git commit -m "feat(ielts): add daily workout data models and storage persistence"
```

---

## Phase 2: Academic Phrasebank Cloze Drill Engine

### Task 2: Manchester Academic Phrasebank Cloze Generator

**Files:**
- Create: `web/src/ielts/daily-workout/phrasebank-drills.ts`
- Modify: `web/scripts/verify-daily-workout.cjs`

**Interfaces:**
- Consumes: `web/src/ielts/data/academic-phrasebank.json`, `PhrasebankDrillItem` from `types.ts`.
- Produces: `generatePhrasebankDrills(count: number, seed?: string): PhrasebankDrillItem[]`, extracting high-value academic phrases and constructing sentence completion drills with 4 plausible choices and usage explanations.

- [ ] **Step 1: Write failing test for Phrasebank Drills Generator**

Append to `web/scripts/verify-daily-workout.cjs`:
```javascript
// 3. Verify Phrasebank Cloze Engine
const phrasebankCodePath = path.resolve(__dirname, '../src/ielts/daily-workout/phrasebank-drills.ts');
assert.ok(fs.existsSync(phrasebankCodePath), 'phrasebank-drills.ts must exist');

const { generatePhrasebankDrills } = require(phrasebankCodePath);
assert.strictEqual(typeof generatePhrasebankDrills, 'function', 'Must export generatePhrasebankDrills function');

const sampleDrills = generatePhrasebankDrills(3, '2026-11-05');
assert.strictEqual(sampleDrills.length, 3, 'Must return exactly requested count of drills');
sampleDrills.forEach((drill, i) => {
  assert.ok(drill.id, `Drill ${i} missing id`);
  assert.ok(drill.sectionTitle, `Drill ${i} missing sectionTitle`);
  assert.ok(drill.template.includes('___'), `Drill ${i} template must contain blank '___'`);
  assert.ok(drill.clozeTarget, `Drill ${i} missing clozeTarget`);
  assert.ok(Array.isArray(drill.options) && drill.options.length === 4, `Drill ${i} must have 4 options`);
  assert.ok(drill.options.includes(drill.clozeTarget), `Drill ${i} options must contain correct answer`);
});
console.log('✓ Phrasebank cloze drills generation validated');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: FAIL with "phrasebank-drills.ts must exist".

- [ ] **Step 3: Implement phrasebank-drills.ts**

Create `web/src/ielts/daily-workout/phrasebank-drills.ts`:
```typescript
import phrasebankData from '../data/academic-phrasebank.json';
import { PhrasebankDrillItem } from './types';

interface PhraseCategory {
  name: string;
  phrases: string[];
}

interface PhraseSection {
  id: string;
  title: string;
  categories: PhraseCategory[];
}

const DISTRACTOR_POOL: Record<string, string[]> = {
  connectors: ['Consequently', 'Nevertheless', 'Furthermore', 'Conversely', 'In contrast', 'Similarly', 'Accordingly'],
  verbs: ['demonstrates', 'substantiates', 'contradicts', 'illustrates', 'articulates', 'delineates', 'postulates'],
  prepositions: ['with respect to', 'in terms of', 'in the light of', 'owing to', 'by virtue of', 'as opposed to'],
  adjectives: ['substantial', 'negligible', 'paramount', 'pivotal', 'indispensable', 'peripheral', 'tentative']
};

/** Simple hash from string to deterministic integer */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generatePhrasebankDrills(count: number = 3, seed: string = 'daily'): PhrasebankDrillItem[] {
  const sections = (phrasebankData as { sections: PhraseSection[] }).sections;
  const drills: PhrasebankDrillItem[] = [];
  const baseHash = hashString(seed);

  // Flatten usable candidate phrases (phrases that have substantial length and clear academic collocations)
  const candidatePool: Array<{ section: PhraseSection; category: PhraseCategory; phrase: string }> = [];

  sections.forEach(sec => {
    sec.categories.forEach(cat => {
      cat.phrases.forEach(phrase => {
        if (phrase.length > 25 && phrase.length < 140) {
          candidatePool.push({ section: sec, category: cat, phrase });
        }
      });
    });
  });

  const poolLen = candidatePool.length;
  if (poolLen === 0) return [];

  for (let i = 0; i < count; i++) {
    const pickIndex = (baseHash + i * 37) % poolLen;
    const item = candidatePool[pickIndex];
    const phrase = item.phrase;

    // Identify target academic chunk to cloze (e.g. key collocation, verb, or transitional discourse marker)
    const words = phrase.split(' ');
    let targetWord = '';
    let clozeSentence = phrase;

    // Detect high-yield key academic phrases
    const academicPivots = [
      'plays a critical role in',
      'a major contributor to',
      'there is substantial evidence that',
      'it has been suggested that',
      'tends to correlate with',
      'gives rise to',
      'is of paramount importance',
      'draws a distinction between',
      'exerts a profound influence on',
      'is largely attributable to'
    ];

    const foundPivot = academicPivots.find(p => phrase.toLowerCase().includes(p));

    if (foundPivot) {
      const pivotIndex = phrase.toLowerCase().indexOf(foundPivot);
      const exactTarget = phrase.substring(pivotIndex, pivotIndex + foundPivot.length);
      clozeSentence = phrase.replace(exactTarget, '__________');
      targetWord = exactTarget;
    } else {
      // Fallback: pick the most academic word (length > 6 not ending in punctuation)
      const candidateWords = words.filter(w => w.length >= 7 && !w.includes('.') && !w.includes('...'));
      targetWord = candidateWords[i % (candidateWords.length || 1)] || words[Math.min(3, words.length - 1)];
      clozeSentence = phrase.replace(targetWord, '__________');
    }

    // Generate 3 plausible distractors
    const distractors: string[] = [];
    const allDistractors = Object.values(DISTRACTOR_POOL).flat();
    let dIndex = (baseHash + i * 19) % allDistractors.length;

    while (distractors.length < 3) {
      const candidate = allDistractors[dIndex % allDistractors.length];
      if (candidate.toLowerCase() !== targetWord.toLowerCase() && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      dIndex++;
    }

    // Shuffle options deterministically
    const options = [targetWord, ...distractors].sort((a, b) => {
      return (hashString(seed + a) % 10) - (hashString(seed + b) % 10);
    });

    drills.push({
      id: `pb_drill_${item.section.id}_${i}`,
      sectionId: item.section.id,
      sectionTitle: item.section.title,
      category: item.category.name,
      template: clozeSentence,
      clozeTarget: targetWord,
      promptSentence: phrase,
      options,
      explanation: `Collocation standard from Manchester Academic Phrasebank: "${phrase}" under ${item.category.name}.`
    });
  }

  return drills;
}

// CommonJS compatibility for test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePhrasebankDrills };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: PASS with "✓ Phrasebank cloze drills generation validated".

- [ ] **Step 5: Commit**

```bash
git add web/src/ielts/daily-workout/phrasebank-drills.ts web/scripts/verify-daily-workout.cjs
git commit -m "feat(ielts): add Manchester Academic Phrasebank cloze drill generator"
```

---

## Phase 3: Intelligent Daily Workout Generator Engine

### Task 3: Intelligent Workout Generator Logic

**Files:**
- Create: `web/src/ielts/daily-workout/generator.ts`
- Modify: `web/scripts/verify-daily-workout.cjs`

**Interfaces:**
- Consumes: `vocab.json`, `reading.json`, `strategy.json`, `generatePhrasebankDrills`, `SRSEngine`, `DailyWorkoutSession`, `TimeBudgetMinutes`.
- Produces: `generateDailyWorkout(options: WorkoutGeneratorOptions): DailyWorkoutSession`, assembling calibrated exercises based on time budget (15, 30, 45, or 60 min).

- [ ] **Step 1: Write failing test for Workout Generator across all 4 time budgets**

Append to `web/scripts/verify-daily-workout.cjs`:
```javascript
// 4. Verify Daily Workout Generator Engine
const generatorPath = path.resolve(__dirname, '../src/ielts/daily-workout/generator.ts');
assert.ok(fs.existsSync(generatorPath), 'generator.ts must exist');

const { generateDailyWorkout } = require(generatorPath);
assert.strictEqual(typeof generateDailyWorkout, 'function', 'Must export generateDailyWorkout');

// Test 15-minute budget
const s15 = generateDailyWorkout({ dateKey: '2026-11-05', timeBudget: 15 });
assert.strictEqual(s15.timeBudget, 15);
assert.strictEqual(s15.steps.length, 4, '15-min workout must have 4 steps');
assert.strictEqual(s15.steps[0].data.vocabCards.length, 8, '15-min should package 8 vocab cards');
assert.strictEqual(s15.steps[1].data.readingDrill.questions.length, 3, '15-min should package 3 reading Qs');
assert.strictEqual(s15.steps[2].data.phrasebankDrills.length, 2, '15-min should package 2 phrasebank drills');

// Test 30-minute budget (canonical specification)
const s30 = generateDailyWorkout({ dateKey: '2026-11-05', timeBudget: 30 });
assert.strictEqual(s30.timeBudget, 30);
assert.strictEqual(s30.steps[0].data.vocabCards.length, 12, '30-min should package 12 vocab cards');
assert.strictEqual(s30.steps[1].data.readingDrill.questions.length, 4, '30-min should package 4 reading Qs');
assert.strictEqual(s30.steps[2].data.phrasebankDrills.length, 3, '30-min should package 3 phrasebank drills');
assert.ok(s30.steps[3].data.strategyTip.formula, '30-min should package CBT strategy tip with formula');

// Test 45-minute and 60-minute budgets
const s45 = generateDailyWorkout({ dateKey: '2026-11-05', timeBudget: 45 });
assert.strictEqual(s45.steps[0].data.vocabCards.length, 16);
assert.strictEqual(s45.steps[1].data.readingDrill.questions.length, 6);

const s60 = generateDailyWorkout({ dateKey: '2026-11-05', timeBudget: 60 });
assert.strictEqual(s60.steps[0].data.vocabCards.length, 22);
assert.strictEqual(s60.steps[1].data.readingDrill.questions.length, 10);
console.log('✓ Daily Workout Generator validated across 15, 30, 45, and 60-min budgets');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: FAIL with "generator.ts must exist".

- [ ] **Step 3: Implement generator.ts**

Create `web/src/ielts/daily-workout/generator.ts`:
```typescript
import vocabData from '../data/vocab.json';
import readingData from '../data/reading.json';
import strategyData from '../data/strategy.json';
import { generatePhrasebankDrills } from './phrasebank-drills';
import {
  DailyWorkoutSession,
  DailyWorkoutStep,
  ReadingDrillItem,
  StrategyTipItem,
  TimeBudgetMinutes,
  VocabCardItem
} from './types';
import { SRSCardState, SRSEngine } from '../../core/srs-engine';

export interface WorkoutGeneratorOptions {
  dateKey: string;
  timeBudget?: TimeBudgetMinutes;
  srsStates?: Record<string, SRSCardState>;
  starredTopics?: string[];
  targetBand?: number;
  weakestSkill?: string;
  unattemptedPassageIndex?: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateDailyWorkout(options: WorkoutGeneratorOptions): DailyWorkoutSession {
  const {
    dateKey,
    timeBudget = 30,
    srsStates = {},
    starredTopics = [],
    targetBand = 7.0,
    weakestSkill = 'reading',
    unattemptedPassageIndex = 0
  } = options;

  const dateSeed = hashString(dateKey);

  // 1. Budget Scaling Allocations
  const config = {
    15: { vocabCount: 8, readingQuestions: 3, phrasebankCount: 2, vocabMin: 4, readingMin: 6, pbMin: 3, stratMin: 2 },
    30: { vocabCount: 12, readingQuestions: 4, phrasebankCount: 3, vocabMin: 7, readingMin: 10, pbMin: 8, stratMin: 5 },
    45: { vocabCount: 16, readingQuestions: 6, phrasebankCount: 4, vocabMin: 10, readingMin: 15, pbMin: 12, stratMin: 8 },
    60: { vocabCount: 22, readingQuestions: 10, phrasebankCount: 5, vocabMin: 12, readingMin: 20, pbMin: 18, stratMin: 10 }
  }[timeBudget];

  // 2. Select Vocab Cards: (SRS Overdue -> Starred Topics -> High-Yield Target Band)
  const allVocab = vocabData as VocabCardItem[];
  const dueCards: VocabCardItem[] = [];
  const now = Date.now();

  allVocab.forEach(v => {
    const st = srsStates[v.id];
    if (st && st.dueDate <= now) {
      dueCards.push(v);
    }
  });

  const selectedVocab: VocabCardItem[] = [...dueCards.slice(0, config.vocabCount)];

  // Fill remainder from starred topics or target band
  if (selectedVocab.length < config.vocabCount) {
    const starTopicItems = allVocab.filter(
      v => starredTopics.map(t => t.toLowerCase()).includes(v.topic.toLowerCase()) &&
        !selectedVocab.some(sv => sv.id === v.id)
    );
    const needed = config.vocabCount - selectedVocab.length;
    selectedVocab.push(...starTopicItems.slice(0, needed));
  }

  if (selectedVocab.length < config.vocabCount) {
    const targetBandPool = allVocab.filter(
      v => v.band >= targetBand && !selectedVocab.some(sv => sv.id === v.id)
    );
    const startIdx = (dateSeed * 13) % (targetBandPool.length || 1);
    const needed = config.vocabCount - selectedVocab.length;
    for (let i = 0; i < needed; i++) {
      const idx = (startIdx + i) % targetBandPool.length;
      selectedVocab.push(targetBandPool[idx]);
    }
  }

  // 3. Select Targeted Micro-Reading Passage & Questions
  const allReading = readingData as Array<{
    id: string;
    title: string;
    topic: string;
    band: number;
    paragraphs: string[];
    questions: Array<{ id: string; type: string; prompt: string; options?: string[]; answer: string | string[]; why: string }>;
  }>;

  const passageIdx = (unattemptedPassageIndex + dateSeed) % allReading.length;
  const passage = allReading[passageIdx];
  const qStart = (dateSeed * 7) % Math.max(1, passage.questions.length - config.readingQuestions);
  const selectedQuestions = passage.questions.slice(qStart, qStart + config.readingQuestions);

  const readingDrill: ReadingDrillItem = {
    passageId: passage.id,
    title: passage.title,
    topic: passage.topic,
    band: passage.band,
    excerptParagraphs: passage.paragraphs.slice(0, 3), // Focused micro-excerpt
    questions: selectedQuestions
  };

  // 4. Generate Manchester Academic Phrasebank Drills
  const phrasebankDrills = generatePhrasebankDrills(config.phrasebankCount, `${dateKey}_pb`);

  // 5. Select CBT Strategy Blueprint Tip of the Day
  const allStrategy = strategyData as StrategyTipItem[];
  // Prioritize weakest skill if available
  const skillMatchingTips = allStrategy.filter(s => s.skill.toLowerCase().includes(weakestSkill.toLowerCase()));
  const strategyPool = skillMatchingTips.length > 0 ? skillMatchingTips : allStrategy;
  const stratIdx = (dateSeed + 3) % strategyPool.length;
  const strategyTip = strategyPool[stratIdx];

  // 6. Build the 4 Steps
  const steps: DailyWorkoutStep[] = [
    {
      index: 0,
      type: 'vocab',
      title: 'Vocabulary & Collocations SRS',
      subtitle: `${selectedVocab.length} high-yield C1/C2 cards to lock into long-term memory`,
      estimatedMinutes: config.vocabMin,
      completed: false,
      data: { vocabCards: selectedVocab }
    },
    {
      index: 1,
      type: 'reading',
      title: 'Targeted Micro-Reading Attack',
      subtitle: `${readingDrill.title} (${readingDrill.questions.length} questions, Band ${readingDrill.band})`,
      estimatedMinutes: config.readingMin,
      completed: false,
      data: { readingDrill }
    },
    {
      index: 2,
      type: 'phrasebank',
      title: 'Academic Phrasebank Sentence Drills',
      subtitle: `${phrasebankDrills.length} sentence-completion collocations from Manchester University`,
      estimatedMinutes: config.pbMin,
      completed: false,
      data: { phrasebankDrills }
    },
    {
      index: 3,
      type: 'strategy',
      title: 'CBT Tactical Strategy of the Day',
      subtitle: `${strategyTip.title} (${strategyTip.skill})`,
      estimatedMinutes: config.stratMin,
      completed: false,
      data: { strategyTip }
    }
  ];

  return {
    dateKey,
    timeBudget,
    createdAt: Date.now(),
    steps,
    totalEstimatedMinutes: timeBudget
  };
}

// CommonJS compatibility for test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateDailyWorkout };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: PASS with "✓ Daily Workout Generator validated across 15, 30, 45, and 60-min budgets".

- [ ] **Step 5: Commit**

```bash
git add web/src/ielts/daily-workout/generator.ts web/scripts/verify-daily-workout.cjs
git commit -m "feat(ielts): implement deterministic daily guided workout generator engine"
```

---

## Phase 4: Interactive Daily Guided Workout View Component

### Task 4: Interactive Stepper View & Design System Styling

**Files:**
- Create: `web/src/ielts/views/daily-workout.ts`
- Modify: `web/src/ielts/ielts.css`
- Modify: `web/scripts/verify-daily-workout.cjs`

**Interfaces:**
- Consumes: `generateDailyWorkout`, `DailyWorkoutStorage`, `SRSEngine`, `AudioSynthesizer`, `HapticEngine`, `h` from `ui.ts`, `icon` from `icons.ts`.
- Produces: `workoutView(root: HTMLElement): () => void` rendering the interactive 4-step workout runner, time budget switcher, exercise cards with sound/haptics, and celebratory scorecard.

- [ ] **Step 1: Write failing test for Workout View Component**

Append to `web/scripts/verify-daily-workout.cjs`:
```javascript
// 5. Verify Workout View Component
const workoutViewPath = path.resolve(__dirname, '../src/ielts/views/daily-workout.ts');
assert.ok(fs.existsSync(workoutViewPath), 'views/daily-workout.ts must exist');

const workoutViewCode = fs.readFileSync(workoutViewPath, 'utf8');
assert.ok(workoutViewCode.includes('export function workoutView'), 'Must export workoutView');
assert.ok(workoutViewCode.includes('ie-workout-stepper'), 'Must render stepper progress bar');
assert.ok(workoutViewCode.includes('ie-workout-budget-pills'), 'Must render time budget switcher');
assert.ok(workoutViewCode.includes('ie-workout-completion-card'), 'Must render celebratory completion receipt');
console.log('✓ Interactive Daily Workout View component verified');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: FAIL with "views/daily-workout.ts must exist".

- [ ] **Step 3: Implement daily-workout.ts and add CSS styles**

Add the styling to `web/src/ielts/ielts.css` (conforming to AGENTS.md § 1.1–1.16: `--radius-btn: 10px`, min 44px tap targets, 12px screen padding, single 768px breakpoint):
```css
/* =========================================================================
   DAILY GUIDED WORKOUT / SPACED CURRICULUM FLOW
   ========================================================================= */
.ie-workout-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 var(--pad-screen-right, 12px) var(--safe-bottom-dock, 84px) var(--pad-screen-left, 12px);
}

.ie-workout-header-card {
  background: var(--bg-surface-elevated, #182030);
  border: 1px solid var(--border-hairline, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-squircle-md, 16px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ie-workout-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.ie-workout-budget-pills {
  display: inline-flex;
  gap: 6px;
  background: var(--bg-surface-sunk, #11151f);
  padding: 4px;
  border-radius: var(--radius-pill, 9999px);
  border: 1px solid var(--border-hairline, rgba(255, 255, 255, 0.08));
}

.ie-workout-budget-btn {
  border: none;
  background: transparent;
  color: var(--ink-secondary, #94a3b8);
  font-size: var(--font-kicker, 11px);
  font-weight: 700;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: var(--radius-pill, 9999px);
  cursor: pointer;
  min-height: 36px;
  transition: all 0.15s ease;
}

.ie-workout-budget-btn.is-active {
  background: var(--accent-cyan, #06b6d4);
  color: #0b0f19;
}

.ie-workout-stepper {
  display: flex;
  gap: 6px;
  width: 100%;
}

.ie-stepper-bar {
  flex: 1;
  height: 6px;
  border-radius: var(--radius-pill, 9999px);
  background: var(--border-hairline, rgba(255, 255, 255, 0.1));
  transition: background 0.2s ease;
}

.ie-stepper-bar.is-done {
  background: var(--accent-cyan, #06b6d4);
}

.ie-stepper-bar.is-current {
  background: var(--accent-gold, #f59e0b);
}

.ie-workout-step-card {
  background: var(--bg-surface, #151b28);
  border: 1px solid var(--border-hairline, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-squircle-md, 16px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ie-phrasebank-cloze-box {
  background: var(--bg-surface-sunk, #11151f);
  border: 1px solid var(--border-hairline, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-squircle-sm, 10px);
  padding: 16px;
  font-size: var(--text-base, 15px);
  line-height: 1.6;
}

.ie-cloze-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 768px) {
  .ie-cloze-options-grid {
    grid-template-columns: 1fr;
  }
}

.ie-cloze-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  min-height: 44px;
  border-radius: var(--radius-btn, 10px);
  border: 1px solid var(--border-hairline, rgba(255, 255, 255, 0.12));
  background: var(--bg-surface-elevated, #182030);
  color: var(--ink-primary, #f8fafc);
  font-size: var(--font-body, 14px);
  cursor: pointer;
  transition: all 0.15s ease;
}

.ie-cloze-btn.is-correct {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #34d399;
}

.ie-cloze-btn.is-wrong {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #f87171;
}

.ie-workout-completion-card {
  text-align: center;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid var(--accent-cyan, #06b6d4);
  border-radius: var(--radius-squircle-lg, 24px);
}
```

Create `web/src/ielts/views/daily-workout.ts`:
```typescript
import { h, esc } from '../ui';
import { icon } from '../../utils/icons';
import { t } from '../../core/i18n';
import { AudioSynthesizer } from '../../core/audio-synthesizer';
import { HapticEngine } from '../../core/haptic-engine';
import { StorageManager } from '../../utils/storage';
import { DailyWorkoutStorage } from '../daily-workout/storage';
import { generateDailyWorkout } from '../daily-workout/generator';
import { DailyWorkoutSession, TimeBudgetMinutes, WorkoutStepType } from '../daily-workout/types';
import { SRSEngine, SRSCardState } from '../../core/srs-engine';

const VOCAB_KEY = 'IELTS_VOCAB_SRS';

function loadVocabStates(): Record<string, SRSCardState> {
  try {
    return JSON.parse(localStorage.getItem(VOCAB_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveVocabStates(states: Record<string, SRSCardState>): void {
  try {
    localStorage.setItem(VOCAB_KEY, JSON.stringify(states));
  } catch {
    /* storage full */
  }
}

export function workoutView(root: HTMLElement): () => void {
  let timeBudget = StorageManager.getDailyTimeBudget() as TimeBudgetMinutes;
  if (![15, 30, 45, 60].includes(timeBudget)) timeBudget = 30;

  const todayKey = DailyWorkoutStorage.getTodayDateKey();
  let progressState = DailyWorkoutStorage.loadWorkoutState(todayKey);
  progressState.timeBudget = timeBudget;

  let session: DailyWorkoutSession = generateDailyWorkout({
    dateKey: todayKey,
    timeBudget,
    srsStates: loadVocabStates(),
    starredTopics: StorageManager.getStarredVocabTopics(),
    targetBand: StorageManager.getTargetBand()
  });

  // Active step index pointer (first incomplete step or completed screen)
  let activeStepIndex = session.steps.findIndex(s => !progressState.completedStepIndexes.includes(s.index));
  if (activeStepIndex === -1 && progressState.completed) {
    activeStepIndex = 4; // Celebration state
  } else if (activeStepIndex === -1) {
    activeStepIndex = 0;
  }

  const container = h('div', 'ie-workout-container');
  root.innerHTML = '';
  root.append(container);

  function render(): void {
    container.innerHTML = '';

    // 1. Header Card with Title, Time Budget Switcher, and Stepper Progress
    const headerCard = h('div', 'ie-workout-header-card');

    const topRow = h('div', 'ie-workout-top-row');
    const titleCol = h('div');
    titleCol.innerHTML = `
      <div style="font-size: var(--font-kicker, 11px); font-weight: 700; color: var(--accent-cyan, #06b6d4); text-transform: uppercase; letter-spacing: 0.08em;">
        ${t('ielts.daily_guided_workout', undefined, 'Daily Guided Workout')}
      </div>
      <h1 style="font-size: var(--text-lg, 18px); margin: 2px 0 0 0; font-weight: 700;">
        ${todayKey} • ${timeBudget}m Focus
      </h1>
    `;

    // Time budget switcher pills
    const budgetPills = h('div', 'ie-workout-budget-pills');
    ([15, 30, 45, 60] as TimeBudgetMinutes[]).forEach(b => {
      const btn = h('button', `ie-workout-budget-btn ${b === timeBudget ? 'is-active' : ''}`) as HTMLButtonElement;
      btn.type = 'button';
      btn.textContent = `${b}m`;
      btn.addEventListener('click', () => {
        if (b === timeBudget) return;
        timeBudget = b;
        StorageManager.setDailyTimeBudget(b);
        progressState.timeBudget = b;
        DailyWorkoutStorage.saveWorkoutState(progressState);
        session = generateDailyWorkout({
          dateKey: todayKey,
          timeBudget: b,
          srsStates: loadVocabStates(),
          starredTopics: StorageManager.getStarredVocabTopics(),
          targetBand: StorageManager.getTargetBand()
        });
        render();
      });
      budgetPills.append(btn);
    });

    topRow.append(titleCol, budgetPills);

    // Stepper Bars
    const stepper = h('div', 'ie-workout-stepper');
    session.steps.forEach((step, idx) => {
      const isDone = progressState.completedStepIndexes.includes(idx);
      const isCurrent = idx === activeStepIndex;
      const bar = h('div', `ie-stepper-bar ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`);
      stepper.append(bar);
    });

    headerCard.append(topRow, stepper);
    container.append(headerCard);

    // 2. Active Step Content or Celebration View
    if (activeStepIndex >= 4 || progressState.completed) {
      renderCelebration();
    } else {
      renderActiveStep(session.steps[activeStepIndex]);
    }
  }

  function renderActiveStep(step: DailyWorkoutStep): void {
    const card = h('div', 'ie-workout-step-card');

    const stepHeader = h('div');
    stepHeader.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: var(--font-kicker, 11px); font-weight: 700; color: var(--accent-gold, #f59e0b); text-transform: uppercase;">
          Step ${step.index + 1} of 4 • ~${step.estimatedMinutes} min
        </span>
        <span style="font-size: var(--font-kicker, 11px); color: var(--ink-secondary);">
          ${step.type.toUpperCase()}
        </span>
      </div>
      <h2 style="font-size: var(--text-base, 16px); margin: 0; font-weight: 700;">${esc(step.title)}</h2>
      <p style="font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); margin: 4px 0 0 0;">${esc(step.subtitle)}</p>
    `;
    card.append(stepHeader);

    // Render Step Body based on type
    if (step.type === 'vocab') {
      renderVocabExercise(card, step);
    } else if (step.type === 'reading') {
      renderReadingExercise(card, step);
    } else if (step.type === 'phrasebank') {
      renderPhrasebankExercise(card, step);
    } else if (step.type === 'strategy') {
      renderStrategyExercise(card, step);
    }

    container.append(card);
  }

  function advanceStep(): void {
    AudioSynthesizer.play('chime');
    HapticEngine.trigger('success');
    activeStepIndex += 1;
    render();
  }

  // Step 1: Vocab SRS Exercise Runner
  function renderVocabExercise(card: HTMLElement, step: DailyWorkoutStep): void {
    const cards = step.data.vocabCards || [];
    let currentIdx = 0;
    const vocabStates = loadVocabStates();

    const stage = h('div', 'ie-vocab-workout-stage');

    function showCard(): void {
      stage.innerHTML = '';
      if (currentIdx >= cards.length) {
        DailyWorkoutStorage.markStepComplete(todayKey, step.index, {
          stepIndex: step.index,
          type: 'vocab',
          completedAt: Date.now()
        });
        advanceStep();
        return;
      }

      const item = cards[currentIdx];
      let revealed = false;

      const vBox = h('div', 'ie-phrasebank-cloze-box');
      vBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-cyan);">${item.topic.toUpperCase()}</span>
          <span style="font-size: 11px; color: var(--ink-secondary);">${currentIdx + 1} / ${cards.length}</span>
        </div>
        <div style="font-size: 20px; font-weight: 800; color: var(--ink-primary); margin-bottom: 4px;">${esc(item.word)}</div>
        <div id="vocab-reveal-area" style="display: none; margin-top: 12px; border-top: 1px solid var(--border-hairline); padding-top: 10px;">
          <div style="font-size: 14px; margin-bottom: 6px;"><b>Definition:</b> ${esc(item.definition)}</div>
          ${item.vietnamese ? `<div style="font-size: 13px; color: var(--ink-secondary); margin-bottom: 6px;"><b>VN:</b> ${esc(item.vietnamese)}</div>` : ''}
          <div style="font-size: 13px; font-style: italic; color: var(--ink-secondary);">"${esc(item.example)}"</div>
        </div>
      `;

      const actionsRow = h('div', 'ie-vocab-actions', '');
      actionsRow.style.display = 'flex';
      actionsRow.style.gap = '8px';
      actionsRow.style.marginTop = '12px';

      const flipBtn = h('button', 'ie-btn ie-btn-secondary') as HTMLButtonElement;
      flipBtn.textContent = 'Flip Reveal (Space)';
      flipBtn.style.flex = '1';
      flipBtn.style.minHeight = '44px';
      flipBtn.style.borderRadius = 'var(--radius-btn, 10px)';

      const againBtn = h('button', 'ie-btn ie-btn-danger') as HTMLButtonElement;
      againBtn.textContent = 'Again (1)';
      againBtn.style.flex = '1';
      againBtn.style.display = 'none';
      againBtn.style.minHeight = '44px';
      againBtn.style.borderRadius = 'var(--radius-btn, 10px)';

      const goodBtn = h('button', 'ie-btn ie-btn-primary') as HTMLButtonElement;
      goodBtn.textContent = 'Good (2)';
      goodBtn.style.flex = '1';
      goodBtn.style.display = 'none';
      goodBtn.style.minHeight = '44px';
      goodBtn.style.borderRadius = 'var(--radius-btn, 10px)';

      flipBtn.addEventListener('click', () => {
        revealed = true;
        (vBox.querySelector('#vocab-reveal-area') as HTMLElement).style.display = 'block';
        flipBtn.style.display = 'none';
        againBtn.style.display = 'inline-flex';
        goodBtn.style.display = 'inline-flex';
        AudioSynthesizer.play('click');
      });

      againBtn.addEventListener('click', () => {
        const cur = vocabStates[item.id] || SRSEngine.createInitialState(item.id, item.band >= 7.5 ? 3 : 1);
        vocabStates[item.id] = SRSEngine.rateCard(cur, item.id, 'again');
        saveVocabStates(vocabStates);
        currentIdx++;
        AudioSynthesizer.play('click');
        showCard();
      });

      goodBtn.addEventListener('click', () => {
        const cur = vocabStates[item.id] || SRSEngine.createInitialState(item.id, item.band >= 7.5 ? 3 : 1);
        vocabStates[item.id] = SRSEngine.rateCard(cur, item.id, 'good');
        saveVocabStates(vocabStates);
        currentIdx++;
        AudioSynthesizer.play('click');
        showCard();
      });

      actionsRow.append(flipBtn, againBtn, goodBtn);
      stage.append(vBox, actionsRow);
    }

    showCard();
    card.append(stage);
  }

  // Step 2: Micro-Reading Exercise Runner
  function renderReadingExercise(card: HTMLElement, step: DailyWorkoutStep): void {
    const drill = step.data.readingDrill;
    if (!drill) return;

    let qIdx = 0;
    const questions = drill.questions;
    let correctCount = 0;

    const box = h('div');
    const excerptBox = h('div', 'ie-phrasebank-cloze-box');
    excerptBox.style.maxHeight = '140px';
    excerptBox.style.overflowY = 'auto';
    excerptBox.innerHTML = `
      <div style="font-size: 11px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
        EXCERPT: ${esc(drill.title)}
      </div>
      <p style="font-size: 13px; line-height: 1.5; color: var(--ink-secondary); margin: 0;">
        ${drill.excerptParagraphs.join('<br><br>')}
      </p>
    `;

    const qStage = h('div');
    qStage.style.marginTop = '12px';

    function showQ(): void {
      qStage.innerHTML = '';
      if (qIdx >= questions.length) {
        DailyWorkoutStorage.markStepComplete(todayKey, step.index, {
          stepIndex: step.index,
          type: 'reading',
          completedAt: Date.now(),
          score: { correct: correctCount, total: questions.length }
        });
        advanceStep();
        return;
      }

      const q = questions[qIdx];
      const qCard = h('div');
      qCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-gold);">${q.type.toUpperCase()}</span>
          <span style="font-size: 11px; color: var(--ink-secondary);">${qIdx + 1} / ${questions.length}</span>
        </div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">${esc(q.prompt)}</div>
      `;

      const optGrid = h('div', 'ie-cloze-options-grid');
      const options = q.options || ['TRUE', 'FALSE', 'NOT GIVEN'];

      options.forEach(opt => {
        const btn = h('button', 'ie-cloze-btn') as HTMLButtonElement;
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          const isCorrect = Array.isArray(q.answer)
            ? q.answer.some(a => a.toLowerCase() === opt.toLowerCase())
            : String(q.answer).toLowerCase() === opt.toLowerCase();

          if (isCorrect) correctCount++;
          btn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
          AudioSynthesizer.play(isCorrect ? 'chime' : 'click');

          // Disable all buttons in grid
          optGrid.querySelectorAll('button').forEach(b => (b as HTMLButtonElement).disabled = true);

          setTimeout(() => {
            qIdx++;
            showQ();
          }, 1000);
        });
        optGrid.append(btn);
      });

      qStage.append(qCard, optGrid);
    }

    showQ();
    box.append(excerptBox, qStage);
    card.append(box);
  }

  // Step 3: Phrasebank Sentence Cloze Runner
  function renderPhrasebankExercise(card: HTMLElement, step: DailyWorkoutStep): void {
    const drills = step.data.phrasebankDrills || [];
    let dIdx = 0;

    const pbStage = h('div');

    function showDrill(): void {
      pbStage.innerHTML = '';
      if (dIdx >= drills.length) {
        DailyWorkoutStorage.markStepComplete(todayKey, step.index, {
          stepIndex: step.index,
          type: 'phrasebank',
          completedAt: Date.now()
        });
        advanceStep();
        return;
      }

      const drill = drills[dIdx];
      const box = h('div', 'ie-phrasebank-cloze-box');
      box.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
          ${esc(drill.sectionTitle)} • ${esc(drill.category)}
        </div>
        <div style="font-size: 16px; font-weight: 600; line-height: 1.5; color: var(--ink-primary); margin-bottom: 12px;">
          ${esc(drill.template)}
        </div>
      `;

      const optGrid = h('div', 'ie-cloze-options-grid');
      drill.options.forEach(opt => {
        const btn = h('button', 'ie-cloze-btn') as HTMLButtonElement;
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          const isCorrect = opt.toLowerCase() === drill.clozeTarget.toLowerCase();
          btn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
          AudioSynthesizer.play(isCorrect ? 'chime' : 'click');
          optGrid.querySelectorAll('button').forEach(b => (b as HTMLButtonElement).disabled = true);

          setTimeout(() => {
            dIdx++;
            showDrill();
          }, 900);
        });
        optGrid.append(btn);
      });

      pbStage.append(box, optGrid);
    }

    showDrill();
    card.append(pbStage);
  }

  // Step 4: CBT Tactical Blueprint Runner
  function renderStrategyExercise(card: HTMLElement, step: DailyWorkoutStep): void {
    const tip = step.data.strategyTip;
    if (!tip) return;

    const sBox = h('div', 'ie-phrasebank-cloze-box');
    sBox.innerHTML = `
      <div style="font-size: 11px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
        ${esc(tip.sectionRef)}
      </div>
      <div style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">
        ${esc(tip.title)}
      </div>
      <div style="background: rgba(6, 182, 212, 0.1); border-left: 3px solid var(--accent-cyan); padding: 8px 12px; margin-bottom: 10px; border-radius: 4px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Formula:</span>
        <div style="font-size: 13px; font-family: monospace; margin-top: 2px;">${esc(tip.formula)}</div>
      </div>
      <ul style="font-size: 13px; line-height: 1.5; color: var(--ink-secondary); padding-left: 18px; margin: 0 0 12px 0;">
        ${tip.tips.map(t => `<li>${esc(t)}</li>`).join('')}
      </ul>
      <div style="font-size: 12px; color: #f87171; background: rgba(239, 68, 68, 0.1); padding: 6px 10px; border-radius: 6px;">
        ⚠️ <b>Trap:</b> ${esc(tip.traps[0] || 'Avoid rush without checking passage evidence.')}
      </div>
    `;

    const doneBtn = h('button', 'ie-btn ie-btn-primary') as HTMLButtonElement;
    doneBtn.style.width = '100%';
    doneBtn.style.marginTop = '14px';
    doneBtn.style.minHeight = '44px';
    doneBtn.style.borderRadius = 'var(--radius-btn, 10px)';
    doneBtn.textContent = '✓ Strategy Internalized • Complete Workout';

    doneBtn.addEventListener('click', () => {
      DailyWorkoutStorage.markStepComplete(todayKey, step.index, {
        stepIndex: step.index,
        type: 'strategy',
        completedAt: Date.now()
      });
      advanceStep();
    });

    card.append(sBox, doneBtn);
  }

  // Celebration Completion View
  function renderCelebration(): void {
    const streak = DailyWorkoutStorage.getWorkoutStreak();
    const cCard = h('div', 'ie-workout-completion-card');
    cCard.innerHTML = `
      <div style="font-size: 40px; margin-bottom: -6px;">🎉</div>
      <h2 style="font-size: var(--text-xl, 22px); margin: 0; font-weight: 800;">
        Workout Completed!
      </h2>
      <p style="font-size: var(--text-base, 14px); color: var(--ink-secondary); max-width: 440px; margin: 0;">
        You have completed your ${timeBudget}-minute IELTS Academic session for today. Retention locked in!
      </p>
      <div style="display: flex; gap: 16px; margin: 12px 0;">
        <div style="background: var(--bg-surface-elevated); padding: 12px 20px; border-radius: 12px; border: 1px solid var(--border-hairline);">
          <div style="font-size: 24px; font-weight: 800; color: var(--accent-gold);">${streak.currentStreak} 🔥</div>
          <div style="font-size: 11px; font-weight: 700; color: var(--ink-secondary); text-transform: uppercase;">Day Streak</div>
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 12px 20px; border-radius: 12px; border: 1px solid var(--border-hairline);">
          <div style="font-size: 24px; font-weight: 800; color: var(--accent-cyan);">${streak.totalWorkoutsCompleted} 🎯</div>
          <div style="font-size: 11px; font-weight: 700; color: var(--ink-secondary); text-transform: uppercase;">Total Sessions</div>
        </div>
      </div>
      <a class="ie-btn ie-btn-primary" href="#home" style="min-height: 44px; border-radius: var(--radius-btn, 10px); padding: 10px 24px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
        <span>Return to Overview</span>
        ${icon('arrowRight', 16)}
      </a>
    `;
    container.append(cCard);
  }

  render();

  return () => {
    /* clean up */
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: PASS with "✓ Interactive Daily Workout View component verified".

- [ ] **Step 5: Commit**

```bash
git add web/src/ielts/views/daily-workout.ts web/src/ielts/ielts.css web/scripts/verify-daily-workout.cjs
git commit -m "feat(ielts): implement interactive daily workout stepper view and styles"
```

---

## Phase 5: Routing & IELTS Overview Hero Integration

### Task 5: Overview Hero Card & Hash Route Integration

**Files:**
- Modify: `web/src/ielts/main.ts`
- Modify: `web/scripts/verify-daily-workout.cjs`

**Interfaces:**
- Consumes: `workoutView` from `./views/daily-workout`, `DailyWorkoutStorage`, `StorageManager`.
- Produces: Route `#workout` (and `#daily-workout`) in `ALL_ROUTES`, and a top-level "Today's Guided Workout" Hero banner on the IELTS Overview (`#home`) view above `homeSuites()`.

- [ ] **Step 1: Write failing test for Overview Hero Banner and Routing**

Append to `web/scripts/verify-daily-workout.cjs`:
```javascript
// 6. Verify Overview Hero Banner and Routing
const mainPath = path.resolve(__dirname, '../src/ielts/main.ts');
const mainCode = fs.readFileSync(mainPath, 'utf8');

assert.ok(mainCode.includes("id: 'workout'") || mainCode.includes("id: 'daily-workout'"), 'main.ts must register workout route');
assert.ok(mainCode.includes('workoutHeroBanner'), 'main.ts must define workoutHeroBanner component');
assert.ok(mainCode.includes('ie-workout-hero-banner'), 'main.ts must render workout hero banner class');
console.log('✓ Overview Hero Card and Route registration verified');
console.log('=== ALL DAILY GUIDED WORKOUT VERIFICATIONS PASSED ===');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: FAIL with "main.ts must register workout route".

- [ ] **Step 3: Modify main.ts to register workout route and overview hero**

In `web/src/ielts/main.ts`:
1. Import `workoutView` and `DailyWorkoutStorage`:
```typescript
import { workoutView } from './views/daily-workout';
import { DailyWorkoutStorage } from './daily-workout/storage';
```

2. Add helper `workoutHeroBanner()`:
```typescript
function workoutHeroBanner(): HTMLElement {
  const todayKey = DailyWorkoutStorage.getTodayDateKey();
  const state = DailyWorkoutStorage.loadWorkoutState(todayKey);
  const streak = DailyWorkoutStorage.getWorkoutStreak();
  const budget = StorageManager.getDailyTimeBudget();

  const hero = h('div', 'ie-card ie-workout-hero-banner');
  hero.style.background = 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%)';
  hero.style.border = '1px solid var(--accent-cyan, #06b6d4)';
  hero.style.borderRadius = 'var(--radius-squircle-md, 16px)';
  hero.style.padding = '18px 20px';
  hero.style.marginBottom = '20px';
  hero.style.display = 'flex';
  hero.style.justifyContent = 'space-between';
  hero.style.alignItems = 'center';
  hero.style.flexWrap = 'wrap';
  hero.style.gap = '14px';

  const statusText = state.completed
    ? '✓ Completed Today • Streak Active!'
    : `${state.completedStepIndexes.length}/4 Steps Done • ~${budget} min session`;

  hero.innerHTML = `
    <div style="flex: 1; min-width: 240px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span class="ie-card-badge" style="background: var(--accent-cyan); color: #0b0f19; font-weight: 800;">
          DAILY FLOW
        </span>
        <span style="font-size: var(--font-kicker, 11px); color: var(--accent-gold); font-weight: 700;">
          ${streak.currentStreak > 0 ? `${streak.currentStreak} 🔥 Day Streak` : 'Start your streak today'}
        </span>
      </div>
      <h3 style="font-size: var(--text-base, 17px); font-weight: 800; margin: 4px 0;">
        ${t('ielts.hero_daily_workout_title', undefined, "Today's Guided Workout")}
      </h3>
      <p style="font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); margin: 0;">
        ${statusText}
      </p>
    </div>
    <a class="ie-btn ie-btn-primary" href="#workout" style="min-height: 44px; padding: 10px 20px; border-radius: var(--radius-btn, 10px); display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none;">
      <span>${state.completed ? 'Review Workout' : state.completedStepIndexes.length > 0 ? 'Resume Workout' : 'Start Daily Workout'}</span>
      ${icon('arrowRight', 16)}
    </a>
  `;
  return hero;
}
```

3. Insert `workoutHeroBanner()` in `#home` route view handler:
```typescript
root.append(
  h('h1', 'ie-title', t('ielts.road_to_7', undefined, 'IELTS Academic: road to 7.0')),
  h('p', 'ie-lead', t('ielts.road_to_7_lead', undefined, '...')),
  workoutHeroBanner(),
  homeSuites(),
  progressSection(),
  report()
);
```

4. Add `#workout` and `#daily-workout` to `ALL_ROUTES`:
```typescript
{ id: 'workout', label: 'Daily Workout', parentNavId: 'home', view: workoutView },
{ id: 'daily-workout', label: 'Daily Workout', parentNavId: 'home', view: workoutView },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-daily-workout.cjs`
Expected: PASS with "=== ALL DAILY GUIDED WORKOUT VERIFICATIONS PASSED ===".

- [ ] **Step 5: Commit**

```bash
git add web/src/ielts/main.ts web/scripts/verify-daily-workout.cjs
git commit -m "feat(ielts): integrate daily guided workout hero card and routing in overview"
```

---

## Phase 6: Test Suite Integration & Verification

### Task 6: Hook Test Runner & End-to-End Typecheck

**Files:**
- Modify: `web/package.json` (add script alias `test:workout`)
- Verify: full test suite and TypeScript emission

**Interfaces:**
- Consumes: `verify-daily-workout.cjs`, `run-verify.cjs`.
- Produces: 100% clean test execution and zero TypeScript compilation errors.

- [ ] **Step 1: Add test script alias in package.json**

In `web/package.json`, add:
```json
"test:workout": "node scripts/verify-daily-workout.cjs"
```

- [ ] **Step 2: Run test:workout**

Run: `npm run test:workout` (from `web` directory)
Expected: PASS with all checks successful.

- [ ] **Step 3: Run full TypeScript check and verify suite**

Run: `npm test` (from `web` directory)
Expected: `tsc --noEmit` succeeds and all verify scripts exit with code 0.

- [ ] **Step 4: Commit**

```bash
git add web/package.json
git commit -m "chore(ielts): register test:workout script in package.json and complete verification"
```

---

## Execution Choice

Plan complete and saved to `docs/superpowers/plans/2026-11-05-daily-guided-workout.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
