// web/scripts/verify-cefr-pedagogy.cjs
// Headless test suite asserting CEFR Pedagogy: Vietnamese L1 Contrastive Repair & Communicative Can-Do Scenarios
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const DATA_DIR = path.join(__dirname, '..', 'src', 'assets', 'data');
const { compileGrammar, compileDrills } = require('./compile-content.cjs');

console.log('[TEST] Starting CEFR Pedagogy & L1 Contrastive Verification (ENG-97)...');

// 1. Assert markdown source file existence
const l1MdPath = path.join(CONTENT_DIR, 'grammar', 'l1-contrastive.md');
const scenMdPath = path.join(CONTENT_DIR, 'drills', 'communicative-scenarios.md');

assert(fs.existsSync(l1MdPath), `Missing L1 contrastive markdown source: ${l1MdPath}`);
assert(fs.existsSync(scenMdPath), `Missing communicative scenarios markdown source: ${scenMdPath}`);
console.log('  [PASS] Markdown source files exist.');

// 2. Assert compilation roundtrip
try {
  compileGrammar();
  compileDrills();
  console.log('  [PASS] Compilation roundtrip succeeded without error.');
} catch (err) {
  assert.fail(`Compilation roundtrip failed: ${err.message}`);
}

// 3. Validate grammar.json L1 Contrastive Repair dataset
const grammarJsonPath = path.join(DATA_DIR, 'grammar.json');
assert(fs.existsSync(grammarJsonPath), `grammar.json missing: ${grammarJsonPath}`);
const grammar = JSON.parse(fs.readFileSync(grammarJsonPath, 'utf8'));

assert(Array.isArray(grammar), 'grammar.json must be an array');
assert(grammar.length >= 168, `Expected at least 168 grammar rules (144 existing + 24 L1), got ${grammar.length}`);

const l1Rules = grammar.filter(g => g.mode === 'L1_CONTRASTIVE_REPAIR');
assert.strictEqual(l1Rules.length, 24, `Expected exactly 24 L1 contrastive rules, got ${l1Rules.length}`);

// Verify required schema fields for L1 rules
const requiredL1Fields = [
  'id', 'mode', 'vector', 'trap', 'cefrLevel', 'promptSentence',
  'targetTransformation', 'grammaticalCue', 'vietnamese', 'formula',
  'analysis', 'exemplarContext'
];

const vectors = new Set();
const vectorCounts = {};
const l1CefrCounts = {};

l1Rules.forEach((rule, idx) => {
  requiredL1Fields.forEach(f => {
    assert(rule[f] !== undefined && String(rule[f]).trim().length > 0,
      `Rule ${rule.id || idx} missing required field '${f}'`);
  });

  vectors.add(rule.vector);
  vectorCounts[rule.vector] = (vectorCounts[rule.vector] || 0) + 1;
  l1CefrCounts[rule.cefrLevel] = (l1CefrCounts[rule.cefrLevel] || 0) + 1;

  // Assert Vietnamese diacritics presence
  assert(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(rule.vietnamese),
    `Rule ${rule.id} Vietnamese translation missing proper diacritics: ${rule.vietnamese}`);
});

// Assert all 4 primary fossilization vectors are present with exactly 6 rules each
const expectedVectors = ['FINAL_CONSONANTS', 'ZERO_COPULA', 'TENSE_ASPECT', 'CLASSIFIERS_COUNT'];
expectedVectors.forEach(vec => {
  assert(vectors.has(vec), `Missing expected L1 vector: ${vec}`);
  assert.strictEqual(vectorCounts[vec], 6, `Vector ${vec} must contain exactly 6 rules, got ${vectorCounts[vec]}`);
});

// Assert coverage across all 6 CEFR tiers (A1 to C2)
['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(tier => {
  assert((l1CefrCounts[tier] || 0) >= 4, `CEFR tier ${tier} must have at least 4 L1 rules, got ${l1CefrCounts[tier]}`);
});

console.log(`  [PASS] 24 L1 Contrastive rules verified: 4 vectors x 6 rules across A1-C2.`);

// 4. Validate drills.json Communicative Scenarios dataset
const drillsJsonPath = path.join(DATA_DIR, 'drills.json');
assert(fs.existsSync(drillsJsonPath), `drills.json missing: ${drillsJsonPath}`);
const drills = JSON.parse(fs.readFileSync(drillsJsonPath, 'utf8'));

assert(Array.isArray(drills.scenarios), 'drills.scenarios must be an array');
assert(Array.isArray(drills.communicativeScenarios), 'drills.communicativeScenarios alias must be an array');
assert.strictEqual(drills.scenarios.length, 60, `Expected exactly 60 communicative scenarios, got ${drills.scenarios.length}`);

const requiredScenarioFields = [
  'id', 'index', 'cefrLevel', 'mode', 'domain', 'canDo',
  'interlocutor', 'context', 'friction', 'outcome',
  'timeCondition', 'scaffold', 'vietnamese'
];

const scenarioCefrCounts = {};
const scenarioModes = new Set();
const scenarioDomains = new Set();

drills.scenarios.forEach((scen, idx) => {
  requiredScenarioFields.forEach(f => {
    assert(scen[f] !== undefined && String(scen[f]).trim().length > 0,
      `Scenario ${scen.id || idx} missing required field '${f}'`);
  });

  assert.strictEqual(scen.index, idx + 1, `Scenario index must be strictly sequential: expected ${idx + 1}, got ${scen.index}`);
  scenarioCefrCounts[scen.cefrLevel] = (scenarioCefrCounts[scen.cefrLevel] || 0) + 1;
  scenarioModes.add(scen.mode);
  scenarioDomains.add(scen.domain);

  // Assert Vietnamese translation has diacritics
  assert(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(scen.vietnamese),
    `Scenario ${scen.id} Vietnamese summary missing diacritics: ${scen.vietnamese}`);
});

// Assert exact 10 scenarios per CEFR tier
['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(tier => {
  assert.strictEqual(scenarioCefrCounts[tier], 10,
    `CEFR tier ${tier} must have exactly 10 scenarios, got ${scenarioCefrCounts[tier]}`);
});

// Assert communicative modes and domains
assert(scenarioModes.has('SPOKEN_INTERACTION'), 'Must cover SPOKEN_INTERACTION mode');
assert(scenarioModes.has('SPOKEN_PRODUCTION'), 'Must cover SPOKEN_PRODUCTION mode');
assert(scenarioModes.has('WRITTEN_INTERACTION') || scenarioModes.has('WRITTEN_PRODUCTION'), 'Must cover written modes');
assert(scenarioModes.has('MEDIATION'), 'Must cover MEDIATION mode');

['PERSONAL', 'PUBLIC', 'OCCUPATIONAL', 'EDUCATIONAL'].forEach(dom => {
  assert(scenarioDomains.has(dom), `Must cover ${dom} domain`);
});

console.log('  [PASS] 60 Communicative Scenarios verified: 10 per CEFR tier (A1-C2), all 4 domains covered.');

// 5. Assert zero regression on existing datasets
assert(drills.speaking.length >= 76, `Speaking drills regression: got ${drills.speaking.length}`);
assert(drills.writing.length >= 76, `Writing drills regression: got ${drills.writing.length}`);

const nonL1Rules = grammar.filter(g => g.mode !== 'L1_CONTRASTIVE_REPAIR');
assert.strictEqual(nonL1Rules.length, 144, `Non-L1 grammar rules regression: expected 144, got ${nonL1Rules.length}`);

const collocations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'collocations.json'), 'utf8'));
assert.strictEqual(collocations.length, 1336, `Collocations count regression: expected 1336, got ${collocations.length}`);

console.log('  [PASS] Zero regression on baseline datasets (144 grammar rules, 76 speaking drills, 76 writing drills, 1336 collocations).');
console.log('[TEST] ALL CEFR PEDAGOGICAL INVARIANTS SATISFIED (ENG-97).\n');
