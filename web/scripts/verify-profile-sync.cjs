// web/scripts/verify-profile-sync.cjs
// Verification suite for Core Unified Profile Portability Engine (v5 Schema) & Cross-Platform Sync (ENG-121)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src');

function load(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

// In-memory mock localStorage
const mockStorage = {};
global.localStorage = {
  getItem: key => (key in mockStorage ? mockStorage[key] : null),
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: key => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
  key: i => Object.keys(mockStorage)[i] || null,
  get length() { return Object.keys(mockStorage).length; }
};

// Mock window and dispatchEvent
const dispatchedEvents = [];
global.window = {
  dispatchEvent: (event) => {
    dispatchedEvents.push(event);
    return true;
  }
};
global.Event = class Event {
  constructor(type) { this.type = type; }
};
global.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
  }
};

const cefr = load('core/cefr.ts');
const treeData = load('core/skill-tree-data.ts');

// Load profile-sync-engine and storage with mutually resolved dependencies
const deps = {
  '../core/cefr': cefr,
  './cefr': cefr,
  '../core/skill-tree-data': treeData,
  './srs-engine': {}
};

// Stage storage module proxy for mutual reference
const storageProxy = { exports: {} };
deps['../utils/storage'] = storageProxy.exports;

const syncMod = load('core/profile-sync-engine.ts', deps);
deps['../core/profile-sync-engine'] = syncMod;

const storageMod = load('utils/storage.ts', deps);
Object.assign(storageProxy.exports, storageMod);

const { ProfileSyncEngine } = syncMod;
const { StorageManager, CURRENT_VERSION } = storageMod;
StorageManager.registerSyncEngine(ProfileSyncEngine);

console.log('=== TEST 1: IELTS Key Detection & Checksum Invariants ===');

assert.strictEqual(ProfileSyncEngine.SCHEMA_VERSION, 5, 'Schema version must be 5');
assert.strictEqual(ProfileSyncEngine.isIeltsKey('ieltsDiagnosticProfile'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('IELTS_STATE'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('IELTS_DIAGNOSTIC_PROFILE'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('cd_ielts_scratchpad_draft'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('cd_ielts_theme'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('attempts'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('readiness'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('diagnosticResult'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('writingDrafts'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('speakingTakes'), true);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('STARK_ENG_STATE'), false);
assert.strictEqual(ProfileSyncEngine.isIeltsKey('eng_music_volume'), false);

const hash1 = ProfileSyncEngine.computeChecksum('{"test":123}');
const hash2 = ProfileSyncEngine.computeChecksum('{"test":123}');
const hash3 = ProfileSyncEngine.computeChecksum('{"test":124}');
assert.strictEqual(hash1, hash2, 'Checksum must be deterministic');
assert.notStrictEqual(hash1, hash3, 'Checksum must change on payload mutation');
assert.strictEqual(hash1.length, 8, 'Checksum must be 8 hex characters');
console.log('PASSED: Key detection and checksum invariants verified.\n');

console.log('=== TEST 2: Unified Profile Export (v5 Envelope) ===');

localStorage.clear();
StorageManager.clearCache();

// Seed mock Singularity state
const baseState = StorageManager.loadState();
baseState.learnerLevel = 'B2';
baseState.cardStates['card-colloc-101'] = {
  cardId: 'card-colloc-101',
  easeFactor: 2.5,
  interval: 6,
  lapses: 0,
  repetitions: 3,
  dueDate: 1800000000,
  totalReviews: 5,
  lastReviewed: 1750000000
};
baseState.streak.currentStreak = 4;
baseState.streak.longestStreak = 10;
baseState.streak.lastActiveDate = '2026-10-14';
baseState.habitProgress[1] = { completed: true, completedTasks: [0, 1, 2], completedAt: 1750000000 };
baseState.totalCardsReviewed = 42;
StorageManager.saveState(baseState);

// Seed mock IELTS keys
localStorage.setItem('IELTS_STATE', JSON.stringify({
  attempts: [
    { skill: 'reading', itemId: 'cam18-t1-p1', date: '2026-10-13T10:00:00.000Z', band: 7.5, raw: 34, of: 40, mock: true }
  ]
}));
localStorage.setItem('ieltsDiagnosticProfile', JSON.stringify({
  timestamp: 1760000000,
  score: 16,
  percentage: 80,
  bandEstimate: 'Band 7.0+'
}));
localStorage.setItem('writingDrafts', JSON.stringify({
  t1Draft: 'Overall, the provided bar chart reveals a substantial upward trajectory...'
}));

// Export profile
const exportedJson = StorageManager.exportUnifiedProfile(false);
const exportedObj = JSON.parse(exportedJson);

assert.strictEqual(exportedObj.version, 5, 'Envelope version must be 5');
assert.ok(exportedObj.metadata, 'Profile metadata present');
assert.strictEqual(exportedObj.metadata.schemaVersion, 5);
assert.strictEqual(exportedObj.metadata.appVersion, '0.5.4');
assert.ok(exportedObj.metadata.checksum, 'Metadata checksum present');
assert.strictEqual(exportedObj.metadata.totalCards, 1);
assert.strictEqual(exportedObj.metadata.totalReviews, 42);

// Check singularity content
assert.strictEqual(exportedObj.singularity.learnerLevel, 'B2');
assert.ok(exportedObj.singularity.cardStates['card-colloc-101']);
assert.strictEqual(exportedObj.singularity.streak.currentStreak, 4);

// Check ielts content
assert.ok(exportedObj.ielts['IELTS_STATE']);
assert.strictEqual(exportedObj.ielts['IELTS_STATE'].attempts.length, 1);
assert.strictEqual(exportedObj.ielts['IELTS_STATE'].attempts[0].band, 7.5);
assert.ok(exportedObj.ielts['ieltsDiagnosticProfile']);
assert.ok(exportedObj.ielts['writingDrafts']);
console.log('PASSED: Unified Profile Export (v5 Envelope) verified.\n');

console.log('=== TEST 3: Unified Profile Import (Overwrite Mode) ===');

localStorage.clear();
StorageManager.clearCache();
dispatchedEvents.length = 0;

// Import the previously exported profile
const overwriteResult = StorageManager.importUnifiedProfile(exportedJson, 'overwrite');
assert.strictEqual(overwriteResult.success, true, 'Import must succeed');
assert.strictEqual(overwriteResult.mode, 'overwrite');
assert.strictEqual(overwriteResult.detectedVersion, 5);
assert.strictEqual(overwriteResult.migratedFromLegacy, false);
assert.strictEqual(overwriteResult.itemsRestored.singularityCards, 1);
assert.strictEqual(overwriteResult.itemsRestored.ieltsKeys, 3);

// Verify restored Singularity state
const restoredState = StorageManager.loadState();
assert.strictEqual(restoredState.learnerLevel, 'B2');
assert.strictEqual(restoredState.streak.currentStreak, 4);
assert.strictEqual(restoredState.totalCardsReviewed, 42);
assert.ok(restoredState.cardStates['card-colloc-101']);

// Verify restored IELTS localStorage state
const restoredIeltsState = JSON.parse(localStorage.getItem('IELTS_STATE'));
assert.strictEqual(restoredIeltsState.attempts.length, 1);
assert.strictEqual(restoredIeltsState.attempts[0].itemId, 'cam18-t1-p1');

// Verify dispatched events
assert.ok(dispatchedEvents.some(e => e.type === 'eng-storage-update'), 'eng-storage-update dispatched');
assert.ok(dispatchedEvents.some(e => e.type === 'learner-level-change'), 'learner-level-change dispatched');
assert.ok(dispatchedEvents.some(e => e.type === 'ielts-storage-update'), 'ielts-storage-update dispatched');
assert.ok(dispatchedEvents.some(e => e.type === 'storage'), 'storage event dispatched');
console.log('PASSED: Overwrite mode restoration and event dispatch verified.\n');

console.log('=== TEST 4: Unified Profile Import (Merge Mode) ===');

// Current state has card A and streak 2
localStorage.clear();
StorageManager.clearCache();
const existingState = StorageManager.loadState();
existingState.learnerLevel = 'B1';
existingState.cardStates['card-A'] = {
  cardId: 'card-A',
  totalReviews: 2,
  repetitions: 2,
  interval: 3,
  easeFactor: 2.5,
  dueDate: 1750000000,
  lastReviewed: 1740000000
};
existingState.streak.currentStreak = 2;
existingState.streak.longestStreak = 5;
existingState.streak.lastActiveDate = '2026-10-10';
existingState.habitProgress[1] = { completed: false, completedTasks: [0] };
existingState.totalCardsReviewed = 10;
StorageManager.saveState(existingState);

localStorage.setItem('IELTS_STATE', JSON.stringify({
  attempts: [
    { skill: 'listening', itemId: 'sec-1', date: '2026-10-12T08:00:00.000Z', band: 6.5 }
  ]
}));

// Incoming profile has card A (with higher review count) and card B, plus higher level B2, plus different attempt
const incomingProfile = {
  version: 5,
  metadata: {
    appVersion: '0.5.4',
    exportedAt: '2026-10-14T12:00:00.000Z',
    schemaVersion: 5,
    checksum: 'mockhash'
  },
  singularity: {
    version: 4,
    learnerLevel: 'B2',
    skillLevels: { vocab: 'B2', grammar: 'B2', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
    cardStates: {
      'card-A': {
        cardId: 'card-A',
        totalReviews: 6,
        repetitions: 4,
        interval: 12,
        easeFactor: 2.6,
        dueDate: 1800000000,
        lastReviewed: 1760000000
      },
      'card-B': {
        cardId: 'card-B',
        totalReviews: 3,
        repetitions: 2,
        interval: 4,
        easeFactor: 2.5,
        dueDate: 1790000000,
        lastReviewed: 1750000000
      }
    },
    streak: { currentStreak: 5, longestStreak: 12, lastActiveDate: '2026-10-14' },
    habitProgress: {
      1: { completed: true, completedTasks: [1, 2], completedAt: 1760000000 },
      2: { completed: true, completedTasks: [0], completedAt: 1760000000 }
    },
    totalCardsReviewed: 50
  },
  ielts: {
    IELTS_STATE: {
      attempts: [
        { skill: 'reading', itemId: 'cam18-t1-p1', date: '2026-10-14T09:00:00.000Z', band: 8.0 }
      ]
    },
    writingDrafts: { t2Essay: 'Technology has irrevocably transformed education.' }
  }
};

const mergeResult = StorageManager.importUnifiedProfile(JSON.stringify(incomingProfile), 'merge');
assert.strictEqual(mergeResult.success, true);
assert.strictEqual(mergeResult.mode, 'merge');

const mergedState = StorageManager.loadState();
// 1. Learner level elevated to highest (B2)
assert.strictEqual(mergedState.learnerLevel, 'B2');
// 2. Card A updated to higher review version (6 reviews, interval 12)
assert.strictEqual(mergedState.cardStates['card-A'].totalReviews, 6);
assert.strictEqual(mergedState.cardStates['card-A'].interval, 12);
// 3. Card B added
assert.ok(mergedState.cardStates['card-B']);
// 4. Streak merged (max of 2 and 5 -> 5; longest max of 5 and 12 -> 12)
assert.strictEqual(mergedState.streak.currentStreak, 5);
assert.strictEqual(mergedState.streak.longestStreak, 12);
assert.strictEqual(mergedState.streak.lastActiveDate, '2026-10-14');
// 5. Habits merged: day 1 completedTasks union [0, 1, 2], completed true
assert.strictEqual(mergedState.habitProgress[1].completed, true);
assert.strictEqual(mergedState.habitProgress[1].completedTasks.length, 3);
assert.ok(mergedState.habitProgress[2]);
// 6. Total cards reviewed maxed
assert.strictEqual(mergedState.totalCardsReviewed, 50);

// 7. IELTS attempts union without duplicates
const mergedIelts = JSON.parse(localStorage.getItem('IELTS_STATE'));
assert.strictEqual(mergedIelts.attempts.length, 2, 'Both unique attempts must be present');
const skills = mergedIelts.attempts.map(a => a.skill);
assert.ok(skills.includes('listening'));
assert.ok(skills.includes('reading'));

// 8. Other IELTS keys restored
assert.ok(localStorage.getItem('writingDrafts'));
console.log('PASSED: Merge mode state union and deduplication verified.\n');

console.log('=== TEST 5: Backward Compatibility with Legacy Backups (v1 - v4) ===');

// Legacy v1 backup: no learnerLevel, raw cardStates
localStorage.clear();
StorageManager.clearCache();
const legacyV1 = {
  version: 1,
  cardStates: {
    'legacy-card-1': { cardId: 'legacy-card-1', easeFactor: 2.5, interval: 1, repetitions: 1, dueDate: 1700000000 }
  }
};
const v1Import = StorageManager.importUnifiedProfile(JSON.stringify(legacyV1), 'overwrite');
assert.strictEqual(v1Import.success, true);
assert.strictEqual(v1Import.migratedFromLegacy, true);
assert.strictEqual(v1Import.detectedVersion, 1);
const stateFromV1 = StorageManager.loadState();
assert.strictEqual(stateFromV1.learnerLevel, 'B2', 'v1 user defaulted to B2');
assert.ok(stateFromV1.cardStates['legacy-card-1']);

// Legacy v3 backup: has skillLevels, streak
localStorage.clear();
StorageManager.clearCache();
const legacyV3 = {
  version: 3,
  learnerLevel: 'C1',
  skillLevels: { vocab: 'C1', grammar: 'C1', reading: 'C1', listening: 'C1', writing: 'C1', speaking: 'C1' },
  placementDone: true,
  cardStates: {
    'c1-card-1': { cardId: 'c1-card-1', easeFactor: 2.3, interval: 16, repetitions: 4, dueDate: 1790000000 }
  },
  streak: { currentStreak: 15, longestStreak: 20, lastActiveDate: '2026-10-01' }
};
const v3Import = StorageManager.importUnifiedProfile(JSON.stringify(legacyV3), 'overwrite');
assert.strictEqual(v3Import.success, true);
assert.strictEqual(v3Import.detectedVersion, 3);
const stateFromV3 = StorageManager.loadState();
assert.strictEqual(stateFromV3.learnerLevel, 'C1');
assert.strictEqual(stateFromV3.streak.currentStreak, 15);
assert.ok(stateFromV3.errorLedger, 'errorLedger backfilled on legacy migration');

// Test transparent delegation from StorageManager.importBackup with v5 profile
localStorage.clear();
StorageManager.clearCache();
const legacyDelegationResult = StorageManager.importBackup(exportedJson);
assert.strictEqual(legacyDelegationResult, true, 'importBackup delegates transparently to importUnifiedProfile');
const stateFromDelegation = StorageManager.loadState();
assert.strictEqual(stateFromDelegation.learnerLevel, 'B2');
console.log('PASSED: Backward compatibility across v1-v4 and legacy API delegation verified.\n');

console.log('=== TEST 6: Error Handling & Data Corruption Defense ===');

// 1. Invalid JSON
const badJsonResult = StorageManager.importUnifiedProfile('{{not valid json', 'overwrite');
assert.strictEqual(badJsonResult.success, false);
assert.ok(badJsonResult.errors.length > 0);

// 2. Non-object payload
const scalarResult = StorageManager.importUnifiedProfile('"just a string"', 'overwrite');
assert.strictEqual(scalarResult.success, false);

// 3. Object with no recognized structure
const junkResult = StorageManager.importUnifiedProfile(JSON.stringify({ randomField: 1234 }), 'overwrite');
assert.strictEqual(junkResult.success, false);

console.log('PASSED: Error handling and corruption defense verified.\n');

console.log('--------------------------------------------------');
console.log('All 6 Test Domains in verify-profile-sync.cjs Passed! (100%)');
