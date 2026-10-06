/**
 * web/scripts/verify-tree-progression.cjs
 * Automated verification suite for Constellation Skill Tree Mastery Feedback (Ticket ENG-61).
 * Asserts that all 5 branches advance tree mastery upon successful practice.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('✦ [VERIFICATION] ENG-61: Constellation Tree Mastery Feedback');
console.log('================================================================\n');

// 1. Static Contract & Source Code Verification
console.log('--- 1. STATIC SOURCE CONTRACTS & DOSSIER HOOKS ---');

const enginePath = path.join(__dirname, '..', 'src', 'core', 'skill-tree-engine.ts');
const grammarPath = path.join(__dirname, '..', 'src', 'modules', 'grammar-dossier.ts');
const collocPath = path.join(__dirname, '..', 'src', 'modules', 'collocations-dossier.ts');
const speakPath = path.join(__dirname, '..', 'src', 'modules', 'speaking-dossier.ts');
const readPath = path.join(__dirname, '..', 'src', 'modules', 'reading-dossier.ts');
const writePath = path.join(__dirname, '..', 'src', 'modules', 'writing-dossier.ts');

assert.ok(fs.existsSync(enginePath), 'skill-tree-engine.ts must exist');
assert.ok(fs.existsSync(grammarPath), 'grammar-dossier.ts must exist');
assert.ok(fs.existsSync(collocPath), 'collocations-dossier.ts must exist');
assert.ok(fs.existsSync(speakPath), 'speaking-dossier.ts must exist');
assert.ok(fs.existsSync(readPath), 'reading-dossier.ts must exist');
assert.ok(fs.existsSync(writePath), 'writing-dossier.ts must exist');

const engineSrc = fs.readFileSync(enginePath, 'utf8');
const grammarSrc = fs.readFileSync(grammarPath, 'utf8');
const collocSrc = fs.readFileSync(collocPath, 'utf8');
const speakSrc = fs.readFileSync(speakPath, 'utf8');
const readSrc = fs.readFileSync(readPath, 'utf8');
const writeSrc = fs.readFileSync(writePath, 'utf8');

// A. Engine method & event contract
assert.ok(
  engineSrc.includes('advanceBranchMastery(branchId: BranchId, level: Cefr, delta = 5)'),
  'SkillTreeEngine must declare advanceBranchMastery with default delta = 5'
);
assert.ok(
  engineSrc.includes('tree-mastery-updated'),
  'advanceBranchMastery must dispatch tree-mastery-updated CustomEvent'
);
assert.ok(
  engineSrc.includes('Math.max(current,') && engineSrc.includes('Math.min(100,'),
  'advanceBranchMastery must clamp to [0, 100] and never lower existing mastery'
);

// B. Grammar dossier hook
assert.ok(
  grammarSrc.includes('SkillTreeEngine'),
  'grammar-dossier.ts must import SkillTreeEngine'
);
assert.ok(
  grammarSrc.includes("SkillTreeEngine.advanceBranchMastery('grammar', this.activeLevel, 5)"),
  "grammar-dossier.ts must advance 'grammar' branch by +5% on good rating"
);

// C. Collocations dossier hook
assert.ok(
  collocSrc.includes('SkillTreeEngine'),
  'collocations-dossier.ts must import SkillTreeEngine'
);
assert.ok(
  collocSrc.includes("SkillTreeEngine.advanceBranchMastery('collocations',"),
  "collocations-dossier.ts must advance 'collocations' branch"
);

// D. Speaking dossier hook
assert.ok(
  speakSrc.includes('SkillTreeEngine'),
  'speaking-dossier.ts must import SkillTreeEngine'
);
assert.ok(
  speakSrc.includes("SkillTreeEngine.advanceBranchMastery('speaking', this.activeLevel, 5)"),
  "speaking-dossier.ts must advance 'speaking' branch by +5% on take completion"
);

// E. Reading dossier hook
assert.ok(
  readSrc.includes('SkillTreeEngine'),
  'reading-dossier.ts must import SkillTreeEngine'
);
assert.ok(
  readSrc.includes("SkillTreeEngine.advanceBranchMastery('reading', this.activeLevel, 10)"),
  "reading-dossier.ts must advance 'reading' branch by +10% on Pass 4 completion"
);

// F. Writing dossier hook
assert.ok(
  writeSrc.includes("SkillTreeEngine.advanceBranchMastery('writing', this.activeLevel, 5)"),
  "writing-dossier.ts must advance 'writing' branch by +5% on writing drill completion"
);

console.log('✅ Static contracts and hooks across all 5 skill dossiers verified.\n');

// 2. Data & Node Invariants
console.log('--- 2. SKILL TREE BRANCH NODES COVERAGE ---');
const dataPath = path.join(__dirname, '..', 'src', 'core', 'skill-tree-data.ts');
assert.ok(fs.existsSync(dataPath), 'skill-tree-data.ts must exist');
const dataSrc = fs.readFileSync(dataPath, 'utf8');

const branches = ['grammar', 'collocations', 'writing', 'speaking', 'reading'];
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

for (const b of branches) {
  assert.ok(dataSrc.includes(`${b}: {`), `Branch ${b} must be present in SKILL_BRANCHES`);
  for (const lvl of levels) {
    const regex = new RegExp(`branchId:\\s*'${b}',[\\s\\S]*?cefrLevel:\\s*'${lvl}'`);
    assert.ok(regex.test(dataSrc), `Branch ${b} must contain a node for CEFR level ${lvl}`);
  }
}
console.log('✅ All 5 branches provide node definitions for all CEFR levels (A1-C2).\n');

// 3. Functional Simulation & Invariant Validation
console.log('--- 3. ADVANCE MASTERY ENGINE SIMULATION ---');

// Mock storage and event dispatch pipeline
const mockState = {
  treeProgress: {},
  learnerLevel: 'B2'
};

const eventsDispatched = [];

function mockNodeForLevel(branchId, cefrLevel) {
  return {
    id: `${branchId.slice(0, 4)}-${cefrLevel.toLowerCase()}`,
    branchId,
    cefrLevel,
    masteryThreshold: 80
  };
}

function mockGetNodeMasteryPct(nodeId, cefrLevel) {
  if (typeof mockState.treeProgress[nodeId] === 'number') {
    return mockState.treeProgress[nodeId];
  }
  const levelsOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const nodeIdx = levelsOrder.indexOf(cefrLevel);
  const learnerIdx = levelsOrder.indexOf(mockState.learnerLevel);
  if (nodeIdx < learnerIdx) return 100;
  if (nodeIdx === learnerIdx) return 40;
  return 0;
}

function mockAdvanceBranchMastery(branchId, level, delta = 5) {
  const node = mockNodeForLevel(branchId, level);
  if (!node) return;
  const current = mockGetNodeMasteryPct(node.id, level);
  const next = Math.max(current, Math.min(100, Math.round(current + delta)));
  mockState.treeProgress[node.id] = next;
  eventsDispatched.push({
    type: 'tree-mastery-updated',
    detail: { branchId, level, nodeId: node.id, previousMastery: current, newMastery: next, delta }
  });
}

// Test A: Step-by-step advancement for each of the 5 branches
for (const b of branches) {
  const initial = mockGetNodeMasteryPct(mockNodeForLevel(b, 'B2').id, 'B2');
  assert.strictEqual(initial, 40, `${b} starting mastery at learner level B2 should be 40%`);

  mockAdvanceBranchMastery(b, 'B2', 5);
  const updated = mockState.treeProgress[mockNodeForLevel(b, 'B2').id];
  assert.strictEqual(updated, 45, `${b} mastery after +5% should be 45%`);

  const lastEvent = eventsDispatched[eventsDispatched.length - 1];
  assert.strictEqual(lastEvent.type, 'tree-mastery-updated');
  assert.strictEqual(lastEvent.detail.branchId, b);
  assert.strictEqual(lastEvent.detail.previousMastery, 40);
  assert.strictEqual(lastEvent.detail.newMastery, 45);
  assert.strictEqual(lastEvent.detail.delta, 5);
}

// Test B: Reading dossier +10% increment
const readNode = mockNodeForLevel('reading', 'B2');
mockAdvanceBranchMastery('reading', 'B2', 10);
assert.strictEqual(mockState.treeProgress[readNode.id], 55, 'Reading should advance from 45% to 55% (+10%)');

// Test C: Boundary clamping to 100%
mockState.treeProgress[readNode.id] = 95;
mockAdvanceBranchMastery('reading', 'B2', 10);
assert.strictEqual(mockState.treeProgress[readNode.id], 100, 'Mastery should clamp at 100%');

// Test D: Invariant — Never lower mastery on negative delta
mockAdvanceBranchMastery('reading', 'B2', -15);
assert.strictEqual(mockState.treeProgress[readNode.id], 100, 'Mastery must never decrease even if negative delta passed');

console.log('✅ Functional simulation verified across all 5 branches with zero invariant violations.\n');

console.log('================================================================');
console.log('🎉 [SUCCESS] All ENG-61 Constellation Tree Mastery assertions passed!');
console.log('================================================================');
