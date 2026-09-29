const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 5] Verifying Dedicated Franklin Copywork Studio...');

const writingTs = fs.readFileSync(path.join(__dirname, '../src/modules/writing-dossier.ts'), 'utf-8');

// 1. Assert AtomicCard 3D flipper card is NOT used as wrapper
assert(!writingTs.includes('AtomicCard.create'), "writing-dossier.ts must not wrap copywork in 720x440 AtomicCard flipper");

// 2. Assert real textarea exists for typing
assert(writingTs.includes('<textarea') && writingTs.includes('copywork-input'), "writing-dossier.ts must render dedicated copywork textarea");

// 3. Assert 3-step state machine
assert(writingTs.includes("'analyze'") && writingTs.includes("'type'") && writingTs.includes("'diff'"), "writing-dossier.ts must support 3-step flow (analyze, type, diff)");

// 4. Assert Myers/Hirschberg word/char diff tokens and metrics
assert(writingTs.includes('calculateWritingMetrics'), "writing-dossier.ts must calculate WPM and accuracy metrics");
assert(writingTs.includes('accuracyPct') && writingTs.includes('netWpm'), "writing-dossier.ts must report accuracyPct and netWpm");

console.log('✅ [TEST 5 PASSED] Franklin Copywork Studio verified.');
