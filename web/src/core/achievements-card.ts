import { UsageTracker, UsageSummary } from './usage-tracker';
import { ProgressionEngine, LevelInfo } from './progression-engine';
import { icon, IconName } from '../utils/icons';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: IconName;
  color: string;
  current: number;
  target: number;
  format: 'int' | 'hours';
  earned: boolean;
}

// Achievement thresholds read the stored totals. Titles and descriptions are constants, so no escaping is needed.
export function achievementsFor(summary: UsageSummary, streak: number): Achievement[] {
  const row = (
    id: string,
    title: string,
    description: string,
    points: number,
    iconName: IconName,
    color: string,
    current: number,
    target: number,
    format: 'int' | 'hours' = 'int'
  ): Achievement => ({ id, title, description, points, icon: iconName, color, current, target, format, earned: current >= target });

  return [
    row('q10', 'Ten Questions', 'Answer 10 practice questions', 30, 'target', '#a7e3dc', summary.answers, 10),
    row('q50', 'Fifty Questions', 'Answer 50 practice questions', 60, 'book', '#fbe3a1', summary.answers, 50),
    row('q200', 'Two Hundred', 'Answer 200 practice questions', 120, 'trophy', '#bcd7f7', summary.answers, 200),
    row('h1', 'First Hour', 'Spend 1 hour in the app', 30, 'clock', '#cbbdf2', summary.hours, 1, 'hours'),
    row('h5', 'Five Hours', 'Spend 5 hours in the app', 90, 'alarm', '#f6bfd6', summary.hours, 5, 'hours'),
    row('s3', 'Three-Day Streak', 'Study 3 days in a row', 40, 'flame', '#c4eccb', streak, 3),
    row('s7', 'Week Streak', 'Study 7 days in a row', 80, 'zap', '#f9c3a8', streak, 7),
  ];
}

// Five rank tiers shown under the progress bar. Ranks above Adept share the top tier.
const TIER_ICONS: IconName[] = ['target', 'book', 'landmark', 'trophy', 'zap'];

function tierIndex(level: number): number {
  if (level <= 1) return 0;
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  return 4;
}

const hexIcon = (a: Achievement): string => `
  <div style="position: relative; flex: none; width: 48px; height: 48px; color: #4a4f7a; ${a.earned ? '' : 'filter: grayscale(1); opacity: 0.45;'}">
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="${a.color}"/></svg>
    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">${icon(a.icon, 20)}</div>
    <span style="position: absolute; top: -6px; right: -8px; font-size: 11px; font-weight: 700; color: #fff; background: #7f83e6; border-radius: 8px; padding: 1px 6px;">+${a.points}</span>
  </div>`;

const achievementRow = (a: Achievement): string => {
  const shown = a.format === 'hours' ? a.current.toFixed(1) : String(Math.floor(a.current));
  const status = a.earned ? 'Unlocked' : `${shown} / ${a.target}${a.format === 'hours' ? ' h' : ''}`;
  return `
    <div style="display: flex; gap: 14px; align-items: center; padding: 14px 18px; border-bottom: 1px solid #eceef6;">
      ${hexIcon(a)}
      <div style="min-width: 0; flex: 1;">
        <div style="font-size: 15px; font-weight: 600; color: #2b2f4a;">${a.title}</div>
        <div style="font-size: 12px; color: #8a8fa8; margin-top: 2px;">${a.description}</div>
        <div style="font-size: 11px; color: ${a.earned ? '#5b5fc7' : '#8a8fa8'}; margin-top: 4px;">${status}</div>
      </div>
    </div>`;
};

function headerHtml(info: LevelInfo, summary: UsageSummary, streak: number): string {
  const tier = tierIndex(info.level);
  const away = info.spanInLevel - info.progressInLevel;
  const tiers = TIER_ICONS.map((name, i) => `
    <div style="width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${i <= tier ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)'}; color: ${i <= tier ? '#5b5fc7' : 'rgba(255,255,255,0.55)'};">${icon(name, 16)}</div>`).join('');
  return `
    <div style="background: linear-gradient(160deg, #8488e8 0%, #5b5fc7 100%); color: #fff; padding: 18px 20px 20px; text-align: center;">
      <div style="font-size: 11px; letter-spacing: 0.18em; opacity: 0.85;">ACHIEVEMENTS</div>
      <div style="font-size: 48px; font-weight: 300; line-height: 1.1; margin-top: 6px;">${info.xp.toLocaleString()}</div>
      <div style="font-size: 10px; letter-spacing: 0.16em; opacity: 0.8;">TOTAL POINTS</div>
      <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
        <span style="font-size: 10px; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,0.2);">${away.toLocaleString()} POINTS AWAY</span>
      </div>
      <div style="height: 6px; border-radius: 3px; background: rgba(255,255,255,0.3); margin-top: 6px; overflow: hidden;">
        <div style="width: ${info.percentage}%; height: 100%; background: #fff; border-radius: 3px;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; gap: 6px; margin-top: 14px;">${tiers}</div>
      <div style="font-size: 10px; letter-spacing: 0.14em; margin-top: 8px; opacity: 0.9;">${info.rankTitle}</div>
      <div style="font-size: 12px; margin-top: 12px; opacity: 0.9;">${summary.hours.toFixed(1)} h in app &middot; ${summary.answers} questions &middot; ${Math.round(summary.todayMinutes)} min today &middot; ${streak}-day streak</div>
    </div>`;
}

/** Achievements screen: gradient header with total points, rank tiers, and achievement rows. */
export function achievementsHtml(): string {
  const engine = ProgressionEngine.getState();
  const info = ProgressionEngine.getLevelInfo();
  const summary = UsageTracker.summary();
  const streak = engine.streak;
  const list = achievementsFor(summary, streak);
  return `
    <section aria-label="Achievements" style="max-width: 420px; margin: 0 auto var(--space-16); border-radius: 24px; overflow: hidden; background: #fff; color: #2b2f4a; box-shadow: var(--shadow-card);">
      ${headerHtml(info, summary, streak)}
      <div>
        ${list.map(achievementRow).join('')}
      </div>
    </section>`;
}
