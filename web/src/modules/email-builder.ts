/**
 * Email tab: business email builder. Pick a scenario, slide between informal, neutral and
 * formal versions of the same email, and build a draft by tapping phrase tiles.
 */

import emailData from '../assets/data/email-builder.json';
import { t } from '../core/i18n';

type Register = 'informal' | 'neutral' | 'formal';

interface Tile { category: string; phrase: string; register: Register }
interface Scenario { id: string; title: string; recipient: string; goal: string; registers: Record<Register, string> }

const REGISTERS: Register[] = ['informal', 'neutral', 'formal'];
const REGISTER_LABEL: Record<Register, string> = { informal: 'Informal', neutral: 'Neutral', formal: 'Formal' };
const CATEGORIES = ['Opening', 'Context', 'The ask', 'Softening', 'Sign-off'];

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const data = emailData as { tiles: Tile[]; scenarios: Scenario[] };

// Kept at module level so the draft and selections survive tab switches within the session.
let scenarioIndex = 0;
let registerIndex = 1;
let draft = '';

export function renderEmailBuilder(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'email-builder';
  const scenario = data.scenarios[scenarioIndex];
  const register = REGISTERS[registerIndex];

  const scenarioButtons = data.scenarios.map((s, i) => `
    <button type="button" class="drill-chip" data-scenario="${i}" aria-pressed="${i === scenarioIndex}">${esc(s.title)}</button>`).join('');

  const tiles = CATEGORIES.map(cat => {
    const items = data.tiles.filter(t => t.category === cat);
    return `<section class="email-tile-group"><h3 class="drill-kicker">${esc(cat)}</h3><div class="email-tiles">${items.map(t => `
      <button type="button" class="email-tile email-tile-${t.register}" data-phrase="${esc(t.phrase)}">${esc(t.phrase)}</button>`).join('')}</div></section>`;
  }).join('');

  root.innerHTML = `
    <p class="drill-note">Goal: ${esc(scenario.goal)} • To: ${esc(scenario.recipient)}</p>
    <div class="drill-chips" role="group" aria-label="Scenario">${scenarioButtons}</div>
    <div class="email-register">
      <label class="drill-kicker" for="email-register-slider">Tone: <span class="drill-mono" data-register-label>${REGISTER_LABEL[register]}</span></label>
      <input type="range" id="email-register-slider" class="email-slider" min="0" max="2" step="1" value="${registerIndex}" aria-valuetext="${REGISTER_LABEL[register]}">
      <div class="email-register-scale drill-mono"><span>Informal</span><span>Neutral</span><span>Formal</span></div>
    </div>
    <pre class="email-sample" data-sample>${esc(scenario.registers[register])}</pre>
    <h3 class="drill-kicker">Phrase tiles</h3>
    ${tiles}
    <label class="drill-kicker" for="email-draft">Your draft</label>
    <textarea id="email-draft" class="email-draft" rows="6" placeholder="${t('email.placeholder', undefined, 'Tap tiles to build your email')}">${esc(draft)}</textarea>
    <div class="drill-actions">
      <button type="button" class="drill-btn drill-btn-ghost" data-clear>${t('email.clear_draft', undefined, 'Clear draft')}</button>
    </div>`;

  root.addEventListener('click', e => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-scenario], [data-phrase], [data-clear]');
    if (!target) return;
    if (target.dataset.scenario !== undefined) {
      scenarioIndex = Number(target.dataset.scenario);
      rerender(root);
      return;
    }
    if (target.dataset.phrase !== undefined) {
      const area = root.querySelector('#email-draft') as HTMLTextAreaElement;
      draft = (draft ? draft.replace(/\s*$/, ' ') : '') + target.dataset.phrase;
      area.value = draft;
      area.focus();
      return;
    }
    draft = '';
    (root.querySelector('#email-draft') as HTMLTextAreaElement).value = '';
  });

  root.addEventListener('input', e => {
    const target = e.target as HTMLElement;
    if (target.id === 'email-draft') {
      draft = (target as HTMLTextAreaElement).value;
    } else if (target.id === 'email-register-slider') {
      // Update in place so the slider keeps focus while dragging.
      registerIndex = Number((target as HTMLInputElement).value);
      const register = REGISTERS[registerIndex];
      (target as HTMLInputElement).setAttribute('aria-valuetext', REGISTER_LABEL[register]);
      (root.querySelector('[data-register-label]') as HTMLElement).textContent = REGISTER_LABEL[register];
      (root.querySelector('[data-sample]') as HTMLElement).textContent = data.scenarios[scenarioIndex].registers[register];
    }
  });

  return root;
}

function rerender(root: HTMLElement): void {
  const parent = root.parentElement;
  const fresh = renderEmailBuilder();
  if (parent) parent.replaceChild(fresh, root);
}
