import { h } from './ui';
import { report } from './report';
import { achievementsHtml } from '../core/achievements-card';
import { UsageTracker } from '../core/usage-tracker';
import { lazyView, prefetchViews } from './lazy-view';
import { readingDrillsView } from './views/reading-drills';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { HapticEngine } from '../core/haptic-engine';
import { CommuteAudioPlayer } from '../core/commute-audio-player';
import { MistakeVault } from '../core/mistake-vault';
import { SpeechEvaluator } from '../core/speech-evaluator';
import { ScrollAffordance } from '../core/scroll-affordance';
import * as ieltsTts from './tts';
import { icon, IconName } from '../utils/icons';

(window as any).AudioSynthesizer = AudioSynthesizer;
(window as any).HapticEngine = HapticEngine;
(window as any).CommuteAudioPlayer = CommuteAudioPlayer;
(window as any).MistakeVault = MistakeVault;
(window as any).SpeechEvaluator = SpeechEvaluator;
(window as any).ieltsTts = ieltsTts;

// Global Micro-Interactions: Tactile audio & haptic feedback on button clicks
document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement)?.closest('button, .ie-btn, .ie-nav a, .ie-subnav-link, .ie-tab');
  if (target) {
    AudioSynthesizer.play('click');
    HapticEngine.trigger('light');
  }
}, { capture: true });

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
const SKILL_SUBNAVS: Record<string, { label: string; hash: string; iconName: IconName }[]> = {
  reading: [
    { label: 'Timed Passages', hash: '#reading', iconName: 'book' },
    { label: '14 Attack Drills Lab', hash: '#reading-drills', iconName: 'target' }
  ],
  listening: [
    { label: 'Sections 1–4 Audio', hash: '#listening', iconName: 'headphones' },
    { label: 'Traps & Audio Lab', hash: '#listening-traps', iconName: 'target' }
  ],
  writing: [
    { label: 'Prompts & Rubrics', hash: '#writing', iconName: 'edit' },
    { label: 'Blueprints & Architect', hash: '#writing-studio', iconName: 'layers' }
  ],
  speaking: [
    { label: 'Prompts & Notepad', hash: '#speaking', iconName: 'mic' },
    { label: 'Examiner Simulator', hash: '#speaking-simulator', iconName: 'graduationCap' }
  ]
};

// All 12 Full View Handlers with backward-compatible routing
// Progress summary on the overview: time in app, answers, streak and milestone badges
function progressSection(): HTMLElement {
  const box = h('div');
  box.innerHTML = achievementsHtml();
  return box;
}

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
        progressSection(),
        report()
      );
      return () => {};
    }
  },
  { id: 'diagnostic', label: 'Diagnostic', parentNavId: 'diagnostic', view: lazyView(() => import('./views/diagnostic').then(m => m.diagnosticView)) },
  { id: 'reading', label: 'Reading', parentNavId: 'reading', subnavGroup: 'reading', view: lazyView(() => import('./views/reading').then(m => m.readingView)) },
  { id: 'reading-drills', label: 'Reading Drills', parentNavId: 'reading', subnavGroup: 'reading', view: readingDrillsView },
  { id: 'listening', label: 'Listening', parentNavId: 'listening', subnavGroup: 'listening', view: lazyView(() => import('./views/listening').then(m => m.listeningView)) },
  { id: 'listening-traps', label: 'Listening Traps', parentNavId: 'listening', subnavGroup: 'listening', view: lazyView(() => import('./views/listening-traps').then(m => m.listeningTrapsView)) },
  { id: 'writing', label: 'Writing', parentNavId: 'writing', subnavGroup: 'writing', view: lazyView(() => import('./views/writing').then(m => m.writingView)) },
  { id: 'writing-studio', label: 'Writing Studio', parentNavId: 'writing', subnavGroup: 'writing', view: lazyView(() => import('./views/writing-studio').then(m => m.writingStudioView)) },
  { id: 'speaking', label: 'Speaking', parentNavId: 'speaking', subnavGroup: 'speaking', view: lazyView(() => import('./views/speaking').then(m => m.speakingView)) },
  { id: 'speaking-simulator', label: 'Speaking Simulator', parentNavId: 'speaking', subnavGroup: 'speaking', view: lazyView(() => import('./views/speaking-simulator').then(m => m.speakingSimulatorView)) },
  { id: 'vocab', label: 'Vocabulary', parentNavId: 'vocab', view: lazyView(() => import('./views/vocab').then(m => m.vocabView)) },
  { id: 'path', label: 'Study path', parentNavId: 'home', view: lazyView(() => import('./views/path').then(m => m.pathView)) },
  { id: 'strategy', label: 'Strategy', parentNavId: 'strategy', view: lazyView(() => import('./views/strategy').then(m => m.strategyView)) },
  { id: 'mock', label: 'Mock tests', parentNavId: 'mock', view: lazyView(() => import('./views/mock').then(m => m.mockView)) }
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
    const a = h('a', `ie-subnav-link ${isCurrent ? 'is-active' : ''}`) as HTMLAnchorElement;
    a.innerHTML = `${icon(it.iconName, 13)} <span>${it.label}</span>`;
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
      title: 'Guided 7.0 Path',
      badge: 'Plan',
      desc: 'Roadmap length from recent attempts, Reading focus, and a readiness gate for each skill.',
      primaryLink: '#path',
      primaryText: 'Open study path'
    },
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
  <div class="ie-top-bar">
    <a class="ie-back" href="./index.html">&lt; English Singularity</a>
    <a class="ie-brand" href="#home">IELTS <b>7.0</b></a>
    <div class="ie-top-actions" style="margin-left: auto; display: flex; gap: 8px;">
      <button type="button" class="ie-btn ie-btn-sm ie-btn-commute" title="Hands-Free Commute Audio Loop" aria-label="Hands-Free Commute Audio Loop" style="padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px;">
        ${icon('headphones', 14)} <span class="ie-action-label" style="font-size: var(--font-kicker); font-weight: 700;">AUDIO</span>
      </button>
      <button type="button" class="ie-btn ie-btn-sm ie-btn-vault" title="Smart Mistake Vault" aria-label="Smart Mistake Vault" style="padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; color: var(--accent-gold); border-color: var(--accent-gold);">
        ${icon('target', 14)} <span class="ie-action-label" style="font-size: var(--font-kicker); font-weight: 700;">VAULT</span>
      </button>
    </div>
  </div>
  <div class="ie-nav-track">
    <button type="button" class="ie-nav-arrow ie-nav-arrow-left" aria-label="Scroll navigation left" tabindex="-1">
      ${icon('chevronLeft', 16)}
    </button>
    <nav class="ie-nav" aria-label="IELTS sections">
      ${PRIMARY_NAV.map(n => `<a href="#${n.id}" data-id="${n.id}">${n.label}</a>`).join('')}
    </nav>
    <button type="button" class="ie-nav-arrow ie-nav-arrow-right" aria-label="Scroll navigation right" tabindex="-1">
      ${icon('chevronRight', 16)}
    </button>
  </div>
`;

header.querySelector('.ie-btn-commute')?.addEventListener('click', () => {
  CommuteAudioPlayer.open();
});

header.querySelector('.ie-btn-vault')?.addEventListener('click', () => {
  MistakeVault.open();
});

const nav = header.querySelector<HTMLElement>('.ie-nav')!;
const leftArrow = header.querySelector<HTMLButtonElement>('.ie-nav-arrow-left')!;
const rightArrow = header.querySelector<HTMLButtonElement>('.ie-nav-arrow-right')!;

function updateNavArrows(): void {
  if (!nav || !leftArrow || !rightArrow) return;
  const canScrollLeft = nav.scrollLeft > 6;
  const canScrollRight = nav.scrollLeft < (nav.scrollWidth - nav.clientWidth - 6);
  leftArrow.classList.toggle('is-visible', canScrollLeft);
  rightArrow.classList.toggle('is-visible', canScrollRight);
}

leftArrow.addEventListener('click', () => {
  nav.scrollBy({ left: -160, behavior: 'smooth' });
});

rightArrow.addEventListener('click', () => {
  nav.scrollBy({ left: 160, behavior: 'smooth' });
});

nav.addEventListener('scroll', updateNavArrows, { passive: true });
window.addEventListener('resize', updateNavArrows, { passive: true });

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
  revealActiveTabs();
  ScrollAffordance.scan(main);
}

/* Scroll the active tab into view inside its sideways strip (strip only, never the page) */
function revealActiveTabs(): void {
  const pairs: [string, string][] = [
    ['.ie-nav', 'a.is-on'],
    ['.ie-subnav-group', '.ie-subnav-link.is-active']
  ];
  for (const [stripSel, tabSel] of pairs) {
    const strip = document.querySelector<HTMLElement>(stripSel);
    const tab = strip?.querySelector<HTMLElement>(tabSel);
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) continue;

    const stripRect = strip.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const padLeft = parseFloat(getComputedStyle(strip).paddingLeft) || 14;
    const padRight = parseFloat(getComputedStyle(strip).paddingRight) || 14;

    // Check if tab is already comfortably in view within strip
    const isFullyVisible = tabRect.left >= (stripRect.left + padLeft - 2) && tabRect.right <= (stripRect.right - padRight + 2);
    if (isFullyVisible) continue;

    // Scroll so that tab aligns flush with the left padding
    const currentOffsetFromStrip = tabRect.left - stripRect.left;
    strip.scrollLeft += (currentOffsetFromStrip - padLeft);
  }
  updateNavArrows();
}

ScrollAffordance.initGlobalObserver();
window.addEventListener('hashchange', route);
route();
document.getElementById('boot')?.remove();
prefetchViews();
UsageTracker.start();
