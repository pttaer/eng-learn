import vocabData from '../data/vocab.json';
import readingData from '../data/reading.json';
import strategyData from '../data/strategy.json';
import { generatePhrasebankDrills } from './phrasebank-drills';
import {
  DailyWorkoutSession,
  DailyWorkoutStep,
  ReadingDrillItem,
  StrategyTipItem,
  TimeBudgetMinutes,
  VocabCardItem
} from './types';
import { SRSCardState } from '../../core/srs-engine';

export interface WorkoutGeneratorOptions {
  dateKey: string;
  timeBudget?: TimeBudgetMinutes;
  srsStates?: Record<string, SRSCardState>;
  starredTopics?: string[];
  targetBand?: number;
  weakestSkill?: string;
  unattemptedPassageIndex?: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateDailyWorkout(options: WorkoutGeneratorOptions): DailyWorkoutSession {
  const {
    dateKey,
    timeBudget = 30,
    srsStates = {},
    starredTopics = [],
    targetBand = 7.0,
    weakestSkill = 'reading',
    unattemptedPassageIndex = 0
  } = options;

  const dateSeed = hashString(dateKey);

  // 1. Budget Scaling Allocations
  const config = {
    15: { vocabCount: 8, readingQuestions: 3, phrasebankCount: 2, vocabMin: 4, readingMin: 6, pbMin: 3, stratMin: 2 },
    30: { vocabCount: 12, readingQuestions: 4, phrasebankCount: 3, vocabMin: 7, readingMin: 10, pbMin: 8, stratMin: 5 },
    45: { vocabCount: 16, readingQuestions: 6, phrasebankCount: 4, vocabMin: 10, readingMin: 15, pbMin: 12, stratMin: 8 },
    60: { vocabCount: 22, readingQuestions: 10, phrasebankCount: 5, vocabMin: 12, readingMin: 20, pbMin: 18, stratMin: 10 }
  }[timeBudget];

  // 2. Select Vocab Cards
  const allVocab = vocabData as VocabCardItem[];
  const dueCards: VocabCardItem[] = [];
  const now = Date.now();

  allVocab.forEach(v => {
    const st = srsStates[v.id];
    if (st && st.dueDate <= now) {
      dueCards.push(v);
    }
  });

  const selectedVocab: VocabCardItem[] = [...dueCards.slice(0, config.vocabCount)];

  // Fill remainder from starred topics or target band
  if (selectedVocab.length < config.vocabCount) {
    const starTopicItems = allVocab.filter(
      v => starredTopics.map(t => t.toLowerCase()).includes(v.topic.toLowerCase()) &&
        !selectedVocab.some(sv => sv.id === v.id)
    );
    const needed = config.vocabCount - selectedVocab.length;
    selectedVocab.push(...starTopicItems.slice(0, needed));
  }

  if (selectedVocab.length < config.vocabCount) {
    const targetBandPool = allVocab.filter(
      v => v.band >= targetBand && !selectedVocab.some(sv => sv.id === v.id)
    );
    const startIdx = (dateSeed * 13) % (targetBandPool.length || 1);
    const needed = config.vocabCount - selectedVocab.length;
    for (let i = 0; i < needed; i++) {
      const idx = (startIdx + i) % targetBandPool.length;
      selectedVocab.push(targetBandPool[idx]);
    }
  }

  // 3. Select Targeted Micro-Reading Passage & Questions
  const allReading = readingData as unknown as Array<{
    id: string;
    title: string;
    topic: string;
    band: number;
    paragraphs: Array<{ label?: string; text: string } | string>;
    questions: Array<{ id: string; type: string; prompt: string; options?: string[]; answer: string | string[]; why: string }>;
  }>;

  const passageIdx = (unattemptedPassageIndex + dateSeed) % allReading.length;
  const passage = allReading[passageIdx];
  const qStart = (dateSeed * 7) % Math.max(1, passage.questions.length - config.readingQuestions);
  const selectedQuestions = passage.questions.slice(qStart, qStart + config.readingQuestions);

  const readingDrill: ReadingDrillItem = {
    passageId: passage.id,
    title: passage.title,
    topic: passage.topic,
    band: passage.band,
    excerptParagraphs: passage.paragraphs.slice(0, 3).map(p => (typeof p === 'string' ? p : p.text)),
    questions: selectedQuestions
  };

  // 4. Generate Manchester Academic Phrasebank Drills
  const phrasebankDrills = generatePhrasebankDrills(config.phrasebankCount, `${dateKey}_pb`);

  // 5. Select CBT Strategy Blueprint Tip of the Day
  const allStrategy = strategyData as StrategyTipItem[];
  const skillMatchingTips = allStrategy.filter(s => s.skill.toLowerCase().includes(weakestSkill.toLowerCase()));
  const strategyPool = skillMatchingTips.length > 0 ? skillMatchingTips : allStrategy;
  const stratIdx = (dateSeed + 3) % strategyPool.length;
  const rawTip = strategyPool[stratIdx];
  const strategyTip: StrategyTipItem = {
    ...rawTip,
    formula: rawTip.formula || (rawTip.tips && rawTip.tips[0]) || 'Systematic pacing and verification'
  };

  // 6. Build the 4 Steps
  const steps: DailyWorkoutStep[] = [
    {
      index: 0,
      type: 'vocab',
      title: 'Vocabulary & Collocations SRS',
      subtitle: `${selectedVocab.length} high-yield C1/C2 cards to lock into long-term memory`,
      estimatedMinutes: config.vocabMin,
      completed: false,
      data: { vocabCards: selectedVocab }
    },
    {
      index: 1,
      type: 'reading',
      title: 'Targeted Micro-Reading Attack',
      subtitle: `${readingDrill.title} (${readingDrill.questions.length} questions, Band ${readingDrill.band})`,
      estimatedMinutes: config.readingMin,
      completed: false,
      data: { readingDrill }
    },
    {
      index: 2,
      type: 'phrasebank',
      title: 'Academic Phrasebank Sentence Drills',
      subtitle: `${phrasebankDrills.length} sentence-completion collocations from Manchester University`,
      estimatedMinutes: config.pbMin,
      completed: false,
      data: { phrasebankDrills }
    },
    {
      index: 3,
      type: 'strategy',
      title: 'CBT Tactical Strategy of the Day',
      subtitle: `${strategyTip.title} (${strategyTip.skill})`,
      estimatedMinutes: config.stratMin,
      completed: false,
      data: { strategyTip }
    }
  ];

  return {
    dateKey,
    timeBudget,
    createdAt: Date.now(),
    steps,
    totalEstimatedMinutes: timeBudget
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateDailyWorkout };
}
