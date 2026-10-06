export type QuestionType = 'tfng' | 'ynng' | 'heading' | 'match' | 'complete' | 'mcq' | 'short';

export interface IeltsQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  /** mcq: ["A. ...", "B. ..."]; heading/match: the shared list; tfng/ynng: omitted (fixed choices) */
  options?: string[];
  /** tfng/ynng: TRUE|FALSE|NOT GIVEN / YES|NO|NOT GIVEN. mcq/heading/match: the option letter or numeral. complete/short: accepted answer(s). */
  answer: string | string[];
  /** Evidence line from the passage/script, plus why the other answers fail. */
  why: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  topic: string;
  paragraphs: { label: string; text: string }[];
  questions: IeltsQuestion[];
}

export interface ListeningSection {
  id: string;
  section: 1 | 2 | 3 | 4;
  title: string;
  speakers: { name: string; lang: 'en-GB' | 'en-US' | 'en-AU'; gender: 'f' | 'm' }[];
  script: { speaker: string; text: string }[];
  questions: IeltsQuestion[];
}

export interface Task1Chart {
  kind: 'line' | 'bar' | 'table' | 'pie' | 'process' | 'map';
  title: string;
  unit?: string;
  labels?: string[];
  series?: { name: string; values: number[] }[];
  steps?: string[];
  maps?: { year: string; features: string[] }[];
}

export interface Task1Prompt {
  id: string;
  prompt: string;
  chart: Task1Chart;
  model: string;
  notes: string;
}

export interface Task2Prompt {
  id: string;
  essayType: 'opinion' | 'discuss' | 'advantage' | 'problem' | 'twopart';
  prompt: string;
  model: string;
  notes: string;
}

export interface SpeakingPart1 { topic: string; questions: string[] }
export interface SpeakingPart2 { id: string; cue: string; bullets: string[]; part3: string[]; modelAnswer: string }
export interface SpeakingData { part1: SpeakingPart1[]; part2: SpeakingPart2[] }
