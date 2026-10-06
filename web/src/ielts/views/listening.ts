import listeningData from '../data/listening.json';
import { ListeningSection } from '../types';
import { rawToBand } from '../bands';
import { addAttempt } from '../progress';
import { QuestionForm, renderQuestions, typeBreakdown } from '../questions';
import { SetScore } from '../scoring';
import { playSection, Playback, ttsAvailable } from '../tts';
import { bandBadge, esc, h } from '../ui';
import { TestResult } from './reading';

const SECTIONS = listeningData as ListeningSection[];

/** Runs sections in order. exam=true plays each section once (no replay); practice allows replay and shows the transcript after submit. */
export function mountListeningTest(root: HTMLElement, sections: ListeningSection[], exam: boolean, mock: boolean, onDone?: (r: TestResult) => void): () => void {
  root.innerHTML = '';
  let playback: Playback | null = null;
  const bar = h('div', 'ie-testbar');
  const status = h('span', 'ie-clock', ttsAvailable() ? 'Press Play to start' : 'Text-to-speech is not available in this browser');
  const play = h('button', 'ie-btn ie-btn-primary', 'Play');
  const submit = h('button', 'ie-btn', 'Submit answers');
  const tabs = h('div', 'ie-tabs');
  bar.append(status, tabs, play, submit);
  const panes: HTMLElement[] = [];
  const forms: QuestionForm[] = [];
  const played = new Set<number>();
  let cur = 0;
  let n = 1;
  sections.forEach((s, i) => {
    const pane = h('section', 'ie-qcol ie-listen-pane');
    pane.hidden = i > 0;
    pane.append(h('h2', '', `Section ${s.section}: ${esc(s.title)}`));
    const form = renderQuestions(s.questions, n);
    n += s.questions.length;
    pane.append(form.el);
    panes.push(pane);
    forms.push(form);
    const t = h('button', 'ie-tab' + (i === 0 ? ' is-on' : ''), `Section ${s.section}`);
    t.addEventListener('click', () => {
      playback?.stop();
      play.textContent = 'Play';
      cur = i;
      panes.forEach((x, j) => { x.hidden = j !== i; });
      tabs.querySelectorAll('.ie-tab').forEach((x, j) => x.classList.toggle('is-on', j === i));
      refresh();
    });
    tabs.append(t);
  });
  const result = h('section', 'ie-result');
  result.hidden = true;
  root.append(bar, ...panes, result);

  const refresh = (): void => {
    play.disabled = !ttsAvailable() || (exam && played.has(cur));
    status.textContent = exam && played.has(cur) ? 'Played once. Answer from memory, as in the exam.' : ttsAvailable() ? 'Press Play to start' : status.textContent;
  };

  play.addEventListener('click', () => {
    if (playback) { playback.stop(); playback = null; play.textContent = 'Play'; return; }
    played.add(cur);
    play.textContent = exam ? 'Playing…' : 'Stop';
    if (exam) play.disabled = true;
    playback = playSection(sections[cur], {
      onLine: i => { status.textContent = `${sections[cur].script[i].speaker} speaking…`; },
      onEnd: () => { playback = null; play.textContent = 'Play'; refresh(); }
    });
  });

  submit.addEventListener('click', () => {
    playback?.stop();
    submit.disabled = true;
    play.hidden = true;
    const total: SetScore = { raw: 0, of: 0, byType: {}, wrong: [] };
    forms.forEach((f, i) => {
      const s = f.reveal();
      total.raw += s.raw;
      total.of += s.of;
      for (const [t, v] of Object.entries(s.byType)) {
        const c = (total.byType[t] ||= { ok: 0, n: 0 });
        c.ok += v.ok;
        c.n += v.n;
      }
      const tr = h('details', 'ie-transcript', `<summary>Transcript: Section ${sections[i].section}</summary>` + sections[i].script.map(l => `<p><b>${esc(l.speaker)}:</b> ${esc(l.text)}</p>`).join(''));
      panes[i].append(tr);
    });
    const band = rawToBand('listening', total.raw, total.of);
    addAttempt({ skill: 'listening', itemId: sections.map(s => s.id).join('+'), band, raw: total.raw, of: total.of, byType: total.byType, mock });
    result.hidden = false;
    result.innerHTML = `${bandBadge(band, 'Listening')}<div><h3>${total.raw}/${total.of} correct</h3><p class="ie-note">Band is scaled to 40 questions. Browser voices are not real exam audio; treat the band as a guide.</p><ul class="ie-breakdown">${typeBreakdown(total.byType)}</ul></div>`;
    panes.forEach(x => { x.hidden = false; });
    tabs.hidden = true;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onDone?.({ raw: total.raw, of: total.of, band, byType: total.byType });
  });

  refresh();
  return () => playback?.stop();
}

export function listeningView(root: HTMLElement): () => void {
  let stop = () => {};
  const list = h('div', 'ie-cards');
  root.append(h('h1', 'ie-title', 'Academic Listening'), h('p', 'ie-lead', 'Ten questions per section, voiced by browser text-to-speech with a different voice per speaker. Practice mode lets you replay; the mock plays each section once.'), list);
  SECTIONS.forEach(s => {
    const c = h('button', 'ie-card', `<b>Section ${s.section}: ${esc(s.title)}</b><span>${s.speakers.length} speaker${s.speakers.length > 1 ? 's' : ''}</span><small>${s.questions.length} questions</small>`);
    c.addEventListener('click', () => {
      root.innerHTML = '';
      const back = h('button', 'ie-btn', 'All sections');
      back.addEventListener('click', () => { stop(); root.innerHTML = ''; stop = listeningView(root); });
      const host = h('div');
      root.append(back, host);
      stop = mountListeningTest(host, [s], false, false);
    });
    list.append(c);
  });
  if (!SECTIONS.length) list.append(h('p', 'ie-note', 'No sections loaded yet.'));
  return () => stop();
}
