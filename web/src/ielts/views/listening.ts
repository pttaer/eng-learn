import listeningData from '../data/listening.json';
import { ListeningSection } from '../types';
import { rawToBand } from '../bands';
import { addAttempt } from '../progress';
import { QuestionForm, renderQuestions, typeBreakdown } from '../questions';
import { SetScore } from '../scoring';
import {
  playSection,
  Playback,
  ttsAvailable,
  setPreferredAccent,
  getPreferredAccent,
  setExamRoomAmbience,
  isExamRoomAmbienceEnabled
} from '../tts';
import { AccentCadenceType } from '../../core/audio-synthesizer';
import { bandBadge, esc, h } from '../ui';
import { TestResult } from './reading';
import { icon } from '../../utils/icons';

const SECTIONS = listeningData as ListeningSection[];

// Quotes in a `why` are matched to script lines after case and punctuation are stripped.
const normText = (t: string): string => t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Script line indexes quoted in the `why` of the given questions. */
export function evidenceLineIndexes(sec: ListeningSection, questionIds: Set<string>): Set<number> {
  const out = new Set<number>();
  for (const q of sec.questions) {
    if (!questionIds.has(q.id)) continue;
    // A quote opens after a space, bracket or start and closes before space or punctuation, so "there's" does not split it.
    // Ellipses split one quote into separate segments, since a single script line rarely holds the whole span.
    const quotes = [...(q.why || '').matchAll(/(?:^|[\s(\u201C\u2018"])["\u201C\u2018']([^"\u201C\u201D\u2018\u2019]{4,}?)["\u201D\u2019'](?=[\s.,;:!?)]|$)/g)]
      .flatMap(m => (m[1] ?? '').split(/\.{3}|\u2026/))
      .map(normText)
      .filter(qq => qq.length > 0);
    sec.script.forEach((line, i) => {
      const t = ' ' + normText(line.text) + ' ';
      if (quotes.some(qq => t.includes(' ' + qq + ' '))) out.add(i);
    });
  }
  return out;
}

/** Runs sections in order. exam=true plays each section once (no replay); practice allows replay and shows the transcript after submit. */
export function mountListeningTest(root: HTMLElement, sections: ListeningSection[], exam: boolean, mock: boolean, onDone?: (r: TestResult) => void): () => void {
  root.innerHTML = '';
  let playback: Playback | null = null;
  const bar = h('div', 'ie-testbar');
  const status = h('span', 'ie-clock', ttsAvailable() ? 'Press Play to start' : 'Text-to-speech is not available in this browser');
  const play = h('button', 'ie-btn ie-btn-primary', 'Play');
  const submit = h('button', 'ie-btn', 'Submit answers');
  const tabs = h('div', 'ie-tabs');

  // Multi-accent cadence selector
  const accentSelect = h('select', 'ie-select ie-accent-select', `
    <option value="uk-rp">UK RP (Cambridge)</option>
    <option value="general-american">General American</option>
    <option value="australian">Australian</option>
    <option value="scottish">Scottish</option>
  `) as HTMLSelectElement;
  accentSelect.value = getPreferredAccent();
  accentSelect.title = 'Select examiner and speaker accent cadence';
  accentSelect.addEventListener('change', () => {
    setPreferredAccent(accentSelect.value as AccentCadenceType);
  });

  // Authentic Cambridge 40Hz acoustic exam room resonance toggle
  const ambienceBtn = h(
    'button',
    'ie-btn ie-ambience-btn' + (isExamRoomAmbienceEnabled() ? ' is-active' : '')
  );
  ambienceBtn.innerHTML = `${icon('landmark', 13)} Ambience: ${isExamRoomAmbienceEnabled() ? 'ON' : 'OFF'}`;
  ambienceBtn.title = 'Toggle subtle Cambridge exam hall pink noise and 40Hz room resonance';
  ambienceBtn.addEventListener('click', () => {
    const next = !isExamRoomAmbienceEnabled();
    setExamRoomAmbience(next);
    ambienceBtn.classList.toggle('is-active', next);
    ambienceBtn.innerHTML = `${icon('landmark', 13)} Ambience: ${next ? 'ON' : 'OFF'}`;
  });

  bar.append(status, tabs, accentSelect, ambienceBtn, play, submit);
  const panes: HTMLElement[] = [];
  const forms: QuestionForm[] = [];
  const played = new Set<number>();
  let cur = 0;
  let replay: Playback | null = null;
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
      accent: accentSelect.value as AccentCadenceType,
      roomAmbience: isExamRoomAmbienceEnabled(),
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
      if (!exam && ttsAvailable()) {
        const marked = evidenceLineIndexes(sections[i], new Set(s.wrong));
        tr.querySelectorAll('p').forEach((p, j) => {
          if (!marked.has(j)) return;
          const replayBtn = h('button', 'ie-btn ie-btn-sm', 'Hear at 0.8x');
          replayBtn.addEventListener('click', () => {
            replay?.stop();
            replay = playSection({ ...sections[i], script: [sections[i].script[j]] }, { rate: 0.8, accent: accentSelect.value as AccentCadenceType });
          });
          p.append(replayBtn);
        });
      }
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
  return () => {
    playback?.stop();
    replay?.stop();
    setExamRoomAmbience(false);
  };
}

export function listeningView(root: HTMLElement): () => void {
  let stop = () => {};
  const list = h('div', 'ie-cards');

  const labBanner = h('div', 'ie-lab-banner', `
    <div class="ie-lab-banner-content">
      <span class="ie-trap-category-pill">${icon('target', 13)} Interactive Audio Lab</span>
      <h3>Listening Trap & Oral Self-Correction Audio Lab</h3>
      <p class="ie-lead">Practice spotting oral self-corrections, restrictive qualifiers, reversal traps, and map navigation decoys across 12 authentic Cambridge-style audio scenarios with real-time waveform feedback.</p>
    </div>
    <a href="#listening-traps" class="ie-btn ie-btn-primary ie-lab-launch-btn">Launch Traps Lab (12 Drills) →</a>
  `);

  root.append(
    h('h1', 'ie-title', 'Academic Listening'),
    h('p', 'ie-lead', 'Ten questions per section, voiced by browser text-to-speech with a different voice per speaker. Practice mode lets you replay; the mock plays each section once.'),
    labBanner,
    list
  );
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
