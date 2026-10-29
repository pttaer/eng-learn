import vocabData from '../data/vocab.json';
import iotVocabData from '../../assets/data/iot-vocabulary.json';
import { SRSEngine, SRSCardState, SRSRating } from '../../core/srs-engine';
import { ttsAvailable } from '../tts';
import { esc, h } from '../ui';
import { icon } from '../../utils/icons';
import { t } from '../../core/i18n';
import { StorageManager } from '../../utils/storage';

interface VocabItem {
  id: string;
  topic: string;
  word: string;
  pos: string;
  band: number;
  use: string[];
  definition: string;
  collocations: string[];
  paraphrases: string[];
  example: string;
  vietnamese?: string;
  cefrLevel?: string;
}

// Own storage key: the CEFR app's card states (STARK_ENG_STATE) are never touched.
const KEY = 'IELTS_VOCAB_SRS';
const DECK_CORE = vocabData as VocabItem[];

// Format IOT items into compatible VocabItem structures
const DECK_IOT: VocabItem[] = (iotVocabData as any[]).map((it, idx) => ({
  id: it.id || `iot-${idx}`,
  topic: it.topic || 'General Academic',
  word: it.word,
  pos: it.pos || 'noun',
  band: it.band || 7.0,
  use: ['writing', 'speaking', 'reading'],
  definition: it.definition || '',
  collocations: Array.isArray(it.collocations) ? it.collocations : [],
  paraphrases: [],
  example: it.example || '',
  vietnamese: it.vietnamese || '',
  cefrLevel: it.cefrLevel || 'B2'
}));

function load(): Record<string, SRSCardState> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function save(s: Record<string, SRSCardState>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage full or blocked */
  }
}

// Band 7.5+ items start with the engine's harder ease factor.
const level = (v: VocabItem): number => (v.band >= 7.5 ? 3 : 1);
const getSessionSize = (): number => ({ 15: 10, 60: 35 }[StorageManager.getDailyTimeBudget()] ?? 20);

export function vocabView(root: HTMLElement): () => void {
  let states = load();
  let activeDeckKey = 'core'; // 'core' | 'iot' | 'combined'
  let activeTopic = 'all';
  let activeBand = 'all';
  let searchQuery = '';
  let queue: VocabItem[] = [];

  const titleHeader = h('h1', 'ie-title', t('ielts.vocab_title', undefined, 'IELTS Academic Vocabulary & Collocations'));
  const leadDesc = h(
    'p',
    'ie-lead',
    t('ielts.vocab_lead', undefined, 'High-yield academic vocabulary and authentic collocations with spaced repetition.')
  );

  // Deck selector row
  const deckSwitcher = h('div', 'ie-mode-switcher');
  deckSwitcher.setAttribute('role', 'tablist');
  deckSwitcher.setAttribute('aria-label', 'Vocabulary Decks');

  const btnCore = h('button', 'ie-mode-btn is-active');
  btnCore.setAttribute('type', 'button');
  btnCore.setAttribute('role', 'tab');
  btnCore.setAttribute('aria-selected', 'true');
  btnCore.innerHTML = `
    <span class="ie-mode-icon">${icon('target', 13)}</span>
    <span class="ie-mode-label">
      <span class="ie-mode-full">${t('vocab.deck_core_full')}</span>
      <span class="ie-mode-short">${t('vocab.deck_core_short')}</span>
    </span>
    <span class="ie-mode-count">${DECK_CORE.length.toLocaleString()}</span>
  `;

  const btnIot = h('button', 'ie-mode-btn');
  btnIot.setAttribute('type', 'button');
  btnIot.setAttribute('role', 'tab');
  btnIot.setAttribute('aria-selected', 'false');
  btnIot.innerHTML = `
    <span class="ie-mode-icon">${icon('globe', 13)}</span>
    <span class="ie-mode-label">
      <span class="ie-mode-full">${t('vocab.deck_topics_full')}</span>
      <span class="ie-mode-short">${t('vocab.deck_topics_short')}</span>
    </span>
    <span class="ie-mode-count">${DECK_IOT.length.toLocaleString()}</span>
  `;

  const btnCombined = h('button', 'ie-mode-btn');
  btnCombined.setAttribute('type', 'button');
  btnCombined.setAttribute('role', 'tab');
  btnCombined.setAttribute('aria-selected', 'false');
  btnCombined.innerHTML = `
    <span class="ie-mode-icon">${icon('zap', 13)}</span>
    <span class="ie-mode-label">
      <span class="ie-mode-full">${t('vocab.deck_combined_full')}</span>
      <span class="ie-mode-short">${t('vocab.deck_combined_short')}</span>
    </span>
    <span class="ie-mode-count">${(DECK_CORE.length + DECK_IOT.length).toLocaleString()}</span>
  `;

  deckSwitcher.append(btnCore, btnIot, btnCombined);

  // Controls bar
  const bar = h('div', 'ie-vocab-controls');

  const selectsRow = h('div', 'ie-vocab-selects-row');

  // Topic Select
  const topicSelect = h('select', 'ie-select ie-vselect');
  topicSelect.setAttribute('aria-label', 'Topic');

  // Star Topic button for priority domain focus
  const starTopicBtn = h('button', 'ie-btn ie-star-topic-btn') as HTMLButtonElement;
  starTopicBtn.type = 'button';
  starTopicBtn.setAttribute('aria-label', 'Star active topic for priority focus');
  starTopicBtn.style.padding = '0 12px';
  starTopicBtn.style.minWidth = '44px';
  starTopicBtn.style.minHeight = '44px';
  starTopicBtn.style.fontSize = '16px';
  starTopicBtn.style.display = 'inline-flex';
  starTopicBtn.style.alignItems = 'center';
  starTopicBtn.style.justifyContent = 'center';
  starTopicBtn.title = 'Star topic for priority domain focus';

  // Band Select
  const bandSelect = h('select', 'ie-select ie-vband');
  bandSelect.setAttribute('aria-label', 'Target Band');
  bandSelect.innerHTML = `
    <option value="all">${t('vocab.all_bands')}</option>
    <option value="6.5">${t('vocab.band_65')}</option>
    <option value="7.0">${t('vocab.band_70')}</option>
    <option value="7.5">${t('vocab.band_75')}</option>
  `;

  selectsRow.append(topicSelect, starTopicBtn, bandSelect);

  // Search input
  const searchInput = h('input', 'ie-input ie-vsearch') as HTMLInputElement;
  searchInput.type = 'search';
  searchInput.placeholder = t('vocab.search_ph');

  const stats = h('span', 'ie-note ie-vstats');
  stats.setAttribute('aria-live', 'polite');

  bar.append(selectsRow, searchInput, stats);

  const stage = h('div', 'ie-vstage');
  root.append(titleHeader, leadDesc, deckSwitcher, bar, stage);

  function getActiveDeck(): VocabItem[] {
    if (activeDeckKey === 'core') return DECK_CORE;
    if (activeDeckKey === 'iot') return DECK_IOT;
    return [...DECK_CORE, ...DECK_IOT];
  }

  function updateStarBtnState(): void {
    if (activeTopic === 'all' || activeTopic === 'starred') {
      starTopicBtn.disabled = true;
      starTopicBtn.style.opacity = '0.4';
      starTopicBtn.innerHTML = icon('star', 16);
      starTopicBtn.style.color = 'inherit';
      starTopicBtn.title = 'Select a specific topic to toggle star focus';
    } else {
      starTopicBtn.disabled = false;
      starTopicBtn.style.opacity = '1';
      const isStarred = StorageManager.isTopicStarred(activeTopic);
      starTopicBtn.innerHTML = icon('star', 16);
      starTopicBtn.style.color = isStarred ? 'var(--accent-gold, #f59e0b)' : 'inherit';
      const svg = starTopicBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', isStarred ? 'currentColor' : 'none');
      starTopicBtn.title = isStarred ? `Unstar "${activeTopic}" focus` : `Star "${activeTopic}" for priority focus`;
    }
  }

  function updateTopicOptions(keepTopic?: string): void {
    const deck = getActiveDeck();
    const topics = [...new Set(deck.map(v => v.topic))].sort();
    const starred = StorageManager.getStarredVocabTopics();

    const starredOpt = starred.length > 0
      ? `<option value="starred">⭐ Starred Domains (${starred.length})</option>`
      : '';

    topicSelect.innerHTML = `<option value="all">${t('vocab.all_topics')}</option>${starredOpt}${topics
      .map(t => {
        const isStar = starred.includes(t.toLowerCase());
        return `<option value="${t}">${isStar ? '⭐ ' : ''}${t[0].toUpperCase() + t.slice(1)}</option>`;
      })
      .join('')}`;

    if (keepTopic && (keepTopic === 'starred' || topics.includes(keepTopic))) {
      topicSelect.value = keepTopic;
      activeTopic = keepTopic;
    } else {
      topicSelect.value = 'all';
      activeTopic = 'all';
    }
    updateStarBtnState();
  }

  function getFilteredPool(): VocabItem[] {
    let pool = getActiveDeck();
    if (activeTopic === 'starred') {
      const starred = StorageManager.getStarredVocabTopics();
      pool = pool.filter(v => starred.includes(v.topic.toLowerCase()));
    } else if (activeTopic !== 'all') {
      pool = pool.filter(v => v.topic === activeTopic);
    }
    if (activeBand !== 'all') {
      const b = parseFloat(activeBand);
      pool = pool.filter(v => v.band >= b);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(
        v =>
          v.word.toLowerCase().includes(q) ||
          (v.vietnamese && v.vietnamese.toLowerCase().includes(q)) ||
          v.definition.toLowerCase().includes(q) ||
          v.collocations.some(c => c.toLowerCase().includes(q))
      );
    }
    return pool;
  }

  const showStats = (): void => {
    const p = getFilteredPool();
    const now = Date.now();
    const seen = p.filter(v => states[v.id]);
    const due = seen.filter(v => states[v.id].dueDate <= now).length;
    stats.textContent = t('vocab.stats_format', {
      total: p.length.toLocaleString(),
      due: due.toString(),
      unstudied: (p.length - seen.length).toString()
    });
  };

  function next(): void {
    showStats();
    stage.innerHTML = '';
    const v = queue.shift();
    if (!v) {
      const done = h(
        'div',
        'ie-vcard',
        `<b>${t('vocab.session_complete_title')}</b><p class="ie-note">${t('vocab.session_complete_note')}</p>`
      );
      const more = h('button', 'ie-btn ie-btn-primary', t('vocab.btn_launch_next_round'));
      more.addEventListener('click', start);
      done.append(more);
      stage.append(done);
      return;
    }

    const card = h('article', 'ie-vcard');
    const tags = `<span class="ie-vtags">${esc(v.pos)} · band ${v.band.toFixed(1)} ${v.cefrLevel ? `(${v.cefrLevel})` : ''
      } · ${esc(v.topic)}</span>`;
    card.innerHTML = `${tags}<h2 class="ie-vword">${esc(
      v.word
    )}</h2><p class="ie-note">${t('vocab.recall_hint')}</p>`;

    const actions = h('div', 'ie-vactions');
    if (ttsAvailable()) {
      const say = h('button', 'ie-btn', t('vocab.btn_pronounce'));
      say.addEventListener('click', () => {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(v.word);
        u.lang = 'en-GB';
        speechSynthesis.speak(u);
      });
      actions.append(say);
    }

    const reveal = h('button', 'ie-btn ie-btn-primary', t('vocab.btn_reveal'));
    actions.append(reveal);
    card.append(actions);
    stage.append(card);
    reveal.focus();

    reveal.addEventListener('click', () => {
      card.querySelector('.ie-note')?.remove();
      actions.remove();

      let vnBlock = '';
      if (v.vietnamese) {
        vnBlock = `<p style="color: var(--accent-cyan); font-weight: 600; margin-bottom: var(--space-6);">🇻🇳 ${esc(
          v.vietnamese
        )}</p>`;
      }

      let collocBlock = '';
      if (v.collocations && v.collocations.length > 0) {
        collocBlock = `<dt>${t('vocab.academic_collocations')}</dt><dd style="color: var(--ink-primary); font-weight: 500; display: flex; flex-wrap: wrap; gap: 4px 6px;">${v.collocations
          .map(c => `<span style="display:inline-block; padding: 2px 8px; border-radius: var(--radius-pill, 9999px); background: rgba(56, 189, 248, 0.12); color: var(--accent-cyan); white-space: nowrap; flex-shrink: 0; border: none;">${esc(c)}</span>`)
          .join('')}</dd>`;
      }

      let paraBlock = '';
      if (v.paraphrases && v.paraphrases.length > 0) {
        paraBlock = `<dt>${t('vocab.exam_paraphrases')}</dt><dd>${v.paraphrases.map(esc).join(' · ')}</dd>`;
      }

      card.append(
        h(
          'div',
          'ie-vback',
          `${vnBlock}<p>${esc(v.definition)}</p><p class="ie-vex">${esc(
            v.example
          )}</p><dl>${collocBlock}${paraBlock}</dl>`
        )
      );

      const rate = h('div', 'ie-vactions');
      const ask = (label: string, r: SRSRating): HTMLButtonElement => {
        const b = h('button', r === 'good' ? 'ie-btn ie-btn-primary' : 'ie-btn', label);
        b.addEventListener('click', () => {
          states[v.id] = SRSEngine.rateCard(states[v.id], v.id, r, level(v));
          save(states);
          if (r === 'again') queue.push(v);
          next();
        });
        return b;
      };

      const good = ask(t('vocab.btn_knew_easy'), 'good');
      rate.append(ask(t('vocab.btn_review_again'), 'again'), good);
      card.append(rate);
      good.focus();
    });
  }

  function start(): void {
    states = load();
    const pool = getFilteredPool();
    queue = SRSEngine.getDueCards(pool, states, getSessionSize());

    // Weakness-First Focus: Prioritize items with recorded lapses or lower ease factors
    if (StorageManager.isWeaknessFirstEnabled()) {
      queue.sort((a, b) => {
        const stateA = states[a.id];
        const stateB = states[b.id];
        const lapsesA = (stateA?.totalLapses || stateA?.lapses || 0);
        const lapsesB = (stateB?.totalLapses || stateB?.lapses || 0);
        if (lapsesA !== lapsesB) {
          return lapsesB - lapsesA; // items with higher lapses first
        }
        const efA = stateA?.easeFactor ?? 2.5;
        const efB = stateB?.easeFactor ?? 2.5;
        return efA - efB; // lower ease factor (harder) first
      });
    }

    next();
  }

  // Bind Switchers
  btnCore.addEventListener('click', () => {
    activeDeckKey = 'core';
    btnCore.classList.add('is-active');
    btnCore.setAttribute('aria-selected', 'true');
    btnIot.classList.remove('is-active');
    btnIot.setAttribute('aria-selected', 'false');
    btnCombined.classList.remove('is-active');
    btnCombined.setAttribute('aria-selected', 'false');
    updateTopicOptions();
    start();
  });

  btnIot.addEventListener('click', () => {
    activeDeckKey = 'iot';
    btnIot.classList.add('is-active');
    btnIot.setAttribute('aria-selected', 'true');
    btnCore.classList.remove('is-active');
    btnCore.setAttribute('aria-selected', 'false');
    btnCombined.classList.remove('is-active');
    btnCombined.setAttribute('aria-selected', 'false');
    updateTopicOptions();
    start();
  });

  btnCombined.addEventListener('click', () => {
    activeDeckKey = 'combined';
    btnCombined.classList.add('is-active');
    btnCombined.setAttribute('aria-selected', 'true');
    btnCore.classList.remove('is-active');
    btnCore.setAttribute('aria-selected', 'false');
    btnIot.classList.remove('is-active');
    btnIot.setAttribute('aria-selected', 'false');
    updateTopicOptions();
    start();
  });

  starTopicBtn.addEventListener('click', () => {
    if (activeTopic === 'all' || activeTopic === 'starred') return;
    StorageManager.toggleStarredVocabTopic(activeTopic);
    updateStarBtnState();
    updateTopicOptions(activeTopic);
    start();
  });

  topicSelect.addEventListener('change', () => {
    activeTopic = topicSelect.value;
    updateStarBtnState();
    start();
  });

  bandSelect.addEventListener('change', () => {
    activeBand = bandSelect.value;
    start();
  });

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    start();
  });

  updateTopicOptions();
  start();

  return () => {
    if (ttsAvailable()) speechSynthesis.cancel();
  };
}
