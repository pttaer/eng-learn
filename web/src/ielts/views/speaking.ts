import speakingData from '../data/speaking.json';
import { SpeakingData, SpeakingPart2, ComparativeModelAnswer } from '../types';
import { AcousticEngine, AcousticAnalysis } from '../../core/acoustic-engine';
import { addAttempt } from '../progress';
import { DESCRIPTORS, RUBRIC } from '../writing-heuristics';
import { bandBadge, countdown, Countdown, esc, fmtTime, h } from '../ui';
import { playText, ttsAvailable, Playback } from '../tts';
import { speakingSimulatorView } from './speaking-simulator';


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
  container.append(h('h3', '', 'Comparative Model Answers & Examiner Commentary (Band 6.5 vs 7.5 vs 8.5)'));

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
          playBtn.textContent = `🔊 Listen to Model (Band ${m.band})`;
        } else {
          playBtn.textContent = '⏹️ Stop Audio';
          activePlayback = playText(m.text, {
            rate: 0.95,
            onEnd: () => {
              activePlayback = null;
              playBtn.textContent = `🔊 Listen to Model (Band ${m.band})`;
            }
          });
        }
      });
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
      tabsRow.querySelectorAll('.ie-tab').forEach((t, i) => {
        t.classList.toggle('is-on', i === idx);
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
  const b = h('button', 'ie-btn', 'All cue cards');
  b.addEventListener('click', () => part2(root, back));
  const stage = h('div', 'ie-stage');
  root.append(b, h('article', 'ie-passage ie-cuecard', `<p class="ie-cue">${esc(c.cue)}</p><p>You should say:</p><ul>${c.bullets.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`), stage);
  const start = h('button', 'ie-btn ie-btn-primary', 'Start 1-minute preparation');
  stage.append(start);
  start.addEventListener('click', () => {
    start.remove();
    const prepContainer = h('div', 'ie-prep-card');
    const headerRow = h('div', 'ie-testbar ie-prep-header');
    const clock = h('span', 'ie-clock', '01:00');
    const skipBtn = h('button', 'ie-btn ie-btn-primary', 'Start speaking now (Skip prep timer)');
    headerRow.append(clock, skipBtn);

    const prepGuide = h('p', 'ie-note',
      '<b>1-Minute 4-Keyword Strategy (Keino Campbell):</b> Jot down 1 key word/phrase per bullet point on the notepad below to anchor your 2-minute talk.'
    );

    const notepad = h('div', 'ie-notepad');
    const inputs: HTMLInputElement[] = [];
    c.bullets.forEach((bullet, idx) => {
      const row = h('div', 'ie-notepad-row');
      const label = h('label', 'ie-notepad-label', `• Bullet ${idx + 1}: ${esc(bullet)}`);
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'ie-notepad-input';
      input.placeholder = `Keyword for bullet ${idx + 1}...`;
      row.append(label, input);
      notepad.append(row);
      inputs.push(input);
    });

    prepContainer.append(headerRow, prepGuide, notepad);
    stage.append(prepContainer);

    let cd: Countdown;
    const finishPrep = (): void => {
      cd.stop();
      const userNotes = inputs.map(inp => inp.value.trim()).filter(Boolean);
      prepContainer.remove();

      if (userNotes.length > 0) {
        const scratchpad = h('div', 'ie-notes-scratchpad',
          `<h4>📝 1-Minute 4-Keyword Preparation Notes</h4><ul>${userNotes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>`
        );
        stage.append(scratchpad);
      }
      talk();
    };

    cd = countdown(60, l => { clock.textContent = fmtTime(l); }, finishPrep);
    skipBtn.addEventListener('click', finishPrep);
  });

  const talk = async (): Promise<void> => {
    stage.append(h('p', 'ie-lead', 'Speak now. The recording stops at 2:00.'));
    const a = await record(stage, 120);
    stage.insertAdjacentHTML('beforeend', fluencyHint(a));
    stage.append(
      h('h3', '', 'Part 3 follow-up'),
      h('ol', 'ie-steps', c.part3.map(q => `<li>${esc(q)}</li>`).join('')),
      h('p', 'ie-note', 'Answer these aloud for 30-40 seconds each, giving reasons and comparing viewpoints.')
    );

    renderComparativeModels(stage, c);

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
    const sim = h('button', 'ie-card', `<b>3-Part Examiner Simulator</b><span>Interactive Real-Time Drill</span><small>Direct Answer formula, 60s 4-keyword prep, native fillers & comparative deconstructions</small>`);
    a.addEventListener('click', () => part1(root, menu));
    b.addEventListener('click', () => part2(root, menu));
    sim.addEventListener('click', () => speakingSimulatorView(root, menu));
    cards.append(a, b, sim);
    root.append(cards);
  };
  menu();
  return () => engine.dispose();
}

