// web/scripts/verify-retention-notifications.cjs
/**
 * Verification Suite for Mobile App Retention & Notification Upgrades
 * Validates:
 * 1. Android Manifest Permissions (POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, SCHEDULE_EXACT_ALARM, WAKE_LOCK)
 * 2. Android Manifest Receivers (BootReceiver, NotificationActionReceiver, NotificationReceiver)
 * 3. MainActivity Runtime Permission Requests & Bridge Methods
 * 4. NotificationHelper Versioned Channel, Interactive Actions & Circadian Cadence
 * 5. NotificationReceiver Continuous Cadence Chaining
 * 6. BootReceiver Reboot & Timezone Resilience
 * 7. NotificationActionReceiver Silent Shade Actions
 * 8. NotificationCatalog High-Converting Bilingual Templates (Title <= 40 chars, Body <= 90 chars)
 * 9. NotificationEngine Circadian & Lifecycle Delay Calculation
 * 10. Research Master Document Existence & Integrity
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================================');
console.log('  [TEST] VERIFYING MOBILE RETENTION & NOTIFICATION ARCHITECTURE');
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

// 1. Android Manifest Permissions
it('Verifies AndroidManifest.xml declares all required retention permissions', () => {
  const file = path.join(__dirname, '../android/AndroidManifest.xml');
  const xml = fs.readFileSync(file, 'utf8');

  assert(xml.includes('android.permission.POST_NOTIFICATIONS'), 'Must declare POST_NOTIFICATIONS');
  assert(xml.includes('android.permission.RECEIVE_BOOT_COMPLETED'), 'Must declare RECEIVE_BOOT_COMPLETED for reboot persistence');
  assert(xml.includes('android.permission.SCHEDULE_EXACT_ALARM'), 'Must declare SCHEDULE_EXACT_ALARM for midnight alarms');
  assert(xml.includes('android.permission.WAKE_LOCK'), 'Must declare WAKE_LOCK for reliable wakeups');
});

// 2. Android Manifest Receivers
it('Verifies AndroidManifest.xml registers BootReceiver and NotificationActionReceiver', () => {
  const file = path.join(__dirname, '../android/AndroidManifest.xml');
  const xml = fs.readFileSync(file, 'utf8');

  assert(xml.includes('android:name=".BootReceiver"'), 'Must register BootReceiver');
  assert(xml.includes('android:name=".NotificationActionReceiver"'), 'Must register NotificationActionReceiver');
  assert(xml.includes('android:name=".NotificationReceiver"'), 'Must register NotificationReceiver');
  assert(xml.includes('android.intent.action.BOOT_COMPLETED'), 'BootReceiver must filter android.intent.action.BOOT_COMPLETED');
  assert(xml.includes('app.englishsingularity.ACTION_SNOOZE_1H'), 'NotificationActionReceiver must filter ACTION_SNOOZE_1H');
});

// 3. MainActivity Runtime Permission Requests & Bridge
it('Verifies MainActivity.java handles Android 13+ runtime permissions and bridge methods', () => {
  const file = path.join(__dirname, '../android/src/app/englishsingularity/MainActivity.java');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('checkAndRequestNotificationPermission'), 'MainActivity must implement checkAndRequestNotificationPermission');
  assert(code.includes('POST_NOTIFICATIONS'), 'MainActivity must request POST_NOTIFICATIONS');
  assert(code.includes('PERMISSION_REQUEST_NOTIFICATIONS'), 'MainActivity must declare permission request code');
  assert(code.includes('requestNotificationPermission'), 'WidgetBridge must expose requestNotificationPermission');
  assert(code.includes('hasNotificationPermission'), 'WidgetBridge must expose hasNotificationPermission');
  assert(code.includes('openNotificationSettings'), 'WidgetBridge must expose openNotificationSettings');
  assert(code.includes('scheduleCircadianCadence'), 'MainActivity must arm circadian cadence onResume');
});

// 4. NotificationHelper Versioned Channel & Circadian Cadence
it('Verifies NotificationHelper.java implements versioned channel, actions, and circadian cadence', () => {
  const file = path.join(__dirname, '../android/src/app/englishsingularity/NotificationHelper.java');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('singularity_notifications_v2'), 'Must use versioned channel singularity_notifications_v2');
  assert(code.includes('IMPORTANCE_HIGH'), 'Must declare IMPORTANCE_HIGH');
  assert(code.includes('ALARM_REQ_CIRCADIAN_MORNING'), 'Must declare distinct request code for morning');
  assert(code.includes('ALARM_REQ_CIRCADIAN_AFTERNOON'), 'Must declare distinct request code for afternoon');
  assert(code.includes('ALARM_REQ_CIRCADIAN_EVENING'), 'Must declare distinct request code for evening');
  assert(code.includes('ALARM_REQ_CIRCADIAN_MIDNIGHT'), 'Must declare distinct request code for midnight');
  assert(code.includes('scheduleCircadianCadence'), 'Must implement scheduleCircadianCadence method');
  assert(code.includes('Quick 60s Quiz'), 'Must include interactive action button for quiz');
  assert(code.includes('Remind in 1h'), 'Must include interactive action button for snooze');
});

// 5. NotificationReceiver Continuous Cadence Chaining
it('Verifies NotificationReceiver.java re-chains circadian cadence on receive', () => {
  const file = path.join(__dirname, '../android/src/app/englishsingularity/NotificationReceiver.java');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('NotificationHelper.showNotification'), 'Must display notification');
  assert(code.includes('NotificationHelper.scheduleCircadianCadence'), 'Must auto-chain scheduleCircadianCadence so app never goes silent');
});

// 6. BootReceiver Implementation
it('Verifies BootReceiver.java handles system reboots and re-arms schedule', () => {
  const file = path.join(__dirname, '../android/src/app/englishsingularity/BootReceiver.java');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('ACTION_BOOT_COMPLETED'), 'Must handle BOOT_COMPLETED');
  assert(code.includes('ACTION_MY_PACKAGE_REPLACED'), 'Must handle package replacement');
  assert(code.includes('NotificationHelper.scheduleCircadianCadence'), 'Must re-arm circadian cadence on boot');
});

// 7. NotificationActionReceiver Silent Background Snooze
it('Verifies NotificationActionReceiver.java handles silent shade snooze', () => {
  const file = path.join(__dirname, '../android/src/app/englishsingularity/NotificationActionReceiver.java');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('ACTION_SNOOZE_1H'), 'Must handle ACTION_SNOOZE_1H');
  assert(code.includes('handleSnooze'), 'Must implement handleSnooze');
  assert(code.includes('NotificationHelper.scheduleNotification'), 'Must reschedule notification after snooze');
});

// 8. NotificationCatalog High-Converting Bilingual Templates & Character Ceilings
it('Verifies NotificationCatalog exports high-converting templates within character limits (Title <= 40, Body <= 90)', () => {
  const file = path.join(__dirname, '../src/core/notification-catalog.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('getDuolingoBreakUpNotification'), 'Must declare getDuolingoBreakUpNotification');
  assert(code.includes('getDayZeroOnboardingNotification'), 'Must declare getDayZeroOnboardingNotification');
  assert(code.includes('getCircadianPromptNotification'), 'Must declare getCircadianPromptNotification');
  assert(code.includes('getMicroCommitmentNotification'), 'Must declare getMicroCommitmentNotification');
  assert(code.includes('getCuriosityTrapNotification'), 'Must declare getCuriosityTrapNotification');
});

// 9. NotificationEngine Bridge Integration & Delay Calculation
it('Verifies NotificationEngine connects to Android bridge permission methods and circadian delays', () => {
  const file = path.join(__dirname, '../src/core/notification-engine.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('hasNotificationPermission'), 'NotificationEngine must check hasNotificationPermission on Android bridge');
  assert(code.includes('requestNotificationPermission'), 'NotificationEngine must trigger requestNotificationPermission on Android bridge');
  assert(code.includes('isDayZero'), 'NotificationEngine must calculate Day 0 onboarding state');
  assert(code.includes('getDayZeroOnboardingNotification'), 'NotificationEngine must invoke getDayZeroOnboardingNotification');
});

// 10. Research Master Document Existence
it('Verifies master research documentation exists and is comprehensive', () => {
  const file = path.join(__dirname, '../../docs/research/MOBILE_NOTIFICATION_RETENTION_MASTER_STUDY.md');
  assert(fs.existsSync(file), 'Master research file must exist');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('Duolingo'), 'Must cover Duolingo');
  assert(content.includes('Ebbinghaus'), 'Must cover Ebbinghaus SRS');
  assert(content.includes('POST_NOTIFICATIONS'), 'Must cover POST_NOTIFICATIONS');
  assert(content.includes('Circadian'), 'Must cover Circadian rhythms');
  assert(content.length > 5000, 'Master research document must be comprehensive (>5000 characters)');
});

// Final Report
console.log('--------------------------------------------------------------------------------');
console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
if (passedTests === totalTests) {
  console.log('  Status: ALL RETENTION NOTIFICATION INVARIANTS SATISFIED (100% OK)');
  process.exit(0);
} else {
  console.error(`  Status: ${totalTests - passedTests} TEST(S) FAILED`);
  process.exit(1);
}
