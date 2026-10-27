const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

console.log('=== Verifying IELTS Reading Data & Limit Invariants (Rule 18) ===\n');

const SRC = path.join(__dirname, '..', 'src', 'ielts');

function loadModule(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

const scoring = loadModule('scoring.ts');
const engine = loadModule('reading-engine.ts', {
  './scoring': scoring,
  './types': {}
});

const { isWithinLimit, resolveQuestionWordConstraint } = engine;
const readingData = require('../src/ielts/data/reading.json');

assert(Array.isArray(readingData) && readingData.length >= 30, 'readingData must contain at least 30 passages');

let totalQuestions = 0;
let completionQuestions = 0;
let evidenceCount = 0;
let silentCount = 0;

readingData.forEach((passage, pIdx) => {
  assert(passage.id, `Passage at index ${pIdx} missing id`);
  assert(Array.isArray(passage.paragraphs) && passage.paragraphs.length > 0, `Passage ${passage.id} has no paragraphs`);
  assert(Array.isArray(passage.questions) && passage.questions.length > 0, `Passage ${passage.id} has no questions`);

  passage.questions.forEach((q, qIdx) => {
    totalQuestions++;
    const isCompletion = ['complete', 'sentence', 'summary', 'table', 'short'].includes(q.type);

    // 1. Check word constraints & accepted answers
    const constraint = resolveQuestionWordConstraint(q);
    if (isCompletion) {
      completionQuestions++;
      assert(constraint, `Question ${q.id} of type ${q.type} must have a resolved word constraint`);
      const acceptedAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];
      acceptedAnswers.forEach(ans => {
        const ok = isWithinLimit(ans, constraint.maxWords, constraint.allowNumber);
        assert(ok, `Question ${q.id} accepted answer "${ans}" violates word constraint (${constraint.maxWords} words, allowNumber=${constraint.allowNumber})`);
      });
    }

    // 2. Check evidence anchors
    if (q.evidence !== undefined) {
      if (q.evidence === null) {
        silentCount++;
      } else {
        evidenceCount++;
        const { paraIndex, start, end, evidenceText } = q.evidence;
        assert(
          typeof paraIndex === 'number' && paraIndex >= 0 && paraIndex < passage.paragraphs.length,
          `Question ${q.id} evidence paraIndex ${paraIndex} is out of bounds (0..${passage.paragraphs.length - 1})`
        );
        const paraText = passage.paragraphs[paraIndex].text;
        assert(
          typeof start === 'number' && typeof end === 'number' && start >= 0 && end <= paraText.length && start <= end,
          `Question ${q.id} evidence range [${start}, ${end}] out of paragraph length ${paraText.length}`
        );
        if (evidenceText !== undefined) {
          const actualSlice = paraText.slice(start, end);
          assert.strictEqual(
            actualSlice,
            evidenceText,
            `Question ${q.id} evidence text mismatch!\nExpected: "${evidenceText}"\nActual:   "${actualSlice}"`
          );
        }
      }
    }
  });
});

console.log(`Verified ${readingData.length} passages, ${totalQuestions} questions:`);
console.log(`- ${completionQuestions} completion questions checked: 100% within limits`);
console.log(`- ${evidenceCount} evidence anchors verified with zero text slice mismatches`);
console.log(`- ${silentCount} NOT GIVEN questions marked with null evidence`);
console.log('\n=== All IELTS Reading Invariants Verified Successfully! ===');
