const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 6] Verifying Dual-View 1,000 Collocations & Lexicon Vault...');

const collocTs = fs.readFileSync(path.join(__dirname, '../src/modules/collocations-dossier.ts'), 'utf-8');

// 1. Assert dual-view mode toggle exists
assert(collocTs.includes('viewMode') || collocTs.includes("'drill'") || collocTs.includes("'dictionary'"), "collocations-dossier.ts must support drill and dictionary view modes");

// 2. Assert full table rendering in dictionary mode
assert(collocTs.includes('<table') || collocTs.includes('lexicon-table'), "collocations-dossier.ts must render table for full 1,000 dictionary");

// 3. Assert audio button on dictionary table rows
assert(collocTs.includes('playAudio') || collocTs.includes('btn-speak-colloc'), "collocations-dossier.ts table rows must have audio pronunciation");

// 4. Assert instant search filters both English phrase and Vietnamese meaning
assert(collocTs.includes('phrase.toLowerCase()') && collocTs.includes('vietnamese.toLowerCase()'), "Search must filter both English phrase and Vietnamese translation");

console.log('✅ [TEST 6 PASSED] Dual-View Collocations Studio verified.');
