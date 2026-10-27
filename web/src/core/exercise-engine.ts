/**
 * Drill-set engine: item types, answer checking, scoring and browser TTS.
 * Content lives in assets/data/drill-sets.json.
 */

import { AudioSynthesizer } from './audio-synthesizer';

export type DrillSkill = 'grammar' | 'vocabulary' | 'listening' | 'pronunciation' | 'reading' | 'writing';

interface ItemBase {
  id: string;
  why: string;
  /** Text read aloud by the browser TTS (listening and accent items). */
  speak?: string;
  /** Voice accent for speak; defaults to the app's active accent. */
  accent?: 'us' | 'uk';
}

export interface ChoiceItem extends ItemBase {
  type: 'choice';
  prompt: string;
  options: string[];
  answer: number;
}

export interface GapItem extends ItemBase {
  type: 'gap';
  prompt: string;
  answers: string[];
}

export interface TrueFalseItem extends ItemBase {
  type: 'truefalse';
  statement: string;
  answer: boolean;
}

export interface MatchItem extends ItemBase {
  type: 'match';
  pairs: { left: string; right: string }[];
}

export interface StressItem extends ItemBase {
  type: 'stress';
  word: string;
  options: string[];
  answer: number;
}

export type DrillItem = ChoiceItem | GapItem | TrueFalseItem | MatchItem | StressItem;

export interface DrillSet {
  id: string;
  title: string;
  skill: DrillSkill;
  cefrLevel: 'C1' | 'C2';
  minutes: number;
  objective: string;
  passage?: string;
  items: DrillItem[];
}

export interface DrillSetFile {
  version: number;
  sets: DrillSet[];
}

/** Learner response per item: index for choice/stress, text for gap, boolean for truefalse, right-hand text per pair for match. */
export type DrillResponse = number | string | boolean | string[] | null | undefined;

export function normaliseAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[.,!?;:]+$/, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function isItemCorrect(item: DrillItem, response: DrillResponse): boolean {
  switch (item.type) {
    case 'choice':
    case 'stress':
      return typeof response === 'number' && response === item.answer;
    case 'gap': {
      if (typeof response !== 'string') return false;
      const given = normaliseAnswer(response);
      return item.answers.some(a => normaliseAnswer(a) === given);
    }
    case 'truefalse':
      return typeof response === 'boolean' && response === item.answer;
    case 'match': {
      if (!Array.isArray(response)) return false;
      return item.pairs.every((p, i) => typeof response[i] === 'string' && normaliseAnswer(response[i]) === normaliseAnswer(p.right));
    }
  }
}

export function scoreSet(set: DrillSet, responses: Record<string, DrillResponse>): { correct: number; total: number } {
  const correct = set.items.filter(item => isItemCorrect(item, responses[item.id])).length;
  return { correct, total: set.items.length };
}

/** Speak text with the browser voice for the given accent (us = general American, uk = RP). */
export function speakText(text: string, accent?: 'us' | 'uk', onEnd?: () => void): void {
  AudioSynthesizer.speak(text, {
    rate: 0.9,
    accent: accent === 'us' ? 'general-american' : accent === 'uk' ? 'uk-rp' : undefined,
    onEnd,
  });
}
