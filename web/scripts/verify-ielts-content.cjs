// IELTS Academic content: schema, answer-key integrity, length and coverage minimums (src/ielts/data/*.json).
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DATA = path.join(__dirname, '..', 'src', 'ielts', 'data');
const load = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const words = s => s.trim().split(/\s+/).length;
const MIN = { reading: 12, listening: 8, writing1: 16, writing2: 20, part1: 12, part2: 30 };

function uniq(items, what) {
  const ids = items.map(i => i.id);
  assert.strictEqual(new Set(ids).size, ids.length, `${what}: duplicate ids`);
}

function checkQuestions(qs, where) {
  const seen = new Set();
  for (const q of qs) {
    assert(q.id && !seen.has(q.id), `${where}: missing/duplicate question id ${q.id}`);
    seen.add(q.id);
    assert(q.prompt && q.prompt.trim(), `${where}/${q.id}: empty prompt`);
    assert(q.why && words(q.why) >= 6, `${where}/${q.id}: why must quote evidence (>= 6 words)`);
    if (q.type === 'tfng') assert(['TRUE', 'FALSE', 'NOT GIVEN'].includes(q.answer), `${where}/${q.id}: bad tfng answer`);
    else if (q.type === 'ynng') assert(['YES', 'NO', 'NOT GIVEN'].includes(q.answer), `${where}/${q.id}: bad ynng answer`);
    else if (['mcq', 'heading', 'match'].includes(q.type)) {
      assert(Array.isArray(q.options) && q.options.length >= 3, `${where}/${q.id}: needs options`);
      assert(typeof q.answer === 'string' && q.options.some(o => o.split(/[.)]/)[0].trim() === q.answer), `${where}/${q.id}: answer "${q.answer}" is not an option key`);
    } else if (['complete', 'short'].includes(q.type)) {
      const a = Array.isArray(q.answer) ? q.answer : [q.answer];
      assert(a.length && a.every(x => typeof x === 'string' && x.trim()), `${where}/${q.id}: empty answer`);
      assert(a.some(x => words(x) <= 3), `${where}/${q.id}: needs an accepted answer of <= 3 words`);
    } else assert.fail(`${where}/${q.id}: unknown type ${q.type}`);
  }
}

const reading = load('reading.json');
assert(reading.length >= MIN.reading, `reading: ${reading.length}/${MIN.reading} passages`);
uniq(reading, 'reading');
const rTypes = {};
reading.forEach(p => {
  const n = p.paragraphs.reduce((a, x) => a + words(x.text), 0);
  assert(n >= 780 && n <= 1050, `reading ${p.id}: ${n} words (want 780-1050)`);
  assert(p.questions.length >= 13 && p.questions.length <= 14, `reading ${p.id}: ${p.questions.length} questions (want 13-14)`);
  checkQuestions(p.questions, p.id);
  const lists = new Set(p.questions.filter(q => q.type === 'heading').map(q => JSON.stringify(q.options)));
  assert(lists.size <= 1, `reading ${p.id}: heading questions must share one identical options list (found ${lists.size})`);
  p.questions.forEach(q => rTypes[q.type] = (rTypes[q.type] || 0) + 1);
});
for (const t of ['tfng', 'heading', 'complete', 'mcq', 'match']) assert((rTypes[t] || 0) >= (t === 'match' ? 2 : 12), `reading: only ${rTypes[t] || 0} "${t}" questions across set (want >= 12)`);
for (const lbl of reading) assert(lbl.paragraphs.every((p, i) => p.label === String.fromCharCode(65 + i)), `reading ${lbl.id}: paragraph labels must be A, B, C...`);

const listening = load('listening.json');
assert(listening.length >= MIN.listening, `listening: ${listening.length}/${MIN.listening} sections`);
uniq(listening, 'listening');
listening.forEach(s => {
  const n = s.script.reduce((a, x) => a + words(x.text), 0);
  assert(n >= (s.section === 4 ? 400 : 280), `listening ${s.id}: ${n} words too short`);
  assert(s.questions.length === 10, `listening ${s.id}: ${s.questions.length} questions (want 10)`);
  const names = new Set(s.speakers.map(x => x.name));
  assert(s.script.every(l => names.has(l.speaker)), `listening ${s.id}: script line from unknown speaker`);
  if (s.section === 4) assert.strictEqual(s.speakers.length, 1, `listening ${s.id}: section 4 is a single-speaker lecture`);
  else assert(s.speakers.length >= 1 && (s.section === 2 || s.speakers.length >= 2), `listening ${s.id}: speaker count`);
  checkQuestions(s.questions, s.id);
});
for (const n of [1, 2, 3, 4]) assert(listening.some(s => s.section === n), `listening: no section ${n}`);

const w1 = load('writing1.json');
assert(w1.length >= MIN.writing1, `writing1: ${w1.length}/${MIN.writing1}`);
uniq(w1, 'writing1');
w1.forEach(t => {
  const c = t.chart;
  if (['line', 'bar', 'table', 'pie'].includes(c.kind)) {
    assert(c.labels && c.series && c.series.length, `${t.id}: chart needs labels+series`);
    c.series.forEach(s => assert.strictEqual(s.values.length, c.labels.length, `${t.id}: series "${s.name}" length != labels`));
    if (c.kind === 'pie') {
      const sum = c.series[0].values.reduce((a, b) => a + b, 0);
      assert(Math.abs(sum - 100) <= 1, `${t.id}: pie sums to ${sum}`);
    }
  } else if (c.kind === 'process') assert(c.steps && c.steps.length >= 5, `${t.id}: process needs >= 5 steps`);
  else if (c.kind === 'map') assert(c.maps && c.maps.length === 2, `${t.id}: map needs two periods`);
  else assert.fail(`${t.id}: bad chart kind`);
  const n = words(t.model);
  assert(n >= 150 && n <= 200, `${t.id}: model answer ${n} words (want 150-200)`);
  assert(/\b(overall|in general|in summary|to summari[sz]e)\b/i.test(t.model), `${t.id}: model needs an overview sentence`);
  assert(words(t.notes) >= 20, `${t.id}: notes too short`);
});
for (const k of ['line', 'bar', 'table', 'pie', 'process', 'map']) assert(w1.some(t => t.chart.kind === k), `writing1: no ${k} chart`);

const w2 = load('writing2.json');
assert(w2.length >= MIN.writing2, `writing2: ${w2.length}/${MIN.writing2}`);
uniq(w2, 'writing2');
w2.forEach(t => {
  const n = words(t.model);
  assert(n >= 260 && n <= 340, `${t.id}: model essay ${n} words (want 260-340)`);
  const paras = t.model.split(/\n\s*\n/).length;
  assert(paras >= 4 && paras <= 5, `${t.id}: ${paras} paragraphs (want 4-5)`);
  assert(words(t.notes) >= 20, `${t.id}: notes too short`);
});
for (const k of ['opinion', 'discuss', 'advantage', 'problem', 'twopart']) assert(w2.filter(t => t.essayType === k).length >= 3, `writing2: < 3 "${k}" prompts`);

const sp = load('speaking.json');
assert(sp.part1.length >= MIN.part1, `speaking part1: ${sp.part1.length}/${MIN.part1}`);
sp.part1.forEach(t => assert(t.questions.length >= 6, `part1 ${t.topic}: needs >= 6 questions`));
assert(sp.part2.length >= MIN.part2, `speaking part2: ${sp.part2.length}/${MIN.part2}`);
uniq(sp.part2, 'part2');
sp.part2.forEach(c => {
  assert(c.bullets.length === 4, `${c.id}: cue card needs 4 bullets`);
  assert(c.part3.length >= 4, `${c.id}: needs >= 4 part 3 questions`);
  assert(words(c.modelAnswer) >= 150, `${c.id}: model answer too short`);
});

console.log(`ielts content ok: ${reading.length} reading, ${listening.length} listening, ${w1.length} task1, ${w2.length} task2, ${sp.part1.length}+${sp.part2.length} speaking`);
