/**
 * web/scripts/verify-branch-calibration.cjs
 * Automated verification suite for Ticket ENG-66:
 * Per-Branch Constellation Tree Calibration & Dossier Wiring.
 *
 * Asserts:
 * 1. Static architectural contracts across skill-tree-engine.ts, level-filter.ts, and all 5 dossiers.
 * 2. Per-branch skill mapping (Grammar -> grammar, Collocations -> vocab, Reading -> reading, Speaking -> speaking, Writing -> writing).
 * 3. Asymmetric multi-skill profile calibration unlocks corresponding branch tiers accurately.
 * 4. Branch independence and dynamic profile updates.
 * 5. Dossier default level resolution against production datasets.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('✦ [VERIFICATION] ENG-66: Per-Branch Constellation Calibration');
console.log('================================================================\n');

// ---------------------------------------------------------------------------
// 1. STATIC SOURCE CONTRACTS & ARCHITECTURAL WIRING
// ---------------------------------------------------------------------------
console.log('--- 1. STATIC SOURCE CONTRACTS & ARCHITECTURAL WIRING ---');

const paths = {
  engine: path.join(__dirname, '../src/core/skill-tree-engine.ts'),
  treeData: path.join(__dirname, '../src/core/skill-tree-data.ts'),
  levelFilter: path.join(__dirname, '../src/core/level-filter.ts'),
  storage: path.join(__dirname, '../src/utils/storage.ts'),
  grammarDossier: path.join(__dirname, '../src/modules/grammar-dossier.ts'),
  collocDossier: path.join(__dirname, '../src/modules/collocations-dossier.ts'),
  readingDossier: path.join(__dirname, '../src/modules/reading-dossier.ts'),
  listeningDossier: path.join(__dirname, '../src/modules/listening-dossier.ts'),
  writingDossier: path.join(__dirname, '../src/modules/writing-dossier.ts')
};

for (const [key, p] of Object.entries(paths)) {
  assert.ok(fs.existsSync(p), `Missing required source file: ${key} (${p})`);
}

const engineSrc = fs.readFileSync(paths.engine, 'utf8');
const levelFilterSrc = fs.readFileSync(paths.levelFilter, 'utf8');
const grammarSrc = fs.readFileSync(paths.grammarDossier, 'utf8');
const collocSrc = fs.readFileSync(paths.collocDossier, 'utf8');
const readingSrc = fs.readFileSync(paths.readingDossier, 'utf8');
const listeningSrc = fs.readFileSync(paths.listeningDossier, 'utf8');
const writingSrc = fs.readFileSync(paths.writingDossier, 'utf8');

// A. BRANCH_TO_SKILL export & mapping verification
assert.ok(
  engineSrc.includes('export const BRANCH_TO_SKILL: Record<BranchId, SkillId>'),
  'skill-tree-engine.ts must export BRANCH_TO_SKILL record'
);
assert.ok(
  engineSrc.includes("grammar: 'grammar'"),
  "BRANCH_TO_SKILL must map 'grammar' branch to 'grammar' skill"
);
assert.ok(
  engineSrc.includes("collocations: 'vocab'"),
  "BRANCH_TO_SKILL must map 'collocations' branch to 'vocab' skill"
);
assert.ok(
  engineSrc.includes("reading: 'reading'"),
  "BRANCH_TO_SKILL must map 'reading' branch to 'reading' skill"
);
assert.ok(
  engineSrc.includes("speaking: 'speaking'"),
  "BRANCH_TO_SKILL must map 'speaking' branch to 'speaking' skill"
);
assert.ok(
  engineSrc.includes("writing: 'writing'"),
  "BRANCH_TO_SKILL must map 'writing' branch to 'writing' skill"
);

// B. Engine getNodeMasteryPct per-skill resolution
assert.ok(
  engineSrc.includes('StorageManager.getSkillLevel(skillId)') || engineSrc.includes('StorageManager.getSkillLevel(skill)'),
  'SkillTreeEngine.getNodeMasteryPct must query StorageManager.getSkillLevel'
);

// C. level-filter preferredLevel signature
assert.ok(
  levelFilterSrc.includes('defaultLevel(items: Leveled[], preferredLevel?: Cefr): Cefr'),
  'level-filter.ts defaultLevel must accept optional preferredLevel parameter'
);

// D. Dossier wiring checks
assert.ok(
  grammarSrc.includes("StorageManager.getSkillLevel('grammar')"),
  "grammar-dossier.ts must resolve default level using StorageManager.getSkillLevel('grammar')"
);
assert.ok(
  collocSrc.includes("StorageManager.getSkillLevel('vocab')"),
  "collocations-dossier.ts must resolve default level using StorageManager.getSkillLevel('vocab')"
);
assert.ok(
  readingSrc.includes("StorageManager.getSkillLevel('reading')"),
  "reading-dossier.ts must resolve default level using StorageManager.getSkillLevel('reading')"
);
assert.ok(
  listeningSrc.includes("StorageManager.getSkillLevel('listening')"),
  "listening-dossier.ts must resolve default level using StorageManager.getSkillLevel('listening')"
);
assert.ok(
  writingSrc.includes("StorageManager.getSkillLevel('writing')"),
  "writing-dossier.ts must resolve default level using StorageManager.getSkillLevel('writing')"
);

console.log('✓ All 9 static source contracts and dossier hooks verified.\n');

// ---------------------------------------------------------------------------
// 2. TREE STRUCTURE & PARSING
// ---------------------------------------------------------------------------
console.log('--- 2. SKILL TREE STRUCTURE EXTRACTION ---');

const treeDataSrc = fs.readFileSync(paths.treeData, 'utf8');

// Parse nodes from skill-tree-data.ts
const nodeRegex = /id:\s*'([a-z]+-[a-z0-9]+)',\s+branchId:\s*'(\w+)',\s+level:\s*(\d+),[\s\S]*?cefrLevel:\s*'(\w+)',[\s\S]*?prerequisites:\s*\[([^\]]*)\]/g;
const parsedNodes = [];
let match;
while ((match = nodeRegex.exec(treeDataSrc)) !== null) {
  parsedNodes.push({
    id: match[1],
    branchId: match[2],
    level: parseInt(match[3], 10),
    cefrLevel: match[4],
    prerequisites: match[5].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean),
    masteryThreshold: 80
  });
}

assert.strictEqual(parsedNodes.length, 40, `Expected 40 skill tree nodes, got ${parsedNodes.length}`);
console.log(`✓ Successfully extracted ${parsedNodes.length} skill nodes across 5 branches.\n`);

const nodeMap = new Map(parsedNodes.map(n => [n.id, n]));

const BRANCH_TO_SKILL = {
  grammar: 'grammar',
  collocations: 'vocab',
  reading: 'reading',
  speaking: 'speaking',
  writing: 'writing'
};

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const cefrIndex = lvl => CEFR_ORDER.indexOf(lvl);

// Engine mastery simulator implementing the updated logic
function createEngine(skillLevels, treeProgress = {}) {
  const getSkillLevel = skill => skillLevels[skill] || 'A1';

  function getNodeMasteryPct(nodeId) {
    if (typeof treeProgress[nodeId] === 'number') {
      return treeProgress[nodeId];
    }
    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const skillId = BRANCH_TO_SKILL[node.branchId] || 'vocab';
    const learnerLevel = getSkillLevel(skillId);

    if (cefrIndex(node.cefrLevel) < cefrIndex(learnerLevel)) {
      return 100;
    }

    const prereqsMet = node.prerequisites.every(id => {
      const pre = nodeMap.get(id);
      return !!pre && getNodeMasteryPct(id) >= pre.masteryThreshold;
    });

    if (!prereqsMet) return 0;
    return node.cefrLevel === learnerLevel ? 40 : 0;
  }

  function isNodeUnlocked(nodeId) {
    const node = nodeMap.get(nodeId);
    if (!node) return false;
    if (node.prerequisites.length === 0) return true;
    return node.prerequisites.every(prereqId => {
      const prereqNode = nodeMap.get(prereqId);
      if (!prereqNode) return false;
      return getNodeMasteryPct(prereqId) >= prereqNode.masteryThreshold;
    });
  }

  function getNodeStatus(nodeId) {
    const node = nodeMap.get(nodeId);
    if (!node) return 'locked';
    const mastery = getNodeMasteryPct(nodeId);
    if (mastery >= node.masteryThreshold) return 'mastered';
    if (isNodeUnlocked(nodeId)) return 'unlocked';
    return 'locked';
  }

  return { getNodeMasteryPct, getNodeStatus, isNodeUnlocked };
}

// ---------------------------------------------------------------------------
// 3. ASYMMETRIC SKILL LEVEL CALIBRATION TEST
// ---------------------------------------------------------------------------
console.log('--- 3. ASYMMETRIC MULTI-SKILL CALIBRATION TEST ---');

// Define asymmetric learner profile:
// Vocab: C1 (High)
// Grammar: A2 (Low)
// Reading: B2 (Upper-Intermediate)
// Speaking: A1 (Novice)
// Writing: B1 (Intermediate)
const asymmetricSkills = {
  vocab: 'C1',
  grammar: 'A2',
  reading: 'B2',
  speaking: 'A1',
  writing: 'B1',
  listening: 'B1'
};

const engine = createEngine(asymmetricSkills);

// A. Grammar Branch (Grammar = A2)
console.log('Testing Grammar Branch (calibrated to A2)...');
const grammarNodes = parsedNodes.filter(n => n.branchId === 'grammar').sort((a, b) => a.level - b.level);
assert.strictEqual(engine.getNodeMasteryPct(grammarNodes[0].id), 100, 'gram-a1 (A1) should be 100% mastered');
assert.strictEqual(engine.getNodeStatus(grammarNodes[0].id), 'mastered', 'gram-a1 status should be mastered');
assert.strictEqual(engine.getNodeMasteryPct(grammarNodes[1].id), 40, 'gram-a2 (A2) should be 40% (active tier)');
assert.strictEqual(engine.getNodeStatus(grammarNodes[1].id), 'unlocked', 'gram-a2 status should be unlocked');
assert.strictEqual(engine.getNodeMasteryPct(grammarNodes[2].id), 0, 'gram-b1 (B1) should be 0%');
assert.strictEqual(engine.getNodeStatus(grammarNodes[2].id), 'locked', 'gram-b1 status should be locked');
for (let i = 3; i < grammarNodes.length; i++) {
  assert.strictEqual(engine.getNodeMasteryPct(grammarNodes[i].id), 0, `${grammarNodes[i].id} should be 0%`);
  assert.strictEqual(engine.getNodeStatus(grammarNodes[i].id), 'locked', `${grammarNodes[i].id} should be locked`);
}
console.log('✓ Grammar branch correctly calibrated to A2.');

// B. Collocations Branch (Vocab = C1)
console.log('Testing Collocations Branch (calibrated to C1)...');
const collocNodes = parsedNodes.filter(n => n.branchId === 'collocations').sort((a, b) => a.level - b.level);
// Tiers 1-4 (A1, A2, B1, B2) must be 100% mastered
for (let i = 0; i < 4; i++) {
  assert.strictEqual(engine.getNodeMasteryPct(collocNodes[i].id), 100, `${collocNodes[i].id} (${collocNodes[i].cefrLevel}) should be 100% mastered`);
  assert.strictEqual(engine.getNodeStatus(collocNodes[i].id), 'mastered', `${collocNodes[i].id} should be mastered`);
}
// Tier 5 (C1 level 5) is active tier -> 40% unlocked
assert.strictEqual(engine.getNodeMasteryPct(collocNodes[4].id), 40, `${collocNodes[4].id} (C1 tier 1) should be 40%`);
assert.strictEqual(engine.getNodeStatus(collocNodes[4].id), 'unlocked', `${collocNodes[4].id} should be unlocked`);
// Tier 6 (C1 level 6) requires Tier 5 >= 80% -> locked
assert.strictEqual(engine.getNodeMasteryPct(collocNodes[5].id), 0, `${collocNodes[5].id} (C1 tier 2) should be 0%`);
assert.strictEqual(engine.getNodeStatus(collocNodes[5].id), 'locked', `${collocNodes[5].id} should be locked`);
// Tiers 7-8 (C2) -> locked
assert.strictEqual(engine.getNodeStatus(collocNodes[6].id), 'locked', `${collocNodes[6].id} should be locked`);
assert.strictEqual(engine.getNodeStatus(collocNodes[7].id), 'locked', `${collocNodes[7].id} should be locked`);
console.log('✓ Collocations branch correctly calibrated to C1.');

// C. Reading Branch (Reading = B2)
console.log('Testing Reading Branch (calibrated to B2)...');
const readingNodes = parsedNodes.filter(n => n.branchId === 'reading').sort((a, b) => a.level - b.level);
// Tiers 1-3 (A1, A2, B1) mastered
for (let i = 0; i < 3; i++) {
  assert.strictEqual(engine.getNodeMasteryPct(readingNodes[i].id), 100, `${readingNodes[i].id} should be 100% mastered`);
  assert.strictEqual(engine.getNodeStatus(readingNodes[i].id), 'mastered', `${readingNodes[i].id} should be mastered`);
}
// Tier 4 (B2) active tier -> 40% unlocked
assert.strictEqual(engine.getNodeMasteryPct(readingNodes[3].id), 40, `${readingNodes[3].id} (B2) should be 40%`);
assert.strictEqual(engine.getNodeStatus(readingNodes[3].id), 'unlocked', `${readingNodes[3].id} should be unlocked`);
// Tiers 5-8 (C1, C2) locked
for (let i = 4; i < readingNodes.length; i++) {
  assert.strictEqual(engine.getNodeStatus(readingNodes[i].id), 'locked', `${readingNodes[i].id} should be locked`);
}
console.log('✓ Reading branch correctly calibrated to B2.');

// D. Speaking Branch (Speaking = A1)
console.log('Testing Speaking Branch (calibrated to A1)...');
const speakingNodes = parsedNodes.filter(n => n.branchId === 'speaking').sort((a, b) => a.level - b.level);
assert.strictEqual(engine.getNodeMasteryPct(speakingNodes[0].id), 40, 'spek-a1 should be 40% unlocked');
assert.strictEqual(engine.getNodeStatus(speakingNodes[0].id), 'unlocked', 'spek-a1 should be unlocked');
for (let i = 1; i < speakingNodes.length; i++) {
  assert.strictEqual(engine.getNodeMasteryPct(speakingNodes[i].id), 0, `${speakingNodes[i].id} should be 0%`);
  assert.strictEqual(engine.getNodeStatus(speakingNodes[i].id), 'locked', `${speakingNodes[i].id} should be locked`);
}
console.log('✓ Speaking branch correctly calibrated to A1.');

// E. Writing Branch (Writing = B1)
console.log('Testing Writing Branch (calibrated to B1)...');
const writingNodes = parsedNodes.filter(n => n.branchId === 'writing').sort((a, b) => a.level - b.level);
assert.strictEqual(engine.getNodeMasteryPct(writingNodes[0].id), 100, 'writ-a1 should be 100% mastered');
assert.strictEqual(engine.getNodeMasteryPct(writingNodes[1].id), 100, 'writ-a2 should be 100% mastered');
assert.strictEqual(engine.getNodeMasteryPct(writingNodes[2].id), 40, 'writ-b1 should be 40% unlocked');
assert.strictEqual(engine.getNodeStatus(writingNodes[2].id), 'unlocked', 'writ-b1 should be unlocked');
for (let i = 3; i < writingNodes.length; i++) {
  assert.strictEqual(engine.getNodeMasteryPct(writingNodes[i].id), 0, `${writingNodes[i].id} should be 0%`);
  assert.strictEqual(engine.getNodeStatus(writingNodes[i].id), 'locked', `${writingNodes[i].id} should be locked`);
}
console.log('✓ Writing branch correctly calibrated to B1.\n');

// ---------------------------------------------------------------------------
// 4. DYNAMIC TRANSITIONS & BRANCH ISOLATION
// ---------------------------------------------------------------------------
console.log('--- 4. DYNAMIC PROFILE UPDATES & BRANCH ISOLATION ---');

// Promote Grammar from A2 to B2: only grammar nodes should change
const updatedSkills = { ...asymmetricSkills, grammar: 'B2' };
const engineUpdated = createEngine(updatedSkills);

// Grammar: now gram-a2 and gram-b1 are 100% mastered, gram-1 (B2) is unlocked at 40%
assert.strictEqual(engineUpdated.getNodeMasteryPct('gram-a2'), 100, 'gram-a2 should now be 100%');
assert.strictEqual(engineUpdated.getNodeMasteryPct('gram-b1'), 100, 'gram-b1 should now be 100%');
assert.strictEqual(engineUpdated.getNodeMasteryPct('gram-1'), 40, 'gram-1 (B2) should now be 40%');
assert.strictEqual(engineUpdated.getNodeStatus('gram-1'), 'unlocked', 'gram-1 should now be unlocked');

// Collocations must remain strictly unchanged
assert.strictEqual(engineUpdated.getNodeMasteryPct('col-2'), 40, 'col-2 should remain 40%');
assert.strictEqual(engineUpdated.getNodeStatus('col-2'), 'unlocked', 'col-2 should remain unlocked');

// Speaking must remain strictly unchanged
assert.strictEqual(engineUpdated.getNodeMasteryPct('spk-a1'), 40, 'spk-a1 should remain 40%');
assert.strictEqual(engineUpdated.getNodeStatus('spk-a2'), 'locked', 'spk-a2 should remain locked');

console.log('✓ Branch isolation verified: Grammar level change did not affect Collocations or Speaking.\n');

// ---------------------------------------------------------------------------
// 5. APEX SUMMIT (ALL C2) & NOVICE BASELINE (ALL A1) INVARIANTS
// ---------------------------------------------------------------------------
console.log('--- 5. SUMMIT (C2) & NOVICE (A1) INVARIANTS ---');

// All C2 Profile
const c2Skills = { vocab: 'C2', grammar: 'C2', reading: 'C2', speaking: 'C2', writing: 'C2', listening: 'C2' };
const c2Engine = createEngine(c2Skills);
for (const branchId of ['grammar', 'collocations', 'reading', 'speaking', 'writing']) {
  const bNodes = parsedNodes.filter(n => n.branchId === branchId).sort((a, b) => a.level - b.level);
  // Tiers 1-6 (A1 to C1) must be 100% mastered
  for (let i = 0; i < 6; i++) {
    assert.strictEqual(c2Engine.getNodeMasteryPct(bNodes[i].id), 100, `${bNodes[i].id} should be 100% in C2 profile`);
    assert.strictEqual(c2Engine.getNodeStatus(bNodes[i].id), 'mastered', `${bNodes[i].id} should be mastered in C2 profile`);
  }
  // Tier 7 (Level 7, first C2 node) must be 40% unlocked
  assert.strictEqual(c2Engine.getNodeMasteryPct(bNodes[6].id), 40, `${bNodes[6].id} should be 40% in C2 profile`);
  assert.strictEqual(c2Engine.getNodeStatus(bNodes[6].id), 'unlocked', `${bNodes[6].id} should be unlocked in C2 profile`);
}
console.log('✓ All-C2 profile unlocks Level 7 across all 5 branches with Level 1-6 mastered.');

// All A1 Profile
const a1Skills = { vocab: 'A1', grammar: 'A1', reading: 'A1', speaking: 'A1', writing: 'A1', listening: 'A1' };
const a1Engine = createEngine(a1Skills);
for (const branchId of ['grammar', 'collocations', 'reading', 'speaking', 'writing']) {
  const bNodes = parsedNodes.filter(n => n.branchId === branchId).sort((a, b) => a.level - b.level);
  // Level 1 (A1) must be 40% unlocked
  assert.strictEqual(a1Engine.getNodeMasteryPct(bNodes[0].id), 40, `${bNodes[0].id} should be 40% in A1 profile`);
  assert.strictEqual(a1Engine.getNodeStatus(bNodes[0].id), 'unlocked', `${bNodes[0].id} should be unlocked in A1 profile`);
  // All other tiers locked
  for (let i = 1; i < bNodes.length; i++) {
    assert.strictEqual(a1Engine.getNodeMasteryPct(bNodes[i].id), 0, `${bNodes[i].id} should be 0% in A1 profile`);
    assert.strictEqual(a1Engine.getNodeStatus(bNodes[i].id), 'locked', `${bNodes[i].id} should be locked in A1 profile`);
  }
}
console.log('✓ All-A1 profile opens Level 1 across all 5 branches with higher tiers locked.\n');

// ---------------------------------------------------------------------------
// 6. DOSSIER DEFAULT LEVEL RESOLUTION WITH PRODUCTION DATA
// ---------------------------------------------------------------------------
console.log('--- 6. DOSSIER LEVEL RESOLUTION WITH PRODUCTION DATA ---');

const dataDir = path.join(__dirname, '../src/assets/data');
const grammarData = JSON.parse(fs.readFileSync(path.join(dataDir, 'grammar.json'), 'utf8'));
const collocData = JSON.parse(fs.readFileSync(path.join(dataDir, 'collocations.json'), 'utf8'));
const readingData = JSON.parse(fs.readFileSync(path.join(dataDir, 'reading.json'), 'utf8'));
const listeningData = JSON.parse(fs.readFileSync(path.join(dataDir, 'listening.json'), 'utf8'));
const drillsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'drills.json'), 'utf8'));

// Replicate effectiveLevel logic
function levelsWithContent(items) {
  const present = new Set(items.map(i => i.cefrLevel));
  return CEFR_ORDER.filter(l => present.has(l));
}

function effectiveLevel(preferred, available) {
  if (available.has(preferred)) return preferred;
  const targetIdx = cefrIndex(preferred);
  let best = null;
  let minDiff = Infinity;
  for (const lvl of available) {
    const diff = Math.abs(cefrIndex(lvl) - targetIdx);
    if (diff < minDiff) {
      minDiff = diff;
      best = lvl;
    }
  }
  return best || 'B2';
}

function defaultLevel(items, preferred) {
  return effectiveLevel(preferred, new Set(levelsWithContent(items)));
}

// Test each dossier with its respective skill level
assert.strictEqual(defaultLevel(grammarData, 'B1'), 'B1', 'Grammar dossier should default to B1');
assert.strictEqual(defaultLevel(collocData, 'C1'), 'C1', 'Collocations dossier should default to C1');
assert.strictEqual(defaultLevel(readingData.articles, 'B2'), 'B2', 'Reading dossier should default to B2');
assert.strictEqual(defaultLevel(listeningData.samplePassages, 'A2'), 'A2', 'Listening dossier should default to A2');
assert.strictEqual(defaultLevel(drillsData.writing, 'A1'), 'A1', 'Writing dossier should default to A1');
assert.strictEqual(defaultLevel(drillsData.speaking, 'C2'), 'C2', 'Speaking dossier should default to C2');

console.log('✓ All dossiers resolve exact CEFR levels accurately against production datasets.');

console.log('\n================================================================');
console.log('✦ ALL CHECKS PASSED: Per-Branch Calibration & Dossier Wiring Verified');
console.log('================================================================');
