/**
 * WIDGET BRIDGE
 * 100% Offline bridge between English Singularity Web Telemetry & Android Native Widget.
 * Communicates via window.AndroidWidgetBridge injected by MainActivity.java.
 */

import { ProgressionEngine } from './progression-engine';
import { StorageManager } from '../utils/storage';
import { SRSEngine } from './srs-engine';
import { I18n, LOCALE_EVENT } from './i18n';
import { NotificationCatalog } from './notification-catalog';
import collocationsData from '../assets/data/collocations.json';
import lexiconData from '../assets/data/lexicon-dictionary.json';

declare global {
  interface Window {
    AndroidWidgetBridge?: {
      updateWidgetData(json: string): void;
      postNotification?(title: string, body: string, route: string): void;
      scheduleNotification?(title: string, body: string, route: string, delayMs: number): void;
      consumeWidgetQuizScore?(): number;
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
  words?: WidgetCustomWord[];
  notification_hook?: string;
  notification_tip?: string;
  locale?: string;
  level?: number;
  completed_quests?: number;
  quests_total?: number;
  quests?: {
    title: string;
    completed: boolean;
    xp: number;
    category: string;
  }[];
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
  },
  {
    word: 'Salient',
    phonetic: '/ˈseɪ.li.ənt/ • adj',
    definition: 'Most noticeable, prominent, or of pivotal importance.',
    vietnamese: 'nổi bật, then chốt, đáng chú ý nhất',
    example: '“She highlighted the salient features of the academic proposal.”',
    tags: 'Collocations: salient point, salient feature  •  Synonyms: prominent, conspicuous, pivotal'
  },
  {
    word: 'Mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/ • v',
    definition: 'Make less severe, serious, painful, or damaging.',
    vietnamese: 'làm giảm nhẹ, xoa dịu, giảm thiểu tác hại',
    example: '“Stringent safeguards mitigate systemic failure risk.”',
    tags: 'Collocations: mitigate risk, mitigate impact  •  Synonyms: alleviate, attenuate, reduce'
  },
  {
    word: 'Juxtapose',
    phonetic: '/ˌdʒʌk.stəˈpəʊz/ • v',
    definition: 'Place close together for contrasting effect.',
    vietnamese: 'đặt cạnh nhau để làm nổi bật tương phản',
    example: '“The essay juxtaposes urban decay and modern high-tech.”',
    tags: 'Collocations: juxtapose with, starkly juxtaposed  •  Synonyms: compare, contrast, collate'
  },
  {
    word: 'Plausible',
    phonetic: '/ˈplɔː.zə.bəl/ • adj',
    definition: 'Reasonable or probable; having an appearance of truth.',
    vietnamese: 'hợp lý, đáng tin cậy, có thể xảy ra',
    example: '“The investigator offered a plausible explanation for the anomaly.”',
    tags: 'Collocations: plausible explanation, highly plausible  •  Synonyms: credible, believable'
  },
  {
    word: 'Exacerbate',
    phonetic: '/ɪɡˈzæs.ə.beɪt/ • v',
    definition: 'Make a problem, bad situation, or negative feeling worse.',
    vietnamese: 'làm trầm trọng thêm, làm xấu đi tình hình',
    example: '“Budget cutbacks will exacerbate the existing labor shortage.”',
    tags: 'Collocations: exacerbate tension, exacerbate crisis  •  Synonyms: aggravate, worsen'
  },
  {
    word: 'Proponent',
    phonetic: '/prəˈpəʊ.nənt/ • n',
    definition: 'A person who advocates a theory, proposal, or course of action.',
    vietnamese: 'người ủng hộ tích cực, người đề xướng',
    example: '“He was an articulate proponent of sustainable clean energy.”',
    tags: 'Collocations: leading proponent, vocal proponent  •  Synonyms: advocate, champion'
  },
  {
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/ • adj',
    definition: 'Dealing with things sensibly and realistically based on practical results.',
    vietnamese: 'thực tế, thực dụng, trọng tính khả thi',
    example: '“They adopted a pragmatic approach to resolve the complex dilemma.”',
    tags: 'Collocations: pragmatic approach, pragmatic solution  •  Synonyms: practical, sensible'
  }
];

const COLLOC_MAP = new Map<string, any>();
for (const item of (collocationsData as any[])) {
  if (item && item.id) COLLOC_MAP.set(item.id, item);
}

const LEX_DICT = (lexiconData || {}) as Record<string, any>;

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
    // Check and claim any pending quiz XP earned on the home screen widget
    this.claimWidgetQuizXp();

    // Sync on page load / visibility change (e.g., app resumed)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.sync();
        } else if (document.visibilityState === 'visible') {
          this.claimWidgetQuizXp();
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
   * Consumes and awards any pending XP earned by answering quizzes on the phone widget.
   */
  public claimWidgetQuizXp(): void {
    if (typeof window !== 'undefined' && window.AndroidWidgetBridge?.consumeWidgetQuizScore) {
      try {
        const score = window.AndroidWidgetBridge.consumeWidgetQuizScore();
        if (score > 0) {
          const xp = score * 10;
          ProgressionEngine.addXP(xp);
          window.dispatchEvent(new CustomEvent('eng:progress-update'));
        }
      } catch (err) {
        console.warn('[WidgetBridge] Failed to claim widget quiz XP:', err);
      }
    }
  }

  /**
   * Builds an active queue of up to 15 personalized words for the widget
   * based on the learner's overdue SRS cards and current progress.
   */
  public getPersonalizedWordsQueue(isVi: boolean): WidgetCustomWord[] {
    const queue: WidgetCustomWord[] = [];
    const seenWords = new Set<string>();
    const seenMeanings = new Set<string>();

    try {
      const states = StorageManager.loadState().cardStates || {};
      const now = Date.now();
      // Sort by urgency: overdue first, then lowest repetitions (least mastered)
      const sortedCards = Object.entries(states)
        .sort((a, b) => {
          const aOverdue = a[1].dueDate <= now;
          const bOverdue = b[1].dueDate <= now;
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          return (a[1].repetitions || 0) - (b[1].repetitions || 0);
        });

      for (const [cardId] of sortedCards) {
        if (queue.length >= 15) break;
        if (COLLOC_MAP.has(cardId)) {
          const c = COLLOC_MAP.get(cardId);
          const w = c.phrase || '';
          const vn = (c.vietnamese || '').trim();
          const def = (c.meaning || c.category || '').trim();
          const meaningKey = (def || vn).toLowerCase();
          if (w && def && !seenWords.has(w.toLowerCase()) && !seenMeanings.has(meaningKey)) {
            seenWords.add(w.toLowerCase());
            seenMeanings.add(meaningKey);
            const meaning = isVi && vn ? (def && def !== vn ? `${def}\n\n🇻🇳 ${vn}` : `🇻🇳 ${vn}`) : def;
            queue.push({
              word: w,
              phonetic: c.cefrLevel ? `[${c.cefrLevel}] • ${c.category || 'Collocation'}` : '',
              meaning,
              definition: def,
              vietnamese: vn,
              example: c.example ? `“${c.example}”` : '',
              tags: `CEFR: ${c.cefrLevel || 'B2'}  •  ${c.category || 'Academic'}`
            });
          }
        } else if (cardId.startsWith('lex-')) {
          const rawWord = cardId.slice(4).replace(/-/g, ' ').trim().toLowerCase();
          const lexEntry = LEX_DICT[rawWord];
          if (lexEntry) {
            const w = lexEntry.word || rawWord;
            const def = (lexEntry.definition || '').trim();
            const vn = (lexEntry.vietnamese || '').trim();
            const meaningKey = (def || vn).toLowerCase();
            if (w && def && !seenWords.has(w.toLowerCase()) && !seenMeanings.has(meaningKey)) {
              seenWords.add(w.toLowerCase());
              seenMeanings.add(meaningKey);
              const meaning = isVi && vn ? (def && def !== vn ? `${def}\n\n🇻🇳 ${vn}` : `🇻🇳 ${vn}`) : def;
              const collocText = Array.isArray(lexEntry.collocations) && lexEntry.collocations.length > 0
                ? `Collocations: ${lexEntry.collocations.slice(0, 3).join(', ')}`
                : '';
              queue.push({
                word: w.charAt(0).toUpperCase() + w.slice(1),
                phonetic: `${lexEntry.ipa || ''} • ${lexEntry.pos || 'vocab'}`.trim(),
                meaning,
                definition: def,
                vietnamese: vn,
                example: lexEntry.contextSentence ? `“${lexEntry.contextSentence}”` : '',
                tags: collocText || 'Source: Lexicon Notebook'
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('[WidgetBridge] Failed to load personalized SRS cards:', e);
    }

    // Complement with high-utility curated fallback words to guarantee at least 10 words
    for (const fb of FALLBACK_WORDS) {
      if (queue.length >= 15) break;
      const baseDef = (fb.definition || fb.meaning || '').trim();
      const meaningKey = baseDef.toLowerCase();
      if (!seenWords.has(fb.word.toLowerCase()) && !seenMeanings.has(meaningKey)) {
        seenWords.add(fb.word.toLowerCase());
        seenMeanings.add(meaningKey);
        let meaning = baseDef;
        if (isVi && fb.vietnamese) {
          meaning = baseDef && baseDef !== fb.vietnamese ? `${baseDef}\n\n🇻🇳 ${fb.vietnamese}` : `🇻🇳 ${fb.vietnamese}`;
        }
        queue.push({
          word: fb.word,
          phonetic: fb.phonetic,
          meaning,
          definition: fb.definition,
          vietnamese: fb.vietnamese,
          example: fb.example,
          tags: fb.tags
        });
      }
    }

    return queue;
  }

  /**
   * Syncs latest learning telemetry to the Android native home screen widget.
   */
  public sync(customWord?: WidgetCustomWord): void {
    if (typeof window === 'undefined' || !window.AndroidWidgetBridge) {
      return;
    }

    this.claimWidgetQuizXp();

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
      let level = 1;
      let completedQuests = 0;
      let questsLeft = 3;
      let questItems: { title: string; completed: boolean; xp: number; category: string }[] = [];

      try {
        const prog = ProgressionEngine.getInstance().getState();
        streak = prog.streak > 0 ? prog.streak : 1;
        level = prog.level || 1;
        completedQuests = prog.quests.filter(q => q.completed).length;
        questsLeft = prog.quests.filter(q => !q.completed).length;
        if (prog.quests && Array.isArray(prog.quests)) {
          questItems = prog.quests.map(q => {
            let localizedTitle = q.title;
            try {
              localizedTitle = I18n.t(`quest.${q.id}_title`, undefined, q.title);
            } catch {
              localizedTitle = q.title;
            }
            return {
              title: localizedTitle,
              completed: !!q.completed,
              xp: q.xpReward || 50,
              category: q.category || 'studio'
            };
          });
        }
      } catch {
        const state = StorageManager.loadState();
        streak = state.streak?.currentStreak || 1;
      }

      let dueCount = 0;
      try {
        const states = StorageManager.loadState().cardStates;
        dueCount = SRSEngine.getDueCount(states);
      } catch {
        dueCount = 0;
      }

      // Generate attractive dynamic progress hook for the widget
      const hook = NotificationCatalog.getWidgetAlertHook({
        dueCount,
        streak,
        questsLeft,
        completedQuests,
        level
      }, isVi ? 'vi' : 'en');

      const curiosityTip = NotificationCatalog.getWidgetCuriosityTip(isVi ? 'vi' : 'en');

      const personalizedQueue = this.getPersonalizedWordsQueue(isVi);
      if (customWord && customWord.word) {
        personalizedQueue.unshift(customWord);
      }

      const payload: WidgetPayload = {
        notification_tip: `${curiosityTip.kicker}: ${curiosityTip.text}`,
        streak,
        progress: hook,
        notification_hook: hook,
        locale: isVi ? 'vi' : 'en',
        level,
        completed_quests: completedQuests,
        quests_total: questItems.length > 0 ? questItems.length : 3,
        quests: questItems,
        words: personalizedQueue
      };

      const wordToSync = customWord || this.lastWord || personalizedQueue[0] || FALLBACK_WORDS[0];
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
