const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

console.log('=== Running IELTS Listening Micro-Dictation Lab Unit Tests ===\n');

const SRC = path.join(__dirname, '..', 'src', 'ielts');

function loadModule(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

const mockTts = {
  playSection: () => ({ stop: () => {} }),
  ttsAvailable: () => true,
  setPreferredAccent: () => {},
  getPreferredAccent: () => 'uk-rp',
  setExamRoomAmbience: () => {},
  isExamRoomAmbienceEnabled: () => false
};

const mockUi = {
  bandBadge: () => '<span class="badge"></span>',
  esc: (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  h: (tag, cls, inner) => {
    const el = {
      tagName: tag.toUpperCase(),
      className: cls || '',
      innerHTML: inner || '',
      children: [],
      childNodes: [],
      style: {},
      dataset: {},
      classList: {
        contains: (c) => (el.className || '').includes(c),
        add: (c) => { if (!el.className.includes(c)) el.className += ' ' + c; },
        remove: (c) => { el.className = el.className.replace(new RegExp('\\b' + c + '\\b', 'g'), '').trim(); },
        toggle: (c, val) => { if (val) el.classList.add(c); else el.classList.remove(c); }
      },
      append: (...items) => { el.children.push(...items); el.childNodes.push(...items); },
      appendChild: (item) => { el.children.push(item); el.childNodes.push(item); return item; },
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      focus: () => {}
    };
    return el;
  }
};

const mockAudio = {
  AcousticHaptics: {
    tap: () => {},
    flip: () => {},
    chime: () => {},
    nudge: () => {}
  }
};

const mockHaptic = {
  HapticEngine: {
    trigger: () => {}
  }
};

const mockI18n = {
  t: (k, p, d) => d || k
};

const mockDialog = {
  setIeltsTestInProgress: () => {}
};

const mockProgress = {
  addAttempt: () => {}
};

const mockBands = {
  rawToBand: () => 7.5
};

const mockQuestions = {
  renderQuestions: () => ({ el: mockUi.h('div', 'form'), reveal: () => ({ raw: 10, of: 10, byType: {}, wrong: [] }) }),
  typeBreakdown: () => ''
};

const listeningMod = loadModule('views/listening.ts', {
  '../data/listening.json': require('../src/ielts/data/listening.json'),
  '../types': {},
  '../bands': mockBands,
  '../progress': mockProgress,
  '../questions': mockQuestions,
  '../scoring': {},
  '../tts': mockTts,
  '../../core/audio-synthesizer': { AccentCadenceType: {} },
  '../ui': mockUi,
  './reading': {},
  '../../utils/icons': { icon: () => '<svg></svg>' },
  '../../utils/illustrations': { illustration: () => '<svg></svg>' },
  '../../core/i18n': mockI18n,
  '../confirm-dialog': mockDialog,
  '../../core/acoustic-haptics': mockAudio,
  '../../core/haptic-engine': mockHaptic
});

const { diffSentenceTokens, evidenceLineIndexes } = listeningMod;

// 1. diffSentenceTokens: Exact Match
console.log('1. Testing diffSentenceTokens: Exact Match');
const r1 = diffSentenceTokens('Good morning, can I help you?', 'good morning, can i help you?');
assert.strictEqual(r1.accuracy, 100);
assert.strictEqual(r1.matchedCount, 6);
assert.strictEqual(r1.totalTarget, 6);
assert(r1.targetTokens.every(t => t.status === 'matched'));
assert(r1.userTokens.every(t => t.status === 'matched'));
console.log('   ✓ Exact match passed with 100% accuracy.');

// 2. diffSentenceTokens: Case and Punctuation Agnostic
console.log('2. Testing diffSentenceTokens: Case and Punctuation Agnostic');
const r2 = diffSentenceTokens('Welcome to the South-West Tour, Mr. Davis!', 'welcome to the southwest tour mr davis');
assert.strictEqual(r2.accuracy, 100);
assert.strictEqual(r2.matchedCount, 7);
console.log('   ✓ Case and punctuation differences ignored correctly.');

// 3. diffSentenceTokens: Smart quotes and apostrophes
console.log('3. Testing diffSentenceTokens: Smart quotes normalization');
const r3 = diffSentenceTokens('“We haven’t got any spare rooms,” she said.', '"We haven\'t got any spare rooms," she said.');
assert.strictEqual(r3.accuracy, 100);
console.log('   ✓ Smart quotes normalized correctly.');

// 4. diffSentenceTokens: Missing words
console.log('4. Testing diffSentenceTokens: Missing words');
const r4 = diffSentenceTokens('The library opens at nine and closes at five.', 'the library opens at nine closes at five');
// 'and' is missing
assert.strictEqual(r4.matchedCount, 8);
assert.strictEqual(r4.totalTarget, 9);
assert.strictEqual(r4.accuracy, 89);
const missingWord = r4.targetTokens.find(t => t.status === 'missing');
assert(missingWord && missingWord.word === 'and');
console.log('   ✓ Missing word identified with status missing.');

// 5. diffSentenceTokens: Extra words
console.log('5. Testing diffSentenceTokens: Extra / Incorrect words');
const r5 = diffSentenceTokens('Please sign your name here.', 'please definitely sign your name right here');
assert.strictEqual(r5.accuracy, 100);
const extraWords = r5.userTokens.filter(t => t.status === 'extra');
assert.strictEqual(extraWords.length, 2);
assert.deepStrictEqual(extraWords.map(w => w.word), ['definitely', 'right']);
console.log('   ✓ Extra words detected with status extra.');

// 6. diffSentenceTokens: Empty user input
console.log('6. Testing diffSentenceTokens: Empty user input');
const r6 = diffSentenceTokens('Sample text for listening.', '');
assert.strictEqual(r6.accuracy, 0);
assert.strictEqual(r6.matchedCount, 0);
assert.strictEqual(r6.totalTarget, 4);
assert(r6.targetTokens.every(t => t.status === 'missing'));
console.log('   ✓ Empty input yields 0% accuracy.');

// 7. evidenceLineIndexes validation
console.log('7. Testing evidenceLineIndexes extraction');
const listeningData = require('../src/ielts/data/listening.json');
const sec1 = listeningData[0];
const allQIds = new Set(sec1.questions.map(q => q.id));
const evIndexes = evidenceLineIndexes(sec1, allQIds);
assert(evIndexes instanceof Set);
assert(evIndexes.size > 0, 'Section 1 should contain key evidence lines from question whys');
console.log(`   ✓ Section 1 evidence lines identified: ${evIndexes.size} key lines.`);

console.log('\n======================================================');
console.log('All Listening Micro-Dictation Lab Unit Tests Passed!');
console.log('======================================================');
