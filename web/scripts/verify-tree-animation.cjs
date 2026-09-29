const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[MOTION TEST 2] Verifying Animated Constellation Tree...');

const treeTs = fs.readFileSync(path.join(__dirname, '../src/modules/skill-tree-view.ts'), 'utf-8');

// 1. Assert MotionEngine usage in SkillTreeView
assert(treeTs.includes('MotionEngine'), "skill-tree-view.ts must import and use MotionEngine");
assert(treeTs.includes('MotionEngine.drawSvgLines') || treeTs.includes('drawSvgLines'), "skill-tree-view.ts must animate SVG filaments");
assert(treeTs.includes('MotionEngine.staggerEntrance') || treeTs.includes('staggerEntrance'), "skill-tree-view.ts must animate star nodes entrance");

// 2. Assert Modal spring animation
assert(treeTs.includes('MotionEngine.springModal') || treeTs.includes('springModal'), "skill-tree-view.ts must use springModal when opening node dialog");

console.log('✅ [MOTION TEST 2 PASSED] Animated Constellation Tree verified.');
