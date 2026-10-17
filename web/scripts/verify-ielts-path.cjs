// Verifies the guided 7.0 path rules in src/ielts/path.ts: estimator, week count, weakest-skill focus, next task, readiness gate.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', 'src', 'ielts', 'path.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', code)(mod, mod.exports, () => ({}));
const { estimateStart, weeksFor, weakestSkill, roadmap, nextTask, gate, placementFrom } = mod.exports;

// Estimator: mean of placement bands, rounded to the nearest half band; untested skills ignored.
assert.strictEqual(estimateStart({ listening: 6, reading: 6.5 }), 6.5);
assert.strictEqual(estimateStart({ writing: 5.5 }), 5.5);
assert.strictEqual(estimateStart({}), null);

// Week count: 12 at 7.0 or above, +6 per band below, capped at 24.
assert.strictEqual(weeksFor(8), 12);
assert.strictEqual(weeksFor(7), 12);
assert.strictEqual(weeksFor(6.5), 15);
assert.strictEqual(weeksFor(5.5), 21);
assert.strictEqual(weeksFor(3), 24);

// Weakest skill: lowest placement band; an untested skill comes first.
assert.strictEqual(weakestSkill({ listening: 7, reading: 6, writing: 6.5, speaking: 6.5 }), 'reading');
assert.strictEqual(weakestSkill({ reading: 5, speaking: 6 }), 'listening');

// Roadmap: 12-24 weeks, weakest skill gets two weeks in three, mock and vocab routes are used.
for (const weeks of [12, 24]) {
  const plan = roadmap(weeks, 'reading');
  assert.strictEqual(plan.length, weeks);
  const focus = plan.filter(w => w.skill === 'reading').length;
  assert(focus >= Math.floor((2 * weeks) / 3) - 1, `weeks ${weeks}: weakest focus ${focus} too low`);
  assert.notStrictEqual(plan[2].skill, 'reading', 'week 3 must give time to another skill');
  assert(plan.filter(w => w.task === 'full mock').every(w => w.route === '#mock'), 'mock weeks route to #mock');
  assert(plan.filter(w => w.task === 'vocabulary review').every(w => w.route === '#vocab'), 'vocab weeks route to #vocab');
}

// Next task: first week not yet done; null when the roadmap is complete.
const plan = roadmap(12, 'listening');
assert.strictEqual(nextTask(plan, [1, 2]).week, 3);
assert.strictEqual(nextTask(plan, [1, 3]).week, 2);
assert.strictEqual(nextTask(plan, plan.map(w => w.week)), null);

// Readiness gate: Listening and Reading need two mocks at 7.0; Writing and Speaking need a 6.5 recent estimate.
const att = [
  { skill: 'listening', band: 7, mock: true }, { skill: 'listening', band: 7, mock: true },
  { skill: 'reading', band: 7, mock: true }, { skill: 'reading', band: 6.5, mock: true },
  { skill: 'writing', band: 6 }, { skill: 'writing', band: 6.5 }, { skill: 'writing', band: 7 },
  { skill: 'speaking', band: 6 },
];
assert.deepStrictEqual(gate('listening', att), { have: 2, need: 2, ok: true });
assert.deepStrictEqual(gate('reading', att), { have: 1, need: 2, ok: false });
assert.strictEqual(gate('writing', att).ok, true);
assert.strictEqual(gate('speaking', att).ok, false);
assert.strictEqual(gate('speaking', []).ok, false, 'no attempts never passes the gate');

// Placement is the earliest attempt per skill.
assert.deepStrictEqual(placementFrom([{ skill: 'reading', band: 5.5 }, { skill: 'reading', band: 7 }, { skill: 'writing', band: 6 }]), { reading: 5.5, writing: 6 });

console.log('ielts path ok: estimator, 12-24 week roadmap, weakest-skill focus, next task, readiness gate');
