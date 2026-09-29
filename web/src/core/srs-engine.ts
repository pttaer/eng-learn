/**
 * Native SuperMemo-2 (SM-2) Spaced Repetition Scheduling Engine
 * Self-contained in-browser memory retention algorithm.
 * Zero external Anki dependencies.
 */

export type SRSRating = 'again' | 'good';

export interface SRSCardState {
  cardId: string;
  repetitions: number;    // n: number of consecutive successful recalls
  interval: number;       // I: review interval in days
  easeFactor: number;     // EF: difficulty factor (minimum 1.3, default 2.5)
  lastReviewed: number;   // Unix timestamp (ms)
  dueDate: number;        // Unix timestamp (ms)
  totalReviews: number;
  totalLapses: number;
}

export interface SRSDeckItem {
  id: string;
  [key: string]: any;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

export class SRSEngine {
  /**
   * Initializes a default state for a new card.
   */
  public static createInitialState(cardId: string): SRSCardState {
    return {
      cardId,
      repetitions: 0,
      interval: 0,
      easeFactor: DEFAULT_EASE_FACTOR,
      lastReviewed: 0,
      dueDate: Date.now(), // Due immediately
      totalReviews: 0,
      totalLapses: 0
    };
  }

  /**
   * Calculates next SM-2 interval and updates card state based on user rating.
   * Rating 'again': Resets repetitions to 0, interval to 1 day, decreases EF.
   * Rating 'good': Increments repetitions, calculates exponential interval, increases EF.
   */
  public static rateCard(
    currentState: SRSCardState | undefined,
    cardId: string,
    rating: SRSRating
  ): SRSCardState {
    const state: SRSCardState = currentState
      ? { ...currentState }
      : this.createInitialState(cardId);

    const now = Date.now();
    state.lastReviewed = now;
    state.totalReviews += 1;

    if (rating === 'again') {
      // Lapse occurred: Reset streak
      state.repetitions = 0;
      state.interval = 1;
      state.totalLapses += 1;
      // Decrease ease factor, bounded at minimum 1.3
      state.easeFactor = Math.max(MIN_EASE_FACTOR, Number((state.easeFactor - 0.2).toFixed(2)));
      state.dueDate = now + (1 * ONE_DAY_MS);
    } else {
      // Successful recall ('good')
      if (state.repetitions === 0) {
        state.interval = 1;
      } else if (state.repetitions === 1) {
        state.interval = 6;
      } else {
        state.interval = Math.round(state.interval * state.easeFactor);
      }
      state.repetitions += 1;
      // Grade 4 ('good'): Ease Factor remains unchanged in SM-2 formula (ΔEF = 0)
      state.dueDate = now + (state.interval * ONE_DAY_MS);
    }

    return state;
  }

  /**
   * Filters and sorts a deck into due cards, prioritizing overdue items.
   */
  public static getDueCards<T extends SRSDeckItem>(
    deck: T[],
    cardStates: Record<string, SRSCardState>,
    limit: number = 20
  ): T[] {
    const now = Date.now();

    const dueList = deck.filter(item => {
      const state = cardStates[item.id];
      if (!state) return true; // Unseen cards are due
      return state.dueDate <= now;
    });

    // Split into overdue review cards vs. unseen new cards
    const overdue = dueList.filter(item => !!cardStates[item.id]);
    const unseen = dueList.filter(item => !cardStates[item.id]);

    // Sort overdue: oldest due date first
    overdue.sort((a, b) => cardStates[a.id].dueDate - cardStates[b.id].dueDate);

    return [...overdue, ...unseen].slice(0, limit);
  }

  /**
   * Calculates overall memory retention statistics across the library.
   */
  public static calculateStats(
    totalItems: number,
    cardStates: Record<string, SRSCardState>
  ): {
    totalStudied: number;
    mastered: number;
    learning: number;
    retentionRate: number;
    dueCount: number;
  } {
    const states = Object.values(cardStates);
    const now = Date.now();
    let mastered = 0;
    let learning = 0;
    let dueCount = 0;
    let totalReviews = 0;
    let totalLapses = 0;

    for (const s of states) {
      if (s.repetitions >= 3) {
        mastered += 1;
      } else {
        learning += 1;
      }

      if (s.dueDate <= now) {
        dueCount += 1;
      }

      totalReviews += s.totalReviews;
      totalLapses += s.totalLapses;
    }

    // Unseen items count as due
    const unseen = Math.max(0, totalItems - states.length);
    dueCount += unseen;

    const successfulReviews = Math.max(0, totalReviews - totalLapses);
    const retentionRate = totalReviews > 0
      ? Math.round((successfulReviews / totalReviews) * 100)
      : 100;

    return {
      totalStudied: states.length,
      mastered,
      learning,
      retentionRate,
      dueCount
    };
  }
}
