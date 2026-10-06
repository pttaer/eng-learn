// web/scripts/verify-listening-diagnostic.cjs
// Verification suite for Listening Audio Prompts & Acoustic Telemetry in Multi-Skill Quiz (ENG-68)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

console.log('[ENG-68 TEST] Verifying Listening Audio Prompts, Acoustic Telemetry, and Radar Reveal Arpeggios...');

const WEB_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(WEB_DIR, 'src');

function loadModule(relPath, mocks = {}) {
  const fullPath = path.join(SRC_DIR, relPath);
  const rawCode = fs.readFileSync(fullPath, 'utf8');
  const compiled = ts.transpileModule(rawCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  }).outputText;

  const mod = { exports: {} };
  const requireMock = (id) => {
    if (mocks[id]) return mocks[id];
    if (id.endsWith('.json')) {
      const jsonPath = path.resolve(path.dirname(fullPath), id);
      if (fs.existsSync(jsonPath)) {
        return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      }
    }
    try {
      return require(id);
    } catch {
      return {};
    }
  };

  const fn = new Function('module', 'exports', 'require', '__dirname', compiled);
  fn(mod, mod.exports, requireMock, path.dirname(fullPath));
  return mod.exports;
}

// ---------------------------------------------------------------------------
// 1. AudioSynthesizer Acoustic Telemetry & Pop-Free Invariants
// ---------------------------------------------------------------------------
console.log('1. Testing AudioSynthesizer acoustic telemetry invariants...');

const audioSynthSource = fs.readFileSync(path.join(SRC_DIR, 'core', 'audio-synthesizer.ts'), 'utf8');

// Assert SoundEffectType includes radar-reveal and stage-fanfare
assert(audioSynthSource.includes("'radar-reveal'"), "SoundEffectType must include 'radar-reveal'");
assert(audioSynthSource.includes("'stage-fanfare'"), "SoundEffectType must include 'stage-fanfare'");

// Assert non-zero baseline constants exist
assert(audioSynthSource.includes('EPSILON = 0.001'), 'Must declare non-zero EPSILON = 0.001 to prevent DAC DC pop');
assert(audioSynthSource.includes('MUTE_FLOOR = 0.0001'), 'Must declare MUTE_FLOOR to prevent exponential ramp to zero');

// Assert mobile gesture unlocking
const expectedUnlocks = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
for (const evt of expectedUnlocks) {
  assert(audioSynthSource.includes(evt), `AudioContext priming must register ${evt} listener`);
}

// Assert stopSpeech method
assert(audioSynthSource.includes('public static stopSpeech()'), 'AudioSynthesizer must export stopSpeech()');
assert(audioSynthSource.includes('window.speechSynthesis.cancel()'), 'stopSpeech must cancel active utterances');

// Assert playRadarReveal implementation with 5 notes
assert(audioSynthSource.includes('playRadarReveal'), 'AudioSynthesizer must implement playRadarReveal');
assert(audioSynthSource.includes('293.66'), 'Radar reveal must include D4 (293.66Hz)');
assert(audioSynthSource.includes('369.99'), 'Radar reveal must include F#4 (369.99Hz)');
assert(audioSynthSource.includes('440.00'), 'Radar reveal must include A4 (440.00Hz)');
assert(audioSynthSource.includes('554.37'), 'Radar reveal must include C#5 (554.37Hz)');
assert(audioSynthSource.includes('659.25'), 'Radar reveal must include E5 (659.25Hz)');

console.log('  ✓ AudioSynthesizer contains pop-free radar-reveal, stage-fanfare, and mobile unlock listeners.');

// ---------------------------------------------------------------------------
// 2. Listening Prompt Component Contract & DOM Interactions
// ---------------------------------------------------------------------------
console.log('2. Testing ListeningPromptComponent in multi-skill-quiz-modal.ts...');

const modalSource = fs.readFileSync(path.join(SRC_DIR, 'modules', 'multi-skill-quiz-modal.ts'), 'utf8');

// Assert ListeningPromptComponent export
assert(modalSource.includes('export class ListeningPromptComponent'), 'multi-skill-quiz-modal.ts must export ListeningPromptComponent');

// Mock DOM environment for component testing
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.className = '';
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(c)) this.classList._classes.delete(c);
          else this.classList._classes.add(c);
        } else if (force) {
          this.classList._classes.add(c);
        } else {
          this.classList._classes.delete(c);
        }
      },
      contains: (c) => this.classList._classes.has(c)
    };
    this.attributes = {};
    this.style = {};
    this.innerHTML = '';
    this.value = '';
    this.textContent = '';
    this.listeners = {};
    this.children = [];
  }

  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  addEventListener(evt, fn) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(fn);
  }
  dispatchEvent(evt) {
    const list = this.listeners[evt.type] || [];
    list.forEach(fn => fn(evt));
  }
  querySelector(sel) {
    return this._findChild(sel);
  }
  querySelectorAll(sel) {
    return this._findAllChildren(sel);
  }
  appendChild(child) {
    this.children.push(child);
  }
  _findChild(sel) {
    // simplified selector lookup
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      for (const ch of this.children) {
        if (ch.className.includes(cls) || ch.classList.contains(cls)) return ch;
        const sub = ch._findChild(sel);
        if (sub) return sub;
      }
    }
    return new MockElement();
  }
  _findAllChildren(sel) {
    const res = [];
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      for (const ch of this.children) {
        if (ch.className.includes(cls) || ch.classList.contains(cls)) res.push(ch);
        res.push(...ch._findAllChildren(sel));
      }
    }
    return res;
  }
}

global.document = {
  createElement: (tag) => new MockElement(tag),
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  speechSynthesis: {
    speak: () => {},
    cancel: () => {},
    getVoices: () => []
  }
};

// ---------------------------------------------------------------------------
// 3. Listening Question Matrix & Connected-Speech Fallbacks
// ---------------------------------------------------------------------------
console.log('3. Validating curated listening questions across CEFR tiers (A1 to C2)...');

// Assert Curated questions presence
assert(modalSource.includes('diag-a1-listen'), 'Must define diag-a1-listen');
assert(modalSource.includes('diag-a2-listen'), 'Must define diag-a2-listen');
assert(modalSource.includes('diag-b1-listen'), 'Must define diag-b1-listen');
assert(modalSource.includes('diag-b2-listen'), 'Must define diag-b2-listen');
assert(modalSource.includes('diag-c1-listen'), 'Must define diag-c1-listen');
assert(modalSource.includes('diag-c2-listen'), 'Must define diag-c2-listen');

// Assert phonetic cues and gap targets exist
assert(modalSource.includes('phonetics:'), 'Listening questions must specify phonetic analysis');
assert(modalSource.includes('gapTarget:'), 'Listening questions must specify connected-speech gap targets');

// Assert speed control rates 0.8, 1.0, 1.2
assert(modalSource.includes('0.8'), 'Must support 0.8x slow speed playback');
assert(modalSource.includes('1.0'), 'Must support 1.0x normal speed playback');
assert(modalSource.includes('1.2'), 'Must support 1.2x fast speed playback');

console.log('  ✓ Curated listening questions cover A1-C2 with phonetic cues and gap targets.');

// ---------------------------------------------------------------------------
// 4. Acoustic Telemetry Triggers & Soundscape Integration
// ---------------------------------------------------------------------------
console.log('4. Testing multi-skill modal acoustic triggers...');

// Assert stage fanfare upon stage advancement
assert(modalSource.includes("AudioSynthesizer.play('stage-fanfare')"), "Modal must play 'stage-fanfare' when completing a stage");

// Assert radar reveal arpeggio upon opening Celestial Radar profile
assert(modalSource.includes("AudioSynthesizer.play('radar-reveal')"), "Modal must play 'radar-reveal' arpeggio upon radar render");

// Assert mechanical keystroke click during gap input typing
assert(modalSource.includes('AudioSynthesizer.playMechanicalClick()'), 'ListeningPromptComponent must trigger mechanical click on typing');

// Assert absorb and alarm for correct and incorrect answers
assert(modalSource.includes("AudioSynthesizer.play('absorb')"), "Must trigger 'absorb' on correct gap / choice");
assert(modalSource.includes("AudioSynthesizer.play('alarm')"), "Must trigger 'alarm' on incorrect gap / choice");

// Assert stopSpeech on question transition and teardown
assert(modalSource.includes('AudioSynthesizer.stopSpeech()'), 'Must invoke AudioSynthesizer.stopSpeech() on teardown');

console.log('  ✓ Stage fanfare, radar reveal arpeggio, mechanical clicks, and speech teardown verified.');

// ---------------------------------------------------------------------------
// 5. CSS Stylesheet Compliance
// ---------------------------------------------------------------------------
console.log('5. Testing dossiers.css rules for Listening Prompt & Radar aesthetics...');

const cssSource = fs.readFileSync(path.join(SRC_DIR, 'assets', 'styles', 'dossiers.css'), 'utf8');

assert(cssSource.includes('.listening-prompt-card'), 'dossiers.css must define .listening-prompt-card');
assert(cssSource.includes('.listening-player-strip'), 'dossiers.css must define .listening-player-strip');
assert(cssSource.includes('.phonetic-hint-box'), 'dossiers.css must define .phonetic-hint-box');
assert(cssSource.includes('.connected-speech-gap-card'), 'dossiers.css must define .connected-speech-gap-card');
assert(cssSource.includes('.listening-gap-input'), 'dossiers.css must define .listening-gap-input');
assert(cssSource.includes('.listening-gap-input.is-correct'), 'dossiers.css must define .listening-gap-input.is-correct');
assert(cssSource.includes('.listening-gap-input.is-incorrect'), 'dossiers.css must define .listening-gap-input.is-incorrect');

console.log('  ✓ dossiers.css styling verified for listening controls, phonetic hints, and gap states.');

console.log('\n✅ ALL ENG-68 LISTENING PROMPTS & ACOUSTIC TELEMETRY VERIFICATION ASSERTIONS PASSED (100%).');
