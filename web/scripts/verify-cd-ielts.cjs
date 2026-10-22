// web/scripts/verify-cd-ielts.cjs
// Regression guard on the baseline datasets the app reads (grammar, drills, collocations).
// The CD-IELTS mock outputs and their markdown sources were removed; IELTS reads src/ielts/data.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DATA_DIR = path.join(__dirname, '..', 'src', 'assets', 'data');

console.log('[TEST] Starting baseline dataset regression check...');

const grammar = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'grammar.json'), 'utf8'));
assert(grammar.length >= 168, `Grammar regression: expected >= 168 rules, got ${grammar.length}`);

const drills = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'drills.json'), 'utf8'));
assert(drills.speaking.length >= 76, `Speaking drills regression: got ${drills.speaking.length}`);
assert(drills.writing.length >= 76, `Writing drills regression: got ${drills.writing.length}`);
assert(drills.scenarios && drills.scenarios.length === 60, `Communicative scenarios regression: got ${drills.scenarios?.length}`);

const collocations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'collocations.json'), 'utf8'));
assert(collocations.length >= 1299, `Collocations regression: expected >= 1299, got ${collocations.length}`);

console.log(`  [PASS] Zero regression on baseline datasets (168 grammar rules, 76 speaking drills, 76 writing drills, 60 scenarios, ${collocations.length} collocations).`);
console.log('[TEST] BASELINE DATASET INVARIANTS SATISFIED.\n');

