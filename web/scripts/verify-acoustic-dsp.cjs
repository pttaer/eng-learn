// web/scripts/verify-acoustic-dsp.cjs
const assert = require('assert');

// Autocorrelation Pitch Tracking DSP Function (Core mathematical implementation to test)
function computeF0Autocorrelation(buffer, sampleRate) {
  const minFreq = 80;
  const maxFreq = 400;
  const minTau = Math.floor(sampleRate / maxFreq);
  const maxTau = Math.floor(sampleRate / minFreq);

  // Compute signal RMS
  let sumSq = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSq += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSq / buffer.length);
  if (rms < 0.015) return 0; // Unvoiced / noise floor

  let globalMaxR = -1;
  let globalBestTau = -1;
  const rValues = new Float32Array(maxTau + 2);

  // Time-domain autocorrelation
  for (let tau = minTau; tau <= maxTau; tau++) {
    let r = 0;
    let norm1 = 0;
    let norm2 = 0;
    const len = buffer.length - tau;
    for (let i = 0; i < len; i++) {
      r += buffer[i] * buffer[i + tau];
      norm1 += buffer[i] * buffer[i];
      norm2 += buffer[i + tau] * buffer[i + tau];
    }
    const denom = Math.sqrt(norm1 * norm2);
    const normR = denom > 0 ? r / denom : 0;
    rValues[tau] = normR;

    if (normR > globalMaxR) {
      globalMaxR = normR;
      globalBestTau = tau;
    }
  }

  // Voicing threshold
  if (globalMaxR < 0.65 || globalBestTau <= minTau || globalBestTau >= maxTau) {
    return 0;
  }

  // Select the first significant local maximum to prevent octave-drop (subharmonic halving)
  let bestTau = globalBestTau;
  const peakThreshold = Math.max(0.65, globalMaxR * 0.85);
  for (let tau = minTau + 1; tau < globalBestTau; tau++) {
    if (rValues[tau] > rValues[tau - 1] && rValues[tau] > rValues[tau + 1] && rValues[tau] >= peakThreshold) {
      bestTau = tau;
      break;
    }
  }

  // 3-point parabolic interpolation
  const rPrev = rValues[bestTau - 1];
  const rCurr = rValues[bestTau];
  const rNext = rValues[bestTau + 1];
  const denominator = 2 * (2 * rCurr - rPrev - rNext);
  let delta = 0;
  if (Math.abs(denominator) > 1e-6) {
    delta = (rNext - rPrev) / denominator;
  }

  const exactTau = bestTau + delta;
  return exactTau > 0 ? sampleRate / exactTau : 0;
}

// Silence & Hesitation Gap Detection
function detectSilenceGaps(energySamples, frameDurationSec, threshold = 0.02, minGapSec = 0.25) {
  const minGapFrames = Math.ceil(minGapSec / frameDurationSec);
  let totalSilenceSec = 0;
  let totalSpeechSec = 0;
  let currentSilenceRun = 0;

  for (let i = 0; i < energySamples.length; i++) {
    if (energySamples[i] < threshold) {
      currentSilenceRun++;
    } else {
      if (currentSilenceRun >= minGapFrames) {
        totalSilenceSec += currentSilenceRun * frameDurationSec;
      } else {
        totalSpeechSec += currentSilenceRun * frameDurationSec;
      }
      currentSilenceRun = 0;
      totalSpeechSec += frameDurationSec;
    }
  }

  if (currentSilenceRun >= minGapFrames) {
    totalSilenceSec += currentSilenceRun * frameDurationSec;
  } else {
    totalSpeechSec += currentSilenceRun * frameDurationSec;
  }

  return { totalSilenceSec, totalSpeechSec };
}

console.log('[TEST] Starting Acoustic Engine DSP Verification...');

// 1. Synthesize 120Hz sine wave (Male vocal pitch)
const sampleRate = 44100;
const bufferLen = 1024;
const buffer120 = new Float32Array(bufferLen);
for (let i = 0; i < bufferLen; i++) {
  buffer120[i] = 0.5 * Math.sin((2 * Math.PI * 120 * i) / sampleRate);
}
const detected120 = computeF0Autocorrelation(buffer120, sampleRate);
console.log(`- 120 Hz Test: Detected ${detected120.toFixed(2)} Hz`);
assert(Math.abs(detected120 - 120) < 2.0, `120Hz test failed: got ${detected120}`);

// 2. Synthesize 220Hz sine wave (Female vocal pitch)
const buffer220 = new Float32Array(bufferLen);
for (let i = 0; i < bufferLen; i++) {
  buffer220[i] = 0.5 * Math.sin((2 * Math.PI * 220 * i) / sampleRate);
}
const detected220 = computeF0Autocorrelation(buffer220, sampleRate);
console.log(`- 220 Hz Test: Detected ${detected220.toFixed(2)} Hz`);
assert(Math.abs(detected220 - 220) < 2.0, `220Hz test failed: got ${detected220}`);

// 3. Synthesize 330Hz sine wave
const buffer330 = new Float32Array(bufferLen);
for (let i = 0; i < bufferLen; i++) {
  buffer330[i] = 0.5 * Math.sin((2 * Math.PI * 330 * i) / sampleRate);
}
const detected330 = computeF0Autocorrelation(buffer330, sampleRate);
console.log(`- 330 Hz Test: Detected ${detected330.toFixed(2)} Hz`);
assert(Math.abs(detected330 - 330) < 2.0, `330Hz test failed: got ${detected330}`);

// 4. White noise / Unvoiced test
const bufferNoise = new Float32Array(bufferLen);
for (let i = 0; i < bufferLen; i++) {
  bufferNoise[i] = (Math.random() - 0.5) * 0.05;
}
const detectedNoise = computeF0Autocorrelation(bufferNoise, sampleRate);
console.log(`- Noise Floor Test: Detected ${detectedNoise.toFixed(2)} Hz`);
assert(detectedNoise === 0, `Noise should be deemed unvoiced (0Hz), got ${detectedNoise}`);

// 5. Silence & Hesitation detection test
// 100 frames at 20ms each (2.0s total). Frames 0-20 active (0.4s), 21-40 silence (0.4s >= 0.25s), 41-60 active (0.4s), 61-70 short pause (0.2s < 0.25s), 71-99 active (0.6s)
const energy = new Array(100).fill(0.05);
for (let i = 21; i <= 40; i++) energy[i] = 0.005; // 400ms pause
for (let i = 61; i <= 70; i++) energy[i] = 0.005; // 200ms pause (< minGap 250ms)
const gaps = detectSilenceGaps(energy, 0.02, 0.02, 0.25);
console.log(`- Silence Gap Test: Total Silence = ${gaps.totalSilenceSec.toFixed(2)}s, Speech = ${gaps.totalSpeechSec.toFixed(2)}s`);
assert.strictEqual(Math.round(gaps.totalSilenceSec * 100) / 100, 0.40, `Silence duration should be 0.40s, got ${gaps.totalSilenceSec}`);
assert.strictEqual(Math.round(gaps.totalSpeechSec * 100) / 100, 1.60, `Speech duration should be 1.60s, got ${gaps.totalSpeechSec}`);

console.log('✓ All Acoustic Engine DSP mathematical tests passed cleanly.');
