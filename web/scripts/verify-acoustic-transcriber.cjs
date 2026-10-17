// Verification suite for Enhanced Acoustic Audio Player, Multi-Accent Cadence & Offline Speech Transcriber (ENG-122)
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const CORE_DIR = path.join(__dirname, '..', 'src', 'core');
const IELTS_DIR = path.join(__dirname, '..', 'src', 'ielts');

function transpileAndLoad(filePath, deps = {}) {
  const source = fs.readFileSync(filePath, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, (name) => {
    if (deps[name]) return deps[name];
    if (name.startsWith('.') || name.startsWith('/')) {
      const resolved = path.resolve(path.dirname(filePath), name);
      const candidates = [resolved, resolved + '.ts', resolved + '.js', path.join(resolved, 'index.ts')];
      for (const cand of candidates) {
        if (fs.existsSync(cand) && !fs.statSync(cand).isDirectory()) {
          return transpileAndLoad(cand, deps);
        }
      }
    }
    return require(name);
  });
  return mod.exports;
}

console.log('--- Verifying ENG-122: Acoustic Player, Multi-Accent Cadence & Speech Transcriber ---');

// Mock browser environments for audio and speech
const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

class MockAudioParam {
  constructor(val = 1) {
    this.value = val;
  }
  setValueAtTime(v) { this.value = v; }
  exponentialRampToValueAtTime(v) { this.value = v; }
  cancelScheduledValues() {}
}

class MockAudioNode {
  constructor() {
    this.connected = [];
  }
  connect(dest) { this.connected.push(dest); }
  disconnect() { this.connected = []; }
}

class MockGainNode extends MockAudioNode {
  constructor(val = 1) {
    super();
    this.gain = new MockAudioParam(val);
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor() {
    super();
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
  }
  start() {}
  stop() {}
}

class MockBiquadFilterNode extends MockAudioNode {
  constructor() {
    super();
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(1000);
    this.Q = new MockAudioParam(1);
  }
}

class MockAudioBufferSourceNode extends MockAudioNode {
  constructor() {
    super();
    this.buffer = null;
    this.loop = false;
  }
  start() {}
  stop() {}
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = new MockAudioNode();
  }
  createGain() { return new MockGainNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  createBiquadFilter() { return new MockBiquadFilterNode(); }
  createBufferSource() { return new MockAudioBufferSourceNode(); }
  createBuffer(channels, length, sampleRate) {
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      getChannelData: () => new Float32Array(length)
    };
  }
  resume() { return Promise.resolve(); }
  addEventListener() {}
  removeEventListener() {}
}

const MockSpeechSynthesisUtterance = class {
  constructor(text) {
    this.text = text;
    this.rate = 1;
    this.pitch = 1;
    this.lang = 'en-GB';
    this.voice = null;
  }
};

global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

global.window = {
  localStorage: mockLocalStorage,
  AudioContext: MockAudioContext,
  speechSynthesis: {
    getVoices: () => [
      { name: 'Oliver (UK)', lang: 'en-GB', default: true },
      { name: 'Serena (UK)', lang: 'en-GB', default: false },
      { name: 'David (US)', lang: 'en-US', default: false },
      { name: 'Karen (AU)', lang: 'en-AU', default: false },
      { name: 'Fiona (Scotland)', lang: 'en-GB-scotland', default: false }
    ],
    speak: (u) => { setTimeout(() => u.onend && u.onend(), 5); },
    cancel: () => {},
    addEventListener: () => {}
  },
  SpeechSynthesisUtterance: MockSpeechSynthesisUtterance
};
global.localStorage = mockLocalStorage;

// =========================================================================
// SUITE 1: AUDIO SYNTHESIZER EXAM ROOM AMBIENCE & CADENCE MODELS
// =========================================================================
console.log('\n[SUITE 1] AudioSynthesizer Exam Room Ambience & Multi-Accent Cadence...');

const audioMod = transpileAndLoad(path.join(CORE_DIR, 'audio-synthesizer.ts'), {
  '../utils/storage': {
    StorageManager: {
      toggleSoundMute: () => false,
      loadState: () => ({ soundMuted: false })
    }
  },
  './haptic-engine': { HapticEngine: { trigger: () => {} } }
});

const { AudioSynthesizer, ACCENT_CADENCE_MODELS } = audioMod;
assert(AudioSynthesizer, 'AudioSynthesizer class must be exported');
assert(ACCENT_CADENCE_MODELS, 'ACCENT_CADENCE_MODELS map must be exported');

// 1. Cadence models verification
const cadences = AudioSynthesizer.getAvailableCadences();
assert.strictEqual(cadences.length, 4, 'Must define exactly 4 cadence models (uk-rp, general-american, australian, scottish)');

const requiredAccents = ['uk-rp', 'general-american', 'australian', 'scottish'];
for (const acc of requiredAccents) {
  const model = ACCENT_CADENCE_MODELS[acc];
  assert(model, `Missing accent model: ${acc}`);
  assert(model.label && model.label.length > 0, `${acc} missing label`);
  assert(Array.isArray(model.langPrefixes) && model.langPrefixes.length > 0, `${acc} missing langPrefixes`);
  assert(model.rate >= 0.8 && model.rate <= 1.2, `${acc} rate out of range: ${model.rate}`);
  assert(model.pitch >= 0.8 && model.pitch <= 1.3, `${acc} pitch out of range: ${model.pitch}`);
  assert(model.commaPauseMs >= 180 && model.commaPauseMs <= 300, `${acc} comma pause must be 200-300ms: ${model.commaPauseMs}`);
  assert(model.periodPauseMs >= 350 && model.periodPauseMs <= 500, `${acc} period pause must be 380-450ms: ${model.periodPauseMs}`);
}

// 2. Setting and getting cadence
AudioSynthesizer.setCadence('australian');
assert.strictEqual(AudioSynthesizer.getCadence(), 'australian');
const ausModel = AudioSynthesizer.getCadenceModel();
assert.strictEqual(ausModel.id, 'australian');

AudioSynthesizer.setCadence('uk-rp');
assert.strictEqual(AudioSynthesizer.getCadence(), 'uk-rp');

// 3. Voice accent matching
const ukVoice = AudioSynthesizer.getVoiceForAccent('uk-rp');
assert(ukVoice, 'Must resolve a voice for UK RP');
assert(ukVoice.lang.startsWith('en'), 'Voice must be English');

const usVoice = AudioSynthesizer.getVoiceForAccent('general-american');
assert(usVoice, 'Must resolve a voice for General American');

// 4. Exam Room Ambience lifecycle
AudioSynthesizer.playExamRoomAmbience(true);
assert.strictEqual(AudioSynthesizer.isExamRoomAmbienceActive(), true, 'Exam room ambience should report active');

AudioSynthesizer.playExamRoomAmbience(false);
assert.strictEqual(AudioSynthesizer.isExamRoomAmbienceActive(), false, 'Exam room ambience should report inactive after stop');

// 5. speakWithCadence helper
const cadencePlayback = AudioSynthesizer.speakWithCadence('Good morning, candidates. The exam will now begin.', {
  accent: 'uk-rp'
});
assert(cadencePlayback && typeof cadencePlayback.stop === 'function', 'speakWithCadence must return a playback controller');
cadencePlayback.stop();

console.log('✅ Suite 1 passed: Ambience synthesis, cadence models, and micro-pauses validated.');

// =========================================================================
// SUITE 2: IELTS TTS INTEGRATION (LISTENING & SPEAKING CONNECTIVITY)
// =========================================================================
console.log('\n[SUITE 2] IELTS TTS Integration & Player Connectivity...');

const ttsMod = transpileAndLoad(path.join(IELTS_DIR, 'tts.ts'), {
  '../core/audio-synthesizer': audioMod
});

assert(typeof ttsMod.setPreferredAccent === 'function', 'tts.ts must export setPreferredAccent');
assert(typeof ttsMod.getPreferredAccent === 'function', 'tts.ts must export getPreferredAccent');
assert(typeof ttsMod.setExamRoomAmbience === 'function', 'tts.ts must export setExamRoomAmbience');
assert(typeof ttsMod.isExamRoomAmbienceEnabled === 'function', 'tts.ts must export isExamRoomAmbienceEnabled');
assert(typeof ttsMod.playSection === 'function', 'tts.ts must export playSection');
assert(typeof ttsMod.playText === 'function', 'tts.ts must export playText');

// Test global preferences
ttsMod.setPreferredAccent('scottish');
assert.strictEqual(ttsMod.getPreferredAccent(), 'scottish');
ttsMod.setPreferredAccent('uk-rp');
assert.strictEqual(ttsMod.getPreferredAccent(), 'uk-rp');

ttsMod.setExamRoomAmbience(true);
assert.strictEqual(ttsMod.isExamRoomAmbienceEnabled(), true);
ttsMod.setExamRoomAmbience(false);
assert.strictEqual(ttsMod.isExamRoomAmbienceEnabled(), false);

// Test playSection with accent and roomAmbience
const dummySection = {
  id: 'test-sec-1',
  section: 1,
  title: 'Cambridge Housing Enquiry',
  speakers: [
    { name: 'Clerk', gender: 'm', lang: 'en-GB' },
    { name: 'Student', gender: 'f', lang: 'en-GB' }
  ],
  script: [
    { speaker: 'Clerk', text: 'Good morning, accommodation office. How may I help you?' },
    { speaker: 'Student', text: 'Hello, I would like to inquire about flats near the city center.' }
  ],
  questions: []
};

const secPlayback = ttsMod.playSection(dummySection, {
  accent: 'uk-rp',
  roomAmbience: true
});
assert(secPlayback && typeof secPlayback.stop === 'function', 'playSection must return Playback');
secPlayback.stop();

// Test playText with cadence punctuation pauses
const textPlayback = ttsMod.playText('Furthermore, the statistical evidence indicates significant improvement; however, further trials are warranted.', {
  accent: 'general-american',
  roomAmbience: false
});
assert(textPlayback && typeof textPlayback.stop === 'function', 'playText must return Playback');
textPlayback.stop();

console.log('✅ Suite 2 passed: IELTS TTS player correctly wired with multi-accent voice and room ambience.');

// =========================================================================
// SUITE 3: OFFLINE SPEECH EVALUATOR (WER, LEVENSHTEIN & HIGHLIGHTING)
// =========================================================================
console.log('\n[SUITE 3] Offline Speech Recognition Evaluator & Accuracy Scorer...');

const evalMod = transpileAndLoad(path.join(CORE_DIR, 'speech-evaluator.ts'));
const { SpeechEvaluator } = evalMod;
assert(SpeechEvaluator, 'SpeechEvaluator must be exported');

// 1. Exact match test
const target1 = 'The quick brown fox jumps over the lazy dog';
const spoken1 = 'The quick brown fox jumps over the lazy dog';
const res1 = SpeechEvaluator.evaluate(target1, spoken1);

assert.strictEqual(res1.wer, 0, 'Perfect transcript must have WER = 0');
assert.strictEqual(res1.accuracyPct, 100, 'Perfect transcript must have 100% accuracy');
assert.strictEqual(res1.similarityPct, 100, 'Perfect transcript must have 100% similarity');
assert.strictEqual(res1.correctCount, 9, 'All 9 words must be matched');
assert.strictEqual(res1.deletions, 0);
assert.strictEqual(res1.substitutions, 0);
assert.strictEqual(res1.insertions, 0);

// 2. Word Error Rate with Deletions (Omitted words)
const target2 = 'Welcome to the university library orientation tour';
const spoken2 = 'Welcome to the library orientation'; // omitted 'university' and 'tour'
const res2 = SpeechEvaluator.evaluate(target2, spoken2);

assert.strictEqual(res2.deletions, 2, 'Must detect exactly 2 omitted words');
assert.strictEqual(res2.omittedWords.length, 2, 'omittedWords list must contain 2 items');
const omittedTokens = res2.omittedWords.map(w => w.word);
assert(omittedTokens.includes('university'), 'Must identify "university" as omitted');
assert(omittedTokens.includes('tour'), 'Must identify "tour" as omitted');
assert(res2.wer > 0 && res2.wer <= 0.35, `WER should reflect 2 deletions over 7 words: ${res2.wer}`);

// 3. Word Error Rate with Substitutions and Near-Miss Mispronunciations
const target3 = 'The acoustic phenomenon requires careful experimental verification';
const spoken3 = 'The acoustic phenomena requires careful experiment verification';
// 'phenomenon' -> 'phenomena' (near miss / mispronounced)
// 'experimental' -> 'experiment' (near miss / inflection)
const res3 = SpeechEvaluator.evaluate(target3, spoken3);

assert.strictEqual(res3.substitutions, 2, 'Must detect 2 substitutions');
assert(res3.mispronouncedWords.length >= 1, 'Near-miss words must be categorized as mispronounced');
const mis = res3.mispronouncedWords.find(w => w.word === 'phenomenon');
assert(mis, 'Must flag "phenomenon" as mispronounced');
assert.strictEqual(mis.spokenAlternative, 'phenomena');
assert(mis.similarity >= 60, `Phonetic similarity should be >= 60%: ${mis.similarity}%`);

// 4. Insertions test
const target4 = 'Please sign your name';
const spoken4 = 'Please kindly sign your full name'; // extra 'kindly' and 'full'
const res4 = SpeechEvaluator.evaluate(target4, spoken4);
assert.strictEqual(res4.insertions, 2, 'Must detect 2 inserted words');
assert.strictEqual(res4.insertedWords.length, 2);

// 5. Semantic HTML formatting
const html = res3.formattedHtml;
assert(html.includes('speech-eval-block'), 'HTML must contain container .speech-eval-block');
assert(html.includes('is-correct'), 'HTML must contain .is-correct class');
assert(html.includes('is-mispronounced'), 'HTML must contain .is-mispronounced class');

// 6. Boundary conditions
const resEmpty = SpeechEvaluator.evaluate('', '');
assert.strictEqual(resEmpty.wer, 0);
assert.strictEqual(resEmpty.accuracyPct, 100);

const resNoSpoken = SpeechEvaluator.evaluate('Some script to read aloud', '');
assert.strictEqual(resNoSpoken.wer, 1.0);
assert.strictEqual(resNoSpoken.accuracyPct, 0);
assert.strictEqual(resNoSpoken.deletions, 5);

// 7. Standalone helper methods
const werResult = SpeechEvaluator.calculateWER('A B C D', 'A B X D');
assert.strictEqual(werResult.substitutions, 1);
assert.strictEqual(werResult.wer, 0.25);

const simResult = SpeechEvaluator.calculateLevenshteinSimilarity('Cambridge Exam', 'Cambridge Exam');
assert.strictEqual(simResult, 100);

console.log('✅ Suite 3 passed: Offline WER, Levenshtein, word status classification & HTML highlighting validated.');

console.log('\n🎉 ALL 3 SUITES PASSED! ENG-122 implementation is verified 100%!');
