// web/scripts/verify-cat-adaptive.cjs
// Verification suite for Computerized Adaptive Testing (CAT) 2PL IRT Rasch Engine & StorageManager v4 (ENG-95)

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
  '../utils/storage': storageMod,
  './aes-scoring-engine': {}
});
const {
  CEFR_THETA_CALIBRATION,
  thetaToCefr,
  calcIrtProbability,
  calcFisherInformation,
  calcSem,
  classifyCatConfidence,
  updateThetaEAP,
  selectNextCatItem,
  CatPlacementEngine,
  MultiSkillDiagnosticRunner,
  buildDiagnosticBattery
} = placementMod;

console.log('=== TEST 1: StorageManager Schema v4 Migration Invariants ===');

assert.strictEqual(CURRENT_VERSION, 4, 'CURRENT_VERSION must be 4');
assert.strictEqual(StorageManager.CURRENT_VERSION, 4, 'StorageManager.CURRENT_VERSION must be 4');

// 1.1 Fresh state initialization
localStorage.clear();
StorageManager.clearCache();
const freshState = StorageManager.loadState();
assert.strictEqual(freshState.version, 4, 'Fresh state version is 4');
assert.strictEqual(freshState.learnerLevel, 'A1');
assert.ok(freshState.errorLedger, 'errorLedger initialized in fresh state');
assert.strictEqual(freshState.errorLedger.totalLogged, 0);
assert.strictEqual(freshState.errorLedger.totalResolved, 0);

// 1.2 Migration from v3 state
localStorage.clear();
StorageManager.clearCache();
const v3State = {
  version: 3,
  learnerLevel: 'B2',
  skillLevels: { vocab: 'B2', grammar: 'B2', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
  placementDone: true,
  cardStates: {
    'card-201': { cardId: 'card-201', easeFactor: 2.5, interval: 10, lapses: 0, repetitions: 4, dueDate: 1790000000 }
  },
  streak: { currentStreak: 7, longestStreak: 14, lastActiveDate: '2026-10-10' }
};
localStorage.setItem('STARK_ENG_STATE', JSON.stringify(v3State));

const migratedV3 = StorageManager.loadState();
assert.strictEqual(migratedV3.version, 4, 'v3 state upgraded to version 4');
assert.strictEqual(migratedV3.learnerLevel, 'B2', 'learnerLevel B2 preserved');
assert.strictEqual(migratedV3.cardStates['card-201'].interval, 10, 'SRS cardStates preserved without wiping');
assert.strictEqual(migratedV3.streak.currentStreak, 7, 'Streak count preserved');
assert.ok(migratedV3.errorLedger, 'errorLedger backfilled on v3 migration');

// 1.3 Backup export/import round-trip
const exported = StorageManager.exportBackup();
const importSuccess = StorageManager.importBackup(exported);
assert.strictEqual(importSuccess, true, 'importBackup succeeds on v4 export');
const reloaded = StorageManager.loadState();
assert.strictEqual(reloaded.version, 4);
assert.strictEqual(reloaded.learnerLevel, 'B2');
console.log('PASSED: StorageManager schema v4 migration and preservation invariants verified.\n');

console.log('=== TEST 2: Formative Error Taxonomy Engine & SERL Spaced Remediation ===');

localStorage.clear();
StorageManager.clearCache();

// 2.1 Record error across taxonomy codes (Grammar with L1 transfer)
const err1 = StorageManager.recordError({
  code: 'G',
  subcategory: 'copula_omission',
  contextPhrase: 'I very happy because yesterday I go there.',
  userFault: 'I very happy',
  correction: 'I was very happy',
  isL1Transfer: true,
  l1Pattern: 'zero_copula',
  skill: 'grammar'
});

assert.strictEqual(err1.code, 'G');
assert.strictEqual(err1.isL1Transfer, true);
assert.strictEqual(err1.recurrenceCount, 1);
assert.strictEqual(err1.status, 'active');
assert.ok(err1.remediationCardId, 'Remediation card ID must be assigned');

// 2.2 Verify SERL bridge into SM-2 cardStates
const card = StorageManager.getCardState(err1.remediationCardId);
assert.ok(card, 'Remediation card must be present in cardStates');
assert.strictEqual(card.interval, 1, 'Initial remediation review interval is 1 day');
assert.strictEqual(card.easeFactor, 2.30, 'L1 transfer error starts at Ease Factor 2.30');
assert.ok(card.dueDate <= Date.now(), 'Card is due immediately for practice');

// 2.3 Recurrence tracking: record same fault a 2nd and 3rd time
StorageManager.recordError({
  code: 'G',
  userFault: 'I very happy',
  correction: 'I was very happy',
  contextPhrase: 'She very busy now.',
  isL1Transfer: true
});
const err3 = StorageManager.recordError({
  code: 'G',
  userFault: 'I very happy',
  correction: 'I was very happy',
  contextPhrase: 'He very tired.',
  isL1Transfer: true
});

assert.strictEqual(err3.recurrenceCount, 3, 'Recurrence counter reached 3');

// 2.4 Pre-Flight Checklist synthesis on >= 3 recurrences
const checklist = StorageManager.getPreFlightChecklist();
assert.strictEqual(checklist.length, 1, 'Pre-flight checklist generated for recurring pattern');
const rule = checklist[0];
assert.strictEqual(rule.code, 'G');
assert.strictEqual(rule.cleanStreak, 0);

// 2.5 Checklist retirement after 3 clean streaks
StorageManager.markChecklistRuleClean(rule.id);
StorageManager.markChecklistRuleClean(rule.id);
const isRetired = StorageManager.markChecklistRuleClean(rule.id);
assert.strictEqual(isRetired, true, 'Rule retires after 3 clean streaks');
assert.strictEqual(StorageManager.getPreFlightChecklist().length, 0, 'Active checklist is empty after retirement');

// 2.6 Error resolution
StorageManager.resolveErrorRecord(err1.id);
const resolvedRec = StorageManager.getErrorRecords().find(r => r.id === err1.id);
assert.strictEqual(resolvedRec.status, 'resolved', 'Status marked as resolved');
console.log('PASSED: Error taxonomy recording, SERL SM-2 bridge, and pre-flight checklist verified.\n');

console.log('=== TEST 3: 2PL IRT Rasch Model & Fisher Information ===');

// 3.1 Characteristic curve invariants
const pExact = calcIrtProbability(0.5, 0.5, 1.2);
assert.strictEqual(Math.round(pExact * 100), 50, 'P(theta = b) must be 0.50');

const pHigher = calcIrtProbability(1.5, 0.5, 1.2);
assert.ok(pHigher > 0.5, 'P(theta > b) must exceed 0.50');

const pLower = calcIrtProbability(-0.5, 0.5, 1.2);
assert.ok(pLower < 0.5, 'P(theta < b) must be less than 0.50');

// 3.2 Fisher Information maximum
const infoPeak = calcFisherInformation(0.5, 0.5, 1.2);
const infoOff = calcFisherInformation(1.5, 0.5, 1.2);
assert.ok(infoPeak > infoOff, 'Fisher Information peaks when theta = b');

// 3.3 SEM formula
const sem0 = calcSem(0, 1.0);
const sem1 = calcSem(5, 1.0);
assert.strictEqual(sem0, 1.0, 'SEM with 0 info and prior variance 1.0 is 1.0');
assert.ok(sem1 < sem0, 'SEM decreases monotonically with information');
console.log('PASSED: 2PL IRT mathematical invariants and Fisher Information verified.\n');

console.log('=== TEST 4: Maximum Fisher Information Item Selection ===');

const testBattery = buildDiagnosticBattery({ mode: 'comprehensive' });
const administered = new Set();

// At B1 provisional anchor (theta = -0.5), item selection must prioritize B1 item
const nextB1 = selectNextCatItem(testBattery, administered, -0.5, 'vocab');
assert.ok(nextB1, 'Must select next CAT item');
assert.strictEqual(nextB1.level, 'B1', 'Selects B1 item for theta = -0.5');

// At C1 ability anchor (theta = 1.5), item selection must prioritize C1 item
const nextC1 = selectNextCatItem(testBattery, administered, 1.5, 'grammar');
assert.ok(nextC1, 'Must select next CAT item');
assert.strictEqual(nextC1.level, 'C1', 'Selects C1 item for theta = 1.5');
console.log('PASSED: Maximum Fisher Information item selection verified.\n');

console.log('=== TEST 5: CAT Dynamic Branching, Convergence & Guessing Penalty ===');

// 5.1 Simulated C2 Scholar (Answers always correct)
const c2Engine = new CatPlacementEngine({
  questionPool: testBattery,
  semThreshold: 0.35,
  maxItemsPerSkill: 4,
  minItemsPerSkill: 3,
  maxTotalItems: 18,
  initialTheta: -0.5
});

let steps = 0;
while (!c2Engine.isComplete() && steps < 30) {
  const currentQ = c2Engine.getCurrentQuestion();
  if (!currentQ) break;
  c2Engine.recordAnswer(currentQ.answer, false); // Always correct
  steps++;
}

assert.ok(c2Engine.isComplete(), 'Engine finishes within limits');
assert.ok(c2Engine.getAdministeredCount() <= 18, `Administered ${c2Engine.getAdministeredCount()} <= 18 items`);
const c2Results = c2Engine.getCatResults();
assert.ok(c2Results.overallTheta > 0.5, `C2 theta ${c2Results.overallTheta} must ascend above B1 (0.5)`);
assert.ok(['C1', 'C2'].includes(c2Results.overallLevel), `C2 learner level ${c2Results.overallLevel} is C1 or C2`);

// 5.2 Simulated A1 Learner (Answers always incorrect)
const a1Engine = new CatPlacementEngine({
  questionPool: testBattery,
  semThreshold: 0.35,
  maxItemsPerSkill: 4,
  minItemsPerSkill: 3,
  maxTotalItems: 18,
  initialTheta: -0.5
});

steps = 0;
while (!a1Engine.isComplete() && steps < 30) {
  const currentQ = a1Engine.getCurrentQuestion();
  if (!currentQ) break;
  const wrongOption = (currentQ.answer + 1) % currentQ.options.length;
  a1Engine.recordAnswer(wrongOption, false);
  steps++;
}

const a1Results = a1Engine.getCatResults();
assert.ok(a1Results.overallTheta < -1.0, `A1 theta ${a1Results.overallTheta} must descend below A2 (-1.0)`);
assert.strictEqual(a1Results.overallLevel, 'A1', 'A1 learner calibrated to A1');

// 5.3 Guessing penalty test (0.5 score vs 1.0 score)
const confidentUpdate = updateThetaEAP(-0.5, 1.0, 0.5, 1.2, 0);
const guessedUpdate = updateThetaEAP(-0.5, 0.5, 0.5, 1.2, 0);
assert.ok(
  confidentUpdate.newTheta > guessedUpdate.newTheta,
  'Confident correct answer (+1.0) yields higher theta than guessed answer (+0.5)'
);
console.log('PASSED: CAT dynamic branching, convergence, and guessing penalty verified.\n');

console.log('=== TEST 6: SEM Stopping Rule, Confidence & Persistence ===');

localStorage.clear();
StorageManager.clearCache();

const testRunner = new CatPlacementEngine({
  questionPool: testBattery,
  semThreshold: 0.35,
  maxItemsPerSkill: 3,
  minItemsPerSkill: 2,
  maxTotalItems: 12
});

while (!testRunner.isComplete()) {
  const q = testRunner.getCurrentQuestion();
  if (!q) break;
  testRunner.recordAnswer(q.answer, false);
}

const finalResults = testRunner.getCatResults();
assert.ok(finalResults.overallConfidence, 'Confidence rating populated');
assert.ok(['low', 'medium', 'high'].includes(finalResults.overallConfidence));

// Persist results into StorageManager v4
testRunner.applyResults(true);

const savedLearnerLevel = StorageManager.getLearnerLevel();
assert.strictEqual(savedLearnerLevel, finalResults.overallLevel, 'Learner level updated in StorageManager');
const catVocab = StorageManager.getCatProfile('vocab');
assert.ok(catVocab, 'CAT vocab profile saved in StorageManager');
assert.strictEqual(catVocab.skill, 'vocab');
assert.ok(typeof catVocab.theta === 'number');

// Test MultiSkillDiagnosticRunner backward compatibility
const runner = new MultiSkillDiagnosticRunner();
assert.strictEqual(runner.getQuestions().length, 15, 'Default quick battery has 15 items');
const firstQ = runner.getCurrentQuestion();
assert.ok(firstQ);
const res = runner.recordAnswer(firstQ.answer);
assert.strictEqual(res.isCorrect, true);
console.log('PASSED: SEM stopping, confidence classification, and state persistence verified.\n');

console.log('======================================================');
console.log('ALL ASSERTIONS PASSED: ENG-95 CAT IRT Placement Engine & StorageManager v4');
console.log('======================================================');
