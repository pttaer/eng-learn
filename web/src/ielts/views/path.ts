import { attempts } from '../progress';
import { esc, h } from '../ui';
import { SKILLS, ROUTE, FOCUS, estimateStart, currentBands, roadmapWeeks, extendedRoadmap, nextTask, gate, placementFrom } from '../path';

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
    const start = estimateStart(currentBands(att, placement));
    root.innerHTML = '';
    root.append(
      h('h1', 'ie-title', 'Your 7.0 study path'),
      h('p', 'ie-lead', 'Length comes from your recent attempts. Reading gets most of the weeks, and the readiness gate shows what is still missing.')
    );

    const cards = h('div', 'ie-cards');
    for (const s of SKILLS) {
      const g = gate(s, att);
      const capSkill = s.charAt(0).toUpperCase() + s.slice(1);
      const card = h(
        'a',
        'ie-card ie-path-card',
        `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 4px;">` +
          `<b>${esc(capSkill)}</b>` +
          `<small style="margin: 0; font-family: var(--font-mono); font-size: var(--font-kicker); color: ${g.ok ? 'var(--good, #10b981)' : 'var(--ink-secondary)'};">Gate ${g.have}/${g.need}${g.ok ? ' (pass)' : ''}</small>` +
        `</div>` +
        `<span>${placement[s] === undefined ? 'Not tested yet' : `Placement ${placement[s]}`}</span>`
      );
      card.setAttribute('href', ROUTE[s]);
      cards.append(card);
    }
    root.append(h('h2', '', 'Readiness gate'), cards);

    if (start === null) {
      root.append(h('p', 'ie-note', 'Take one short test in each skill first. Your attempts set your current band and the roadmap length.'));
      return;
    }

    const weeks = roadmapWeeks(start, att);
    if (weeks === 0) {
      root.append(h('p', 'ie-lead', `Current band ${start}. All four gates pass, so no study weeks are left. Keep them green.`));
      return;
    }
    const done = doneWeeks();
    const plan = extendedRoadmap(weeks, FOCUS, done);
    const next = nextTask(plan, done);
    root.append(h('h2', '', 'Roadmap'), h('p', 'ie-lead', `Current band ${start}. Target 7.0 in about ${weeks} weeks. Focus skill: ${esc(FOCUS)}.`));
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
