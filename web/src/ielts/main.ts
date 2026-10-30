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
import { syncAndroidWidget, WidgetBridge } from '../core/widget-bridge';
import * as ieltsTts from './tts';
import { icon, IconName } from '../utils/icons';
import { I18n, t } from '../core/i18n';
import { AccentThemeManager } from '../core/accent-theme';
import { FloatingNote } from '../modules/floating-note';
import { NotificationEngine } from '../core/notification-engine';
import { isIeltsTestInProgress, showIeltsConfirmDialog } from './confirm-dialog';

// Initialize customized primary accent theme
AccentThemeManager.init();
FloatingNote.init();

(window as any).AudioSynthesizer = AudioSynthesizer;
(window as any).HapticEngine = HapticEngine;
(window as any).CommuteAudioPlayer = CommuteAudioPlayer;
(window as any).MistakeVault = MistakeVault;
(window as any).SpeechEvaluator = SpeechEvaluator;
(window as any).ieltsTts = ieltsTts;
(window as any).WidgetBridge = WidgetBridge;
(window as any).FloatingNote = FloatingNote;
(window as any).NotificationEngine = NotificationEngine;

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
  { id: 'home', labelKey: 'ielts.nav_overview', label: 'Overview' },
  { id: 'diagnostic', labelKey: 'ielts.nav_diagnostic', label: 'Diagnostic' },
  { id: 'reading', labelKey: 'ielts.nav_reading', label: 'Reading' },
  { id: 'listening', labelKey: 'ielts.nav_listening', label: 'Listening' },
  { id: 'writing', labelKey: 'ielts.nav_writing', label: 'Writing' },
  { id: 'speaking', labelKey: 'ielts.nav_speaking', label: 'Speaking' },
  { id: 'vocab', labelKey: 'ielts.nav_vocab', label: 'Vocabulary' },
  { id: 'strategy', labelKey: 'ielts.nav_strategy', label: 'Strategy' },
  { id: 'mock', labelKey: 'ielts.nav_mock', label: 'Mock tests' }
];

// Subnav item definitions for the 4 core skill studios
const SKILL_SUBNAVS: Record<string, { labelKey: string; label: string; hash: string; iconName: IconName }[]> = {
  reading: [
    { labelKey: 'ielts.subnav_timed_passages', label: 'Timed Passages', hash: '#reading', iconName: 'book' },
    { labelKey: 'ielts.subnav_attack_drills', label: '14 Attack Drills Lab', hash: '#reading-drills', iconName: 'target' }
  ],
  listening: [
    { labelKey: 'ielts.subnav_sections_audio', label: 'Sections 1–4 Audio', hash: '#listening', iconName: 'headphones' },
    { labelKey: 'ielts.subnav_traps_audio', label: 'Traps & Audio Lab', hash: '#listening-traps', iconName: 'target' }
  ],
  writing: [
    { labelKey: 'ielts.subnav_prompts_rubrics', label: 'Prompts & Rubrics', hash: '#writing', iconName: 'edit' },
    { labelKey: 'ielts.subnav_blueprints', label: 'Blueprints & Architect', hash: '#writing-studio', iconName: 'layers' }
  ],
  speaking: [
    { labelKey: 'ielts.subnav_prompts_notepad', label: 'Prompts & Notepad', hash: '#speaking', iconName: 'mic' },
    { labelKey: 'ielts.subnav_examiner_sim', label: 'Examiner Simulator', hash: '#speaking-simulator', iconName: 'graduationCap' }
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
        h('h1', 'ie-title', t('ielts.road_to_7', undefined, 'IELTS Academic: road to 7.0')),
        h(
          'p',
          'ie-lead',
          t(
            'ielts.road_to_7_lead',
            undefined,
            'Exam-format practice for all four skills. Listening and Reading are scored with standard raw-score conversion tables. Writing and Speaking give automatic checks plus rubric ratings. Everything runs 100% offline in your browser.'
          )
        ),
        homeSuites(),
        progressSection(),
        report()
      );
      return () => { };
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
  const groupName = t(`ielts.skill_${groupKey}`, undefined, groupKey.toUpperCase());
  const label = h('span', 'ie-subnav-label', `${groupName.toUpperCase()} ${t('ielts.subnav_studio', undefined, 'STUDIO:')}`);
  group.append(label);

  items.forEach(it => {
    const isCurrent = it.hash === currentHash;
    const a = h('a', `ie-subnav-link ${isCurrent ? 'is-active' : ''}`) as HTMLAnchorElement;
    a.innerHTML = `${icon(it.iconName, 13)} <span>${t(it.labelKey, undefined, it.label)}</span>`;
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
      title: t('ielts.card_guided_path_title', undefined, 'Guided 7.0 Path'),
      badge: t('ielts.card_guided_path_badge', undefined, 'Plan'),
      desc: t('ielts.card_guided_path_desc', undefined, 'Roadmap length from recent attempts, Reading focus, and a readiness gate for each skill.'),
      primaryLink: '#path',
      primaryText: t('ielts.card_guided_path_btn', undefined, 'Open study path')
    },
    {
      title: t('ielts.card_diag_title', undefined, 'Diagnostic Checkpoint'),
      badge: t('ielts.card_diag_badge', undefined, 'Benchmark'),
      desc: t('ielts.card_diag_desc', undefined, '20 Cambridge morphosyntactic and lexical items with immediate option reveals, 6-flaw error taxonomy radar, and 4-step remediation plan.'),
      primaryLink: '#diagnostic',
      primaryText: t('ielts.card_diag_btn', undefined, 'Launch Diagnostic Checkpoint')
    },
    {
      title: t('ielts.card_reading_title', undefined, 'Academic Reading Suite'),
      badge: t('ielts.card_reading_badge', undefined, 'Passages + Drills'),
      desc: t('ielts.card_reading_desc', undefined, '3 timed authentic academic reading passages with calibrated band scoring, plus the 14 Question-Type Attack Drills Lab and live Exam Synonym Engine.'),
      primaryLink: '#reading',
      primaryText: t('ielts.card_reading_btn1', undefined, 'Timed Passages'),
      subLink: '#reading-drills',
      subText: t('ielts.card_reading_btn2', undefined, '14 Attack Drills Lab')
    },
    {
      title: t('ielts.card_listening_title', undefined, 'Academic Listening Suite'),
      badge: t('ielts.card_listening_badge', undefined, 'Audio + Trap Lab'),
      desc: t('ielts.card_listening_desc', undefined, '4 authentic multi-speaker dialogue and lecture sections, plus the Listening Trap & Oral Self-Correction Audio Lab with waveform visualizer.'),
      primaryLink: '#listening',
      primaryText: t('ielts.card_listening_btn1', undefined, 'Sections 1–4 Audio'),
      subLink: '#listening-traps',
      subText: t('ielts.card_listening_btn2', undefined, 'Trap Audio Lab')
    },
    {
      title: t('ielts.card_writing_title', undefined, 'Academic Writing Suite'),
      badge: t('ielts.card_writing_badge', undefined, 'Blueprints + Diff'),
      desc: t('ielts.card_writing_desc', undefined, 'Timed Task 1 report generator and Task 2 essay workbench, featuring 6 visual blueprints (zero-data overview rule) and 5 architectures with Myers diff.'),
      primaryLink: '#writing',
      primaryText: t('ielts.card_writing_btn1', undefined, 'Timed Tasks 1 & 2'),
      subLink: '#writing-studio',
      subText: t('ielts.card_writing_btn2', undefined, 'Blueprint & Essay Studio')
    },
    {
      title: t('ielts.card_speaking_title', undefined, 'Academic Speaking Suite'),
      badge: t('ielts.card_speaking_badge', undefined, 'Interlocutor + Fillers'),
      desc: t('ielts.card_speaking_desc', undefined, 'Speaking interview practice with audio recording and 1-minute notepad, plus the 3-Part Examiner Simulator with conversational filler detection.'),
      primaryLink: '#speaking',
      primaryText: t('ielts.card_speaking_btn1', undefined, 'Practice Prompts'),
      subLink: '#speaking-simulator',
      subText: t('ielts.card_speaking_btn2', undefined, '3-Part Examiner Simulator')
    },
    {
      title: t('ielts.card_strategy_title', undefined, 'Master Strategy Hub'),
      badge: t('ielts.card_strategy_badge', undefined, 'Tactical Vault'),
      desc: t('ielts.card_strategy_desc', undefined, '46 tactical cards across all 7 skills derived from Keino Campbell’s masterclass, featuring expandable formula drawers and high-yield traps.'),
      primaryLink: '#strategy',
      primaryText: t('ielts.card_strategy_btn', undefined, 'Explore Tactical Cards')
    },
    {
      title: t('ielts.card_mock_title', undefined, 'Full Mock Exam Cockpit'),
      badge: t('ielts.card_mock_badge', undefined, 'CD-IELTS Simulator'),
      desc: t('ielts.card_mock_desc', undefined, 'Complete 4-skill timed mock exams replicating computer-delivered test day conditions with split-screen resizer and theme picker.'),
      primaryLink: '#mock',
      primaryText: t('ielts.card_mock_btn', undefined, 'Start Full Mock Exam')
    }
  ];

  SUITES.forEach(s => {
    const card = h('div', 'ie-card ie-suite-card ie-card-action');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', s.title);
    card.innerHTML = `
      <div class="ie-card-header-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div class="ie-card-badge">${s.badge}</div>
        <a class="ie-card-affordance" href="${s.primaryLink}" aria-label="${s.primaryText}" style="border: none; background: transparent; text-decoration: none; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; margin: -10px -10px -10px 0; color: var(--ink-muted); transition: transform 0.15s ease, color 0.15s ease;">${icon('arrowRight', 18)}</a>
      </div>
      <b style="font-size: var(--text-base); line-height: 1.35; margin-top: 4px;">${s.title}</b>
      <span style="font-size: var(--font-body-compact, 13px); line-height: 1.45; color: var(--ink-secondary);">${s.desc}</span>
      ${s.subLink ? `
        <div class="ie-card-subpill-wrap" style="margin-top: 8px;">
          <a class="ie-suite-subpill" href="${s.subLink}" style="display: inline-flex; align-items: center; gap: 6px; font-size: var(--font-kicker); font-weight: 600; padding: 4px 10px; border-radius: var(--radius-pill, 9999px); background: var(--bg-surface-sunk); color: var(--accent-cyan); text-decoration: none; border: 1px solid var(--border-hairline); min-height: 28px;">
            <span>${s.subText}</span> →
          </a>
        </div>
      ` : ''}
    `;
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a')) return;
      window.location.hash = s.primaryLink;
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if ((e.target as HTMLElement).closest('a')) return;
        e.preventDefault();
        window.location.hash = s.primaryLink;
      }
    });
    cards.append(card);
  });

  return cards;
}

const header = document.getElementById('ie-header')!;
const main = document.getElementById('ie-main')!;
let cleanup: () => void = () => { };

function renderHeader(): void {
  header.innerHTML = `
  <div class="ie-top-bar">
    <a class="ie-back" href="./index.html"><span class="ie-back-arrow">←</span> <span class="ie-back-text">${t('ielts.back_to_singularity', undefined, 'English Singularity')}</span></a>
    <a class="ie-brand" href="#home">IELTS <b>7.0</b></a>
    <div class="ie-top-actions" style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
      <button type="button" class="ie-btn ie-btn-sm ie-btn-lang" title="${t('ielts.toggle_lang', undefined, 'Switch language (EN/VI)')}" aria-label="${t('ielts.toggle_lang', undefined, 'Switch language (EN/VI)')}" style="padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: var(--font-kicker);">
        ${icon('globe', 12)} <span class="btn-label">${I18n.getLocale() === 'en' ? 'VI' : 'EN'}</span>
      </button>
      <button type="button" class="ie-btn ie-btn-sm ie-btn-commute" title="${t('ielts.commute_tooltip', undefined, 'Hands-Free Commute Audio Loop')}" aria-label="${t('ielts.commute_tooltip', undefined, 'Hands-Free Commute Audio Loop')}" style="padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px;">
        ${icon('headphones', 14)} <span class="ie-action-label" style="font-size: var(--font-kicker); font-weight: 700;">${t('ielts.audio_commute', undefined, 'AUDIO')}</span>
      </button>
      <button type="button" class="ie-btn ie-btn-sm ie-btn-vault" title="${t('ielts.vault_tooltip', undefined, 'Smart Mistake Vault')}" aria-label="${t('ielts.vault_tooltip', undefined, 'Smart Mistake Vault')}" style="padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; color: var(--accent-gold); border-color: var(--accent-gold);">
        ${icon('target', 14)} <span class="ie-action-label" style="font-size: var(--font-kicker); font-weight: 700;">${t('ielts.vault', undefined, 'VAULT')}</span>
      </button>
    </div>
  </div>
  <div class="ie-nav-track">
    <button type="button" class="ie-nav-arrow ie-nav-arrow-left" aria-label="Scroll navigation left" tabindex="-1">
      ${icon('chevronLeft', 16)}
    </button>
    <nav class="ie-nav" aria-label="IELTS sections">
      ${PRIMARY_NAV.map(n => `<a href="#${n.id}" data-id="${n.id}">${t(n.labelKey, undefined, n.label)}</a>`).join('')}
    </nav>
    <button type="button" class="ie-nav-arrow ie-nav-arrow-right" aria-label="Scroll navigation right" tabindex="-1">
      ${icon('chevronRight', 16)}
    </button>
  </div>
`;

  header.querySelector('.ie-back')?.addEventListener('click', async (e) => {
    if (isIeltsTestInProgress()) {
      e.preventDefault();
      const isVi = I18n.getLocale() === 'vi';
      const confirmed = await showIeltsConfirmDialog({
        title: isVi ? 'Xác nhận rời khỏi bài thi' : 'Confirm Navigation',
        message: isVi
          ? 'Bạn đang trong một phiên làm bài thi. Nếu rời đi lúc này, toàn bộ kết quả bài thi chưa nộp sẽ bị mất.\n\nBạn có chắc chắn muốn quay về English Singularity không?'
          : 'You are currently in an active exam session. Navigating away now will discard your unanswered progress.\n\nAre you sure you want to return to English Singularity?',
        confirmText: isVi ? 'Rời khỏi bài thi' : 'Leave Exam',
        cancelText: isVi ? 'Tiếp tục làm bài' : 'Keep Working',
        type: 'warning'
      });
      if (confirmed) {
        window.location.href = './index.html';
      }
    }
  });

  header.querySelector('.ie-btn-lang')?.addEventListener('click', () => {
    AudioSynthesizer.play('click');
    HapticEngine.trigger('light');
    I18n.toggleLocale();
    document.documentElement.lang = I18n.getLocale();
  });

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
    nav.classList.toggle('can-scroll-left', canScrollLeft);
    nav.classList.toggle('can-scroll-right', canScrollRight);
  }

  leftArrow.addEventListener('click', () => {
    nav.scrollBy({ left: -160, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    nav.scrollBy({ left: 160, behavior: 'smooth' });
  });

  nav.addEventListener('scroll', updateNavArrows, { passive: true });
  window.addEventListener('resize', updateNavArrows, { passive: true });
  updateNavArrows();
}

function route(): void {
  try {
    cleanup();
  } catch (err) {
    console.warn('[IELTS] Route cleanup notice:', err);
  }
  cleanup = () => { };

  // Global teardown: immediately halt audio, speech synthesis, and exam room ambience
  ieltsTts.stopAll();
  CommuteAudioPlayer.close();
  MistakeVault.close();

  // Clean up any stray bottom docks, selection pills, or overlays attached to body
  document.querySelectorAll('.ie-dock-reading, .ie-selection-pill').forEach(el => el.remove());

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
}

// React to locale changes
I18n.onLocaleChange(() => {
  renderHeader();
  route();
});

let lastRouteHash = location.hash || '#home';
let isRevertingHash = false;

async function handleHashChange(): Promise<void> {
  if (isRevertingHash) {
    isRevertingHash = false;
    return;
  }
  const targetHash = location.hash || '#home';
  if (targetHash === lastRouteHash) return;

  if (isIeltsTestInProgress()) {
    const isVi = I18n.getLocale() === 'vi';
    const confirmed = await showIeltsConfirmDialog({
      title: isVi ? 'Xác nhận rời khỏi bài thi' : 'Confirm Navigation',
      message: isVi
        ? 'Bạn đang trong một phiên làm bài thi. Nếu chuyển mục lúc này, toàn bộ kết quả bài thi chưa nộp sẽ bị mất.\n\nBạn có chắc chắn muốn rời đi không?'
        : 'You are currently in an active exam session. Navigating away now will discard your unanswered progress.\n\nAre you sure you want to leave the exam?',
      confirmText: isVi ? 'Rời khỏi bài thi' : 'Leave Exam',
      cancelText: isVi ? 'Tiếp tục làm bài' : 'Keep Working',
      type: 'warning'
    });

    if (!confirmed) {
      isRevertingHash = true;
      location.hash = lastRouteHash;
      return;
    }
  }

  lastRouteHash = targetHash;
  route();
}

window.addEventListener('beforeunload', (e) => {
  if (isIeltsTestInProgress()) {
    e.preventDefault();
    e.returnValue = '';
  }
});

renderHeader();
ScrollAffordance.initGlobalObserver();
window.addEventListener('hashchange', handleHashChange);
route();
document.getElementById('boot')?.remove();
prefetchViews();
UsageTracker.start();
NotificationEngine.schedulePeriodicCheck();
syncAndroidWidget();
