import vocabData from '../data/vocab.json';
import { SRSEngine, SRSCardState, SRSRating } from '../../core/srs-engine';
import { ttsAvailable } from '../tts';
import { esc, h } from '../ui';

interface VocabItem {
  id: string; topic: string; word: string; pos: string; band: number; use: string[];
  definition: string; collocations: string[]; paraphrases: string[]; example: string;
}

// Own storage key: the CEFR app's card states (STARK_ENG_STATE) are never touched.
const KEY = 'IELTS_VOCAB_SRS';
const DECK = vocabData as VocabItem[];
const TOPICS = [...new Set(DECK.map(v => v.topic))];
const SESSION = 20;
// 'All topics' interleaves topics (item 1 of each, then item 2...) so new words are not one topic at a time.
const MIXED = [...DECK].sort((a, b) => +a.id.slice(4) - +b.id.slice(4));

function load(): Record<string, SRSCardState> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; }
}
function save(s: Record<string, SRSCardState>): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full or blocked */ }
}
// Band 7.5+ items start with the engine's harder ease factor.
const level = (v: VocabItem): number => (v.band >= 7.5 ? 3 : 1);

export function vocabView(root: HTMLElement): () => void {
  let states = load();
  let topic = 'all';
  let queue: VocabItem[] = [];

  root.append(h('h1', 'ie-title', 'Topic vocabulary'), h('p', 'ie-lead', `${DECK.length} band 6.5-8 words across ${TOPICS.length} Academic topics, with collocations and the paraphrases that Reading and Listening answers hide behind. Reviews are spaced: words you know come back later, words you miss come back tomorrow.`));
  const bar = h('div', 'ie-testbar');
  const select = h('select', 'ie-select ie-vselect');
  select.setAttribute('aria-label', 'Topic');
  select.innerHTML = `<option value="all">All topics</option>${TOPICS.map(t => `<option value="${t}">${t[0].toUpperCase() + t.slice(1)}</option>`).join('')}`;
  const stats = h('span', 'ie-note ie-vstats');
  stats.setAttribute('aria-live', 'polite');
  bar.append(select, stats);
  const stage = h('div', 'ie-vstage');
  root.append(bar, stage);

  const pool = (): VocabItem[] => (topic === 'all' ? MIXED : DECK.filter(v => v.topic === topic));
  const showStats = (): void => {
    const p = pool(), now = Date.now();
    const seen = p.filter(v => states[v.id]);
    const due = seen.filter(v => states[v.id].dueDate <= now).length;
    stats.textContent = `${due} due · ${p.length - seen.length} new · ${seen.length - due} scheduled`;
  };

  function next(): void {
    showStats();
    stage.innerHTML = '';
    const v = queue.shift();
    if (!v) {
      const done = h('div', 'ie-vcard', '<b>Session complete.</b><p class="ie-note">Come back later for due reviews, or start another round of new words.</p>');
      const more = h('button', 'ie-btn ie-btn-primary', 'Another round');
      more.addEventListener('click', start);
      done.append(more);
      stage.append(done);
      return;
    }
    const card = h('article', 'ie-vcard');
    const tags = `<span class="ie-vtags">${esc(v.pos)} · band ${v.band.toFixed(1)} · ${v.use.map(esc).join(', ')} · ${esc(v.topic)}</span>`;
    card.innerHTML = `${tags}<h2 class="ie-vword">${esc(v.word)}</h2><p class="ie-note">Say what it means and use it in a sentence, then reveal.</p>`;
    const actions = h('div', 'ie-vactions');
    if (ttsAvailable()) {
      const say = h('button', 'ie-btn', 'Listen');
      say.addEventListener('click', () => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(v.word); u.lang = 'en-GB'; speechSynthesis.speak(u); });
      actions.append(say);
    }
    const reveal = h('button', 'ie-btn ie-btn-primary', 'Reveal');
    actions.append(reveal);
    card.append(actions);
    stage.append(card);
    reveal.focus();
    reveal.addEventListener('click', () => {
      card.querySelector('.ie-note')!.remove();
      actions.remove();
      card.append(h('div', 'ie-vback', `<p>${esc(v.definition)}</p><p class="ie-vex">${esc(v.example)}</p><dl><dt>Collocations</dt><dd>${v.collocations.map(esc).join(' · ')}</dd><dt>Paraphrases</dt><dd>${v.paraphrases.map(esc).join(' · ')}</dd></dl>`));
      const rate = h('div', 'ie-vactions');
      const ask = (label: string, r: SRSRating): HTMLButtonElement => {
        const b = h('button', r === 'good' ? 'ie-btn ie-btn-primary' : 'ie-btn', label);
        b.addEventListener('click', () => {
          states[v.id] = SRSEngine.rateCard(states[v.id], v.id, r, level(v));
          save(states);
          if (r === 'again') queue.push(v); // see it again before the session ends
          next();
        });
        return b;
      };
      const good = ask('I knew it', 'good');
      rate.append(ask('Again', 'again'), good);
      card.append(rate);
      good.focus();
    });
  }

  function start(): void {
    states = load();
    queue = SRSEngine.getDueCards(pool(), states, SESSION);
    next();
  }

  select.addEventListener('change', () => { topic = select.value; start(); });
  start();
  return () => { if (ttsAvailable()) speechSynthesis.cancel(); };
}
