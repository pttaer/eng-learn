import strategyData from '../data/strategy.json';
import { esc, h } from '../ui';

interface Card { skill: string; title: string; tips: string[] }

export function strategyView(root: HTMLElement): () => void {
  root.append(h('h1', 'ie-title', 'Exam strategy'), h('p', 'ie-lead', 'Short rules for each question type. The jump from band 6.5 to 7.0 is mostly technique: paraphrase spotting, distractor traps, time per section, a clear overview, a clear position.'));
  const cards = h('div', 'ie-cards ie-cards-wide');
  (strategyData as Card[]).forEach(c => cards.append(h('article', 'ie-card ie-tipcard', `<span>${esc(c.skill)}</span><b>${esc(c.title)}</b><ul>${c.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`)));
  root.append(cards);
  return () => {};
}
