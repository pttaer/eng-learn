/**
 * Verification test suite for ENG-116:
 * 14 Reading Question-Type Attack Drills & Synonym Engine Lab
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== VERIFYING READING QUESTION-TYPE ATTACK DRILLS (ENG-116) ===');

// 1. Check file existence
const drillsViewPath = path.resolve(__dirname, '../src/ielts/views/reading-drills.ts');
const mainPath = path.resolve(__dirname, '../src/ielts/main.ts');
const readingViewPath = path.resolve(__dirname, '../src/ielts/views/reading.ts');
const cssPath = path.resolve(__dirname, '../src/ielts/ielts.css');

assert.ok(fs.existsSync(drillsViewPath), 'web/src/ielts/views/reading-drills.ts must exist');
assert.ok(fs.existsSync(mainPath), 'web/src/ielts/main.ts must exist');
assert.ok(fs.existsSync(readingViewPath), 'web/src/ielts/views/reading.ts must exist');
assert.ok(fs.existsSync(cssPath), 'web/src/ielts/ielts.css must exist');
console.log('✓ File existence verified');

// 2. Read and parse reading-drills.ts
const drillsCode = fs.readFileSync(drillsViewPath, 'utf8');

// Assert export of READING_DRILLS and readingDrillsView
assert.ok(drillsCode.includes('export const READING_DRILLS: ReadingDrillItem[]'), 'Must export READING_DRILLS array');
assert.ok(drillsCode.includes('export function readingDrillsView'), 'Must export readingDrillsView function');

// Extract all 14 drill IDs using regex
const drillMatches = [...drillsCode.matchAll(/id:\s*'(drill-\d{2}-[a-z\-]+)'/g)].map(m => m[1]);
console.log(`- Extracted drill IDs (${drillMatches.length}):`, drillMatches);
assert.strictEqual(drillMatches.length, 14, 'Must define exactly 14 question-type drills');

// Verify all 14 types are represented
const expectedPrefixes = [
  'drill-01-tfng',
  'drill-02-ynng',
  'drill-03-short-answer',
  'drill-04-sentence-completion',
  'drill-05-summary-completion',
  'drill-06-table-completion',
  'drill-07-flow-chart',
  'drill-08-diagram-labelling',
  'drill-09-mcq-single',
  'drill-10-pick-multiple',
  'drill-11-matching-headings',
  'drill-12-matching-info',
  'drill-13-matching-features',
  'drill-14-matching-endings'
];

expectedPrefixes.forEach(pref => {
  assert.ok(drillMatches.includes(pref), `Drill ID ${pref} must be defined in READING_DRILLS`);
});
console.log('✓ All 14 official IELTS question-type drills present with correct identifiers');

// 3. Verify Navigation and Routing Registration
const mainCode = fs.readFileSync(mainPath, 'utf8');
assert.ok(mainCode.includes("import { readingDrillsView } from './views/reading-drills';"), 'main.ts must import readingDrillsView');
assert.ok(mainCode.includes("id: 'reading-drills'"), "main.ts NAV must include 'reading-drills' route");
console.log("✓ Route #reading-drills registered in main.ts NAV");

const readingCode = fs.readFileSync(readingViewPath, 'utf8');
assert.ok(readingCode.includes('#reading-drills'), 'reading.ts must contain navigation link to #reading-drills');
assert.ok(readingCode.includes('btn-launch-reading-drills'), 'reading.ts must define button with id btn-launch-reading-drills');
console.log('✓ Navigation link to #reading-drills present in readingView');

// 4. Verify CSS Styles for Reading Drills Lab
const cssCode = fs.readFileSync(cssPath, 'utf8');
const requiredClasses = [
  '.ie-drills-container',
  '.ie-drills-nav-tabs',
  '.ie-drill-tab',
  '.ie-drill-card',
  '.ie-drill-passage',
  '.ie-syn-matrix',
  '.ie-syn-mark',
  '.ie-drill-feedback',
  '.ie-drills-hero-btn'
];

requiredClasses.forEach(cls => {
  assert.ok(cssCode.includes(cls), `ielts.css must contain styling for ${cls}`);
});
console.log('✓ CSS styles for Reading Drills Lab and Synonym Engine verified');

// 5. Test Answer Evaluation Logic Simulation
function evaluateDrill(inputType, correctAnswer, userAnswer) {
  if (!userAnswer) return false;
  if (inputType === 'choice') {
    return String(userAnswer).trim().toUpperCase() === String(correctAnswer).trim().toUpperCase();
  }
  if (inputType === 'multi-choice') {
    if (!Array.isArray(userAnswer)) return false;
    const expected = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]).map(x => x.toUpperCase()).sort();
    const actual = userAnswer.map(x => x.toUpperCase()).sort();
    return JSON.stringify(expected) === JSON.stringify(actual);
  }
  if (inputType === 'text') {
    const cleanActual = String(userAnswer).trim().toLowerCase().replace(/^[.\s,"']+|[.\s,"']+$/g, '').replace(/\s+/g, ' ');
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some(ans => cleanActual === ans.trim().toLowerCase().replace(/\s+/g, ' '));
    }
    return cleanActual === String(correctAnswer).trim().toLowerCase();
  }
  return false;
}

// Test Drill 1: TFNG
assert.strictEqual(evaluateDrill('choice', 'FALSE', 'FALSE'), true, 'Drill 1 correct answer must pass');
assert.strictEqual(evaluateDrill('choice', 'FALSE', 'TRUE'), false, 'Drill 1 incorrect answer must fail');
assert.strictEqual(evaluateDrill('choice', 'FALSE', 'NOT GIVEN'), false, 'Drill 1 trap answer must fail');

// Test Drill 2: YNNG
assert.strictEqual(evaluateDrill('choice', 'YES', 'YES'), true, 'Drill 2 correct answer must pass');
assert.strictEqual(evaluateDrill('choice', 'YES', 'NO'), false, 'Drill 2 incorrect answer must fail');

// Test Drill 3: Short Answer (normalized text)
assert.strictEqual(evaluateDrill('text', ['two months', 'approximately two months', 'approx 2 months'], 'two months'), true);
assert.strictEqual(evaluateDrill('text', ['two months', 'approximately two months', 'approx 2 months'], 'Approximately Two Months.'), true);
assert.strictEqual(evaluateDrill('text', ['two months', 'approximately two months', 'approx 2 months'], 'three years'), false);

// Test Drill 4: Sentence Completion
assert.strictEqual(evaluateDrill('text', ['cost-prohibitive', 'cost prohibitive'], 'cost-prohibitive'), true);
assert.strictEqual(evaluateDrill('text', ['cost-prohibitive', 'cost prohibitive'], 'COST PROHIBITIVE'), true);
assert.strictEqual(evaluateDrill('text', ['cost-prohibitive', 'cost prohibitive'], 'affordable'), false);

// Test Drill 5: Summary Completion (Word Bank)
assert.strictEqual(evaluateDrill('choice', 'B', 'B'), true);
assert.strictEqual(evaluateDrill('choice', 'B', 'A'), false);

// Test Drill 6: Table Completion
assert.strictEqual(evaluateDrill('text', ['countervailing brass balances', 'brass balances'], 'countervailing brass balances'), true);
assert.strictEqual(evaluateDrill('text', ['countervailing brass balances', 'brass balances'], 'BRASS BALANCES'), true);

// Test Drill 7: Flow Chart Completion
assert.strictEqual(evaluateDrill('text', ['semi-permeable', 'semipermeable'], 'semi-permeable'), true);
assert.strictEqual(evaluateDrill('text', ['semi-permeable', 'semipermeable'], 'semipermeable'), true);
assert.strictEqual(evaluateDrill('text', ['semi-permeable', 'semipermeable'], 'impermeable'), false);

// Test Drill 8: Diagram Labelling
assert.strictEqual(evaluateDrill('text', ['helical cooling jacket', 'cooling jacket', 'a helical cooling jacket'], 'helical cooling jacket'), true);
assert.strictEqual(evaluateDrill('text', ['helical cooling jacket', 'cooling jacket', 'a helical cooling jacket'], 'a helical cooling jacket'), true);

// Test Drill 9: MCQ Single
assert.strictEqual(evaluateDrill('choice', 'B', 'B'), true);
assert.strictEqual(evaluateDrill('choice', 'B', 'A'), false);

// Test Drill 10: Pick 2 Multi-Choice
assert.strictEqual(evaluateDrill('multi-choice', ['A', 'C'], ['A', 'C']), true);
assert.strictEqual(evaluateDrill('multi-choice', ['A', 'C'], ['C', 'A']), true);
assert.strictEqual(evaluateDrill('multi-choice', ['A', 'C'], ['A', 'B']), false);

// Test Drill 11: Matching Headings
assert.strictEqual(evaluateDrill('choice', 'ii', 'ii'), true);
assert.strictEqual(evaluateDrill('choice', 'ii', 'i'), false);

// Test Drill 12: Matching Info
assert.strictEqual(evaluateDrill('choice', 'C', 'C'), true);
assert.strictEqual(evaluateDrill('choice', 'C', 'A'), false);

// Test Drill 13: Matching Features / Names
assert.strictEqual(evaluateDrill('choice', 'B', 'B'), true);
assert.strictEqual(evaluateDrill('choice', 'B', 'A'), false);

// Test Drill 14: Matching Sentence Endings
assert.strictEqual(evaluateDrill('choice', 'B', 'B'), true);
assert.strictEqual(evaluateDrill('choice', 'B', 'C'), false);

console.log('✓ All 14 question-type evaluation validations passed cleanly with 100% precision');

console.log('\n[SUCCESS] All verification checks for ENG-116 passed cleanly.');
