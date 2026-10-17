import { Cefr, cefrIndex, isCefr } from './cefr';
import {
  ALL_SKILLS,
  AppStorageState,
  PreFlightChecklistRule,
  SkillId,
  SkillProfile,
  StorageManager
} from '../utils/storage';

export interface ProfileMetadata {
  appVersion: string;
  exportedAt: string;
  schemaVersion: number;
  checksum: string;
  totalCards?: number;
  totalReviews?: number;
  environment?: string;
}

export interface UnifiedProfile {
  version: 5;
  metadata: ProfileMetadata;
  singularity: AppStorageState;
  ielts: Record<string, any>;
}

export type ImportMode = 'merge' | 'overwrite';

export interface ImportResult {
  success: boolean;
  mode: ImportMode;
  detectedVersion: number;
  migratedFromLegacy: boolean;
  itemsRestored: {
    singularityCards: number;
    ieltsKeys: number;
    errorRecords: number;
  };
  errors?: string[];
}

export class ProfileSyncEngine {
  public static readonly SCHEMA_VERSION = 5;
  public static readonly APP_VERSION = '0.5.4';

  /**
   * Identifies whether a localStorage key belongs to the IELTS Cockpit ecosystem.
   */
  public static isIeltsKey(key: string): boolean {
    if (!key || typeof key !== 'string') return false;
    const lower = key.toLowerCase();
    if (lower.startsWith('ielts') || lower.startsWith('cd_ielts')) return true;

    const specificKeys = [
      'attempts',
      'readiness',
      'diagnosticresult',
      'writingdrafts',
      'speakingtakes'
    ];
    return specificKeys.includes(lower);
  }

  /**
   * Fast, deterministic 32-bit FNV-1a hash algorithm returning an 8-character hex string.
   */
  public static computeChecksum(data: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < data.length; i++) {
      hash ^= data.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Scans localStorage and gathers all IELTS progress, attempts, diagnostics, and drafts.
   */
  public static collectIeltsData(): Record<string, any> {
    const data: Record<string, any> = {};
    if (typeof localStorage === 'undefined') return data;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (this.isIeltsKey(key)) {
          const raw = localStorage.getItem(key);
          if (raw !== null) {
            try {
              data[key] = JSON.parse(raw);
            } catch {
              data[key] = raw;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[PROFILE-SYNC] Warning scanning localStorage for IELTS keys:', err);
    }

    return data;
  }

  /**
   * Constructs a complete v5 UnifiedProfile envelope with metadata and checksum.
   */
  public static createUnifiedProfile(): UnifiedProfile {
    const singularity = StorageManager.loadState();
    const ielts = this.collectIeltsData();
    const exportedAt = new Date().toISOString();

    const payload = JSON.stringify({ singularity, ielts });
    const checksum = this.computeChecksum(payload);

    return {
      version: 5,
      metadata: {
        appVersion: this.APP_VERSION,
        exportedAt,
        schemaVersion: this.SCHEMA_VERSION,
        checksum,
        totalCards: Object.keys(singularity.cardStates || {}).length,
        totalReviews: singularity.totalCardsReviewed || 0
      },
      singularity,
      ielts
    };
  }

  /**
   * Serializes the unified profile to formatted JSON and optionally triggers browser download.
   */
  public static exportProfile(triggerDownload: boolean = true): string {
    const profile = this.createUnifiedProfile();
    const jsonStr = JSON.stringify(profile, null, 2);

    if (triggerDownload && typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const iso = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `english-singularity-profile-${iso}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('[PROFILE-SYNC] Failed to trigger browser profile download:', err);
      }
    }

    return jsonStr;
  }

  /**
   * Validates schema, performs backward migration (v1-v4 -> v5), restores Singularity + IELTS
   * state cleanly, and dispatches storage update events.
   */
  public static importProfile(jsonStr: string, mode: ImportMode = 'overwrite'): ImportResult {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return {
        success: false,
        mode,
        detectedVersion: 0,
        migratedFromLegacy: false,
        itemsRestored: { singularityCards: 0, ieltsKeys: 0, errorRecords: 0 },
        errors: ['Invalid JSON syntax']
      };
    }

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        mode,
        detectedVersion: 0,
        migratedFromLegacy: false,
        itemsRestored: { singularityCards: 0, ieltsKeys: 0, errorRecords: 0 },
        errors: ['Import payload must be a non-null object']
      };
    }

    let detectedVersion = 5;
    let migratedFromLegacy = false;
    let rawSingularity: any;
    let rawIelts: Record<string, any> = {};

    // Detect Envelope vs Legacy Backup
    if (parsed.version === 5 || parsed.singularity) {
      detectedVersion = 5;
      rawSingularity = parsed.singularity || {};
      rawIelts = (parsed.ielts && typeof parsed.ielts === 'object') ? parsed.ielts : {};

      // Optional checksum verification (non-blocking warning)
      if (parsed.metadata?.checksum) {
        const expectedPayload = JSON.stringify({ singularity: rawSingularity, ielts: rawIelts });
        const calcHash = this.computeChecksum(expectedPayload);
        if (calcHash !== parsed.metadata.checksum) {
          console.warn(`[PROFILE-SYNC] Checksum mismatch. Expected ${parsed.metadata.checksum}, calculated ${calcHash}`);
        }
      }
    } else if (parsed.cardStates || parsed.learnerLevel || typeof parsed.version === 'number') {
      // Legacy backup format (v1 - v4)
      migratedFromLegacy = true;
      detectedVersion = typeof parsed.version === 'number' ? parsed.version : 1;
      rawSingularity = parsed;
      rawIelts = {};
    } else {
      return {
        success: false,
        mode,
        detectedVersion: 0,
        migratedFromLegacy: false,
        itemsRestored: { singularityCards: 0, ieltsKeys: 0, errorRecords: 0 },
        errors: ['Unrecognized backup schema: missing both singularity envelope and legacy card states']
      };
    }

    // Sanitize & migrate Singularity state to current schema invariants
    const migratedSingularity = this.migrateSingularityState(rawSingularity);

    if (mode === 'overwrite') {
      // 1. Overwrite Singularity state
      StorageManager.saveState(migratedSingularity);

      // 2. Clear existing IELTS keys and write new ones
      if (typeof localStorage !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && this.isIeltsKey(k)) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          localStorage.removeItem(k);
        }

        // Apply imported IELTS state
        for (const [k, v] of Object.entries(rawIelts)) {
          try {
            const serialized = typeof v === 'string' ? v : JSON.stringify(v);
            localStorage.setItem(k, serialized);
          } catch (e) {
            console.warn(`[PROFILE-SYNC] Failed to restore IELTS key "${k}":`, e);
          }
        }
      }
    } else {
      // Merge mode
      this.mergeSingularity(migratedSingularity);
      this.mergeIelts(rawIelts);
    }

    // Bust storage cache so subsequent reads immediately reflect fresh data
    StorageManager.clearCache();

    // Dispatch system events
    this.dispatchUpdateEvents(mode);

    return {
      success: true,
      mode,
      detectedVersion,
      migratedFromLegacy,
      itemsRestored: {
        singularityCards: Object.keys(migratedSingularity.cardStates || {}).length,
        ieltsKeys: Object.keys(rawIelts).length,
        errorRecords: Object.keys(migratedSingularity.errorLedger?.records || {}).length
      }
    };
  }

  /**
   * Validates and backfills legacy fields (v1-v4) to guarantee zero corruption and invariant compliance.
   */
  private static migrateSingularityState(raw: any): AppStorageState {
    const learnerLevel: Cefr = isCefr(raw.learnerLevel) ? raw.learnerLevel : 'B2';

    const defaultSkills: Record<SkillId, Cefr> = {
      vocab: learnerLevel,
      grammar: learnerLevel,
      reading: learnerLevel,
      listening: learnerLevel,
      writing: learnerLevel,
      speaking: learnerLevel
    };

    const rawSkills = raw.skillLevels || {};
    const skillLevels: Record<SkillId, Cefr> = { ...defaultSkills };
    for (const s of ALL_SKILLS) {
      if (isCefr(rawSkills[s])) {
        skillLevels[s] = rawSkills[s];
      }
    }

    const rawError = raw.errorLedger || {};
    const errorLedger = {
      records: (rawError.records && typeof rawError.records === 'object') ? rawError.records : {},
      checklist: Array.isArray(rawError.checklist) ? rawError.checklist : [],
      totalLogged: typeof rawError.totalLogged === 'number' ? rawError.totalLogged : Object.keys(rawError.records || {}).length,
      totalResolved: typeof rawError.totalResolved === 'number' ? rawError.totalResolved : 0
    };

    return {
      version: StorageManager.CURRENT_VERSION,
      learnerLevel,
      skillLevels,
      skillProfileHistory: Array.isArray(raw.skillProfileHistory) ? raw.skillProfileHistory : [],
      placementDone: raw.placementDone ?? (raw.version >= 2),
      soundMuted: Boolean(raw.soundMuted),
      cardStates: (raw.cardStates && typeof raw.cardStates === 'object') ? raw.cardStates : {},
      streak: {
        currentStreak: typeof raw.streak?.currentStreak === 'number' ? raw.streak.currentStreak : 0,
        longestStreak: typeof raw.streak?.longestStreak === 'number' ? raw.streak.longestStreak : 0,
        lastActiveDate: typeof raw.streak?.lastActiveDate === 'string' ? raw.streak.lastActiveDate : ''
      },
      habitProgress: (raw.habitProgress && typeof raw.habitProgress === 'object') ? raw.habitProgress : {},
      totalCardsReviewed: typeof raw.totalCardsReviewed === 'number' ? raw.totalCardsReviewed : 0,
      lastSyncTimestamp: Date.now(),
      notificationsEnabled: Boolean(raw.notificationsEnabled),
      musicVolume: typeof raw.musicVolume === 'number' ? raw.musicVolume : 0.35,
      musicMode: typeof raw.musicMode === 'string' ? raw.musicMode : 'off',
      errorLedger,
      catProfiles: (raw.catProfiles && typeof raw.catProfiles === 'object') ? raw.catProfiles : {}
    };
  }

  /**
   * Intelligently merges an incoming Singularity state into the current stored state.
   */
  private static mergeSingularity(incoming: AppStorageState): void {
    const current = StorageManager.loadState();

    // 1. Merge Card States (prioritize card with more reviews or newer activity)
    for (const [id, incCard] of Object.entries(incoming.cardStates || {})) {
      const curCard = current.cardStates[id];
      if (!curCard) {
        current.cardStates[id] = incCard;
      } else {
        const curRev = curCard.totalReviews ?? curCard.repetitions ?? 0;
        const incRev = incCard.totalReviews ?? incCard.repetitions ?? 0;
        if (incRev > curRev) {
          current.cardStates[id] = incCard;
        } else if (incRev === curRev && (incCard.lastReviewed ?? 0) > (curCard.lastReviewed ?? 0)) {
          current.cardStates[id] = incCard;
        }
      }
    }

    // 2. Merge Streaks (preserve highest achievements)
    current.streak.currentStreak = Math.max(current.streak.currentStreak, incoming.streak?.currentStreak || 0);
    current.streak.longestStreak = Math.max(current.streak.longestStreak, incoming.streak?.longestStreak || 0);
    if ((incoming.streak?.lastActiveDate || '') > (current.streak.lastActiveDate || '')) {
      current.streak.lastActiveDate = incoming.streak.lastActiveDate;
    }

    // 3. Merge Habit Progress
    for (const [dayStr, incDay] of Object.entries(incoming.habitProgress || {})) {
      const dayNum = Number(dayStr);
      const curDay = current.habitProgress[dayNum];
      if (!curDay) {
        current.habitProgress[dayNum] = incDay;
      } else {
        const tasksUnion = Array.from(new Set([...curDay.completedTasks, ...(incDay.completedTasks || [])]));
        curDay.completedTasks = tasksUnion;
        curDay.completed = curDay.completed || Boolean(incDay.completed);
        curDay.completedAt = Math.max(curDay.completedAt || 0, incDay.completedAt || 0);
      }
    }

    // 4. Merge Skill Levels (prefer higher CEFR tier)
    for (const skill of ALL_SKILLS) {
      const curLevel = current.skillLevels?.[skill] || current.learnerLevel || 'A1';
      const incLevel = incoming.skillLevels?.[skill] || incoming.learnerLevel || 'A1';
      if (cefrIndex(incLevel) > cefrIndex(curLevel)) {
        if (!current.skillLevels) current.skillLevels = { ...incoming.skillLevels };
        current.skillLevels[skill] = incLevel;
      }
    }

    // 5. Merge Learner Level
    if (cefrIndex(incoming.learnerLevel) > cefrIndex(current.learnerLevel)) {
      current.learnerLevel = incoming.learnerLevel;
    }

    // 6. Merge Placement status & Total reviews
    current.placementDone = current.placementDone || incoming.placementDone;
    current.totalCardsReviewed = Math.max(current.totalCardsReviewed, incoming.totalCardsReviewed || 0);

    // 7. Merge Skill Profile History
    const historyMap = new Map<string, SkillProfile>();
    for (const p of current.skillProfileHistory || []) historyMap.set(p.assessedAt, p);
    for (const p of incoming.skillProfileHistory || []) historyMap.set(p.assessedAt, p);
    current.skillProfileHistory = Array.from(historyMap.values()).sort(
      (a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime()
    );

    // 8. Merge Error Ledger
    if (!current.errorLedger) {
      current.errorLedger = incoming.errorLedger;
    } else if (incoming.errorLedger) {
      for (const [errId, incRec] of Object.entries(incoming.errorLedger.records || {})) {
        const curRec = current.errorLedger.records[errId];
        if (!curRec) {
          current.errorLedger.records[errId] = incRec;
        } else {
          curRec.recurrenceCount = Math.max(curRec.recurrenceCount, incRec.recurrenceCount);
          if (incRec.timestamp > curRec.timestamp) {
            curRec.timestamp = incRec.timestamp;
            curRec.contextPhrase = incRec.contextPhrase;
            curRec.correction = incRec.correction;
          }
          if (curRec.status !== 'resolved' && incRec.status === 'resolved') {
            curRec.status = 'resolved';
          }
        }
      }

      // Merge Checklist rules
      const ruleMap = new Map<string, PreFlightChecklistRule>();
      for (const r of current.errorLedger.checklist || []) ruleMap.set(r.id, r);
      for (const r of incoming.errorLedger.checklist || []) {
        if (!ruleMap.has(r.id)) {
          ruleMap.set(r.id, r);
        } else {
          const existing = ruleMap.get(r.id)!;
          existing.cleanStreak = Math.max(existing.cleanStreak, r.cleanStreak);
        }
      }
      current.errorLedger.checklist = Array.from(ruleMap.values()).slice(0, 5);
      current.errorLedger.totalLogged = Object.keys(current.errorLedger.records).length;
      current.errorLedger.totalResolved = Object.values(current.errorLedger.records).filter(r => r.status === 'resolved').length;
    }

    // 9. Merge CAT Profiles
    if (!current.catProfiles) current.catProfiles = {};
    for (const [sk, incCat] of Object.entries(incoming.catProfiles || {})) {
      const skillKey = sk as SkillId;
      const curCat = current.catProfiles[skillKey];
      if (!curCat || incCat.itemsAdministered > curCat.itemsAdministered) {
        current.catProfiles[skillKey] = incCat;
      }
    }

    StorageManager.saveState(current);
  }

  /**
   * Intelligently merges incoming IELTS state items into local storage.
   */
  private static mergeIelts(incoming: Record<string, any>): void {
    if (typeof localStorage === 'undefined') return;

    for (const [key, incVal] of Object.entries(incoming)) {
      try {
        const lower = key.toLowerCase();
        if (lower === 'ielts_state') {
          // Merge Cambridge attempts array
          let curState: { attempts: any[] } = { attempts: [] };
          const raw = localStorage.getItem(key) || localStorage.getItem('IELTS_STATE');
          if (raw) {
            try { curState = JSON.parse(raw); } catch {}
          }
          if (!Array.isArray(curState.attempts)) curState.attempts = [];

          const incAttempts = (incVal && Array.isArray(incVal.attempts))
            ? incVal.attempts
            : (Array.isArray(incVal) ? incVal : []);

          const existingSigs = new Set(curState.attempts.map((a: any) => `${a.skill}_${a.itemId}_${a.date}`));
          for (const att of incAttempts) {
            const sig = `${att.skill}_${att.itemId}_${att.date}`;
            if (!existingSigs.has(sig)) {
              curState.attempts.push(att);
              existingSigs.add(sig);
            }
          }
          curState.attempts.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          localStorage.setItem(key, JSON.stringify(curState));
        } else if (lower.includes('diagnostic')) {
          // Merge diagnostic reports: retain newer report
          const curRaw = localStorage.getItem(key);
          if (curRaw && incVal && typeof incVal === 'object' && incVal.timestamp) {
            try {
              const curObj = JSON.parse(curRaw);
              if (curObj.timestamp && curObj.timestamp > incVal.timestamp) {
                continue; // Current is newer
              }
            } catch {}
          }
          localStorage.setItem(key, typeof incVal === 'string' ? incVal : JSON.stringify(incVal));
        } else {
          // General object shallow merge or fallback set
          const curRaw = localStorage.getItem(key);
          if (!curRaw) {
            localStorage.setItem(key, typeof incVal === 'string' ? incVal : JSON.stringify(incVal));
          } else if (incVal && typeof incVal === 'object' && !Array.isArray(incVal)) {
            try {
              const curObj = JSON.parse(curRaw);
              if (curObj && typeof curObj === 'object' && !Array.isArray(curObj)) {
                const merged = { ...curObj, ...incVal };
                localStorage.setItem(key, JSON.stringify(merged));
                continue;
              }
            } catch {}
            localStorage.setItem(key, JSON.stringify(incVal));
          }
        }
      } catch (err) {
        console.warn(`[PROFILE-SYNC] Failed to merge IELTS key "${key}":`, err);
      }
    }
  }

  /**
   * Dispatches storage and learner change events across the browser environment.
   */
  private static dispatchUpdateEvents(mode: ImportMode): void {
    if (typeof window === 'undefined') return;

    try {
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('eng-storage-update', {
          detail: { mode, schemaVersion: this.SCHEMA_VERSION }
        }));
        window.dispatchEvent(new CustomEvent('learner-level-change'));
        window.dispatchEvent(new CustomEvent('ielts-storage-update', {
          detail: { mode }
        }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch {}
  }
}

// Bind globally for decoupled discovery across environments
if (typeof globalThis !== 'undefined') {
  (globalThis as any).ProfileSyncEngine = ProfileSyncEngine;
}

// Auto-wire ProfileSyncEngine as the conductor for StorageManager if available
if (typeof StorageManager !== 'undefined' && typeof (StorageManager as any).registerSyncEngine === 'function') {
  StorageManager.registerSyncEngine(ProfileSyncEngine);
}

