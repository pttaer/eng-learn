// IELTS Speaking: Part 1/2/3 data coverage, band-6 vs band-7 samples, and fluency metrics (src/ielts/fluency.ts).
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src', 'ielts');
const PARTS = path.join(SRC, 'data', 'parts');
const words = s => s.trim().split(/\s+/).length;
const parts = prefix => fs.readdirSync(PARTS).filter(f => f.startsWith(prefix + '-') && f.endsWith('.json')).sort()
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(PARTS, f), 'utf8')));

// Parts files are the source; speaking.json must be their merge (node scripts/merge-ielts.cjs).
const p1 = parts('speaking-part1');
const p2 = parts('speaking-part2');
const merged = JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'speaking.json'), 'utf8'));
assert.deepStrictEqual(merged, { part1: p1, part2: p2 }, 'speaking.json is stale: run node scripts/merge-ielts.cjs');

assert(p1.length >= 30, `part1: ${p1.length}/30 topics`);
assert.strictEqual(new Set(p1.map(t => t.topic.toLowerCase())).size, p1.length, 'part1: duplicate topic');
p1.forEach(t => {
  assert(t.questions.length >= 6, `part1 ${t.topic}: needs >= 6 questions`);
  t.questions.forEach(q => assert(/\?$/.test(q), `part1 ${t.topic}: "${q}" is not a question`));
});

assert(p2.length >= 60, `part2: ${p2.length}/60 cue cards`);
assert.strictEqual(new Set(p2.map(c => c.id)).size, p2.length, 'part2: duplicate id');
assert.strictEqual(new Set(p2.map(c => c.cue.toLowerCase())).size, p2.length, 'part2: duplicate cue');
let samples = 0;
p2.forEach(c => {
  assert(/^Describe /.test(c.cue), `${c.id}: cue must start "Describe"`);
  assert.strictEqual(c.bullets.length, 4, `${c.id}: needs 4 bullets`);
  assert(/^and explain /.test(c.bullets[3]), `${c.id}: last bullet must start "and explain"`);
  assert(c.part3.length >= 4 && c.part3.length <= 5, `${c.id}: needs 4-5 Part 3 questions`);
  c.part3.forEach(q => assert(/\?$/.test(q), `${c.id}: Part 3 "${q}" is not a question`));
  const n = words(c.modelAnswer);
  assert(n >= 150 && n <= 300, `${c.id}: band-7 model ${n} words (want 150-300, about 2 minutes)`);
  if (c.band6 !== undefined || c.notes !== undefined) {
    samples++;
    const b6 = words(c.band6 || '');
    assert(b6 >= 110 && b6 < n, `${c.id}: band-6 sample ${b6} words (want >= 110 and shorter than the band-7 model)`);
    for (const k of ['fc', 'lr', 'gra', 'pron']) assert(c.notes && words(c.notes[k] || '') >= 15, `${c.id}: notes.${k} missing or too short`);
  }
});
assert(samples >= 10, `band-6 vs band-7 samples: ${samples}/10 cards`);

// Fluency metrics on synthetic 50 ms energy envelopes.
const code = ts.transpileModule(fs.readFileSync(path.join(SRC, 'fluency.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', code)(mod, mod.exports, require);
const { fluency } = mod.exports;
const syl = () => [0.05, 0.2, 0.08]; // one syllable = 3 frames = 0.15 s
const talk = n => Array.from({ length: n }, syl).flat();
const gap = sec => Array(Math.round(sec / 0.05)).fill(0);

const zero = fluency(gap(3));
assert.strictEqual(zero.syllables, 0, 'silence: no syllables');
assert.strictEqual(zero.estWpm, 0, 'silence: wpm 0');

// 2 s lead-in silence (ignored), 20 syllables, 0.5 s pause, 20 syllables, 1.5 s pause, 20 syllables, trailing silence (ignored).
const f = fluency([...gap(2), ...talk(20), ...gap(0.5), ...talk(20), ...gap(1.5), ...talk(20), ...gap(2)]);
assert.strictEqual(f.syllables, 60, `syllables ${f.syllables} want 60`);
assert.strictEqual(f.pauses, 2, `pauses ${f.pauses} want 2`);
assert.strictEqual(f.longPauses, 1, `long pauses ${f.longPauses} want 1`);
assert.strictEqual(f.speakingSec, 11, `speaking ${f.speakingSec}s want 11`);
assert.strictEqual(f.estWpm, Math.round((60 / 1.5) * (60 / 11)), 'estWpm formula');
// A dip that stays loud (no 30% drop) is one syllable, not two.
assert.strictEqual(fluency([0.05, 0.2, 0.19, 0.2, 0.05]).syllables, 1, 'shallow dip counted twice');
// A short gap (< 0.25 s) is not a pause.
assert.strictEqual(fluency([...talk(5), ...gap(0.2), ...talk(5)]).pauses, 0, 'sub-threshold gap counted as pause');

console.log(`ielts speaking ok: ${p1.length} part1 topics, ${p2.length} cue cards, ${samples} band-6/7 samples, fluency metrics`);
