import w1Data from '../data/writing1.json';
import w2Data from '../data/writing2.json';
import { Task1Prompt, Task2Prompt } from '../types';
import { addAttempt } from '../progress';
import { linkModelToChart, renderChart } from '../chart';
import {
  DESCRIPTORS,
  RUBRIC,
  analyse,
  estimateBand,
  validateFourSentenceParagraph,
  ParagraphEvaluation
} from '../writing-heuristics';
import { bandBadge, countdown, Countdown, esc, fmtTime, h } from '../ui';
import { t } from '../../core/i18n';

const T1 = w1Data as Task1Prompt[];
const T2 = w2Data as Task2Prompt[];

// Chart kind codes as learners read them; unknown codes fall back to the raw code
const getChartKindLabel = (k: string): string => t('chart.' + k, undefined, CHART_KIND_LABEL[k] ?? k);
const CHART_KIND_LABEL: Record<string, string> = {
  line: 'Line graph',
  bar: 'Bar chart',
  pie: 'Pie chart',
  table: 'Table',
  map: 'Map',
  process: 'Process diagram'
};

const ESSAY_TYPE_LABEL: Record<string, string> = {
  opinion: 'Opinion (Agree / Disagree)',
  discuss: 'Discussion + Opinion',
  problem_solution: 'Problems & Solutions',
  advantages_disadvantages: 'Advantages & Disadvantages',
  twopart: 'Two-Part Question',
  direct: 'Direct Question',
};

function truncatePrompt(str: string, maxLen = 95): string {
  if (str.length <= maxLen) return str;
  const sub = str.slice(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  return (lastSpace > 45 ? sub.slice(0, lastSpace) : sub) + '…';
}

const MODEL_4_SENTENCE_PARAGRAPH =
  'One primary reason for expanding public transit infrastructure is that it dramatically reduces urban traffic gridlock across metropolitan centers. Because high-capacity electric bus and rail networks transport thousands of commuters simultaneously, substantially fewer private automobiles crowd central arterial roadways during peak hours. For instance, cities like Tokyo and Singapore observed sharp reductions in daily commute delays following major rail investments. Consequently, urban air quality improves noticeably and economic productivity rises as workers spend far less time idling in congestion.';

function insertAtCursor(textarea: HTMLTextAreaElement, text: string): void {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const val = textarea.value;
  textarea.value = val.substring(0, start) + text + val.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  textarea.focus();
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Task 1 Visual Formula Inspector
 * Displays the 4 structural components and interactive vocabulary palette.
 */
export function renderFormulaInspector(targetArea?: HTMLTextAreaElement): HTMLElement {
  const inspector = h('div', 'ie-formula-inspector');
  inspector.id = 'visual-formula-inspector';

  inspector.innerHTML = `
    <div class="ie-inspector-head">
      <div>
        <h3>📐 ${t('wstudio.principles_summary')}</h3>
        <p class="ie-note">${t('wstudio.principles_desc')}</p>
      </div>
      <button type="button" class="ie-btn ie-btn-sm ie-inspector-close" aria-label="${t('common.close')}">✕ ${t('common.close')}</button>
    </div>

    <div class="ie-formula-components">
      <div class="ie-formula-card">
        <div class="ie-fcard-head">
          <span class="ie-fnum">1</span>
          <b>${t('wstudio.step1_title', undefined, 'Paraphrased Introduction')}</b>
        </div>
        <p class="ie-fdesc">${t('wstudio.step1_note', undefined, 'Paraphrase the prompt statement in exactly one sentence. Define metric, units, and timeframe.')}</p>
        <code class="ie-fcode">[Metric/Subject] + [illustrates/depicts/compares] + [Categories/Units] + [between X and Y / over a N-year timeframe]</code>
        ${targetArea
      ? `<button type="button" class="ie-btn ie-btn-xs ie-insert-btn" data-template="The graph illustrates [metric] across [categories] between [start] and [end], measured in [units].">${t('writing.btn_insert_template')}</button>`
      : ''
    }
      </div>

      <div class="ie-formula-card">
        <div class="ie-fcard-head">
          <span class="ie-fnum">2</span>
          <b>${t('wstudio.step2_title', undefined, '2-Sentence Overview (Zero Data Rule)')}</b>
        </div>
        <p class="ie-fdesc">${t('wstudio.step2_note', undefined, 'Two distinct sentences identifying primary trend and notable contrast. Never include specific numbers.')}</p>
        <code class="ie-fcode">Overall, [highest category/dominant trend]. In stark contrast, [lowest category/anomalous trajectory].</code>
        ${targetArea
      ? `<button type="button" class="ie-btn ie-btn-xs ie-insert-btn" data-template="Overall, it is evident that [dominant feature] experienced the most pronounced growth over the surveyed period. In contrast, [secondary category] remained comparatively subdued throughout.">${t('writing.btn_insert_template')}</button>`
      : ''
    }
      </div>

      <div class="ie-formula-card">
        <div class="ie-fcard-head">
          <span class="ie-fnum">3</span>
          <b>${t('wstudio.step3_title', undefined, 'Body Paragraph 1 (Primary Data Group)')}</b>
        </div>
        <p class="ie-fdesc">${t('wstudio.step3_note', undefined, 'Group 2-3 dominant trajectories. Detail starting figure, rate of change, and peak values.')}</p>
        <code class="ie-fcode">Regarding [Group 1], figures commenced at [X] in [Year] before surging substantially to reach [Y]...</code>
        ${targetArea
      ? `<button type="button" class="ie-btn ie-btn-xs ie-insert-btn" data-template="Regarding the dominant categories, figures commenced at [X] in [start year] before escalating steadily to reach a peak of [Y] in [peak year].">${t('writing.btn_insert_template')}</button>`
      : ''
    }
      </div>

      <div class="ie-formula-card">
        <div class="ie-fcard-head">
          <span class="ie-fnum">4</span>
          <b>${t('wstudio.step4_title', undefined, 'Body Paragraph 2 (Secondary Contrasts)')}</b>
        </div>
        <p class="ie-fdesc">${t('wstudio.step4_note', undefined, 'Address remaining categories, fluctuations, or static trends with comparative linkers.')}</p>
        <code class="ie-fcode">By contrast, [Group 2] hovered around [X] throughout the timeframe, despite minor fluctuations...</code>
        ${targetArea
      ? `<button type="button" class="ie-btn ie-btn-xs ie-insert-btn" data-template="By contrast, figures for [secondary group] exhibited a markedly different trajectory, plummeting from [X] to [Y] by the close of the period.">${t('writing.btn_insert_template')}</button>`
      : ''
    }
      </div>
    </div>

    <div class="ie-vocab-palette">
      <h4>🎨 Interactive Academic Vocabulary Palette (Click to Insert)</h4>
      
      <div class="ie-vocab-group">
        <span class="ie-vocab-label">Trend Verbs:</span>
        <div class="ie-chips">
          ${['surged', 'plummeted', 'escalated steadily', 'declined gradually', 'plateaued', 'leveled off', 'peaked at', 'hovered around', 'fluctuated wildly']
      .map(w => `<button type="button" class="ie-chip" data-word="${w}">${w}</button>`)
      .join('')}
        </div>
      </div>

      <div class="ie-vocab-group">
        <span class="ie-vocab-label">Degree &amp; Speed:</span>
        <div class="ie-chips">
          ${['dramatically', 'substantially', 'marginally', 'exponentially', 'negligibly', 'moderately', 'progressively']
      .map(w => `<button type="button" class="ie-chip" data-word="${w}">${w}</button>`)
      .join('')}
        </div>
      </div>

      <div class="ie-vocab-group">
        <span class="ie-vocab-label">Prepositions of Change:</span>
        <div class="ie-chips">
          ${['increased by 15%', 'rose to 85%', 'commenced at', 'stood at', 'dropped to a trough of']
      .map(w => `<button type="button" class="ie-chip" data-word="${w}">${w}</button>`)
      .join('')}
        </div>
      </div>

      <div class="ie-vocab-group">
        <span class="ie-vocab-label">Quantifiers &amp; Proportions:</span>
        <div class="ie-chips">
          ${['the vast majority', 'a negligible fraction', 'approximately one third', 'roughly two-fifths', 'accounted for', 'doubled']
      .map(w => `<button type="button" class="ie-chip" data-word="${w}">${w}</button>`)
      .join('')}
        </div>
      </div>
    </div>
  `;

  const closeBtn = inspector.querySelector('.ie-inspector-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      inspector.classList.remove('is-open');
      const toggle = document.getElementById('toggle-formula-inspector');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  if (targetArea) {
    inspector.querySelectorAll('.ie-insert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tpl = (btn as HTMLElement).dataset.template || '';
        insertAtCursor(targetArea, (targetArea.value.trim() ? '\n\n' : '') + tpl);
      });
    });

    inspector.querySelectorAll('.ie-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const word = (chip as HTMLElement).dataset.word || '';
        insertAtCursor(targetArea, ` ${word} `);
      });
    });
  }

  return inspector;
}

/**
 * Task 2 4-Sentence Paragraph Workbench
 * Validates topic claim, causal logic, concrete evidence, and concluding impact in real-time.
 */
export function renderParagraphWorkbench(targetArea?: HTMLTextAreaElement): HTMLElement {
  const workbench = h('div', 'ie-workbench-panel');
  workbench.id = 'paragraph-workbench';

  workbench.innerHTML = `
    <div class="ie-workbench-head">
      <div>
        <h3>🧱 ${t('writing.wb_head_title')}</h3>
        <p class="ie-note">${t('writing.wb_head_note')}</p>
      </div>
      <button type="button" class="ie-btn ie-btn-sm ie-workbench-close" aria-label="${t('common.close')}">✕ ${t('common.close')}</button>
    </div>

    <div class="ie-workbench-rules">
      <div class="ie-rule-pill"><span class="ie-pill-n">1</span> <b>${t('writing.rule_topic')}</b></div>
      <div class="ie-rule-pill"><span class="ie-pill-n">2</span> <b>${t('writing.rule_explanation')}</b></div>
      <div class="ie-rule-pill"><span class="ie-pill-n">3</span> <b>${t('writing.rule_evidence')}</b></div>
      <div class="ie-rule-pill"><span class="ie-pill-n">4</span> <b>${t('writing.rule_impact')}</b></div>
    </div>

    <div class="ie-workbench-editor-box">
      <label for="workbench-paragraph-input" class="ie-wb-label"><b>${t('writing.sandbox_label')}</b></label>
      <textarea id="workbench-paragraph-input" class="ie-textarea ie-workbench-input" placeholder="${t('writing.sandbox_ph')}"></textarea>
      
      <div class="ie-workbench-actions">
        <button type="button" class="ie-btn ie-btn-sm" id="workbench-load-model">${t('writing.btn_load_model_p')}</button>
        ${targetArea
      ? `<button type="button" class="ie-btn ie-btn-sm ie-btn-primary" id="workbench-insert-essay">${t('writing.btn_insert_essay')}</button>`
      : ''
    }
        <button type="button" class="ie-btn ie-btn-sm" id="workbench-clear">${t('writing.btn_clear')}</button>
      </div>
    </div>

    <div id="workbench-results" class="ie-workbench-eval">
      <div class="ie-eval-top">
        <div class="ie-eval-badges">
          <span class="ie-eval-badge ie-badge-topic" data-valid="false">${t('writing.topic_claim_label')}</span>
          <span class="ie-eval-badge ie-badge-explanation" data-valid="false">${t('writing.causal_logic_label')}</span>
          <span class="ie-eval-badge ie-badge-evidence" data-valid="false">${t('writing.evidence_label')}</span>
          <span class="ie-eval-badge ie-badge-impact" data-valid="false">${t('writing.impact_label')}</span>
          <span class="ie-eval-badge ie-badge-band" data-band="6.0">Band 6.0</span>
        </div>
        <div class="ie-eval-metrics">
          <span class="ie-metric-sent">0 / 4 sentences</span>
          <span class="ie-metric-words">0 words</span>
        </div>
      </div>

      <div class="ie-eval-feedback-box">
        <h4>${t('writing.diag_feedback_title')}</h4>
        <ul class="ie-workbench-feedback">
          <li>${t('writing.diag_feedback_ph')}</li>
        </ul>
      </div>
    </div>
  `;

  const inputArea = workbench.querySelector<HTMLTextAreaElement>('#workbench-paragraph-input')!;
  const badgeTopic = workbench.querySelector<HTMLElement>('.ie-badge-topic')!;
  const badgeExplanation = workbench.querySelector<HTMLElement>('.ie-badge-explanation')!;
  const badgeEvidence = workbench.querySelector<HTMLElement>('.ie-badge-evidence')!;
  const badgeImpact = workbench.querySelector<HTMLElement>('.ie-badge-impact')!;
  const badgeBand = workbench.querySelector<HTMLElement>('.ie-badge-band')!;
  const metricSent = workbench.querySelector<HTMLElement>('.ie-metric-sent')!;
  const metricWords = workbench.querySelector<HTMLElement>('.ie-metric-words')!;
  const feedbackList = workbench.querySelector<HTMLElement>('.ie-workbench-feedback')!;

  function runValidation(): void {
    const text = inputArea.value;
    const report: ParagraphEvaluation = validateFourSentenceParagraph(text);

    badgeTopic.setAttribute('data-valid', String(report.hasTopicSentence));
    badgeTopic.textContent = report.hasTopicSentence ? t('writing.topic_valid') : t('writing.topic_invalid');
    badgeTopic.className = `ie-eval-badge ie-badge-topic ${report.hasTopicSentence ? 'is-valid' : 'is-invalid'}`;

    badgeExplanation.setAttribute('data-valid', String(report.hasExplanation));
    badgeExplanation.textContent = report.hasExplanation ? t('writing.expl_valid') : t('writing.expl_invalid');
    badgeExplanation.className = `ie-eval-badge ie-badge-explanation ${report.hasExplanation ? 'is-valid' : 'is-invalid'}`;

    badgeEvidence.setAttribute('data-valid', String(report.hasEvidence));
    badgeEvidence.textContent = report.hasEvidence ? t('writing.evid_valid') : t('writing.evid_invalid');
    badgeEvidence.className = `ie-eval-badge ie-badge-evidence ${report.hasEvidence ? 'is-valid' : 'is-invalid'}`;

    badgeImpact.setAttribute('data-valid', String(report.hasImpactSentence));
    badgeImpact.textContent = report.hasImpactSentence ? t('writing.imp_valid') : t('writing.imp_invalid');
    badgeImpact.className = `ie-eval-badge ie-badge-impact ${report.hasImpactSentence ? 'is-valid' : 'is-invalid'}`;

    badgeBand.setAttribute('data-band', report.scoreEstimate);
    badgeBand.textContent = report.scoreEstimate;
    badgeBand.className = `ie-eval-badge ie-badge-band band-${report.scoreEstimate.replace(/[^0-9]/g, '')}`;

    metricSent.textContent = t('writing.sentences_count', { count: report.sentenceCount });
    metricWords.textContent = t('writing.words_count', { count: report.wordCount });

    feedbackList.innerHTML = report.feedback.map(f => `<li>${esc(f)}</li>`).join('');
  }

  inputArea.addEventListener('input', runValidation);

  const loadModelBtn = workbench.querySelector('#workbench-load-model');
  if (loadModelBtn) {
    loadModelBtn.addEventListener('click', () => {
      inputArea.value = MODEL_4_SENTENCE_PARAGRAPH;
      runValidation();
    });
  }

  const clearBtn = workbench.querySelector('#workbench-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      inputArea.value = '';
      runValidation();
    });
  }

  if (targetArea) {
    const insertEssayBtn = workbench.querySelector('#workbench-insert-essay');
    if (insertEssayBtn) {
      insertEssayBtn.addEventListener('click', () => {
        if (!inputArea.value.trim()) return;
        insertAtCursor(targetArea, (targetArea.value.trim() ? '\n\n' : '') + inputArea.value.trim());
      });
    }
  }

  const closeBtn = workbench.querySelector('.ie-workbench-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      workbench.classList.remove('is-open');
      const toggle = document.getElementById('toggle-paragraph-workbench');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  return workbench;
}

function mountEditor(
  root: HTMLElement,
  task: 1 | 2,
  p: Task1Prompt | Task2Prompt,
  back: () => void
): () => void {
  const minutes = task === 1 ? 20 : 40;
  const min = task === 1 ? 150 : 250;
  root.innerHTML = '';

  const backBtn = h('button', 'ie-btn', t('ielts.all_prompts', undefined, 'All prompts'));
  backBtn.addEventListener('click', back);

  const head = h('div', 'ie-testbar');
  const clock = h('span', 'ie-clock');
  const count = h('span', 'ie-count');

  // Interactive workbench / inspector toggle button
  let toggleBtn: HTMLElement;
  if (task === 1) {
    toggleBtn = h('button', 'ie-btn ie-formula-toggle', `📐 ${t('writing.formula_inspector_title', undefined, 'Visual Formula Inspector')}`);
    toggleBtn.id = 'toggle-formula-inspector';
    toggleBtn.setAttribute('aria-expanded', 'false');
  } else {
    toggleBtn = h('button', 'ie-btn ie-workbench-toggle', `🧱 ${t('writing.workbench_title', undefined, '4-Sentence Paragraph Workbench')}`);
    toggleBtn.id = 'toggle-paragraph-workbench';
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  const submit = h('button', 'ie-btn ie-btn-primary', t('ielts.submit_for_feedback', undefined, 'Submit for feedback'));
  head.append(clock, count, toggleBtn, submit);

  const brief = h(
    'article',
    'ie-passage',
    `<h2>Writing Task ${task}</h2><p>${esc(p.prompt)}</p>` +
    (task === 1 ? renderChart((p as Task1Prompt).chart) : '') +
    `<p class="ie-note">${t('writing.min_words_suggested', { min, minTime: minutes }, `Write at least ${min} words. Suggested time: ${minutes} minutes.`)}</p>`
  );

  const area = h('textarea', 'ie-textarea') as HTMLTextAreaElement;
  area.setAttribute('aria-label', `Your Task ${task} answer`);
  area.placeholder = t('writing.editor_ph', undefined, 'Type your answer here. Leave a blank line between paragraphs.');

  const editor = h('div', 'ie-qcol');
  editor.append(area);

  // Mount auxiliary workbenches
  const formulaInspector = task === 1 ? renderFormulaInspector(area) : null;
  const paragraphWorkbench = task === 2 ? renderParagraphWorkbench(area) : null;

  if (formulaInspector) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = formulaInspector.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) formulaInspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  if (paragraphWorkbench) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = paragraphWorkbench.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) paragraphWorkbench.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  const split = h('section', 'ie-split');
  split.append(brief, editor);

  const out = h('section', 'ie-result ie-feedback');
  out.hidden = true;

  root.append(backBtn, head);
  if (formulaInspector) root.append(formulaInspector);
  if (paragraphWorkbench) root.append(paragraphWorkbench);
  root.append(split, out);

  const wc = (): number => (area.value.trim() ? area.value.trim().split(/\s+/).length : 0);
  area.addEventListener('input', () => {
    const w = wc();
    count.textContent = `${w} / ${min} words`;
    count.classList.toggle('ie-urgent', w > 0 && w < min);
  });
  count.textContent = `0 / ${min} words`;

  let timer: Countdown | null = countdown(
    minutes * 60,
    l => {
      clock.textContent = l >= 0 ? fmtTime(l) : `+${fmtTime(-l)}`;
    },
    () => {
      clock.classList.add('ie-urgent');
    }
  );

  submit.addEventListener('click', () => {
    timer?.stop();
    timer = null;
    submit.disabled = true;
    area.readOnly = true;
    const r = analyse(area.value, task);
    const crit = task === 1 ? RUBRIC.task1 : RUBRIC.task2;
    const flags = r.flags.length
      ? r.flags.map(f => `<li>${esc(f)}</li>`).join('')
      : `<li>${t('writing.no_flags', undefined, 'No automatic flags. Check accuracy and development yourself.')}</li>`;
    const rate = crit
      .map(
        (c, i) =>
          `<label class="ie-rate"><span>${c}</span><select data-i="${i}">${[
            5,
            5.5,
            6,
            6.5,
            7,
            7.5,
            8
          ]
            .map(b => `<option value="${b}"${b === 6 ? ' selected' : ''}>${b.toFixed(1)}</option>`)
            .join('')}</select></label>`
      )
      .join('');

    out.hidden = false;
    out.innerHTML = `<div class="ie-feedback-col">
      <h3>${t('writing.automatic_checks', undefined, 'Automatic checks')}</h3>
      <ul class="ie-stats"><li><b>${r.words}</b> words</li><li><b>${r.paragraphs}</b> paragraphs</li><li><b>${r.sentences}</b> sentences</li><li><b>${r.linkers.length}</b> linkers</li><li><b>${r.complexSentences}</b> complex</li><li><b>${r.lexicalDiversity}</b> diversity</li></ul>
      <ul class="ie-flags">${flags}</ul>
      <p class="ie-note">${t('writing.checks_note', undefined, 'These checks count features. They cannot judge accuracy, relevance or ideas.')}</p>
    </div>
    <div class="ie-feedback-col">
      <h3>${t('writing.rate_against_model', undefined, 'Rate yourself against the model')}</h3>
      <p class="ie-note">${t('writing.rate_note', { desc: esc(DESCRIPTORS[7]) }, `Read the model and notes, then rate each criterion honestly. 7 = ${esc(DESCRIPTORS[7])}`)}</p>
      ${rate}
      <div class="ie-estimate"></div>
      <button class="ie-btn ie-btn-primary ie-save">${t('ielts.save_estimate', undefined, 'Save estimate')}</button>
    </div>
    <div class="ie-feedback-wide"><h3>${t('writing.model_answer_band7', undefined, 'Band 7+ model answer')}</h3><div class="ie-model">${p.model
        .split(/\n\s*\n/)
        .map(x => `<p>${x
          .split(/(?<=[.!?])\s+/)
          .map((s, i) => `<span class="ie-sent" data-sent="${i}">${esc(s)}</span>`)
          .join(' ')}</p>`)
        .join('')}</div><h3>${t('writing.what_makes_it_7', undefined, 'What makes it band 7')}</h3><p>${esc(p.notes)}</p></div>`;
    const modelEl = out.querySelector('.ie-model') as HTMLElement | null;
    if (task === 1 && modelEl && (p as Task1Prompt).chart) linkModelToChart(modelEl, (p as Task1Prompt).chart);

    const estEl = out.querySelector('.ie-estimate') as HTMLElement;
    const ratings = (): number[] =>
      [...out.querySelectorAll<HTMLSelectElement>('select[data-i]')].map(s => Number(s.value));
    const update = (): number => {
      const b = estimateBand(ratings(), r.words, task);
      estEl.innerHTML = bandBadge(b, 'Estimate');
      return b;
    };
    out.querySelectorAll('select[data-i]').forEach(s => s.addEventListener('change', update));
    update();
    out.querySelector('.ie-save')!.addEventListener('click', e => {
      addAttempt({ skill: 'writing', itemId: p.id, band: update(), raw: r.words, estimate: true });
      (e.target as HTMLButtonElement).disabled = true;
      (e.target as HTMLButtonElement).textContent = t('ielts.saved', undefined, 'Saved');
    });
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  return () => timer?.stop();
}

export function writingView(root: HTMLElement): () => void {
  let stop = () => { };

  const render = (): void => {
    stop();
    root.innerHTML = '';

    root.append(
      h('h1', 'ie-title', t('ielts.nav_writing', undefined, 'Academic Writing')),
      h(
        'p',
        'ie-lead',
        t('writing.view_lead', undefined, 'Task 1: describe the visual in 150+ words (20 min). Task 2: write a 250+ word essay (40 min). Explore the interactive Visual Formula Inspector and 4-Sentence Paragraph Workbench below or inside any prompt.')
      )
    );

    // Quick Hub Tools Bar
    const quickTools = h('div', 'ie-writing-hub-tools');
    const toggleFormulaBtn = h(
      'button',
      'ie-btn ie-formula-toggle',
      t('writing.formula_inspector_title', undefined, 'Task 1 Visual Formula Inspector')
    );
    toggleFormulaBtn.id = 'toggle-formula-inspector';
    toggleFormulaBtn.setAttribute('aria-expanded', 'false');

    const toggleWbBtn = h(
      'button',
      'ie-btn ie-workbench-toggle',
      t('writing.workbench_title', undefined, 'Task 2 4-Sentence Paragraph Workbench')
    );
    toggleWbBtn.id = 'toggle-paragraph-workbench';
    toggleWbBtn.setAttribute('aria-expanded', 'false');

    // Navigation to #writing-studio is unified in main.ts top subnavigation bar
    quickTools.append(toggleFormulaBtn, toggleWbBtn);
    root.append(quickTools);

    // Mount inspector & workbench containers for standalone use on writing hub
    const hubFormula = renderFormulaInspector();
    const hubWb = renderParagraphWorkbench();

    toggleFormulaBtn.addEventListener('click', () => {
      const isOpen = hubFormula.classList.toggle('is-open');
      toggleFormulaBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        hubWb.classList.remove('is-open');
        toggleWbBtn.setAttribute('aria-expanded', 'false');
        hubFormula.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    toggleWbBtn.addEventListener('click', () => {
      const isOpen = hubWb.classList.toggle('is-open');
      toggleWbBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        hubFormula.classList.remove('is-open');
        toggleFormulaBtn.setAttribute('aria-expanded', 'false');
        hubWb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    root.append(hubFormula, hubWb);

    for (const [task, list] of [[1, T1], [2, T2]] as const) {
      root.append(h('h2', 'ie-sub', `Task ${task}`));
      const cards = h('div', 'ie-cards');
      list.forEach(p => {
        const label = task === 1
          ? (p as Task1Prompt).chart.title
          : (ESSAY_TYPE_LABEL[(p as Task2Prompt).essayType] ?? (p as Task2Prompt).essayType);
        const promptDisplay = task === 1 ? label : truncatePrompt(p.prompt);
        const c = h(
          'button',
          `ie-card ie-prompt-card ie-task${task}-card`,
          `<b>${esc(promptDisplay)}</b><span>${task === 1 ? esc(getChartKindLabel((p as Task1Prompt).chart.kind) ?? (p as Task1Prompt).chart.kind) : esc(label)
          }</span>`
        );
        c.setAttribute('data-task', String(task));
        c.addEventListener('click', () => {
          stop();
          stop = mountEditor(root, task, p, render);
        });
        cards.append(c);
      });
      if (!list.length) cards.append(h('p', 'ie-note', t('writing.no_prompts', undefined, 'No prompts loaded yet.')));
      root.append(cards);
    }
  };

  render();
  return () => stop();
}
