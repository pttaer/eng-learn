export function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', html = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

export const esc = (s: string): string => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

export const fmtTime = (sec: number): string => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

export interface Countdown { stop(): void; left(): number }

/** Counts down from `seconds`, calling onTick each second and onEnd at zero. */
export function countdown(seconds: number, onTick: (left: number) => void, onEnd: () => void): Countdown {
  let left = seconds;
  onTick(left);
  const id = window.setInterval(() => {
    left--;
    onTick(left);
    if (left <= 0) { window.clearInterval(id); onEnd(); }
  }, 1000);
  return { stop: () => window.clearInterval(id), left: () => left };
}

export function bandBadge(band: number, label = 'Band'): string {
  const cls = band >= 7 ? 'good' : band >= 6 ? 'mid' : 'low';
  return `<span class="ie-band ie-band-${cls}"><small>${label}</small>${band.toFixed(1)}</span>`;
}
