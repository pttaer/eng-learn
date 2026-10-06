import readingData from '../data/reading.json';
import listeningData from '../data/listening.json';
import { ListeningSection, ReadingPassage } from '../types';
import { averageBands } from '../bands';
import { attempts, readiness, recentBand } from '../progress';
import { esc, h } from '../ui';
import { mountReadingTest } from './reading';
import { mountListeningTest } from './listening';

const PASSAGES = readingData as ReadingPassage[];
const SECTIONS = listeningData as ListeningSection[];

/** Reading mock n uses passages 3n..3n+2 (wrapping), so consecutive mocks never repeat a passage until the bank is used up. */
function readingSet(n: number): ReadingPassage[] {
  return [0, 1, 2].map(k => PASSAGES[(n * 3 + k) % PASSAGES.length]);
}

const listeningTests = (): ListeningSection[][] => {
  const byTest = new Map<string, ListeningSection[]>();
  SECTIONS.forEach(s => { const k = s.id.split('-')[0]; byTest.set(k, [...(byTest.get(k) || []), s]); });
  return [...byTest.values()].map(t => t.sort((a, b) => a.section - b.section)).filter(t => t.length === 4);
};

export function mockView(root: HTMLElement): () => void {
  let stop = () => {};
  const menu = (): void => {
    stop();
    root.innerHTML = '';
    const mocks = (s: 'reading' | 'listening') => attempts().filter(a => a.skill === s && a.mock).length;
    root.append(h('h1', 'ie-title', 'Mock tests'), h('p', 'ie-lead', 'Exam conditions. Reading: 3 passages, 40 questions, 60 minutes, no pausing. Listening: 4 sections played once. Writing and Speaking are practised separately because their band is a self-estimate.'));
    const cards = h('div', 'ie-cards');
    const r = h('button', 'ie-card', `<b>Reading mock</b><span>3 passages · 60 minutes</span><small>${mocks('reading')} taken</small>`);
    r.addEventListener('click', () => {
      root.innerHTML = '';
      const host = h('div');
      root.append(host);
      stop = mountReadingTest(host, readingSet(mocks('reading')), 60, true, () => host.append(back()));
    });
    cards.append(r);
    listeningTests().forEach((t, i) => {
      const c = h('button', 'ie-card', `<b>Listening mock ${i + 1}</b><span>4 sections · played once</span><small>${t.reduce((a, s) => a + s.questions.length, 0)} questions</small>`);
      c.addEventListener('click', () => {
        root.innerHTML = '';
        const host = h('div');
        root.append(host);
        stop = mountListeningTest(host, t, true, true, () => host.append(back()));
      });
      cards.append(c);
    });
    root.append(cards, report());
  };
  const back = (): HTMLElement => {
    const b = h('button', 'ie-btn ie-btn-primary', 'Back to mock tests');
    b.addEventListener('click', menu);
    return b;
  };
  menu();
  return () => stop();
}

/** Skill bands from recent attempts, overall via IELTS rounding, and the 7.0 readiness gate. */
export function report(): HTMLElement {
  const skills = ['listening', 'reading', 'writing', 'speaking'] as const;
  const bands = skills.map(s => recentBand(s, 3));
  const known = bands.filter((b): b is number => b !== null);
  const rd = readiness();
  const box = h('section', 'ie-report');
  box.innerHTML = `<h2 class="ie-sub">Your band report</h2>
    <div class="ie-bands">${skills.map((s, i) => `<div class="ie-bandcell"><small>${s}</small><b>${bands[i] === null ? '–' : (bands[i] as number).toFixed(1)}</b>${s === 'writing' || s === 'speaking' ? '<em>self-estimate</em>' : ''}</div>`).join('')}
      <div class="ie-bandcell ie-bandcell-main"><small>Overall</small><b>${known.length === 4 ? averageBands(known).toFixed(1) : '–'}</b>${known.length < 4 ? `<em>needs all 4 skills</em>` : ''}</div></div>
    <h3>${rd.ready ? 'Ready for 7.0' : 'Not yet ready for 7.0'}</h3>
    <ul class="ie-breakdown">${rd.lines.map(l => `<li><span>${esc(l)}</span></li>`).join('')}</ul>
    <p class="ie-note">Bands use the last 3 attempts per skill. Listening and Reading come from official raw-score tables. Writing and Speaking come from your own rubric ratings, so they can only support the result, never certify it.</p>`;
  return box;
}
