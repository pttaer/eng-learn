import { attempts } from '../progress';
import { esc, h } from '../ui';
import { SKILLS, ROUTE, estimateStart, weeksFor, weakestSkill, roadmap, nextTask, gate, placementFrom } from '../path';

// Mark-done progress is per viewer (localStorage); a blocked or private browser just starts empty each visit.
const KEY = 'IELTS_PATH';

function doneWeeks(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && Array.isArray(v.done)) return v.done.filter((n: unknown) => typeof n === 'number');
  } catch { /* corrupt or blocked: start empty */ }
  return [];
}

function saveDone(done: number[]): void {
  try { localStorage.setItem(KEY, JSON.stringify({ done })); } catch { /* storage blocked: progress is not kept */ }
}

export function pathView(root: HTMLElement): () => void {
  const render = (): void => {
    const att = attempts();
    const placement = placementFrom(att);
    const start = estimateStart(placement);
    root.innerHTML = '';
    root.append(
      h('h1', 'ie-title', 'Your 7.0 study path'),
      h('p', 'ie-lead', 'Built from your first attempt in each skill. The weakest skill gets most of the weeks, and the readiness gate shows what is still missing.')
    );

    const cards = h('div', 'ie-cards');
    for (const s of SKILLS) {
      const g = gate(s, att);
      const card = h('a', 'ie-card', `<b>${esc(s)}</b><span>${placement[s] === undefined ? 'Not tested yet' : `Placement ${placement[s]}`}</span><small>Gate ${g.have}/${g.need}${g.ok ? ' (pass)' : ''}</small>`);
      card.setAttribute('href', ROUTE[s]);
      cards.append(card);
    }
    root.append(h('h2', '', 'Readiness gate'), cards);

    if (start === null) {
      root.append(h('p', 'ie-note', 'Take one short test in each skill first. Your first attempt in each skill sets its starting band.'));
      return;
    }

    const weeks = weeksFor(start);
    const weakest = weakestSkill(placement);
    const plan = roadmap(weeks, weakest);
    const done = doneWeeks();
    const next = nextTask(plan, done);
    root.append(h('h2', '', 'Roadmap'), h('p', 'ie-lead', `Start band ${start}. Target 7.0 in about ${weeks} weeks. Weakest skill: ${esc(weakest)}.`));
    root.append(next
      ? h('div', 'ie-result', `<b>Next: week ${next.week}, ${esc(next.task)}</b> <a class="ie-btn ie-btn-primary" href="${next.route}">Open</a>`)
      : h('p', 'ie-note', 'Roadmap complete. Check the readiness gate above.'));

    const list = h('ol', 'ie-steps');
    for (const w of plan) {
      const isDone = done.includes(w.week);
      const where = w.task === 'vocabulary review' ? 'vocabulary' : w.task === 'full mock' ? 'all skills' : esc(w.skill);
      const item = h('li', '', `Week ${w.week}: ${esc(w.task)} in <a href="${w.route}">${where}</a>${isDone ? ' (done)' : ''} `);
      const btn = h('button', 'ie-btn', isDone ? 'Undo' : 'Mark done');
      btn.addEventListener('click', () => {
        const d = doneWeeks();
        saveDone(isDone ? d.filter(x => x !== w.week) : [...d, w.week]);
        render();
      });
      item.append(btn);
      list.append(item);
    }
    root.append(list);
  };
  render();
  return () => {};
}
