// Offline writing heuristics (src/ielts/writing-heuristics.ts): flags fire on bad answers and stay quiet on the model answers.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src', 'ielts');
const code = ts.transpileModule(fs.readFileSync(path.join(SRC, 'writing-heuristics.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', code)(mod, mod.exports, require);
const { analyse, estimateBand } = mod.exports;

const short = analyse('The graph is good. The graph shows a graph of the graph.', 1);
assert(short.flags.some(f => /Under length/.test(f)));
assert(short.flags.some(f => /overview/i.test(f)));

const t2 = analyse('I agree. Cats are good.\n\nCats are good.', 2);
assert(t2.flags.some(f => /Under length/.test(f)));
assert(t2.hasPosition);
assert(t2.flags.some(f => /paragraph/.test(f)));

assert.strictEqual(estimateBand([7, 7, 7, 7], 260, 2), 7);
assert.strictEqual(estimateBand([7, 7, 7, 7], 200, 2), 6.5);
assert.strictEqual(estimateBand([6, 6, 7, 6], 160, 1), 6.5);

const load = f => JSON.parse(fs.readFileSync(path.join(SRC, 'data', f), 'utf8'));
load('writing2.json').forEach(p => {
  const r = analyse(p.model, 2);
  assert(!r.flags.some(f => /Under length|paragraph/.test(f)), `${p.id}: model essay trips a hard flag: ${r.flags.join(' | ')}`);
});
load('writing1.json').forEach(p => {
  const r = analyse(p.model, 1);
  assert(r.hasOverview, `${p.id}: model lacks overview`);
  assert(!r.flags.some(f => /Under length/.test(f)), `${p.id}: model under length`);
});
console.log('ielts writing heuristics ok');
