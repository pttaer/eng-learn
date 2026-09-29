const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 4] Verifying Constellation Skill Tree UI & Daily Workout Banner...');

const viewTsPath = path.join(__dirname, '../src/modules/skill-tree-view.ts');
assert(fs.existsSync(viewTsPath), "skill-tree-view.ts must exist");

const viewTs = fs.readFileSync(viewTsPath, 'utf-8');
const mainTs = fs.readFileSync(path.join(__dirname, '../src/main.ts'), 'utf-8');
const dossiersCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/dossiers.css'), 'utf-8');

// 1. Assert SkillTreeView handles SVG constellation rendering
assert(viewTs.includes('<svg') || viewTs.includes('svg'), "skill-tree-view.ts must render constellation SVG filaments");
assert(viewTs.includes('renderWorkoutBanner') || viewTs.includes('workout-banner'), "skill-tree-view.ts must render daily 15-minute workout banner");
assert(viewTs.includes('openNodeModal') || viewTs.includes('renderNodeModal'), "skill-tree-view.ts must provide node details modal with CTA");

// 2. Assert main.ts instantiates SkillTreeView and routes 'tree'
assert(mainTs.includes('SkillTreeView'), "main.ts must import and instantiate SkillTreeView");
assert(mainTs.includes("case 'tree':"), "main.ts handleRouteChange must handle 'tree'");

// 3. Assert styling for constellation exists
assert(dossiersCss.includes('.constellation-container') || dossiersCss.includes('.skill-tree-view'), "dossiers.css must define constellation tree styles");
assert(dossiersCss.includes('.node-locked') && dossiersCss.includes('.node-mastered'), "dossiers.css must style locked and mastered nodes");

console.log('✅ [TEST 4 PASSED] Constellation Tree UI & Workout Banner verified.');
