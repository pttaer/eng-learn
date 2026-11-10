import phrasebankData from '../data/academic-phrasebank.json';
import { PhrasebankDrillItem } from './types';

interface PhraseCategory {
  name: string;
  phrases: string[];
}

interface PhraseSection {
  id: string;
  title: string;
  categories: PhraseCategory[];
}

const DISTRACTOR_POOL: Record<string, string[]> = {
  connectors: ['Consequently', 'Nevertheless', 'Furthermore', 'Conversely', 'In contrast', 'Similarly', 'Accordingly'],
  verbs: ['demonstrates', 'substantiates', 'contradicts', 'illustrates', 'articulates', 'delineates', 'postulates'],
  prepositions: ['with respect to', 'in terms of', 'in the light of', 'owing to', 'by virtue of', 'as opposed to'],
  adjectives: ['substantial', 'negligible', 'paramount', 'pivotal', 'indispensable', 'peripheral', 'tentative']
};

/** Simple hash from string to deterministic integer */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generatePhrasebankDrills(count: number = 3, seed: string = 'daily'): PhrasebankDrillItem[] {
  const sections = (phrasebankData as { sections: PhraseSection[] }).sections;
  const drills: PhrasebankDrillItem[] = [];
  const baseHash = hashString(seed);

  // Flatten usable candidate phrases
  const candidatePool: Array<{ section: PhraseSection; category: PhraseCategory; phrase: string }> = [];

  sections.forEach(sec => {
    sec.categories.forEach(cat => {
      cat.phrases.forEach(phrase => {
        if (phrase.length > 25 && phrase.length < 140) {
          candidatePool.push({ section: sec, category: cat, phrase });
        }
      });
    });
  });

  const poolLen = candidatePool.length;
  if (poolLen === 0) return [];

  for (let i = 0; i < count; i++) {
    const pickIndex = (baseHash + i * 37) % poolLen;
    const item = candidatePool[pickIndex];
    const phrase = item.phrase;

    const words = phrase.split(' ');
    let targetWord = '';
    let clozeSentence = phrase;

    const academicPivots = [
      'plays a critical role in',
      'a major contributor to',
      'there is substantial evidence that',
      'it has been suggested that',
      'tends to correlate with',
      'gives rise to',
      'is of paramount importance',
      'draws a distinction between',
      'exerts a profound influence on',
      'is largely attributable to'
    ];

    const foundPivot = academicPivots.find(p => phrase.toLowerCase().includes(p));

    if (foundPivot) {
      const pivotIndex = phrase.toLowerCase().indexOf(foundPivot);
      const exactTarget = phrase.substring(pivotIndex, pivotIndex + foundPivot.length);
      clozeSentence = phrase.replace(exactTarget, '___');
      targetWord = exactTarget;
    } else {
      const candidateWords = words.filter(w => w.length >= 7 && !w.includes('.') && !w.includes('...'));
      targetWord = candidateWords[i % (candidateWords.length || 1)] || words[Math.min(3, words.length - 1)];
      clozeSentence = phrase.replace(targetWord, '___');
    }

    const distractors: string[] = [];
    const allDistractors = Object.values(DISTRACTOR_POOL).flat();
    let dIndex = (baseHash + i * 19) % allDistractors.length;

    while (distractors.length < 3) {
      const candidate = allDistractors[dIndex % allDistractors.length];
      if (candidate.toLowerCase() !== targetWord.toLowerCase() && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      dIndex++;
    }

    const options = [targetWord, ...distractors].sort((a, b) => {
      return (hashString(seed + a) % 10) - (hashString(seed + b) % 10);
    });

    drills.push({
      id: `pb_drill_${item.section.id}_${i}`,
      sectionId: item.section.id,
      sectionTitle: item.section.title,
      category: item.category.name,
      template: clozeSentence,
      clozeTarget: targetWord,
      promptSentence: phrase,
      options,
      explanation: `Collocation standard from Manchester Academic Phrasebank: "${phrase}" under ${item.category.name}.`
    });
  }

  return drills;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generatePhrasebankDrills };
}

