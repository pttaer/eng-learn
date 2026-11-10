const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

console.log('=== Running Escape Path & World Englishes Verification Tests ===\n');

const CORE_DIR = path.join(__dirname, '..', 'src', 'core');
const IELTS_DIR = path.join(__dirname, '..', 'src', 'ielts');

function loadTs(fullPath, mockDeps = {}) {
  const raw = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(raw, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', transpiled)(mod, mod.exports, (name) => {
    if (mockDeps[name]) return mockDeps[name];
    if (name.startsWith('./') || name.startsWith('../')) {
      const resolved = path.resolve(path.dirname(fullPath), name);
      const candidates = [resolved + '.ts', resolved + '.js', resolved + '/index.ts'];
      for (const c of candidates) {
        if (fs.existsSync(c)) return loadTs(c, mockDeps);
      }
    }
    return {};
  });
  return mod.exports;
}

const mockStorage = {
  StorageManager: {
    recordError: () => {},
    getErrorRecords: () => []
  }
};

const mockAcoustic = {
  AcousticHaptics: {
    tap: () => {},
    flip: () => {},
    chime: () => {},
    nudge: () => {}
  }
};

const l1Mod = loadTs(path.join(CORE_DIR, 'l1-vietnamese-diagnostic.ts'), {
  '../utils/storage': mockStorage
});

const escapeMod = loadTs(path.join(CORE_DIR, 'escape-path-engine.ts'), {
  '../utils/storage': mockStorage,
  './audio-synthesizer': {}
});

const writingHeuristicsMod = loadTs(path.join(IELTS_DIR, 'writing-heuristics.ts'), {});

const { L1VietnameseDiagnosticEngine } = l1Mod;
const { EscapePathEngine, ESCAPE_SPOTTING_BANK, ESCAPE_JIGSAW_BANK, ESCAPE_PARAPHRASE_BANK, WORLD_ACCENTS_BANK, GHOST_WORDS_BANK } = escapeMod;
const { analyse } = writingHeuristicsMod;

// 1. Test L1 Vietnamese Diagnostic Engine Extensions
console.log('1. Testing L1 Vietnamese Diagnostic Engine extensions...');

const polysemyCheck = L1VietnameseDiagnosticEngine.analyzeSentence('Please open the light before entering.');
assert(polysemyCheck.some(f => f.type === 'FALSE_FRIEND_POLYSEMY'), 'Failed to detect FALSE_FRIEND_POLYSEMY in "open the light"');

const playCheck = L1VietnameseDiagnosticEngine.analyzeSentence('On Sundays, I usually play with my coworkers at the coffee shop.');
assert(playCheck.some(f => f.type === 'FALSE_FRIEND_POLYSEMY'), 'Failed to detect FALSE_FRIEND_POLYSEMY in "play with my coworkers"');

const clicheCheck = L1VietnameseDiagnosticEngine.analyzeSentence('Tourism plays an indispensable role in national economic recovery.');
assert(clicheCheck.some(f => f.type === 'CRAM_TEMPLATE_CLICHE'), 'Failed to detect CRAM_TEMPLATE_CLICHE in "plays an indispensable role"');

const bluntCheck = L1VietnameseDiagnosticEngine.analyzeSentence('I want you to send me the report right now.');
assert(bluntCheck.some(f => f.type === 'PRAGMATIC_OVER_BLUNTNESS'), 'Failed to detect PRAGMATIC_OVER_BLUNTNESS in "I want you to send"');

console.log('   ✓ L1 Vietnamese Diagnostic Engine extensions verified.\n');

// 2. Test IELTS Writing Heuristics Cliché Flagging
console.log('2. Testing IELTS Writing Heuristics cram-cliché detection...');

const sampleEssay = `In this day and age, technology plays an indispensable role in daily life. Taking all the aforementioned points into consideration, every coin has two sides. In a nutshell, we should be careful.`;
const report = analyse(sampleEssay, 2, 'Discuss technology impact');
assert(report.flags.some(f => f.includes('Cram-school cliché detected: "play an indispensable role"')), 'Failed to flag "play an indispensable role"');
assert(report.flags.some(f => f.includes('every coin has two sides')), 'Failed to flag "every coin has two sides"');
assert(report.flags.some(f => f.includes('Cram-school cliché detected: "in today\'s modern world"')), 'Failed to flag "in this day and age"');
assert(report.flags.some(f => f.includes('Cram-school cliché detected: "in a nutshell"')), 'Failed to flag "in a nutshell"');

console.log('   ✓ Writing Heuristics properly catches cram clichés.\n');

// 3. Test Escape Path Engine Paraphrase Evaluation
console.log('3. Testing EscapePathEngine.evaluateParaphrase...');

const item = ESCAPE_PARAPHRASE_BANK[0]; // "underpins"
const badAttemptCliche = 'The internet plays an indispensable role in our society because it underpins things.';
const evalBad = EscapePathEngine.evaluateParaphrase(badAttemptCliche, item);
assert.strictEqual(evalBad.passed, false);
assert(evalBad.feedback.includes('Forbidden cram-school cliché still present'));

const badAttemptNoKeyword = 'The internet is useful in modern life.';
const evalNoKey = EscapePathEngine.evaluateParaphrase(badAttemptNoKeyword, item);
assert.strictEqual(evalNoKey.passed, false);
assert(evalNoKey.feedback.includes('Must include the catalyst keyword'));

const goodAttempt = 'The internet underpins virtually all contemporary communication.';
const evalGood = EscapePathEngine.evaluateParaphrase(goodAttempt, item);
assert.strictEqual(evalGood.passed, true);
assert(evalGood.wordReductionPct > 50);

console.log('   ✓ EscapePathEngine.evaluateParaphrase verified.\n');

// 4. Test Seed Banks Integrity
console.log('4. Testing Seed Banks integrity...');

assert(ESCAPE_SPOTTING_BANK.length >= 6, `Expected >=6 spotting drills, got ${ESCAPE_SPOTTING_BANK.length}`);
assert(ESCAPE_JIGSAW_BANK.length >= 4, `Expected >=4 jigsaw drills, got ${ESCAPE_JIGSAW_BANK.length}`);
assert(ESCAPE_PARAPHRASE_BANK.length >= 4, `Expected >=4 paraphrase drills, got ${ESCAPE_PARAPHRASE_BANK.length}`);
assert(WORLD_ACCENTS_BANK.length >= 2, `Expected >=2 accent scenarios, got ${WORLD_ACCENTS_BANK.length}`);
assert(GHOST_WORDS_BANK.length >= 3, `Expected >=3 ghost word drills, got ${GHOST_WORDS_BANK.length}`);

// Verify all accent comparison items contain US, UK, AU, and IN cadences
for (const scenario of WORLD_ACCENTS_BANK) {
  assert(scenario.cadences.us, `${scenario.id} missing US cadence`);
  assert(scenario.cadences.uk, `${scenario.id} missing UK cadence`);
  assert(scenario.cadences.au, `${scenario.id} missing AU cadence`);
  assert(scenario.cadences.in, `${scenario.id} missing IN cadence`);
}

console.log('   ✓ All Seed Banks contain complete, valid datasets.\n');

console.log('=== ALL ESCAPE PATH & WORLD ENGLISHES TESTS PASSED ===');
