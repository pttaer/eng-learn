// web/scripts/verify-cd-ielts.cjs
// Headless test suite asserting CD-IELTS Mock Suite & High-Stakes L2 Pragmatic Roleplays (ENG-107)
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const DATA_DIR = path.join(__dirname, '..', 'src', 'assets', 'data');
const { compileIelts } = require('./compile-content.cjs');

console.log('[TEST] Starting CD-IELTS 4-Skill Mock Dataset & Pragmatic Roleplay Verification (ENG-107)...');

// 1. Assert markdown source files exist
const ieltsFiles = [
  'academic-reading.md',
  'listening-sections.md',
  'writing-tasks.md',
  'speaking-cue-cards.md',
  'pragmatic-roleplays.md'
];

ieltsFiles.forEach(f => {
  const fp = path.join(CONTENT_DIR, 'ielts', f);
  assert(fs.existsSync(fp), `Missing IELTS markdown source file: ${fp}`);
});
console.log('  [PASS] All 5 IELTS markdown source files exist.');

// 2. Assert compilation roundtrip
try {
  compileIelts();
  console.log('  [PASS] compileIelts() executed cleanly.');
} catch (err) {
  assert.fail(`compileIelts() failed: ${err.message}`);
}

// 3. Validate ielts.json schema & content
const ieltsPath = path.join(DATA_DIR, 'ielts.json');
assert(fs.existsSync(ieltsPath), `ielts.json missing at ${ieltsPath}`);
const ielts = JSON.parse(fs.readFileSync(ieltsPath, 'utf8'));

assert.ok(ielts.title && ielts.standards, 'Metadata header missing in ielts.json');

// --- A. Reading Module Verification ---
assert.ok(ielts.reading, 'ielts.reading missing');
assert.ok(ielts.reading.paragraphs && Object.keys(ielts.reading.paragraphs).length >= 7,
  'Reading must contain paragraphs A-G');
assert.strictEqual(ielts.reading.questions.length, 13,
  `Reading must contain exactly 13 questions, got ${ielts.reading.questions.length}`);

// Validate reading question types
const headings = ielts.reading.questions.filter(q => q.type === 'HEADING_MATCHING');
assert.strictEqual(headings.length, 6, `Expected 6 Heading Matching questions, got ${headings.length}`);

const tfng = ielts.reading.questions.filter(q => q.type === 'TRUE_FALSE_NOT_GIVEN');
assert.strictEqual(tfng.length, 4, `Expected 4 True/False/Not Given questions, got ${tfng.length}`);

const summary = ielts.reading.questions.filter(q => q.type === 'SUMMARY_COMPLETION');
assert.strictEqual(summary.length, 3, `Expected 3 Summary Completion questions, got ${summary.length}`);

console.log('  [PASS] Academic Reading verified: Paragraphs A-G, 13 questions (6 Headings, 4 TFNG, 3 Summary).');

// --- B. Listening Module Verification ---
assert.ok(ielts.listening && ielts.listening.section1 && ielts.listening.section2, 'Listening sections missing');
assert.strictEqual(ielts.listening.section1.questions.length, 10,
  `Listening Section 1 must have 10 questions, got ${ielts.listening.section1.questions.length}`);
assert.strictEqual(ielts.listening.section2.questions.length, 10,
  `Listening Section 2 must have 10 questions, got ${ielts.listening.section2.questions.length}`);

const s2Mc = ielts.listening.section2.questions.filter(q => q.type === 'MULTIPLE_CHOICE');
const s2Map = ielts.listening.section2.questions.filter(q => q.type === 'MAP_MATCHING');
assert.strictEqual(s2Mc.length, 5, `Expected 5 Multiple Choice questions in Section 2, got ${s2Mc.length}`);
assert.strictEqual(s2Map.length, 5, `Expected 5 Map/Facility Matching questions in Section 2, got ${s2Map.length}`);

console.log('  [PASS] Listening verified: 20 total questions (10 Form Completion, 5 MC, 5 Map/Facility Matching).');

// --- C. Writing Module Verification ---
assert.ok(ielts.writing && ielts.writing.task1 && ielts.writing.task2, 'Writing tasks missing');
assert.ok(ielts.writing.task1.chartSvg && ielts.writing.task1.chartSvg.includes('<svg'),
  'Task 1 must contain valid procedural SVG chart metrics');
assert.ok(ielts.writing.task1.modelAnswer && ielts.writing.task1.modelAnswer.split(/\s+/).length >= 150,
  'Task 1 model answer must exceed 150 words');

assert.ok(ielts.writing.task2.prompt && ielts.writing.task2.prompt.length > 50, 'Task 2 prompt missing');
assert.ok(ielts.writing.task2.band6Model && ielts.writing.task2.band6Model.split(/\s+/).length >= 250,
  'Task 2 Band 6 model must exceed 250 words');
assert.ok(ielts.writing.task2.band8Model && ielts.writing.task2.band8Model.split(/\s+/).length >= 250,
  'Task 2 Band 8 model must exceed 250 words');
assert.ok(ielts.writing.task2.critique && ielts.writing.task2.critique.length > 20,
  'Task 2 must include analytical pedagogical critique comparing Band 6 vs Band 8');

console.log('  [PASS] Writing verified: Task 1 (SVG line chart + Band 8.5 model) & Task 2 (Band 6 vs Band 8.5 comparative models).');

// --- D. Speaking Module Verification ---
assert.ok(ielts.speaking && ielts.speaking.part1Topics && ielts.speaking.part2 && ielts.speaking.part3Theme,
  'Speaking parts missing');
assert.strictEqual(ielts.speaking.part2.prepTimeSeconds, 60, 'Part 2 prep time must be 60 seconds');
assert.ok(ielts.speaking.part2.modelMonologue && ielts.speaking.part2.modelMonologue.split(/\s+/).length >= 150,
  'Part 2 model monologue must exceed 150 words');

console.log('  [PASS] Speaking verified: Parts 1, 2 (cue card with 60s prep + Band 8.5 monologue), and Part 3 abstract discussion.');

// --- E. Pragmatic Roleplays Verification ---
assert.ok(Array.isArray(ielts.pragmaticRoleplays), 'pragmaticRoleplays must be an array');
assert.strictEqual(ielts.pragmaticRoleplays.length, 4,
  `Expected exactly 4 high-stakes pragmatic roleplays, got ${ielts.pragmaticRoleplays.length}`);

const requiredRoleplayFields = [
  'id', 'cefrLevel', 'domain', 'pragmaticFocus', 'interlocutor',
  'context', 'friction', 'vietnamese', 'exemplarExchange', 'sieves'
];

ielts.pragmaticRoleplays.forEach(rp => {
  requiredRoleplayFields.forEach(f => {
    assert(rp[f] !== undefined, `Roleplay ${rp.id} missing field '${f}'`);
  });

  assert(rp.cefrLevel === 'C1' || rp.cefrLevel === 'C2',
    `Roleplay ${rp.id} must be C1 or C2 level, got ${rp.cefrLevel}`);
  assert.ok(rp.exemplarExchange.challenge && rp.exemplarExchange.modelResponse,
    `Roleplay ${rp.id} missing complete exemplar exchange transcript`);

  // Assert all 4 anti-fossilization sieves exist
  const sieves = rp.sieves;
  assert.ok(sieves.thesisAvoidance && sieves.thesisAvoidance.length > 0,
    `Roleplay ${rp.id} missing thesis avoidance sieve`);
  assert.ok(sieves.mechanicalConnectors && sieves.mechanicalConnectors.length > 0,
    `Roleplay ${rp.id} missing mechanical connector sieve`);
  assert.ok(sieves.thesaurusClichés && sieves.thesaurusClichés.length > 0,
    `Roleplay ${rp.id} missing thesaurus cliché sieve`);
  assert.ok(sieves.phoneticCoda && sieves.phoneticCoda.length > 0,
    `Roleplay ${rp.id} missing phonetic coda release sieve`);

  // Assert Vietnamese translation has diacritics
  assert(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(rp.vietnamese),
    `Roleplay ${rp.id} Vietnamese summary missing diacritics: ${rp.vietnamese}`);
});

console.log('  [PASS] 4 High-Stakes L2 Pragmatic Roleplays verified with all 4 Vietnamese L1 anti-fossilization sieves.');

// --- F. Zero Regression Verification ---
const grammar = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'grammar.json'), 'utf8'));
assert(grammar.length >= 168, `Grammar regression: expected >= 168 rules, got ${grammar.length}`);

const drills = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'drills.json'), 'utf8'));
assert(drills.speaking.length >= 76, `Speaking drills regression: got ${drills.speaking.length}`);
assert(drills.writing.length >= 76, `Writing drills regression: got ${drills.writing.length}`);
assert(drills.scenarios && drills.scenarios.length === 60, `Communicative scenarios regression: got ${drills.scenarios?.length}`);

const collocations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'collocations.json'), 'utf8'));
assert.strictEqual(collocations.length, 1336, `Collocations regression: expected 1336, got ${collocations.length}`);

console.log('  [PASS] Zero regression on baseline datasets (168 grammar rules, 76 speaking drills, 76 writing drills, 60 scenarios, 1336 collocations).');
console.log('[TEST] ALL CD-IELTS & PRAGMATIC ROLEPLAY INVARIANTS SATISFIED (ENG-107).\n');
