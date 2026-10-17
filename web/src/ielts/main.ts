import { h } from './ui';
import { readingView } from './views/reading';
import { readingDrillsView } from './views/reading-drills';
import { listeningView } from './views/listening';
import { writingView } from './views/writing';
import { speakingView } from './views/speaking';
import { vocabView } from './views/vocab';
import { speakingSimulatorView } from './views/speaking-simulator';
import { mockView, report } from './views/mock';
import { strategyView } from './views/strategy';
import { diagnosticView } from './views/diagnostic';
import { writingStudioView } from './views/writing-studio';
import { listeningTrapsView } from './views/listening-traps';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { SpeechEvaluator } from '../core/speech-evaluator';
import * as ieltsTts from './tts';

(window as any).AudioSynthesizer = AudioSynthesizer;
(window as any).SpeechEvaluator = SpeechEvaluator;
(window as any).ieltsTts = ieltsTts;

type View = (root: HTMLElement) => () => void;

interface RouteItem {
  id: string;
  label: string;
  parentNavId: string;
  subnavGroup?: string;
  view: View;
}

// 8 Primary Executive Navbar Sections
const PRIMARY_NAV = [
  { id: 'home', label: 'Overview' },
  { id: 'diagnostic', label: 'Diagnostic' },
  { id: 'reading', label: 'Reading' },
  { id: 'listening', label: 'Listening' },
  { id: 'writing', label: 'Writing' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'vocab', label: 'Vocabulary' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'mock', label: 'Mock tests' }
];

// Subnav item definitions for the 4 core skill studios
const SKILL_SUBNAVS: Record<string, { label: string; hash: string; icon: string }[]> = {
  reading: [
    { label: 'Timed Exam Passages', hash: '#reading', icon: '📖' },
    { label: '14 Attack Drills & Synonym Lab', hash: '#reading-drills', icon: '🎯' }
  ],
  listening: [
    { label: 'Sections 1–4 Audio Practice', hash: '#listening', icon: '🎧' },
    { label: 'Trap & Self-Correction Audio Lab', hash: '#listening-traps', icon: '🎯' }
  ],
  writing: [
    { label: 'Timed Prompts & Rubrics', hash: '#writing', icon: '✍️' },
    { label: 'Visual Blueprints & 4-Sentence Architect', hash: '#writing-studio', icon: '🏛️' }
  ],
  speaking: [
    { label: 'Speaking Prompts & Notepad', hash: '#speaking', icon: '🎙️' },
    { label: '3-Part Examiner Simulator & Fillers', hash: '#speaking-simulator', icon: '🏛️' }
  ]
};

// All 12 Full View Handlers with backward-compatible routing
const ALL_ROUTES: RouteItem[] = [
  {
    id: 'home',
    label: 'Overview',
    parentNavId: 'home',
    view: root => {
      root.append(
        h('h1', 'ie-title', 'IELTS Academic: road to 7.0'),
        h(
          'p',
          'ie-lead',
          'Exam-format practice for all four skills. Listening and Reading are scored with official raw-score tables. Writing and Speaking give automatic checks plus rubric ratings. Everything runs 100% offline in your browser.'
        ),
        homeSuites(),
        report()
      );
      return () => {};
    }
  },
  { id: 'diagnostic', label: 'Diagnostic', parentNavId: 'diagnostic', view: diagnosticView },
  { id: 'reading', label: 'Reading', parentNavId: 'reading', subnavGroup: 'reading', view: readingView },
  { id: 'reading-drills', label: 'Reading Drills', parentNavId: 'reading', subnavGroup: 'reading', view: readingDrillsView },
  { id: 'listening', label: 'Listening', parentNavId: 'listening', subnavGroup: 'listening', view: listeningView },
  { id: 'listening-traps', label: 'Listening Traps', parentNavId: 'listening', subnavGroup: 'listening', view: listeningTrapsView },
  { id: 'writing', label: 'Writing', parentNavId: 'writing', subnavGroup: 'writing', view: writingView },
  { id: 'writing-studio', label: 'Writing Studio', parentNavId: 'writing', subnavGroup: 'writing', view: writingStudioView },
  { id: 'speaking', label: 'Speaking', parentNavId: 'speaking', subnavGroup: 'speaking', view: speakingView },
  { id: 'speaking-simulator', label: 'Speaking Simulator', parentNavId: 'speaking', subnavGroup: 'speaking', view: speakingSimulatorView },
  { id: 'vocab', label: 'Vocabulary', parentNavId: 'vocab', view: vocabView },
  { id: 'strategy', label: 'Strategy', parentNavId: 'strategy', view: strategyView },
  { id: 'mock', label: 'Mock tests', parentNavId: 'mock', view: mockView }
];

function renderSubnavBanner(groupKey: string, currentHash: string): HTMLElement {
  const items = SKILL_SUBNAVS[groupKey];
  if (!items) return h('div');

  const banner = h('div', 'ie-subnav-banner');
  const group = h('div', 'ie-subnav-group');
  const label = h('span', 'ie-subnav-label', `${groupKey.toUpperCase()} STUDIO:`);
  group.append(label);

  items.forEach(it => {
    const isCurrent = it.hash === currentHash;
    const a = h('a', `ie-subnav-link ${isCurrent ? 'is-active' : ''}`, `${it.icon} ${it.label}`) as HTMLAnchorElement;
    a.href = it.hash;
    if (isCurrent) a.setAttribute('aria-current', 'page');
    group.append(a);
  });

  banner.append(group);
  return banner;
}

function homeSuites(): HTMLElement {
  const cards = h('div', 'ie-cards ie-cards-wide');

  const SUITES = [
    {
      title: 'Diagnostic Checkpoint',
      badge: 'Benchmark',
      desc: '20 Cambridge morphosyntactic and lexical items with immediate option reveals, 6-flaw error taxonomy radar, and 4-step remediation plan.',
      primaryLink: '#diagnostic',
      primaryText: 'Launch Diagnostic Checkpoint'
    },
    {
      title: 'Academic Reading Suite',
      badge: 'Passages + Drills',
      desc: '3 timed authentic academic reading passages with official band scoring, plus the 14 Question-Type Attack Drills Lab and live Exam Synonym Engine.',
      primaryLink: '#reading',
      primaryText: 'Timed Passages',
      subLink: '#reading-drills',
      subText: '14 Attack Drills Lab'
    },
    {
      title: 'Academic Listening Suite',
      badge: 'Audio + Trap Lab',
      desc: '4 authentic multi-speaker dialogue and lecture sections, plus the Listening Trap & Oral Self-Correction Audio Lab with waveform visualizer.',
      primaryLink: '#listening',
      primaryText: 'Sections 1–4 Audio',
      subLink: '#listening-traps',
      subText: 'Trap Audio Lab'
    },
    {
      title: 'Academic Writing Suite',
      badge: 'Blueprints + Diff',
      desc: 'Timed Task 1 report generator and Task 2 essay workbench, featuring 6 visual blueprints (zero-data overview rule) and 5 architectures with Myers diff.',
      primaryLink: '#writing',
      primaryText: 'Timed Tasks 1 & 2',
      subLink: '#writing-studio',
      subText: 'Blueprint & Essay Studio'
    },
    {
      title: 'Academic Speaking Suite',
      badge: 'Interlocutor + Fillers',
      desc: 'Speaking interview practice with audio recording and 1-minute notepad, plus the 3-Part Examiner Simulator with conversational filler detection.',
      primaryLink: '#speaking',
      primaryText: 'Practice Prompts',
      subLink: '#speaking-simulator',
      subText: '3-Part Examiner Simulator'
    },
    {
      title: 'Master Strategy Hub',
      badge: 'Tactical Vault',
      desc: '46 tactical cards across all 7 skills derived from Keino Campbell’s masterclass, featuring expandable formula drawers and high-yield traps.',
      primaryLink: '#strategy',
      primaryText: 'Explore Tactical Cards'
    },
    {
      title: 'Full Mock Exam Cockpit',
      badge: 'CD-IELTS Simulator',
      desc: 'Complete 4-skill timed mock exams replicating official British Council / IDP test day conditions with split-screen resizer and theme picker.',
      primaryLink: '#mock',
      primaryText: 'Start Full Mock Exam'
    }
  ];

  SUITES.forEach(s => {
    const card = h('div', 'ie-card');
    card.innerHTML = `
      <div class="ie-card-badge">${s.badge}</div>
      <b style="font-size: var(--text-base);">${s.title}</b>
      <span>${s.desc}</span>
      <div class="ie-card-sublinks">
        <a class="ie-btn ie-btn-sm ie-btn-primary" href="${s.primaryLink}">${s.primaryText}</a>
        ${s.subLink ? `<a class="ie-btn ie-btn-sm" href="${s.subLink}">${s.subText}</a>` : ''}
      </div>
    `;
    cards.append(card);
  });

  return cards;
}

const header = document.getElementById('ie-header')!;
const main = document.getElementById('ie-main')!;
let cleanup: () => void = () => {};

header.innerHTML = `
  <a class="ie-brand" href="#home">IELTS <b>7.0</b></a>
  <nav class="ie-nav" aria-label="IELTS sections">
    ${PRIMARY_NAV.map(n => `<a href="#${n.id}" data-id="${n.id}">${n.label}</a>`).join('')}
  </nav>
  <a class="ie-back" href="./index.html">← English Singularity</a>
`;

function route(): void {
  cleanup();
  const rawHash = location.hash || '#home';
  const id = rawHash.replace(/^#/, '') || 'home';
  const item = ALL_ROUTES.find(r => r.id === id) || ALL_ROUTES[0];

  // Update primary navbar highlight based on parentNavId
  header.querySelectorAll('.ie-nav a').forEach(a => {
    const on = (a as HTMLElement).dataset.id === item.parentNavId;
    a.classList.toggle('is-on', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  main.innerHTML = '';

  // If this route belongs to a skill subnav group, prepend the studio subnav switcher
  if (item.subnavGroup) {
    const subnavBanner = renderSubnavBanner(item.subnavGroup, `#${item.id}`);
    main.append(subnavBanner);
  }

  cleanup = item.view(main);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
