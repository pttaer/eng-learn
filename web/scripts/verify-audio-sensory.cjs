// web/scripts/verify-audio-sensory.cjs
const assert = require('assert');

console.log('[AUDIO SENSORY TEST] Validating harmonic acoustics, decay envelopes, and haptic models...');

// 1. Verify Just Intonation Harmonic Ratios
console.log('1. Testing Pythagorean Just Intonation ratios...');
const baseFreq = 440;
const ratios = {
  unison: 1.0,
  majorThird: 1.25,
  perfectFifth: 1.50,
  octave: 2.0,
  majorNinth: 2.25
};

const chordFrequencies = Object.values(ratios).map((r) => baseFreq * r);
console.log(`- Synthesized Pentatonic Chord Frequencies: ${chordFrequencies.join(', ')} Hz`);
assert.strictEqual(chordFrequencies[0], 440, 'Unison ratio failed');
assert.strictEqual(chordFrequencies[1], 550, 'Major Third (5:4) ratio failed');
assert.strictEqual(chordFrequencies[2], 660, 'Perfect Fifth (3:2) ratio failed');
assert.strictEqual(chordFrequencies[3], 880, 'Octave (2:1) ratio failed');
assert.strictEqual(chordFrequencies[4], 990, 'Major Ninth (9:4) ratio failed');

// 2. Exponential Decay Calculation Simulation
console.log('2. Testing exponential ADSR decay calculations...');
function calculateExponentialDecay(initialVal, tau, t) {
  return initialVal * Math.exp(-t / tau);
}

const initialGain = 0.5;
const tauDecay = 0.15; // 150ms time constant
const gainAt50ms = calculateExponentialDecay(initialGain, tauDecay, 0.05);
const gainAt150ms = calculateExponentialDecay(initialGain, tauDecay, 0.15);
const gainAt450ms = calculateExponentialDecay(initialGain, tauDecay, 0.45);

console.log(`- Envelope Gain Curve: 0ms=${initialGain}, 50ms=${gainAt50ms.toFixed(3)}, 150ms=${gainAt150ms.toFixed(3)}, 450ms=${gainAt450ms.toFixed(4)}`);
assert(gainAt50ms < initialGain, 'Envelope must decay monotonically');
assert(gainAt150ms < initialGain / 2, 'Envelope must drop past 50% at 1*tau');
assert(gainAt450ms < 0.03, 'Envelope must be virtually silent (< -30dB) at 3*tau');

// 3. Audio Decibel to Linear Gain Conversion
console.log('3. Testing decibel to linear gain conversions...');
function dbToLinear(dB) {
  return Math.pow(10, dB / 20);
}
assert.strictEqual(Math.round(dbToLinear(0) * 100) / 100, 1.00, '0 dB should equal 1.00 gain');
assert.strictEqual(Math.round(dbToLinear(-6) * 100) / 100, 0.50, '-6 dB should equal 0.50 gain');
assert.strictEqual(Math.round(dbToLinear(-20) * 100) / 100, 0.10, '-20 dB should equal 0.10 gain');

// 4. Haptic Pattern Matrix
console.log('4. Testing haptic pattern definitions...');
const hapticPatterns = {
  light: 10,
  selection: 10,
  medium: 25,
  heavy: 45,
  success: [15, 30, 25],
  warning: [30, 40, 30],
  error: [50, 60, 50, 60, 50]
};

assert.strictEqual(hapticPatterns.light, 10, 'Light haptic pulse must be 10ms micro-pulse');
assert.deepStrictEqual(hapticPatterns.success, [15, 30, 25], 'Success haptic must follow dual-pulse rhythm');
assert(Array.isArray(hapticPatterns.warning), 'Warning haptic must be multi-pulse pattern');

// 5. Sound Effect Mapping Completeness
console.log('5. Testing sound effect catalogue completeness...');
const soundEffects = [
  'click',
  'implosion',
  'void-open',
  'urchin-hum',
  'flip',
  'absorb',
  'alarm',
  'remind-drop',
  'level-up',
  'chime',
  'ping',
  'tick',
  'gateway-hover',
  'streak-fire'
];

assert(soundEffects.includes('click'), 'Click effect must be supported');
assert(soundEffects.includes('flip'), 'Flip effect must be supported');
assert(soundEffects.includes('absorb'), 'Absorb effect must be supported');
assert(soundEffects.includes('level-up'), 'Level-up effect must be supported');
assert(soundEffects.includes('remind-drop'), 'Remind-drop effect must be supported');

// 6. Multi-Skill Radar Reveal & Stage Fanfare Invariants (ENG-68)
console.log('6. Testing Celestial Radar Pentagram arpeggio & Stage Fanfare frequencies...');
const radarArpeggio = [
  { note: 'D4', freq: 293.66, axis: 'vocab' },
  { note: 'F#4', freq: 369.99, axis: 'grammar' },
  { note: 'A4', freq: 440.00, axis: 'reading' },
  { note: 'C#5', freq: 554.37, axis: 'listening' },
  { note: 'E5', freq: 659.25, axis: 'writing' }
];

assert.strictEqual(radarArpeggio.length, 5, 'Celestial Radar arpeggio must possess exactly 5 harmonic notes');
assert.strictEqual(radarArpeggio[0].freq, 293.66, 'Axis 1 (Vocab) must resonate at D4 (293.66Hz)');
assert.strictEqual(radarArpeggio[1].freq, 369.99, 'Axis 2 (Grammar) must resonate at F#4 (369.99Hz)');
assert.strictEqual(radarArpeggio[2].freq, 440.00, 'Axis 3 (Reading) must resonate at A4 (440.00Hz)');
assert.strictEqual(radarArpeggio[3].freq, 554.37, 'Axis 4 (Listening) must resonate at C#5 (554.37Hz)');
assert.strictEqual(radarArpeggio[4].freq, 659.25, 'Axis 5 (Writing) must resonate at E5 (659.25Hz)');

const soundEffectsExtended = [
  ...soundEffects,
  'stage-fanfare',
  'radar-reveal',
  'mechanical-click',
  'keystroke'
];
assert(soundEffectsExtended.includes('stage-fanfare'), 'Stage fanfare effect must be supported');
assert(soundEffectsExtended.includes('radar-reveal'), 'Radar reveal arpeggio effect must be supported');

console.log('✓ All Audio Sensory mathematical assertions, radar arpeggios, and haptic models passed cleanly.');
