// web/src/ielts/views/diagnostic.ts
import courseData from '../../assets/data/ielts-course.json';
import { DiagnosticEngine, DiagnosticQuestion, DiagnosticReport } from '../diagnostic-engine';
import { esc, h } from '../ui';
import { feedback } from '../../core/feedback';
import { icon, IconName } from '../../utils/icons';
import { t } from '../../core/i18n';

function getSubTypeName(st: string): string {
  switch (st) {
    case 'subject_verb': return t('diag.subtype_subject_verb', undefined, 'Subject-Verb Concord');
    case 'tenses': return t('diag.subtype_tenses', undefined, 'Tense Consistency & Aspect');
    case 'articles': return t('diag.subtype_articles', undefined, 'Article Omission & Precision');
    case 'clauses': return t('diag.subtype_clauses', undefined, 'Clausal Subordination & Modifiers');
    case 'prepositions': return t('diag.subtype_prepositions', undefined, 'Dependent Prepositions');
    case 'collocations': return t('diag.subtype_collocations', undefined, 'Academic Collocations');
    default: return st;
  }
}

const SUBTYPE_ICONS: Record<string, IconName> = {
  subject_verb: 'scale',
  tenses: 'clock',
  articles: 'edit',
  clauses: 'layers',
  prepositions: 'target',
  collocations: 'book'
};

export function diagnosticView(root: HTMLElement): () => void {
  const questions: DiagnosticQuestion[] = (courseData as { diagnostics: DiagnosticQuestion[] }).diagnostics || [];
  let userAnswers: Record<string, number> = {};
  let currentFilter: 'all' | 'grammar' | 'vocabulary' = 'all';

  // Load existing profile if available
  let cachedReport = DiagnosticEngine.getDiagnosticProfile();
  let showingResults = false;

  const container = h('div', 'ie-diagnostic-view');

  function render(): void {
    container.innerHTML = '';

    // Hero Header
    const header = h('div', 'ie-diag-header');
    header.innerHTML = `
      <div class="ie-diag-badge-row">
        <span class="ie-pill ie-pill-accent">${t('diag.foundation_checkpoint', undefined, 'Foundation Checkpoint')}</span>
        <span class="ie-pill ie-pill-neutral">${t('diag.checkpoint_meta', undefined, '20 Questions • 15 Mins')}</span>
      </div>
      <h1 class="ie-title">${t('diag.title', undefined, 'Grammar & Vocabulary Diagnostic')}</h1>
      <p class="ie-lead ie-diag-lead">
        ${t('diag.lead', undefined, 'Identify and isolate high-frequency morphosyntactic and lexical flaws. Calibrated against IELTS band descriptors 5.5–8.5+.')}
      </p>
    `;
    container.append(header);

    // If already completed or showing results, render results dashboard
    if (showingResults && cachedReport) {
      renderResults(cachedReport);
      return;
    }

    // Previous Report banner if one exists and user hasn't yet started/completed current session
    if (cachedReport && Object.keys(userAnswers).length === 0) {
      const banner = h('div', 'ie-diag-cached-banner');
      banner.innerHTML = `
        <div class="ie-cached-info">
          <span class="ie-cached-label">${t('diag.prev_record', undefined, 'Previous Diagnostic Record')}</span>
          <span class="ie-cached-score"><strong>${esc(cachedReport.bandEstimate)}</strong> (${cachedReport.score}/20 — ${Number.isFinite(cachedReport.percentage) ? cachedReport.percentage : Math.round((cachedReport.score / 20) * 100)}%)</span>
          <span class="ie-cached-date">${t('diag.recorded_on', { date: new Date(cachedReport.timestamp).toLocaleDateString() }, `Recorded on ${new Date(cachedReport.timestamp).toLocaleDateString()}`)}</span>
        </div>
        <div class="ie-cached-actions">
          <button class="ie-btn ie-btn-sm ie-btn-primary" id="btn-view-cached">${t('diag.btn_view_analysis', undefined, 'View Analysis & Study Plan')}</button>
          <button class="ie-btn ie-btn-sm ie-btn-outline" id="btn-retake-new">${t('diag.btn_retake', undefined, 'Retake Diagnostic')}</button>
        </div>
      `;
      banner.querySelector('#btn-view-cached')?.addEventListener('click', () => {
        showingResults = true;
        render();
      });
      banner.querySelector('#btn-retake-new')?.addEventListener('click', () => {
        userAnswers = {};
        cachedReport = null;
        render();
      });
      container.append(banner);
    }

    // Progress Bar and Controls
    const totalCount = questions.length;
    const answeredCount = Object.keys(userAnswers).length;
    const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

    const toolbar = h('div', 'ie-diag-toolbar');
    toolbar.innerHTML = `
      <div class="ie-diag-filter-tabs">
        <button class="ie-tab-btn ${currentFilter === 'all' ? 'is-active' : ''}" data-filter="all">${t('diag.tab_all', { count: totalCount }, `All (${totalCount})`)}</button>
        <button class="ie-tab-btn ${currentFilter === 'grammar' ? 'is-active' : ''}" data-filter="grammar">${t('diag.tab_grammar', { count: 10 }, 'Grammar (10)')}</button>
        <button class="ie-tab-btn ${currentFilter === 'vocabulary' ? 'is-active' : ''}" data-filter="vocabulary">${t('diag.tab_vocab', { count: 10 }, 'Vocabulary (10)')}</button>
      </div>
      <div class="ie-diag-progress-wrap">
        <div class="ie-diag-progress-label">
          <span>${t('diag.progress_answered', { answered: answeredCount, total: totalCount }, `Progress: <strong>${answeredCount}/${totalCount}</strong> answered`)}</span>
          <span>${progressPercent}%</span>
        </div>
        <div class="ie-progress-track">
          <div class="ie-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>
    `;

    toolbar.querySelectorAll('.ie-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).dataset.filter as 'all' | 'grammar' | 'vocabulary';
        currentFilter = filter;
        render();
      });
    });

    container.append(toolbar);

    // Questions list
    const filteredQuestions = questions.filter(q => {
      if (currentFilter === 'all') return true;
      return q.category === currentFilter;
    });

    const list = h('div', 'ie-diag-qlist');

    filteredQuestions.forEach(q => {
      const qNum = questions.indexOf(q) + 1;
      const isAnswered = q.id in userAnswers;
      const userChoice = userAnswers[q.id];
      const isCorrect = isAnswered && userChoice === q.correctIndex;

      const card = h('article', `ie-diag-card ${isAnswered ? (isCorrect ? 'is-answered-correct' : 'is-answered-incorrect') : ''}`);
      card.id = `q-${q.id}`;

      const subtypeName = getSubTypeName(q.subType);
      const subIconKey = SUBTYPE_ICONS[q.subType] || 'book';

      card.innerHTML = `
        <div class="ie-diag-card-head">
          <div class="ie-diag-meta">
            <span class="ie-diag-number">Q${qNum}</span>
            <span class="ie-pill ie-pill-${q.category === 'grammar' ? 'blue' : 'purple'}">${esc(q.category.toUpperCase())}</span>
            <span class="ie-pill ie-pill-sub">${icon(subIconKey, 11)} ${esc(subtypeName)}</span>
          </div>
          ${isAnswered ? `
            <span class="ie-diag-result-status ${isCorrect ? 'is-status-correct' : 'is-status-incorrect'}">
              ${isCorrect ? t('diag.status_correct', undefined, '✓ Correct') : t('diag.status_incorrect', undefined, '✗ Incorrect')}
            </span>
          ` : `<span class="ie-diag-unanswered">${t('diag.status_pending', undefined, 'Pending')}</span>`}
        </div>
        <p class="ie-diag-prompt">${esc(q.prompt)}</p>
        <div class="ie-diag-options">
          ${q.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            let optCls = 'ie-diag-opt';
            if (isAnswered) {
              if (optIdx === q.correctIndex) {
                optCls += ' is-target-correct';
              }
              if (optIdx === userChoice) {
                optCls += isCorrect ? ' is-selected-correct' : ' is-selected-incorrect';
              }
            }
            return `
              <button class="${optCls}" data-qid="${esc(q.id)}" data-opt="${optIdx}">
                <span class="ie-opt-letter">${letter}</span>
                <span class="ie-opt-text">${esc(opt)}</span>
              </button>
            `;
          }).join('')}
        </div>
        ${isAnswered ? `
          <div class="ie-diag-explanation">
            <div class="ie-explain-header">
              <strong>${isCorrect ? t('diag.explanation_correct', undefined, 'Explanation:') : t('diag.explanation_flaw', undefined, 'Why this error matters:')}</strong>
            </div>
            <p class="ie-explain-text">${esc(q.explanation)}</p>
            <div class="ie-impact-alert">
              <span class="ie-impact-icon">${icon('alertTriangle', 14)}</span>
              <span class="ie-impact-text"><strong>${t('diag.impact_on_band', undefined, 'Impact on Band:')}</strong> ${esc(q.impactOnBand)}</span>
            </div>
          </div>
        ` : ''}
      `;

      // Event listeners for option buttons
      card.querySelectorAll('.ie-diag-opt').forEach(optBtn => {
        optBtn.addEventListener('click', (e) => {
          const btn = e.currentTarget as HTMLElement;
          const qId = btn.dataset.qid!;
          const optIdx = parseInt(btn.dataset.opt!, 10);
          userAnswers[qId] = optIdx;
          render();
          const answered = questions.find(item => item.id === qId);
          const answeredCard = document.getElementById(`q-${qId}`);
          if (answered && answeredCard) {
            feedback.emit(
              {
                type: 'answer',
                result: optIdx === answered.correctIndex ? 'correct' : 'wrong',
                why: answered.explanation,
                mode: 'practice'
              },
              answeredCard
            );
          }
        });
      });

      list.append(card);
    });

    container.append(list);

    // Bottom Action Bar
    const bottomBar = h('div', 'ie-diag-bottom-bar');
    const allAnswered = Object.keys(userAnswers).length === questions.length;

    bottomBar.innerHTML = `
      <div class="ie-bottom-info">
        <span>${t('diag.bottom_evaluated', { answered: answeredCount, total: totalCount }, `${answeredCount}/${totalCount} questions evaluated.`)}</span>
        ${!allAnswered
          ? `<span class="ie-bottom-hint">${t('diag.bottom_hint_incomplete', undefined, 'Answer all 20 questions to generate a full error taxonomy and study roadmap.')}</span>`
          : `<span class="ie-bottom-hint is-ready">${t('diag.bottom_hint_ready', undefined, 'All items answered! Ready for final evaluation.')}</span>`}
      </div>
      <div class="ie-bottom-actions">
        <button class="ie-btn ie-btn-primary ${answeredCount >= 5 ? '' : 'is-disabled'}" id="btn-finish-eval">
          ${allAnswered
            ? t('diag.btn_generate_assessment', undefined, 'Generate Full Assessment & Study Plan')
            : t('diag.btn_evaluate_progress', { answered: answeredCount, total: totalCount }, `Evaluate Progress (${answeredCount}/${totalCount})`)}
        </button>
      </div>
    `;

    bottomBar.querySelector('#btn-finish-eval')?.addEventListener('click', () => {
      if (answeredCount < 1) return;
      cachedReport = DiagnosticEngine.evaluateDiagnostic(userAnswers, questions);
      DiagnosticEngine.saveDiagnosticProfile(cachedReport);
      showingResults = true;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    container.append(bottomBar);
  }

  function renderResults(report: DiagnosticReport): void {
    const dashboard = h('div', 'ie-diag-dashboard');

    // Hero Results Banner
    const isBand7Plus = report.percentage >= 80;
    const hero = h('div', `ie-results-hero ${isBand7Plus ? 'is-high-band' : 'is-mid-band'}`);
    hero.innerHTML = `
      <div class="ie-hero-score-block">
        <span class="ie-hero-eyebrow">${t('diag.estimated_band_baseline', undefined, 'Estimated Band Baseline')}</span>
        <div class="ie-hero-band">${esc(report.bandEstimate)}</div>
        <div class="ie-hero-fraction">${t('diag.score_fraction', { score: report.score, total: report.totalQuestions, pct: report.percentage }, `Score: <strong>${report.score} / ${report.totalQuestions}</strong> (${report.percentage}%)`)}</div>
      </div>
      <div class="ie-hero-summary">
        <h3>${isBand7Plus ? t('diag.summary_title_high', undefined, 'Band 7.0+ Structural Foundations Confirmed') : t('diag.summary_title_mid', undefined, 'Systematic Error Vectors Cap Band Score')}</h3>
        <p>
          ${isBand7Plus
            ? t('diag.summary_desc_high', undefined, 'Your grammatical control and academic lexical choices demonstrate the consistency required for Band 7.0–8.0. Focus on high-level clausal variety and stylistic concision.')
            : t('diag.summary_desc_mid', undefined, 'Specific recurring errors in sentence architecture and lexical collocation are currently capping your Grammatical Range & Accuracy (GRA) and Lexical Resource (LR). Follow the targeted prescriptions below.')}
        </p>
        <div class="ie-hero-cta">
          <button class="ie-btn ie-btn-sm ie-btn-secondary" id="btn-retake-quiz">${t('diag.btn_retake_assessment', undefined, 'Retake Assessment')}</button>
          <a class="ie-btn ie-btn-sm ie-btn-outline" href="#writing">${t('diag.btn_open_workbench', undefined, 'Open Writing Workbench →')}</a>
        </div>
      </div>
    `;

    hero.querySelector('#btn-retake-quiz')?.addEventListener('click', () => {
      showingResults = false;
      userAnswers = {};
      render();
    });

    dashboard.append(hero);

    // Section 1: Error Taxonomy Breakdown (6 Vectors)
    const taxonomySec = h('section', 'ie-diag-sec');
    taxonomySec.innerHTML = `
      <div class="ie-sec-header">
        <h2>${t('diag.sec_taxonomy_title', undefined, '6-Vector Error Taxonomy Breakdown')}</h2>
        <p class="ie-sec-desc">${t('diag.sec_taxonomy_desc', undefined, 'Granular accuracy scores across the six most common failure points in academic exam writing.')}</p>
      </div>
    `;

    const grid = h('div', 'ie-taxonomy-grid');
    const subTypes = Object.keys(report.subTypeBreakdown);

    subTypes.forEach(st => {
      const summary = report.subTypeBreakdown[st];
      const name = getSubTypeName(st);
      const iconKey = SUBTYPE_ICONS[st] || 'target';
      const pct = summary.percentage;
      const statusCls = pct >= 80 ? 'good' : pct >= 50 ? 'warning' : 'danger';
      const statusLabel = pct >= 80
        ? t('diag.tax_status_mastered', undefined, 'Mastered (Band 7.0+)')
        : pct >= 50
          ? t('diag.tax_status_risk', undefined, 'At Risk (Band 6.0-6.5)')
          : t('diag.tax_status_critical', undefined, 'Critical Flaw (< Band 6.0)');

      const flaw = report.flawsDetected.find(f => f.subType === st);

      const card = h('article', `ie-taxonomy-card ie-card-status-${statusCls}`);
      card.innerHTML = `
        <div class="ie-tax-head">
          <div class="ie-tax-title">
            <span class="ie-tax-icon">${icon(iconKey, 14)}</span>
            <div>
              <h4>${esc(name)}</h4>
              <span class="ie-tax-status ie-status-${statusCls}">${statusLabel}</span>
            </div>
          </div>
          <div class="ie-tax-pct">${pct}%</div>
        </div>
        <div class="ie-tax-bar-track">
          <div class="ie-tax-bar-fill ie-bar-${statusCls}" style="width: ${pct}%;"></div>
        </div>
        <div class="ie-tax-ratio">${t('diag.tax_ratio', { correct: summary.correct, total: summary.total }, `${summary.correct} of ${summary.total} correct`)}</div>
        <div class="ie-tax-body">
          <p class="ie-tax-rec"><strong>${t('diag.tax_label_prescription', undefined, 'Prescription:')}</strong> ${esc(flaw ? flaw.recommendation : t('diag.tax_default_rec', undefined, 'Maintain active recall and audit for slips under time pressure.'))}</p>
          <p class="ie-tax-impact"><strong>${t('diag.tax_label_rubric_impact', undefined, 'Rubric Impact:')}</strong> ${esc(flaw ? flaw.impactOnBand : t('diag.tax_default_impact', undefined, 'Contributes positively toward Band 7.5+ GRA/LR.'))}</p>
        </div>
      `;
      grid.append(card);
    });

    taxonomySec.append(grid);
    dashboard.append(taxonomySec);

    // Section 2: Pre-Flight Editing Checklist
    if (report.checklistItems.length > 0) {
      const checklistSec = h('section', 'ie-diag-sec');
      checklistSec.innerHTML = `
        <div class="ie-sec-header">
          <h2>${t('diag.sec_checklist_title', undefined, 'Pre-Flight Self-Correction Checklist')}</h2>
          <p class="ie-sec-desc">${t('diag.sec_checklist_desc', undefined, 'Before submitting Task 1 or Task 2 essays, audit your drafts against these detected vulnerability rules.')}</p>
        </div>
        <ul class="ie-checklist-items">
          ${report.checklistItems.map(item => `
            <li class="ie-check-item">
              <span class="ie-check-bullet">☑</span>
              <span class="ie-check-text">${esc(item)}</span>
            </li>
          `).join('')}
        </ul>
      `;
      dashboard.append(checklistSec);
    }

    // Section 3: Personalized Study Plan
    const lowestVectors = report.flawsDetected.map(f => getSubTypeName(f.subType)).slice(0, 2).join(', ') || 'lexical register';
    const planSec = h('section', 'ie-diag-sec');
    planSec.innerHTML = `
      <div class="ie-sec-header">
        <h2>${t('diag.sec_roadmap_title', undefined, 'Personalized Band 7+ Remediation Roadmap')}</h2>
        <p class="ie-sec-desc">${t('diag.sec_roadmap_desc', undefined, 'Direct 4-step path forward calibrated to your current diagnostic profile.')}</p>
      </div>
      <div class="ie-roadmap-grid">
        <div class="ie-roadmap-card">
          <div class="ie-roadmap-step">Step 1</div>
          <h4>${t('diag.step1_title', undefined, 'Targeted Clausal & Morphosyntactic Drills')}</h4>
          <p>${t('diag.step1_desc', { vectors: lowestVectors }, `Prioritize remediation on your lowest scoring vectors (${lowestVectors}).`)}</p>
          <a class="ie-roadmap-link" href="#strategy">${t('diag.step1_link', undefined, 'Review Question Strategy & Traps →')}</a>
        </div>
        <div class="ie-roadmap-card">
          <div class="ie-roadmap-step">Step 2</div>
          <h4>${t('diag.step2_title', undefined, 'Task 1 Visual Overview & Data Grouping')}</h4>
          <p>${t('diag.step2_desc', undefined, 'Master the Keino Campbell 2-Sentence Overview rule and practice grouping dynamic vs static datasets.')}</p>
          <a class="ie-roadmap-link" href="#writing">${t('diag.step2_link', undefined, 'Open Task 1 Formula Inspector →')}</a>
        </div>
        <div class="ie-roadmap-card">
          <div class="ie-roadmap-step">Step 3</div>
          <h4>${t('diag.step3_title', undefined, 'Task 2 4-Sentence Paragraph Workbench')}</h4>
          <p>${t('diag.step3_desc', undefined, 'Compose essays using strictly 4 sentences per body paragraph (Topic -> Explanation -> Evidence -> Impact).')}</p>
          <a class="ie-roadmap-link" href="#writing">${t('diag.step3_link', undefined, 'Launch Paragraph Workbench →')}</a>
        </div>
        <div class="ie-roadmap-card">
          <div class="ie-roadmap-step">Step 4</div>
          <h4>${t('diag.step4_title', undefined, 'Timed Mock Simulation & AES Feedback')}</h4>
          <p>${t('diag.step4_desc', undefined, 'Run full-length timed mock tests and evaluate clausal complexity (MLT, clausal density) in the AES Engine.')}</p>
          <a class="ie-roadmap-link" href="#mock">${t('diag.step4_link', undefined, 'Start Computer-Delivered Mock →')}</a>
        </div>
      </div>
    `;
    dashboard.append(planSec);

    container.append(dashboard);
  }

  root.append(container);
  render();

  return () => {
    container.remove();
  };
}
