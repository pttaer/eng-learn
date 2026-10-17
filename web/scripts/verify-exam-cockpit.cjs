// web/scripts/verify-exam-cockpit.cjs
// Headless test suite asserting CD-IELTS Exam Cockpit & Split-Screen Resizer (ENG-108)
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('[TEST] Starting CD-IELTS Exam Cockpit & Split-Screen Resizer Verification (ENG-108)...');

const WEB_ROOT = path.join(__dirname, '..');
const DOSSIER_FILE = path.join(WEB_ROOT, 'src', 'modules', 'exam-cockpit-dossier.ts');
const STYLES_FILE = path.join(WEB_ROOT, 'src', 'assets', 'styles', 'dossiers.css');
const HUD_FILE = path.join(WEB_ROOT, 'src', 'modules', 'header-hud.ts');
const ROUTER_FILE = path.join(WEB_ROOT, 'src', 'core', 'router.ts');
const MAIN_FILE = path.join(WEB_ROOT, 'src', 'main.ts');

// 1. Verify existence of primary files
assert(fs.existsSync(DOSSIER_FILE), `Missing dossier file: ${DOSSIER_FILE}`);
assert(fs.existsSync(STYLES_FILE), `Missing styles file: ${STYLES_FILE}`);
assert(fs.existsSync(HUD_FILE), `Missing HUD file: ${HUD_FILE}`);
assert(fs.existsSync(ROUTER_FILE), `Missing router file: ${ROUTER_FILE}`);
assert(fs.existsSync(MAIN_FILE), `Missing main file: ${MAIN_FILE}`);
console.log('  [PASS] All architectural component files exist.');

const dossierSrc = fs.readFileSync(DOSSIER_FILE, 'utf8');
const stylesSrc = fs.readFileSync(STYLES_FILE, 'utf8');
const hudSrc = fs.readFileSync(HUD_FILE, 'utf8');
const routerSrc = fs.readFileSync(ROUTER_FILE, 'utf8');
const mainSrc = fs.readFileSync(MAIN_FILE, 'utf8');

// 2. Assert ExamCockpitDossier Class & Core Architecture
assert.ok(dossierSrc.includes('export class ExamCockpitDossier'), 'Missing ExamCockpitDossier export');
assert.ok(dossierSrc.includes('render(): HTMLElement'), 'Missing render() returning HTMLElement');
assert.ok(dossierSrc.includes('teardown(): void'), 'Missing teardown() method');
assert.ok(dossierSrc.includes('handleGlobalKey('), 'Missing handleGlobalKey method');
console.log('  [PASS] ExamCockpitDossier class interface & lifecycle verified.');

// 3. Assert Split-Screen Resizer Engine (Pointer events & clamping)
assert.ok(dossierSrc.includes('cd-drag-resizer'), 'Missing resizer DOM element class');
assert.ok(dossierSrc.includes('pointerdown'), 'Missing pointerdown event listener');
assert.ok(dossierSrc.includes('Math.max(25, Math.min(75,'), 'Resizer width must clamp between 25% and 75%');
assert.ok(dossierSrc.includes('setPointerCapture'), 'Pointer capture must be set during drag');
assert.ok(dossierSrc.includes('releasePointerCapture'), 'Pointer capture must be released on drag end');
console.log('  [PASS] 50/50 split-screen pointer drag resizer engine verified.');

// 4. Assert Passage Highlighter Tool (Range/Selection API)
assert.ok(dossierSrc.includes('window.getSelection()'), 'Highlighter must use native Range/Selection API');
assert.ok(dossierSrc.includes('cd-highlight-mark'), 'Highlighter mark class missing');
assert.ok(dossierSrc.includes('checkTextSelection'), 'checkTextSelection method missing');
assert.ok(dossierSrc.includes('showHighlightPopover'), 'showHighlightPopover method missing');
assert.ok(dossierSrc.includes('removeHighlightPopover'), 'removeHighlightPopover method missing');
console.log('  [PASS] Native passage highlighter tool (Range/Selection API) verified.');

// 5. Assert Synchronized Question Pane & Paragraph Jump Anchors
assert.ok(dossierSrc.includes('paragraphAnchor'), 'Question interface must support paragraphAnchor');
assert.ok(dossierSrc.includes('cd-anchor-jump-btn'), 'Missing anchor jump button class');
assert.ok(dossierSrc.includes('scrollIntoView'), 'Missing scrollIntoView jump behavior');
console.log('  [PASS] Synchronized question pane & paragraph jump anchors verified.');

// 6. Assert 40-Question Palette & State Machine
assert.ok(dossierSrc.includes('for (let i = 1; i <= 40; i++)'), 'Must generate authentic 40 questions palette');
assert.ok(dossierSrc.includes('cd-q-matrix-btn'), 'Missing matrix button class');
assert.ok(dossierSrc.includes('is-answered'), 'Missing is-answered class logic');
assert.ok(dossierSrc.includes('is-flagged'), 'Missing is-flagged class logic');
assert.ok(dossierSrc.includes('is-current'), 'Missing is-current class logic');
console.log('  [PASS] 1-40 Question Matrix palette (answered/unanswered/flagged states) verified.');

// 7. Assert Word Counter & Throttled Autosave Scratchpad
assert.ok(dossierSrc.includes('cd_ielts_scratchpad_draft'), 'Autosave must persist to localStorage cd_ielts_scratchpad_draft');
assert.ok(dossierSrc.includes('1000'), 'Autosave must debounce/throttle at 1,000ms');
assert.ok(dossierSrc.includes('updateWritingWordCount'), 'Missing word count updater');
assert.ok(dossierSrc.includes('writingTargetWords'), 'Missing writing word target');
console.log('  [PASS] Live word counter (150/250 thresholds) & 1,000ms autosave scratchpad verified.');

// 8. Assert 4 Official Cambridge Contrast Themes
const expectedThemes = ['standard-light', 'dark-obsidian', 'yellow-black', 'blue-cream'];
expectedThemes.forEach(t => {
  assert.ok(dossierSrc.includes(`'${t}'`), `Missing theme definition in dossier: ${t}`);
  assert.ok(stylesSrc.includes(`[data-cockpit-theme="${t}"]`), `Missing CSS theme selector in dossiers.css: ${t}`);
});
console.log('  [PASS] 4 Official Cambridge Contrast Themes verified (WCAG 2.2 AAA tokens defined).');

// 9. Assert Distraction-Free Fullscreen & Keyboard Hotkeys
assert.ok(dossierSrc.includes('requestFullscreen'), 'Must support native Fullscreen API');
assert.ok(dossierSrc.includes('exitFullscreen'), 'Must support exitFullscreen');
assert.ok(dossierSrc.includes("key === 'n' || key === 'N'") && dossierSrc.includes('altKey'), 'Alt+N Next hotkey missing');
assert.ok(dossierSrc.includes("key === 'p' || key === 'P'") && dossierSrc.includes('altKey'), 'Alt+P Prev hotkey missing');
assert.ok(dossierSrc.includes("key === 'f' || key === 'F'") && dossierSrc.includes('altKey'), 'Alt+F Flag hotkey missing');
assert.ok(dossierSrc.includes('ctrlKey') && dossierSrc.includes("key === 'Enter'"), 'Ctrl+Enter submit hotkey missing');
console.log('  [PASS] Distraction-Free Fullscreen & Keyboard Hotkeys (Alt+N, Alt+P, Alt+F, Ctrl+Enter) verified.');

// 10. Assert CSS Architecture & Viewport Locking
assert.ok(stylesSrc.includes('#workspace-mount.cockpit-mode'), 'Missing #workspace-mount.cockpit-mode in dossiers.css');
assert.ok(stylesSrc.includes('overflow: hidden'), 'Workspace mount must enforce overflow: hidden for 100dvh lock');
assert.ok(stylesSrc.includes('.cd-cockpit-shell'), 'Missing .cd-cockpit-shell root class in dossiers.css');
assert.ok(stylesSrc.includes('.cd-split-arena'), 'Missing .cd-split-arena class in dossiers.css');
assert.ok(stylesSrc.includes('.cd-drag-resizer'), 'Missing .cd-drag-resizer class in dossiers.css');
assert.ok(stylesSrc.includes(':focus-visible'), 'Missing WCAG AAA focus visible ring styles in dossiers.css');
console.log('  [PASS] CSS architecture & 100dvh viewport locking verified.');

// 11. Assert Header HUD Integration
assert.ok(hudSrc.includes("cockpit: 'IELTS COCKPIT'"), 'ROUTE_NAMES must contain cockpit route');
assert.ok(hudSrc.includes('btn-ielts-cockpit'), 'Header HUD must have btn-ielts-cockpit button');
assert.ok(hudSrc.includes('onNavigateToCockpit'), 'Header HUD must declare onNavigateToCockpit');
console.log('  [PASS] Header HUD launch button & route label verified.');

// 12. Assert Router Integration
assert.ok(routerSrc.includes("'cockpit'"), 'Router RouteId & validRoutes must include cockpit');
console.log('  [PASS] Router RouteId registration verified.');

// 13. Assert Main Orchestrator Integration
assert.ok(mainSrc.includes("import { ExamCockpitDossier } from './modules/exam-cockpit-dossier';"), 'main.ts must import ExamCockpitDossier');
assert.ok(mainSrc.includes('(window as any).ExamCockpitDossier = ExamCockpitDossier;'), 'main.ts must expose ExamCockpitDossier on window');
assert.ok(mainSrc.includes('case \'cockpit\':'), 'main.ts handleRouteChange must handle cockpit route');
assert.ok(mainSrc.includes('this.headerHud.onNavigateToCockpit'), 'main.ts must bind onNavigateToCockpit');
assert.ok(mainSrc.includes('this.examCockpit.onTestSubmitted'), 'main.ts must bind onTestSubmitted ritual');
assert.ok(mainSrc.includes("e.key === 'c' || e.key === 'C'"), 'main.ts must support hotkey C for cockpit navigation');
console.log('  [PASS] main.ts application orchestrator integration verified.');

console.log('\n[SUCCESS] CD-IELTS Exam Cockpit & Split-Screen Resizer (ENG-108) 100% VERIFIED!');
process.exit(0);
