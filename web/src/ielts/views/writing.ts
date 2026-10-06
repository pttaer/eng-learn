import w1Data from '../data/writing1.json';
import w2Data from '../data/writing2.json';
import { Task1Prompt, Task2Prompt } from '../types';
import { addAttempt } from '../progress';
import { renderChart } from '../chart';
import { DESCRIPTORS, RUBRIC, analyse, estimateBand } from '../writing-heuristics';
import { bandBadge, countdown, Countdown, esc, fmtTime, h } from '../ui';

const T1 = w1Data as Task1Prompt[];
const T2 = w2Data as Task2Prompt[];

function mountEditor(root: HTMLElement, task: 1 | 2, p: Task1Prompt | Task2Prompt, back: () => void): () => void {
  const minutes = task === 1 ? 20 : 40;
  const min = task === 1 ? 150 : 250;
  root.innerHTML = '';
  const backBtn = h('button', 'ie-btn', 'All prompts');
  backBtn.addEventListener('click', back);
  const head = h('div', 'ie-testbar');
  const clock = h('span', 'ie-clock');
  const count = h('span', 'ie-count');
  const submit = h('button', 'ie-btn ie-btn-primary', 'Submit for feedback');
  head.append(clock, count, submit);
  const brief = h('article', 'ie-passage', `<h2>Writing Task ${task}</h2><p>${esc(p.prompt)}</p>` + (task === 1 ? renderChart((p as Task1Prompt).chart) : '') + `<p class="ie-note">Write at least ${min} words. Suggested time: ${minutes} minutes.</p>`);
  const area = h('textarea', 'ie-textarea');
  area.setAttribute('aria-label', `Your Task ${task} answer`);
  area.placeholder = 'Type your answer here. Leave a blank line between paragraphs.';
  const editor = h('div', 'ie-qcol');
  editor.append(area);
  const split = h('section', 'ie-split');
  split.append(brief, editor);
  const out = h('section', 'ie-result ie-feedback');
  out.hidden = true;
  root.append(backBtn, head, split, out);

  const wc = (): number => (area.value.trim() ? area.value.trim().split(/\s+/).length : 0);
  area.addEventListener('input', () => {
    const w = wc();
    count.textContent = `${w} / ${min} words`;
    count.classList.toggle('ie-urgent', w > 0 && w < min);
  });
  count.textContent = `0 / ${min} words`;

  let timer: Countdown | null = countdown(minutes * 60, l => { clock.textContent = l >= 0 ? fmtTime(l) : `+${fmtTime(-l)}`; }, () => { clock.classList.add('ie-urgent'); });

  submit.addEventListener('click', () => {
    timer?.stop();
    timer = null;
    submit.disabled = true;
    area.readOnly = true;
    const r = analyse(area.value, task);
    const crit = task === 1 ? RUBRIC.task1 : RUBRIC.task2;
    const flags = r.flags.length ? r.flags.map(f => `<li>${esc(f)}</li>`).join('') : '<li>No automatic flags. Check accuracy and development yourself.</li>';
    const rate = crit.map((c, i) => `<label class="ie-rate"><span>${c}</span><select data-i="${i}">${[5, 5.5, 6, 6.5, 7, 7.5, 8].map(b => `<option value="${b}"${b === 6 ? ' selected' : ''}>${b.toFixed(1)}</option>`).join('')}</select></label>`).join('');
    out.hidden = false;
    out.innerHTML = `<div class="ie-feedback-col">
      <h3>Automatic checks</h3>
      <ul class="ie-stats"><li><b>${r.words}</b> words</li><li><b>${r.paragraphs}</b> paragraphs</li><li><b>${r.sentences}</b> sentences</li><li><b>${r.linkers.length}</b> linkers</li><li><b>${r.complexSentences}</b> complex</li><li><b>${r.lexicalDiversity}</b> diversity</li></ul>
      <ul class="ie-flags">${flags}</ul>
      <p class="ie-note">These checks count features. They cannot judge accuracy, relevance or ideas.</p>
    </div>
    <div class="ie-feedback-col">
      <h3>Rate yourself against the model</h3>
      <p class="ie-note">Read the model and notes, then rate each criterion honestly. 7 = ${esc(DESCRIPTORS[7])}</p>
      ${rate}
      <div class="ie-estimate"></div>
      <button class="ie-btn ie-btn-primary ie-save">Save estimate</button>
    </div>
    <div class="ie-feedback-wide"><h3>Band 7+ model answer</h3>${p.model.split(/\n\s*\n/).map(x => `<p>${esc(x)}</p>`).join('')}<h3>What makes it band 7</h3><p>${esc(p.notes)}</p></div>`;
    const estEl = out.querySelector('.ie-estimate') as HTMLElement;
    const ratings = (): number[] => [...out.querySelectorAll<HTMLSelectElement>('select[data-i]')].map(s => Number(s.value));
    const update = (): number => { const b = estimateBand(ratings(), r.words, task); estEl.innerHTML = bandBadge(b, 'Estimate'); return b; };
    out.querySelectorAll('select[data-i]').forEach(s => s.addEventListener('change', update));
    update();
    out.querySelector('.ie-save')!.addEventListener('click', e => {
      addAttempt({ skill: 'writing', itemId: p.id, band: update(), raw: r.words, estimate: true });
      (e.target as HTMLButtonElement).disabled = true;
      (e.target as HTMLButtonElement).textContent = 'Saved';
    });
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  return () => timer?.stop();
}

export function writingView(root: HTMLElement): () => void {
  let stop = () => {};
  const render = (): void => {
    stop();
    root.innerHTML = '';
    root.append(h('h1', 'ie-title', 'Academic Writing'), h('p', 'ie-lead', 'Task 1: describe the visual in 150+ words (20 min). Task 2: write a 250+ word essay (40 min). Feedback is automatic checks plus your own rubric rating. The band is an estimate, never a score.'));
    for (const [task, list] of [[1, T1], [2, T2]] as const) {
      root.append(h('h2', 'ie-sub', `Task ${task}`));
      const cards = h('div', 'ie-cards');
      list.forEach(p => {
        const label = task === 1 ? (p as Task1Prompt).chart.title : (p as Task2Prompt).essayType;
        const c = h('button', 'ie-card', `<b>${esc(task === 1 ? label : p.prompt.slice(0, 90) + (p.prompt.length > 90 ? '…' : ''))}</b><span>${task === 1 ? esc((p as Task1Prompt).chart.kind) : esc(label)}</span>`);
        c.addEventListener('click', () => { stop(); stop = mountEditor(root, task, p, render); });
        cards.append(c);
      });
      if (!list.length) cards.append(h('p', 'ie-note', 'No prompts loaded yet.'));
      root.append(cards);
    }
  };
  render();
  return () => stop();
}
