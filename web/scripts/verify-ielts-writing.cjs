// Offline writing heuristics (src/ielts/writing-heuristics.ts) and Writing data (src/ielts/data/writing1/2.json):
// flags fire on bad answers and stay quiet on the model answers; every prompt carries band-6 contrast and TR/CC/LR/GRA notes;
// every number in a Task 1 model can be read or calculated from its chart.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src', 'ielts');
const code = ts.transpileModule(fs.readFileSync(path.join(SRC, 'writing-heuristics.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', code)(mod, mod.exports, require);
const { analyse, estimateBand, BAND_EXAMPLES } = mod.exports;
const has = (r, re) => r.flags.some(f => re.test(f));

// Each flag fires on a crafted bad answer.
const short = analyse('The graph is good. The graph shows a graph of the graph.', 1);
assert(has(short, /Under length/));
assert(has(short, /overview/i));

const t2 = analyse('I agree. Cats are good.\n\nCats are good.', 2);
assert(has(t2, /Under length/));
assert(t2.hasPosition);
assert(has(t2, /paragraph/));

const spec = analyse('Overall, sales rose. This was probably due to cheaper prices, and I think it was driven by advertising.', 1);
assert.deepStrictEqual(spec.speculation.sort(), ['driven by', 'due to', 'i think', 'probably']);
assert(has(spec, /speculation/));

const pad = 'Cities grow every year and people move to them for work and study. ';
const lopsided = analyse(`${pad.repeat(20)}\n\nI agree.\n\nIn conclusion, I agree.`, 2);
assert(has(lopsided, /60%/));

const linky = analyse('However, a. However, b. However, c. However, d. Overall it is fine.', 2);
assert.deepStrictEqual(linky.overusedLinkers, ['however']);
assert(has(linky, /Overused linker/));

const body = 'Public transport is cheap. Buses carry many people at once and trains are fast. ';
const noEnd = analyse(`I believe governments should fund buses.\n\n${body.repeat(4)}\n\n${body.repeat(4)}\n\nBuses are useful for many people every day.`, 2);
assert(has(noEnd, /No conclusion signal/));
assert(has(noEnd, /not in the conclusion/));
const noIntro = analyse(`Transport is a common topic.\n\n${body.repeat(4)}\n\n${body.repeat(4)}\n\nIn conclusion, governments should fund buses.`, 2);
assert(has(noIntro, /not in the introduction/));

const q = 'Some people think that the government should pay for university education for all students. To what extent do you agree or disagree?';
const copied = analyse('Some people think that the government should pay for university education for all students and I agree.', 2, q);
assert(copied.promptCopies >= 3 && has(copied, /copied from the question/));
const offTopic = analyse(`${'Football is a popular sport and many children enjoy playing it with friends after school. '.repeat(10)}`, 2, q);
assert(offTopic.topicCoverage < 0.3 && has(offTopic, /key words/));

assert.strictEqual(estimateBand([7, 7, 7, 7], 260, 2), 7);
assert.strictEqual(estimateBand([7, 7, 7, 7], 200, 2), 6.5);
assert.strictEqual(estimateBand([6, 6, 7, 6], 160, 1), 6.5);

for (const c of ['ta', 'tr', 'cc', 'lr', 'gra']) for (const b of [5, 6, 7, 8]) {
  const e = BAND_EXAMPLES[c][b];
  assert(e && e.looks && e.example, `BAND_EXAMPLES.${c}.${b} missing`);
}

const load = f => JSON.parse(fs.readFileSync(path.join(SRC, 'data', f), 'utf8'));
const T1 = load('writing1.json');
const T2 = load('writing2.json');
const words = s => s.trim().split(/\s+/).length;
const paras = s => s.trim().split(/\n\s*\n/).filter(Boolean).length;
const HARD = /Under length|overview|speculation|paragraph|Overused linker|60%|conclusion signal|clear position|not in the|copied from|key words/;

const common = p => {
  assert(p.notes && p.band6 && p.band6.split(/\s+/).length >= 25, `${p.id}: band6 contrast missing or too short`);
  assert(p.criteria && ['tr', 'cc', 'lr', 'gra'].every(k => typeof p.criteria[k] === 'string' && p.criteria[k].length > 30), `${p.id}: criteria tr/cc/lr/gra missing`);
};

// Numbers a Task 1 model may use: chart values, label/title digits, sums per series and per label, differences, and percentages of those.
function allowed(c) {
  const base = new Set();
  const add = (set, t) => (String(t).match(/\d[\d,]*(\.\d+)?/g) || []).forEach(x => set.add(+x.replace(/,/g, '')));
  [c.title, ...(c.labels || []), ...(c.steps || []), ...(c.maps || []).flatMap(m => [m.year, ...m.features])].forEach(t => add(base, t));
  const vals = (c.series || []).flatMap(s => s.values);
  const sums = [...(c.series || []).map(s => s.values.reduce((a, b) => a + b, 0)), ...(c.labels || []).map((_, i) => (c.series || []).reduce((a, s) => a + s.values[i], 0))];
  const pool = [...new Set([...vals, ...sums])];
  const ok = new Set([...base, ...pool]);
  const r1 = x => Math.round(x * 10) / 10;
  const diffs = [];
  pool.forEach(a => pool.forEach(b => { if (a > b) diffs.push(r1(a - b)); }));
  diffs.forEach(d => ok.add(d));
  [...pool, ...diffs].forEach(a => pool.forEach(b => { if (b > 0) { ok.add(Math.round((100 * a) / b)); ok.add(Math.round((100 * Math.abs(a - b)) / b)); } }));
  return ok;
}

const kinds = {};
T1.forEach(p => {
  const c = p.chart;
  kinds[c.kind] = (kinds[c.kind] || 0) + 1;
  common(p);
  if (['line', 'bar', 'table', 'pie'].includes(c.kind)) {
    assert(c.labels && c.series && c.series.length, `${p.id}: needs labels and series`);
    c.series.forEach(s => assert.strictEqual(s.values.length, c.labels.length, `${p.id}: ${s.name} length != labels`));
  }
  if (c.kind === 'pie') {
    const sum = c.series[0].values.reduce((a, b) => a + b, 0);
    assert(Math.abs(sum - 100) <= 1, `${p.id}: pie sums to ${sum}`);
  }
  if (c.kind === 'process') assert(c.steps && c.steps.length >= 5, `${p.id}: process needs 5+ steps`);
  if (c.kind === 'map') assert(c.maps && c.maps.length >= 2 && c.maps.every(m => m.features.length >= 4), `${p.id}: map needs 2 states with 4+ features`);
  const w = words(p.model);
  assert(w >= 150 && w <= 230, `${p.id}: model ${w} words (150-230)`);
  assert(paras(p.model) >= 3, `${p.id}: model needs 3+ paragraphs`);
  const r = analyse(p.model, 1, p.prompt);
  assert(r.hasOverview, `${p.id}: model lacks overview`);
  assert(!has(r, HARD), `${p.id}: model trips a hard flag: ${r.flags.filter(f => HARD.test(f)).join(' | ')}`);
  const ok = allowed(c);
  const scale = /thousand/i.test(c.unit || '') ? 1000 : /million/i.test(c.unit || '') && !/million tonnes/i.test(c.unit) ? 1e6 : 1;
  const bad = (p.model.match(/\d[\d,]*(\.\d+)?/g) || []).map(x => +x.replace(/,/g, '')).filter(n => !ok.has(n) && !ok.has(n / scale));
  assert(!bad.length, `${p.id}: numbers not found in or derivable from the chart: ${bad.join(', ')}`);
});

const types = {};
T2.forEach(p => {
  types[p.essayType] = (types[p.essayType] || 0) + 1;
  common(p);
  const w = words(p.model);
  assert(w >= 260 && w <= 340, `${p.id}: essay ${w} words (260-340)`);
  const n = paras(p.model);
  assert(n >= 4 && n <= 5, `${p.id}: essay has ${n} paragraphs (4-5)`);
  assert(!/\d+(\.\d+)?\s?%/.test(p.model), `${p.id}: essay quotes a percentage; Task 2 models must not invent statistics`);
  const r = analyse(p.model, 2, p.prompt);
  assert(!has(r, HARD), `${p.id}: model essay trips a hard flag: ${r.flags.filter(f => HARD.test(f)).join(' | ')}`);
});

const ids = [...T1, ...T2].map(p => p.id);
assert.strictEqual(new Set(ids).size, ids.length, 'duplicate writing ids');
assert(T1.length >= 30, `Task 1 has ${T1.length} prompts (need 30)`);
assert(T2.length >= 40, `Task 2 has ${T2.length} prompts (need 40)`);
['line', 'bar', 'table', 'pie', 'process', 'map'].forEach(k => assert((kinds[k] || 0) >= 4, `Task 1 ${k}: ${kinds[k] || 0} (need 4+)`));
['opinion', 'discuss', 'advantage', 'problem', 'twopart'].forEach(k => assert((types[k] || 0) >= 7, `Task 2 ${k}: ${types[k] || 0} (need 7+)`));
console.log(`ielts writing ok: Task 1 ${T1.length} ${JSON.stringify(kinds)}, Task 2 ${T2.length} ${JSON.stringify(types)}`);
