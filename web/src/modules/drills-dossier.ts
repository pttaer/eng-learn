import { t } from '../core/i18n';
/**
 * Drills route: 36 Cambridge-style practice sets, a phonemic chart (Sounds) and a
 * business email builder (Email). Sets run in-place: answer, check, read the why.
 */

import { DrillItem, DrillResponse, DrillSet, DrillSetFile, DrillSkill, isItemCorrect, scoreSet, speakText } from '../core/exercise-engine';
import { renderSoundsPanel } from './sounds-chart';
import { renderEmailBuilder } from './email-builder';
import drillData from '../assets/data/drill-sets.json';

type Tab = 'drills' | 'sounds' | 'email';

const TABS: { id: Tab; label: string }[] = [
  { id: 'drills', label: 'Drills' },
  { id: 'sounds', label: 'Sounds' },
  { id: 'email', label: 'Email' },
];

const SKILLS: { id: DrillSkill | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'listening', label: 'Listening' },
  { id: 'pronunciation', label: 'Pronunciation' },
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
];

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/** Answer text shown after checking. */
function answerText(item: DrillItem): string {
  switch (item.type) {
    case 'choice': return item.options[item.answer];
    case 'stress': return item.options[item.answer];
    case 'gap': return item.answers[0];
    case 'truefalse': return item.answer ? 'True' : 'False';
    case 'match': return item.pairs.map(p => `${p.left} → ${p.right}`).join('; ');
  }
}

export class DrillsDossier {
  private readonly root = document.createElement('div');
  private readonly sets = (drillData as unknown as DrillSetFile).sets;
  private tab: Tab = 'drills';
  private skill: DrillSkill | 'all' = 'all';
  private active: DrillSet | null = null;
  private responses: Record<string, DrillResponse> = {};
  private checked = false;
  private playingId: string | null = null;
  private playToken = 0;

  constructor() {
    this.root.className = 'dossier-workspace drills-dossier';
    // Delegated listeners live on the root, which persists across draws.
    this.root.addEventListener('click', e => this.onClick(e));
    this.root.addEventListener('change', e => this.onChange(e));
    this.root.addEventListener('input', e => this.onInput(e));
  }

  public render(): HTMLElement {
    this.draw();
    return this.root;
  }

  public teardown(): void {
    this.stopPlayback();
  }

  private draw(): void {
    this.root.innerHTML = `
      <header class="drills-head">
        <span class="drill-kicker">${t('drills.head_kicker', undefined, 'DRILLS')}</span>
        <h2 class="drills-title">${t('drills.head_title', undefined, 'Practice sets')}</h2>
      </header>
      <div class="drills-tabs" role="tablist">${TABS.map(t => `
        <button type="button" role="tab" class="drill-tab" data-action="tab" data-value="${t.id}" aria-selected="${t.id === this.tab}">${t.label}</button>`).join('')}
      </div>
      <section class="drills-panel" role="tabpanel"></section>`;
    const panel = this.root.querySelector('.drills-panel') as HTMLElement;
    if (this.tab === 'drills') this.renderDrills(panel);
    else if (this.tab === 'sounds') panel.appendChild(renderSoundsPanel());
    else panel.appendChild(renderEmailBuilder());
  }

  private renderDrills(panel: HTMLElement): void {
    if (this.active) {
      panel.innerHTML = this.runnerHtml(this.active);
      return;
    }
    const chips = SKILLS.map(s => `
      <button type="button" class="drill-chip" data-action="skill" data-value="${s.id}" aria-pressed="${this.skill === s.id}">${s.label}</button>`).join('');
    const list = this.sets.filter(s => this.skill === 'all' || s.skill === this.skill);
    const cards = list.map(s => `
      <article class="drill-card">
        <div class="drill-card-meta"><span class="drill-kicker">${esc(s.skill)}</span><span class="drill-mono">${s.cefrLevel}</span><span class="drill-mono">${s.minutes} min</span></div>
        <h3 class="drill-card-title">${esc(s.title)}</h3>
        <p class="drill-card-objective">${esc(s.objective)}</p>
        <button type="button" class="drill-btn" data-action="open" data-value="${s.id}">${t('drills.start_btn', undefined, 'Start')}</button>
      </article>`).join('');
    panel.innerHTML = `
      <div class="drill-chips" role="group" aria-label="Skill">${chips}</div>
      <p class="drill-note">${list.length} ${t('drills.sets_count', undefined, 'sets')}</p>
      <div class="drill-list">${cards}</div>`;
  }

  private runnerHtml(set: DrillSet): string {
    const hasAudio = set.items.some(i => i.speak);
    const score = this.checked ? scoreSet(set, this.responses) : null;
    const passage = set.passage ? `<div class="drill-passage">${esc(set.passage)}</div>` : '';
    const listen = hasAudio
      ? `<button type="button" class="drill-btn drill-btn-ghost" data-action="listen-all">${this.playingId ? t('drills.stop', undefined, 'Stop') : t('drills.listen_along', undefined, 'Listen along')}</button>`
      : '';
    const footer = score
      ? `<div class="drill-score" aria-live="polite"><span class="drill-mono">${score.correct} / ${score.total}</span> correct</div>
         <button type="button" class="drill-btn" data-action="reset">${t('drills.try_again', undefined, 'Try again')}</button>`
      : `<button type="button" class="drill-btn" data-action="check">${t('drills.check_answers', undefined, 'Check answers')}</button>`;
    return `
      <div class="drill-runner-head">
        <button type="button" class="drill-btn drill-btn-ghost" data-action="back">${t('drills.all_sets', undefined, 'All sets')}</button>
        <span class="drill-mono">${set.cefrLevel} • ${set.minutes} min</span>
      </div>
      <h3 class="drill-card-title">${esc(set.title)}</h3>
      <p class="drill-card-objective">${esc(set.objective)}</p>
      ${passage}
      <div class="drill-items">${set.items.map((item, n) => this.itemHtml(item, n)).join('')}</div>
      <div class="drill-actions">${listen}${footer}</div>`;
  }

  private itemHtml(item: DrillItem, n: number): string {
    const resp = this.responses[item.id];
    const status = this.checked ? (isItemCorrect(item, resp) ? 'is-right' : 'is-wrong') : '';
    const playing = this.playingId === item.id ? 'is-playing' : '';
    const disabled = this.checked ? 'disabled' : '';
    const play = item.speak
      ? `<button type="button" class="drill-btn drill-btn-ghost" data-action="play" data-item="${item.id}" aria-label="Play item ${n + 1}">${t('drills.play_btn', undefined, 'Play ▶')}</button>`
      : '';
    let body = '';
    switch (item.type) {
      case 'choice':
        body = `<p class="drill-prompt">${esc(item.prompt)}</p>${this.optionsHtml(item.id, item.options, resp, disabled, '')}`;
        break;
      case 'stress':
        body = `<p class="drill-prompt">Stress pattern for <strong class="drill-mono">${esc(item.word)}</strong></p>${this.optionsHtml(item.id, item.options, resp, disabled, 'drill-mono')}`;
        break;
      case 'gap': {
        const value = typeof resp === 'string' ? esc(resp) : '';
        const field = `<input type="text" class="drill-gap" data-gap="${item.id}" value="${value}" aria-label="Answer for item ${n + 1}" autocomplete="off" autocapitalize="off" spellcheck="false" ${disabled}>`;
        body = `<p class="drill-prompt">${esc(item.prompt).replace('___', field)}</p>`;
        break;
      }
      case 'truefalse':
        body = `<p class="drill-prompt">${esc(item.statement)}</p>
          <div class="drill-options">${[true, false].map(v => `
            <button type="button" class="drill-option ${resp === v ? 'is-selected' : ''}" data-action="tf" data-item="${item.id}" data-value="${v}" aria-pressed="${resp === v}" ${disabled}>${v ? 'True' : 'False'}</button>`).join('')}
          </div>`;
        break;
      case 'match': {
        const rights = item.pairs.map(p => p.right);
        const shown = [...rights.slice(1), rights[0]];
        const chosen = Array.isArray(resp) ? resp : [];
        body = `<p class="drill-prompt">Match each item to its partner</p>` + item.pairs.map((p, i) => `
          <div class="drill-pair">
            <span class="drill-pair-left">${esc(p.left)}</span>
            <select class="drill-select" data-match="${item.id}" data-pair="${i}" aria-label="Match for ${esc(p.left)}" ${disabled}>
              <option value="">Choose…</option>
              ${shown.map(r => `<option value="${esc(r)}" ${chosen[i] === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
            </select>
          </div>`).join('');
        break;
      }
    }
    const feedback = this.checked
      ? `<p class="drill-answer">Answer: ${esc(answerText(item))}</p><p class="drill-why">${esc(item.why)}</p>`
      : '';
    return `
      <div class="drill-item ${status} ${playing}" data-item-card="${item.id}">
        <div class="drill-item-head"><span class="drill-mono">${n + 1}</span>${play}</div>
        ${body}
        ${feedback}
      </div>`;
  }

  private optionsHtml(itemId: string, options: string[], resp: DrillResponse, disabled: string, extraClass: string): string {
    return `<div class="drill-options">${options.map((opt, i) => `
      <button type="button" class="drill-option ${extraClass} ${resp === i ? 'is-selected' : ''}" data-action="pick" data-item="${itemId}" data-value="${i}" aria-pressed="${resp === i}" ${disabled}>${esc(opt)}</button>`).join('')}
    </div>`;
  }

  private onClick(e: Event): void {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!el || !this.root.contains(el)) return;
    const action = el.dataset.action;
    const value = el.dataset.value ?? '';
    const itemId = el.dataset.item ?? '';

    switch (action) {
      case 'tab':
        this.tab = value as Tab;
        this.stopPlayback();
        break;
      case 'skill':
        this.skill = value as DrillSkill | 'all';
        break;
      case 'open':
        this.active = this.sets.find(s => s.id === value) ?? null;
        this.responses = {};
        this.checked = false;
        this.stopPlayback();
        break;
      case 'back':
        this.active = null;
        this.stopPlayback();
        break;
      case 'pick':
        if (!this.checked) this.responses[itemId] = Number(value);
        break;
      case 'tf':
        if (!this.checked) this.responses[itemId] = value === 'true';
        break;
      case 'check':
        this.checked = true;
        this.stopPlayback();
        break;
      case 'reset':
        this.responses = {};
        this.checked = false;
        break;
      case 'play': {
        const item = this.active?.items.find(i => i.id === itemId);
        if (item?.speak) {
          this.stopPlayback();
          speakText(item.speak, item.accent);
        }
        break;
      }
      case 'listen-all':
        if (this.playingId) this.stopPlayback();
        else this.playAll();
        break;
      default:
        return;
    }
    this.draw();
  }

  private onChange(e: Event): void {
    const el = e.target as HTMLSelectElement;
    if (!el.dataset.match || this.checked) return;
    const itemId = el.dataset.match;
    const pair = Number(el.dataset.pair);
    const current = Array.isArray(this.responses[itemId]) ? (this.responses[itemId] as string[]) : [];
    const next = [...current];
    next[pair] = el.value;
    this.responses[itemId] = next;
  }

  private onInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    if (el.dataset.gap && !this.checked) this.responses[el.dataset.gap] = el.value;
  }

  /** Speak each item with speak text in turn, marking the active item. */
  private playAll(): void {
    if (!this.active) return;
    const items = this.active.items.filter(i => i.speak);
    if (!items.length) return;
    const token = ++this.playToken;
    const step = (k: number): void => {
      if (token !== this.playToken) return;
      if (k >= items.length) {
        this.playingId = null;
        this.draw();
        return;
      }
      const item = items[k];
      this.playingId = item.id;
      this.draw();
      this.root.querySelector(`[data-item-card="${item.id}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      speakText(item.speak as string, item.accent, () => step(k + 1));
    };
    step(0);
  }

  private stopPlayback(): void {
    this.playToken++;
    this.playingId = null;
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // Speech API unavailable: nothing to stop.
    }
  }
}
