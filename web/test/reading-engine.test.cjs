const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

console.log('=== Running IELTS Reading Engine Unit Tests ===\n');

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

const {
  parseWordConstraint,
  countWordsAndNumbers,
  countWords,
  isWithinLimit,
  resolveQuestionWordConstraint,
  explainMiss,
  mergeHighlightRanges,
  getParagraphSlices
} = engine;

// 1. parseWordConstraint
console.log('1. Testing parseWordConstraint...');
assert.deepStrictEqual(parseWordConstraint('NO MORE THAN ONE WORD'), { maxWords: 1, allowNumber: false });
assert.deepStrictEqual(parseWordConstraint('NO MORE THAN ONE WORD AND/OR A NUMBER'), { maxWords: 1, allowNumber: true });
assert.deepStrictEqual(parseWordConstraint('Write NO MORE THAN TWO WORDS in each space'), { maxWords: 2, allowNumber: false });
assert.deepStrictEqual(parseWordConstraint('NO MORE THAN TWO WORDS AND/OR A NUMBER'), { maxWords: 2, allowNumber: true });
assert.deepStrictEqual(parseWordConstraint('NO MORE THAN THREE WORDS'), { maxWords: 3, allowNumber: false });
assert.deepStrictEqual(parseWordConstraint('NO MORE THAN THREE WORDS AND/OR A NUMBER'), { maxWords: 3, allowNumber: true });
assert.deepStrictEqual(parseWordConstraint('A NUMBER ONLY'), { maxWords: 0, allowNumber: true });
assert.deepStrictEqual(parseWordConstraint('ONE NUMBER ONLY'), { maxWords: 0, allowNumber: true });
assert.deepStrictEqual(parseWordConstraint('ONE WORD ONLY'), { maxWords: 1, allowNumber: false });
assert.deepStrictEqual(parseWordConstraint('Choose ONE WORD AND/OR A NUMBER from the passage'), { maxWords: 1, allowNumber: true });
assert.strictEqual(parseWordConstraint('Choose the correct letter A, B, C or D'), null);
console.log('   ✓ parseWordConstraint passed.');

// 2. isWithinLimit
console.log('2. Testing isWithinLimit & token counting...');
assert.strictEqual(isWithinLimit('anything at all', null), true);
assert.strictEqual(isWithinLimit('', 2, false), true);
assert.strictEqual(isWithinLimit('   ', 1, false), true);

// 2 words max, no number
assert.strictEqual(isWithinLimit('printing press', 2, false), true);
assert.strictEqual(isWithinLimit('the printing press', 2, false), false);
assert.strictEqual(isWithinLimit('1440', 2, false), false); // number not allowed

// 2 words max, allow number
assert.strictEqual(isWithinLimit('1440', 2, true), true);
assert.strictEqual(isWithinLimit('1440 press', 2, true), true);
assert.strictEqual(isWithinLimit('1440 and 1455', 2, true), false); // two numbers not allowed (only 1)
assert.strictEqual(isWithinLimit('the large 1440 press', 2, true), false); // 3 words > 2

// A number only (0 words, 1 number)
assert.strictEqual(isWithinLimit('1450', 0, true), true);
assert.strictEqual(isWithinLimit('year 1450', 0, true), false); // 1 word > 0

// Percentages and decimals
assert.strictEqual(isWithinLimit('80%', 0, true), true);
assert.strictEqual(isWithinLimit('12.5', 0, true), true);

// Large numbers with multiple commas and trailing punctuation
assert.strictEqual(isWithinLimit('1,000,000', 0, true), true);
assert.strictEqual(isWithinLimit('1440.', 0, true), true);
assert.strictEqual(isWithinLimit('$30', 0, true), true);
assert.strictEqual(isWithinLimit('£50', 0, true), true);
assert.strictEqual(isWithinLimit('10-15', 0, true), true);
assert.strictEqual(isWithinLimit('100,000 people', 2, true), true);
console.log('   ✓ isWithinLimit passed.');

// 3. explainMiss
console.log('3. Testing explainMiss...');
const qLimit2 = {
  id: 'q1',
  type: 'complete',
  prompt: 'Write NO MORE THAN TWO WORDS: The machine used ______ type.',
  answer: 'movable metal',
  why: 'Paragraph A: movable metal type',
  maxWords: 2,
  allowNumber: false
};

assert.strictEqual(explainMiss(qLimit2, 'movable metal'), 'correct');
assert.strictEqual(explainMiss(qLimit2, 'MOVABLE METAL'), 'correct');
assert.strictEqual(explainMiss(qLimit2, 'used movable metal'), 'exceeded_limit'); // contains answer but 3 words
assert.strictEqual(explainMiss(qLimit2, 'wooden blocks'), 'wrong');
assert.strictEqual(explainMiss(qLimit2, 'wooden blocks and metal screws'), 'wrong'); // 5 words, but does not contain answer

const qArrayAns = {
  id: 'q2',
  type: 'sentence',
  prompt: 'Complete with ONE WORD ONLY: It took ______ to write.',
  answer: ['months', 'many months'],
  why: 'Paragraph A: take months',
  maxWords: 1,
  allowNumber: false
};
assert.strictEqual(explainMiss(qArrayAns, 'months'), 'correct');
assert.strictEqual(explainMiss(qArrayAns, 'several months'), 'exceeded_limit');
assert.strictEqual(explainMiss(qArrayAns, 'years'), 'wrong');

// Substring false-positive prevention: 'art' should not trigger on 'smart'
const qArt = {
  id: 'q3',
  type: 'complete',
  prompt: 'ONE WORD ONLY: It was a form of ______.',
  answer: 'art',
  why: 'Paragraph A: work of art',
  maxWords: 1,
  allowNumber: false
};
assert.strictEqual(explainMiss(qArt, 'a smart solution for the entire problem'), 'wrong'); // 7 words, 'smart' contains 'art' but is not 'art'
assert.strictEqual(explainMiss(qArt, 'beautiful work of art'), 'exceeded_limit'); // contains whole token 'art'
console.log('   ✓ explainMiss passed.');

// 4. mergeHighlightRanges
console.log('4. Testing mergeHighlightRanges...');
assert.deepStrictEqual(mergeHighlightRanges([]), []);
assert.deepStrictEqual(mergeHighlightRanges([{ paraIndex: 0, start: 10, end: 5 }]), []); // invalid start >= end

const disjoint = [
  { paraIndex: 0, start: 0, end: 5 },
  { paraIndex: 0, start: 10, end: 15 }
];
assert.deepStrictEqual(mergeHighlightRanges(disjoint), disjoint);

const overlapping = [
  { paraIndex: 0, start: 0, end: 10 },
  { paraIndex: 0, start: 5, end: 15 }
];
assert.deepStrictEqual(mergeHighlightRanges(overlapping), [{ paraIndex: 0, start: 0, end: 15 }]);

const contiguous = [
  { paraIndex: 0, start: 0, end: 5 },
  { paraIndex: 0, start: 5, end: 10 }
];
assert.deepStrictEqual(mergeHighlightRanges(contiguous), [{ paraIndex: 0, start: 0, end: 10 }]);

const multiPara = [
  { paraIndex: 1, start: 0, end: 5 },
  { paraIndex: 0, start: 5, end: 10 },
  { paraIndex: 0, start: 8, end: 12 }
];
assert.deepStrictEqual(mergeHighlightRanges(multiPara), [
  { paraIndex: 0, start: 5, end: 12 },
  { paraIndex: 1, start: 0, end: 5 }
]);
console.log('   ✓ mergeHighlightRanges passed.');

// 5. getParagraphSlices (boundary projection)
console.log('5. Testing getParagraphSlices...');
const text = 'Johannes Gutenberg invented the printing press.';
const userMarks = [{ paraIndex: 0, start: 9, end: 18 }]; // 'Gutenberg'
const transientEvidence = { paraIndex: 0, start: 19, end: 27 }; // 'invented'

const slices = getParagraphSlices(text, userMarks, transientEvidence);
assert.strictEqual(slices.map(s => s.text).join(''), text, 'Slices must reconstruct the exact original text');

// Slices should be:
// 1. [0, 9] 'Johannes ' (neither)
// 2. [9, 18] 'Gutenberg' (mark)
// 3. [18, 19] ' ' (neither)
// 4. [19, 27] 'invented' (evidence)
// 5. [27, 47] ' the printing press.' (neither)
assert.strictEqual(slices[0].text, 'Johannes ');
assert.strictEqual(slices[0].isMark, false);
assert.strictEqual(slices[0].isEvidence, false);

assert.strictEqual(slices[1].text, 'Gutenberg');
assert.strictEqual(slices[1].isMark, true);
assert.strictEqual(slices[1].isEvidence, false);

assert.strictEqual(slices[3].text, 'invented');
assert.strictEqual(slices[3].isMark, false);
assert.strictEqual(slices[3].isEvidence, true);

// Test overlapping mark & evidence
const overlappingEvidence = { paraIndex: 0, start: 15, end: 27 }; // 'berg invented'
const overlapSlices = getParagraphSlices(text, userMarks, overlappingEvidence);
assert.strictEqual(overlapSlices.map(s => s.text).join(''), text);
const overlapSection = overlapSlices.find(s => s.start === 15 && s.end === 18);
assert(overlapSection, 'Overlap slice [15, 18] exists');
assert.strictEqual(overlapSection.text, 'erg');
assert.strictEqual(overlapSection.isMark, true);
assert.strictEqual(overlapSection.isEvidence, true);
console.log('   ✓ getParagraphSlices passed.\n');

console.log('=== All IELTS Reading Engine Unit Tests Passed! ===');
