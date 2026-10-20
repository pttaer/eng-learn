// web/src/ielts/data/topic-lexicon-service.ts
import iotVocabData from '../../assets/data/iot-vocabulary.json';

export interface IotVocabItem {
  id: string;
  word: string;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  band: number;
  topic: string;
  slug: string;
  definition: string;
  vietnamese: string;
  collocations: string[];
  example: string;
}

export interface IotTopicSummary {
  title: string;
  slug: string;
  count: number;
  bands: number[];
}

export class TopicLexiconService {
  private static items: IotVocabItem[] = iotVocabData as IotVocabItem[];

  /**
   * Return all 3,345 items from IELTS Online Tests topic lexicon
   */
  public static getAll(): IotVocabItem[] {
    return this.items;
  }

  /**
   * Return summary of all 171 topics with item counts
   */
  public static getTopics(): IotTopicSummary[] {
    const map = new Map<string, { title: string; count: number; bands: Set<number> }>();
    for (const item of this.items) {
      const existing = map.get(item.slug);
      if (existing) {
        existing.count++;
        existing.bands.add(item.band);
      } else {
        map.set(item.slug, {
          title: item.topic,
          count: 1,
          bands: new Set([item.band])
        });
      }
    }
    return Array.from(map.entries()).map(([slug, data]) => ({
      slug,
      title: data.title,
      count: data.count,
      bands: Array.from(data.bands).sort((a, b) => a - b)
    })).sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Filter items by topic slug
   */
  public static getByTopic(slug: string): IotVocabItem[] {
    return this.items.filter(item => item.slug === slug);
  }

  /**
   * Filter items by target IELTS band
   */
  public static getByBand(targetBand: number): IotVocabItem[] {
    return this.items.filter(item => item.band === targetBand);
  }

  /**
   * Search across word, definition, or topic
   */
  public static search(query: string): IotVocabItem[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.items;
    return this.items.filter(item =>
      item.word.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q) ||
      item.collocations.some(c => c.toLowerCase().includes(q))
    );
  }

  /**
   * Generate a random mini-batch for micro-sessions (5-10 items)
   */
  public static getMicroSession(topicSlug?: string, size = 8): IotVocabItem[] {
    const pool = topicSlug ? this.getByTopic(topicSlug) : this.items;
    if (pool.length <= size) return [...pool];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }
}
