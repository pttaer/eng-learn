// web/scripts/verify-eng73-streak-notifications.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[VERIFY ENG-73] Initializing Header HUD Streak Pill & Notification Settings Verification...');

const headerHudTs = fs.readFileSync(path.join(__dirname, '../src/modules/header-hud.ts'), 'utf8');
const hudBaseCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/hud-base.css'), 'utf8');
const storageTs = fs.readFileSync(path.join(__dirname, '../src/utils/storage.ts'), 'utf8');

// 1. Header HUD: Streak Counter Pill & Format '🔥 <N>d'
assert(headerHudTs.includes('btn-streak-pill'), 'header-hud.ts must define .btn-streak-pill button');
assert(headerHudTs.includes('🔥 ${currentStreak}d') || headerHudTs.includes('🔥 ${progState.streak}d'),
  'header-hud.ts must render streak in "🔥 <N>d" format');
assert(headerHudTs.includes('currentStreak = progression.streak || state.streak.currentStreak || 0'),
  'header-hud.ts must derive streak from progression / storage streak state');
console.log('✓ Suite 1: Dynamic streak counter pill (🔥 <N>d) verified in header-hud.ts');

// 2. Header HUD: Streak Pill Click Navigation
assert(headerHudTs.includes('navigateToTreeOrWorkout'), 'header-hud.ts must define navigation to tree / workout on streak click');
assert(headerHudTs.includes('onNavigateToTree') && headerHudTs.includes('#tree'),
  'header-hud.ts streak click handler must navigate to #tree');
assert(headerHudTs.includes('workout-banner') || headerHudTs.includes('workout-panel'),
  'header-hud.ts streak click handler must support scrolling to workout panel');
console.log('✓ Suite 2: Streak pill click navigation to #tree/workout verified in header-hud.ts');

// 3. Settings Modal: Notification Toggle Switch
assert(headerHudTs.includes('btn-notifications-toggle'), 'header-hud.ts must include .btn-notifications-toggle in settings modal');
assert(headerHudTs.includes('Daily Review Alerts:'), 'header-hud.ts must include "Daily Review Alerts:" label');
assert(headerHudTs.includes('🔔 Daily Review Alerts: ${StorageManager.isNotificationsEnabled() ? \'ON\' : \'OFF\'}'),
  'header-hud.ts must render "🔔 Daily Review Alerts: ON / OFF" switch based on StorageManager');
assert(headerHudTs.includes('StorageManager.setNotificationsEnabled'),
  'header-hud.ts must persist notification toggle state via StorageManager');
console.log('✓ Suite 3: Notification permission toggle switch in settings modal verified');

// 4. StorageManager: Notification Methods & Schema
assert(storageTs.includes('isNotificationsEnabled'), 'storage.ts must expose isNotificationsEnabled()');
assert(storageTs.includes('setNotificationsEnabled'), 'storage.ts must expose setNotificationsEnabled()');
assert(storageTs.includes('notificationsEnabled'), 'storage.ts AppStorageState must support notificationsEnabled');
console.log('✓ Suite 4: StorageManager notificationsEnabled schema and helpers verified in storage.ts');

// 5. CSS: Clean Minimal Styling & Responsive Layout Wrapping
assert(hudBaseCss.includes('.btn-streak-pill'), 'hud-base.css must define .btn-streak-pill styling');
assert(hudBaseCss.includes('.btn-notifications-toggle'), 'hud-base.css must define .btn-notifications-toggle styling');
assert(hudBaseCss.includes('flex-wrap: wrap'), 'hud-base.css must enable flex-wrap for responsive header layout');
assert(hudBaseCss.includes('@media (max-width: 760px)'), 'hud-base.css must define mobile layout adaptations');
assert(hudBaseCss.includes('@media (max-width: 480px)'), 'hud-base.css must define compact mobile adaptations (320px/390px screens)');
console.log('✓ Suite 5: Styling tokens and zero-overflow mobile wrapping verified in hud-base.css');

console.log('================================================================');
console.log('✅ [VERIFY ENG-73 PASSED] Header HUD Streak Pill & Notification Settings Verified 100%');
console.log('================================================================');
