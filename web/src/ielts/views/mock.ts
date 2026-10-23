import readingData from '../data/reading.json';
import listeningData from '../data/listening.json';
import originalReadingData from '../data/originals-reading.json';
import { ListeningSection, ReadingPassage } from '../types';
import { attempts } from '../progress';
import { h } from '../ui';
import { report } from '../report';
import { mountReadingTest } from './reading';
import { mountListeningTest } from './listening';
import { ExamCockpitDossier } from '../../modules/exam-cockpit-dossier';
import { icon } from '../../utils/icons';

const PASSAGES = readingData as ReadingPassage[];
const SECTIONS = listeningData as ListeningSection[];
const ORIGINAL_PASSAGES = originalReadingData as ReadingPassage[];

/** Mounts the official 40-question CD-IELTS Exam Cockpit Station with 1-40 Navigator, Split Resizer & Band Modal */
export function mountCockpitMockTest(host: HTMLElement, onBack: () => void): () => void {
  host.innerHTML = '';
  const cockpit = new ExamCockpitDossier();
  const cockpitEl = cockpit.render();

  const topNav = h('div', 'ie-cockpit-top-nav');
  topNav.style.cssText = 'padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-sunk, #0f172a); border-bottom: 1px solid var(--border-line, rgba(255,255,255,0.1));';
  
  const backBtn = h('button', 'ie-btn ie-btn-back', '<span class="ie-back-arrow">←</span> Back to Mock Overview');
  backBtn.addEventListener('click', () => {
    cockpit.teardown();
    onBack();
  });

  const titleSpan = h('span', 'ie-cockpit-nav-title');
  titleSpan.innerHTML = `${icon('graduationCap', 14)} CD-IELTS 40-Question Exam Cockpit Station (Passages 1–3 · 60m Timer)`;
  titleSpan.style.cssText = 'font-family: var(--font-mono, monospace); font-size: var(--font-body-compact); font-weight: 700; color: var(--accent-gold, #f59e0b); display: inline-flex; align-items: center; gap: 6px;';

  topNav.append(backBtn, titleSpan);
  host.append(topNav, cockpitEl);

  cockpit.onTestSubmitted = () => {
    // Attempt automatically recorded to IELTS_STATE
  };

  return () => {
    cockpit.teardown();
  };
}

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
    root.append(
      h('h1', 'ie-title', 'Mock tests'),
      h('p', 'ie-lead', 'Exam conditions. Reading: 3 passages, 40 questions, 60 minutes with 10m & 5m warning alerts. Full 1–40 navigator strip, dual-pane split-screen resizer, and post-test 9.0 Band Conversion Modal.')
    );

    const cards = h('div', 'ie-cards');

    // 1. Prominent CD-IELTS 40-Question Exam Cockpit Station Card
    const cockpitCard = h('button', 'ie-card ie-card-hero btn-launch-cockpit-mock', `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: var(--font-kicker); font-weight: 700; color: var(--accent-gold, #a5b4fc); letter-spacing: 0.08em; text-transform: uppercase;">CD-IELTS STATION</span>
        <span style="font-size: var(--font-body-compact); font-weight: 700; color: var(--accent-cyan, #a5b4fc);">${mocks('reading')} completed</span>
      </div>
      <b style="font-size: var(--font-body);">${icon('graduationCap', 16)} Full 40-Question CD-IELTS Mock (Exam Cockpit)</b>
      <span>3 Passages (1–40) · 60m Timer · 10m/5m Alerts · 1-40 Navigator &amp; Passage Filters · Draggable Split Gutter · Band 9.0 Modal</span>
    `);
    cockpitCard.addEventListener('click', () => {
      root.innerHTML = '';
      const host = h('div', 'ie-cockpit-mock-host');
      root.append(host);
      stop = mountCockpitMockTest(host, menu);
    });
    cards.append(cockpitCard);

    // 2. Reading Mock card
    const r = h('button', 'ie-card', `<b>Reading mock (Standard Split)</b><span>3 passages · 60 minutes</span><small>${mocks('reading')} taken</small>`);
    r.addEventListener('click', () => {
      root.innerHTML = '';
      const host = h('div');
      root.append(host);
      stop = mountReadingTest(host, readingSet(mocks('reading')), 60, true, () => host.append(back()));
    });
    cards.append(r);

    // 2b. Original reading set, written for this app and kept apart from the 10-test ladder
    const ro = h('button', 'ie-card', `<b>Original reading set 1</b><span>3 passages · 60 minutes</span><small>Written for this app</small>`);
    ro.addEventListener('click', () => {
      root.innerHTML = '';
      const host = h('div');
      root.append(host);
      stop = mountReadingTest(host, ORIGINAL_PASSAGES, 60, true, () => host.append(back()));
    });
    cards.append(ro);

    // 3. Listening Mocks with 1-40 question coverage
    listeningTests().forEach((t, i) => {
      const c = h('button', 'ie-card', `<b>Listening mock ${i + 1}</b><span>4 sections · played once</span><small>${t.reduce((a, s) => a + s.questions.length, 0)} questions (1–40)</small>`);
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
