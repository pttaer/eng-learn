// web/scripts/verify-compiler-diagnostic.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

console.log('--- Verifying IELTS Udemy Compiler & Diagnostic Engine [ENG-111] ---');

// Test 1: Check compiler script export and execution time
const compileContent = require('./compile-content.cjs');
assert.strictEqual(typeof compileContent.compileIeltsCourse, 'function', 'compileIeltsCourse must be exported from compile-content.cjs');

const start = Date.now();
const compileResult = compileContent.compileIeltsCourse();
const elapsed = Date.now() - start;
console.log(`[PASS] compileIeltsCourse() executed in ${elapsed}ms (Limit: < 100ms)`);
assert(elapsed < 100, `Compilation must be < 100ms, took ${elapsed}ms`);

// Test 2: Verify strategy.json
const strategyPath = path.join(__dirname, '..', 'src', 'ielts', 'data', 'strategy.json');
assert(fs.existsSync(strategyPath), 'strategy.json must exist');
const strategyCards = JSON.parse(fs.readFileSync(strategyPath, 'utf8'));
assert(Array.isArray(strategyCards), 'strategy.json must be an array');
console.log(`[PASS] strategy.json contains ${strategyCards.length} cards (Minimum: 30)`);
assert(strategyCards.length >= 30, `Expected at least 30 cards, got ${strategyCards.length}`);

const requiredSkills = new Set(['Listening', 'Reading', 'Writing Task 1', 'Writing Task 2', 'Speaking', 'CBT Navigation']);
const presentSkills = new Set();

strategyCards.forEach((c, idx) => {
  assert(c.id, `Card #${idx} missing id`);
  assert(c.skill, `Card #${idx} missing skill`);
  assert(c.title, `Card #${idx} missing title`);
  assert(c.sectionRef, `Card #${idx} missing sectionRef`);
  assert(Array.isArray(c.tips), `Card #${idx} tips must be an array`);
  assert(Array.isArray(c.traps), `Card #${idx} traps must be an array`);
  presentSkills.add(c.skill);
});

requiredSkills.forEach(s => {
  assert(presentSkills.has(s), `Missing skill category in strategy cards: ${s}`);
});
console.log('[PASS] All 6 skills represented in strategy cards with tips and traps.');

// Test 3: Verify ielts-course.json
const courseJsonPath = path.join(__dirname, '..', 'src', 'assets', 'data', 'ielts-course.json');
assert(fs.existsSync(courseJsonPath), 'ielts-course.json must exist');
const courseData = JSON.parse(fs.readFileSync(courseJsonPath, 'utf8'));

// Diagnostics
assert(Array.isArray(courseData.diagnostics), 'courseData.diagnostics must be an array');
assert(courseData.diagnostics.length >= 20, `Expected >= 20 diagnostic questions, got ${courseData.diagnostics.length}`);
courseData.diagnostics.forEach((q, idx) => {
  assert(q.id, `Diag #${idx} missing id`);
  assert(q.category === 'grammar' || q.category === 'vocabulary', `Diag #${idx} invalid category: ${q.category}`);
  assert(q.subType, `Diag #${idx} missing subType`);
  assert(q.prompt, `Diag #${idx} missing prompt`);
  assert(Array.isArray(q.options) && q.options.length >= 3, `Diag #${idx} must have >= 3 options`);
  assert(typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < q.options.length, `Diag #${idx} invalid correctIndex`);
  assert(q.explanation, `Diag #${idx} missing explanation`);
  assert(q.impactOnBand, `Diag #${idx} missing impactOnBand`);
});
console.log(`[PASS] courseData.diagnostics: ${courseData.diagnostics.length} verified items.`);

// Question Types (14 Reading Types)
assert(Array.isArray(courseData.questionTypes), 'courseData.questionTypes must be an array');
assert(courseData.questionTypes.length >= 14, `Expected 14 Reading question types, got ${courseData.questionTypes.length}`);
courseData.questionTypes.forEach((qt, idx) => {
  assert(qt.id, `QT #${idx} missing id`);
  assert(qt.name, `QT #${idx} missing name`);
  assert(Array.isArray(qt.algorithm) && qt.algorithm.length > 0, `QT #${idx} algorithm must be non-empty array`);
  assert(Array.isArray(qt.traps) && qt.traps.length > 0, `QT #${idx} traps must be non-empty array`);
});
console.log(`[PASS] courseData.questionTypes: ${courseData.questionTypes.length} reading types verified.`);

// Listening Traps
assert(courseData.listeningTraps, 'courseData.listeningTraps must exist');
assert(Array.isArray(courseData.listeningTraps.qualifiers.words), 'listeningTraps.qualifiers words must be array');
assert(Array.isArray(courseData.listeningTraps.negativeReversals.connectors), 'listeningTraps.negativeReversals connectors must be array');
assert(Array.isArray(courseData.listeningTraps.selfCorrections.phrases), 'listeningTraps.selfCorrections phrases must be array');
console.log('[PASS] courseData.listeningTraps verified.');

// Writing Formulas
assert(courseData.writingFormulas, 'courseData.writingFormulas must exist');
assert(courseData.writingFormulas.task1OverviewRule, 'task1OverviewRule must exist');
assert(Array.isArray(courseData.writingFormulas.task1Types) && courseData.writingFormulas.task1Types.length >= 5, 'task1Types must have >= 5 visual types');
assert(courseData.writingFormulas.task2ParagraphFormula, 'task2ParagraphFormula must exist');
assert(Array.isArray(courseData.writingFormulas.task2ParagraphFormula.sentences), 'task2ParagraphFormula.sentences must be array');
assert(Array.isArray(courseData.writingFormulas.task2Architectures) && courseData.writingFormulas.task2Architectures.length >= 5, 'task2Architectures must have 5 architectures');
console.log('[PASS] courseData.writingFormulas verified.');

// Speaking Models
assert(Array.isArray(courseData.speakingModels) && courseData.speakingModels.length > 0, 'courseData.speakingModels must be non-empty array');
console.log(`[PASS] courseData.speakingModels: ${courseData.speakingModels.length} models verified.`);

// Test 4: Verify DiagnosticEngine Class Logic
console.log('--- Verifying DiagnosticEngine TypeScript Module ---');
const SRC = path.join(__dirname, '..', 'src');
const diagTsCode = fs.readFileSync(path.join(SRC, 'ielts', 'diagnostic-engine.ts'), 'utf8');
const compiledDiag = ts.transpileModule(diagTsCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText;

// Mock localStorage for node environment
const storageMock = {};
global.localStorage = {
  getItem: k => (k in storageMock ? storageMock[k] : null),
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: k => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

const diagModule = { exports: {} };
new Function('module', 'exports', 'require', compiledDiag)(diagModule, diagModule.exports, require);
const { DiagnosticEngine } = diagModule.exports;
assert(typeof DiagnosticEngine.evaluateDiagnostic === 'function', 'evaluateDiagnostic must be static function');
assert(typeof DiagnosticEngine.saveDiagnosticProfile === 'function', 'saveDiagnosticProfile must be static function');
assert(typeof DiagnosticEngine.getDiagnosticProfile === 'function', 'getDiagnosticProfile must be static function');

// 4a: Perfect score evaluation
const perfectAnswers = {};
courseData.diagnostics.forEach(q => {
  perfectAnswers[q.id] = q.correctIndex;
});
const perfectReport = DiagnosticEngine.evaluateDiagnostic(perfectAnswers, courseData.diagnostics);
assert.strictEqual(perfectReport.score, courseData.diagnostics.length);
assert.strictEqual(perfectReport.percentage, 100);
assert.strictEqual(perfectReport.bandEstimate, 'Band 7.5+');
assert.strictEqual(perfectReport.flawsDetected.length, 0);
assert.strictEqual(perfectReport.checklistItems.length, 0);
console.log('[PASS] DiagnosticEngine: 100% score evaluation verified (Band 7.5+, 0 flaws).');

// 4b: Diagnostic with flaws in subject_verb, tenses, and articles
const flawedAnswers = { ...perfectAnswers };
// Deliberately fail subject_verb (diag-01) and tenses (diag-02) and articles (diag-03)
flawedAnswers['diag-01'] = (courseData.diagnostics[0].correctIndex + 1) % 4;
flawedAnswers['diag-02'] = (courseData.diagnostics[1].correctIndex + 1) % 4;
flawedAnswers['diag-03'] = (courseData.diagnostics[2].correctIndex + 1) % 4;

const flawedReport = DiagnosticEngine.evaluateDiagnostic(flawedAnswers, courseData.diagnostics);
assert.strictEqual(flawedReport.score, courseData.diagnostics.length - 3);
assert(flawedReport.flawsDetected.length >= 3, `Expected at least 3 flaws detected, got ${flawedReport.flawsDetected.length}`);
assert(flawedReport.checklistItems.length >= 3, `Expected at least 3 checklist items, got ${flawedReport.checklistItems.length}`);

const detectedSubTypes = new Set(flawedReport.flawsDetected.map(f => f.subType));
assert(detectedSubTypes.has('subject_verb'), 'subject_verb flaw must be detected');
assert(detectedSubTypes.has('tenses'), 'tenses flaw must be detected');
assert(detectedSubTypes.has('articles'), 'articles flaw must be detected');
console.log(`[PASS] DiagnosticEngine: Flaws detected for ${Array.from(detectedSubTypes).join(', ')}.`);

// 4c: Storage persistence round-trip
DiagnosticEngine.saveDiagnosticProfile(flawedReport);
const restoredReport = DiagnosticEngine.getDiagnosticProfile();
assert(restoredReport !== null, 'Restored report must not be null');
assert.strictEqual(restoredReport.score, flawedReport.score);
assert.strictEqual(restoredReport.percentage, flawedReport.percentage);
assert.strictEqual(restoredReport.flawsDetected.length, flawedReport.flawsDetected.length);
console.log('[PASS] DiagnosticEngine: Storage serialization & retrieval round-trip verified.');

console.log('--- ALL COMPILER & DIAGNOSTIC ENGINE TESTS PASSED CLEANLY ---');
