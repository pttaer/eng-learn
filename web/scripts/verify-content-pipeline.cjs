// web/scripts/verify-content-pipeline.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DATA_DIR = path.join(__dirname, '..', 'src', 'assets', 'data');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

console.log('[TEST] Starting Content Pipeline Verification...');

// 1. Verify content source directory exists
assert(fs.existsSync(CONTENT_DIR), `Content directory missing: ${CONTENT_DIR}`);

// 2. Validate collocations.json
const collocations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'collocations.json'), 'utf8'));
assert(Array.isArray(collocations), 'collocations must be an array');
assert.strictEqual(collocations.length, 1000, `Expected 1000 collocations, got ${collocations.length}`);
assert(collocations[0].id && collocations[0].phrase && collocations[0].vietnamese && collocations[0].category, 'Collocation item schema mismatch');
const phrases = collocations.map(c => c.phrase.toLowerCase());
const dupes = phrases.filter((p, i) => phrases.indexOf(p) !== i);
assert.strictEqual(dupes.length, 0, `Duplicate collocations: ${dupes.join(", ")}`);

// 3. Validate grammar.json
const grammar = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'grammar.json'), 'utf8'));
assert(Array.isArray(grammar), 'grammar must be an array');
assert.strictEqual(grammar.length, 72, `Expected 72 grammar rules, got ${grammar.length}`);
assert(grammar[0].id && grammar[0].promptSentence && grammar[0].targetTransformation && grammar[0].formula, 'Grammar item schema mismatch');

// 4. Validate vocabulary.json
const vocab = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'vocabulary.json'), 'utf8'));
assert(Array.isArray(vocab), 'vocabulary must be an array');
assert.strictEqual(vocab.length, 180, `Expected 180 vocabulary items, got ${vocab.length}`);
assert(vocab[0].id && vocab[0].wordOrChunk && vocab[0].definition && vocab[0].breakdown, 'Vocabulary item schema mismatch');

// 5. Validate drills.json
const drills = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'drills.json'), 'utf8'));
assert(Array.isArray(drills.speaking), 'drills.speaking must be an array');
assert.strictEqual(drills.speaking.length, 40, `Expected 40 speaking drills, got ${drills.speaking.length}`);
assert(Array.isArray(drills.writing), 'drills.writing must be an array');
assert.strictEqual(drills.writing.length, 40, `Expected 40 writing drills, got ${drills.writing.length}`);

// 6. Validate reading.json
const reading = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'reading.json'), 'utf8'));
assert(Array.isArray(reading.articles), 'reading.articles must be an array');
assert(reading.articles.length >= 6, `Expected at least 6 reading articles, got ${reading.articles.length}`);
assert(reading.articles[0].fourPassProtocol.pass1ColdRead.comprehensionChecks.length > 0, 'Pass 1 checks missing');
assert(reading.articles[0].fourPassProtocol.pass2SyntaxDissection.length > 0, 'Pass 2 syntax dissection missing');
assert(reading.articles[0].fourPassProtocol.pass3SentenceMining.length > 0, 'Pass 3 sentence mining missing');

// 7. Validate listening.json
const listening = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listening.json'), 'utf8'));
assert(Array.isArray(listening.rules), 'listening.rules must be an array');
assert(Array.isArray(listening.samplePassages), 'listening.samplePassages must be an array');
assert(listening.samplePassages.length >= 9, `Expected at least 9 listening passages, got ${listening.samplePassages.length}`);

const habits = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'habits.json'), 'utf8'));
habits.days.forEach(d => assert(d.tasks.length >= 3, `Day ${d.day} has ${d.tasks.length} tasks`));
console.log('[TEST] PASSED: All 7 content datasets satisfy production schema and count invariants.');
