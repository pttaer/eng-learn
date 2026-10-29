import speakingData from '../data/speaking.json';
import { SpeakingData, SpeakingPart2, ComparativeModelAnswer } from '../types';
import { AcousticEngine, AcousticAnalysis } from '../../core/acoustic-engine';
import { addAttempt } from '../progress';
import { DESCRIPTORS, RUBRIC } from '../writing-heuristics';
import { fluency, fluencyNote, Fluency } from '../fluency';
import { bandBadge, countdown, Countdown, esc, fmtTime, h } from '../ui';
import { playText, ttsAvailable, Playback } from '../tts';
import { icon } from '../../utils/icons';
import { t } from '../../core/i18n';

const DATA = speakingData as SpeakingData;
const engine = new AcousticEngine();
// Live timers and an alive flag so leaving the view mid-session never fires a timer or reopens the mic elsewhere.
const timers = new Set<Countdown>();
let alive = false;

function timer(seconds: number, onTick: (left: number) => void, onEnd: () => void): Countdown {
  const cd = countdown(seconds, onTick, () => { timers.delete(cd); if (alive) onEnd(); });
  timers.add(cd);
  return cd;
}

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

/** Examiner voice: reads the question aloud with browser TTS when available. */
function say(text: string): void {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB';
  speechSynthesis.speak(u);
}

/** Record one answer, cut off at `seconds`. Null when the mic is unavailable or the view was left. */
async function record(host: HTMLElement, seconds: number): Promise<AcousticAnalysis | null> {
  if (!(await engine.init())) {
    host.append(h('p', 'ie-note', t('speaking.mic_unavailable', undefined, 'Microphone unavailable. Speak aloud anyway and rate yourself.')));
    return null;
  }
  if (!alive) return null;
  await engine.startRecording();
  return new Promise(resolve => {
    const clock = h('span', 'ie-clock');
    const stop = h('button', 'ie-btn ie-btn-primary', t('speaking.btn_stop', undefined, 'Stop'));
    const row = h('div', 'ie-testbar');
    row.append(clock, stop);
    host.append(row);
    let cd: Countdown;
    const done = async (): Promise<void> => { cd.stop(); timers.delete(cd); row.remove(); resolve(await engine.stopRecording()); };
    cd = timer(seconds, l => { clock.textContent = fmtTime(l); }, done);
    stop.addEventListener('click', done);
  });
}

function metrics(f: Fluency): string {
  return `Speaking ${f.speakingSec}s, about ${f.estWpm} words/min (estimate), ${f.pauses} pauses, ${f.longPauses} over 1 s. ${fluencyNote(f)}`;
}

function fluencyHint(a: AcousticAnalysis | null): string {
  if (!a) return '';
  return `<p class="ie-note">${metrics(fluency(a.energySamples))}</p><audio controls src="${a.audioUrl}"></audio>`;
}

/** Sums takes into one session-level fluency picture. */
function total(takes: AcousticAnalysis[]): Fluency | null {
  if (!takes.length) return null;
  const fs = takes.map(tTake => fluency(tTake.energySamples));
  const sum = (k: keyof Fluency): number => fs.reduce((a, f) => a + f[k], 0);
  const sec = sum('speakingSec');
  return { speakingSec: Math.round(sec), pauses: sum('pauses'), longPauses: sum('longPauses'), meanRunSec: Math.round((sec / Math.max(1, sum('pauses') + fs.length)) * 10) / 10, syllables: sum('syllables'), estWpm: sec ? Math.round((sum('syllables') / 1.5) * (60 / sec)) : 0 };
}

/** Asks each question in turn (read aloud), records up to `seconds`, then calls onDone. */
function askAll(stage: HTMLElement, label: string, qs: string[], seconds: number, takes: AcousticAnalysis[], onDone: () => void): void {
  let i = 0;
  const ask = (): void => {
    if (!alive) return;
    if (i >= qs.length) { onDone(); return; }
    stage.innerHTML = `<p class="ie-note">${esc(label)}: question ${i + 1} of ${qs.length}</p><p class="ie-cue">${esc(qs[i])}</p>`;
    say(qs[i]);
    const go = h('button', 'ie-btn ie-btn-primary', t('speaking.btn_answer_max', { seconds }, `Answer (${seconds} s max)`));
    go.addEventListener('click', async () => {
      go.remove();
      const a = await record(stage, seconds);
      if (!alive) return;
      if (a) takes.push(a);
      stage.insertAdjacentHTML('beforeend', fluencyHint(a));
      const nx = h('button', 'ie-btn', i + 1 < qs.length ? t('ielts.next_question', undefined, 'Next question') : t('common.continue', undefined, 'Continue'));
      nx.addEventListener('click', () => { i++; ask(); });
      stage.append(nx);
    });
    stage.append(go);
  };
  ask();
}

function rater(host: HTMLElement, itemId: string, summary = ''): void {
  const rows = RUBRIC.speaking.map((c, i) => `<label class="ie-rate"><span>${c}</span><select data-i="${i}">${[5, 5.5, 6, 6.5, 7, 7.5, 8].map(b => `<option value="${b}"${b === 6 ? ' selected' : ''}>${b.toFixed(1)}</option>`).join('')}</select></label>`).join('');
  const box = h('div', 'ie-result ie-feedback', `<div class="ie-feedback-col"><h3>${t('ielts.rate_yourself', undefined, 'Rate yourself')}</h3><p class="ie-note">7 = ${esc(DESCRIPTORS[7])}</p>${summary}${rows}<div class="ie-estimate"></div><button class="ie-btn ie-btn-primary ie-save">${t('ielts.save_estimate', undefined, 'Save estimate')}</button></div>`);
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
    (e.target as HTMLButtonElement).textContent = t('speaking.btn_saved', undefined, 'Saved');
  });
}

/** Band-6 vs band-7 contrast when the card has one, else the band-7 model alone. */
function samples(c: SpeakingPart2): HTMLElement {
  if (!c.band6 || !c.notes) return h('div', 'ie-stage', `<h3>${t('speaking.band7_model_title', undefined, 'Band 7 model answer')}</h3><p>${esc(c.modelAnswer)}</p>`);
  const n = c.notes;
  return h('div', 'ie-result ie-feedback', `<div class="ie-feedback-col"><h3>${t('speaking.band6_sample_title', undefined, 'Band 6 sample')}</h3><p>${esc(c.band6)}</p></div><div class="ie-feedback-col"><h3>${t('speaking.band7_sample_title', undefined, 'Band 7 sample')}</h3><p>${esc(c.modelAnswer)}</p></div><div class="ie-feedback-wide"><h3>${t('speaking.what_separates_6_7', undefined, 'What separates 6 from 7')}</h3><p><b>${t('speaking.criteria_fc', undefined, 'Fluency and coherence.')}</b> ${esc(n.fc)}</p><p><b>${t('speaking.criteria_lr', undefined, 'Lexical resource.')}</b> ${esc(n.lr)}</p><p><b>${t('speaking.criteria_gra', undefined, 'Grammar.')}</b> ${esc(n.gra)}</p><p><b>${t('speaking.criteria_pron', undefined, 'Pronunciation.')}</b> ${esc(n.pron)}</p></div>`);
}

/** Part 2 (1 min prep, 2 min talk) then Part 3 follow-ups, then samples and the rater. */
function longTurn(stage: HTMLElement, c: SpeakingPart2, takes: AcousticAnalysis[], itemId: string): void {
  stage.innerHTML = '';
  stage.append(h('p', 'ie-note', t('speaking.p2_long_turn', undefined, 'Part 2: long turn')), h('article', 'ie-passage ie-cuecard', `<p class="ie-cue">${esc(c.cue)}</p><p>${t('speaking.you_should_say', undefined, 'You should say:')}</p><ul>${c.bullets.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`));
  say(`${c.cue} You have one minute to prepare.`);
  const clock = h('p', 'ie-clock', '01:00');
  const skip = h('button', 'ie-btn', t('speaking.btn_start_speaking_now', undefined, 'Start speaking now'));
  const prep = h('div', 'ie-testbar');
  prep.append(clock, skip);
  const pad = h('div', 'ie-prep-card ie-notepad');
  const inputs = c.bullets.map((x, i) => {
    const row = h('div', 'ie-notepad-row', `<label class="ie-notepad-label">• ${esc(x)}</label>`);
    const inp = document.createElement('input');
    inp.className = 'ie-notepad-input';
    inp.placeholder = `Keyword for bullet ${i + 1}...`;
    row.append(inp); pad.append(row);
    return inp;
  });
  stage.append(h('p', 'ie-note', t('speaking.jot_keywords_note', undefined, 'Jot one keyword per bullet. The talk starts when the minute ends.')), prep, pad);
  const talk = async (): Promise<void> => {
    cd.stop(); timers.delete(cd); prep.remove(); pad.remove();
    const notes = inputs.map(x => x.value.trim()).filter(Boolean);
    if (notes.length) stage.append(h('ul', 'ie-notes-scratchpad', notes.map(n => `<li>${esc(n)}</li>`).join('')));
    stage.append(h('p', 'ie-lead', t('speaking.speak_now_note', undefined, 'Speak now. The recording stops at 2:00.')));
    const a = await record(stage, 120);
    if (!alive) return;
    if (a) takes.push(a);
    stage.insertAdjacentHTML('beforeend', fluencyHint(a));
    const next = h('button', 'ie-btn ie-btn-primary', t('speaking.btn_go_part3', undefined, 'Go to Part 3'));
    next.addEventListener('click', () => askAll(stage, t('speaking.part3_discussion', undefined, 'Part 3: discussion'), c.part3, 45, takes, () => finish(stage, c, takes, itemId)));
    stage.append(next);
  };
  const cd = timer(60, l => { clock.textContent = fmtTime(l); }, talk);
  skip.addEventListener('click', talk);
}

function finish(stage: HTMLElement, c: SpeakingPart2, takes: AcousticAnalysis[], itemId: string): void {
  stage.innerHTML = `<p class="ie-lead">${t('speaking.session_finished', undefined, 'Session finished. Compare with the samples, then rate yourself on the four criteria.')}</p>`;
  const tFluency = total(takes);
  stage.append(samples(c));
  renderComparativeModels(stage, c);
  rater(stage, itemId, tFluency ? `<p class="ie-note">${t('speaking.whole_session', undefined, 'Whole session:')} ${metrics(tFluency)}</p>` : '');
}

function fullTest(root: HTMLElement, back: () => void): void {
  root.innerHTML = '';
  const b = h('button', 'ie-btn', t('common.back', undefined, 'Back'));
  b.addEventListener('click', back);
  const stage = h('div', 'ie-stage');
  root.append(
    h('h1', 'ie-title', t('speaking.full_test_h1', undefined, 'Full speaking test')),
    h('p', 'ie-lead', t('speaking.full_test_lead', undefined, 'About 11-14 minutes, as in the exam: Part 1 interview on two topics, Part 2 cue card with one minute to prepare, Part 3 discussion. The examiner reads each question aloud.')),
    b,
    stage
  );
  const [t1, t2] = [...DATA.part1].sort(() => Math.random() - 0.5);
  const card = pick(DATA.part2);
  const qs = [...t1.questions.slice(0, 4), ...t2.questions.slice(0, 4)];
  const takes: AcousticAnalysis[] = [];
  const start = h('button', 'ie-btn ie-btn-primary', t('speaking.btn_start_test', undefined, 'Start the test'));
  start.addEventListener('click', () => askAll(stage, `Part 1: ${t1.topic}, then ${t2.topic}`, qs, 30, takes, () => longTurn(stage, card, takes, `full-${card.id}`)));
  stage.append(start);
}

function part1(root: HTMLElement, back: () => void): void {
  stopAll();
  root.innerHTML = '';
  root.append(
    h('h1', 'ie-title', t('speaking.p1_intro_title', undefined, 'Part 1: Introduction and interview')),
    h('p', 'ie-lead', t('speaking.p1_intro_lead', undefined, 'Answer each question in 2-3 sentences (20-30 seconds). Extend with a reason or example.'))
  );
  const list = h('div', 'ie-cards');
  DATA.part1.forEach(topicItem => {
    const c = h('button', 'ie-card', `<b>${esc(topicItem.topic)}</b><small>${t('speaking.part1_topics', { count: topicItem.questions.length }, `${topicItem.questions.length} questions`)}</small>`);
    c.addEventListener('click', () => runPart1(root, topicItem.topic, topicItem.questions, back));
    list.append(c);
  });
  const b = h('button', 'ie-btn', t('common.back', undefined, 'Back'));
  b.addEventListener('click', back);
  root.append(b, list);
}

function runPart1(root: HTMLElement, topic: string, qs: string[], back: () => void): void {
  root.innerHTML = '';
  const b = h('button', 'ie-btn', t('speaking.btn_all_topics', undefined, 'All topics'));
  b.addEventListener('click', () => part1(root, back));
  const stage = h('div', 'ie-stage');
  root.append(b, h('h2', 'ie-sub', esc(topic)), stage);
  const takes: AcousticAnalysis[] = [];
  askAll(stage, topic, qs, 30, takes, () => {
    const tFluency = total(takes);
    stage.innerHTML = `<p class="ie-lead">${t('speaking.topic_finished', undefined, 'Topic finished.')}</p>`;
    rater(stage, `p1-${topic}`, tFluency ? `<p class="ie-note">${metrics(tFluency)}</p>` : '');
  });
}

function part2(root: HTMLElement, back: () => void): void {
  stopAll();
  root.innerHTML = '';
  root.append(
    h('h1', 'ie-title', t('speaking.p23_title', undefined, 'Parts 2 and 3: Long turn and discussion')),
    h('p', 'ie-lead', t('speaking.p23_lead', undefined, 'One minute to prepare, then speak for up to two minutes. Part 3 follow-ups come after. Cards marked with a sample show band 6 and band 7 side by side.'))
  );
  const list = h('div', 'ie-cards');
  DATA.part2.forEach(c => {
    const card = h('button', 'ie-card', `<b>${esc(c.cue)}</b><small>${c.part3.length} Part 3 questions${c.band6 ? ' · band 6 vs 7 sample' : ''}</small>`);
    card.addEventListener('click', () => runPart2(root, c, back));
    list.append(card);
  });
  const b = h('button', 'ie-btn', t('common.back', undefined, 'Back'));
  b.addEventListener('click', back);
  root.append(b, list);
}

function buildBand65Model(c: SpeakingPart2): string {
  const topic = c.cue.replace(/^describe\s+(a\s+|an\s+|the\s+)?/i, '').replace(/[.,!?;:]+$/, '');
  return `Well, I'd like to talk about ${topic}. To be honest, it is something that happened a while ago, actually about two years ago, or maybe a bit earlier. In the beginning, I wasn't really sure what to do, but then the situation changed and I decided to get involved. I spent quite a lot of time on it, and sometimes it was really challenging, I mean, I had to try again and again. Actually, my friends and family also supported me a lot during this time. In terms of what happened, there were many details and things to manage, and although I made some small mistakes at first, I managed to finish it in the end. Looking back at it now, what I felt was quite happy and satisfied with the result. I think it taught me an important lesson about patience and effort, and it's definitely an experience that I still remember clearly today.`;
}

function buildBand85Model(c: SpeakingPart2): string {
  const topic = c.cue.replace(/^describe\s+(a\s+|an\s+|the\s+)?/i, '').replace(/[.,!?;:]+$/, '');
  return `I'd like to reflect upon ${topic}, an experience that has had a profound and enduring impact on my personal outlook. What immediately comes to mind is the sheer contrast between my initial expectations and the nuanced reality that unfolded. At the outset, I found myself navigating a fairly steep learning curve, which necessitated both analytical problem-solving and adaptive resilience. Throughout the process, I was fortunate to collaborate with individuals whose guidance was indispensable in overcoming unforeseen hurdles. What made this endeavor particularly rewarding was not merely reaching the intended milestone, but rather the broader cognitive shift it sparked in how I approach complex responsibilities. In retrospect, the insights I gleaned from that journey have continued to inform my decision-making and have profoundly shaped my long-term perspective.`;
}

export function getComparativeModels(c: SpeakingPart2): ComparativeModelAnswer[] {
  if (c.comparativeModels && c.comparativeModels.length >= 3) {
    return c.comparativeModels;
  }

  return [
    {
      band: '6.5',
      text: buildBand65Model(c),
      commentary: `Examiner Analysis (Band 6.5):
• Fluency & Coherence (6.5): Willing to speak at length though with occasional loss of coherence due to repetition ('actually', 'situation') and self-correction ('I mean'). Connectives are present but somewhat repetitive.
• Lexical Resource (6.5): Vocabulary is generally adequate to convey meaning, but relies on common terms ('things', 'manage') with limited idiomatic range.
• Grammatical Range & Accuracy (6.5): Mix of simple and complex sentence forms. Complex structures are attempted with some minor inaccuracies in tense or preposition use.
• Pronunciation (6.5): Generally easy to understand, with occasional lapses in stress placement or consonant clusters.`
    },
    {
      band: '7.5',
      text: c.modelAnswer,
      commentary: `Examiner Analysis (Band 7.5):
• Fluency & Coherence (7.5): Speaks at length without noticeable effort. Uses a range of discourse markers naturally to sequence points across all prompt bullets.
• Lexical Resource (7.5): Uses less common and idiomatic vocabulary with awareness of style and collocation throughout the monologue.
• Grammatical Range & Accuracy (7.5): Frequently error-free complex structures with only minor non-systematic slips.
• Pronunciation (7.5): Clear intonation, rhythm, and sentence stress throughout with positive phonological control.`
    },
    {
      band: '8.5',
      text: buildBand85Model(c),
      commentary: `Examiner Analysis (Band 8.5):
• Fluency & Coherence (8.5): Speaks fluently with rare hesitations which are content-oriented rather than language searches. Develops the topic fully and coherently with sophisticated discourse markers.
• Lexical Resource (8.5): Sophisticated vocabulary repertoire used with flexibility and precision ('enduring impact', 'steep learning curve', 'adaptive resilience', 'cognitive shift').
• Grammatical Range & Accuracy (8.5): Full flexibility with complex syntactic structures executed with consistent grammatical accuracy.
• Pronunciation (8.5): Natural rhythm, expressive tonic stress, and effortless pitch movement with full native-like phonological control.`
    }
  ];
}

function renderComparativeModels(host: HTMLElement, c: SpeakingPart2): void {
  const models = getComparativeModels(c);
  const container = h('div', 'ie-comparative-models');
  container.append(h('h3', '', t('speaking.comparative_models_title', undefined, 'Comparative Model Answers & Examiner Commentary (Band 6.5 vs 7.5 vs 8.5)')));

  const tabsRow = h('div', 'ie-tabs ie-model-tabs');
  const cardBody = h('div', 'ie-model-card');

  let activeIndex = 1; // Default to Band 7.5
  let activePlayback: Playback | null = null;

  const renderActiveModel = (): void => {
    if (activePlayback) {
      activePlayback.stop();
      activePlayback = null;
    }
    cardBody.innerHTML = '';
    const m = models[activeIndex];

    const actionsRow = h('div', 'ie-testbar ie-model-actions');
    const playBtn = h('button', 'ie-btn ie-btn-primary ie-tts-btn', `🔊 Listen to Model (Band ${m.band})`);
    if (!ttsAvailable()) {
      playBtn.disabled = true;
      playBtn.textContent = 'TTS Unavailable in Browser';
    } else {
      playBtn.addEventListener('click', () => {
        if (activePlayback) {
          activePlayback.stop();
          activePlayback = null;
          playBtn.innerHTML = `${icon('volume', 13)} Listen to Model (Band ${m.band})`;
        } else {
          playBtn.innerHTML = `${icon('stop', 13)} Stop Audio`;
          activePlayback = playText(m.text, {
            rate: 0.95,
            onEnd: () => {
              activePlayback = null;
              playBtn.innerHTML = `${icon('volume', 13)} Listen to Model (Band ${m.band})`;
            }
          });
        }
      });
      playBtn.innerHTML = `${icon('volume', 13)} Listen to Model (Band ${m.band})`;
    }
    actionsRow.append(playBtn);

    const textBox = h('div', 'ie-model-text', `<p>${esc(m.text)}</p>`);
    const commentaryBox = h('div', 'ie-examiner-commentary',
      `<h4>Examiner Commentary & Rubric Breakdown</h4><div class="ie-note">${m.commentary.split('\n').map(line => `<p>${esc(line)}</p>`).join('')}</div>`
    );

    cardBody.append(actionsRow, textBox, commentaryBox);
  };

  models.forEach((m, idx) => {
    const tabBtn = h('button', `ie-tab ${idx === activeIndex ? 'is-on' : ''}`, `Band ${m.band}`);
    tabBtn.addEventListener('click', () => {
      if (activeIndex === idx) return;
      tabsRow.querySelectorAll('.ie-tab').forEach((tTab, i) => {
        tTab.classList.toggle('is-on', i === idx);
      });
      activeIndex = idx;
      renderActiveModel();
    });
    tabsRow.append(tabBtn);
  });

  container.append(tabsRow, cardBody);
  host.append(container);
  renderActiveModel();
}

function runPart2(root: HTMLElement, c: SpeakingPart2, back: () => void): void {
  root.innerHTML = '';
  const b = h('button', 'ie-btn', t('speaking.btn_all_cue_cards', undefined, 'All cue cards'));
  b.addEventListener('click', () => part2(root, back));
  const stage = h('div', 'ie-stage');
  root.append(b, stage);
  longTurn(stage, c, [], c.id);
}

function stopAll(): void {
  timers.forEach(tTimer => tTimer.stop());
  timers.clear();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (engine.isRecording) void engine.stopRecording();
}

export function speakingView(root: HTMLElement): () => void {
  alive = true;
  const menu = (): void => {
    stopAll();
    const existingBanner = root.querySelector('.ie-subnav-banner');
    root.innerHTML = '';
    if (existingBanner) root.append(existingBanner);
    root.append(h('h1', 'ie-title', t('speaking.title', undefined, 'Academic Speaking')), h('p', 'ie-lead', t('speaking.lead', undefined, 'Recordings stay on your device. Pace and pauses are measured from the audio as a hint; the band is your own rubric rating, so it is an estimate.')));
    const cards = h('div', 'ie-cards');
    const f = h('button', 'ie-card', `<b>${t('speaking.full_test_title', undefined, 'Full test')}</b><span>${t('speaking.full_test_sub', undefined, 'Parts 1, 2 and 3 in exam order')}</span><small>${t('speaking.full_test_time', undefined, '11-14 minutes')}</small>`);
    const a = h('button', 'ie-card', `<b>${t('speaking.part1_title', undefined, 'Part 1')}</b><span>${t('speaking.part1_sub', undefined, 'Interview')}</span><small>${t('speaking.part1_topics', { count: DATA.part1.length }, `${DATA.part1.length} topics`)}</small>`);
    const b = h('button', 'ie-card', `<b>${t('speaking.part23_title', undefined, 'Parts 2 and 3')}</b><span>${t('speaking.part23_sub', undefined, 'Cue card + discussion')}</span><small>${t('speaking.part23_cards', { count: DATA.part2.length }, `${DATA.part2.length} cue cards`)}</small>`);
    f.addEventListener('click', () => fullTest(root, menu));
    a.addEventListener('click', () => part1(root, menu));
    b.addEventListener('click', () => part2(root, menu));
    cards.append(f, a, b);
    root.append(cards);
  };
  menu();
  return () => { alive = false; stopAll(); engine.dispose(); };
}
