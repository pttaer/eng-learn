// IELTS Academic Reading bank: 30 passages = 10 mock tests of 40 questions, band ramp, question-type spread, quoted evidence.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const reading = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'ielts', 'data', 'reading.json'), 'utf8'));
const norm = s => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const words = s => s.trim().split(/\s+/).length;
// Quoted spans in a why ('...' or "..."), split on ellipses so "a ... b" checks both halves.
const quotes = w => [...w.matchAll(/(?<![a-z])'(.{10,}?)'(?![a-z])|"(.{10,}?)"/gi)]
  .flatMap(m => (m[1] || m[2]).split(/\.\.\.|…|\[[^\]]*\]/)).map(norm).filter(s => words(s) >= 3);

const TYPES = ['tfng', 'ynng', 'heading', 'match', 'features', 'sentence', 'summary', 'table', 'mcq', 'short'];
const CHOICE = { tfng: ['TRUE', 'FALSE', 'NOT GIVEN'], ynng: ['YES', 'NO', 'NOT GIVEN'] };
const WRITE = ['sentence', 'summary', 'table', 'short'];
const PASSAGES = 30;

assert.strictEqual(reading.length, PASSAGES, `reading: ${reading.length}/${PASSAGES} passages`);
const usedIn = {};
const checkPassage = (p, id, usedIn) => {
  assert.strictEqual(p.id, id, `${id}: id ${p.id}, want ${id} (mock tests take passages 3 at a time in order)`);
  assert(typeof p.band === 'number' && p.band >= 6 && p.band <= 8.5 && p.band * 2 % 1 === 0, `${id}: band ${p.band} (want 6-8.5 in half steps)`);
  const text = norm(p.paragraphs.map(x => x.text).join(' '));
  const n = words(text);
  assert(n >= 780 && n <= 1050, `${id}: ${n} words (want 780-1050)`);
  assert(p.questions.length >= 13 && p.questions.length <= 14, `${id}: ${p.questions.length} questions`);
  const types = new Set(p.questions.map(q => q.type));
  assert(types.size >= 3, `${id}: only ${types.size} question types`);
  types.forEach(t => { usedIn[t] = (usedIn[t] || 0) + 1; });
  const labels = p.paragraphs.map(x => x.label);
  for (const q of p.questions) {
    const where = `${id}/${q.id}`;
    assert(TYPES.includes(q.type), `${where}: type ${q.type} not a reading type`);
    const qs = quotes(q.why);
    assert(qs.some(s => words(s) >= 5), `${where}: why must quote a 5+ word evidence line`);
    qs.forEach(s => assert(text.includes(s), `${where}: quoted evidence not in passage: "${s}"`));
    if (CHOICE[q.type]) assert(CHOICE[q.type].includes(q.answer), `${where}: bad answer ${q.answer}`);
    if (WRITE.includes(q.type)) {
      const a = [].concat(q.answer);
      assert(words(a[0]) <= 3 && text.includes(norm(a[0])), `${where}: answer "${a[0]}" must be <= 3 words taken from the passage`);
    }
    if (['heading', 'match', 'features', 'mcq'].includes(q.type)) {
      assert(q.options && q.options.some(o => o.split(/[.)]/)[0].trim() === q.answer), `${where}: answer not an option key`);
    }
    if (q.type === 'match') assert(q.options.every(o => labels.includes(o.split(/[.)]/)[0].trim())), `${where}: match options must be paragraph letters`);
  }
  // A block of 3+ T/F/NG or Y/N/NG items uses all three answers, so guessing one answer never pays.
  for (const t of ['tfng', 'ynng']) {
    const a = p.questions.filter(q => q.type === t).map(q => q.answer);
    if (a.length >= 3) assert.strictEqual(new Set(a).size, 3, `${id}: ${t} block uses only ${[...new Set(a)]}`);
  }
  for (const t of ['heading', 'features', 'match']) {
    const lists = new Set(p.questions.filter(q => q.type === t).map(q => JSON.stringify(q.options)));
    assert(lists.size <= 1, `${id}: ${t} questions must share one options list`);
  }
  const h = p.questions.filter(q => q.type === 'heading');
  assert.strictEqual(new Set(h.map(q => q.answer)).size, h.length, `${id}: a heading is used twice`);
  if (h.length) assert(h[0].options.length >= h.length + 2, `${id}: heading list needs 2+ distractors`);
};
reading.forEach((p, i) => checkPassage(p, `r${String(i + 1).padStart(2, '0')}`, usedIn));
// Original set (D1-B): same per-passage rules, no band ladder, its own ids.
const originals = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'ielts', 'data', 'originals-reading.json'), 'utf8'));
originals.forEach((p, i) => checkPassage(p, `o${String(i + 1).padStart(2, '0')}`, {}));

for (let t = 0; t < PASSAGES / 3; t++) {
  const set = reading.slice(t * 3, t * 3 + 3);
  const qn = set.reduce((a, p) => a + p.questions.length, 0);
  assert.strictEqual(qn, 40, `test ${t + 1}: ${qn} questions (want 40)`);
  assert(set[0].band <= set[1].band && set[1].band <= set[2].band && set[0].band < set[2].band, `test ${t + 1}: bands ${set.map(p => p.band)} must rise within the test`);
  if (t) {
    const avg = s => s.reduce((a, p) => a + p.band, 0) / 3;
    assert(avg(set) >= avg(reading.slice(t * 3 - 3, t * 3)), `test ${t + 1}: easier than test ${t}`);
  }
}
TYPES.forEach(t => assert((usedIn[t] || 0) >= 3, `reading: type ${t} used in ${usedIn[t] || 0} passages (want >= 3)`));
assert(reading.some(p => p.band >= 8.5) && reading.some(p => p.band <= 6), 'reading: band ramp must span 6 to 8.5');

console.log(`ielts reading ok: ${reading.length} passages, ${reading.reduce((a, p) => a + p.questions.length, 0)} questions, types ${TYPES.map(t => `${t}:${usedIn[t]}`).join(' ')}`);
