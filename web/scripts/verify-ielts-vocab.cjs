// IELTS topic vocabulary deck (src/ielts/data/vocab.json): schema, unique headwords, examples, totals, SRS wiring.
// `node verify-ielts-vocab.cjs parts/vocab-x.json` checks one authoring part (no deck totals).
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DATA = path.join(__dirname, '..', 'src', 'ielts', 'data');
const TOPICS = ['environment', 'education', 'technology', 'health', 'work', 'crime', 'media', 'transport', 'urban', 'globalisation',
  'arts', 'science', 'family', 'food', 'travel', 'government', 'energy', 'language', 'sport', 'population'];
const POS = ['noun', 'verb', 'adjective', 'adverb', 'phrase'];
const BANDS = [6.5, 7, 7.5, 8];
const USES = ['writing', 'speaking', 'reading', 'listening'];
const words = s => s.trim().split(/\s+/).length;
// A form of the headword must appear: first 4+ letters of its first content word (handles plurals, -ed, -ing).
const stem = w => { const t = w.toLowerCase().replace(/^(to|a|an|the) /, '').split(/[\s-]+/)[0]; return t.slice(0, Math.max(4, t.length - 3)); };

function check(items, where) {
  const ids = new Set();
  for (const v of items) {
    const at = `${where}/${v.id}`;
    assert(v.id && !ids.has(v.id), `${at}: missing/duplicate id`);
    ids.add(v.id);
    assert(TOPICS.includes(v.topic), `${at}: unknown topic ${v.topic}`);
    assert(typeof v.word === 'string' && v.word.trim() === v.word && v.word, `${at}: bad word`);
    assert(POS.includes(v.pos), `${at}: bad pos ${v.pos}`);
    assert(BANDS.includes(v.band), `${at}: band must be one of ${BANDS}`);
    assert(Array.isArray(v.use) && v.use.length && v.use.every(u => USES.includes(u)), `${at}: bad use tags`);
    assert(words(v.definition) >= 4, `${at}: definition too short`);
    assert(Array.isArray(v.collocations) && v.collocations.length >= 2, `${at}: needs >= 2 collocations`);
    assert(Array.isArray(v.paraphrases) && v.paraphrases.length >= 1, `${at}: needs >= 1 paraphrase`);
    assert(v.paraphrases.every(p => p.toLowerCase() !== v.word.toLowerCase()), `${at}: paraphrase repeats headword`);
    assert(typeof v.example === 'string' && words(v.example) >= 8 && /[.!?]$/.test(v.example), `${at}: example must be a full sentence >= 8 words`);
    const s = stem(v.word);
    assert(v.example.toLowerCase().includes(s), `${at}: example does not use "${v.word}" (stem "${s}")`);
  }
}

const one = process.argv[2];
if (one) {
  const items = JSON.parse(fs.readFileSync(path.join(DATA, one), 'utf8'));
  check(items, one);
  const heads = items.map(v => v.word.toLowerCase());
  assert.strictEqual(new Set(heads).size, heads.length, `${one}: duplicate headwords ${heads.filter((h, i) => heads.indexOf(h) !== i)}`);
  console.log(`${one} ok: ${items.length} items`);
  process.exit(0);
}

const deck = JSON.parse(fs.readFileSync(path.join(DATA, 'vocab.json'), 'utf8'));
check(deck, 'vocab');
const heads = deck.map(v => v.word.toLowerCase());
const dups = heads.filter((h, i) => heads.indexOf(h) !== i);
assert.strictEqual(dups.length, 0, `vocab: duplicate headwords ${dups.join(', ')}`);
assert(deck.length >= 1500, `vocab: ${deck.length}/1500 items`);
for (const t of TOPICS) assert(deck.filter(v => v.topic === t).length >= 70, `vocab: topic ${t} has < 70 items`);
for (const b of BANDS) assert(deck.some(v => v.band === b), `vocab: no band ${b} items`);

// The view reviews through the shared SM-2 engine, with its own storage key.
const view = fs.readFileSync(path.join(__dirname, '..', 'src', 'ielts', 'views', 'vocab.ts'), 'utf8');
assert(/import \{ SRSEngine[^}]*\} from '\.\.\/\.\.\/core\/srs-engine'/.test(view), 'vocab view must import SRSEngine');
assert(/SRSEngine\.rateCard/.test(view) && /SRSEngine\.getDueCards/.test(view), 'vocab view must schedule with rateCard/getDueCards');
assert(/'IELTS_VOCAB_SRS'/.test(view), 'vocab view must keep its own storage key');
assert(/vocabView/.test(fs.readFileSync(path.join(__dirname, '..', 'src', 'ielts', 'main.ts'), 'utf8')), 'vocab view not routed in main.ts');

console.log(`ielts vocab ok: ${deck.length} items, ${TOPICS.length} topics`);
