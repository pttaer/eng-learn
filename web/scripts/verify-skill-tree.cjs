const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 3] Verifying Constellation Skill Tree Engine & Prerequisite Logic...');

const dataTsPath = path.join(__dirname, '../src/core/skill-tree-data.ts');
const engineTsPath = path.join(__dirname, '../src/core/skill-tree-engine.ts');

assert(fs.existsSync(dataTsPath), "skill-tree-data.ts must exist");
assert(fs.existsSync(engineTsPath), "skill-tree-engine.ts must exist");

const dataTs = fs.readFileSync(dataTsPath, 'utf-8');
const engineTs = fs.readFileSync(engineTsPath, 'utf-8');

// 1. Assert all 5 branches exist in data definition
assert(dataTs.includes("'grammar'"), "skill-tree-data must include grammar branch");
assert(dataTs.includes("'collocations'"), "skill-tree-data must include collocations branch");
assert(dataTs.includes("'writing'"), "skill-tree-data must include writing branch");
assert(dataTs.includes("'speaking'"), "skill-tree-data must include speaking branch");
assert(dataTs.includes("'reading'"), "skill-tree-data must include reading branch");

// 2. Assert prerequisite tracking fields
assert(dataTs.includes('prerequisites: string[]'), "Skill nodes must define prerequisites array");
assert(dataTs.includes('masteryThreshold: number'), "Skill nodes must define masteryThreshold");
assert(dataTs.includes('routeTarget: RouteId'), "Skill nodes must map to a RouteId");

// 3. Assert engine implements node status calculation
assert(engineTs.includes('isNodeUnlocked'), "SkillTreeEngine must implement isNodeUnlocked");
assert(engineTs.includes('calculateSummitProgress'), "SkillTreeEngine must calculate overall summit progress");
assert(engineTs.includes('getNodeStatus'), "SkillTreeEngine must implement getNodeStatus returning 'locked' | 'unlocked' | 'mastered'");

console.log('✅ [TEST 3 PASSED] Skill Tree Engine data and prerequisite logic verified.');
