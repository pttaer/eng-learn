/**
 * Automated Verification Suite for Daily Guided Workout (Item 1)
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

console.log('=== VERIFYING DAILY GUIDED WORKOUT (ITEM 1) ===\n');

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
const phrasebankCodePath = path.resolve(__dirname, '../src/ielts/daily-workout/phrasebank-drills.ts');
const generatorPath = path.resolve(__dirname, '../src/ielts/daily-workout/generator.ts');

assert.ok(fs.existsSync(typesPath), 'web/src/ielts/daily-workout/types.ts must exist');
assert.ok(fs.existsSync(storagePath), 'web/src/ielts/daily-workout/storage.ts must exist');
assert.ok(fs.existsSync(phrasebankCodePath), 'web/src/ielts/daily-workout/phrasebank-drills.ts must exist');
assert.ok(fs.existsSync(generatorPath), 'web/src/ielts/daily-workout/generator.ts must exist');
console.log('✓ File existence verified for daily workout architecture');

// Helper to transpile TS module on the fly
function loadTs(fullPath) {
  const raw = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(raw, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, resolveJsonModule: true }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', transpiled)(mod, mod.exports, (name) => {
    if (name.endsWith('.json')) {
      const jsonPath = path.resolve(path.dirname(fullPath), name);
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return Object.assign(data, { default: data });
    }
    if (name.startsWith('./') || name.startsWith('../')) {
      const resolved = path.resolve(path.dirname(fullPath), name);
      const candidates = [resolved + '.ts', resolved + '.js', resolved + '/index.ts'];
      for (const c of candidates) {
        if (fs.existsSync(c)) return loadTs(c);
      }
    }
    return require(name);
  });
  return mod.exports;
}

// 2. Verify storage methods and structure
const storageMod = loadTs(storagePath);
const { DailyWorkoutStorage } = storageMod;
assert.ok(DailyWorkoutStorage, 'Must export DailyWorkoutStorage class');
assert.strictEqual(typeof DailyWorkoutStorage.loadWorkoutState, 'function', 'Must export loadWorkoutState method');
assert.strictEqual(typeof DailyWorkoutStorage.saveWorkoutState, 'function', 'Must export saveWorkoutState method');
assert.strictEqual(typeof DailyWorkoutStorage.markStepComplete, 'function', 'Must export markStepComplete method');
assert.strictEqual(typeof DailyWorkoutStorage.getWorkoutStreak, 'function', 'Must export getWorkoutStreak method');

// Test storage logic
const today = DailyWorkoutStorage.getTodayDateKey();
const initialState = DailyWorkoutStorage.loadWorkoutState(today);
assert.strictEqual(initialState.completed, false);
assert.strictEqual(initialState.completedStepIndexes.length, 0);

DailyWorkoutStorage.markStepComplete(today, 0, { stepIndex: 0, type: 'vocab', completedAt: Date.now() }, 4);
DailyWorkoutStorage.markStepComplete(today, 1, { stepIndex: 1, type: 'reading', completedAt: Date.now() }, 4);
DailyWorkoutStorage.markStepComplete(today, 2, { stepIndex: 2, type: 'phrasebank', completedAt: Date.now() }, 4);
const finalState = DailyWorkoutStorage.markStepComplete(today, 3, { stepIndex: 3, type: 'strategy', completedAt: Date.now() }, 4);

assert.strictEqual(finalState.completed, true);
assert.strictEqual(finalState.completedStepIndexes.length, 4);

const streak = DailyWorkoutStorage.getWorkoutStreak();
assert.strictEqual(streak.currentStreak, 1);
assert.strictEqual(streak.totalWorkoutsCompleted, 1);
console.log('✓ DailyWorkoutStorage state and streak persistence verified');

// 3. Verify Phrasebank Cloze Engine
const phrasebankMod = loadTs(phrasebankCodePath);
const { generatePhrasebankDrills } = phrasebankMod;
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

// 4. Verify Daily Workout Generator Engine
const generatorMod = loadTs(generatorPath);
const { generateDailyWorkout } = generatorMod;
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

// 5. Verify Workout View Component
const workoutViewPath = path.resolve(__dirname, '../src/ielts/views/daily-workout.ts');
assert.ok(fs.existsSync(workoutViewPath), 'views/daily-workout.ts must exist');

const workoutViewCode = fs.readFileSync(workoutViewPath, 'utf8');
assert.ok(workoutViewCode.includes('export function workoutView'), 'Must export workoutView');
assert.ok(workoutViewCode.includes('ie-workout-stepper'), 'Must render stepper progress bar');
assert.ok(workoutViewCode.includes('ie-workout-budget-pills'), 'Must render time budget switcher');
assert.ok(workoutViewCode.includes('ie-workout-completion-card'), 'Must render celebratory completion receipt');
console.log('✓ Interactive Daily Workout View component verified');

// 6. Verify Overview Hero Banner and Routing
const mainPath = path.resolve(__dirname, '../src/ielts/main.ts');
const mainCode = fs.readFileSync(mainPath, 'utf8');

assert.ok(mainCode.includes("id: 'workout'") || mainCode.includes("id: 'daily-workout'"), 'main.ts must register workout route');
assert.ok(mainCode.includes('workoutHeroBanner'), 'main.ts must define workoutHeroBanner component');
assert.ok(mainCode.includes('ie-workout-hero-banner'), 'main.ts must render workout hero banner class');
console.log('✓ Overview Hero Card and Route registration verified');

console.log('\n=== ALL DAILY GUIDED WORKOUT VERIFICATIONS PASSED ===');
