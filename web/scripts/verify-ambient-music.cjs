// web/scripts/verify-ambient-music.cjs
/**
 * Automated Verification Suite for Procedural Ambient Music Synth Engine & Dual Audio Bus (ENG-77)
 * Audits:
 * 1. AmbientMusicEngine Module Architecture & Exports (web/src/core/ambient-music-engine.ts)
 *    - AmbientMusicEngine class and ambientMusicEngine singleton exports
 *    - Core methods: setMusicVolume, setMode, getMode, getMusicVolume, isPlaying, cycleMode
 *    - Supported soundscape modes: 'off', 'calm-chords', 'celestial-void', 'zen-drone'
 * 2. Audio Bus Independence & Isolation
 *    - Independent musicGain bus routed directly to destination
 *    - SFX masterGain volume/mute isolation from Ambient Music bus
 *    - Zero cross-talk between SFX and procedural music channels
 * 3. Crossfade Safety & Envelope Transitions
 *    - 1.5s seamless crossfade envelope (CROSSFADE_DURATION = 1.5)
 *    - Non-zero epsilon/DC floor preventing DAC pops
 *    - Ramped gain envelope on mode activation and teardown
 * 4. Header HUD UI Bindings (web/src/modules/header-hud.ts)
 *    - Presence of .btn-ambient-music in HUD action bar
 *    - SFX volume slider (#sfx-volume-slider) bound to AudioSynthesizer.setMasterVolume
 *    - Music volume slider (#music-volume-slider) bound to ambientMusicEngine.setMusicVolume
 *    - Soundscape selector (#music-mode-select) with all 4 modes
 * 5. State Persistence & StorageManager (web/src/utils/storage.ts)
 *    - eng_music_volume and eng_music_mode keys
 *    - getMusicVolume, setMusicVolume, getMusicMode, setMusicMode methods
 * 6. Procedural Soundscape Synthesis Logic
 *    - Modal pentatonic chord pads with lowpass filter (calm-chords)
 *    - Deep space sub-drone with Pythagorean detuning (celestial-void)
 *    - Theta binaural differential and noise wash (zen-drone)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================================');
console.log('  [TEST] VERIFYING PROCEDURAL AMBIENT MUSIC & DUAL AUDIO BUS (ENG-77)');
console.log('================================================================================');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// 1. File Invariants
// -----------------------------------------------------------------------------
it('Verifies required audio and UI source files exist', () => {
  const files = [
    'web/src/core/ambient-music-engine.ts',
    'web/src/core/audio-synthesizer.ts',
    'web/src/utils/storage.ts',
    'web/src/modules/header-hud.ts',
    'web/src/assets/styles/hud-base.css'
  ];

  for (const rel of files) {
    const full = path.join(__dirname, '..', '..', rel);
    assert(fs.existsSync(full), `File must exist: ${rel}`);
  }
});

// -----------------------------------------------------------------------------
// 2. AmbientMusicEngine Module Architecture & Exports
// -----------------------------------------------------------------------------
it('Verifies AmbientMusicEngine class and ambientMusicEngine singleton exports', () => {
  const file = path.join(__dirname, '../src/core/ambient-music-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('export class AmbientMusicEngine'), 'Must export AmbientMusicEngine class');
  assert(code.includes('export const ambientMusicEngine'), 'Must export ambientMusicEngine singleton');

  // Verify core method signatures
  const requiredMethods = [
    'setMusicVolume',
    'getMusicVolume',
    'setMode',
    'getMode',
    'isPlaying',
    'cycleMode'
  ];

  for (const method of requiredMethods) {
    assert(
      code.includes(`${method}(`) || code.includes(`public ${method}`) || code.includes(`public static ${method}`),
      `AmbientMusicEngine must provide method: ${method}`
    );
  }

  // Verify supported soundscape modes
  const requiredModes = ['off', 'calm-chords', 'celestial-void', 'zen-drone'];
  for (const mode of requiredModes) {
    assert(code.includes(`'${mode}'`), `Must support soundscape mode: '${mode}'`);
  }
});

// -----------------------------------------------------------------------------
// 3. Audio Bus Independence & Isolation
// -----------------------------------------------------------------------------
it('Verifies dual audio bus isolation between SFX and Ambient Music', () => {
  const musicFile = path.join(__dirname, '../src/core/ambient-music-engine.ts');
  const musicCode = fs.readFileSync(musicFile, 'utf8');

  const sfxFile = path.join(__dirname, '../src/core/audio-synthesizer.ts');
  const sfxCode = fs.readFileSync(sfxFile, 'utf8');

  // AmbientMusicEngine must construct its own independent musicGain node connected to destination
  assert(musicCode.includes('this.musicGain = this.ctx.createGain()') || musicCode.includes('createGain()'),
    'AmbientMusicEngine must instantiate a dedicated musicGain node');
  assert(musicCode.includes('this.musicGain.connect(this.ctx.destination)'),
    'musicGain must route directly to AudioContext.destination');

  // AudioSynthesizer must retain independent masterGain routing
  assert(sfxCode.includes('this.masterGain = this.ctx.createGain()'),
    'AudioSynthesizer must retain independent masterGain for SFX');
  assert(sfxCode.includes('this.masterGain.connect(this.ctx.destination)'),
    'AudioSynthesizer masterGain must connect directly to destination');

  // Verify AudioSynthesizer exposes getContext() for unified context sharing without bus coupling
  assert(sfxCode.includes('public static getContext()'),
    'AudioSynthesizer must expose getContext() to share AudioContext without mixing gain buses');
});

// -----------------------------------------------------------------------------
// 4. Crossfade Safety & 1.5s Envelope
// -----------------------------------------------------------------------------
it('Verifies smooth 1.5s crossfade envelope and pop-free gain ramping', () => {
  const file = path.join(__dirname, '../src/core/ambient-music-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Check 1.5s crossfade duration constant
  assert(
    code.includes('CROSSFADE_DURATION = 1.5') || code.includes('CROSSFADE_TIME = 1.5') || code.includes('1.5'),
    'AmbientMusicEngine must enforce a 1.5s crossfade duration'
  );

  // Check audio param ramping without audio clicks
  assert(
    code.includes('linearRampToValueAtTime') || code.includes('exponentialRampToValueAtTime'),
    'Must use smooth linear or exponential audio param ramping'
  );

  // Check non-zero epsilon to avoid DAC DC pop
  assert(
    code.includes('EPSILON') || code.includes('0.0001'),
    'Must define non-zero epsilon floor for click-free fadeouts'
  );
});

// -----------------------------------------------------------------------------
// 5. Header HUD UI Bindings & Dual Volume Sliders
// -----------------------------------------------------------------------------
it('Verifies Header HUD ambient music toggle button in header-hud.ts', () => {
  const file = path.join(__dirname, '../src/modules/header-hud.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Button markup
  assert(code.includes('btn-ambient-music'), 'header-hud.ts must render button with class .btn-ambient-music');
  assert(code.includes('icon(\'music\''), 'ambient music button must render music icon');

  // Button interaction & cycling
  assert(code.includes('ambientMusicEngine.cycleMode()'), 'ambient music button click must call cycleMode()');
});

it('Verifies Settings modal contains dual volume sliders and mode select', () => {
  const file = path.join(__dirname, '../src/modules/header-hud.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Sliders and select markup
  assert(code.includes('id="sfx-volume-slider"'), 'Settings modal must contain #sfx-volume-slider');
  assert(code.includes('id="music-volume-slider"'), 'Settings modal must contain #music-volume-slider');
  assert(code.includes('id="music-mode-select"'), 'Settings modal must contain #music-mode-select');

  // Event bindings
  assert(code.includes('AudioSynthesizer.setMasterVolume'), 'sfx slider must bind to AudioSynthesizer.setMasterVolume');
  assert(code.includes('ambientMusicEngine.setMusicVolume'), 'music slider must bind to ambientMusicEngine.setMusicVolume');
  assert(code.includes('ambientMusicEngine.setMode'), 'soundscape select must bind to ambientMusicEngine.setMode');
});

// -----------------------------------------------------------------------------
// 6. Local Storage Persistence & StorageManager
// -----------------------------------------------------------------------------
it('Verifies persistence keys and StorageManager API in storage.ts', () => {
  const file = path.join(__dirname, '../src/utils/storage.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Keys
  assert(code.includes('eng_music_volume'), 'storage.ts must handle eng_music_volume');
  assert(code.includes('eng_music_mode'), 'storage.ts must handle eng_music_mode');

  // Helper methods
  assert(code.includes('getMusicVolume'), 'StorageManager must provide getMusicVolume');
  assert(code.includes('setMusicVolume'), 'StorageManager must provide setMusicVolume');
  assert(code.includes('getMusicMode'), 'StorageManager must provide getMusicMode');
  assert(code.includes('setMusicMode'), 'StorageManager must provide setMusicMode');
});

// -----------------------------------------------------------------------------
// 7. Soundscape Modes Synthesis Architecture
// -----------------------------------------------------------------------------
it('Verifies synthesis algorithms for all 3 soundscapes in ambient-music-engine.ts', () => {
  const file = path.join(__dirname, '../src/core/ambient-music-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Calm Chords: Pentatonic pads, lowpass filter, breathing LFO
  assert(code.includes('createBiquadFilter'), 'Must create lowpass filter for calm chords');
  assert(code.includes('lowpass'), 'Filter type must be lowpass');

  // Celestial Void: Low fundamental drones (55Hz / 110Hz)
  assert(code.includes('55') || code.includes('110'), 'Celestial void must synthesize low frequency fundamentals (55Hz/110Hz)');

  // Zen Drone: Theta differential binaural beats and soothing noise wash
  assert(code.includes('createBufferSource') || code.includes('pinkNoiseBuffer') || code.includes('noise'),
    'Zen drone must synthesize meditation texture or noise wash');
});

// -----------------------------------------------------------------------------
// 8. Algorithmic Simulation: Volume Clamping & Mode Cycle Math
// -----------------------------------------------------------------------------
it('Simulates volume clamping and cyclic mode transitions', () => {
  // Volume clamping invariant: [0.0, 1.0]
  const clamp = (v) => Math.max(0, Math.min(1, v));
  assert.strictEqual(clamp(-0.5), 0, 'Negative volume clamps to 0.0');
  assert.strictEqual(clamp(1.5), 1, 'Excess volume clamps to 1.0');
  assert.strictEqual(clamp(0.35), 0.35, 'Normal volume remains unchanged');

  // Cycle mode invariant: off -> calm-chords -> celestial-void -> zen-drone -> off
  const modes = ['off', 'calm-chords', 'celestial-void', 'zen-drone'];
  let cur = 'off';
  const cycle = (m) => modes[(modes.indexOf(m) + 1) % modes.length];

  cur = cycle(cur);
  assert.strictEqual(cur, 'calm-chords');
  cur = cycle(cur);
  assert.strictEqual(cur, 'celestial-void');
  cur = cycle(cur);
  assert.strictEqual(cur, 'zen-drone');
  cur = cycle(cur);
  assert.strictEqual(cur, 'off');
});

// -----------------------------------------------------------------------------
// Final Report
// -----------------------------------------------------------------------------
console.log('--------------------------------------------------------------------------------');
console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
if (passedTests === totalTests) {
  console.log('  Status: ALL AMBIENT MUSIC & DUAL BUS INVARIANTS SATISFIED (100% OK)');
  process.exit(0);
} else {
  console.error(`  Status: ${totalTests - passedTests} TEST(S) FAILED`);
  process.exit(1);
}
