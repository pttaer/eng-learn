// Verification suite for Listening Trap & Oral Self-Correction Audio Lab (ENG-117)
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

console.log('--- Verifying Listening Trap & Oral Self-Correction Audio Lab (ENG-117) ---');

// 1. Load DistractorEngine
const { DistractorEngine } = load('distractor-engine.ts');
assert(DistractorEngine, 'DistractorEngine must be exported');

// 2. Load listening-traps module
const mockUi = {
  esc: s => s,
  h: (tag, cls, content) => ({ tag, cls, content, append() {}, addEventListener() {} })
};
const mockTts = {
  playText: () => ({ stop: () => {} }),
  ttsAvailable: () => true
};
const mockAudio = {
  AudioSynthesizer: { play: () => {} }
};
const mockProgress = {
  addAttempt: () => {}
};

const trapsMod = load('views/listening-traps.ts', {
  '../ui': mockUi,
  '../tts': mockTts,
  '../distractor-engine': { DistractorEngine },
  '../../core/audio-synthesizer': mockAudio,
  '../../utils/icons': { icon: () => '<svg></svg>' },
  '../progress': mockProgress
});

assert(trapsMod.TRAP_SCENARIOS, 'TRAP_SCENARIOS array must be exported');
assert(typeof trapsMod.listeningTrapsView === 'function', 'listeningTrapsView must be exported as a function');

const scenarios = trapsMod.TRAP_SCENARIOS;
console.log(`[SUITE 1] Scenario Corpus & Structure Validation (${scenarios.length} scenarios)...`);
assert.strictEqual(scenarios.length, 12, 'Must contain exactly 12 synthesized audio scenarios');

const categories = {
  self_correction: 0,
  qualifier: 0,
  reversal: 0,
  map_direction: 0
};
const sections = new Set();

scenarios.forEach((s, idx) => {
  assert(s.id, `Scenario #${idx} missing id`);
  assert(s.section >= 1 && s.section <= 4, `Scenario ${s.id} invalid section: ${s.section}`);
  assert(s.category in categories, `Scenario ${s.id} unknown category: ${s.category}`);
  categories[s.category]++;
  sections.add(s.section);

  assert(s.title && s.title.length > 5, `Scenario ${s.id} title too short`);
  assert(s.script && s.script.length > 30, `Scenario ${s.id} script too short: ${s.script}`);
  assert(s.question && s.question.length > 10, `Scenario ${s.id} question too short`);
  assert(s.targetAnswer && s.targetAnswer.length > 0, `Scenario ${s.id} missing targetAnswer`);
  assert(s.maxWords >= 1 && s.maxWords <= 3, `Scenario ${s.id} invalid maxWords: ${s.maxWords}`);
  assert(s.decoy && s.decoy.length > 0, `Scenario ${s.id} missing decoy`);
  assert(s.trapCue && s.trapCue.length > 0, `Scenario ${s.id} missing trapCue`);
  assert(s.explanation && s.explanation.length > 20, `Scenario ${s.id} explanation too short`);
  assert(s.keinoRule && s.keinoRule.includes('Rule'), `Scenario ${s.id} keinoRule must cite pedagogical rule`);
});

assert.strictEqual(categories.self_correction, 3, 'Must have exactly 3 oral self-correction scenarios');
assert.strictEqual(categories.qualifier, 3, 'Must have exactly 3 qualifier trap scenarios');
assert.strictEqual(categories.reversal, 3, 'Must have exactly 3 reversal trap scenarios');
assert.strictEqual(categories.map_direction, 3, 'Must have exactly 3 map navigation direction scenarios');
assert.strictEqual(sections.size, 4, 'Must span all 4 listening sections (1, 2, 3, 4)');

console.log('✓ Suite 1 passed (12 scenarios across 4 categories and Sections 1–4 fully verified)');

// 3. Automated Trap Detection Across All 12 Scenarios
console.log('[SUITE 2] DistractorEngine Trap Detection Across All 12 Audio Scenarios...');

scenarios.forEach(s => {
  const detected = DistractorEngine.detectTraps(s.script);
  assert(
    detected.riskLevel === 'medium' || detected.riskLevel === 'high',
    `Scenario ${s.id} (${s.title}) should have medium/high trap risk, got: ${detected.riskLevel}`
  );

  switch (s.category) {
    case 'self_correction':
      assert(
        detected.selfCorrections.length >= 1,
        `Scenario ${s.id} must detect oral self-correction cues in: "${s.script}". Detected: ${JSON.stringify(detected)}`
      );
      break;
    case 'qualifier':
      assert(
        detected.qualifiers.length >= 1,
        `Scenario ${s.id} must detect qualifier traps in: "${s.script}". Detected: ${JSON.stringify(detected)}`
      );
      break;
    case 'reversal':
      assert(
        detected.reversals.length >= 1,
        `Scenario ${s.id} must detect reversal traps in: "${s.script}". Detected: ${JSON.stringify(detected)}`
      );
      break;
    case 'map_direction':
      assert(
        (detected.mapDirections && detected.mapDirections.length >= 1) || detected.reversals.length >= 1 || detected.selfCorrections.length >= 1,
        `Scenario ${s.id} must detect navigational direction cues in: "${s.script}". Detected: ${JSON.stringify(detected)}`
      );
      break;
  }
});

console.log('✓ Suite 2 passed (All 12 audio scenarios trigger target trap detection)');

// 4. Exact-Word Validation & Decoy Rejection Across All 12 Scenarios
console.log('[SUITE 3] Exact-Word Validation and Decoy Rejection...');

scenarios.forEach(s => {
  // 1. Correct targetAnswer must pass
  const validRes = DistractorEngine.validateExactWord(s.targetAnswer, s.targetAnswer, s.maxWords);
  assert.strictEqual(
    validRes.valid,
    true,
    `Scenario ${s.id} targetAnswer "${s.targetAnswer}" should be valid: ${validRes.reason}`
  );

  // 2. Target found in full script must pass
  const scriptMatchRes = DistractorEngine.validateExactWord(s.targetAnswer, s.script, s.maxWords);
  assert.strictEqual(
    scriptMatchRes.valid,
    true,
    `Scenario ${s.id} targetAnswer "${s.targetAnswer}" should match within script: ${scriptMatchRes.reason}`
  );

  // 3. Decoy must fail
  const decoyRes = DistractorEngine.validateExactWord(s.decoy, s.targetAnswer, s.maxWords);
  assert.strictEqual(
    decoyRes.valid,
    false,
    `Scenario ${s.id} decoy "${s.decoy}" must be rejected against target "${s.targetAnswer}"`
  );

  // 4. Suffix inflection must be rejected
  const singleTargetWord = s.targetAnswer.split(' ')[0];
  const inflectedWord = singleTargetWord.endsWith('e') ? singleTargetWord.slice(0, -1) + 'ing' : singleTargetWord + 's';
  const inflectedRes = DistractorEngine.validateExactWord(inflectedWord, s.targetAnswer, s.maxWords);
  assert.strictEqual(
    inflectedRes.valid,
    false,
    `Scenario ${s.id} inflected word "${inflectedWord}" should be rejected`
  );
  assert(
    inflectedRes.reason && inflectedRes.reason.includes('morphological inflection'),
    `Scenario ${s.id} should give inflection reason for "${inflectedWord}": ${inflectedRes.reason}`
  );
});

console.log('✓ Suite 3 passed (Exact-word matches validated, decoys and inflections strictly rejected)');

// 5. Navigation & UI Integration Validation
console.log('[SUITE 4] Routing and UI Integration Checks...');

const mainCode = fs.readFileSync(path.join(SRC, 'main.ts'), 'utf8');
assert(mainCode.includes('listening-traps'), 'main.ts must register listening-traps route');
assert(mainCode.includes('listeningTrapsView'), 'main.ts must import listeningTrapsView');

const listeningCode = fs.readFileSync(path.join(SRC, 'views', 'listening.ts'), 'utf8');
assert(listeningCode.includes('#listening-traps'), 'listening.ts must link to #listening-traps');
assert(listeningCode.includes('ie-lab-banner'), 'listening.ts must include lab banner');

const cssCode = fs.readFileSync(path.join(SRC, 'ielts.css'), 'utf8');
assert(cssCode.includes('ie-trap-waveform'), 'ielts.css must style waveform canvas');
assert(cssCode.includes('ie-trap-spotter-grid'), 'ielts.css must style trap spotter grid');
assert(cssCode.includes('ie-keino-rule-box'), 'ielts.css must style Keino Campbell rule card');
assert(cssCode.includes('ie-lab-banner'), 'ielts.css must style lab banner');

console.log('✓ Suite 4 passed (Navigation routes, views, and CSS definitions verified)');

console.log('\n========================================');
console.log('All 4 test suites passed with 100% success!');
console.log('========================================');
