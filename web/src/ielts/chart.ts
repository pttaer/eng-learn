import { Task1Chart } from './types';
import { esc } from './ui';

const COLORS = ['#38bdf8', '#a5b4fc', '#34d399', '#fbbf24', '#f87171', '#c4b5fd'];
const W = 640;
const H = 320;
const PAD = { l: 52, r: 16, t: 20, b: 44 };

function niceMax(v: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)));
  return Math.ceil(v / p) * p;
}

function legend(names: string[]): string {
  return `<div class="ie-legend">${names.map((n, i) => `<span><i style="background:${COLORS[i % COLORS.length]}"></i>${esc(n)}</span>`).join('')}</div>`;
}

function axes(max: number, labels: string[], unit: string): string {
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  let s = '';
  for (let i = 0; i <= 4; i++) {
    const y = PAD.t + ih - (ih * i) / 4;
    s += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y}" y2="${y}" class="ie-grid"/><text x="${PAD.l - 8}" y="${y + 4}" text-anchor="end" class="ie-tick">${Math.round((max * i) / 4 * 10) / 10}</text>`;
  }
  labels.forEach((l, i) => { s += `<text x="${PAD.l + (iw * (i + 0.5)) / labels.length}" y="${H - PAD.b + 18}" text-anchor="middle" class="ie-tick">${esc(l)}</text>`; });
  return s + `<text x="${PAD.l}" y="12" class="ie-tick">${esc(unit)}</text>`;
}

function line(c: Task1Chart): string {
  const labels = c.labels!;
  const series = c.series!;
  const max = niceMax(Math.max(...series.flatMap(s => s.values)));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (iw * (i + 0.5)) / labels.length;
  const y = (v: number) => PAD.t + ih - (ih * v) / max;
  const paths = series.map((s, k) => {
    const col = COLORS[k % COLORS.length];
    return `<polyline fill="none" stroke="${col}" stroke-width="2.5" points="${s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}"/>` +
      s.values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${col}"><title>${esc(s.name)} ${esc(labels[i])}: ${v}</title></circle>`).join('');
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="ie-svg" role="img" aria-label="${esc(c.title)}">${axes(max, labels, c.unit || '')}${paths}</svg>${legend(series.map(s => s.name))}`;
}

function bar(c: Task1Chart): string {
  const labels = c.labels!;
  const series = c.series!;
  const max = niceMax(Math.max(...series.flatMap(s => s.values)));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const group = iw / labels.length;
  const bw = Math.min(36, (group * 0.8) / series.length);
  const bars = labels.map((l, i) => series.map((s, k) => {
    const v = s.values[i];
    const bh = (ih * v) / max;
    const bx = PAD.l + group * i + (group - bw * series.length) / 2 + bw * k;
    return `<rect x="${bx}" y="${PAD.t + ih - bh}" width="${bw - 2}" height="${bh}" fill="${COLORS[k % COLORS.length]}"><title>${esc(s.name)} ${esc(l)}: ${v}</title></rect>`;
  }).join('')).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="ie-svg" role="img" aria-label="${esc(c.title)}">${axes(max, labels, c.unit || '')}${bars}</svg>${legend(series.map(s => s.name))}`;
}

function pie(c: Task1Chart): string {
  const labels = c.labels!;
  const vals = c.series![0].values;
  const total = vals.reduce((a, b) => a + b, 0);
  let a0 = -Math.PI / 2;
  const R = 110;
  const cx = 160;
  const cy = 150;
  const slices = vals.map((v, i) => {
    const a1 = a0 + (v / total) * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const d = `M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} A${R},${R} 0 ${large} 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} Z`;
    a0 = a1;
    return `<path d="${d}" fill="${COLORS[i % COLORS.length]}" stroke="var(--bg-card)" stroke-width="2"><title>${esc(labels[i])}: ${v}%</title></path>`;
  }).join('');
  const rows = labels.map((l, i) => `<li><i style="background:${COLORS[i % COLORS.length]}"></i>${esc(l)} <b>${vals[i]}%</b></li>`).join('');
  return `<div class="ie-pie"><svg viewBox="0 0 320 300" class="ie-svg ie-svg-pie" role="img" aria-label="${esc(c.title)}">${slices}</svg><ul class="ie-pie-key">${rows}</ul></div>`;
}

function table(c: Task1Chart): string {
  const head = `<tr><th></th>${c.series!.map(s => `<th>${esc(s.name)}</th>`).join('')}</tr>`;
  const rows = c.labels!.map((l, i) => `<tr><th>${esc(l)}</th>${c.series!.map(s => `<td>${s.values[i]}</td>`).join('')}</tr>`).join('');
  return `<div class="ie-table-wrap"><table class="ie-table">${head}${rows}</table></div>${c.unit ? `<p class="ie-note">${esc(c.unit)}</p>` : ''}`;
}

function process(c: Task1Chart): string {
  return `<ol class="ie-steps">${c.steps!.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
}

function map(c: Task1Chart): string {
  return `<div class="ie-maps">${c.maps!.map(m => `<div><h4>${esc(m.year)}</h4><ul>${m.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`).join('')}</div>`;
}

export function renderChart(c: Task1Chart): string {
  const body = c.kind === 'line' ? line(c) : c.kind === 'bar' ? bar(c) : c.kind === 'pie' ? pie(c) : c.kind === 'table' ? table(c) : c.kind === 'process' ? process(c) : map(c);
  return `<figure class="ie-chart"><figcaption>${esc(c.title)}</figcaption>${body}</figure>`;
}
