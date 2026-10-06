import speakingData from '../data/speaking.json';
import { SpeakingData, SpeakingPart2 } from '../types';
import { AcousticEngine, AcousticAnalysis } from '../../core/acoustic-engine';
import { addAttempt } from '../progress';
import { DESCRIPTORS, RUBRIC } from '../writing-heuristics';
import { bandBadge, countdown, Countdown, esc, fmtTime, h } from '../ui';

const DATA = speakingData as SpeakingData;
const engine = new AcousticEngine();

/** Record one answer with the shared acoustic engine; returns a stop function that resolves with the take. */
async function record(host: HTMLElement, seconds: number): Promise<AcousticAnalysis | null> {
  if (!(await engine.init())) { host.append(h('p', 'ie-note', 'Microphone unavailable. Speak aloud anyway and rate yourself.')); return null; }
  await engine.startRecording();
  return new Promise(resolve => {
    const clock = h('span', 'ie-clock');
    const stop = h('button', 'ie-btn ie-btn-primary', 'Stop');
    const row = h('div', 'ie-testbar');
    row.append(clock, stop);
    host.append(row);
    let cd: Countdown;
    const done = async (): Promise<void> => { cd.stop(); row.remove(); resolve(await engine.stopRecording()); };
    cd = countdown(seconds, l => { clock.textContent = fmtTime(l); }, done);
    stop.addEventListener('click', done);
  });
}

function fluencyHint(a: AcousticAnalysis | null): string {
  if (!a) return '';
  const pct = Math.round(a.silenceRatio * 100);
  const note = pct > 35 ? 'Many long pauses. Fluency at band 7 means speaking at length without effortful searching.' : pct < 10 ? 'Very few pauses. Make sure you are not rushing.' : 'Pause level is in a natural range.';
  return `<p class="ie-note">Recorded ${Math.round(a.durationSeconds)}s, speech ${a.totalSpeechSeconds}s, pauses ${pct}%. ${note}</p><audio controls src="${a.audioUrl}"></audio>`;
}

function rater(host: HTMLElement, itemId: string): void {
  const rows = RUBRIC.speaking.map((c, i) => `<label class="ie-rate"><span>${c}</span><select data-i="${i}">${[5, 5.5, 6, 6.5, 7, 7.5, 8].map(b => `<option value="${b}"${b === 6 ? ' selected' : ''}>${b.toFixed(1)}</option>`).join('')}</select></label>`).join('');
  const box = h('div', 'ie-result ie-feedback', `<div class="ie-feedback-col"><h3>Rate yourself</h3><p class="ie-note">7 = ${esc(DESCRIPTORS[7])}</p>${rows}<div class="ie-estimate"></div><button class="ie-btn ie-btn-primary ie-save">Save estimate</button></div>`);
  host.append(box);
  const est = box.querySelector('.ie-estimate') as HTMLElement;
  const band = (): number => {
    const v = [...box.querySelectorAll<HTMLSelectElement>('select[data-i]')].map(s => Number(s.value));
    const b = Math.round((v.reduce((a, x) => a + x, 0) / v.length) * 2) / 2;
    est.innerHTML = bandBadge(b, 'Estimate');
    return b;
  };
  box.querySelectorAll('select').forEach(s => s.addEventListener('change', band));
  band();
  box.querySelector('.ie-save')!.addEventListener('click', e => {
    addAttempt({ skill: 'speaking', itemId, band: band(), estimate: true });
    (e.target as HTMLButtonElement).disabled = true;
    (e.target as HTMLButtonElement).textContent = 'Saved';
  });
}

function part1(root: HTMLElement, back: () => void): void {
  root.innerHTML = '';
  root.append(h('h1', 'ie-title', 'Part 1: Introduction and interview'), h('p', 'ie-lead', 'Answer each question in 2-3 sentences (20-30 seconds). Extend with a reason or example.'));
  const list = h('div', 'ie-cards');
  DATA.part1.forEach(t => {
    const c = h('button', 'ie-card', `<b>${esc(t.topic)}</b><small>${t.questions.length} questions</small>`);
    c.addEventListener('click', () => runPart1(root, t.topic, t.questions, back));
    list.append(c);
  });
  const b = h('button', 'ie-btn', 'Back');
  b.addEventListener('click', back);
  root.append(b, list);
}

function runPart1(root: HTMLElement, topic: string, qs: string[], back: () => void): void {
  root.innerHTML = '';
  const b = h('button', 'ie-btn', 'All topics');
  b.addEventListener('click', () => part1(root, back));
  const stage = h('div', 'ie-stage');
  root.append(b, h('h2', 'ie-sub', esc(topic)), stage);
  let i = 0;
  let last: AcousticAnalysis | null = null;
  const ask = (): void => {
    if (i >= qs.length) { stage.innerHTML = '<p class="ie-lead">Topic finished.</p>'; rater(stage, `p1-${topic}`); return; }
    stage.innerHTML = `<p class="ie-cue">${i + 1}/${qs.length}. ${esc(qs[i])}</p>`;
    const go = h('button', 'ie-btn ie-btn-primary', 'Answer (30 s max)');
    go.addEventListener('click', async () => {
      go.remove();
      last = await record(stage, 30);
      stage.insertAdjacentHTML('beforeend', fluencyHint(last));
      const nx = h('button', 'ie-btn', i + 1 < qs.length ? 'Next question' : 'Finish');
      nx.addEventListener('click', () => { i++; ask(); });
      stage.append(nx);
    });
    stage.append(go);
  };
  ask();
}

function part2(root: HTMLElement, back: () => void): void {
  root.innerHTML = '';
  root.append(h('h1', 'ie-title', 'Part 2: Long turn'), h('p', 'ie-lead', 'One minute to prepare, then speak for up to two minutes. Part 3 follow-ups come after.'));
  const list = h('div', 'ie-cards');
  DATA.part2.forEach(c => {
    const card = h('button', 'ie-card', `<b>${esc(c.cue)}</b><small>${c.part3.length} Part 3 questions</small>`);
    card.addEventListener('click', () => runPart2(root, c, back));
    list.append(card);
  });
  const b = h('button', 'ie-btn', 'Back');
  b.addEventListener('click', back);
  root.append(b, list);
}

function runPart2(root: HTMLElement, c: SpeakingPart2, back: () => void): void {
  root.innerHTML = '';
  const b = h('button', 'ie-btn', 'All cue cards');
  b.addEventListener('click', () => part2(root, back));
  const stage = h('div', 'ie-stage');
  root.append(b, h('article', 'ie-passage ie-cuecard', `<p class="ie-cue">${esc(c.cue)}</p><p>You should say:</p><ul>${c.bullets.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`), stage);
  const start = h('button', 'ie-btn ie-btn-primary', 'Start 1-minute preparation');
  stage.append(start);
  start.addEventListener('click', () => {
    start.remove();
    const clock = h('p', 'ie-clock', '01:00');
    stage.append(h('p', 'ie-note', 'Make brief notes on paper. Then speak.'), clock);
    countdown(60, l => { clock.textContent = fmtTime(l); }, () => { clock.remove(); talk(); });
  });
  const talk = async (): Promise<void> => {
    stage.append(h('p', 'ie-lead', 'Speak now. The recording stops at 2:00.'));
    const a = await record(stage, 120);
    stage.insertAdjacentHTML('beforeend', fluencyHint(a));
    stage.append(h('h3', '', 'Part 3 follow-up'), h('ol', 'ie-steps', c.part3.map(q => `<li>${esc(q)}</li>`).join('')), h('p', 'ie-note', 'Answer these aloud for 30-40 seconds each, giving reasons and comparing viewpoints.'), h('h3', '', 'Band 7+ model answer'), h('p', '', esc(c.modelAnswer)));
    rater(stage, c.id);
  };
}

export function speakingView(root: HTMLElement): () => void {
  const menu = (): void => {
    root.innerHTML = '';
    root.append(h('h1', 'ie-title', 'Academic Speaking'), h('p', 'ie-lead', 'Recordings stay on your device. Pause levels come from the audio; the rest is your own rubric rating. The band is an estimate.'));
    const cards = h('div', 'ie-cards');
    const a = h('button', 'ie-card', `<b>Part 1</b><span>Interview</span><small>${DATA.part1.length} topics</small>`);
    const b = h('button', 'ie-card', `<b>Parts 2 and 3</b><span>Cue card + discussion</span><small>${DATA.part2.length} cue cards</small>`);
    a.addEventListener('click', () => part1(root, menu));
    b.addEventListener('click', () => part2(root, menu));
    cards.append(a, b);
    root.append(cards);
  };
  menu();
  return () => engine.dispose();
}
