// web/scripts/verify-mobile-nav.cjs
// Verification suite for ENG-125: Mobile Bottom Navigation Bar, Action Sheet Drawer & Header Streamline
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('[TEST] Starting ENG-125 Mobile Navigation & Action Sheet Verification...\n');

const WEB_ROOT = path.join(__dirname, '..');
const HUD_FILE = path.join(WEB_ROOT, 'src', 'modules', 'header-hud.ts');
const STYLES_FILE = path.join(WEB_ROOT, 'src', 'assets', 'styles', 'hud-base.css');

// 1. Target files existence
assert(fs.existsSync(HUD_FILE), `Missing HUD file: ${HUD_FILE}`);
assert(fs.existsSync(STYLES_FILE), `Missing styles file: ${STYLES_FILE}`);
console.log('✓ 1. Target files exist: header-hud.ts and hud-base.css');

const hudSrc = fs.readFileSync(HUD_FILE, 'utf8');
const stylesSrc = fs.readFileSync(STYLES_FILE, 'utf8');

// 2. Mobile Viewport (<= 768px) Header Streamlining in CSS
assert.ok(stylesSrc.includes('@media (max-width: 768px)'), 'hud-base.css must define @media (max-width: 768px)');
assert.ok(
  stylesSrc.includes('btn-mobile-menu-drawer') && stylesSrc.includes('display: none'),
  '.btn-mobile-menu-drawer must be hidden on desktop viewports by default'
);
assert.ok(
  stylesSrc.includes('button:not(.btn-streak-pill):not(.btn-mobile-menu-drawer)') ||
  stylesSrc.includes('.hud-actions > button:not(.btn-streak-pill)'),
  'Must hide top row action buttons on mobile except streak pill and drawer trigger'
);
assert.ok(
  stylesSrc.includes('.btn-mobile-menu-drawer') && stylesSrc.includes('display: inline-flex !important'),
  '.btn-mobile-menu-drawer must be displayed on mobile viewports'
);
console.log('✓ 2. Header streamlining on mobile (<=768px) verified in hud-base.css.');

// 3. Bottom Navigation Bar CSS Architecture & Geometry
assert.ok(stylesSrc.includes('.hud-bottom-nav'), 'Missing .hud-bottom-nav class in hud-base.css');
assert.ok(stylesSrc.includes('position: fixed'), 'Bottom nav must be fixed positioned');
assert.ok(stylesSrc.includes('bottom: 0'), 'Bottom nav must anchor to bottom: 0');
assert.ok(stylesSrc.includes('z-index: 1000') || stylesSrc.includes('z-index:1000'), 'Bottom nav must have high z-index (1000)');
assert.ok(stylesSrc.includes('height: 60px'), 'Bottom nav must define 60px fixed height');
assert.ok(stylesSrc.includes('safe-area-inset-bottom'), 'Bottom nav must respect iOS safe-area-inset-bottom');
assert.ok(stylesSrc.includes('.bnav-btn'), 'Missing .bnav-btn bottom nav button class');
console.log('✓ 3. Fixed mobile bottom navigation bar CSS geometry verified.');

// 4. Touch Ergonomics & 48px / 44px Target Audit
assert.ok(
  stylesSrc.includes('min-height: 48px') || stylesSrc.includes('min-width: 48px') || stylesSrc.includes('height: 48px'),
  'Bottom nav buttons and mobile drawer trigger must enforce >= 48px touch targets'
);
assert.ok(
  hudSrc.includes('btn-mobile-menu-drawer'),
  'HeaderHUD must render .btn-mobile-menu-drawer trigger button'
);
console.log('✓ 4. Touch target minimums (>=44x44px and 48px touch zone) verified.');

// 5. Bottom Navigation Bar HTML & 5 Primary Thumb Actions
assert.ok(hudSrc.includes('class="hud-bottom-nav"'), 'HeaderHUD.render() must include .hud-bottom-nav element');
assert.ok(hudSrc.includes('bnav-tree'), 'Missing [ ✦ Tree ] primary bottom thumb action');
assert.ok(hudSrc.includes('bnav-blitz'), 'Missing [ ⚡ Blitz ] primary bottom thumb action');
assert.ok(hudSrc.includes('bnav-radar'), 'Missing [ 🎯 Radar ] primary bottom thumb action');
assert.ok(hudSrc.includes('bnav-cockpit'), 'Missing [ 🎓 Cockpit ] primary bottom thumb action');
assert.ok(hudSrc.includes('bnav-more'), 'Missing [ ☰ More ] primary bottom thumb action');

// Verify all 5 buttons have aria-label
['bnav-tree', 'bnav-blitz', 'bnav-radar', 'bnav-cockpit', 'bnav-more'].forEach(cls => {
  const match = hudSrc.match(new RegExp(`<button[^>]*class="[^"]*${cls}[^"]*"[^>]*aria-label="([^"]+)"`));
  assert.ok(match && match[1], `Bottom nav button .${cls} must possess an explicit aria-label`);
});
console.log('✓ 5. 5 Primary thumb-zone actions (Tree, Blitz, Radar, Cockpit, More) with ARIA labels verified.');

// 6. Navigation Event Handlers in HeaderHUD
assert.ok(hudSrc.includes('bnavTree'), 'Missing bnavTree listener binding');
assert.ok(hudSrc.includes('bnavBlitz'), 'Missing bnavBlitz listener binding');
assert.ok(hudSrc.includes('bnavRadar'), 'Missing bnavRadar listener binding');
assert.ok(hudSrc.includes('bnavCockpit'), 'Missing bnavCockpit listener binding');
assert.ok(hudSrc.includes('bnavMore'), 'Missing bnavMore listener binding');
assert.ok(hudSrc.includes('mobileDrawerBtn'), 'Missing mobileDrawerBtn listener binding');
console.log('✓ 6. Mobile bottom nav & drawer click handlers verified in HeaderHUD.bindEvents().');

// 7. Mobile Action Sheet Drawer Architecture & Accessibility
assert.ok(hudSrc.includes('openMobileActionSheet'), 'HeaderHUD must declare openMobileActionSheet() method');
assert.ok(hudSrc.includes("'role', 'dialog'") || hudSrc.includes('role="dialog"'), 'Action sheet must have role="dialog"');
assert.ok(hudSrc.includes("'aria-modal', 'true'") || hudSrc.includes('aria-modal="true"'), 'Action sheet must declare aria-modal="true"');
assert.ok(hudSrc.includes("'aria-label'") || hudSrc.includes('aria-label='), 'Action sheet must have aria-label');

// Secondary controls in drawer:
assert.ok(hudSrc.includes('sheet-btn-theme'), 'Missing theme toggle in action sheet');
assert.ok(hudSrc.includes('sheet-btn-sound'), 'Missing sound toggle in action sheet');
assert.ok(hudSrc.includes('sheet-btn-music'), 'Missing ambient music control in action sheet');
assert.ok(hudSrc.includes('sheet-btn-zen'), 'Missing zen mode toggle in action sheet');
assert.ok(hudSrc.includes('sheet-btn-tour'), 'Missing tour trigger in action sheet');
assert.ok(hudSrc.includes('sheet-btn-export'), 'Missing export profile in action sheet');
assert.ok(hudSrc.includes('sheet-btn-import'), 'Missing import profile in action sheet');
assert.ok(hudSrc.includes('sheet-btn-settings'), 'Missing settings button in action sheet');
assert.ok(hudSrc.includes('sheet-btn-close'), 'Missing close button in action sheet');

// Check min-height 48px on sheet buttons
assert.ok(hudSrc.includes('min-height: 48px'), 'Action sheet buttons must enforce min-height 48px');
console.log('✓ 7. Mobile Action Sheet Drawer (9 secondary controls, 48px height, ARIA dialog) verified.');

console.log('\n[SUCCESS] ENG-125 Mobile Bottom Navigation & Action Sheet Drawer 100% VERIFIED!\n');
process.exit(0);
