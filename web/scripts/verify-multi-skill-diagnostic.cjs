// web/scripts/verify-multi-skill-diagnostic.cjs
// Verification suite for Multi-Skill CEFR Diagnostic Engine & StorageManager v3 Migration (ENG-64)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src');

function load(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

// Mock localStorage for storage testing
const mockStorage = {};
global.localStorage = {
  getItem: key => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: key => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

const cefr = load('core/cefr.ts');
const treeData = load('core/skill-tree-data.ts');
const storageMod = load('utils/storage.ts', {
  '../core/cefr': cefr,
  '../core/skill-tree-data': treeData
});
const { StorageManager, CURRENT_VERSION } = storageMod;

const placementMod = load('core/multi-skill-placement.ts', {
  './cefr': cefr,
  '../utils/storage': storageMod
});
const {
  DIAGNOSTIC_STAGES,
  QUICK_BATTERY_LEVELS,
  CURATED_LISTENING_QUESTIONS,
  calibrateSkillLevel,
  resolveSpeakingBaseline,
  resolveMedianLevel,
  calibrateSkillProfile,
  buildDiagnosticBattery,
  MultiSkillDiagnosticRunner
} = placementMod;

console.log('=== TEST 1: StorageManager Schema v3 Migration Invariants ===');

assert.strictEqual(CURRENT_VERSION, 3, 'CURRENT_VERSION must be 3');
assert.strictEqual(StorageManager.CURRENT_VERSION, 3, 'StorageManager.CURRENT_VERSION must be 3');

// 1.1 Brand new profile starts at A1 with uncompleted placement
localStorage.clear();
StorageManager.clearCache();
const freshState = StorageManager.loadState();
assert.strictEqual(freshState.version, 3, 'New state is version 3');
assert.strictEqual(freshState.learnerLevel, 'A1', 'New learnerLevel is A1');
assert.strictEqual(freshState.placementDone, false, 'New profile has placementDone false');
for (const skill of ['vocab', 'grammar', 'reading', 'listening', 'writing', 'speaking']) {
  assert.strictEqual(freshState.skillLevels[skill], 'A1', `New profile skill ${skill} must initialize to A1`);
}

// 1.2 Migration from v2 profile without skillLevels: initializes all skills to learnerLevel
localStorage.clear();
StorageManager.clearCache();
const v2State = {
  version: 2,
  learnerLevel: 'B2',
  placementDone: true,
  cardStates: {
    'card-101': { cardId: 'card-101', easeFactor: 2.5, interval: 6, lapses: 0, repetitions: 2, dueDate: Date.now() }
  },
  streak: { currentStreak: 5, longestStreak: 10, lastActiveDate: '2026-10-04' }
};
localStorage.setItem('STARK_ENG_STATE', JSON.stringify(v2State));

const migratedState = StorageManager.loadState();
assert.strictEqual(migratedState.version, 3, 'Migrated state must upgrade to version 3');
assert.strictEqual(migratedState.learnerLevel, 'B2', 'Existing learnerLevel B2 preserved');
assert.strictEqual(migratedState.placementDone, true, 'Existing placementDone preserved');
assert.ok(migratedState.skillLevels, 'skillLevels must be populated');
for (const skill of ['vocab', 'grammar', 'reading', 'listening', 'writing', 'speaking']) {
  assert.strictEqual(migratedState.skillLevels[skill], 'B2', `v2 migrated skill ${skill} must equal learnerLevel B2`);
}
assert.strictEqual(migratedState.cardStates['card-101'].interval, 6, 'Card states must be preserved without wiping');
assert.strictEqual(migratedState.streak.currentStreak, 5, 'Streak must be preserved');

// 1.3 Accessor methods: getSkillLevel & setSkillLevel
assert.strictEqual(StorageManager.getSkillLevel('grammar'), 'B2', 'Initial getSkillLevel is B2');
StorageManager.setSkillLevel('grammar', 'C1');
assert.strictEqual(StorageManager.getSkillLevel('grammar'), 'C1', 'Updated getSkillLevel is C1');
assert.strictEqual(StorageManager.getSkillLevel('reading'), 'B2', 'Other skills remain unaffected');

// 1.4 Profile accessors: getSkillProfile & saveSkillProfile
const profile = StorageManager.getSkillProfile();
assert.strictEqual(profile.overall, 'B2');
assert.strictEqual(profile.skills.grammar, 'C1');
assert.strictEqual(profile.skills.vocab, 'B2');

const newProfile = {
  overall: 'C1',
  skills: {
    vocab: 'C1',
    grammar: 'C1',
    reading: 'C1',
    listening: 'B2',
    writing: 'B2',
    speaking: 'B2'
  },
  assessedAt: new Date().toISOString()
};
StorageManager.saveSkillProfile(newProfile);
assert.strictEqual(StorageManager.getLearnerLevel(), 'C1', 'saveSkillProfile updates learnerLevel');
assert.strictEqual(StorageManager.getSkillLevel('vocab'), 'C1', 'saveSkillProfile updates skillLevels');
assert.strictEqual(StorageManager.isPlacementDone(), true, 'saveSkillProfile sets placementDone true');

// 1.5 Backup roundtrip preserves v3 schema
const backupJson = StorageManager.exportBackup();
StorageManager.clearCache();
localStorage.clear();
const imported = StorageManager.importBackup(backupJson);
assert.strictEqual(imported, true, 'Backup imported successfully');
assert.strictEqual(StorageManager.getSkillLevel('vocab'), 'C1', 'Imported backup preserves skillLevels');
assert.strictEqual(StorageManager.getLearnerLevel(), 'C1', 'Imported backup preserves learnerLevel');

console.log('PASSED: StorageManager schema v3 migration and accessors verified.');

console.log('\n=== TEST 2: Scoring Invariants, Speaking Baseline & Median Resolver ===');

// 2.1 calibrateSkillLevel
assert.strictEqual(calibrateSkillLevel([]), 'A1', 'Empty records default to A1');
assert.strictEqual(calibrateSkillLevel([
  { level: 'A2', isCorrect: false },
  { level: 'B2', isCorrect: false },
  { level: 'C1', isCorrect: false }
]), 'A1', '0 correct answers result in A1');

assert.strictEqual(calibrateSkillLevel([
  { level: 'A2', isCorrect: true },
  { level: 'B2', isCorrect: false },
  { level: 'C1', isCorrect: false }
]), 'A2', 'Passing A2 results in A2');

assert.strictEqual(calibrateSkillLevel([
  { level: 'A2', isCorrect: true },
  { level: 'B2', isCorrect: true },
  { level: 'C1', isCorrect: false }
]), 'B2', 'Passing A2 and B2 results in B2');

assert.strictEqual(calibrateSkillLevel([
  { level: 'A2', isCorrect: true },
  { level: 'B2', isCorrect: true },
  { level: 'C1', isCorrect: true }
]), 'C1', 'Passing all 3 ladder tiers results in C1');

// Ladder climb stops at failed tier
assert.strictEqual(calibrateSkillLevel([
  { level: 'A2', isCorrect: false },
  { level: 'B2', isCorrect: true },
  { level: 'C1', isCorrect: true }
]), 'A1', 'Failing foundation A2 halts climb at A1 despite lucky higher guesses');

// 6-level full climb
const fullLadder = cefr.CEFR_ORDER.map(l => ({ level: l, isCorrect: true }));
assert.strictEqual(calibrateSkillLevel(fullLadder), 'C2', 'Passing all 6 levels results in C2');

// 2.2 resolveSpeakingBaseline
assert.strictEqual(resolveSpeakingBaseline('B2', 'B2'), 'B2', 'B2 + B2 = B2');
assert.strictEqual(resolveSpeakingBaseline('C1', 'B1'), 'B2', 'C1(4) + B1(2) average = B2(3)');
assert.strictEqual(resolveSpeakingBaseline('A1', 'A2'), 'A1', 'A1(0) + A2(1) average = A1(0)');
assert.strictEqual(resolveSpeakingBaseline('C2', 'C2'), 'C2', 'C2(5) + C2(5) = C2(5)');

// 2.3 resolveMedianLevel
assert.strictEqual(resolveMedianLevel(['A2', 'B1', 'B2', 'C1', 'C1']), 'B2', 'Odd 5-element median is middle element B2');
assert.strictEqual(resolveMedianLevel(['B2', 'B2', 'B2', 'B2', 'B2']), 'B2', 'Homogeneous proficiencies resolve to identical level');
assert.strictEqual(resolveMedianLevel(['A1', 'A1', 'B1', 'C2', 'C2']), 'B1', 'Extreme dispersion resolves to B1');
assert.strictEqual(resolveMedianLevel({
  vocab: 'C1',
  grammar: 'B2',
  reading: 'C1',
  listening: 'B1',
  writing: 'A2',
  speaking: 'B1'
}), 'B2', 'Object with 5 assessed skills resolves to median B2 (sorted: A2, B1, B2, C1, C1 -> B2)');

// 2.4 calibrateSkillProfile
const sampleAnswers = [
  // vocab 3/3 -> C1
  { skill: 'vocab', level: 'A2', isCorrect: true },
  { skill: 'vocab', level: 'B2', isCorrect: true },
  { skill: 'vocab', level: 'C1', isCorrect: true },
  // grammar 2/3 -> B2
  { skill: 'grammar', level: 'A2', isCorrect: true },
  { skill: 'grammar', level: 'B2', isCorrect: true },
  { skill: 'grammar', level: 'C1', isCorrect: false },
  // reading 3/3 -> C1
  { skill: 'reading', level: 'A2', isCorrect: true },
  { skill: 'reading', level: 'B2', isCorrect: true },
  { skill: 'reading', level: 'C1', isCorrect: true },
  // listening 2/3 -> B2
  { skill: 'listening', level: 'A2', isCorrect: true },
  { skill: 'listening', level: 'B2', isCorrect: true },
  { skill: 'listening', level: 'C1', isCorrect: false },
  // writing 1/3 -> A2
  { skill: 'writing', level: 'A2', isCorrect: true },
  { skill: 'writing', level: 'B2', isCorrect: false },
  { skill: 'writing', level: 'C1', isCorrect: false }
];
const calibrated = calibrateSkillProfile(sampleAnswers);
assert.strictEqual(calibrated.skills.vocab, 'C1');
assert.strictEqual(calibrated.skills.grammar, 'B2');
assert.strictEqual(calibrated.skills.reading, 'C1');
assert.strictEqual(calibrated.skills.listening, 'B2');
assert.strictEqual(calibrated.skills.writing, 'A2');
assert.strictEqual(calibrated.skills.speaking, 'B1', 'Speaking is average of listening(B2) and writing(A2) -> B1');
assert.strictEqual(calibrated.overall, 'B2', 'Overall median across [C1, B2, C1, B2, A2] is B2');

console.log('PASSED: Scoring invariants, speaking baseline, and median resolver verified.');

console.log('\n=== TEST 3: Multi-Stage Question Generation & Distractor Parity ===');

// 3.1 Quick Battery (15 questions: 3 per stage x 5 stages)
const quickBattery = buildDiagnosticBattery({ mode: 'quick' });
assert.strictEqual(quickBattery.length, 15, 'Quick battery must contain exactly 15 questions');

for (let stage = 1; stage <= 5; stage++) {
  const stageQs = quickBattery.filter(q => q.stage === stage);
  assert.strictEqual(stageQs.length, 3, `Stage ${stage} must have exactly 3 questions`);
  const levels = stageQs.map(q => q.level);
  for (const lvl of QUICK_BATTERY_LEVELS) {
    assert.ok(levels.includes(lvl), `Stage ${stage} must contain ladder level ${lvl}`);
  }
}

// 3.2 Comprehensive Battery (30 questions: 6 per stage x 5 stages)
const compBattery = buildDiagnosticBattery({ mode: 'comprehensive' });
assert.strictEqual(compBattery.length, 30, 'Comprehensive battery must contain exactly 30 questions');
for (let stage = 1; stage <= 5; stage++) {
  const stageQs = compBattery.filter(q => q.stage === stage);
  assert.strictEqual(stageQs.length, 6, `Stage ${stage} must have 6 questions`);
  const levels = stageQs.map(q => q.level).sort();
  assert.deepStrictEqual(levels, [...cefr.CEFR_ORDER].sort(), `Stage ${stage} must cover all 6 CEFR tiers A1-C2`);
}

// 3.3 Real Curated Questions integration
const curatedJsonPath = path.join(SRC, 'assets', 'data', 'diagnostic-questions.json');
assert.ok(fs.existsSync(curatedJsonPath), 'diagnostic-questions.json must exist');
const curatedData = JSON.parse(fs.readFileSync(curatedJsonPath, 'utf8'));

const realBattery = buildDiagnosticBattery({
  curatedQuestions: curatedData,
  mode: 'quick'
});
assert.strictEqual(realBattery.length, 15, 'Real data battery produces 15 questions in quick mode');

// 3.4 Distractor Parity & Option Invariants
for (const q of realBattery) {
  assert.ok(q.id, 'Question must have id');
  assert.ok(q.stage >= 1 && q.stage <= 5, 'Stage must be 1..5');
  assert.ok(cefr.isCefr(q.level), 'Level must be valid CEFR');
  assert.strictEqual(q.options.length, 4, `Question ${q.id} must have exactly 4 options`);
  assert.strictEqual(new Set(q.options).size, 4, `Question ${q.id} options must be distinct`);
  assert.ok(q.answer >= 0 && q.answer < 4, `Question ${q.id} answer index must be 0..3`);
  assert.ok(q.options[q.answer], `Question ${q.id} correct option must exist`);

  if (q.stage === 4) {
    assert.ok(q.audioPrompt && q.audioPrompt.length > 0, `Listening question ${q.id} must include non-empty audioPrompt`);
  }
}

console.log('PASSED: Multi-stage question battery and distractor parity verified.');

console.log('\n=== TEST 4: MultiSkillDiagnosticRunner End-to-End Simulation ===');

const runner = new MultiSkillDiagnosticRunner(quickBattery);
assert.strictEqual(runner.getTotalQuestions(), 15);
assert.strictEqual(runner.getCurrentStageNumber(), 1);
assert.strictEqual(runner.getCurrentQuestionIndexInStage(), 0);
assert.strictEqual(runner.isStageComplete(), false);
assert.strictEqual(runner.isQuizComplete(), false);

// Stepping through questions with simulated responses
let qIdx = 0;
while (!runner.isQuizComplete()) {
  const currentQ = runner.getCurrentQuestion();
  assert.ok(currentQ, `Question at index ${qIdx} must exist`);

  // Target profile simulation:
  // Stage 1 (vocab): 3/3 correct
  // Stage 2 (grammar): 2/3 correct (answer 1st and 2nd right, 3rd wrong)
  // Stage 3 (reading): 3/3 correct
  // Stage 4 (listening): 2/3 correct
  // Stage 5 (writing): 1/3 correct (answer 1st right, 2nd & 3rd wrong)
  let answerCorrect = true;
  if (currentQ.stage === 2 && currentQ.level === 'C1') answerCorrect = false;
  if (currentQ.stage === 4 && currentQ.level === 'C1') answerCorrect = false;
  if (currentQ.stage === 5 && (currentQ.level === 'B2' || currentQ.level === 'C1')) answerCorrect = false;

  const choice = answerCorrect ? currentQ.answer : (currentQ.answer + 1) % 4;
  const stepRes = runner.recordAnswer(choice);

  assert.strictEqual(stepRes.isCorrect, answerCorrect);
  assert.strictEqual(stepRes.correctAnswer, currentQ.answer);

  const advanced = runner.advanceToNextQuestion();
  qIdx++;
  if (!advanced) {
    assert.ok(runner.isQuizComplete(), 'Runner should be complete when advance returns false');
  }
}

assert.strictEqual(runner.isQuizComplete(), true, 'Quiz must be complete');

const finalResults = runner.getResults();
assert.strictEqual(finalResults.totalQuestions, 15);
assert.strictEqual(finalResults.totalCorrect, 11); // 3 + 2 + 3 + 2 + 1 = 11

// Check stage summaries
assert.strictEqual(finalResults.stageSummaries[0].calibratedLevel, 'C1', 'Stage 1 vocab calibrated to C1');
assert.strictEqual(finalResults.stageSummaries[1].calibratedLevel, 'B2', 'Stage 2 grammar calibrated to B2');
assert.strictEqual(finalResults.stageSummaries[2].calibratedLevel, 'C1', 'Stage 3 reading calibrated to C1');
assert.strictEqual(finalResults.stageSummaries[3].calibratedLevel, 'B2', 'Stage 4 listening calibrated to B2');
assert.strictEqual(finalResults.stageSummaries[4].calibratedLevel, 'A2', 'Stage 5 writing calibrated to A2');

// Check profile persistence via applyResults
StorageManager.clearCache();
runner.applyResults(true);

const savedProfile = StorageManager.getSkillProfile();
assert.strictEqual(savedProfile.skills.vocab, 'C1');
assert.strictEqual(savedProfile.skills.grammar, 'B2');
assert.strictEqual(savedProfile.skills.reading, 'C1');
assert.strictEqual(savedProfile.skills.listening, 'B2');
assert.strictEqual(savedProfile.skills.writing, 'A2');
assert.strictEqual(savedProfile.skills.speaking, 'B1');
assert.strictEqual(savedProfile.overall, 'B2');
assert.strictEqual(StorageManager.getLearnerLevel(), 'B2');
assert.strictEqual(StorageManager.isPlacementDone(), true);

console.log('PASSED: MultiSkillDiagnosticRunner end-to-end simulation verified.');

console.log('\n======================================================');
console.log('ALL ASSERTIONS PASSED: ENG-64 Core Multi-Skill Diagnostic Engine & Storage v3 Migration');
console.log('======================================================');
