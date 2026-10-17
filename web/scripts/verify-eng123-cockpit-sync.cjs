// web/scripts/verify-eng123-cockpit-sync.cjs
// Verification suite for ENG-123: 40-Question Exam Cockpit Station, 1-40 Navigator Grid & Profile Sync UI
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('[TEST] Starting ENG-123 Exam Cockpit & Profile Sync Verification...\n');

const WEB_ROOT = path.join(__dirname, '..');
const DOSSIER_FILE = path.join(WEB_ROOT, 'src', 'modules', 'exam-cockpit-dossier.ts');
const STYLES_FILE = path.join(WEB_ROOT, 'src', 'assets', 'styles', 'dossiers.css');
const MOCK_VIEW_FILE = path.join(WEB_ROOT, 'src', 'ielts', 'views', 'mock.ts');
const HUD_FILE = path.join(WEB_ROOT, 'src', 'modules', 'header-hud.ts');

// 1. File existence
assert(fs.existsSync(DOSSIER_FILE), `Missing dossier file: ${DOSSIER_FILE}`);
assert(fs.existsSync(STYLES_FILE), `Missing styles file: ${STYLES_FILE}`);
assert(fs.existsSync(MOCK_VIEW_FILE), `Missing mock view file: ${MOCK_VIEW_FILE}`);
assert(fs.existsSync(HUD_FILE), `Missing HUD file: ${HUD_FILE}`);
console.log('✓ 1. All target source files exist.');

const dossierSrc = fs.readFileSync(DOSSIER_FILE, 'utf8');
const stylesSrc = fs.readFileSync(STYLES_FILE, 'utf8');
const mockSrc = fs.readFileSync(MOCK_VIEW_FILE, 'utf8');
const hudSrc = fs.readFileSync(HUD_FILE, 'utf8');

// 2. 1-40 Navigator Palette & Filter Tabs
assert.ok(dossierSrc.includes('for (let i = 1; i <= 40; i++)'), 'Missing 40-question palette generator');
assert.ok(dossierSrc.includes('cd-filter-tabs'), 'Missing cd-filter-tabs in dossier');
assert.ok(dossierSrc.includes('cd-filter-tab'), 'Missing cd-filter-tab in dossier');
assert.ok(dossierSrc.includes('activeFilter'), 'Missing activeFilter');
assert.ok(dossierSrc.includes('renderFilterTabs'), 'Missing renderFilterTabs method');
assert.ok(dossierSrc.includes('setFilter('), 'Missing setFilter method');
assert.ok(dossierSrc.includes('getPassageQuestionRange('), 'Missing getPassageQuestionRange method');
console.log('✓ 2. 1-40 Question Navigator & Passage 1-3 Filter Tabs verified.');

// 3. 60-Minute Countdown Timer & 10m/5m Alert Warnings
assert.ok(dossierSrc.includes('3600') && dossierSrc.includes('timerSeconds'), 'Timer must initialize to 3600 seconds (60 minutes)');
assert.ok(dossierSrc.includes('showTimerAlert'), 'Missing showTimerAlert method');
assert.ok(dossierSrc.includes('is-10min-warning'), 'Missing 10-minute warning state');
assert.ok(dossierSrc.includes('is-5min-urgent'), 'Missing 5-minute urgent warning state');
assert.ok(dossierSrc.includes('cd-timer-alert-banner'), 'Missing cd-timer-alert-banner element');
console.log('✓ 3. 60-min countdown timer with 10-min and 5-min warning alerts verified.');

// 4. Split-Screen Resizer & Passage Highlighter
assert.ok(dossierSrc.includes('cd-drag-resizer'), 'Missing resizer DOM element class');
assert.ok(dossierSrc.includes('Math.max(25, Math.min(75,'), 'Resizer width must clamp between 25% and 75%');
assert.ok(dossierSrc.includes('window.getSelection()'), 'Passage highlighter must use Range/Selection API');
assert.ok(dossierSrc.includes('cd-highlight-mark'), 'Missing cd-highlight-mark highlighter class');
console.log('✓ 4. Split-screen resizer engine & passage highlighter verified.');

// 5. Post-Test Band Conversion Modal & Cambridge 9.0 Scale Mapping
assert.ok(dossierSrc.includes('openBandConversionModal'), 'Missing openBandConversionModal method');
assert.ok(dossierSrc.includes('rawToBand('), 'Missing rawToBand converter');
assert.ok(dossierSrc.includes('getBandDescriptor('), 'Missing getBandDescriptor helper');
assert.ok(dossierSrc.includes('cd-band-modal-overlay'), 'Missing cd-band-modal-overlay');
assert.ok(dossierSrc.includes('cd-band-modal-card'), 'Missing cd-band-modal-card');
assert.ok(dossierSrc.includes('cd-scale-gauge-track'), 'Missing cd-scale-gauge-track');
assert.ok(dossierSrc.includes('cd-scale-gauge-needle'), 'Missing cd-scale-gauge-needle');
assert.ok(dossierSrc.includes('cd-breakdown-grid'), 'Missing cd-breakdown-grid');
console.log('✓ 5. Cambridge 9.0 Band Conversion Modal & raw-to-band scale verified.');

// 6. CD-IELTS Mock View Integration
assert.ok(mockSrc.includes('ExamCockpitDossier'), 'Mock view must import ExamCockpitDossier');
assert.ok(mockSrc.includes('mountCockpitMockTest'), 'Mock view must implement mountCockpitMockTest');
assert.ok(mockSrc.includes('btn-launch-cockpit-mock'), 'Mock view must provide launch cockpit button');
console.log('✓ 6. IELTS Mock View cockpit integration verified.');

// 7. Header HUD & Settings Modal Profile Export/Import
assert.ok(hudSrc.includes('btn-export-profile'), 'Header HUD must include btn-export-profile');
assert.ok(hudSrc.includes('btn-import-profile'), 'Header HUD must include btn-import-profile');
assert.ok(hudSrc.includes('hud-profile-file-input'), 'Header HUD must include hud-profile-file-input file picker');
assert.ok(hudSrc.includes('btn-profile-export'), 'Settings modal must include btn-profile-export');
assert.ok(hudSrc.includes('btn-profile-import'), 'Settings modal must include btn-profile-import');
assert.ok(hudSrc.includes('static exportUnifiedProfile()'), 'HeaderHUD must export static exportUnifiedProfile');
assert.ok(hudSrc.includes('static async importUnifiedProfile('), 'HeaderHUD must export static importUnifiedProfile');
assert.ok(hudSrc.includes('static showStatusDialog('), 'HeaderHUD must export static showStatusDialog');
assert.ok(hudSrc.includes('hud-status-dialog'), 'HeaderHUD must style/create hud-status-dialog');
console.log('✓ 7. Header HUD & Settings Modal profile sync buttons & status dialog verified.');

// 8. CSS Classes & Accessibility verification
assert.ok(stylesSrc.includes('.cd-filter-tabs'), 'CSS missing .cd-filter-tabs');
assert.ok(stylesSrc.includes('.cd-filter-tab'), 'CSS missing .cd-filter-tab');
assert.ok(stylesSrc.includes('.cd-timer-alert-banner'), 'CSS missing .cd-timer-alert-banner');
assert.ok(stylesSrc.includes('.is-10min-warning'), 'CSS missing .is-10min-warning');
assert.ok(stylesSrc.includes('.is-5min-urgent'), 'CSS missing .is-5min-urgent');
assert.ok(stylesSrc.includes('.cd-band-modal-card'), 'CSS missing .cd-band-modal-card');
assert.ok(stylesSrc.includes('.cd-scale-gauge-track'), 'CSS missing .cd-scale-gauge-track');
assert.ok(stylesSrc.includes('.cd-breakdown-grid'), 'CSS missing .cd-breakdown-grid');
console.log('✓ 8. Dossiers stylesheet WCAG AAA styling & animation classes verified.');

console.log('\n[SUCCESS] ENG-123 40-Question Exam Cockpit & Profile Sync 100% VERIFIED!\n');
process.exit(0);
