import readingData from '../data/reading.json';
import { ReadingPassage } from '../types';
import { rawToBand } from '../bands';
import { addAttempt } from '../progress';
import { QuestionForm, renderQuestions, typeBreakdown } from '../questions';
import { SetScore } from '../scoring';
import { bandBadge, countdown, Countdown, esc, fmtTime, h } from '../ui';

const PASSAGES = readingData as ReadingPassage[];

export interface TestResult { raw: number; of: number; band: number; byType: SetScore['byType'] }

/** Runs one or more passages as a single timed test. Used by practice (1 passage, 20 min) and the mock (3 passages, 60 min). */
export function mountReadingTest(root: HTMLElement, passages: ReadingPassage[], minutes: number, mock: boolean, onDone?: (r: TestResult) => void): () => void {
  root.innerHTML = '';
  let timer: Countdown | null = null;
  const bar = h('div', 'ie-testbar');
  const clock = h('span', 'ie-clock');
  const submit = h('button', 'ie-btn ie-btn-primary', 'Submit answers');
  const tabs = h('div', 'ie-tabs');
  bar.append(clock, tabs, submit);
  const panes: HTMLElement[] = [];
  const forms: QuestionForm[] = [];
  let n = 1;
  passages.forEach((p, i) => {
    const pane = h('section', 'ie-split');
    pane.hidden = i > 0;
    const text = h('article', 'ie-passage', `<h2>${esc(p.title)}</h2>` + p.paragraphs.map(x => `<p><b class="ie-plabel">${x.label}</b>${esc(x.text)}</p>`).join(''));
    const form = renderQuestions(p.questions, n);
    n += p.questions.length;
    const qs = h('div', 'ie-qcol');
    qs.append(form.el);
    pane.append(text, qs);
    panes.push(pane);
    forms.push(form);
    const t = h('button', 'ie-tab' + (i === 0 ? ' is-on' : ''), passages.length > 1 ? `Passage ${i + 1}` : 'Passage');
    t.addEventListener('click', () => {
      panes.forEach((x, j) => { x.hidden = j !== i; });
      tabs.querySelectorAll('.ie-tab').forEach((x, j) => x.classList.toggle('is-on', j === i));
    });
    tabs.append(t);
  });
  const result = h('section', 'ie-result');
  result.hidden = true;
  root.append(bar, ...panes, result);

  const finish = (): void => {
    timer?.stop();
    submit.disabled = true;
    const total: SetScore = { raw: 0, of: 0, byType: {}, wrong: [] };
    forms.forEach(f => {
      const s = f.reveal();
      total.raw += s.raw;
      total.of += s.of;
      for (const [t, v] of Object.entries(s.byType)) {
        const c = (total.byType[t] ||= { ok: 0, n: 0 });
        c.ok += v.ok;
        c.n += v.n;
      }
    });
    const band = rawToBand('reading', total.raw, total.of);
    addAttempt({ skill: 'reading', itemId: passages.map(p => p.id).join('+'), band, raw: total.raw, of: total.of, byType: total.byType, mock });
    result.hidden = false;
    result.innerHTML = `${bandBadge(band, 'Reading')}<div><h3>${total.raw}/${total.of} correct</h3><p class="ie-note">Band is scaled to 40 questions. ${total.of < 40 ? 'Short sets give a rough guide only.' : ''}</p><ul class="ie-breakdown">${typeBreakdown(total.byType)}</ul></div>`;
    panes.forEach(x => { x.hidden = false; });
    tabs.hidden = true;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onDone?.({ raw: total.raw, of: total.of, band, byType: total.byType });
  };

  submit.addEventListener('click', finish);
  if (minutes > 0) timer = countdown(minutes * 60, l => { clock.textContent = fmtTime(Math.max(0, l)); clock.classList.toggle('ie-urgent', l <= 120); }, finish);
  else clock.textContent = 'Untimed';
  return () => timer?.stop();
}

export function readingView(root: HTMLElement): () => void {
  let stop = () => {};
  const list = h('div', 'ie-cards');
  root.append(h('h1', 'ie-title', 'Academic Reading'), h('p', 'ie-lead', 'One passage, 20 minutes, 13-14 questions. Same question types as the exam. Submit to see the evidence for every answer.'), list);
  PASSAGES.forEach(p => {
    const words = p.paragraphs.reduce((a, x) => a + x.text.split(/\s+/).length, 0);
    const types = [...new Set(p.questions.map(q => q.type))].length;
    const c = h('button', 'ie-card', `<b>${esc(p.title)}</b><span>${esc(p.topic)}</span><small>${words} words · ${p.questions.length} questions · ${types} types</small>`);
    c.addEventListener('click', () => {
      root.innerHTML = '';
      const back = h('button', 'ie-btn', 'All passages');
      back.addEventListener('click', () => { stop(); root.innerHTML = ''; stop = readingView(root); });
      const host = h('div');
      root.append(back, host);
      stop = mountReadingTest(host, [p], 20, false);
    });
    list.append(c);
  });
  if (!PASSAGES.length) list.append(h('p', 'ie-note', 'No passages loaded yet.'));
  return () => stop();
}
