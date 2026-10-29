import { IeltsQuestion } from './types';
import { SetScore, isCorrect, scoreSet } from './scoring';
import {
  explainMiss,
  isWithinLimit,
  resolveQuestionWordConstraint,
  countWordsAndNumbers
} from './reading-engine';
import { esc, h } from './ui';
import { t } from '../core/i18n';
import { StorageManager } from '../utils/storage';

const TYPE_LABEL_KEYS: Record<string, string> = {
  tfng: 'questions.type_tfng', ynng: 'questions.type_ynng', heading: 'questions.type_heading', match: 'questions.type_match',
  features: 'questions.type_features', complete: 'questions.type_complete', sentence: 'questions.type_sentence', summary: 'questions.type_summary',
  table: 'questions.type_table', mcq: 'questions.type_mcq', short: 'questions.type_short'
};
const TYPE_LABEL: Record<string, string> = {
  tfng: 'True / False / Not Given', ynng: 'Yes / No / Not Given', heading: 'Matching headings', match: 'Matching',
  features: 'Matching features', complete: 'Completion', sentence: 'Sentence completion', summary: 'Summary completion',
  table: 'Table completion', mcq: 'Multiple choice', short: 'Short answer'
};
export const typeLabel = (k: string): string => {
  const key = TYPE_LABEL_KEYS[k];
  return key ? t(key, undefined, TYPE_LABEL[k] || k) : (TYPE_LABEL[k] || k);
};

const keyOf = (opt: string): string => opt.split(/[.)]/)[0].trim();

function control(q: IeltsQuestion, n: number): HTMLElement {
  const wrap = h('div', 'ie-q', `<div class="ie-q-head"><span class="ie-q-n">${n}</span><span class="ie-q-prompt">${esc(q.prompt)}</span></div>`);
  const body = h('div', 'ie-q-body');
  wrap.dataset.qid = q.id;
  if (q.type === 'tfng' || q.type === 'ynng') {
    const choices = q.type === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
    body.classList.add('ie-choices');
    choices.forEach(c => {
      const l = h('label', 'ie-choice', `<input type="radio" name="${q.id}" value="${c}"><span>${c}</span>`);
      body.append(l);
    });
  } else if (q.type === 'mcq') {
    body.classList.add('ie-choices', 'ie-choices-col');
    (q.options || []).forEach(o => {
      const l = h('label', 'ie-choice', `<input type="radio" name="${q.id}" value="${esc(keyOf(o))}"><span>${esc(o)}</span>`);
      body.append(l);
    });
  } else if (q.type === 'heading' || q.type === 'match' || q.type === 'features') {
    const sel = h('select', 'ie-select');
    sel.name = q.id;
    sel.setAttribute('aria-label', `Answer for question ${n}`);
    sel.innerHTML = `<option value="">${t('questions.choose', undefined, 'Choose…')}</option>` + (q.options || []).map(o => `<option value="${esc(keyOf(o))}">${esc(o)}</option>`).join('');
    body.append(sel);
  } else {
    const inp = h('input', 'ie-input');
    inp.type = 'text';
    inp.name = q.id;
    inp.autocomplete = 'off';
    inp.setAttribute('aria-label', `Answer for question ${n}`);
    const constraint = resolveQuestionWordConstraint(q);
    const limitMatch = q.prompt.match(/(ONE WORD ONLY|NO MORE THAN (?:TWO|THREE) WORDS(?:\s+AND\/OR A NUMBER)?)/i);
    inp.placeholder = limitMatch
      ? limitMatch[1]
      : (constraint ? t('questions.write_no_more_than', { count: constraint.maxWords }, `Write no more than ${constraint.maxWords} word${constraint.maxWords === 1 ? '' : 's'}`) : t('questions.write_no_more_than_three', undefined, 'Write no more than three words'));
    body.append(inp);

    if (constraint && constraint.maxWords != null) {
      const formatMeter = (words: number, within: boolean): string => {
        if (constraint.maxWords === 0) {
          return within ? t('questions.meter_number_only', undefined, 'Number only') : t('questions.meter_no_words', undefined, 'Words not allowed (Number only!)');
        }
        return within
          ? t('questions.meter_words', { words, max: constraint.maxWords }, `${words}/${constraint.maxWords} words`)
          : t('questions.meter_exceeds', { words, max: constraint.maxWords }, `${words}/${constraint.maxWords} words (Exceeds limit!)`);
      };
      const meter = h('span', 'ie-word-meter', formatMeter(0, true));
      const updateMeter = () => {
        const { words } = countWordsAndNumbers(inp.value);
        const within = isWithinLimit(inp.value, constraint.maxWords, constraint.allowNumber);
        meter.textContent = formatMeter(words, within);
        meter.classList.toggle('is-exceeded', !within);
      };
      inp.addEventListener('input', updateMeter);
      body.append(meter);
    }
  }
  wrap.append(body);

  const isDeepStudy = StorageManager.getStudyMode() === 'deep-study';
  const studyActionRow = h('div', 'ie-study-action-row');
  studyActionRow.style.display = isDeepStudy ? 'flex' : 'none';
  studyActionRow.style.marginTop = '6px';
  studyActionRow.innerHTML = `<button type="button" class="ie-btn ie-btn-sm ie-btn-check-single" style="font-size: 12px; min-height: 32px; padding: 4px 10px; border-radius: 8px;">💡 ${t('questions.check_instant', undefined, 'Check & Evidence')}</button>`;

  const checkBtn = studyActionRow.querySelector('.ie-btn-check-single');
  checkBtn?.addEventListener('click', () => {
    const radio = wrap.querySelector<HTMLInputElement>(`input[name="${q.id}"]:checked`);
    const field = wrap.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${q.id}"]:not([type="radio"])`);
    const val = radio ? radio.value : (field ? field.value : '');
    const whyBox = wrap.querySelector('.ie-why') || wrap.appendChild(h('div', 'ie-why'));
    if (!val.trim()) {
      whyBox.innerHTML = `<span style="color: var(--accent-gold); font-weight: 600;">⚠️ ${t('questions.answer_first', undefined, 'Please choose or enter an answer first.')}</span>`;
      return;
    }
    const ok = isCorrect(q, val);
    wrap.classList.remove('ie-right', 'ie-wrong');
    wrap.classList.add(ok ? 'ie-right' : 'ie-wrong');
    const ans = Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer;
    let extraHtml = '';
    if (!ok) {
      const miss = explainMiss(q, val || '');
      if (miss === 'exceeded_limit') {
        const limit = q.maxWords ?? resolveQuestionWordConstraint(q)?.maxWords ?? 3;
        extraHtml += `<div class="ie-miss-warning">${t('questions.exceeded_limit_warning', { limit }, `Contains correct terms but exceeded word limit (${limit} words max) — automatic zero in IELTS.`)}</div>`;
      }
    }
    if (q.evidence !== undefined) {
      if (q.evidence === null) {
        extraHtml += `<div class="ie-evidence-action"><span class="ie-evidence-silent">${t('questions.no_evidence_not_given', undefined, 'No evidence in passage (NOT GIVEN)')}</span></div>`;
      } else {
        extraHtml += `<div class="ie-evidence-action"><button type="button" class="ie-btn ie-btn-inspect-evidence" data-qid="${q.id}">${t('questions.inspect_in_passage', undefined, '🔍 Inspect in passage')}</button></div>`;
      }
    }
    const blankText = t('questions.blank', undefined, '(blank)');
    const correctText = t('questions.correct', undefined, 'Correct');
    const ansDetail = t('questions.your_ans_correct', { given: esc(val || blankText), ans: esc(ans) }, `Your answer: ${esc(val || blankText)} · Correct: ${esc(ans)}`);
    whyBox.innerHTML = `<strong>${ok ? correctText : ansDetail}</strong><span>${esc(q.why)}</span>${extraHtml}`;
  });
  wrap.append(studyActionRow);

  return wrap;
}

export interface QuestionForm {
  el: HTMLElement;
  answers(): Record<string, string>;
  /** Locks the inputs and marks each question right/wrong with the evidence line. Returns the score. */
  reveal(): SetScore;
}

/** Renders questions grouped by type (IELTS order). `startAt` continues numbering across passages/sections. */
export function renderQuestions(
  questions: IeltsQuestion[],
  startAt = 1,
  onChange: (answered: number, total: number) => void = () => { }
): QuestionForm {
  const el = h('div', 'ie-questions');
  let n = startAt;
  let lastType = '';
  const lastOptions: { list?: string[] } = {};

  const countAnswered = (): number => {
    let count = 0;
    for (const q of questions) {
      const radio = el.querySelector<HTMLInputElement>(`input[name="${q.id}"]:checked`);
      if (radio && radio.value.trim().length > 0) {
        count++;
        continue;
      }
      const field = el.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${q.id}"]:not([type="radio"])`);
      if (field && field.value.trim().length > 0) {
        count++;
      }
    }
    return count;
  };

  const handleUpdate = () => {
    onChange(countAnswered(), questions.length);
  };

  for (const q of questions) {
    if (q.type !== lastType) {
      el.append(h('h3', 'ie-q-group', typeLabel(q.type)));
      lastType = q.type;
      lastOptions.list = undefined;
    }
    if ((q.type === 'heading' || q.type === 'match' || q.type === 'features') && q.options && q.options.join('|') !== (lastOptions.list || []).join('|')) {
      el.append(h('ul', 'ie-q-list', q.options.map(o => `<li>${esc(o)}</li>`).join('')));
      lastOptions.list = q.options;
    }
    el.append(control(q, n++));
  }

  el.addEventListener('input', handleUpdate);
  el.addEventListener('change', handleUpdate);

  const onModeChange = (e: any) => {
    if (!el.isConnected) {
      window.removeEventListener('study-mode-change', onModeChange);
      return;
    }
    const isDeep = e.detail?.mode === 'deep-study';
    el.querySelectorAll<HTMLElement>('.ie-study-action-row').forEach(row => {
      row.style.display = isDeep ? 'flex' : 'none';
    });
  };
  window.addEventListener('study-mode-change', onModeChange);

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

      let extraHtml = '';
      if (!ok) {
        const miss = explainMiss(q, given[q.id] || '');
        if (miss === 'exceeded_limit') {
          const limit = q.maxWords ?? resolveQuestionWordConstraint(q)?.maxWords ?? 3;
          extraHtml += `<div class="ie-miss-warning">${t('questions.exceeded_limit_warning', { limit }, `Contains correct terms but exceeded word limit (${limit} words max) — automatic zero in IELTS.`)}</div>`;
        }
      }

      if (q.evidence !== undefined) {
        if (q.evidence === null) {
          extraHtml += `<div class="ie-evidence-action"><span class="ie-evidence-silent">${t('questions.no_evidence_not_given', undefined, 'No evidence in passage (NOT GIVEN)')}</span></div>`;
        } else {
          extraHtml += `<div class="ie-evidence-action"><button type="button" class="ie-btn ie-btn-inspect-evidence" data-qid="${q.id}">${t('questions.inspect_in_passage', undefined, '🔍 Inspect in passage')}</button></div>`;
        }
      }

      const blankText = t('questions.blank', undefined, '(blank)');
      const correctText = t('questions.correct', undefined, 'Correct');
      const ansDetail = t('questions.your_ans_correct', { given: esc(given[q.id] || blankText), ans: esc(ans) }, `Your answer: ${esc(given[q.id] || blankText)} · Correct: ${esc(ans)}`);
      box.append(h('div', 'ie-why', `<strong>${ok ? correctText : ansDetail}</strong><span>${esc(q.why)}</span>${extraHtml}`));
    }
    return scoreSet(questions, given);
  };
  return { el, answers, reveal };
}

export function typeBreakdown(byType: SetScore['byType']): string {
  return Object.entries(byType).map(([t, v]) => `<li><span>${typeLabel(t)}</span><b>${v.ok}/${v.n}</b></li>`).join('');
}
