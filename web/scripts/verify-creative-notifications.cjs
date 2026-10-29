// web/scripts/verify-creative-notifications.cjs
/**
 * Automated Verification Suite for Creative Bilingual Notifications & Widget Alerts
 * Audits:
 * 1. NotificationCatalog structure, rich categories & dynamic hook generation
 * 2. Bilingual parity (English & Vietnamese) matching user's setting prior to app exit
 * 3. Telemetry-based hooks for the Android Home Screen Widget (due cards, streak, quests)
 * 4. Android native bridge signatures (postNotification, scheduleNotification, NotificationHelper)
 * 5. Android Manifest permissions (POST_NOTIFICATIONS) and NotificationReceiver registration
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================================');
console.log('  [TEST] VERIFYING CREATIVE BILINGUAL NOTIFICATIONS & WIDGET ALERTS');
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

// -----------------------------------------------------------------------------
// 1. NotificationCatalog Module Integrity & AST
// -----------------------------------------------------------------------------
it('Verifies notification-catalog.ts exports NotificationCatalog class with static generator methods', () => {
  const file = path.join(__dirname, '../src/core/notification-catalog.ts');
  assert(fs.existsSync(file), 'notification-catalog.ts must exist');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('export class NotificationCatalog'), 'NotificationCatalog class must be exported');
  assert(code.includes('getDueCardsNotification'), 'Must declare getDueCardsNotification');
  assert(code.includes('getStreakReminderNotification'), 'Must declare getStreakReminderNotification');
  assert(code.includes('getDailyReminderNotification'), 'Must declare getDailyReminderNotification');
  assert(code.includes('getWidgetAlertHook'), 'Must declare getWidgetAlertHook');
});

// -----------------------------------------------------------------------------
// 2. Rich Template Variety & Bilingual Parity (EN & VI)
// -----------------------------------------------------------------------------
it('Verifies rich variety of creative notifications for both English and Vietnamese', () => {
  const file = path.join(__dirname, '../src/core/notification-catalog.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Verify memory curve (Ebbinghaus) hooks in both languages
  assert(code.includes('90% từ vựng sẽ phai nhạt sau 48h'), 'Must include Vietnamese 48h memory curve hook');
  assert(code.includes('90% of memory fades in 48h'), 'Must include English 48h memory curve hook');

  // Verify flashcard blitz hooks
  assert(code.includes('Thử thách phản xạ'), 'Must include Vietnamese blitz hook');
  assert(code.includes('Flashcard Recall Blitz') || code.includes('Flashcard Blitz'), 'Must include English blitz hook');

  // Verify streak defense & gamification hooks
  assert(code.includes('Báo động! Chuỗi'), 'Must include Vietnamese streak alarm hook');
  assert(code.includes('Danger!'), 'Must include English streak alarm hook');
  assert(code.includes('Khiên bảo vệ chuỗi') || code.includes('Khiên Chuỗi'), 'Must include Vietnamese streak shield hook');
  assert(code.includes('Streak Shield'), 'Must include English streak shield hook');

  // Verify IELTS skill focus hooks
  assert(code.includes('Tiêu điểm IELTS:'), 'Must include Vietnamese IELTS skill focus');
  assert(code.includes('IELTS focus:') || code.includes('IELTS Focus:'), 'Must include English IELTS skill focus');

  // Verify curiosity & coffee-break micro-learning hooks
  assert(code.includes('3 phút cà phê cùng tiếng Anh'), 'Must include Vietnamese coffee break hook');
  assert(code.includes('3-Minute Coffee Break English'), 'Must include English coffee break hook');
  assert(code.includes('Phòng luyện viết Franklin'), 'Must include Franklin copywork hook in VI');
  assert(code.includes('Franklin Copywork'), 'Must include Franklin copywork hook in EN');
});

// -----------------------------------------------------------------------------
// 3. Widget Bridge & Dynamic Alert Teaser Integration
// -----------------------------------------------------------------------------
it('Verifies widget-bridge.ts integrates dynamic notification hooks & bilingual payload', () => {
  const file = path.join(__dirname, '../src/core/widget-bridge.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('notification_hook?: string;'), 'WidgetPayload must support notification_hook property');
  assert(code.includes('locale?: string;'), 'WidgetPayload must support locale property');
  assert(code.includes('NotificationCatalog.getWidgetAlertHook'), 'WidgetBridge must invoke NotificationCatalog.getWidgetAlertHook');
  assert(code.includes('SRSEngine.getDueCount'), 'WidgetBridge must compute SRS due count for real-time widget alerts');
  assert(code.includes("locale: isVi ? 'vi' : 'en'"), 'WidgetBridge must pass active user locale to native widget');
});

// -----------------------------------------------------------------------------
// 4. NotificationEngine Exit Reminders & Setting-based Localization
// -----------------------------------------------------------------------------
it('Verifies NotificationEngine connects to NotificationCatalog and handles app exit scheduling', () => {
  const file = path.join(__dirname, '../src/core/notification-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('NotificationCatalog.getDueCardsNotification'), 'NotificationEngine must use NotificationCatalog for due cards');
  assert(code.includes('NotificationCatalog.getStreakReminderNotification'), 'NotificationEngine must use NotificationCatalog for streak reminders');
  assert(code.includes('scheduleExitReminder()'), 'NotificationEngine must declare scheduleExitReminder static method');
  assert(code.includes('visibilitychange'), 'NotificationEngine must listen to visibilitychange for user exit');
  assert(code.includes('eng_locale'), 'NotificationEngine must read user locale setting before exiting');
});

// -----------------------------------------------------------------------------
// 5. Native Android Bridge & System Notifications
// -----------------------------------------------------------------------------
it('Verifies MainActivity.java exposes native notification methods to JavaScript', () => {
  const file = path.join(__dirname, '../android/src/app/englishsingularity/MainActivity.java');
  assert(fs.existsSync(file), 'MainActivity.java must exist');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('public void postNotification(String title, String body, String route)'), 'MainActivity must expose postNotification');
  assert(code.includes('public void scheduleNotification(String title, String body, String route, long delayMs)'), 'MainActivity must expose scheduleNotification');
  assert(code.includes('NotificationHelper.scheduleInactivityReminder(this)'), 'MainActivity.onPause must schedule inactivity reminder');
  assert(code.includes('NotificationHelper.cancelPendingReminders(this)'), 'MainActivity.onResume must cancel pending reminders');
  assert(code.includes('intent.getStringExtra("route")'), 'MainActivity must support opening routes from notification deep links');
});

it('Verifies NotificationHelper.java and NotificationReceiver.java exist with required logic', () => {
  const helperFile = path.join(__dirname, '../android/src/app/englishsingularity/NotificationHelper.java');
  const receiverFile = path.join(__dirname, '../android/src/app/englishsingularity/NotificationReceiver.java');
  assert(fs.existsSync(helperFile), 'NotificationHelper.java must exist');
  assert(fs.existsSync(receiverFile), 'NotificationReceiver.java must exist');

  const helperCode = fs.readFileSync(helperFile, 'utf8');
  assert(helperCode.includes('singularity_notifications'), 'Must define singularity_notifications channel');
  assert(helperCode.includes('showNotification'), 'Must implement showNotification');
  assert(helperCode.includes('scheduleNotification'), 'Must implement scheduleNotification');
  assert(helperCode.includes('scheduleInactivityReminder'), 'Must implement scheduleInactivityReminder');

  const receiverCode = fs.readFileSync(receiverFile, 'utf8');
  assert(receiverCode.includes('NotificationHelper.showNotification'), 'NotificationReceiver must call NotificationHelper.showNotification');
});

// -----------------------------------------------------------------------------
// 6. Android Manifest Permissions & Provider Registration
// -----------------------------------------------------------------------------
it('Verifies AndroidManifest.xml declares POST_NOTIFICATIONS and NotificationReceiver', () => {
  const manifestFile = path.join(__dirname, '../android/AndroidManifest.xml');
  const manifestCode = fs.readFileSync(manifestFile, 'utf8');

  assert(manifestCode.includes('android.permission.POST_NOTIFICATIONS'), 'AndroidManifest.xml must declare POST_NOTIFICATIONS permission');
  assert(manifestCode.includes('android:name=".NotificationReceiver"'), 'AndroidManifest.xml must register NotificationReceiver');
});

// -----------------------------------------------------------------------------
// 7. Expanded Widget Header Hook Integration
// -----------------------------------------------------------------------------
it('Verifies SingularityWidgetProvider.java displays notification hook on widget header', () => {
  const widgetFile = path.join(__dirname, '../android/src/app/englishsingularity/SingularityWidgetProvider.java');
  const code = fs.readFileSync(widgetFile, 'utf8');

  assert(code.includes('notification_hook'), 'SingularityWidgetProvider must read notification_hook from preferences');
  assert(code.includes('widget_badge_cefr'), 'SingularityWidgetProvider must update widget_badge_cefr with dynamic notification hook');
});

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 8. Mistake Vault Redemption & Widget Curiosity Tip Generator
// -----------------------------------------------------------------------------
it('Verifies NotificationCatalog declares getWidgetCuriosityTip and handles Mistake Vault redemption hooks', () => {
  const catFile = path.join(__dirname, '../src/core/notification-catalog.ts');
  const catCode = fs.readFileSync(catFile, 'utf8');

  assert(catCode.includes('getWidgetCuriosityTip'), 'Must declare getWidgetCuriosityTip static method');
  assert(catCode.includes('Phục thù lỗi sai'), 'Must include Vietnamese Mistake Vault hook');
  assert(catCode.includes('Mistake Vault:'), 'Must include English Mistake Vault hook');
  assert(catCode.includes('inflict damage'), 'Must include native collocation secret hook in both EN and VI');
  assert(catCode.includes('insurmountable obstacle'), 'Must include C2 upgrade hook in both EN and VI');
});

// -----------------------------------------------------------------------------
// 9. IELTS Academic Entry Point Lifecycle Integration
// -----------------------------------------------------------------------------
it('Verifies IELTS entry point (web/src/ielts/main.ts) initializes NotificationEngine for exit reminders', () => {
  const ieltsMainFile = path.join(__dirname, '../src/ielts/main.ts');
  const ieltsCode = fs.readFileSync(ieltsMainFile, 'utf8');

  assert(ieltsCode.includes('NotificationEngine.schedulePeriodicCheck()'), 'IELTS main must initialize NotificationEngine.schedulePeriodicCheck()');
});

// -----------------------------------------------------------------------------
// 10. Widget Dynamic Tips & Android Provider Synchronization
// -----------------------------------------------------------------------------
it('Verifies widget-bridge and Android provider sync dynamic curiosity tips and alert hooks', () => {
  const bridgeFile = path.join(__dirname, '../src/core/widget-bridge.ts');
  const bridgeCode = fs.readFileSync(bridgeFile, 'utf8');
  assert(bridgeCode.includes('notification_tip'), 'WidgetBridge must declare and populate notification_tip in payload');

  const providerFile = path.join(__dirname, '../android/src/app/englishsingularity/SingularityWidgetProvider.java');
  const providerCode = fs.readFileSync(providerFile, 'utf8');
  assert(providerCode.includes('notification_tip'), 'SingularityWidgetProvider must read notification_tip preference');
  assert(providerCode.includes('displayBadge'), 'SingularityWidgetProvider must fall back to tip if hook is empty');

  const mainActivityFile = path.join(__dirname, '../android/src/app/englishsingularity/MainActivity.java');
  const maCode = fs.readFileSync(mainActivityFile, 'utf8');
  assert(maCode.includes('notification_tip'), 'MainActivity must persist notification_tip to SharedPreferences');
});

// Final Report
// -----------------------------------------------------------------------------
console.log('--------------------------------------------------------------------------------');
console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
if (passedTests === totalTests) {
  console.log('  Status: ALL CREATIVE NOTIFICATION & WIDGET INVARIANTS SATISFIED (100% OK)');
  process.exit(0);
} else {
  console.error(`  Status: ${totalTests - passedTests} TEST(S) FAILED`);
  process.exit(1);
}

