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

// The ladder is populated: every level from A1 up has a usable amount of content in each pillar
const MIN = { collocations: 100, vocabulary: 25, grammar: 20, reading: 3, listening: 5, 'speaking drills': 10, 'writing drills': 10 };
for (const level of ['A1', 'A2', 'B1']) {
  for (const [name, items] of Object.entries(pillars)) {
    const n = items.filter(i => i.cefrLevel === level).length;
    assert(n >= MIN[name], `${name}: ${level} has ${n}, expected at least ${MIN[name]}`);
  }
}

const tree = fs.readFileSync(path.join(__dirname, '..', 'src', 'core', 'skill-tree-data.ts'), 'utf8');
const treeLevels = [...tree.matchAll(/cefrLevel: '(\w+)'/g)].map(m => m[1]);
assert(treeLevels.length > 0 && treeLevels.every(l => LEVELS.includes(l)), 'tree nodes must use valid CEFR levels');


// Tree: every prerequisite exists, no cycles, each branch runs A1 -> C2 (8 nodes) and chains a1 -> a2 -> b1 -> first B2 node
const nodes = [...tree.matchAll(/id: '([a-z]+-[a-z0-9]+)',\s+branchId: '(\w+)',\s+level: (\d+),[\s\S]*?cefrLevel: '(\w+)',[\s\S]*?prerequisites: \[([^\]]*)\]/g)]
  .map(m => ({ id: m[1], branch: m[2], level: +m[3], cefr: m[4], pre: m[5].split(',').map(x => x.trim().replace(/'/g, '')).filter(Boolean) }));
const byId = new Map(nodes.map(n => [n.id, n]));
assert.strictEqual(nodes.length, 40, `expected 40 tree nodes (5 branches x 8), got ${nodes.length}`);
for (const n of nodes) for (const p of n.pre) assert(byId.has(p), `${n.id}: unknown prerequisite ${p}`);
const visit = (id, seen) => { assert(!seen.has(id), `cycle through ${id}`); seen.add(id); byId.get(id).pre.forEach(p => visit(p, new Set(seen))); };
nodes.forEach(n => visit(n.id, new Set()));
for (const branch of new Set(nodes.map(n => n.branch))) {
  const b = nodes.filter(n => n.branch === branch).sort((x, y) => x.level - y.level);
  assert.deepStrictEqual(b.map(n => n.level), [1, 2, 3, 4, 5, 6, 7, 8], `${branch}: levels 1..8`);
  assert.deepStrictEqual(b.slice(0, 3).map(n => n.cefr), ['A1', 'A2', 'B1'], `${branch}: first three tiers are A1, A2, B1`);
  b.slice(1).forEach((n, i) => assert(n.pre.includes(b[i].id), `${n.id} must require ${b[i].id}`));
}

console.log('PASSED: all content items carry a CEFR level');
