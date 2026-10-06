import { h } from './ui';
import { readingView } from './views/reading';
import { listeningView } from './views/listening';
import { writingView } from './views/writing';
import { speakingView } from './views/speaking';
import { mockView, report } from './views/mock';
import { strategyView } from './views/strategy';

type View = (root: HTMLElement) => () => void;

const NAV: { id: string; label: string; view: View }[] = [
  { id: 'home', label: 'Overview', view: root => { root.append(h('h1', 'ie-title', 'IELTS Academic: road to 7.0'), h('p', 'ie-lead', 'Exam-format practice for all four skills. Listening and Reading are scored with the official raw-score tables. Writing and Speaking give automatic checks plus your own rubric rating. Everything runs offline in your browser.'), homeCards(), report()); return () => {}; } },
  { id: 'reading', label: 'Reading', view: readingView },
  { id: 'listening', label: 'Listening', view: listeningView },
  { id: 'writing', label: 'Writing', view: writingView },
  { id: 'speaking', label: 'Speaking', view: speakingView },
  { id: 'strategy', label: 'Strategy', view: strategyView },
  { id: 'mock', label: 'Mock tests', view: mockView }
];

function homeCards(): HTMLElement {
  const cards = h('div', 'ie-cards');
  NAV.slice(1).forEach(n => {
    const a = h('a', 'ie-card', `<b>${n.label}</b>`);
    a.href = `#${n.id}`;
    cards.append(a);
  });
  return cards;
}

const header = document.getElementById('ie-header')!;
const main = document.getElementById('ie-main')!;
let cleanup: () => void = () => {};

header.innerHTML = `<a class="ie-brand" href="#home">IELTS <b>7.0</b></a><nav class="ie-nav" aria-label="IELTS sections">${NAV.map(n => `<a href="#${n.id}" data-id="${n.id}">${n.label}</a>`).join('')}</nav><a class="ie-back" href="./index.html">English app</a>`;

function route(): void {
  cleanup();
  const id = location.hash.replace(/^#/, '') || 'home';
  const item = NAV.find(n => n.id === id) || NAV[0];
  header.querySelectorAll('.ie-nav a').forEach(a => {
    const on = (a as HTMLElement).dataset.id === item.id;
    a.classList.toggle('is-on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  main.innerHTML = '';
  cleanup = item.view(main);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
