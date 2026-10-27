import { h, esc } from '../ui';
import { playText, ttsAvailable, Playback } from '../tts';
import { DistractorEngine } from '../distractor-engine';
import { AudioSynthesizer } from '../../core/audio-synthesizer';
import { icon, IconName } from '../../utils/icons';
import { t } from '../../core/i18n';

export type TrapCategory = 'self_correction' | 'qualifier' | 'reversal' | 'map_direction';

export interface TrapScenario {
  id: string;
  section: 1 | 2 | 3 | 4;
  category: TrapCategory;
  categoryLabel: string;
  categoryIcon: string;
  title: string;
  script: string;
  question: string;
  targetAnswer: string;
  maxWords: number;
  decoy: string;
  trapCue: string;
  explanation: string;
  keinoRule: string;
}

export const TRAP_SCENARIOS: TrapScenario[] = [
  // Category 1: Oral Self-Corrections
  {
    id: 'trap-01',
    section: 1,
    category: 'self_correction',
    categoryLabel: 'Oral Self-Correction',
    categoryIcon: '🔄',
    title: 'Driving Assessment Booking',
    script: "Right, so we can schedule your driving assessment for Thursday morning... oh no, wait a minute, the examiner is on leave then. It will have to be Friday.",
    question: 'On which day is the driving assessment scheduled?',
    targetAnswer: 'Friday',
    maxWords: 1,
    decoy: 'Thursday',
    trapCue: 'no, wait a minute',
    explanation: 'The speaker first suggests Thursday, but notices the conflict right away and corrects it to Friday with "no, wait a minute".',
    keinoRule: 'Rule 1 (Section 1 Dialogues): Numbers, dates, and times are frequently revised mid-utterance. Never write down the first value heard until you listen past the pause.'
  },
  {
    id: 'trap-02',
    section: 1,
    category: 'self_correction',
    categoryLabel: 'Oral Self-Correction',
    categoryIcon: '🔄',
    title: 'Student Membership Discount Fee',
    script: "The annual membership fee was quoted at sixty pounds, but actually, sorry, with the student discount applied it comes to forty-five pounds.",
    question: 'How much is the discounted membership fee?',
    targetAnswer: 'forty-five pounds',
    maxWords: 2,
    decoy: 'sixty pounds',
    trapCue: 'actually, sorry',
    explanation: 'The sixty-pound quote is corrected by "actually, sorry", changing the final fee to forty-five pounds.',
    keinoRule: 'Rule 2 (Spoken Repairs): Discourse markers such as "actually, sorry", "I mean", and "or rather" invalidate preceding nouns or digits in favor of the subsequent revised phrase.'
  },
  {
    id: 'trap-03',
    section: 2,
    category: 'self_correction',
    categoryLabel: 'Oral Self-Correction',
    categoryIcon: '🔄',
    title: 'Guest Lecture Auditorium Relocation',
    script: "The guest lecture was originally scheduled for the conference room on the ground floor, or rather, due to high attendance, it has been moved to the auditorium.",
    question: 'Where will the guest lecture take place?',
    targetAnswer: 'auditorium',
    maxWords: 1,
    decoy: 'conference room',
    trapCue: 'or rather',
    explanation: 'The speaker changes the venue with "or rather", moving the talk from the conference room to the auditorium.',
    keinoRule: 'Rule 3 (Section 2 Logistics): Institutional monologues frequently state original plans before pivoting with "or rather" or "let me clarify" to the final venue.'
  },

  // Category 2: Qualifier Traps
  {
    id: 'trap-04',
    section: 2,
    category: 'qualifier',
    categoryLabel: 'Qualifier Trap',
    categoryIcon: '⚠️',
    title: 'Sports Complex Pool Access Restrictions',
    script: "While the fitness suite is open to all visitors, only registered students are permitted to access the Olympic swimming pool without a guest pass.",
    question: 'Who can access the Olympic swimming pool without a pass?',
    targetAnswer: 'registered students',
    maxWords: 2,
    decoy: 'all visitors',
    trapCue: 'only',
    explanation: 'The phrase "all visitors" applies only to the fitness suite. "Only" restricts free pool use to registered students.',
    keinoRule: 'Rule 4 (Absolute Qualifiers): Watch for terms like "only", "all", and "solely". Examiners set traps by offering an inclusive group when the question demands an exclusive condition.'
  },
  {
    id: 'trap-05',
    section: 3,
    category: 'qualifier',
    categoryLabel: 'Qualifier Trap',
    categoryIcon: '⚠️',
    title: 'Clinical Sleep Deprivation Cohort',
    script: "The survey revealed that while most participants reported mild fatigue, solely laboratory technicians experienced chronic sleep deprivation.",
    question: 'Which group experienced chronic sleep deprivation?',
    targetAnswer: 'laboratory technicians',
    maxWords: 2,
    decoy: 'most participants',
    trapCue: 'solely',
    explanation: '"Solely" singles out laboratory technicians for chronic sleep loss, while "most participants" had only mild fatigue.',
    keinoRule: 'Rule 5 (Academic Quantifiers): Do not confuse majority terms ("most", "predominantly") with restrictive identifiers ("solely", "exclusively"). Verify the exact symptom or attribute requested.'
  },
  {
    id: 'trap-06',
    section: 4,
    category: 'qualifier',
    categoryLabel: 'Qualifier Trap',
    categoryIcon: '⚠️',
    title: 'Atmospheric Thermal Retention Driver',
    script: "Previous atmospheric models assumed solar irradiance was the primary driver, but recent satellite telemetry proves that cloud cover is exclusively responsible for localized thermal retention.",
    question: 'According to the lecturer, what factor does recent satellite telemetry identify as the primary mechanism for localized thermal retention?',
    targetAnswer: 'cloud cover',
    maxWords: 2,
    decoy: 'solar irradiance',
    trapCue: 'exclusively',
    explanation: 'The lecturer rejects solar irradiance and uses "exclusively" to name cloud cover as the real cause.',
    keinoRule: 'Rule 6 (Scientific Hypotheses): In Section 4 academic lectures, historical theories are routinely posited as initial decoys before the speaker unveils the definitive factor using absolute qualifiers.'
  },

  // Category 3: Reversal Traps
  {
    id: 'trap-07',
    section: 1,
    category: 'reversal',
    categoryLabel: 'Reversal Trap',
    categoryIcon: '🔀',
    title: 'Island Excursion Transport Reservation',
    script: "The committee had planned to charter an express coach for the excursion; however, because of highway repairs, they opted for an electric ferry instead.",
    question: 'What mode of transport was booked for the excursion?',
    targetAnswer: 'electric ferry',
    maxWords: 2,
    decoy: 'express coach',
    trapCue: 'however / instead',
    explanation: 'The plan for an "express coach" is reversed by "however" and "instead", making the electric ferry the booked option.',
    keinoRule: 'Rule 7 (Reversal Markers): Contrastive conjunctions like "however", "but", and "instead" reverse the premise. The authentic target always lies in the clause trailing the contrast.'
  },
  {
    id: 'trap-08',
    section: 3,
    category: 'reversal',
    categoryLabel: 'Reversal Trap',
    categoryIcon: '🔀',
    title: 'Economic Dissertation Sector Selection',
    script: "Professor Higgins recommended focusing the case study on retail banking; on the contrary, we concluded that renewable energy offered far richer empirical data.",
    question: 'What sector did the students select for their case study?',
    targetAnswer: 'renewable energy',
    maxWords: 2,
    decoy: 'retail banking',
    trapCue: 'on the contrary',
    explanation: 'The students set aside the tutor\'s advice on retail banking using "on the contrary", picking renewable energy instead.',
    keinoRule: 'Rule 8 (Tutorial Counter-Proposals): Tutors routinely offer advice in Section 3, but candidate evaluation depends on student consensus. Look for "on the contrary" or "we felt that".'
  },
  {
    id: 'trap-09',
    section: 4,
    category: 'reversal',
    categoryLabel: 'Reversal Trap',
    categoryIcon: '🔀',
    title: 'Commercial Fuselage Structural Material',
    script: "Early aerospace engineers utilized titanium alloys for the outer fuselage; instead, modern commercial airliners rely predominantly on carbon composites to minimize structural weight.",
    question: 'What material do modern airliners rely on for the fuselage?',
    targetAnswer: 'carbon composites',
    maxWords: 2,
    decoy: 'titanium alloys',
    trapCue: 'instead',
    explanation: 'Titanium alloys describe older aircraft; "instead" introduces carbon composites as the material used in modern airliners.',
    keinoRule: 'Rule 9 (Chronological Pivots): Speakers contrast past methods with current practices. Words like "historically" or "early" flag decoys, while "instead" introduces the contemporary answer.'
  },

  // Category 4: Map Navigation Directions
  {
    id: 'trap-10',
    section: 2,
    category: 'map_direction',
    categoryLabel: 'Map Navigation Decoy',
    categoryIcon: '🗺️',
    title: 'University Campus Orientation Pathway',
    script: "Starting from the main library entrance, proceed north along University Avenue. You\'ll pass the student counseling center on your left, then turn left past the roundabout, and the student health clinic is situated immediately opposite the sports pavilion.",
    question: 'What building is located opposite the sports pavilion?',
    targetAnswer: 'health clinic',
    maxWords: 2,
    decoy: 'student counseling center',
    trapCue: 'turn left past the roundabout / opposite',
    explanation: 'The counseling center is just a landmark along the way; continuing past the roundabout leads to the health clinic opposite the sports pavilion.',
    keinoRule: 'Rule 10 (Spatial Path Tracking): Keep your cursor actively moving along the street path as directed. Intermediate reference landmarks (like the counseling center) are waypoints, not the final destination.'
  },
  {
    id: 'trap-11',
    section: 2,
    category: 'map_direction',
    categoryLabel: 'Map Navigation Decoy',
    categoryIcon: '🗺️',
    title: 'Heritage Village Riverside Navigation',
    script: "If you cross the stone bridge and follow the riverside footpath southward, ignore the pathway toward the pottery workshop; rather, bear right and you will find the traditional blacksmith workshop right beside the waterwheel.",
    question: 'Which workshop is located beside the waterwheel?',
    targetAnswer: 'blacksmith workshop',
    maxWords: 2,
    decoy: 'pottery workshop',
    trapCue: 'ignore the pathway / bear right',
    explanation: 'The speaker tells you to ignore the pottery path and bear right, which leads to the blacksmith workshop beside the waterwheel.',
    keinoRule: 'Rule 11 (Negative Waypoint Warnings): Decoy turns are flagged with negative instructions ("ignore", "do not take", "avoid"). Same-category distractors challenge careful listening.'
  },
  {
    id: 'trap-12',
    section: 2,
    category: 'map_direction',
    categoryLabel: 'Map Navigation Decoy',
    categoryIcon: '🗺️',
    title: 'Wetland Boardwalk Trail Orientation',
    script: "Walk along the pine trail until you reach the wooden observation tower. Do not take the eastern ridge toward the deer meadow; instead, continue straight through the wetland boardwalk to reach the bird sanctuary.",
    question: 'Where does the wetland boardwalk lead?',
    targetAnswer: 'bird sanctuary',
    maxWords: 2,
    decoy: 'deer meadow',
    trapCue: 'do not take / instead, continue straight',
    explanation: 'The deer meadow is ruled out and the tower is only a waypoint. Following the boardwalk straight ahead leads to the bird sanctuary.',
    keinoRule: 'Rule 12 (Terminal vs Intermediate Points): Phrasing such as "until you reach" indicates progress markers, while "instead" + "continue to reach" signals the authentic objective.'
  }
];

function playSfx(type: 'absorb' | 'alarm' | 'level-up' | 'click'): void {
  try {
    AudioSynthesizer.play(type);
  } catch {
    // Graceful silent fallback
  }
}

export function listeningTrapsView(root: HTMLElement): () => void {
  root.innerHTML = '';

  let currentIdx = 0;
  let activeFilter: 'all' | TrapCategory = 'all';
  let playback: Playback | null = null;
  let speechRate = 1.0;
  let animFrameId: number | null = null;
  const masteredSet = new Set<string>();

  // Container elements
  const header = h('header', 'ie-traps-header');
  const titleEl = h('h1', 'ie-title');
  titleEl.innerHTML = `${icon('target', 18)} Listening Trap &amp; Oral Self-Correction Audio Lab`;
  const leadDetails = h('details', 'ie-theory-details');
  leadDetails.innerHTML = `
    <summary>Cambridge Trap Detection Guidelines (Sections 1–4)</summary>
    <p class="ie-lead">Train your ear to detect oral self-corrections, restrictive qualifiers, reversal markers, and map direction decoys in real time.</p>
  `;
  header.append(titleEl, leadDetails);

  const trackerBar = h('div', 'ie-testbar ie-traps-tracker');
  const filterRow = h('div', 'ie-tabs ie-traps-filter-tabs');
  const stage = h('div', 'ie-stage ie-traps-stage');

  root.append(header, trackerBar, filterRow, stage);

  // Filter tabs setup
  const FILTERS: { id: 'all' | TrapCategory; label: string; iconName: IconName }[] = [
    { id: 'all', label: 'All Traps (12)', iconName: 'layers' },
    { id: 'self_correction', label: 'Oral Self-Corrections (3)', iconName: 'rotateCcw' },
    { id: 'qualifier', label: 'Qualifiers (3)', iconName: 'alertTriangle' },
    { id: 'reversal', label: 'Reversals (3)', iconName: 'compass' },
    { id: 'map_direction', label: 'Map Directions (3)', iconName: 'compass' },
  ];

  const updateFilters = (): void => {
    filterRow.innerHTML = '';
    FILTERS.forEach(f => {
      const btn = h('button', `ie-tab ${activeFilter === f.id ? 'is-on' : ''}`);
      btn.innerHTML = `${icon(f.iconName, 13)} ${f.label}`;
      btn.addEventListener('click', () => {
        if (activeFilter === f.id) return;
        activeFilter = f.id;
        currentIdx = 0;
        updateFilters();
        renderCard();
      });
      filterRow.append(btn);
    });
  };

  const getFilteredScenarios = (): TrapScenario[] => {
    if (activeFilter === 'all') return TRAP_SCENARIOS;
    return TRAP_SCENARIOS.filter(s => s.category === activeFilter);
  };

  const updateTracker = (): void => {
    trackerBar.innerHTML = '';
    const filtered = getFilteredScenarios();
    const countSpan = h('span', 'ie-trap-count', `Trap ${currentIdx + 1} of ${filtered.length}`);
    const masteredBadge = h('span', 'ie-badge-mastered', `🏆 Mastered: ${masteredSet.size} / 12`);
    
    const navGroup = h('div', 'ie-traps-nav-group');
    const prevBtn = h('button', 'ie-btn ie-btn-sm', '← Prev');
    prevBtn.disabled = currentIdx === 0;
    prevBtn.addEventListener('click', () => {
      if (currentIdx > 0) {
        currentIdx--;
        renderCard();
      }
    });

    const nextBtn = h('button', 'ie-btn ie-btn-sm', 'Next →');
    nextBtn.disabled = currentIdx >= filtered.length - 1;
    nextBtn.addEventListener('click', () => {
      if (currentIdx < filtered.length - 1) {
        currentIdx++;
        renderCard();
      }
    });

    navGroup.append(prevBtn, nextBtn);
    trackerBar.append(countSpan, masteredBadge, navGroup);
  };

  const renderCard = (): void => {
    if (playback) {
      playback.stop();
      playback = null;
    }
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    stage.innerHTML = '';
    const filtered = getFilteredScenarios();
    if (currentIdx >= filtered.length) currentIdx = 0;
    const s = filtered[currentIdx];
    updateTracker();

    const card = h('article', 'ie-passage ie-trap-card');

    // Header info
    const metaBar = h('div', 'ie-trap-metabar');
    const badge = h('span', 'ie-trap-category-pill', `${s.categoryIcon} ${s.categoryLabel} • Section ${s.section}`);
    const title = h('h2', 'ie-sub', s.title);
    metaBar.append(badge, title);

    // Audio & Waveform Console
    const audioConsole = h('div', 'ie-trap-audio-console');
    const canvas = document.createElement('canvas');
    canvas.className = 'ie-trap-waveform';
    canvas.width = 560;
    canvas.height = 36;
    const ctx = canvas.getContext('2d')!;

    // Waveform rendering loop
    let isPlaying = false;
    let wavePhase = 0;
    const drawWaveform = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h_mid = canvas.height / 2;

      // Draw center baseline
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h_mid);
      ctx.lineTo(w, h_mid);
      ctx.stroke();

      if (isPlaying) {
        // Draw active dynamic harmonics
        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const norm = x / w;
          const env = Math.sin(norm * Math.PI); // tapering envelope
          const wave = Math.sin(norm * 24 + wavePhase) * 16 * env +
                       Math.sin(norm * 48 - wavePhase * 1.5) * 8 * env;
          const y = h_mid + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Secondary glow harmonic
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const norm = x / w;
          const env = Math.sin(norm * Math.PI);
          const wave = Math.cos(norm * 18 + wavePhase * 0.8) * 10 * env;
          const y = h_mid + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        wavePhase += 0.12;
        animFrameId = requestAnimationFrame(drawWaveform);
      } else {
        // Flat resting line
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, h_mid);
        ctx.lineTo(w, h_mid);
        ctx.stroke();
      }
    };
    drawWaveform();

    // Player action row
    const playBar = h('div', 'ie-testbar ie-trap-playbar');
    const playBtn = h('button', 'ie-btn ie-btn-primary ie-trap-play-btn', `🔊 ${t('ielts.play_audio', undefined, 'Play')} Scenario Audio`);
    
    // Speed toggles
    const speedGroup = h('div', 'ie-speed-group');
    [0.9, 1.0, 1.1].forEach(r => {
      const spBtn = h('button', `ie-tab ie-speed-tab ${speechRate === r ? 'is-on' : ''}`, `${r.toFixed(1)}x`);
      spBtn.addEventListener('click', () => {
        speechRate = r;
        speedGroup.querySelectorAll('.ie-speed-tab').forEach((b, idx) => {
          b.classList.toggle('is-on', idx === (r === 0.9 ? 0 : r === 1.0 ? 1 : 2));
        });
        if (isPlaying) {
          playBtn.click();
          playBtn.click();
        }
      });
      speedGroup.append(spBtn);
    });

    if (!ttsAvailable()) {
      playBtn.disabled = true;
      playBtn.textContent = 'TTS Unavailable in Browser';
    } else {
      playBtn.addEventListener('click', () => {
        if (isPlaying && playback) {
          playback.stop();
          playback = null;
          isPlaying = false;
          playBtn.innerHTML = `${icon('volume', 13)} Play Scenario Audio`;
          drawWaveform();
        } else {
          isPlaying = true;
          playBtn.innerHTML = `${icon('stop', 13)} Stop Audio`;
          drawWaveform();
          playback = playText(s.script, {
            rate: speechRate,
            onEnd: () => {
              isPlaying = false;
              playback = null;
              playBtn.innerHTML = `${icon('volume', 13)} Play Scenario Audio`;
              drawWaveform();
            }
          });
        }
      });
    }

    playBar.append(playBtn, speedGroup);
    audioConsole.append(canvas, playBar);

    // Step 1: Trap Category Spotter Challenge
    const step1Box = h('section', 'ie-trap-section');
    step1Box.append(
      h('h3', 'ie-step-title', 'Step 1: Identify the Trap Category'),
      h('p', 'ie-note', 'Listen to the recording and select which distractor pattern was employed by the speaker:')
    );

    const spotterGrid = h('div', 'ie-trap-spotter-grid');
    const spotterFeedback = h('div', 'ie-spotter-feedback');

    const CATEGORIES: { cat: TrapCategory; label: string; iconName: IconName }[] = [
      { cat: 'self_correction', label: 'Oral Self-Correction', iconName: 'rotateCcw' },
      { cat: 'qualifier', label: 'Qualifier Trap', iconName: 'alertTriangle' },
      { cat: 'reversal', label: 'Reversal Trap', iconName: 'compass' },
      { cat: 'map_direction', label: 'Map Direction Decoy', iconName: 'compass' }
    ];

    CATEGORIES.forEach(c => {
      const btn = h('button', 'ie-trap-btn');
      btn.innerHTML = `${icon(c.iconName, 13)} ${c.label}`;
      btn.addEventListener('click', () => {
        spotterGrid.querySelectorAll('.ie-trap-btn').forEach(b => {
          b.classList.remove('is-correct', 'is-incorrect');
        });

        if (c.cat === s.category) {
          btn.classList.add('is-correct');
          playSfx('absorb');
          spotterFeedback.innerHTML = `<p class="ie-feedback-msg is-success">${icon('check', 13)} <strong>Spot on!</strong> This is an authentic <strong>${s.categoryLabel}</strong>. Note the cue word: <em>"${s.trapCue}"</em>.</p>`;
        } else {
          btn.classList.add('is-incorrect');
          playSfx('alarm');
          spotterFeedback.innerHTML = `<p class="ie-feedback-msg is-error">${icon('alertTriangle', 13)} Not quite. Listen closely to the speaker's phrasing: did they amend, restrict, reverse, or give spatial direction?</p>`;
        }
      });
      spotterGrid.append(btn);
    });

    step1Box.append(spotterGrid, spotterFeedback);

    // Step 2: Exact-Word Input Challenge
    const step2Box = h('section', 'ie-trap-section');
    step2Box.append(
      h('h3', 'ie-step-title', 'Step 2: Enter the Exact-Word Answer'),
      h('p', 'ie-cue', `${s.question} (Write NO MORE THAN ${s.maxWords === 1 ? 'ONE WORD' : 'TWO WORDS'})`)
    );

    const inputRow = h('div', 'ie-input-row');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ie-trap-input';
    input.placeholder = `Type exact answer (max ${s.maxWords} word${s.maxWords === 1 ? '' : 's'})...`;

    const checkBtn = h('button', 'ie-btn ie-btn-primary', t('ielts.check_answers', undefined, 'Validate Answer'));
    const inputFeedback = h('div', 'ie-input-feedback');

    // Deconstruction container (Step 3)
    const deconstructContainer = h('section', 'ie-trap-deconstruct');
    deconstructContainer.hidden = true;

    const renderDeconstruction = (): void => {
      deconstructContainer.innerHTML = '';
      deconstructContainer.hidden = false;

      // Colorized transcript
      let colorized = esc(s.script);
      // Highlight decoy in strike-through red
      colorized = colorized.replace(
        new RegExp(`\\b${esc(s.decoy)}\\b`, 'gi'),
        `<span class="ie-decoy-chip"><del>${esc(s.decoy)}</del> [DECOY]</span>`
      );
      // Highlight trap cue in cyan
      colorized = colorized.replace(
        new RegExp(esc(s.trapCue).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi'),
        `<span class="ie-cue-chip"><strong>$&</strong> [TRAP CUE]</span>`
      );
      // Highlight target in green
      colorized = colorized.replace(
        new RegExp(`\\b${esc(s.targetAnswer)}\\b`, 'gi'),
        `<span class="ie-target-chip"><strong>${esc(s.targetAnswer)}</strong> [ANSWER]</span>`
      );

      const transcriptBox = h('div', 'ie-transcript-box',
        `<h4>${icon('edit', 14)} Audio Script Breakdown</h4><p class="ie-colorized-script">${colorized}</p><p class="ie-note">${esc(s.explanation)}</p>`
      );

      const ruleBox = h('div', 'ie-keino-rule-box',
        `<h4>${icon('graduationCap', 14)} Keino Campbell Examiner Strategy</h4><p>${esc(s.keinoRule)}</p>`
      );

      deconstructContainer.append(transcriptBox, ruleBox);
    };

    const validate = (): void => {
      const val = input.value.trim();
      const res = DistractorEngine.validateExactWord(val, s.targetAnswer, s.maxWords);

      input.classList.remove('is-valid', 'is-invalid');
      if (res.valid) {
        input.classList.add('is-valid');
        playSfx('level-up');
        masteredSet.add(s.id);
        updateTracker();
        inputFeedback.innerHTML = `<p class="ie-feedback-msg is-success">${icon('check', 13)} <strong>Correct!</strong> Exact word verified. See the full deconstruction below.</p>`;
        renderDeconstruction();
      } else {
        input.classList.add('is-invalid');
        playSfx('alarm');
        const trapRes = DistractorEngine.detectTraps(s.script);
        inputFeedback.innerHTML = `<p class="ie-feedback-msg is-error">${icon('alertTriangle', 13)} ${esc(res.reason || 'Incorrect answer')} [Risk: ${trapRes.riskLevel}]. <button class="ie-btn-link ie-reveal-btn">Reveal Explanation</button></p>`;
        inputFeedback.querySelector('.ie-reveal-btn')?.addEventListener('click', () => {
          renderDeconstruction();
        });
      }

    };

    checkBtn.addEventListener('click', validate);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') validate();
    });

    inputRow.append(input, checkBtn);
    step2Box.append(inputRow, inputFeedback);

    card.append(metaBar, audioConsole, step1Box, step2Box, deconstructContainer);
    stage.append(card);
  };

  updateFilters();
  renderCard();

  return () => {
    if (playback) playback.stop();
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
  };
}
