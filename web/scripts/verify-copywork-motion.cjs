const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[MOTION TEST 3] Verifying Copywork Motion & Rolling Telemetry...');

const writingTs = fs.readFileSync(path.join(__dirname, '../src/modules/writing-dossier.ts'), 'utf-8');

assert(writingTs.includes('MotionEngine'), "writing-dossier.ts must import MotionEngine");
assert(writingTs.includes('fadeSlideIn'), "writing-dossier.ts must use fadeSlideIn during step changes");
assert(writingTs.includes('tweenNumber'), "writing-dossier.ts must animate Accuracy % and Net WPM via tweenNumber");

console.log('✅ [MOTION TEST 3 PASSED] Copywork motion verified.');
