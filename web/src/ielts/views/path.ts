import { attempts } from '../progress';
import { esc, h } from '../ui';
import { SKILLS, ROUTE, FOCUS, estimateStart, currentBands, roadmapWeeks, extendedRoadmap, nextTask, gate, placementFrom, type Skill } from '../path';
import { t } from '../../core/i18n';
import { icon } from '../../utils/icons';

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

const SKILL_KEYS: Record<Skill, string> = {
  listening: 'ielts.nav_listening',
  reading: 'ielts.nav_reading',
  writing: 'ielts.nav_writing',
  speaking: 'ielts.nav_speaking'
};

const TASK_KEYS: Record<string, string> = {
  'strategy cards': 'ielts.task_strategy_cards',
  'skill drill': 'ielts.task_skill_drill',
  'vocabulary review': 'ielts.task_vocab_review',
  'full mock': 'ielts.task_full_mock'
};

function localizedSkillName(s: Skill): string {
  const key = SKILL_KEYS[s];
  return key ? t(key, undefined, s.charAt(0).toUpperCase() + s.slice(1)) : s;
}

function localizedTaskName(task: string): string {
  const key = TASK_KEYS[task];
  return key ? t(key, undefined, task) : task;
}

export function pathView(root: HTMLElement): () => void {
  const render = (): void => {
    const att = attempts();
    const placement = placementFrom(att);
    const start = estimateStart(currentBands(att, placement));
    root.innerHTML = '';
    root.append(
      h('h1', 'ie-title', t('ielts.study_path_title', undefined, 'Your 7.0 study path')),
      h('p', 'ie-lead', t('ielts.path_lead', undefined, 'Length comes from your recent attempts. Reading gets most of the weeks, and the readiness gate shows what is still missing.'))
    );

    const cards = h('div', 'ie-cards');
    for (const s of SKILLS) {
      const g = gate(s, att);
      const skillName = localizedSkillName(s);
      const gateText = t('ielts.path_gate_format', { have: g.have, need: g.need }, `Gate ${g.have}/${g.need}`) +
        (g.ok ? ` (${t('ielts.path_gate_pass', undefined, 'pass')})` : '');
      const placementText = placement[s] === undefined
        ? t('ielts.path_not_tested', undefined, 'Not tested yet')
        : t('ielts.path_placement', { band: placement[s] }, `Placement ${placement[s]}`);

      const card = h(
        'a',
        'ie-card ie-path-card',
        `<div class="ie-path-card-head">` +
          `<b>${esc(skillName)}</b>` +
          `<span class="ie-gate-badge ${g.ok ? 'is-pass' : ''}">${esc(gateText)}</span>` +
        `</div>` +
        `<span class="ie-path-card-placement">${esc(placementText)}</span>` +
        `<div class="ie-path-card-affordance" aria-hidden="true">${icon('chevronRight', 16)}</div>`
      );
      card.setAttribute('href', ROUTE[s]);
      cards.append(card);
    }
    root.append(h('h2', 'ie-sub', t('ielts.readiness_gate', undefined, 'Readiness gate')), cards);

    if (start === null) {
      root.append(h('p', 'ie-note', t('ielts.path_take_test_first', undefined, 'Take one short test in each skill first. Your attempts set your current band and the roadmap length.')));
      return;
    }

    const weeks = roadmapWeeks(start, att);
    if (weeks === 0) {
      root.append(h('p', 'ie-lead', t('ielts.path_all_gates_pass', { start }, `Current band ${start}. All four gates pass, so no study weeks are left. Keep them green.`)));
      return;
    }
    const done = doneWeeks();
    const plan = extendedRoadmap(weeks, FOCUS, done);
    const next = nextTask(plan, done);
    const focusName = localizedSkillName(FOCUS);

    root.append(
      h('h2', 'ie-sub', t('ielts.roadmap', undefined, 'Roadmap')),
      h('p', 'ie-lead', t('ielts.path_current_band_info', { start, weeks, focus: focusName }, `Current band ${start}. Target 7.0 in about ${weeks} weeks. Focus skill: ${esc(focusName)}.`))
    );

    if (next) {
      const nextWeekBadge = t('ielts.path_next_kicker', { week: next.week }, `Next Task • Week ${next.week}`);
      const taskName = localizedTaskName(next.task);
      const whereSkillName = next.task === 'vocabulary review'
        ? t('ielts.nav_vocab', undefined, 'vocabulary')
        : next.task === 'full mock'
          ? t('ielts.all_skills', undefined, 'all skills')
          : localizedSkillName(next.skill);
      const inText = t('ielts.in_skill', undefined, 'in');
      const openText = t('ielts.path_open', undefined, 'Open');

      const nextCard = h(
        'div',
        'ie-path-next',
        `<div class="ie-path-next-content">` +
          `<span class="ie-path-next-kicker">${esc(nextWeekBadge)}</span>` +
          `<h3 class="ie-path-next-title">${esc(taskName)} ${esc(inText)} ${esc(whereSkillName)}</h3>` +
        `</div>` +
        `<a class="ie-btn ie-btn-primary ie-path-next-btn" href="${next.route}">` +
          `<span>${esc(openText)}</span>` +
          `<span class="ie-btn-arrow" aria-hidden="true">${icon('arrowRight', 14)}</span>` +
        `</a>`
      );
      root.append(nextCard);
    } else {
      root.append(h('p', 'ie-note', t('ielts.path_roadmap_complete', undefined, 'Roadmap complete. Check the readiness gate above.')));
    }

    const list = h('ol', 'ie-path-steps');
    for (const w of plan) {
      const isDone = done.includes(w.week);
      const weekLabel = t('ielts.path_week_badge', { week: w.week }, `Week ${w.week}`);
      const taskName = localizedTaskName(w.task);
      const where = w.task === 'vocabulary review'
        ? t('ielts.nav_vocab', undefined, 'vocabulary')
        : w.task === 'full mock'
          ? t('ielts.all_skills', undefined, 'all skills')
          : localizedSkillName(w.skill);
      const inText = t('ielts.in_skill', undefined, 'in');
      const btnLabel = isDone
        ? t('ielts.undo', undefined, 'Undo')
        : t('ielts.mark_done', undefined, 'Mark done');

      const item = h(
        'li',
        `ie-path-step-card ${isDone ? 'is-done' : ''}`,
        `<div class="ie-path-step-content">` +
          `<span class="ie-path-step-badge">${esc(weekLabel)}</span>` +
          `<div class="ie-path-step-text">` +
            `<span class="ie-path-step-task">${esc(taskName)} ${esc(inText)}</span> ` +
            `<a class="ie-path-step-link" href="${w.route}">${esc(where)}</a>` +
          `</div>` +
        `</div>`
      );

      const btn = h(
        'button',
        `ie-btn ie-btn-sm ie-path-step-btn ${isDone ? 'is-undo' : ''}`,
        isDone ? `${icon('rotateCcw', 14)}<span>${esc(btnLabel)}</span>` : `${icon('check', 14)}<span>${esc(btnLabel)}</span>`
      );
      btn.addEventListener('click', (e) => {
        e.preventDefault();
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
