// Placement scoring and question building (core/placement.ts), plus the v1 -> v2 storage migration rules.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src');

function load(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

const cefr = load('core/cefr.ts');
const placement = load('core/placement.ts', { './cefr': cefr });

// placeLevel: highest level with >= 2 correct, stopping at the first level that is not passed
assert.strictEqual(placement.placeLevel({}), 'A1', 'no answers places at A1');
assert.strictEqual(placement.placeLevel({ A1: 3, A2: 2, B1: 1 }), 'A2');
assert.strictEqual(placement.placeLevel({ A1: 3, A2: 1, B1: 3 }), 'A1', 'a failed level stops the climb');
assert.strictEqual(placement.placeLevel({ A1: 2, A2: 2, B1: 3, B2: 3, C1: 2, C2: 2 }), 'C2');
assert.strictEqual(placement.placeLevel({ A1: 1 }), 'A1');

// effectiveLevel: nearest level with content, tie goes to the lower level
const has = (...l) => new Set(l);
assert.strictEqual(cefr.effectiveLevel('A1', has('B1', 'B2')), 'B1');
assert.strictEqual(cefr.effectiveLevel('B2', has('B2')), 'B2');
assert.strictEqual(cefr.effectiveLevel('A2', has('A1', 'B1')), 'A1', 'tie goes to the lower level');

// buildQuestions: 3 per level, correct answer present exactly once, options unique, deterministic with a seeded rng
let seed = 7;
const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const words = [], phrases = [];
for (const l of cefr.CEFR_ORDER) {
  for (let i = 0; i < 6; i++) {
    words.push({ cefrLevel: l, wordOrChunk: `${l}-w${i}`, contextSentence: 'ctx', vietnamese: `${l}-vn-w${i}` });
    phrases.push({ cefrLevel: l, phrase: `${l}-p${i}`, example: 'ex', vietnamese: `${l}-vn-p${i}` });
  }
}
const qs = placement.buildQuestions(words, phrases, rng);
assert.strictEqual(qs.length, 18, '3 questions x 6 levels');
for (const l of cefr.CEFR_ORDER) assert.strictEqual(qs.filter(q => q.level === l).length, 3);
for (const q of qs) {
  assert.strictEqual(q.options.length, 4);
  assert.strictEqual(new Set(q.options).size, 4, 'options are distinct');
  assert(q.answer >= 0 && q.answer < 4, 'answer index in range');
  assert(q.options[q.answer].startsWith(q.level), 'correct gloss belongs to the question level');
}

// real data: every level yields questions (A1..C2)
const data = n => JSON.parse(fs.readFileSync(path.join(SRC, 'assets', 'data', n), 'utf8'));
const real = placement.buildQuestions(data('vocabulary.json'), data('collocations.json'));
assert.strictEqual(real.length, 18, 'real content supports a full 18-question placement');

// storage source: v1 users are marked placement-done and keep B2; new users are not
const storage = fs.readFileSync(path.join(SRC, 'utils', 'storage.ts'), 'utf8');
assert(storage.includes("return isCefr(parsed.learnerLevel) ? parsed.learnerLevel : 'B2'"), 'v1 migration defaults to B2');
assert(storage.includes('placementDone: parsed.placementDone ?? !isCefr(parsed.learnerLevel)'), 'v1 users skip the placement quiz');
assert(storage.includes("placementDone: false"), 'new users start with placement pending');

console.log('PASSED: placement scoring, question building and storage migration rules');
