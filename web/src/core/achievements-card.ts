import { UsageTracker, UsageSummary } from './usage-tracker';
import { ProgressionEngine } from './progression-engine';

export interface Achievement {
  label: string;
  earned: boolean;
}

// Milestones are plain thresholds on the stored totals. Labels are constants, so no escaping is needed.
export function achievementsFor(summary: UsageSummary, streak: number): Achievement[] {
  return [
    { label: '10 questions', earned: summary.answers >= 10 },
    { label: '50 questions', earned: summary.answers >= 50 },
    { label: '200 questions', earned: summary.answers >= 200 },
    { label: '1 hour in app', earned: summary.hours >= 1 },
    { label: '5 hours in app', earned: summary.hours >= 5 },
    { label: '3-day streak', earned: streak >= 3 },
    { label: '7-day streak', earned: streak >= 7 },
  ];
}

const statBox = (value: string, label: string): string => `
  <div style="flex: 1; min-width: 120px; padding: var(--space-12) var(--space-16); background: var(--bg-surface-sunk); border: 1px solid var(--border-hairline); border-radius: 10px;">
    <div style="font-size: 20px; font-weight: 700; color: var(--ink-primary);">${value}</div>
    <div style="font-size: 12px; color: var(--ink-secondary);">${label}</div>
  </div>`;

const badge = (a: Achievement): string => `
  <span style="padding: 4px 10px; border-radius: 999px; font-size: 12px; border: 1px solid ${a.earned ? 'var(--accent-cyan)' : 'var(--border-hairline)'}; color: ${a.earned ? 'var(--accent-cyan)' : 'var(--ink-muted)'};">${a.earned ? '✓ ' : ''}${a.label}</span>`;

/** Simple progress view: time in app, practice questions, today, streak, and milestone badges. */
export function achievementsHtml(): string {
  const summary = UsageTracker.summary();
  const streak = ProgressionEngine.getState().streak;
  const list = achievementsFor(summary, streak);
  const earned = list.filter(a => a.earned).length;
  return `
    <section aria-label="Your progress" style="display: flex; flex-direction: column; gap: var(--space-8); margin-bottom: var(--space-16);">
      <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-secondary);">Your progress &middot; ${earned} / ${list.length} achievements</div>
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-8);">
        ${statBox(summary.hours.toFixed(1), 'hours in app')}
        ${statBox(String(summary.answers), 'questions answered')}
        ${statBox(String(Math.round(summary.todayMinutes)), 'minutes today')}
        ${statBox(String(streak), 'day streak')}
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-8);">
        ${list.map(badge).join('')}
      </div>
    </section>`;
}
