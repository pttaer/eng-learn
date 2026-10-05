// Every content item carries a valid per-item CEFR level; tree levels are valid. Counts per level are reported.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DATA = path.join(__dirname, '..', 'src', 'assets', 'data');
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const load = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

const pillars = {
  collocations: load('collocations.json'),
  vocabulary: load('vocabulary.json'),
  grammar: load('grammar.json'),
  reading: load('reading.json').articles,
  listening: load('listening.json').samplePassages,
  'speaking drills': load('drills.json').speaking,
  'writing drills': load('drills.json').writing
};

for (const [name, items] of Object.entries(pillars)) {
  const bad = items.filter(i => !LEVELS.includes(i.cefrLevel));
  assert.strictEqual(bad.length, 0, `${name}: ${bad.length} items without a valid cefrLevel (first: ${bad[0] && bad[0].id})`);
  const counts = LEVELS.map(l => `${l}:${items.filter(i => i.cefrLevel === l).length}`).join(' ');
  console.log(`  ${name.padEnd(16)} ${counts}`);
}

const tree = fs.readFileSync(path.join(__dirname, '..', 'src', 'core', 'skill-tree-data.ts'), 'utf8');
const treeLevels = [...tree.matchAll(/cefrLevel: '(\w+)'/g)].map(m => m[1]);
assert(treeLevels.length > 0 && treeLevels.every(l => LEVELS.includes(l)), 'tree nodes must use valid CEFR levels');

console.log('PASSED: all content items carry a CEFR level');
