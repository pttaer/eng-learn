// IELTS band tables, answer checking and set scoring (src/ielts/bands.ts, scoring.ts).
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src', 'ielts');
function load(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}
const { rawToBand, averageBands } = load('bands.ts');
const { isCorrect, scoreSet } = load('scoring.ts');

assert.strictEqual(rawToBand('reading', 30), 7);
assert.strictEqual(rawToBand('reading', 29), 6.5);
assert.strictEqual(rawToBand('reading', 23), 6);
assert.strictEqual(rawToBand('listening', 30), 7);
assert.strictEqual(rawToBand('listening', 29), 6.5);
assert.strictEqual(rawToBand('listening', 32), 7.5);
assert.strictEqual(rawToBand('listening', 40), 9);
assert.strictEqual(rawToBand('reading', 15, 20), 7, '15/20 scales to 30/40');
assert.strictEqual(rawToBand('reading', 0), 2);
assert.strictEqual(averageBands([7, 7, 6.5, 6.5]), 7);      // 6.75 -> 7.0
assert.strictEqual(averageBands([6.5, 6.5, 6, 6.5]), 6.5);  // 6.375 -> 6.5
assert.strictEqual(averageBands([6, 6, 6, 6.5]), 6);        // 6.125 -> 6.0
assert.strictEqual(averageBands([6.5, 6.5, 6.5, 7]), 6.5);  // 6.625 -> 6.5

const q = (type, answer) => ({ id: 'x', type, prompt: '', answer, why: 'w' });
assert(isCorrect(q('tfng', 'NOT GIVEN'), 'not given'));
assert(!isCorrect(q('tfng', 'NOT GIVEN'), 'FALSE'));
assert(isCorrect(q('complete', ['Tuesday', 'tues']), ' tuesday. '));
assert(!isCorrect(q('complete', 'Tuesday'), ''));
const s = scoreSet([{ ...q('tfng', 'TRUE'), id: 'a' }, { ...q('mcq', 'B'), id: 'b' }], { a: 'TRUE', b: 'C' });
assert.strictEqual(s.raw, 1);
assert.deepStrictEqual(s.wrong, ['b']);
assert.deepStrictEqual(s.byType.tfng, { ok: 1, n: 1 });
console.log('ielts bands/scoring ok');
