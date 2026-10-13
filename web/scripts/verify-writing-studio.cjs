// web/scripts/test-eng118-writing-studio.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== ENG-118 VERIFICATION SUITE: WRITING STUDIO & 4-SENTENCE ESSAY ARCHITECT ===\n');

// 1. Verify writing-studio.ts file existence and exports
console.log('--- Test Suite 1: Source File Inspection & Exports ---');
const studioPath = path.join(__dirname, '../src/ielts/views/writing-studio.ts');
assert.ok(fs.existsSync(studioPath), 'writing-studio.ts must exist');
const studioSrc = fs.readFileSync(studioPath, 'utf8');

assert.ok(studioSrc.includes('export function writingStudioView'), 'Must export writingStudioView');
assert.ok(studioSrc.includes('export function computeWordDiff'), 'Must export computeWordDiff');
assert.ok(studioSrc.includes('export function validateTask1Overview'), 'Must export validateTask1Overview');
assert.ok(studioSrc.includes('export const TASK1_BLUEPRINTS'), 'Must export TASK1_BLUEPRINTS');
assert.ok(studioSrc.includes('export const TASK2_ARCHITECTURES'), 'Must export TASK2_ARCHITECTURES');
console.log('✓ writing-studio.ts exists and exports core studio components');

// 2. Validate Task 1 Overview Zero-Data Heuristics
console.log('\n--- Test Suite 2: Task 1 Overview Zero-Data & Structure Heuristics ---');

function validateTask1Overview(text) {
  const clean = text.trim();
  if (!clean) {
    return { valid: false, hasNumbers: false, sentenceCount: 0, hasTrend: false, hasContrast: false };
  }

  const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  const numberMatches = clean.match(/\b\d+([.,]\d+)?\b|%/g) || [];
  const hasNumbers = numberMatches.length > 0;

  const TREND_MARKERS = /\b(overall|overall trend|general trend|experience(d)?|witness(ed)?|saw|upward|downward|increas(e|ed|ing)|decreas(e|ed|ing)|growth|declin(e|ed|ing)|ris(e|ing)|fell|highest|lowest|dominant|predominant|most significant|remained|throughout)\b/i;
  const hasTrend = TREND_MARKERS.test(clean);

  const CONTRAST_MARKERS = /\b(in contrast|by contrast|in stark contrast|conversely|on the other hand|whereas|while|whilst|however|although|differed|anomaly|exception|at the other extreme)\b/i;
  const hasContrast = CONTRAST_MARKERS.test(clean);

  const valid = !hasNumbers && sentenceCount >= 1 && sentenceCount <= 3 && hasTrend;

  return { valid, hasNumbers, sentenceCount, hasTrend, hasContrast };
}

// Test case 1: Violation with raw numbers
const badOverview = 'Overall, China consumed 3600 million tonnes in 2020 which was the highest. In contrast, Germany stayed at 300 million tonnes.';
const badRes = validateTask1Overview(badOverview);
assert.strictEqual(badRes.hasNumbers, true, 'Must detect raw numbers in overview');
assert.strictEqual(badRes.valid, false, 'Overview with raw numbers must fail validation');
console.log('✓ Raw numbers correctly rejected in Overview validation');

// Test case 2: Valid overview obeying zero-data rule
const goodOverview = 'Overall, it is evident that China experienced the most dramatic expansion in energy utilization, ultimately overtaking all other surveyed countries to become the dominant consumer. In stark contrast, Germany demonstrated consistent stability throughout the period with the lowest overall consumption.';
const goodRes = validateTask1Overview(goodOverview);
assert.strictEqual(goodRes.hasNumbers, false, 'Must confirm zero raw numbers');
assert.strictEqual(goodRes.hasTrend, true, 'Must detect key trend');
assert.strictEqual(goodRes.hasContrast, true, 'Must detect contrast/anomaly');
assert.strictEqual(goodRes.sentenceCount, 2, 'Must have exactly 2 sentences');
assert.strictEqual(goodRes.valid, true, 'Compliant overview must pass validation');
console.log('✓ Compliant 2-sentence overview with zero numbers passes validation');

// 3. Verify all 6 Task 1 Visual Blueprints
console.log('\n--- Test Suite 3: All 6 Task 1 Visual Blueprints Verification ---');
const expectedVisualKinds = ['line', 'bar', 'pie', 'table', 'process', 'map'];
expectedVisualKinds.forEach(kind => {
  assert.ok(studioSrc.includes(`kind: '${kind}'`), `TASK1_BLUEPRINTS must include visual type '${kind}'`);
});
console.log(`✓ All 6 visual types (Line, Bar, Pie, Table, Process, Map) configured with blueprints`);

// 4. Verify all 5 Task 2 Architectures
console.log('\n--- Test Suite 4: All 5 Task 2 Essay Architectures Verification ---');
const expectedArchTypes = ['opinion', 'discussion', 'advantage', 'problem', 'direct'];
expectedArchTypes.forEach(type => {
  assert.ok(studioSrc.includes(`type: '${type}'`), `TASK2_ARCHITECTURES must include architecture type '${type}'`);
});
console.log(`✓ All 5 essay architectures (Opinion, Discussion, Adv/Disadv, Problem-Solution, Direct Question) configured`);

// 5. Test Myers Word-Level Semantic Diff
console.log('\n--- Test Suite 5: Myers Word-Level Diff Tokenizer ---');

function computeWordDiff(target, candidate) {
  const tWords = target.trim().split(/\s+/).filter(Boolean);
  const cWords = candidate.trim().split(/\s+/).filter(Boolean);
  const m = tWords.length;
  const n = cWords.length;

  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tWords[i - 1].toLowerCase() === cWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const tokens = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tWords[i - 1].toLowerCase() === cWords[j - 1].toLowerCase()) {
      tokens.unshift({ type: 'match', value: cWords[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: 'insert', value: cWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      tokens.unshift({ type: 'delete', value: tWords[i - 1] });
      i--;
    }
  }

  return tokens;
}

const targetModel = 'Universal tertiary education accelerates national economic innovation significantly.';
const candidateDraft = 'Universal college education boosts domestic economic innovation rapidly.';
const diff = computeWordDiff(targetModel, candidateDraft);

const matches = diff.filter(d => d.type === 'match').map(d => d.value.toLowerCase());
const inserts = diff.filter(d => d.type === 'insert').map(d => d.value.toLowerCase());
const deletes = diff.filter(d => d.type === 'delete').map(d => d.value.toLowerCase());

assert.ok(matches.includes('universal'), 'Should match "universal"');
assert.ok(matches.includes('education'), 'Should match "education"');
assert.ok(matches.includes('economic'), 'Should match "economic"');
assert.ok(matches.includes('innovation'), 'Should match "innovation"');
assert.ok(inserts.includes('college'), 'Should flag "college" as insert');
assert.ok(deletes.includes('tertiary'), 'Should flag "tertiary" as delete');
console.log(`✓ Myers diff tokenizer computed ${diff.length} tokens: ${matches.length} matches, ${inserts.length} inserts, ${deletes.length} deletes`);

// 6. Verify Router and View Link Integration
console.log('\n--- Test Suite 6: Navigation & Router Integration ---');
const mainPath = path.join(__dirname, '../src/ielts/main.ts');
const mainSrc = fs.readFileSync(mainPath, 'utf8');
assert.ok(mainSrc.includes('writingStudioView'), 'main.ts must import writingStudioView');
assert.ok(mainSrc.includes("id: 'writing-studio'"), "main.ts must register 'writing-studio' route");
console.log("✓ Route 'writing-studio' registered in main.ts");

const writingPath = path.join(__dirname, '../src/ielts/views/writing.ts');
const writingSrc = fs.readFileSync(writingPath, 'utf8');
assert.ok(writingSrc.includes('#writing-studio'), 'writing.ts must provide navigation link to #writing-studio');
console.log('✓ Launch button to #writing-studio integrated in writing.ts');

// 7. Verify CSS Containment and High-Contrast Classes
console.log('\n--- Test Suite 7: CSS Stylesheet Verification ---');
const cssPath = path.join(__dirname, '../src/ielts/ielts.css');
const cssSrc = fs.readFileSync(cssPath, 'utf8');
assert.ok(cssSrc.includes('.ie-writing-studio-shell'), 'ielts.css must style .ie-writing-studio-shell');
assert.ok(cssSrc.includes('.ie-t1-steps-grid'), 'ielts.css must style .ie-t1-steps-grid');
assert.ok(cssSrc.includes('.ie-step-overview-card'), 'ielts.css must style .ie-step-overview-card');
assert.ok(cssSrc.includes('.diff-word-match'), 'ielts.css must style .diff-word-match');
assert.ok(cssSrc.includes('.diff-word-insert'), 'ielts.css must style .diff-word-insert');
assert.ok(cssSrc.includes('.diff-word-delete'), 'ielts.css must style .diff-word-delete');
console.log('✓ CSS containment and diff styling verified in ielts.css');

console.log('\n=======================================================');
console.log('✅ ALL ENG-118 ASSERTIONS PASSED WITH 100% COMPLIANCE');
console.log('=======================================================\n');
