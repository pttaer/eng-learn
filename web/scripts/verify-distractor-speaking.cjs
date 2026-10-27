// Verification suite for DistractorEngine & Speaking Prep Simulator (ENG-112)
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src', 'ielts');
function load(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

console.log('--- Verifying DistractorEngine & Speaking Simulator (ENG-112) ---');

// 1. DistractorEngine unit tests
const { DistractorEngine } = load('distractor-engine.ts');
assert(DistractorEngine, 'DistractorEngine should be exported');

// Test Suite 1: Trap Detection
console.log('[SUITE 1] Testing DistractorEngine.detectTraps()...');

// Test qualifiers
const qText = 'You must always arrive on time, and only members can enter all rooms solely.';
const qRes = DistractorEngine.detectTraps(qText);
assert.strictEqual(qRes.riskLevel, 'high');
assert(qRes.qualifiers.includes('always'), 'Should detect "always"');
assert(qRes.qualifiers.includes('only'), 'Should detect "only"');
assert(qRes.qualifiers.includes('all'), 'Should detect "all"');
assert(qRes.qualifiers.includes('solely'), 'Should detect "solely"');
assert(qRes.qualifiers.includes('must'), 'Should detect "must"');

// Test reversals
const rText = 'The price was low; however, shipping was high. On the contrary, instead of saving money, we spent more.';
const rRes = DistractorEngine.detectTraps(rText);
assert.strictEqual(rRes.riskLevel, 'high');
assert(rRes.reversals.includes('however'), 'Should detect "however"');
assert(rRes.reversals.includes('on the contrary'), 'Should detect "on the contrary"');
assert(rRes.reversals.includes('instead'), 'Should detect "instead"');

// Test oral self-corrections
const scText = 'The train leaves at 4:30. No, wait, actually it departs at 4:45, or rather 4:50.';
const scRes = DistractorEngine.detectTraps(scText);
assert.strictEqual(scRes.riskLevel, 'high');
assert(scRes.selfCorrections.some(c => c.includes('wait')), 'Should detect "no, wait"');
assert(scRes.selfCorrections.includes('actually'), 'Should detect "actually"');
assert(scRes.selfCorrections.includes('rather') || scRes.selfCorrections.includes('or rather'), 'Should detect "rather"');

// Test combination self-correction + reversal triggering high risk
const comboText = 'The fee is fifteen pounds, but actually it is twenty.';
const comboRes = DistractorEngine.detectTraps(comboText);
assert.strictEqual(comboRes.riskLevel, 'high', 'Reversal + self-correction should yield high risk');
assert(comboRes.reversals.includes('but'), 'Should detect "but"');
assert(comboRes.selfCorrections.includes('actually'), 'Should detect "actually"');

// Test clean/low text
const cleanText = 'The library provides quiet study desks on the second floor.';
const cleanRes = DistractorEngine.detectTraps(cleanText);
assert.strictEqual(cleanRes.riskLevel, 'low');
assert.strictEqual(cleanRes.qualifiers.length, 0);
assert.strictEqual(cleanRes.reversals.length, 0);
assert.strictEqual(cleanRes.selfCorrections.length, 0);

// Test single trap -> medium risk
const medText = 'He never visited the exhibition.';
const medRes = DistractorEngine.detectTraps(medText);
assert.strictEqual(medRes.riskLevel, 'medium');
assert.strictEqual(medRes.qualifiers.length, 1);

console.log('✓ Suite 1 passed (Trap detection & risk categorization verified)');

// Test Suite 2: Exact-Word Validation
console.log('[SUITE 2] Testing DistractorEngine.validateExactWord()...');

// Empty input
const empRes = DistractorEngine.validateExactWord('', 'solar energy', 2);
assert.strictEqual(empRes.valid, false);
assert(empRes.reason.includes('Empty'), 'Should flag empty input');

// Word count exceeded
const wcRes = DistractorEngine.validateExactWord('large commercial solar energy system', 'solar energy', 2);
assert.strictEqual(wcRes.valid, false);
assert(wcRes.reason.includes('Exceeds maximum word count of 2'), 'Should flag exceeded word count');

// Exact direct match
const exactRes = DistractorEngine.validateExactWord('solar energy', 'solar energy', 2);
assert.strictEqual(exactRes.valid, true);

// Exact match with punctuation / casing
const punctRes = DistractorEngine.validateExactWord('Solar Energy!', 'solar energy', 2);
assert.strictEqual(punctRes.valid, true);

// Exact match within a passage sentence
const passRes = DistractorEngine.validateExactWord('library', 'The local library will open at nine in the morning.', 1);
assert.strictEqual(passRes.valid, true);

// Morphological inflections - plural suffix -s
const sRes = DistractorEngine.validateExactWord('books', 'book', 1);
assert.strictEqual(sRes.valid, false);
assert(sRes.reason.includes('Invalid morphological inflection'), 'Should reject plural -s');
assert(sRes.reason.includes('-s'), 'Should specify suffix -s');

// Morphological inflections - plural suffix -ies
const iesRes = DistractorEngine.validateExactWord('libraries', 'The local library will open at nine in the morning.', 1);
assert.strictEqual(iesRes.valid, false);
assert(iesRes.reason.includes('Invalid morphological inflection'), 'Should reject -ies on library');

// Morphological inflections - derivation -tion
const tionRes = DistractorEngine.validateExactWord('preservation', 'preserve', 1);
assert.strictEqual(tionRes.valid, false);
assert(tionRes.reason.includes('Invalid morphological inflection'), 'Should reject -tion on preserve');

// Morphological inflections - adverb -ly
const lyRes = DistractorEngine.validateExactWord('quickly', 'quick', 1);
assert.strictEqual(lyRes.valid, false);
assert(lyRes.reason.includes('Invalid morphological inflection'), 'Should reject -ly on quick');

// Morphological inflections - gerund -ing with consonant doubling
const ingRes = DistractorEngine.validateExactWord('stopping', 'stop', 1);
assert.strictEqual(ingRes.valid, false);
assert(ingRes.reason.includes('Invalid morphological inflection'), 'Should reject -ing on stop');

// Unrelated mismatch
const unmatchRes = DistractorEngine.validateExactWord('apple', 'banana', 1);
assert.strictEqual(unmatchRes.valid, false);
assert(unmatchRes.reason.includes('does not match'), 'Should report mismatch');

console.log('✓ Suite 2 passed (Exact-word validation and inflection rejection verified)');

// Test Suite 3: Speaking Comparative Models
console.log('[SUITE 3] Testing Speaking Comparative Models & Notepad Logic...');

// Load speaking.ts
const speakingCode = fs.readFileSync(path.join(SRC, 'views', 'speaking.ts'), 'utf8');

// Assert key enhancements exist in code
assert(speakingCode.includes('getComparativeModels'), 'speaking.ts should export getComparativeModels');
assert(speakingCode.includes('ie-notepad'), 'speaking.ts should contain ie-notepad class');
assert(speakingCode.includes('ie-notes-scratchpad'), 'speaking.ts should contain ie-notes-scratchpad class');
assert(speakingCode.includes('ie-prep-card'), 'speaking.ts should contain ie-prep-card class');
assert(speakingCode.includes('Band 6.5'), 'speaking.ts should feature Band 6.5 model');
assert(speakingCode.includes('Band 7.5'), 'speaking.ts should feature Band 7.5 model');
assert(speakingCode.includes('Band 8.5'), 'speaking.ts should feature Band 8.5 model');
assert(speakingCode.includes('playText'), 'speaking.ts should call playText for audio synthesis');

// Load speaking module helper in mock environment
const mockUi = {
  bandBadge: () => '',
  countdown: (s, tick, done) => ({ stop: () => {} }),
  esc: s => s,
  fmtTime: s => '01:00',
  h: (tag, cls, content) => ({ tag, cls, content, append() {}, addEventListener() {} })
};
const mockAcoustic = {
  AcousticEngine: class { init() { return Promise.resolve(true); } }
};

const speakingMod = load('views/speaking.ts', {
  '../data/speaking.json': require('../src/ielts/data/speaking.json'),
  '../ui': mockUi,
  '../../core/acoustic-engine': mockAcoustic,
  '../../utils/icons': { icon: () => '<svg></svg>' },
  '../tts': { playText: () => ({ stop: () => {} }), ttsAvailable: () => true },
  './speaking-simulator': { speakingSimulatorView: () => () => {} },
  '../progress': { addAttempt: () => {} },
  '../fluency': { fluency: () => null, fluencyNote: () => '' },
  '../writing-heuristics': { DESCRIPTORS: {}, RUBRIC: { speaking: [] } },
  '../../core/i18n': { t: (k, p, d) => d || k, I18n: { getLocale: () => 'en', onLocaleChange: () => () => {} } }
});



assert(typeof speakingMod.getComparativeModels === 'function', 'getComparativeModels must be a function');

const testCard = {
  id: 's2-test',
  cue: 'Describe a public library you have visited.',
  bullets: ['where it was', 'how often you visited', 'what you did there', 'and explain why you liked it'],
  part3: ['Are libraries still important?'],
  modelAnswer: 'I would like to speak about the central municipal library in my city, which I have frequented for several years. It is an impressive architectural structure that provides extensive public resources and quiet study halls.'
};

const compModels = speakingMod.getComparativeModels(testCard);
assert.strictEqual(compModels.length, 3, 'Must return exactly 3 comparative models');
assert.strictEqual(compModels[0].band, '6.5', 'First model must be Band 6.5');
assert.strictEqual(compModels[1].band, '7.5', 'Second model must be Band 7.5');
assert.strictEqual(compModels[2].band, '8.5', 'Third model must be Band 8.5');

// Check Band 6.5 content & commentary
assert(compModels[0].text.length > 100, 'Band 6.5 model text must be substantial');
assert(compModels[0].commentary.includes('Fluency & Coherence'), 'Band 6.5 commentary must cover Fluency');
assert(compModels[0].commentary.includes('Lexical Resource'), 'Band 6.5 commentary must cover Lexical Resource');
assert(compModels[0].commentary.includes('Grammatical Range'), 'Band 6.5 commentary must cover Grammar');
assert(compModels[0].commentary.includes('Pronunciation'), 'Band 6.5 commentary must cover Pronunciation');

// Check Band 7.5 content
assert.strictEqual(compModels[1].text, testCard.modelAnswer, 'Band 7.5 should use candidate model answer');
assert(compModels[1].commentary.includes('Band 7.5'), 'Band 7.5 commentary must mention Band 7.5');

// Check Band 8.5 content
assert(compModels[2].text.length > 100, 'Band 8.5 model text must be substantial');
assert(compModels[2].commentary.includes('Band 8.5'), 'Band 8.5 commentary must mention Band 8.5');

console.log('✓ Suite 3 passed (Speaking comparative models & examiner commentary verified)');

// Test Suite 4: TTS Module enhancements
console.log('[SUITE 4] Testing TTS playText function...');
const ttsCode = fs.readFileSync(path.join(SRC, 'tts.ts'), 'utf8');
assert(ttsCode.includes('export function playText'), 'tts.ts must export playText function');

console.log('✓ Suite 4 passed (TTS playText export verified)');

console.log('\n========================================');
console.log('All 4 test suites passed with 100% success!');
console.log('========================================');
