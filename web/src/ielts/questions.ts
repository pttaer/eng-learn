import { IeltsQuestion } from './types';
import { SetScore, isCorrect, scoreSet } from './scoring';
import { esc, h } from './ui';

const TYPE_LABEL: Record<string, string> = {
  tfng: 'True / False / Not Given', ynng: 'Yes / No / Not Given', heading: 'Matching headings', match: 'Matching',
  complete: 'Completion', mcq: 'Multiple choice', short: 'Short answer'
};
export const typeLabel = (t: string): string => TYPE_LABEL[t] || t;

const keyOf = (opt: string): string => opt.split(/[.)]/)[0].trim();

function control(q: IeltsQuestion, n: number, onChange: () => void): HTMLElement {
  const wrap = h('div', 'ie-q', `<div class="ie-q-head"><span class="ie-q-n">${n}</span><span class="ie-q-prompt">${esc(q.prompt)}</span></div>`);
  const body = h('div', 'ie-q-body');
  wrap.dataset.qid = q.id;
  if (q.type === 'tfng' || q.type === 'ynng') {
    const choices = q.type === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
    body.classList.add('ie-choices');
    choices.forEach(c => {
      const l = h('label', 'ie-choice', `<input type="radio" name="${q.id}" value="${c}"><span>${c}</span>`);
      l.querySelector('input')!.addEventListener('change', onChange);
      body.append(l);
    });
  } else if (q.type === 'mcq') {
    body.classList.add('ie-choices', 'ie-choices-col');
    (q.options || []).forEach(o => {
      const l = h('label', 'ie-choice', `<input type="radio" name="${q.id}" value="${esc(keyOf(o))}"><span>${esc(o)}</span>`);
      l.querySelector('input')!.addEventListener('change', onChange);
      body.append(l);
    });
  } else if (q.type === 'heading' || q.type === 'match') {
    const sel = h('select', 'ie-select');
    sel.name = q.id;
    sel.setAttribute('aria-label', `Answer for question ${n}`);
    sel.innerHTML = `<option value="">Choose…</option>` + (q.options || []).map(o => `<option value="${esc(keyOf(o))}">${esc(o)}</option>`).join('');
    sel.addEventListener('change', onChange);
    body.append(sel);
  } else {
    const inp = h('input', 'ie-input');
    inp.type = 'text';
    inp.name = q.id;
    inp.autocomplete = 'off';
    inp.setAttribute('aria-label', `Answer for question ${n}`);
    inp.placeholder = 'Write no more than three words';
    inp.addEventListener('input', onChange);
    body.append(inp);
  }
  wrap.append(body);
  return wrap;
}

export interface QuestionForm {
  el: HTMLElement;
  answers(): Record<string, string>;
  /** Locks the inputs and marks each question right/wrong with the evidence line. Returns the score. */
  reveal(): SetScore;
}

/** Renders questions grouped by type (IELTS order). `startAt` continues numbering across passages/sections. */
export function renderQuestions(questions: IeltsQuestion[], startAt = 1, onChange: () => void = () => {}): QuestionForm {
  const el = h('div', 'ie-questions');
  let n = startAt;
  let lastType = '';
  const lastOptions: { list?: string[] } = {};
  for (const q of questions) {
    if (q.type !== lastType) {
      el.append(h('h3', 'ie-q-group', typeLabel(q.type)));
      lastType = q.type;
      lastOptions.list = undefined;
    }
    if ((q.type === 'heading' || q.type === 'match') && q.options && q.options.join('|') !== (lastOptions.list || []).join('|')) {
      el.append(h('ul', 'ie-q-list', q.options.map(o => `<li>${esc(o)}</li>`).join('')));
      lastOptions.list = q.options;
    }
    el.append(control(q, n++, onChange));
  }
  const answers = (): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const q of questions) {
      const radio = el.querySelector<HTMLInputElement>(`input[name="${q.id}"]:checked`);
      const field = el.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${q.id}"]:not([type="radio"])`);
      out[q.id] = radio ? radio.value : field ? field.value : '';
    }
    return out;
  };
  const reveal = (): SetScore => {
    const given = answers();
    el.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select').forEach(i => { i.disabled = true; });
    for (const q of questions) {
      const box = el.querySelector<HTMLElement>(`[data-qid="${q.id}"]`)!;
      const ok = isCorrect(q, given[q.id]);
      box.classList.add(ok ? 'ie-right' : 'ie-wrong');
      const ans = Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer;
      box.append(h('div', 'ie-why', `<strong>${ok ? 'Correct' : `Your answer: ${esc(given[q.id] || '(blank)')} · Correct: ${esc(ans)}`}</strong><span>${esc(q.why)}</span>`));
    }
    return scoreSet(questions, given);
  };
  return { el, answers, reveal };
}

export function typeBreakdown(byType: SetScore['byType']): string {
  return Object.entries(byType).map(([t, v]) => `<li><span>${typeLabel(t)}</span><b>${v.ok}/${v.n}</b></li>`).join('');
}
