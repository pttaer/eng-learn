// web/scripts/verify-zero-cpu-idle.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('✨ ZERO-CPU IDLE OPTIMIZATION VERIFICATION SUITE');
console.log('Auditing rAF loops, Canvas Suspension, Visibility, Timers, and CSS animations');
console.log('================================================================\n');

// 1. CursorTracker Static Audit
console.log('[TEST 1] Verifying CursorTracker zero-CPU idle and visibility suspension...');
const cursorTsPath = path.join(__dirname, '../src/core/cursor-tracker.ts');
assert(fs.existsSync(cursorTsPath), 'cursor-tracker.ts must exist');
const cursorTs = fs.readFileSync(cursorTsPath, 'utf8');

assert(cursorTs.includes('public static start'), 'CursorTracker must have start()');
assert(cursorTs.includes('public static stop'), 'CursorTracker must have stop()');
assert(cursorTs.includes('public static wake'), 'CursorTracker must have wake()');
assert(cursorTs.includes('dx < 0.1 && dy < 0.1 && vx < 0.1 && vy < 0.1'), 'CursorTracker must sleep when spring reaches equilibrium');
assert(cursorTs.includes("document.visibilityState === 'hidden'"), 'CursorTracker must handle visibilitychange when hidden');
console.log('✓ [TEST 1 PASSED] CursorTracker idle and visibility suspension verified.\n');

// 2. SpeakingDossier Dual-Trace Canvas Audit
console.log('[TEST 2] Verifying SpeakingDossier dual-trace oscilloscope idle pause and visibility handling...');
const speakingTsPath = path.join(__dirname, '../src/modules/speaking-dossier.ts');
assert(fs.existsSync(speakingTsPath), 'speaking-dossier.ts must exist');
const speakingTs = fs.readFileSync(speakingTsPath, 'utf8');

assert(speakingTs.includes('if (!this.isTimerRunning)'), 'initDualTraceCanvas must check !isTimerRunning');
assert(speakingTs.includes('this.drawWaveformFrame(canvas)'), 'initDualTraceCanvas must draw single static frame');
assert(speakingTs.includes('if (this.isReducedMotion() || !this.isTimerRunning)'), 'Waveform draw loop must halt rAF when idle or reduced motion');
assert(speakingTs.includes('document.hidden'), 'Waveform draw loop must check document.hidden');
assert(speakingTs.includes('!canvas.isConnected'), 'Waveform draw loop must halt if canvas is disconnected');
assert(speakingTs.includes("addEventListener('visibilitychange'"), 'SpeakingDossier must observe visibilitychange');
console.log('✓ [TEST 2 PASSED] SpeakingDossier idle canvas pause and visibility verified.\n');

// 3. CornerCompass Mini-Urchin Loop Audit
console.log('[TEST 3] Verifying CornerCompass mini-urchin idle and background suspension...');
const compassTsPath = path.join(__dirname, '../src/modules/corner-compass.ts');
assert(fs.existsSync(compassTsPath), 'corner-compass.ts must exist');
const compassTs = fs.readFileSync(compassTsPath, 'utf8');

assert(compassTs.includes('Date.now() - this.lastActiveTime > 3500'), 'CornerCompass must suspend spinning when user is idle');
assert(compassTs.includes('document.hidden'), 'CornerCompass must pause loop when document is hidden');
assert(compassTs.includes("getAttribute('data-motion') === 'reduce'"), 'CornerCompass must check reduced motion attribute');
assert(compassTs.includes('this.bindActivityListeners()'), 'CornerCompass constructor must bind activity listeners');
assert(compassTs.includes('isVisibleState: boolean = true'), 'CornerCompass isVisibleState must initialize to true');
console.log('✓ [TEST 3 PASSED] CornerCompass idle and background suspension verified.\n');

// 4. PerspectiveCanvas & NebulaCanvas Audit
console.log('[TEST 4] Verifying PerspectiveCanvas & NebulaCanvas idle and background suspension...');
const perspectiveTsPath = path.join(__dirname, '../src/core/perspective-canvas.ts');
assert(fs.existsSync(perspectiveTsPath), 'perspective-canvas.ts must exist');
const perspectiveTs = fs.readFileSync(perspectiveTsPath, 'utf8');

assert(perspectiveTs.includes('Date.now() - this.lastActiveTime > 20000'), 'PerspectiveCanvas must pause loop after inactivity');
assert(perspectiveTs.includes('Date.now() - this.lastActiveTime > 15000'), 'NebulaCanvas must pause loop after inactivity');
assert(perspectiveTs.includes('document.hidden'), 'Canvas loops must check document.hidden');
assert(perspectiveTs.includes('this.bindActivity()'), 'PerspectiveCanvas constructor must bind activity');
console.log('✓ [TEST 4 PASSED] PerspectiveCanvas and NebulaCanvas suspension verified.\n');

// 5. ListeningTraps Waveform Canvas Audit
console.log('[TEST 5] Verifying IELTS Listening Traps waveform zero-CPU suspension...');
const trapsTsPath = path.join(__dirname, '../src/ielts/views/listening-traps.ts');
assert(fs.existsSync(trapsTsPath), 'listening-traps.ts must exist');
const trapsTs = fs.readFileSync(trapsTsPath, 'utf8');

assert(trapsTs.includes('!isPlaying || !canvas.isConnected'), 'ListeningTraps must pause when not playing or disconnected');
assert(trapsTs.includes('document.hidden'), 'ListeningTraps must pause when document is hidden');
assert(trapsTs.includes("addEventListener('visibilitychange'"), 'ListeningTraps must observe visibilitychange');
console.log('✓ [TEST 5 PASSED] ListeningTraps waveform suspension verified.\n');

// 6. ParticleCanvas Celebration Audit
console.log('[TEST 6] Verifying ParticleCanvas background tab suspension...');
const particleTsPath = path.join(__dirname, '../src/core/particle-canvas.ts');
assert(fs.existsSync(particleTsPath), 'particle-canvas.ts must exist');
const particleTs = fs.readFileSync(particleTsPath, 'utf8');

assert(particleTs.includes("addEventListener('visibilitychange'"), 'ParticleCanvas must observe visibilitychange');
assert(particleTs.includes('this.clear()'), 'ParticleCanvas must clear and cancel rAF on hidden tab');
console.log('✓ [TEST 6 PASSED] ParticleCanvas suspension verified.\n');

// 7. UsageTracker Idle & Background Timer Suspension Audit
console.log('[TEST 7] Verifying UsageTracker interval zero-CPU suspension...');
const usageTsPath = path.join(__dirname, '../src/core/usage-tracker.ts');
assert(fs.existsSync(usageTsPath), 'usage-tracker.ts must exist');
const usageTs = fs.readFileSync(usageTsPath, 'utf8');

assert(usageTs.includes('resumeTimer'), 'UsageTracker must have resumeTimer()');
assert(usageTs.includes('stopTimer'), 'UsageTracker must have stopTimer()');
assert(usageTs.includes('now - this.lastInput > IDLE_MS'), 'UsageTracker must stop timer when idle');
console.log('✓ [TEST 7 PASSED] UsageTracker idle and background interval suspension verified.\n');

// 8. CSS Infinite Animations Audit
console.log('[TEST 8] Verifying CSS infinite animation boundaries...');
const dossiersCssPath = path.join(__dirname, '../src/assets/styles/dossiers.css');
const dossiersCss = fs.readFileSync(dossiersCssPath, 'utf8');
assert(!dossiersCss.includes('.node-unlocked .node-circle {\n  animation: pulseGoldRing'), 'Constellation node circle must not animate stroke infinitely on idle');
assert(dossiersCss.includes('.node-unlocked:hover .node-circle'), 'pulseGoldRing must only run on hover/focus');

const ieltsCssPath = path.join(__dirname, '../src/ielts/ielts.css');
const ieltsCss = fs.readFileSync(ieltsCssPath, 'utf8');
assert(!ieltsCss.includes('ie-pulse-evidence 2s ease infinite'), 'ie-pulse-evidence must not loop infinitely');
assert(ieltsCss.includes('ie-pulse-evidence 2s ease 3 alternate'), 'ie-pulse-evidence must be bounded to 3 iterations');

const scrollCssPath = path.join(__dirname, '../src/core/scroll-affordance.css');
const scrollCss = fs.readFileSync(scrollCssPath, 'utf8');
assert(!scrollCss.includes('.hud-scroll-arrow {\n  animation: hud-arrow-pulse 2s ease-in-out infinite'), 'Scroll affordance arrow must not pulse infinitely when idle/hidden');
assert(scrollCss.includes('hud-arrow-pulse 2s ease-in-out 3 alternate'), 'Scroll affordance arrow must be bounded to 3 iterations');

const tourCssPath = path.join(__dirname, '../src/assets/styles/tour-spotlight.css');
const tourCss = fs.readFileSync(tourCssPath, 'utf8');
assert(!tourCss.includes('tourGlowPulse 2s infinite'), 'tourGlowPulse must not run infinitely');
assert(tourCss.includes('tourGlowPulse 2s 4 alternate'), 'tourGlowPulse must be bounded');
console.log('✓ [TEST 8 PASSED] CSS infinite animation boundaries verified.\n');

console.log('================================================================');
console.log('✅ ALL ZERO-CPU IDLE OPTIMIZATION VERIFICATIONS PASSED (100% SUCCESS)');
console.log('================================================================');
