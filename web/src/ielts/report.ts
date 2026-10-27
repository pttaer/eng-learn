import { averageBands } from './bands';
import { readiness, recentBand } from './progress';
import { esc, h } from './ui';

/** Skill bands from recent attempts, overall via IELTS rounding, and the 7.0 readiness gate. */
export function report(): HTMLElement {
  const skills = ['listening', 'reading', 'writing', 'speaking'] as const;
  const bands = skills.map(s => recentBand(s, 3));
  const known = bands.filter((b): b is number => b !== null);
  const rd = readiness();
  const box = h('section', 'ie-report');
  box.innerHTML = `<h2 class="ie-sub">Your band report</h2>
    <div class="ie-bands">${skills.map((s, i) => `<div class="ie-bandcell"><small>${s}</small><b>${bands[i] === null ? '–' : (bands[i] as number).toFixed(1)}</b>${s === 'writing' || s === 'speaking' ? '<em>self-estimate</em>' : ''}</div>`).join('')}
      <div class="ie-bandcell ie-bandcell-main"><small>Overall</small><b>${known.length === 4 ? averageBands(known).toFixed(1) : '–'}</b>${known.length < 4 ? `<em>needs all 4 skills</em>` : ''}</div></div>
    <h3>${rd.ready ? 'Ready for 7.0' : 'Not yet ready for 7.0'}</h3>
    <ul class="ie-breakdown">${rd.lines.map(l => `<li><span>${esc(l)}</span></li>`).join('')}</ul>
    <p class="ie-note">Bands use the last 3 attempts per skill. Listening and Reading come from standard raw-score conversion tables. Writing and Speaking come from your own rubric ratings, so they can only support the result, never certify it.</p>`;
  return box;
}
