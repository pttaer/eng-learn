// web/scripts/verify-exam-exit-guard.cjs
// Verification suite for Navigation Guard, Active Exam Confirmation Popup & Nav State Stability
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('[TEST] Starting Navigation Guard & Active Exam Confirmation Popup Verification...\n');

const WEB_ROOT = path.join(__dirname, '..');
const ROUTER_FILE = path.join(WEB_ROOT, 'src', 'core', 'router.ts');
const HUD_FILE = path.join(WEB_ROOT, 'src', 'modules', 'header-hud.ts');
const COCKPIT_FILE = path.join(WEB_ROOT, 'src', 'modules', 'exam-cockpit-dossier.ts');
const BLITZ_FILE = path.join(WEB_ROOT, 'src', 'modules', 'blitz-dossier.ts');
const MAIN_FILE = path.join(WEB_ROOT, 'src', 'main.ts');
const STYLES_FILE = path.join(WEB_ROOT, 'src', 'assets', 'styles', 'hud-base.css');

assert.ok(fs.existsSync(ROUTER_FILE), 'router.ts must exist');
assert.ok(fs.existsSync(HUD_FILE), 'header-hud.ts must exist');
assert.ok(fs.existsSync(COCKPIT_FILE), 'exam-cockpit-dossier.ts must exist');
assert.ok(fs.existsSync(BLITZ_FILE), 'blitz-dossier.ts must exist');
assert.ok(fs.existsSync(MAIN_FILE), 'main.ts must exist');
assert.ok(fs.existsSync(STYLES_FILE), 'hud-base.css must exist');

const routerSrc = fs.readFileSync(ROUTER_FILE, 'utf8');
const hudSrc = fs.readFileSync(HUD_FILE, 'utf8');
const cockpitSrc = fs.readFileSync(COCKPIT_FILE, 'utf8');
const blitzSrc = fs.readFileSync(BLITZ_FILE, 'utf8');
const mainSrc = fs.readFileSync(MAIN_FILE, 'utf8');
const stylesSrc = fs.readFileSync(STYLES_FILE, 'utf8');

// 1. Router Navigation Guard Architecture
console.log('Verifying 1. Router Navigation Guard...');
assert.ok(routerSrc.includes('RouteNavigationGuard'), 'router.ts must declare RouteNavigationGuard type');
assert.ok(routerSrc.includes('setBeforeNavigate'), 'router.ts must export setBeforeNavigate method');
assert.ok(routerSrc.includes('isReverting'), 'router.ts must handle hash reversion when navigation is cancelled');
assert.ok(routerSrc.includes('this.guard'), 'router.ts must evaluate guard before route switch');
console.log('✓ 1. Router Navigation Guard successfully implemented.\n');

// 2. HeaderHUD showConfirmDialog Implementation
console.log('Verifying 2. HeaderHUD.showConfirmDialog...');
assert.ok(hudSrc.includes('showConfirmDialog'), 'header-hud.ts must declare showConfirmDialog');
assert.ok(hudSrc.includes('hud-confirm-dialog'), 'header-hud.ts must create #hud-confirm-dialog');
assert.ok(hudSrc.includes('btn-confirm-cancel'), 'showConfirmDialog must render safe cancel button');
assert.ok(hudSrc.includes('btn-confirm-proceed'), 'showConfirmDialog must render deliberate proceed button');
assert.ok(hudSrc.includes('Escape'), 'showConfirmDialog must handle Escape key cancellation');
assert.ok(hudSrc.includes('closeActiveOverlay'), 'HeaderHUD must have closeActiveOverlay');
console.log('✓ 2. HeaderHUD.showConfirmDialog verified.\n');

// 3. ExamCockpitDossier Active Exam Guard
console.log('Verifying 3. ExamCockpitDossier Active Exam Guard...');
assert.ok(cockpitSrc.includes('isExamActive(): boolean'), 'exam-cockpit-dossier.ts must declare isExamActive()');
assert.ok(cockpitSrc.includes('canDeactivate'), 'exam-cockpit-dossier.ts must declare canDeactivate()');
assert.ok(cockpitSrc.includes('showConfirmDialog'), 'canDeactivate must invoke HeaderHUD.showConfirmDialog');
assert.ok(cockpitSrc.includes('beforeunload'), 'exam-cockpit-dossier.ts must attach beforeunload event listener');
assert.ok(cockpitSrc.includes('removeEventListener(\'beforeunload\''), 'teardown must clean up beforeunload');
console.log('✓ 3. ExamCockpitDossier Active Exam Guard verified.\n');

// 4. BlitzDossier Active Sprint Guard
console.log('Verifying 4. BlitzDossier Sprint Guard...');
assert.ok(blitzSrc.includes('canDeactivate'), 'blitz-dossier.ts must declare canDeactivate()');
assert.ok(blitzSrc.includes('showConfirmDialog'), 'blitz canDeactivate must invoke showConfirmDialog');
console.log('✓ 4. BlitzDossier Sprint Guard verified.\n');

// 5. Main Wiring
console.log('Verifying 5. Main Router Guard Wiring...');
assert.ok(mainSrc.includes('setBeforeNavigate'), 'main.ts must register guard via setBeforeNavigate');
assert.ok(mainSrc.includes('canDeactivate'), 'main.ts must query activeDossierHandle.canDeactivate');
assert.ok(mainSrc.includes('#hud-confirm-dialog'), 'main.ts handleRouteChange must clean up #hud-confirm-dialog');
console.log('✓ 5. Main Router Guard Wiring verified.\n');

// 6. Navigation Bar Color & State Locking
console.log('Verifying 6. Navigation Bar Color Locking...');
assert.ok(hudSrc.includes('btn-route-active'), 'header-hud.ts must bind btn-route-active on active routes');
assert.ok(stylesSrc.includes('.hud-btn.btn-route-active'), 'hud-base.css must define .hud-btn.btn-route-active styles');
assert.ok(hudSrc.includes('bnav-tree, .bnav-blitz, .bnav-cockpit'), 'Only route buttons in bottom nav should trigger paintBnav');
console.log('✓ 6. Navigation Bar Color Locking verified.\n');

console.log('====================================================');
console.log('✅ ALL NAVIGATION & ACTIVE EXAM GUARD CHECKS PASSED!');
console.log('====================================================');

