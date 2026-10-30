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
import { t } from '../../core/i18n';
import { setIeltsTestInProgress } from '../confirm-dialog';

const SECTIONS = listeningData as ListeningSection[];

// Quotes in a `why` are matched to script lines after case and punctuation are stripped.
const normText = (str: string): string => str.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

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
      const textNorm = ' ' + normText(line.text) + ' ';
      if (quotes.some(qq => textNorm.includes(' ' + qq + ' '))) out.add(i);
    });
  }
  return out;
}

/** Runs sections in order. exam=true plays each section once (no replay); practice allows replay and shows the transcript after submit. */
export function mountListeningTest(root: HTMLElement, sections: ListeningSection[], exam: boolean, mock: boolean, onDone?: (r: TestResult) => void): () => void {
  root.innerHTML = '';
  setIeltsTestInProgress('listening');
  let playback: Playback | null = null;
  const bar = h('div', 'ie-testbar');
  const status = h('span', 'ie-clock', ttsAvailable() ? t('listening.press_play', undefined, 'Press Play to start') : t('listening.tts_unavailable', undefined, 'Text-to-speech is not available in this browser'));
  const play = h('button', 'ie-btn ie-btn-primary', t('ielts.play_audio', undefined, 'Play'));
  const submit = h('button', 'ie-btn', t('ielts.submit_answers', undefined, 'Submit answers'));
  const tabs = h('div', 'ie-tabs');

  // Multi-accent cadence selector
  const accentSelect = h('select', 'ie-select ie-accent-select', `
    <option value="uk-rp">${t('listening.accent_uk')}</option>
    <option value="general-american">${t('listening.accent_us')}</option>
    <option value="australian">${t('listening.accent_au')}</option>
    <option value="scottish">${t('listening.accent_sc')}</option>
  `) as HTMLSelectElement;
  accentSelect.value = getPreferredAccent();
  accentSelect.title = t('listening.accent_title');
  accentSelect.addEventListener('change', () => {
    setPreferredAccent(accentSelect.value as AccentCadenceType);
  });

  // Authentic Cambridge 40Hz acoustic exam room resonance toggle
  const getAmbienceText = (active: boolean) =>
    t('listening.ambience_btn', { status: active ? t('nav.active') : t('nav.off') });

  const ambienceBtn = h(
    'button',
    'ie-btn ie-ambience-btn' + (isExamRoomAmbienceEnabled() ? ' is-active' : '')
  );
  ambienceBtn.innerHTML = `${icon('landmark', 13)} ${getAmbienceText(isExamRoomAmbienceEnabled())}`;
  ambienceBtn.title = t('listening.ambience_title');
  ambienceBtn.addEventListener('click', () => {
    const next = !isExamRoomAmbienceEnabled();
    setExamRoomAmbience(next);
    ambienceBtn.classList.toggle('is-active', next);
    ambienceBtn.innerHTML = `${icon('landmark', 13)} ${getAmbienceText(next)}`;
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
    pane.append(h('h2', '', `${t('ielts.section', undefined, 'Section')} ${s.section}: ${esc(s.title)}`));
    const form = renderQuestions(s.questions, n);
    n += s.questions.length;
    pane.append(form.el);
    panes.push(pane);
    forms.push(form);
    const tabBtn = h('button', 'ie-tab' + (i === 0 ? ' is-on' : ''), `${t('ielts.section', undefined, 'Section')} ${s.section}`);
    tabBtn.addEventListener('click', () => {
      playback?.stop();
      play.textContent = t('ielts.play_audio', undefined, 'Play');
      cur = i;
      panes.forEach((x, j) => { x.hidden = j !== i; });
      tabs.querySelectorAll('.ie-tab').forEach((x, j) => x.classList.toggle('is-on', j === i));
      refresh();
    });
    tabs.append(tabBtn);
  });
  const result = h('section', 'ie-result');
  result.hidden = true;
  root.append(bar, ...panes, result);

  const refresh = (): void => {
    play.disabled = !ttsAvailable() || (exam && played.has(cur));
    status.textContent = exam && played.has(cur) ? t('listening.played_once', undefined, 'Played once. Answer from memory, as in the exam.') : ttsAvailable() ? t('listening.press_play', undefined, 'Press Play to start') : status.textContent;
  };

  play.addEventListener('click', () => {
    if (playback) { playback.stop(); playback = null; play.textContent = t('ielts.play_audio', undefined, 'Play'); return; }
    played.add(cur);
    play.textContent = exam ? t('listening.playing', undefined, 'Playing…') : t('listening.stop', undefined, 'Stop');
    if (exam) play.disabled = true;
    playback = playSection(sections[cur], {
      accent: accentSelect.value as AccentCadenceType,
      roomAmbience: isExamRoomAmbienceEnabled(),
      onLine: i => { status.textContent = t('listening.speaker_speaking', { speaker: sections[cur].script[i].speaker }, `${sections[cur].script[i].speaker} speaking…`); },
      onEnd: () => { playback = null; play.textContent = t('ielts.play_audio', undefined, 'Play'); refresh(); }
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
      const tr = h('details', 'ie-transcript', `<summary>${t('listening.transcript_section', { sec: sections[i].section }, `Transcript: Section ${sections[i].section}`)}</summary>` + sections[i].script.map(l => `<p><b>${esc(l.speaker)}:</b> ${esc(l.text)}</p>`).join(''));
      if (!exam && ttsAvailable()) {
        const marked = evidenceLineIndexes(sections[i], new Set(s.wrong));
        tr.querySelectorAll('p').forEach((p, j) => {
          if (!marked.has(j)) return;
          const replayBtn = h('button', 'ie-btn ie-btn-sm', t('listening.hear_at_08x', undefined, 'Hear at 0.8x'));
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
    setIeltsTestInProgress(null);
    result.hidden = false;
    const correctText = t('reading.result_correct', { raw: total.raw, of: total.of }, `${total.raw}/${total.of} correct`);
    const noteText = t('listening.result_note', undefined, 'Band is scaled to 40 questions. Browser voices are not real exam audio; treat the band as a guide.');
    result.innerHTML = `${bandBadge(band, 'Listening')}<div><h3>${correctText}</h3><p class="ie-note">${noteText}</p><ul class="ie-breakdown">${typeBreakdown(total.byType)}</ul></div>`;
    panes.forEach(x => { x.hidden = false; });
    tabs.hidden = true;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onDone?.({ raw: total.raw, of: total.of, band, byType: total.byType });
  });

  refresh();
  return () => {
    setIeltsTestInProgress(null);
    playback?.stop();
    replay?.stop();
    setExamRoomAmbience(false);
  };
}

export function listeningView(root: HTMLElement): () => void {
  let stop = () => { };
  // Navigation to #listening-traps (ie-lab-banner) is unified in main.ts top subnavigation bar
  const list = h('div', 'ie-cards');

  root.append(
    h('h1', 'ie-title', t('ielts.nav_listening', undefined, 'Academic Listening')),
    h('p', 'ie-lead', t('ielts.listening_lead', undefined, 'Ten questions per section, voiced by browser text-to-speech with a different voice per speaker. Practice mode lets you replay; the mock plays each section once.')),
    list
  );
  SECTIONS.forEach(s => {
    const spkKey = s.speakers.length === 1 ? 'listening.speakers_count_one' : 'listening.speakers_count';
    const spkText = t(spkKey, { count: s.speakers.length }, s.speakers.length === 1 ? '1 speaker' : `${s.speakers.length} speakers`);
    const qCountText = t('listening.questions_count', { count: s.questions.length }, `${s.questions.length} questions`);
    const c = h('button', 'ie-card', `<b>${t('ielts.section', undefined, 'Section')} ${s.section}: ${esc(s.title)}</b><span>${spkText}</span><small>${qCountText}</small>`);
    c.addEventListener('click', () => {
      root.innerHTML = '';
      const back = h('button', 'ie-btn', t('ielts.all_sections', undefined, 'All sections'));
      back.addEventListener('click', () => { stop(); root.innerHTML = ''; stop = listeningView(root); });
      const host = h('div', 'ie-stage');
      root.append(back, host);
      stop = mountListeningTest(host, [s], false, false);
    });
    list.append(c);
  });
  if (!SECTIONS.length) list.append(h('p', 'ie-note', t('listening.no_sections', undefined, 'No sections loaded yet.')));
  return () => stop();
}
