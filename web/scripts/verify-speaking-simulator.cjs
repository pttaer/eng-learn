// Verification suite for Speaking 3-Part Examiner Simulator (ENG-119)
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

console.log('--- Verifying Speaking 3-Part Examiner Simulator (ENG-119) ---');

// Mock UI and Web Audio dependencies if needed
const mockUi = {
  h: () => ({ append: () => {}, querySelector: () => null, querySelectorAll: () => [], style: {}, addEventListener: () => {} }),
  esc: (s) => s,
  fmtTime: (s) => `${s}`,
  countdown: () => ({ stop: () => {}, left: () => 0 }),
  bandBadge: () => ''
};

const mockTts = {
  playText: () => ({ stop: () => {} }),
  ttsAvailable: () => true
};

const mockAcoustic = {
  AcousticEngine: class {
    init() { return Promise.resolve(true); }
    startRecording() { return Promise.resolve(); }
    stopRecording() { return Promise.resolve(null); }
    dispose() {}
  }
};

const simModule = load('views/speaking-simulator.ts', {
  '../ui': mockUi,
  '../tts': mockTts,
  '../../core/acoustic-engine': mockAcoustic,
  '../../core/i18n': { t: (k, p, d) => d || k, I18n: { getLocale: () => 'en', onLocaleChange: () => () => {} } }
});

const {
  SpeakingSimulatorEngine,
  PART1_PROMPTS,
  CONVERSATIONAL_FILLERS,
  COMPARATIVE_DECONSTRUCTIONS
} = simModule;

assert(SpeakingSimulatorEngine, 'SpeakingSimulatorEngine must be exported');

// ============================================================================
// SUITE 1: Part 1 Interactive Drill Validation
// ============================================================================
console.log('[SUITE 1] Testing Part 1 Direct Answer + Extension formula...');

// 1.1 Empty / whitespace
const emptyRes = SpeakingSimulatorEngine.validatePart1Response('   ');
assert.strictEqual(emptyRes.valid, false, 'Empty answer must be invalid');
assert.strictEqual(emptyRes.status, 'truncated', 'Empty answer must have status truncated');
assert.strictEqual(emptyRes.scoreEstimate, 'Band 5.0', 'Empty answer must be capped at Band 5.0');

// 1.2 1-Word Truncation
const oneWordRes = SpeakingSimulatorEngine.validatePart1Response('London.');
assert.strictEqual(oneWordRes.valid, false, '1-word answer must be invalid');
assert.strictEqual(oneWordRes.status, 'truncated', '1-word answer must be flagged as truncated');
assert.strictEqual(oneWordRes.wordCount, 1);
assert.strictEqual(oneWordRes.scoreEstimate, 'Band 5.0');

// 1.3 Minimal 1-Sentence Truncation (< 15 words)
const shortRes = SpeakingSimulatorEngine.validatePart1Response('I like reading books in my free time.');
assert.strictEqual(shortRes.valid, false, 'Single short sentence must be invalid in Part 1');
assert.strictEqual(shortRes.status, 'truncated');

// 1.4 Rambling Monologue (> 85 words or > 4 sentences)
const ramblingText = 'Yes, I definitely like reading books very much indeed. In fact, since my early childhood my mother always purchased many novels and encyclopedias for me to enjoy every single evening. Furthermore, when I went to primary school my teachers always commended me on my reading speed and comprehension because I spent hours in the library studying various subjects like geography, physics, history, philosophy, and languages. Nowadays, although I work full time in an intense corporate consulting position, I still try to read at least fifty pages every single night before going to bed, and on weekends I visit second-hand bookstores in the city center to browse vintage collections with my friends.';
const ramblingRes = SpeakingSimulatorEngine.validatePart1Response(ramblingText);
assert.strictEqual(ramblingRes.valid, false, 'Rambling monologue must be rejected');
assert.strictEqual(ramblingRes.status, 'rambling');
assert.strictEqual(ramblingRes.scoreEstimate, 'Band 6.0');

// 1.5 Well-calibrated 2–3 Sentence Extension (Band 7.0+)
const goodP1Text = 'Yes, it has transformed substantially over the past decade. The local government has invested heavily in modern transit systems and green parks. Because of this, it is far more cosmopolitan than when I was growing up.';
const goodP1Res = SpeakingSimulatorEngine.validatePart1Response(goodP1Text);
assert.strictEqual(goodP1Res.valid, true, 'Proper 2-3 sentence response must be valid');
assert.strictEqual(goodP1Res.status, 'acceptable');
assert(goodP1Res.sentenceCount >= 2 && goodP1Res.sentenceCount <= 4, 'Sentence count should be 2–4');
assert(goodP1Res.scoreEstimate === 'Band 8.0+' || goodP1Res.scoreEstimate === 'Band 7.0+', 'Should estimate high band');
console.log('  ✓ Part 1 truncation, rambling, and extension rules verified.');

// ============================================================================
// SUITE 2: Part 2 Cue Card Laboratory (4-Keyword Notepad)
// ============================================================================
console.log('[SUITE 2] Testing Part 2 4-Keyword Notepad validation...');

// 2.1 Incomplete quadrants (< 3 filled)
const sparseNotepad = ['Pivot to tech', '', '', ''];
const sparseRes = SpeakingSimulatorEngine.validatePart2Notepad(sparseNotepad);
assert.strictEqual(sparseRes.valid, false, 'Sparse notepad must be invalid');
assert.strictEqual(sparseRes.filledCount, 1);

// 2.2 Overly verbose quadrants (> 6 words per bullet)
const verboseNotepad = [
  'I decided to leave my accounting job because it was extremely dull and unfulfilling',
  'Enrolled in a six-month intensive coding academy while working nights',
  'Experienced intense financial hardship and stress about whether I would succeed',
  'Secured a front-end engineering position with substantial compensation'
];
const verboseRes = SpeakingSimulatorEngine.validatePart2Notepad(verboseNotepad);
assert.strictEqual(verboseRes.valid, false, 'Verbose notepad with full sentences must be invalid');
assert.strictEqual(verboseRes.isConcise, false, 'Should be flagged as not concise');
assert(verboseRes.feedback.length >= 2, 'Should provide bullet length warnings');

// 2.3 Correct 4-Keyword Shorthand (<= 6 words per bullet, >= 3 filled)
const conciseNotepad = [
  'Pivot finance to tech startup',
  'Resigned corporate audit job',
  'Acute financial precarity & doubt',
  'Fulfilling engineering career outcome'
];
const conciseRes = SpeakingSimulatorEngine.validatePart2Notepad(conciseNotepad);
assert.strictEqual(conciseRes.valid, true, 'Concise 4-keyword notepad must validate');
assert.strictEqual(conciseRes.filledCount, 4);
assert.strictEqual(conciseRes.isConcise, true);
console.log('  ✓ Part 2 4-keyword notepad conciseness and quadrant counts verified.');

// ============================================================================
// SUITE 3: Part 3 Abstract Justification & Conversational Fillers Drill
// ============================================================================
console.log('[SUITE 3] Testing Part 3 Fillers Engine & Discourse Validation...');

// 3.1 Filler detection
const fillerSample = 'Well, that is an intriguing inquiry. From what I have observed in recent times, it largely hinges upon government subsidies. To put it into broader perspective, automation accelerates.';
const fillerMatches = SpeakingSimulatorEngine.detectFillers(fillerSample);
assert(fillerMatches.count >= 4, `Expected at least 4 filler matches, got ${fillerMatches.count}`);
assert(fillerMatches.matches.some(m => m.includes('intriguing')), 'Should detect intriguing inquiry filler');
assert(fillerMatches.matches.some(m => m.includes('observed')), 'Should detect observed in recent times filler');
assert(fillerMatches.matches.some(m => m.includes('hinges')), 'Should detect hinges upon filler');
assert(fillerMatches.matches.some(m => m.includes('broader perspective')), 'Should detect broader perspective filler');

// 3.2 Part 3 validation: Incomplete / short
const shortP3 = 'I think AI is good for work.';
const shortP3Res = SpeakingSimulatorEngine.validatePart3Response(shortP3);
assert.strictEqual(shortP3Res.valid, false, 'Too short response should be invalid');

// 3.3 Part 3 validation: High-band abstract response with fillers, causal link, and nuance
const strongP3Text = 'Well, that is an intriguing inquiry. From what I have observed in recent times, artificial intelligence will inevitably transform broader societal employment structures. This dynamic is primarily driven by corporate imperatives to reduce overhead through automated algorithmic systems. Nevertheless, that said, one must also account for the emergent vocations in regulatory oversight and ethics that invariably counterbalance displacement.';
const strongP3Res = SpeakingSimulatorEngine.validatePart3Response(strongP3Text);
assert.strictEqual(strongP3Res.valid, true, 'Well-developed Part 3 response must be valid');
assert.strictEqual(strongP3Res.hasGeneralization, true, 'Must detect societal generalization');
assert.strictEqual(strongP3Res.hasCausalMechanism, true, 'Must detect causal mechanism ("driven by")');
assert.strictEqual(strongP3Res.hasNuance, true, 'Must detect nuance ("Nevertheless, that said")');
assert(strongP3Res.fillerCount >= 1, 'Must detect conversational fillers');
assert.strictEqual(strongP3Res.scoreEstimate, 'Band 8.0+', 'Should attain Band 8.0+ score estimate');
console.log('  ✓ Part 3 filler detection and abstract discourse structure verified.');

// ============================================================================
// SUITE 4: Comparative Deconstruction Data & Catalogs
// ============================================================================
console.log('[SUITE 4] Verifying Catalogs and Comparative Deconstructions...');

assert(PART1_PROMPTS.length >= 4, 'Should contain at least 4 Part 1 prompts');
assert(CONVERSATIONAL_FILLERS.length >= 6, 'Should contain at least 6 conversational fillers');
assert(COMPARATIVE_DECONSTRUCTIONS.length >= 3, 'Should contain at least 3 comparative deconstruction cases (P1, P2, P3)');

COMPARATIVE_DECONSTRUCTIONS.forEach(c => {
  assert(['Part 1', 'Part 2', 'Part 3'].includes(c.part), `Invalid part in case: ${c.part}`);
  ['6.5', '7.5', '8.5'].forEach(band => {
    const m = c.models[band];
    assert(m, `Missing Band ${band} model in case ${c.id}`);
    assert(m.transcript && m.transcript.length > 50, `Transcript too short in ${c.id} Band ${band}`);
    assert(m.fcScore && m.fcAnalysis, `Missing FC score/analysis in ${c.id} Band ${band}`);
    assert(m.lrScore && m.lrAnalysis, `Missing LR score/analysis in ${c.id} Band ${band}`);
    assert(m.graScore && m.graAnalysis, `Missing GRA score/analysis in ${c.id} Band ${band}`);
    assert(m.prScore && m.prAnalysis, `Missing PR score/analysis in ${c.id} Band ${band}`);
    assert(m.keyFeatures && m.keyFeatures.length >= 2, `Missing key features in ${c.id} Band ${band}`);
  });
});
console.log('  ✓ All 3 parts comparative deconstruction models (Band 6.5, 7.5, 8.5) validated.');

console.log('\n--- ALL SPEAKING EXAMINER SIMULATOR INVARIANTS SATISFIED (ENG-119) ---');
