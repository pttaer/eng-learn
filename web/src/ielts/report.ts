import { averageBands } from './bands';
import { readiness, recentBand } from './progress';
import { esc, h } from './ui';
import { t } from '../core/i18n';

/** Skill bands from recent attempts, overall via IELTS rounding, and the 7.0 readiness gate. */
export function report(): HTMLElement {
  const skills = ['listening', 'reading', 'writing', 'speaking'] as const;
  const bands = skills.map(s => recentBand(s, 3));
  const known = bands.filter((b): b is number => b !== null);
  const rd = readiness();
  const box = h('section', 'ie-report');
  box.innerHTML = `<h2 class="ie-sub">${t('ielts.report_title', undefined, 'Your band report')}</h2>
    <div class="ie-bands">${skills.map((s, i) => `<div class="ie-bandcell"><small>${t(`ielts.${s}`, undefined, s)}</small><b>${bands[i] === null ? '–' : (bands[i] as number).toFixed(1)}</b>${s === 'writing' || s === 'speaking' ? `<em>${t('ielts.report_self_estimate', undefined, 'self-estimate')}</em>` : ''}</div>`).join('')}
      <div class="ie-bandcell ie-bandcell-main"><small>${t('ielts.report_overall', undefined, 'Overall')}</small><b>${known.length === 4 ? averageBands(known).toFixed(1) : '–'}</b>${known.length < 4 ? `<em>${t('ielts.report_needs_4', undefined, 'needs all 4 skills')}</em>` : ''}</div></div>
    <div class="ie-readiness-badge ${rd.ready ? 'ready' : 'not-ready'}">
      <h3>${rd.ready ? t('ielts.report_ready', undefined, 'Ready for 7.0') : t('ielts.report_not_ready', undefined, 'Not yet ready for 7.0')}</h3>
      <p class="ie-readiness-criteria" style="font-size: var(--font-kicker); color: var(--ink-secondary); margin-top: 4px;">${t('ielts.readiness_criteria_hint', undefined, 'Requires at least 2 full mock exams per skill scoring ≥ 7.0')}</p>
    </div>
    <ul class="ie-breakdown">${rd.lines.map(l => `<li><span>${esc(l)}</span></li>`).join('')}</ul>
    <p class="ie-note">${t('ielts.report_note', undefined, 'Bands use the last 3 attempts per skill. Listening and Reading come from standard raw-score conversion tables. Writing and Speaking come from your own rubric ratings, so they can only support the result, never certify it.')}</p>`;
  return box;
}
