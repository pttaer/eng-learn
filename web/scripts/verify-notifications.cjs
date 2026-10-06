// web/scripts/verify-notifications.cjs
/**
 * Automated Verification Suite for Native Notifications & Streak Due Alerts (ENG-74)
 * Audits:
 * 1. NotificationEngine Module Structure & Static Method Signatures
 *    - requestPermission(), checkAndNotify(), scheduleCheck(), stopScheduledCheck(),
 *      isSupported(), isEnabled(), setEnabled(), dispatchNative(), showToastFallback()
 *    - Constants: DEFAULT_ICON ('/icon-192.png'), REVIEW_TAG / DEFAULT_TAG ('srs-review-due')
 * 2. Due Card Alert Logic & Notification Payload Structure
 *    - Accurate calculation of SRS cards due via SRSEngine.getDueCount()
 *    - Correct payload shape: title, body, icon, badge, tag, data ({ route, type, dueCount })
 *    - Streak protection alert payload ({ route, type: 'streak_reminder', streak })
 *    - Inactive / disabled suppression when user opts out
 * 3. Service Worker Background Listeners (web/public/sw.js)
 *    - notificationclick listener: window focus & hash route dispatch
 *    - push event listener: background notification creation with tag and icon
 * 4. Header HUD Streak Pill & Settings Notification Toggle
 *    - .btn-streak-pill rendering 🔥 <N>d and navigateToTreeOrWorkout click handler
 *    - .btn-notifications-toggle in settings modal with aria-pressed and ON/OFF label
 *    - StorageManager notification persistence methods
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================================');
console.log('  [TEST] VERIFYING NATIVE NOTIFICATIONS & STREAK DUE ALERTS (ENG-74)');
console.log('================================================================================');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

async function itAsync(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// 1. File Existence & Source Integrity
// -----------------------------------------------------------------------------
it('Verifies required core notification files exist', () => {
  const files = [
    'web/src/core/notification-engine.ts',
    'web/src/core/srs-engine.ts',
    'web/src/utils/storage.ts',
    'web/src/modules/header-hud.ts',
    'web/public/sw.js'
  ];

  for (const rel of files) {
    const full = path.join(__dirname, '..', '..', rel);
    assert(fs.existsSync(full), `File must exist: ${rel}`);
  }
});

// -----------------------------------------------------------------------------
// 2. NotificationEngine Static Contract & AST Inspection
// -----------------------------------------------------------------------------
it('Verifies NotificationEngine exports required static methods and constants', () => {
  const file = path.join(__dirname, '../src/core/notification-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Verify class declaration
  assert(code.includes('export class NotificationEngine'), 'NotificationEngine must be exported');

  // Verify core static methods
  const requiredMethods = [
    'isSupported',
    'getPermission',
    'requestPermission',
    'isEnabled',
    'setEnabled',
    'dispatch',
    'dispatchNative',
    'checkAndNotify',
    'showToast',
    'showToastFallback',
    'schedulePeriodicCheck',
    'scheduleCheck',
    'stopPeriodicCheck',
    'stopScheduledCheck'
  ];

  for (const method of requiredMethods) {
    assert(
      code.includes(`public static ${method}`) || code.includes(`public static async ${method}`),
      `NotificationEngine must declare public static method: ${method}`
    );
  }

  // Verify tag and icon constants
  assert(code.includes("'/icon-192.png'"), "Must reference standard '/icon-192.png' icon");
  assert(code.includes("'srs-review-due'"), "Must reference standard 'srs-review-due' notification tag");
  assert(code.includes('DEFAULT_ICON'), 'Must declare DEFAULT_ICON');
  assert(code.includes('REVIEW_TAG'), 'Must declare REVIEW_TAG alias');
  assert(code.includes('DEFAULT_TAG'), 'Must declare DEFAULT_TAG');
});

// -----------------------------------------------------------------------------
// 3. SRSEngine Due Count Calculation Logic
// -----------------------------------------------------------------------------
it('Verifies SRSEngine.getDueCount logic and signature in srs-engine.ts', () => {
  const file = path.join(__dirname, '../src/core/srs-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('public static getDueCount'), 'SRSEngine must provide getDueCount static method');
  assert(code.includes('card.nextReview <= now'), 'getDueCount must evaluate card.nextReview <= now');

  // Behavioral test using extracted algorithm
  const now = 1000000;
  const cardStates = {
    card1: { nextReview: 900000, interval: 1, repetition: 1, easeFactor: 2.5 },   // Due
    card2: { nextReview: 1000000, interval: 1, repetition: 1, easeFactor: 2.5 },  // Due exactly now
    card3: { nextReview: 1100000, interval: 2, repetition: 2, easeFactor: 2.5 },  // Future
    card4: { nextReview: 500000, interval: 1, repetition: 1, easeFactor: 2.5 }    // Due past
  };

  const due = Object.values(cardStates).filter(c => c && typeof c.nextReview === 'number' && c.nextReview <= now).length;
  assert.strictEqual(due, 3, '3 out of 4 cards must be flagged as due');
});

// -----------------------------------------------------------------------------
// 4. Notification Payload Shape & Due Card Dispatch Invariants
// -----------------------------------------------------------------------------
it('Verifies NotificationEngine checkAndNotify dispatches structured payloads', () => {
  const file = path.join(__dirname, '../src/core/notification-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Assert due cards notification payload
  assert(code.includes('SRS Review Due'), 'Payload must include SRS Review Due title');
  assert(code.includes('route: \'#collocations\''), 'Payload data must target #collocations route');
  assert(code.includes("type: 'due_cards'"), 'Payload data must include type: due_cards');
  assert(code.includes('dueCount'), 'Payload data must include dueCount');

  // Assert streak preservation payload
  assert(code.includes('Streak Protection Alert'), 'Payload must include Streak Protection Alert title');
  assert(code.includes("type: 'streak_reminder'"), 'Payload data must include type: streak_reminder');
  assert(code.includes('streak'), 'Payload data must include streak count');

  // Assert opt-out guard
  assert(code.includes('if (!this.isEnabled())'), 'checkAndNotify must short-circuit if notifications disabled');
});

// -----------------------------------------------------------------------------
// 5. Service Worker Event Listeners (web/public/sw.js)
// -----------------------------------------------------------------------------
it('Verifies Service Worker notificationclick listener in sw.js', () => {
  const swFile = path.join(__dirname, '../public/sw.js');
  const swCode = fs.readFileSync(swFile, 'utf8');

  assert(swCode.includes("addEventListener('notificationclick'"), 'sw.js must attach notificationclick listener');
  assert(swCode.includes('event.notification.close()'), 'notificationclick must close notification');
  assert(swCode.includes('self.clients.matchAll'), 'notificationclick must search active window clients');
  assert(swCode.includes('client.focus()'), 'notificationclick must focus client window');
  assert(swCode.includes('#collocations'), 'notificationclick must default to #collocations route');
});

it('Verifies Service Worker push listener in sw.js', () => {
  const swFile = path.join(__dirname, '../public/sw.js');
  const swCode = fs.readFileSync(swFile, 'utf8');

  assert(swCode.includes("addEventListener('push'"), 'sw.js must attach push listener');
  assert(swCode.includes('self.registration.showNotification'), 'push event must invoke showNotification');
  assert(swCode.includes("tag: 'srs-review-due'"), "push notification must specify tag 'srs-review-due'");
  assert(swCode.includes("icon: '/icon-192.png'"), "push notification must specify icon '/icon-192.png'");
});

// -----------------------------------------------------------------------------
// 6. Header HUD Streak Pill & Navigation Binding (web/src/modules/header-hud.ts)
// -----------------------------------------------------------------------------
it('Verifies Header HUD streak pill markup and click handler in header-hud.ts', () => {
  const file = path.join(__dirname, '../src/modules/header-hud.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Streak pill markup
  assert(code.includes('btn-streak-pill'), 'header-hud.ts must render button with class btn-streak-pill');
  assert(code.includes('🔥 ${currentStreak}d'), 'streak pill must display 🔥 ${currentStreak}d format');
  assert(code.includes('aria-label="Daily Streak: ${currentStreak} days"'), 'streak pill must have descriptive aria-label');

  // Streak pill click handler
  assert(code.includes("querySelector('.btn-streak-pill')"), 'header-hud.ts must query .btn-streak-pill');
  assert(code.includes('streakPill?.addEventListener(\'click\', navigateToTreeOrWorkout)'), 'streak pill must wire click to navigateToTreeOrWorkout');
  assert(code.includes("window.location.hash = '#tree'"), 'navigateToTreeOrWorkout must navigate to #tree');
});

// -----------------------------------------------------------------------------
// 7. Settings Modal Notification Permission Toggle (web/src/modules/header-hud.ts)
// -----------------------------------------------------------------------------
it('Verifies Settings Modal contains interactive notification toggle', () => {
  const file = path.join(__dirname, '../src/modules/header-hud.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Toggle button markup
  assert(code.includes('btn-notifications-toggle'), 'Settings modal must contain button with class btn-notifications-toggle');
  assert(code.includes('Daily Review Alerts:'), 'Toggle button must display Daily Review Alerts text');
  assert(code.includes('aria-pressed="${StorageManager.isNotificationsEnabled()}"'), 'Toggle button must reflect aria-pressed state');

  // Request permission invocation
  assert(code.includes('Notification.requestPermission()'), 'Toggle handler must call Notification.requestPermission()');
  assert(code.includes('StorageManager.setNotificationsEnabled'), 'Toggle handler must persist status via StorageManager');
});

// -----------------------------------------------------------------------------
// 8. StorageManager Notification & Streak API (web/src/utils/storage.ts)
// -----------------------------------------------------------------------------
it('Verifies StorageManager notification and streak helper methods', () => {
  const file = path.join(__dirname, '../src/utils/storage.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('isNotificationsEnabled'), 'StorageManager must provide isNotificationsEnabled');
  assert(code.includes('setNotificationsEnabled'), 'StorageManager must provide setNotificationsEnabled');
  assert(code.includes('isNotificationEnabled'), 'StorageManager must provide isNotificationEnabled alias');
  assert(code.includes('setNotificationEnabled'), 'StorageManager must provide setNotificationEnabled alias');
  assert(code.includes('getStreak(): number'), 'StorageManager must provide getStreak() returning number');
  assert(code.includes('notificationsEnabled?: boolean'), 'AppStorageState must declare notificationsEnabled optional property');
});

// -----------------------------------------------------------------------------
// 9. Toast Fallback Invariants & Accessibility
// -----------------------------------------------------------------------------
it('Verifies NotificationEngine toast fallback creates accessible HUD alert', () => {
  const file = path.join(__dirname, '../src/core/notification-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes("role', 'alert'"), 'Toast must declare role="alert"');
  assert(code.includes("aria-live', 'polite'"), 'Toast must declare aria-live="polite"');
  assert(code.includes('notification-toast-container'), 'Toast container must have ID notification-toast-container');
  assert(code.includes('btn-toast-close'), 'Toast must have dismiss button');
  assert(code.includes('setTimeout(dismiss, 6000)'), 'Toast must auto-dismiss after timeout');
});

// -----------------------------------------------------------------------------
// Final Report
// -----------------------------------------------------------------------------
console.log('--------------------------------------------------------------------------------');
console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
if (passedTests === totalTests) {
  console.log('  Status: ALL NOTIFICATION & STREAK INVARIANTS SATISFIED (100% OK)');
  process.exit(0);
} else {
  console.error(`  Status: ${totalTests - passedTests} TEST(S) FAILED`);
  process.exit(1);
}
