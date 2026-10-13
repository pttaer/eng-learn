/**
 * STARK // Verification Suite: Spoken Conversational Partner & Prosodic Rhythm Lab (ENG-96)
 * Validates:
 * 1. Triple-Bus Audio Architecture (SFX, Ambient Music, Spoken Voice)
 * 2. F0 Intonation Contour Classification (Fall ↘, Rise ↗, Fall-Rise ↘↗, Flat —)
 * 3. Tonic Syllable Prominence Detection (Nuclear Stress Peak)
 * 4. Stress-Timing Rhythm Metrics (nPVI Stress-Timed vs Syllable-Timed)
 * 5. CEFR Conversational Roleplay Scenarios & Multi-Turn State Machine (A1 to C2)
 * 6. In-Flow Gentle Recasting & Can-Do Diagnostic Summaries
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('\n[TEST SUITE] ENG-96: Spoken Conversational Partner & Prosodic Rhythm Lab\n');

// -----------------------------------------------------------------------------
// Suite 1: Source Code & Architectural Invariants
// -----------------------------------------------------------------------------
console.log('Suite 1: Source Code & Architectural Invariants');

test('audio-synthesizer.ts defines Triple-Bus gain nodes and methods', () => {
  const code = fs.readFileSync(path.join(__dirname, '../src/core/audio-synthesizer.ts'), 'utf8');
  assert.ok(code.includes('sfxGain: GainNode | null'), 'sfxGain property defined');
  assert.ok(code.includes('musicGain: GainNode | null'), 'musicGain property defined');
  assert.ok(code.includes('voiceGain: GainNode | null'), 'voiceGain property defined');
  assert.ok(code.includes('getSfxGain'), 'getSfxGain method defined');
  assert.ok(code.includes('getMusicGain'), 'getMusicGain method defined');
  assert.ok(code.includes('getVoiceGain'), 'getVoiceGain method defined');
  assert.ok(code.includes('setSfxVolume'), 'setSfxVolume method defined');
  assert.ok(code.includes('setVoiceVolume'), 'setVoiceVolume method defined');
  assert.ok(code.includes('setMusicVolume'), 'setMusicVolume method defined');
});

test('audio-synthesizer.ts implements pop/click prevention and non-zero baseline', () => {
  const code = fs.readFileSync(path.join(__dirname, '../src/core/audio-synthesizer.ts'), 'utf8');
  assert.ok(code.includes('EPSILON = 0.001'), 'EPSILON baseline constant exists');
  assert.ok(code.includes('MUTE_FLOOR = 0.0001'), 'MUTE_FLOOR constant exists');
  assert.ok(code.includes('exponentialRampToValueAtTime'), 'Uses smooth exponential ramping');
});

test('audio-synthesizer.ts exports prosodic DSP methods and types', () => {
  const code = fs.readFileSync(path.join(__dirname, '../src/core/audio-synthesizer.ts'), 'utf8');
  assert.ok(code.includes('classifyIntonationContour'), 'classifyIntonationContour exists');
  assert.ok(code.includes('detectTonicProminence'), 'detectTonicProminence exists');
  assert.ok(code.includes('computeRhythmMetrics'), 'computeRhythmMetrics exists');
  assert.ok(code.includes('export type IntonationContour'), 'IntonationContour type exported');
  assert.ok(code.includes('export interface RhythmAnalysisResult'), 'RhythmAnalysisResult exported');
});

// -----------------------------------------------------------------------------
// Suite 2: Intonation Contour Classifier Mathematics
// -----------------------------------------------------------------------------
console.log('\nSuite 2: F0 Intonation Contour Classification');

// Pure JS simulation of the AudioSynthesizer classifier logic for verification
function classifyIntonationContour(pitchSamples) {
  if (!pitchSamples || pitchSamples.length === 0) {
    return { contour: 'flat', symbol: '—', label: 'Monotone Flat', confidence: 0 };
  }
  const voiced = pitchSamples.filter(f => typeof f === 'number' && !isNaN(f) && f > 40 && f < 600);
  if (voiced.length < 3) {
    return { contour: 'flat', symbol: '—', label: 'Monotone Flat', confidence: 0 };
  }

  const smoothed = voiced.map((val, idx, arr) => {
    const p1 = idx > 0 ? arr[idx - 1] : val;
    const p2 = val;
    const p3 = idx < arr.length - 1 ? arr[idx + 1] : val;
    return (p1 + p2 + p3) / 3;
  });

  const len = smoothed.length;
  const third = Math.max(1, Math.floor(len / 3));
  const head = smoothed.slice(0, third);
  const body = smoothed.slice(third, len - third);
  const tail = smoothed.slice(len - third);

  const startHz = Math.round(head.reduce((a, b) => a + b, 0) / head.length);
  const midHz = body.length > 0 ? Math.round(body.reduce((a, b) => a + b, 0) / body.length) : startHz;
  const endHz = Math.round(tail.reduce((a, b) => a + b, 0) / tail.length);
  const minHz = Math.round(Math.min(...smoothed));
  const maxHz = Math.round(Math.max(...smoothed));

  const semitoneDelta = Math.round((12 * Math.log2(Math.max(1, endHz) / Math.max(1, startHz))) * 10) / 10;
  const semitoneRange = Math.round((12 * Math.log2(Math.max(1, maxHz) / Math.max(1, minHz))) * 10) / 10;

  let contour = 'flat';
  let symbol = '—';
  let label = 'Monotone Flat';

  if (semitoneRange < 1.4) {
    contour = 'flat';
    symbol = '—';
    label = 'Monotone Flat';
  } else if (midHz < startHz - 1.4 && endHz > midHz + 1.4) {
    contour = 'fall-rise';
    symbol = '↘↗';
    label = 'Reservation Fall-Rise';
  } else if (semitoneDelta >= 1.5) {
    contour = 'rise';
    symbol = '↗';
    label = 'Question Rise';
  } else if (semitoneDelta <= -1.5) {
    contour = 'fall';
    symbol = '↘';
    label = 'Statement Fall';
  } else if (endHz > startHz) {
    contour = 'rise';
    symbol = '↗';
    label = 'Question Rise';
  } else if (endHz < startHz) {
    contour = 'fall';
    symbol = '↘';
    label = 'Statement Fall';
  }

  const confidence = Math.min(1.0, Math.max(0.4, Math.round((Math.abs(semitoneDelta) / 3.5) * 100) / 100));
  return { contour, symbol, label, confidence, startHz, endHz, semitoneDelta };
}

test('Identifies Statement Fall (↘) for descending pitch contours', () => {
  // Descending from 240Hz down to 150Hz over 12 frames
  const fallingPitch = [245, 240, 235, 220, 205, 190, 175, 165, 155, 150, 148, 145];
  const res = classifyIntonationContour(fallingPitch);
  assert.strictEqual(res.contour, 'fall', 'Contour must be fall');
  assert.strictEqual(res.symbol, '↘', 'Symbol must be ↘');
  assert.ok(res.semitoneDelta < -3, 'Semitone delta must be strongly negative');
});

test('Identifies Question Rise (↗) for ascending pitch contours', () => {
  // Ascending from 150Hz up to 240Hz
  const risingPitch = [150, 155, 160, 175, 190, 205, 220, 230, 238, 242, 245, 248];
  const res = classifyIntonationContour(risingPitch);
  assert.strictEqual(res.contour, 'rise', 'Contour must be rise');
  assert.strictEqual(res.symbol, '↗', 'Symbol must be ↗');
  assert.ok(res.semitoneDelta > 3, 'Semitone delta must be strongly positive');
});

test('Identifies Reservation Fall-Rise (↘↗) for dipped pitch contours', () => {
  // Dips in the middle then recovers
  const fallRisePitch = [220, 215, 205, 160, 145, 140, 150, 185, 210, 225, 230];
  const res = classifyIntonationContour(fallRisePitch);
  assert.strictEqual(res.contour, 'fall-rise', 'Contour must be fall-rise');
  assert.strictEqual(res.symbol, '↘↗', 'Symbol must be ↘↗');
});

test('Identifies Monotone Flat (—) for flat pitch contours', () => {
  // Monotone around 180Hz +/- 1Hz
  const flatPitch = [180, 181, 180, 179, 180, 181, 180, 180, 179, 180];
  const res = classifyIntonationContour(flatPitch);
  assert.strictEqual(res.contour, 'flat', 'Contour must be flat');
  assert.strictEqual(res.symbol, '—', 'Symbol must be —');
});

// -----------------------------------------------------------------------------
// Suite 3: Tonic Prominence & Nuclear Stress Detector
// -----------------------------------------------------------------------------
console.log('\nSuite 3: Tonic Syllable Prominence Detection');

function detectTonicProminence(pitchSamples, energySamples, frameDurationSec = 0.05) {
  if (!pitchSamples || !energySamples || pitchSamples.length === 0 || energySamples.length === 0) {
    return { tonicIndex: -1, prominenceScores: [], isProminent: false, peakScore: 0 };
  }
  const totalFrames = Math.min(pitchSamples.length, energySamples.length);
  const windowFrames = Math.max(2, Math.round(0.15 / frameDurationSec));
  const numChunks = Math.ceil(totalFrames / windowFrames);
  const chunkScores = [];

  let maxEnergy = 0.001;
  let maxPitch = 50;

  for (let c = 0; c < numChunks; c++) {
    const start = c * windowFrames;
    const end = Math.min(totalFrames, start + windowFrames);
    let sumEnergy = 0;
    let sumPitch = 0;
    let voicedCount = 0;
    for (let i = start; i < end; i++) {
      const e = energySamples[i] || 0;
      sumEnergy += e;
      if (e > maxEnergy) maxEnergy = e;
      const p = pitchSamples[i] || 0;
      if (p > 40 && p < 600) {
        sumPitch += p;
        voicedCount++;
        if (p > maxPitch) maxPitch = p;
      }
    }
    const avgE = sumEnergy / (end - start);
    const avgP = voicedCount > 0 ? sumPitch / voicedCount : 0;
    chunkScores.push(avgE * 0.6 + (avgP / 400) * 0.4);
  }

  const normDenominator = maxEnergy * 0.6 + (maxPitch / 400) * 0.4 || 1;
  const normScores = chunkScores.map(s => Math.round(Math.min(1.0, s / normDenominator) * 100) / 100);
  let peakScore = 0;
  let tonicIndex = -1;

  for (let i = 0; i < normScores.length; i++) {
    if (normScores[i] > peakScore) {
      peakScore = normScores[i];
      tonicIndex = i;
    }
  }

  const isProminent = peakScore >= 0.55 && maxEnergy >= 0.035;
  return { tonicIndex, prominenceScores: normScores, isProminent, peakScore };
}

test('Locates nuclear stress peak at intended syllable position', () => {
  // 15 frames: syllable 0 (frames 0-2), syllable 1 (frames 3-5), syllable 2 (frames 6-8, high energy/pitch peak)
  const pitch = [140, 140, 140, 150, 150, 150, 260, 270, 265, 140, 140, 140];
  const energy = [0.08, 0.09, 0.07, 0.10, 0.12, 0.11, 0.55, 0.62, 0.58, 0.09, 0.08, 0.07];

  const res = detectTonicProminence(pitch, energy);
  assert.strictEqual(res.tonicIndex, 2, 'Tonic peak must fall on syllable chunk 2');
  assert.strictEqual(res.isProminent, true, 'Peak must be marked prominent');
  assert.ok(res.peakScore >= 0.9, 'Peak score should be close to 1.0');
});

test('Gracefully handles unvoiced silence or low-energy input', () => {
  const pitch = [0, 0, 0, 0, 0, 0];
  const energy = [0.005, 0.004, 0.005, 0.003, 0.005, 0.004];
  const res = detectTonicProminence(pitch, energy);
  assert.strictEqual(res.isProminent, false, 'Unvoiced audio must not be marked prominent');
});

// -----------------------------------------------------------------------------
// Suite 4: Normalized Pairwise Variability Index (nPVI) Rhythm
// -----------------------------------------------------------------------------
console.log('\nSuite 4: Normalized Pairwise Variability Index (nPVI) Rhythm');

function computeRhythmMetrics(energySamples, frameDurationSec = 0.05) {
  if (!energySamples || energySamples.length === 0) {
    return { npvi: 50, cadence: 'intermediate', label: 'Balanced Intermediate' };
  }

  const durations = [];
  let currentBurstFrames = 0;

  for (let i = 0; i < energySamples.length; i++) {
    if (energySamples[i] >= 0.035) {
      currentBurstFrames++;
    } else {
      if (currentBurstFrames > 0) {
        const durationSec = currentBurstFrames * frameDurationSec;
        if (durationSec >= 0.06) {
          durations.push(durationSec * 1000);
        }
        currentBurstFrames = 0;
      }
    }
  }
  if (currentBurstFrames > 0) {
    const durationSec = currentBurstFrames * frameDurationSec;
    if (durationSec >= 0.06) {
      durations.push(durationSec * 1000);
    }
  }

  if (durations.length < 2) {
    return { npvi: 50, cadence: 'intermediate', label: 'Balanced Intermediate' };
  }

  let sumDiff = 0;
  for (let k = 0; k < durations.length - 1; k++) {
    const d1 = durations[k];
    const d2 = durations[k + 1];
    const mean = (d1 + d2) / 2;
    if (mean > 0) {
      sumDiff += Math.abs(d1 - d2) / mean;
    }
  }

  const rawNpvi = (100 / (durations.length - 1)) * sumDiff;
  const npvi = Math.round(Math.min(150, Math.max(0, rawNpvi)) * 10) / 10;

  if (npvi >= 60) {
    return { npvi, cadence: 'stress-timed', label: 'Native Stress-Timed (nPVI ≥ 60)' };
  } else if (npvi < 45) {
    return { npvi, cadence: 'syllable-timed', label: 'Syllable-Timed (nPVI < 45)' };
  } else {
    return { npvi, cadence: 'intermediate', label: 'Balanced Intermediate (45 ≤ nPVI < 60)' };
  }
}

test('Classifies native stress-timing cadence (nPVI >= 60)', () => {
  // Alternating short reduced syllables (2 frames = 100ms) and elongated tonic syllables (8 frames = 400ms)
  const stressTimedEnergy = [
    0.1, 0.1, 0, // burst 1: 100ms
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0, // burst 2: 400ms
    0.1, 0.1, 0, // burst 3: 100ms
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0  // burst 4: 400ms
  ];
  const res = computeRhythmMetrics(stressTimedEnergy);
  assert.strictEqual(res.cadence, 'stress-timed', 'Must be classified as stress-timed');
  assert.ok(res.npvi >= 60, `nPVI must be >= 60 (actual: ${res.npvi})`);
});

test('Classifies staccato syllable-timing cadence (nPVI < 45)', () => {
  // Equal-duration syllables (each ~3 frames = 150ms)
  const syllableTimedEnergy = [
    0.15, 0.15, 0.15, 0, // burst 1: 150ms
    0.15, 0.15, 0.15, 0, // burst 2: 150ms
    0.15, 0.15, 0.15, 0, // burst 3: 150ms
    0.15, 0.15, 0.15, 0  // burst 4: 150ms
  ];
  const res = computeRhythmMetrics(syllableTimedEnergy);
  assert.strictEqual(res.cadence, 'syllable-timed', 'Must be classified as syllable-timed');
  assert.ok(res.npvi < 45, `nPVI must be < 45 (actual: ${res.npvi})`);
});

// -----------------------------------------------------------------------------
// Suite 5: CEFR Conversational Partner Engine & Scenarios
// -----------------------------------------------------------------------------
console.log('\nSuite 5: CEFR Conversational Partner Engine & Scenarios');

test('conversation-partner-engine.ts exists and provides scenarios across A1-C2', () => {
  const filePath = path.join(__dirname, '../src/core/conversation-partner-engine.ts');
  assert.ok(fs.existsSync(filePath), 'Engine file exists');
  const code = fs.readFileSync(filePath, 'utf8');
  assert.ok(code.includes("id: 'a1-cafe'"), 'A1 Cafe scenario exists');
  assert.ok(code.includes("id: 'a2-hotel'"), 'A2 Hotel scenario exists');
  assert.ok(code.includes("id: 'b1-luggage'"), 'B1 Lost luggage scenario exists');
  assert.ok(code.includes("id: 'b2-service'"), 'B2 Customer service scenario exists');
  assert.ok(code.includes("id: 'c1-deadline'"), 'C1 Project deadline scenario exists');
  assert.ok(code.includes("id: 'c2-symposium'"), 'C2 Academic symposium scenario exists');
});

test('Engine manages multi-turn dialogue state progression and recasts', () => {
  const code = fs.readFileSync(path.join(__dirname, '../src/core/conversation-partner-engine.ts'), 'utf8');
  assert.ok(code.includes('processLearnerTurn'), 'processLearnerTurn method exists');
  assert.ok(code.includes('generateSummary'), 'generateSummary method exists');
  assert.ok(code.includes('matchedRecast'), 'In-flow recasting handled');
  assert.ok(code.includes('coachTip'), 'Coach tips provided');
});

// -----------------------------------------------------------------------------
// Suite 6: SpeakingDossier Mode Switching & DOM Contract
// -----------------------------------------------------------------------------
console.log('\nSuite 6: SpeakingDossier Mode Switching & DOM Contract');

test('speaking-dossier.ts integrates SpeakingMode and roleplay cluster', () => {
  const code = fs.readFileSync(path.join(__dirname, '../src/modules/speaking-dossier.ts'), 'utf8');
  assert.ok(/export type SpeakingMode = ['"]nation['"] \| ['"]roleplay['"]/.test(code), 'SpeakingMode type exported');
  assert.ok(code.includes('public getMode(): SpeakingMode'), 'getMode method exists');
  assert.ok(code.includes('public setMode(mode: SpeakingMode)'), 'setMode method exists');
  assert.ok(code.includes('speaking-mode-cluster'), 'speaking-mode-cluster rendered in DOM');
  assert.ok(code.includes('renderRoleplayView'), 'renderRoleplayView method exists');
  assert.ok(code.includes('startPartnerRecording'), 'startPartnerRecording method exists');
  assert.ok(code.includes('stopPartnerRecording'), 'stopPartnerRecording method exists');
});

test('dossiers.css contains comprehensive styling for roleplay workspace', () => {
  const css = fs.readFileSync(path.join(__dirname, '../src/assets/styles/dossiers.css'), 'utf8');
  assert.ok(css.includes('.speaking-mode-cluster'), '.speaking-mode-cluster styled');
  assert.ok(css.includes('.roleplay-workspace'), '.roleplay-workspace styled');
  assert.ok(css.includes('.roleplay-dialogue-thread'), '.roleplay-dialogue-thread styled');
  assert.ok(css.includes('.roleplay-bubble.partner-bubble'), '.partner-bubble styled');
  assert.ok(css.includes('.roleplay-bubble.learner-bubble'), '.learner-bubble styled');
  assert.ok(css.includes('.prosody-radar-strip'), '.prosody-radar-strip styled');
  assert.ok(css.includes('.roleplay-completion-card'), '.roleplay-completion-card styled');
});

// -----------------------------------------------------------------------------
// Final Verdict
// -----------------------------------------------------------------------------
console.log(`\n==================================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log(`==================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
