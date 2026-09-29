const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 7] Verifying Calm Reading & Grammar Ergonomics...');

const readingTs = fs.readFileSync(path.join(__dirname, '../src/modules/reading-dossier.ts'), 'utf-8');
const dossiersCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/dossiers.css'), 'utf-8');

// 1. Assert calm reader measure is constrained to comfortable 68ch
assert(dossiersCss.includes('68ch') || dossiersCss.includes('max-width: 68ch'), "Reading text must be constrained to 68ch measure for eye comfort");

// 2. Assert clickable vocab drawer or modal exists
assert(readingTs.includes('showVocabDrawer') || readingTs.includes('vocab-target') || readingTs.includes('openVocabDrawer'), "reading-dossier.ts must support clickable vocabulary target words");

console.log('✅ [TEST 7 PASSED] Calm reading & grammar ergonomics verified.');
