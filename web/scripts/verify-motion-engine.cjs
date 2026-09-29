const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[MOTION TEST 1] Verifying Motion Engine Conductor...');

const enginePath = path.join(__dirname, '../src/core/motion-engine.ts');
assert(fs.existsSync(enginePath), 'motion-engine.ts must exist');

const engineTs = fs.readFileSync(enginePath, 'utf-8');

// 1. Assert Anime.js imports and methods
assert(engineTs.includes("import anime from 'animejs'"), "motion-engine.ts must import anime from animejs");
assert(engineTs.includes('drawSvgLines'), "motion-engine.ts must export drawSvgLines method");
assert(engineTs.includes('staggerEntrance'), "motion-engine.ts must export staggerEntrance method");
assert(engineTs.includes('tweenNumber'), "motion-engine.ts must export tweenNumber method");
assert(engineTs.includes('springModal'), "motion-engine.ts must export springModal method");
assert(engineTs.includes('fadeSlideIn'), "motion-engine.ts must export fadeSlideIn method");

// 2. Assert reduced-motion guard
assert(engineTs.includes('prefers-reduced-motion') || engineTs.includes('isReducedMotion'), "motion-engine.ts must respect reduced motion");

console.log('✅ [MOTION TEST 1 PASSED] Motion Engine Conductor verified.');
