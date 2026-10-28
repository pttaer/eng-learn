/**
 * WIDGET BRIDGE
 * 100% Offline bridge between English Singularity Web Telemetry & Android Native Widget.
 * Communicates via window.AndroidWidgetBridge injected by MainActivity.java.
 */

import { ProgressionEngine } from './progression-engine';
import { StorageManager } from '../utils/storage';
import { I18n, t, LOCALE_EVENT } from './i18n';

declare global {
  interface Window {
    AndroidWidgetBridge?: {
      updateWidgetData(json: string): void;
    };
  }
}

export interface WidgetCustomWord {
  word: string;
  phonetic?: string;
  meaning?: string;
  definition?: string;
  vietnamese?: string;
  example?: string;
  tags?: string;
}

export interface WidgetPayload {
  streak: number;
  progress: string;
  word?: string;
  phonetic?: string;
  meaning?: string;
  example?: string;
  tags?: string;
}

const FALLBACK_WORDS: WidgetCustomWord[] = [
  {
    word: 'Ephemeral',
    phonetic: '/ɪˈfem.ər.əl/ • adj',
    definition: 'Lasting for only a short period of time; fleeting or transient.',
    vietnamese: 'phù du, ngắn ngủi, sớm nở tối tàn',
    example: '“Fame in the digital era is intensely ephemeral, vanishing as swiftly as it emerges.”',
    tags: 'Collocations: ephemeral nature, ephemeral pleasure  •  Synonyms: transient, fleeting'
  },
  {
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/ • adj',
    definition: 'Present, appearing, or found everywhere simultaneously.',
    vietnamese: 'phổ biến khắp nơi, đâu đâu cũng thấy',
    example: '“Mobile devices have become ubiquitous in daily modern life.”',
    tags: 'Collocations: ubiquitous presence, ubiquitous influence  •  Synonyms: omnipresent, pervasive'
  },
  {
    word: 'Paradigm',
    phonetic: '/ˈpær.ə.daɪm/ • n',
    definition: 'A typical example, pattern, model, or conceptual framework.',
    vietnamese: 'mô hình, khuôn mẫu chuẩn mực',
    example: '“The shift marked an entirely new paradigm in economic thought.”',
    tags: 'Collocations: paradigm shift, dominant paradigm  •  Synonyms: archetype, model, standard'
  }
];

export class WidgetBridge {
  private static instance: WidgetBridge | null = null;
  private lastSyncTime: number = 0;
  private lastWord?: WidgetCustomWord;

  public static getInstance(): WidgetBridge {
    if (!WidgetBridge.instance) {
      WidgetBridge.instance = new WidgetBridge();
    }
    return WidgetBridge.instance;
  }

  private constructor() {
    this.initListeners();
  }

  private initListeners(): void {
    // Sync on page load / visibility change (e.g., app resumed)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.sync();
        }
      });
    }

    // Custom event dispatch hook for card review / quest completion / locale toggle
    if (typeof window !== 'undefined') {
      window.addEventListener('eng:progress-update', () => {
        this.sync();
      });

      // Real-time widget update on language change
      window.addEventListener(LOCALE_EVENT, () => {
        this.sync(this.lastWord);
      });

      window.addEventListener('eng:word-reviewed', ((e: CustomEvent) => {
        if (e.detail) {
          this.sync({
            word: e.detail.word,
            phonetic: e.detail.phonetic,
            meaning: e.detail.meaning,
            definition: e.detail.definition,
            vietnamese: e.detail.vietnamese,
            example: e.detail.example,
            tags: e.detail.tags
          });
        }
      }) as EventListener);
    }

    // Direct i18n subscriber fallback
    I18n.onLocaleChange(() => {
      this.sync(this.lastWord);
    });
  }

  /**
   * Syncs latest learning telemetry to the Android native home screen widget.
   */
  public sync(customWord?: WidgetCustomWord): void {
    if (typeof window === 'undefined' || !window.AndroidWidgetBridge) {
      return;
    }

    if (customWord) {
      this.lastWord = customWord;
    }

    const now = Date.now();
    // Throttle rapid repeated sync calls to at most once per 300ms
    if (now - this.lastSyncTime < 300 && !customWord) {
      return;
    }
    this.lastSyncTime = now;

    try {
      const isVi = I18n.getLocale() === 'vi';
      let streak = 1;
      let progress = isVi ? t('widget.daily_focus', undefined, 'Tiêu điểm hôm nay') : 'Daily Focus';

      try {
        const prog = ProgressionEngine.getInstance().getState();
        streak = prog.streak > 0 ? prog.streak : 1;
        const completedQuests = prog.quests.filter(q => q.completed).length;
        if (isVi) {
          progress = `Cấp ${prog.level} • ${completedQuests}/3 Nhiệm vụ`;
        } else {
          progress = `Lv.${prog.level} • ${completedQuests}/3 Quests`;
        }
      } catch {
        const state = StorageManager.loadState();
        streak = state.streak?.currentStreak || 1;
      }

      const payload: WidgetPayload = {
        streak,
        progress
      };

      const wordToSync = customWord || this.lastWord || FALLBACK_WORDS[0];
      if (wordToSync && wordToSync.word) {
        payload.word = wordToSync.word;
        payload.phonetic = wordToSync.phonetic || '';

        const baseDef = wordToSync.definition || wordToSync.meaning || '';
        let meaning = baseDef;
        if (isVi && wordToSync.vietnamese) {
          if (baseDef && baseDef !== wordToSync.vietnamese) {
            meaning = `${baseDef}\n\n🇻🇳 ${wordToSync.vietnamese}`;
          } else {
            meaning = `🇻🇳 ${wordToSync.vietnamese}`;
          }
        }
        payload.meaning = meaning;
        payload.example = wordToSync.example || '';
        payload.tags = wordToSync.tags || '';
      }

      window.AndroidWidgetBridge.updateWidgetData(JSON.stringify(payload));
    } catch (err) {
      console.warn('[WidgetBridge] Failed to update Android widget:', err);
    }
  }
}

// Convenience global trigger
export function syncAndroidWidget(customWord?: WidgetCustomWord): void {
  WidgetBridge.getInstance().sync(customWord);
}
