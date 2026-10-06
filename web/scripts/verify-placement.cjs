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

// placeLevel: highest level with >= 3 correct (PASS_MARK = 3 of 4), stopping at the first level that is not passed
assert.strictEqual(placement.placeLevel({}), 'A1', 'no answers places at A1');
assert.strictEqual(placement.placeLevel({ A1: 4, A2: 3, B1: 2 }), 'A2');
assert.strictEqual(placement.placeLevel({ A1: 4, A2: 2, B1: 4 }), 'A1', 'a failed level stops the climb');
assert.strictEqual(placement.placeLevel({ A1: 3, A2: 3, B1: 3, B2: 3, C1: 3, C2: 3 }), 'C2');
assert.strictEqual(placement.placeLevel({ A1: 2 }), 'A1');

// effectiveLevel: nearest level with content, tie goes to the lower level
const has = (...l) => new Set(l);
assert.strictEqual(cefr.effectiveLevel('A1', has('B1', 'B2')), 'B1');
assert.strictEqual(cefr.effectiveLevel('B2', has('B2')), 'B2');
assert.strictEqual(cefr.effectiveLevel('A2', has('A1', 'B1')), 'A1', 'tie goes to the lower level');

// buildQuestions: 4 per level (24 total: 1 Vocab, 1 Collocation, 1 Grammar, 1 Reading cloze),
// correct answer present exactly once, options unique, distractors from same tier, deterministic with a seeded rng
let seed = 7;
const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const words = [], phrases = [], grammar = [], reading = [];
for (const l of cefr.CEFR_ORDER) {
  for (let i = 0; i < 6; i++) {
    words.push({ cefrLevel: l, wordOrChunk: `${l}-w${i}`, contextSentence: 'ctx', vietnamese: `${l}-vn-w${i}` });
    phrases.push({ cefrLevel: l, phrase: `${l}-p${i}`, example: 'ex', vietnamese: `${l}-vn-p${i}` });
    grammar.push({ cefrLevel: l, promptSentence: `${l}-g-prompt-${i}`, targetTransformation: `${l}-g-target-${i}`, grammaticalCue: 'cue', vietnamese: `${l}-vn-g-${i}` });
    reading.push({
      cefrLevel: l,
      title: `${l} Article ${i}`,
      fourPassProtocol: {
        pass3SentenceMining: [
          { targetWord: `${l}-r-word-${i}`, contextSentence: `Context sentence for ${l}-r-word-${i}.`, vietnamese: `${l}-vn-r-${i}` }
        ]
      }
    });
  }
}
const qs = placement.buildQuestions(words, phrases, grammar, reading, rng);
assert.strictEqual(qs.length, 24, '4 questions x 6 levels = 24 questions');
for (const l of cefr.CEFR_ORDER) {
  const levelQs = qs.filter(q => q.level === l);
  assert.strictEqual(levelQs.length, 4, `expected 4 questions for level ${l}`);
  const kinds = levelQs.map(q => q.kind).sort();
  assert.deepStrictEqual(kinds, ['collocation', 'grammar', 'reading', 'vocab'], `all 4 skills must be present for level ${l}`);
}
for (const q of qs) {
  assert.strictEqual(q.options.length, 4, 'each question must have 4 options');
  assert.strictEqual(new Set(q.options).size, 4, 'options are distinct');
  assert(q.answer >= 0 && q.answer < 4, 'answer index in range');
  assert(q.options[q.answer].startsWith(q.level), 'correct option belongs to the question level');
  for (const opt of q.options) {
    assert(opt.startsWith(q.level), `distractor "${opt}" must sample within same CEFR level ${q.level}`);
  }
}

// real data: every level yields 4 questions covering all 4 skills (A1..C2 = 24 questions)
const data = n => JSON.parse(fs.readFileSync(path.join(SRC, 'assets', 'data', n), 'utf8'));
const real = placement.buildQuestions(data('vocabulary.json'), data('collocations.json'), data('grammar.json'), data('reading.json'));
assert.strictEqual(real.length, 24, 'real content supports a full 24-question placement');
for (const l of cefr.CEFR_ORDER) {
  const levelQs = real.filter(q => q.level === l);
  assert.strictEqual(levelQs.length, 4, `real data must have 4 questions for level ${l}`);
  const kinds = levelQs.map(q => q.kind).sort();
  assert.deepStrictEqual(kinds, ['collocation', 'grammar', 'reading', 'vocab'], `real data must cover all 4 skills for level ${l}`);
}

// storage source: v1 users are marked placement-done and keep B2; new users are not
const storage = fs.readFileSync(path.join(SRC, 'utils', 'storage.ts'), 'utf8');
assert(storage.includes("return isCefr(parsed.learnerLevel) ? parsed.learnerLevel : 'B2'"), 'v1 migration defaults to B2');
assert(storage.includes('placementDone: parsed.placementDone ?? !isCefr(parsed.learnerLevel)'), 'v1 users skip the placement quiz');
assert(storage.includes("placementDone: false"), 'new users start with placement pending');

console.log('PASSED: balanced 24-question multi-skill diagnostic placement engine verified cleanly');
