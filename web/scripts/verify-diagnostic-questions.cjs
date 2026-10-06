// web/scripts/verify-diagnostic-questions.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const CONTENT_PATH = path.join(__dirname, '..', 'content', 'diagnostic', 'diagnostic-questions.md');
const DATA_PATH = path.join(__dirname, '..', 'src', 'assets', 'data', 'diagnostic-questions.json');
const COMPILER_PATH = path.join(__dirname, 'compile-content.cjs');

console.log('[TEST] Starting Multi-Skill Diagnostic Assessment Question Bank Verification...');

// 1. Verify source file and compiled JSON existence
assert(fs.existsSync(CONTENT_PATH), `Missing markdown source: ${CONTENT_PATH}`);
assert(fs.existsSync(DATA_PATH), `Missing compiled JSON: ${DATA_PATH}`);

// 2. Verify compiler export and execution
const compiler = require(COMPILER_PATH);
assert(typeof compiler.compileDiagnostic === 'function', 'compile-content.cjs must export compileDiagnostic');
compiler.compileDiagnostic();

// 3. Load compiled JSON
const questions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
assert(Array.isArray(questions), 'diagnostic-questions.json must be an array');
assert.strictEqual(questions.length, 30, `Expected exactly 30 questions, got ${questions.length}`);

// 4. Validate CEFR levels and skills distribution
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const EXPECTED_SKILLS = ['vocab', 'collocation', 'grammar', 'reading', 'writing'];
const STAGE_MAP = {
  vocab: 1,
  collocation: 1,
  grammar: 2,
  reading: 3,
  writing: 5
};

const levelCounts = {};
const skillCounts = {};
const answerCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
const seenIds = new Set();

questions.forEach((q, idx) => {
  const itemRef = `[Item ${idx + 1}: ${q.id || 'NO_ID'}]`;

  // ID validation
  assert(typeof q.id === 'string' && q.id.trim().length > 0, `${itemRef} id must be non-empty string`);
  assert(!seenIds.has(q.id), `${itemRef} duplicate ID detected: ${q.id}`);
  seenIds.add(q.id);

  // Level validation
  assert(CEFR_LEVELS.includes(q.level), `${itemRef} invalid CEFR level: ${q.level}`);
  levelCounts[q.level] = (levelCounts[q.level] || 0) + 1;

  // Skill & Stage validation
  assert(EXPECTED_SKILLS.includes(q.skill), `${itemRef} invalid skill: ${q.skill}`);
  skillCounts[q.skill] = (skillCounts[q.skill] || 0) + 1;
  assert.strictEqual(q.stage, STAGE_MAP[q.skill], `${itemRef} stage mismatch for skill ${q.skill}`);

  // String field validations (Zero empty fields)
  ['prompt', 'context', 'explanation', 'vietnamese'].forEach(field => {
    assert(
      typeof q[field] === 'string' && q[field].trim().length > 0,
      `${itemRef} field '${field}' must be a non-empty string`
    );
  });

  // Vietnamese translation quality check (diacritics presence)
  const hasVietnameseMarks = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(q.vietnamese);
  assert(hasVietnameseMarks, `${itemRef} vietnamese field lacks proper diacritics: "${q.vietnamese}"`);

  // Options validation (Strict 4 options, no duplicates, distractor parity)
  assert(Array.isArray(q.options), `${itemRef} options must be an array`);
  assert.strictEqual(q.options.length, 4, `${itemRef} must have exactly 4 options`);

  const uniqueOptions = new Set();
  q.options.forEach((opt, optIdx) => {
    assert(typeof opt === 'string' && opt.trim().length > 0, `${itemRef} option ${optIdx} is empty`);
    assert(!uniqueOptions.has(opt.trim().toLowerCase()), `${itemRef} duplicate option: "${opt}"`);
    uniqueOptions.add(opt.trim().toLowerCase());
  });

  // Answer validation
  assert(
    typeof q.answer === 'number' && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4,
    `${itemRef} answer index must be integer in [0, 3], got ${q.answer}`
  );
  assert(
    q.options[q.answer] !== undefined && q.options[q.answer].trim().length > 0,
    `${itemRef} resolved answer option must not be undefined or empty`
  );
  answerCounts[q.answer] = (answerCounts[q.answer] || 0) + 1;
});

// 5. Assert distribution invariants
CEFR_LEVELS.forEach(level => {
  assert.strictEqual(
    levelCounts[level],
    5,
    `Expected exactly 5 questions for level ${level}, got ${levelCounts[level]}`
  );
});

EXPECTED_SKILLS.forEach(skill => {
  assert.strictEqual(
    skillCounts[skill],
    6,
    `Expected exactly 6 questions for skill ${skill}, got ${skillCounts[skill]}`
  );
});

// 6. Assert balanced answer distribution across 0, 1, 2, 3 (no answer key bias)
for (let i = 0; i < 4; i++) {
  assert(
    answerCounts[i] >= 5,
    `Answer position ${i} under-represented (count: ${answerCounts[i]} < 5)`
  );
}

// 7. Verify Markdown source code fence matches data
const rawMd = fs.readFileSync(CONTENT_PATH, 'utf8').replace(/\r\n/g, '\n');
const match = rawMd.match(/```json\n([\s\S]*?)\n```/);
assert(match, 'diagnostic-questions.md must contain a ```json ``` code fence');
const mdData = JSON.parse(match[1]);
assert.strictEqual(mdData.length, 30, 'Markdown JSON block must contain 30 questions');
assert.deepStrictEqual(mdData, questions, 'Compiled JSON must match Markdown source JSON exactly');

console.log('[TEST] PASSED: All 30 multi-skill diagnostic questions pass schema, distractor parity, and distribution checks.');
console.log(`[TEST] Levels: ${JSON.stringify(levelCounts)}`);
console.log(`[TEST] Skills: ${JSON.stringify(skillCounts)}`);
console.log(`[TEST] Answer key distribution: ${JSON.stringify(answerCounts)}`);
