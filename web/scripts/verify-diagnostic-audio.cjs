// web/scripts/verify-diagnostic-audio.cjs
// Verification suite for Listening Audio Prompts & Acoustic Telemetry (ENG-68)

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const SRC = path.join(__dirname, '..', 'src');

console.log('=== TEST 1: AudioSynthesizer Shimmer and Soundscape Contracts ===');

const audioCode = fs.readFileSync(path.join(SRC, 'core', 'audio-synthesizer.ts'), 'utf8');

// 1.1 Sound effect types
assert(audioCode.includes("'stage-fanfare'"), "'stage-fanfare' sound effect type must be present in SoundEffectType");
assert(audioCode.includes("'radar-reveal'"), "'radar-reveal' sound effect type must be present in SoundEffectType");

// 1.2 Dispatch wiring
assert(audioCode.includes("case 'stage-fanfare':"), 'dispatchCase must route stage-fanfare');
assert(audioCode.includes("case 'radar-reveal':"), 'dispatchCase must route radar-reveal');

// 1.3 Pythagorean Pentatonic Frequencies for 5 skills in playRadarReveal
// D4 (293.66Hz), F#4 (369.99Hz), A4 (440Hz), C#5 (554.37Hz), E5 (659.25Hz)
assert(audioCode.includes('293.66'), 'Vocab root frequency D4 (293.66Hz) must be present in playRadarReveal');
assert(audioCode.includes('369.99'), 'Grammar third frequency F#4 (369.99Hz) must be present in playRadarReveal');
assert(audioCode.includes('440.00'), 'Reading fifth frequency A4 (440Hz) must be present in playRadarReveal');
assert(audioCode.includes('554.37'), 'Listening seventh frequency C#5 (554.37Hz) must be present in playRadarReveal');
assert(audioCode.includes('659.25'), 'Writing ninth frequency E5 (659.25Hz) must be present in playRadarReveal');

console.log('PASSED: AudioSynthesizer pentatonic soundscape contracts verified.');

console.log('=== TEST 2: Listening Prompt Speech Telemetry in MultiSkillQuizModal ===');

const modalCode = fs.readFileSync(path.join(SRC, 'modules', 'multi-skill-quiz-modal.ts'), 'utf8');

// 2.1 Audio Speech Synthesis method in Modal & AudioSynthesizer
assert(modalCode.includes('playSpeechPrompt(') || modalCode.includes('playAudio('), 'Audio prompt playback method must be implemented');
assert(audioCode.includes('speechSynthesis'), 'SpeechSynthesis API must be utilized in AudioSynthesizer');
assert(audioCode.includes('SpeechSynthesisUtterance'), 'SpeechSynthesisUtterance must be instantiated in AudioSynthesizer');
assert(modalCode.includes('AudioSynthesizer.speak'), 'Modal must delegate speech playback to AudioSynthesizer.speak');

// 2.2 Speed chips and playback controls
assert(modalCode.includes('speed-chip'), 'Speed chips must be rendered for listening playback rate selection');
assert(modalCode.includes('quiz-listen-btn') || modalCode.includes('btn-listening-play'), 'Play audio prompt button must be rendered');
assert(modalCode.includes('[0.8, 1.0, 1.2]') || modalCode.includes('0.8'), 'Speed rates must be configured');

// 2.3 Acoustic feedback triggers
assert(modalCode.includes("AudioSynthesizer.play('absorb')"), 'Correct answer must trigger absorb sound');
assert(modalCode.includes("AudioSynthesizer.play('alarm')"), 'Incorrect answer must trigger alarm sound');
assert(modalCode.includes("AudioSynthesizer.play('stage-fanfare')"), 'Stage completion must trigger stage-fanfare');
assert(modalCode.includes("AudioSynthesizer.play('radar-reveal')"), 'Radar view must trigger radar-reveal');

console.log('PASSED: Listening audio telemetry and playback controls verified.');

console.log('=== TEST 3: Audio Prompt Coverage Across Tiers ===');

// Check that listening questions in modal or placement engine have non-empty audio prompts
assert(modalCode.includes("audioText: 'Nice to meet you. How are you?'"), 'A1 audio text must be defined');
assert(modalCode.includes("audioText: 'Could you tell me the way to the station?'"), 'A2 audio text must be defined');

const placementCode = fs.readFileSync(path.join(SRC, 'core', 'multi-skill-placement.ts'), 'utf8');
assert(placementCode.includes('audioPrompt:'), 'audioPrompt field must be populated in placement battery');

console.log('PASSED: Audio prompt coverage across CEFR tiers verified.');

console.log('======================================================');
console.log('ALL ASSERTIONS PASSED: ENG-68 Listening Audio Prompts & Telemetry');
console.log('======================================================');
