const fs = require('fs');
const path = require('path');

function replaceInFile(relPath, transforms) {
  const fullPath = path.join(__dirname, '..', relPath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const { target, replacement } of transforms) {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      count++;
    } else {
      console.warn(`[WARN] Target not found in ${relPath}: ${target.slice(0, 50).replace(/\n/g, ' ')}...`);
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`[OK] Updated ${relPath} with ${count}/${transforms.length} replacements.`);
}

// 1. spotlight-tour.ts
replaceInFile('src/core/spotlight-tour.ts', [
  {
    target: '<button class="tour-card-close" id="tourCloseBtn" aria-label="Close Spotlight Tour (Esc)" title="Close (Esc)">✕</button>',
    replacement: '<button class="tour-card-close" id="tourCloseBtn" aria-label="${t(\'tour.close_title\', undefined, \'Close Spotlight Tour (Esc)\')}" title="${t(\'tour.close_title\', undefined, \'Close (Esc)\')}">✕</button>'
  },
  {
    target: '<button class="ctrl" id="tourPrevBtn">← Previous</button>',
    replacement: '<button class="ctrl" id="tourPrevBtn">${t(\'tour.btn_prev\', undefined, \'← Previous\')}</button>'
  },
  {
    target: '<button class="ctrl" id="tourSkipBtn">Skip</button>',
    replacement: '<button class="ctrl" id="tourSkipBtn">${t(\'tour.btn_skip\', undefined, \'Skip\')}</button>'
  },
  {
    target: '<button class="ctrl ctrl-primary" id="tourNextBtn">Next →</button>',
    replacement: '<button class="ctrl ctrl-primary" id="tourNextBtn">${t(\'tour.btn_next\', undefined, \'Next →\')}</button>'
  }
]);

// 2. achievements-card.ts
replaceInFile('src/core/achievements-card.ts', [
  {
    target: '<section aria-label="Achievements"',
    replacement: '<section aria-label="${t(\'nav.profile\', undefined, \'Achievements\')}"'
  }
]);

// 3. zen-mode.ts
replaceInFile('src/core/zen-mode.ts', [
  {
    target: 'aria-label="Exit Zen Mode (Esc)"',
    replacement: 'aria-label="${t(\'reading.exit_zen_tooltip\', undefined, \'Exit Zen Mode (Esc)\')}"'
  }
]);

// 4. notification-engine.ts
replaceInFile('src/core/notification-engine.ts', [
  {
    target: '<button class="btn-toast-close" aria-label="Dismiss"',
    replacement: '<button class="btn-toast-close" aria-label="${t(\'common.dismiss\', undefined, \'Dismiss\')}"'
  }
]);

// 5. lazy-view.ts
{
  const lazyPath = path.join(__dirname, '..', 'src/ielts/lazy-view.ts');
  let lazyContent = fs.readFileSync(lazyPath, 'utf8');
  if (!lazyContent.includes("from '../core/i18n'")) {
    lazyContent = "import { t } from '../core/i18n';\n" + lazyContent;
  }
  lazyContent = lazyContent.replace("const placeholder = h('p', 'ie-lead', 'Loading…');", "const placeholder = h('p', 'ie-lead', t('common.loading', undefined, 'Loading…'));");
  lazyContent = lazyContent.replace("placeholder.textContent = 'This section could not load. Reload when online.';", "placeholder.textContent = t('common.offline_reload', undefined, 'This section could not load. Reload when online.');");
  fs.writeFileSync(lazyPath, lazyContent, 'utf8');
  console.log('[OK] Updated src/ielts/lazy-view.ts');
}

// 6. main.ts
replaceInFile('src/ielts/main.ts', [
  {
    target: 'aria-label="Scroll navigation left"',
    replacement: 'aria-label="${t(\'ielts.nav_scroll_left_aria\', undefined, \'Scroll navigation left\')}"'
  },
  {
    target: 'aria-label="IELTS sections"',
    replacement: 'aria-label="${t(\'ielts.nav_sections_aria\', undefined, \'IELTS sections\')}"'
  },
  {
    target: 'aria-label="Scroll navigation right"',
    replacement: 'aria-label="${t(\'ielts.nav_scroll_right_aria\', undefined, \'Scroll navigation right\')}"'
  }
]);

// 7. views/reading.ts
replaceInFile('src/ielts/views/reading.ts', [
  {
    target: '<button type="button" class="ie-pill-btn ie-pill-mark" title="Highlight text">🖍️ Highlight</button>',
    replacement: '<button type="button" class="ie-pill-btn ie-pill-mark" title="${t(\'reading.highlight_tooltip\', undefined, \'Highlight text\')}">${t(\'reading.highlight\', undefined, \'🖍️ Highlight\')}</button>'
  },
  {
    target: '<button type="button" class="ie-pill-btn ie-pill-clear" title="Clear selection">✕ Clear</button>',
    replacement: '<button type="button" class="ie-pill-btn ie-pill-clear" title="${t(\'reading.clear_selection_tooltip\', undefined, \'Clear selection\')}">${t(\'reading.clear_selection\', undefined, \'✕ Clear\')}</button>'
  }
]);

// 8. views/speaking.ts
replaceInFile('src/ielts/views/speaking.ts', [
  {
    target: "container.append(h('h3', '', 'Comparative Model Answers & Examiner Commentary (Band 6.5 vs 7.5 vs 8.5)'));",
    replacement: "container.append(h('h3', '', t('speaking.comparative_models_title', undefined, 'Comparative Model Answers & Examiner Commentary (Band 6.5 vs 7.5 vs 8.5)')));"
  }
]);

// 9. views/listening.ts
replaceInFile('src/ielts/views/listening.ts', [
  {
    target: "pane.append(h('h2', '', `Section ${s.section}: ${esc(s.title)}`));",
    replacement: "pane.append(h('h2', '', `${t('ielts.section', undefined, 'Section')} ${s.section}: ${esc(s.title)}`));"
  }
]);

// 10. views/reading-drills.ts
replaceInFile('src/ielts/views/reading-drills.ts', [
  {
    target: '<span class="ie-badge-band" style="background:rgba(245,158,11,0.15); color:var(--accent-gold, #f59e0b); border:1px solid rgba(245,158,11,0.3); font-size:11px; padding:3px 8px; border-radius:6px; margin-left:8px;">🎯 Weakness-First</span>',
    replacement: '<span class="ie-badge-band" style="background:rgba(245,158,11,0.15); color:var(--accent-gold, #f59e0b); border:1px solid rgba(245,158,11,0.3); font-size:11px; padding:3px 8px; border-radius:6px; margin-left:8px;">🎯 ${t(\'rdrills.weakness_first\', undefined, \'Weakness-First\')}</span>'
  },
  {
    target: "navTabs.setAttribute('aria-label', 'Question Types 1 through 14');",
    replacement: "navTabs.setAttribute('aria-label', t('rdrills.types_nav_aria', undefined, 'Question Types 1 through 14'));"
  }
]);

// 11. views/writing-studio.ts
replaceInFile('src/ielts/views/writing-studio.ts', [
  {
    target: 'placeholder="Overall, it is evident that [dominant trend]... In stark contrast, [key anomaly]..."',
    replacement: 'placeholder="${t(\'writing.overview_placeholder\', undefined, \'Overall, it is evident that [dominant trend]... In stark contrast, [key anomaly]...\')}"'
  },
  {
    target: 'placeholder="Regarding the primary categories..."',
    replacement: 'placeholder="${t(\'writing.body1_placeholder\', undefined, \'Regarding the primary categories...\')}"'
  },
  {
    target: 'placeholder="By contrast, figures for..."',
    replacement: 'placeholder="${t(\'writing.body2_placeholder\', undefined, \'By contrast, figures for...\')}"'
  },
  {
    target: 'placeholder="State background context and direct thesis stance..."',
    replacement: 'placeholder="${t(\'writing.intro_placeholder\', undefined, \'State background context and direct thesis stance...\')}"'
  },
  {
    target: 'placeholder="Sentence 1 (Claim)... Sentence 2 (Causal explanation)... Sentence 3 (Concrete evidence)... Sentence 4 (Concluding impact)..."',
    replacement: 'placeholder="${t(\'writing.b1_placeholder\', undefined, \'Sentence 1 (Claim)... Sentence 2 (Causal explanation)... Sentence 3 (Concrete evidence)... Sentence 4 (Concluding impact)...\')}"'
  },
  {
    target: 'placeholder="Sentence 1 (Second main claim)... Sentence 2 (Causal logic)... Sentence 3 (Concrete example)... Sentence 4 (Concluding impact)..."',
    replacement: 'placeholder="${t(\'writing.b2_placeholder\', undefined, \'Sentence 1 (Second main claim)... Sentence 2 (Causal logic)... Sentence 3 (Concrete example)... Sentence 4 (Concluding impact)...\')}"'
  },
  {
    target: 'placeholder="In conclusion, reiterate main positions without introducing brand new points..."',
    replacement: 'placeholder="${t(\'writing.concl_placeholder\', undefined, \'In conclusion, reiterate main positions without introducing brand new points...\')}"'
  }
]);

// 12. modules/email-builder.ts
replaceInFile('src/modules/email-builder.ts', [
  {
    target: 'placeholder="Tap tiles to build your email"',
    replacement: 'placeholder="${t(\'email.placeholder\', undefined, \'Tap tiles to build your email\')}"'
  },
  {
    target: '<button type="button" class="drill-btn drill-btn-ghost" data-clear>Clear draft</button>',
    replacement: '<button type="button" class="drill-btn drill-btn-ghost" data-clear>${t(\'email.clear_draft\', undefined, \'Clear draft\')}</button>'
  }
]);

// 13. modules/reading-dossier.ts
replaceInFile('src/modules/reading-dossier.ts', [
  {
    target: '<button class="hud-btn btn-mode-intensive" title="Intensive (4-Pass)" style="flex: 1 1 130px; border-radius: var(--radius-btn, 10px); min-height: 44px; justify-content: center;">🔬 Intensive</button>',
    replacement: '<button class="hud-btn btn-mode-intensive" title="${t(\'reading.intensive_tooltip\', undefined, \'Intensive (4-Pass)\')}" style="flex: 1 1 130px; border-radius: var(--radius-btn, 10px); min-height: 44px; justify-content: center;">${t(\'reading.mode_intensive\', undefined, \'🔬 Intensive\')}</button>'
  },
  {
    target: '<button class="hud-btn btn-mode-extensive active" title="Extensive (Comprehensible Input)" style="flex: 1 1 130px; background: var(--accent-gold); color: var(--bg-canvas); border-radius: var(--radius-btn, 10px); font-weight: 700; min-height: 44px; justify-content: center;">📖 Extensive</button>',
    replacement: '<button class="hud-btn btn-mode-extensive active" title="${t(\'reading.extensive_tooltip\', undefined, \'Extensive (Comprehensible Input)\')}" style="flex: 1 1 130px; background: var(--accent-gold); color: var(--bg-canvas); border-radius: var(--radius-btn, 10px); font-weight: 700; min-height: 44px; justify-content: center;">${t(\'reading.mode_extensive\', undefined, \'📖 Extensive\')}</button>'
  },
  {
    target: '<button class="hud-btn btn-mode-intensive active" title="Intensive (4-Pass)" style="flex: 1 1 130px; background: var(--accent-gold); color: var(--bg-canvas); border-radius: var(--radius-btn, 10px); font-weight: 700; min-height: 44px; justify-content: center;">🔬 Intensive</button>',
    replacement: '<button class="hud-btn btn-mode-intensive active" title="${t(\'reading.intensive_tooltip\', undefined, \'Intensive (4-Pass)\')}" style="flex: 1 1 130px; background: var(--accent-gold); color: var(--bg-canvas); border-radius: var(--radius-btn, 10px); font-weight: 700; min-height: 44px; justify-content: center;">${t(\'reading.mode_intensive\', undefined, \'🔬 Intensive\')}</button>'
  },
  {
    target: '<button class="hud-btn btn-mode-extensive" title="Extensive (Comprehensible Input)" style="flex: 1 1 130px; border-radius: var(--radius-btn, 10px); min-height: 44px; justify-content: center;">📖 Extensive</button>',
    replacement: '<button class="hud-btn btn-mode-extensive" title="${t(\'reading.extensive_tooltip\', undefined, \'Extensive (Comprehensible Input)\')}" style="flex: 1 1 130px; border-radius: var(--radius-btn, 10px); min-height: 44px; justify-content: center;">${t(\'reading.mode_extensive\', undefined, \'📖 Extensive\')}</button>'
  },
  {
    target: '<button type="button" class="hud-btn btn-close-drawer" title="Close drawer" aria-label="Close vocabulary drawer">✕ Close</button>',
    replacement: '<button type="button" class="hud-btn btn-close-drawer" title="${t(\'reading.close_drawer_tooltip\', undefined, \'Close drawer\')}" aria-label="${t(\'reading.close_drawer_aria\', undefined, \'Close vocabulary drawer\')}">${t(\'reading.clear_selection\', undefined, \'✕ Close\')}</button>'
  }
]);

// 14. modules/tenses-dossier.ts
replaceInFile('src/modules/tenses-dossier.ts', [
  {
    target: '<button class="hud-btn btn-start-gauntlet" style="margin-top: 12px; font-weight: 700;">Start Gauntlet Challenge</button>',
    replacement: '<button class="hud-btn btn-start-gauntlet" style="margin-top: 12px; font-weight: 700;">${t(\'tenses.start_gauntlet\', undefined, \'Start Gauntlet Challenge\')}</button>'
  },
  {
    target: "<strong>${this.isCorrect ? '✓ CHÍNH XÁC / WELL DONE!' : '✗ CHƯA ĐÚNG / INCORRECT'}</strong>",
    replacement: "<strong>${this.isCorrect ? t('tenses.feedback_correct', undefined, '✓ CORRECT / WELL DONE!') : t('tenses.feedback_incorrect', undefined, '✗ INCORRECT')}</strong>"
  },
  {
    target: '<span class="correct-answer-callout">Đáp án đúng: <u>${this.escapeHtml(this.currentShuffledOptions[this.currentCorrectIndex])}</u></span>',
    replacement: '<span class="correct-answer-callout">${t(\'tenses.correct_ans_label\', undefined, \'Correct answer:\')} <u>${this.escapeHtml(this.currentShuffledOptions[this.currentCorrectIndex])}</u></span>'
  },
  {
    target: "${this.gauntletIndex < 11 ? `NEXT QUESTION (${this.gauntletIndex + 2}/12) &rarr;` : `FINISH & VIEW SCORECARD ${icon('target', 14)}`}",
    replacement: "${this.gauntletIndex < 11 ? t('tenses.btn_next_q', { current: this.gauntletIndex + 2, total: 12 }, `NEXT QUESTION (${this.gauntletIndex + 2}/12) →`) : t('tenses.btn_finish_scorecard', undefined, 'FINISH & VIEW SCORECARD') + ' ' + icon('target', 14)}"
  },
  {
    target: `    let gradeTitle = 'C1/C2 NATIVE TENSE MASTERY';
    let gradeComment = 'Khả năng chia động từ và phân tích ngữ cảnh thời gian của bạn đạt độ chuẩn xác tuyệt đối!';
    let gradeColor = 'var(--good, #22c55e)';

    if (scorePct < 60) {
      gradeTitle = 'FOUNDATION REVIEW REQUIRED';
      gradeComment = 'Bạn cần ôn lại công thức và các dấu hiệu nhận biết của các thì cơ bản trong 12 Tenses Codex.';
      gradeColor = 'var(--alarm, #ef4444)';
    } else if (scorePct < 85) {
      gradeTitle = 'B2 UPPER-INTERMEDIATE';
      gradeComment = 'Nền tảng khá vững vàng, tuy nhiên bạn cần lưu ý kỹ các thì hoàn thành tiếp diễn và mốc thời gian quá khứ.';
      gradeColor = 'var(--accent-gold, #ca8a04)';
    }`,
    replacement: `    let gradeTitle = t('tenses.grade_c1_title', undefined, 'C1/C2 NATIVE TENSE MASTERY');
    let gradeComment = t('tenses.grade_c1_comment', undefined, 'Khả năng chia động từ và phân tích ngữ cảnh thời gian của bạn đạt độ chuẩn xác tuyệt đối!');
    let gradeColor = 'var(--good, #22c55e)';

    if (scorePct < 60) {
      gradeTitle = t('tenses.grade_b1_title', undefined, 'FOUNDATION REVIEW REQUIRED');
      gradeComment = t('tenses.grade_b1_comment', undefined, 'Bạn cần ôn lại công thức và các dấu hiệu nhận biết của các thì cơ bản trong 12 Tenses Codex.');
      gradeColor = 'var(--alarm, #ef4444)';
    } else if (scorePct < 85) {
      gradeTitle = t('tenses.grade_b2_title', undefined, 'B2 UPPER-INTERMEDIATE');
      gradeComment = t('tenses.grade_b2_comment', undefined, 'Nền tảng khá vững vàng, tuy nhiên bạn cần lưu ý kỹ các thì hoàn thành tiếp diễn và mốc thời gian quá khứ.');
      gradeColor = 'var(--accent-gold, #ca8a04)';
    }`
  }
]);

// 15. modules/exam-cockpit-dossier.ts
replaceInFile('src/modules/exam-cockpit-dossier.ts', [
  {
    target: '<span class="cd-test-hub-kicker">OFFICIAL CD-IELTS EXAM HUB · DANH SÁCH ĐỀ THI</span>',
    replacement: '<span class="cd-test-hub-kicker">${t(\'cockpit.test_hub_kicker\', undefined, \'OFFICIAL CD-IELTS EXAM HUB · TEST CATALOG\')}</span>'
  },
  {
    target: '<h2 class="cd-test-hub-title" id="cd-test-hub-title">Chọn Đề Thi Chuẩn Hóa CD-IELTS</h2>',
    replacement: '<h2 class="cd-test-hub-title" id="cd-test-hub-title">${t(\'cockpit.test_hub_title\', undefined, \'Select Standardized CD-IELTS Test\')}</h2>'
  },
  {
    target: `<p class="cd-test-hub-lead">
              Vui lòng chọn 1 đề thi bên dưới để bắt đầu. Đồng hồ tính giờ (60:00) <strong>chỉ bắt đầu chạy</strong> khi bạn bấm nút <strong>"Bắt đầu làm bài thi"</strong>.
            </p>`,
    replacement: `<p class="cd-test-hub-lead">\n              \${t('cockpit.test_hub_lead', undefined, 'Please select a test below to begin. The 60:00 countdown timer will only start when you click "Start Timed Exam".')}\n            </p>`
  },
  {
    target: '<span class="cd-test-card-kicker">ĐỀ THI 0${tItem.testNumber} // ${tItem.module}</span>',
    replacement: '<span class="cd-test-card-kicker">${t(\'cockpit.card_test_kicker\', { testNumber: tItem.testNumber, module: tItem.module }, `TEST 0${tItem.testNumber} // ${tItem.module}`)}</span>'
  },
  {
    target: '• <strong>Đoạn ${pIdx + 1}:</strong>',
    replacement: '• <strong>${t(\'cockpit.passage_num\', { n: pIdx + 1 }, `Passage ${pIdx + 1}`)}:</strong>'
  },
  {
    target: '<span>⏱️ ${tItem.durationMinutes} PHÚT · 📝 ${tItem.questionCount} CÂU</span>',
    replacement: '<span>⏱️ ${tItem.durationMinutes} ${t(\'cockpit.mins_upper\', undefined, \'MINS\')} · 📝 ${tItem.questionCount} ${t(\'cockpit.questions_upper\', undefined, \'QUESTIONS\')}</span>'
  },
  {
    target: "<span class=\"cd-test-card-badge\">${this.selectedTestIndex === idx ? '✓ ĐÃ CHỌN' : 'CHỌN ĐỀ NÀY'}</span>",
    replacement: "<span class=\"cd-test-card-badge\">${this.selectedTestIndex === idx ? t('cockpit.card_selected', undefined, '✓ SELECTED') : t('cockpit.card_select_this', undefined, 'SELECT THIS TEST')}</span>"
  },
  {
    target: `            <button type="button" class="cd-btn-hub-cancel" id="btn-preview-exam-station">
              ✕ Xem trước giao diện đề (Chưa tính giờ)
            </button>`,
    replacement: `            <button type="button" class="cd-btn-hub-cancel" id="btn-preview-exam-station">
              \${t('cockpit.btn_preview_exam', undefined, '✕ Preview Exam Station (Untimed)')}
            </button>`
  },
  {
    target: `            <button type="button" class="cd-btn-hub-start" id="btn-start-selected-exam">
              \${icon('zap', 14)} Bắt đầu làm bài thi (60:00)
            </button>`,
    replacement: `            <button type="button" class="cd-btn-hub-start" id="btn-start-selected-exam">
              \${icon('zap', 14)} \${t('cockpit.btn_start_timed_exam', undefined, 'Start Timed Exam (60:00)')}
            </button>`
  },
  {
    target: `          <button type="button" class="cd-btn cd-btn-open-hub" id="btn-open-test-hub" title="Chọn đề thi khác">
            \${icon('book', 14)} <span>Danh sách đề</span>
          </button>`,
    replacement: `          <button type="button" class="cd-btn cd-btn-open-hub" id="btn-open-test-hub" title="\${t('cockpit.select_other_test', undefined, 'Select another test')}">
            \${icon('book', 14)} <span>\${t('cockpit.btn_test_catalog', undefined, 'Test Catalog')}</span>
          </button>`
  },
  {
    target: `          \${!this.isExamStarted ? \`
            <button type="button" class="cd-btn cd-btn-start-inline" id="btn-start-exam-inline" title="Bắt đầu tính giờ làm bài">
              \${icon('zap', 12)} <span>BẮT ĐẦU</span>
            </button>
          \` : \`
            <button type="button" class="cd-btn cd-btn-pause-inline" id="btn-pause-toggle" title="\${this.isTimerPaused ? 'Tiếp tục tính giờ' : 'Tạm dừng đồng hồ'}">
              <span>\${this.isTimerPaused ? '▶ Tiếp tục' : '⏸ Tạm dừng'}</span>
            </button>
          \`}`,
    replacement: `          \${!this.isExamStarted ? \`
            <button type="button" class="cd-btn cd-btn-start-inline" id="btn-start-exam-inline" title="\${t('cockpit.start_timer_title', undefined, 'Start timed test')}">
              \${icon('zap', 12)} <span>\${t('cockpit.btn_start_upper', undefined, 'START')}</span>
            </button>
          \` : \`
            <button type="button" class="cd-btn cd-btn-pause-inline" id="btn-pause-toggle" title="\${this.isTimerPaused ? t('cockpit.resume_timer_title', undefined, 'Resume exam timer') : t('cockpit.pause_timer_title', undefined, 'Pause exam timer')}">
              <span>\${this.isTimerPaused ? t('cockpit.btn_resume', undefined, '▶ Resume') : t('cockpit.btn_pause', undefined, '⏸ Pause')}</span>
            </button>
          \`}`
  },
  {
    target: "${icon('book', 16)}<span>${isVi ? 'Danh sách đề' : 'Test Catalog'}</span>",
    replacement: "${icon('book', 16)}<span>${t('cockpit.btn_test_catalog', undefined, 'Test Catalog')}</span>"
  }
]);

// 16. modules/settings-dossier.ts
replaceInFile('src/modules/settings-dossier.ts', [
  {
    target: `          <p style="margin: 0; font-size: var(--font-body-compact, 14px); color: var(--ink-secondary); line-height: 1.5;">
            Quản lý trình độ CEFR, cấu hình hệ thống âm thanh kép, thông báo chu kỳ SRS, giao diện tập trung và sao lưu dữ liệu toàn diện.
          </p>`,
    replacement: `          <p style="margin: 0; font-size: var(--font-body-compact, 14px); color: var(--ink-secondary); line-height: 1.5;">
            \${t('settings.header_desc', undefined, 'Manage CEFR levels, dual audio bus configuration, SRS notifications, focused UI modes, and comprehensive profile backups.')}
          </p>`
  },
  {
    target: '01 • LỘ TRÌNH &amp; HỒ SƠ CEFR',
    replacement: "${t('settings.card1_kicker', undefined, '01 • ROADMAP & CEFR PROFILE')}"
  },
  {
    target: 'Trình độ CEFR &amp; Mục tiêu học tập',
    replacement: "${t('settings.card1_title', undefined, 'CEFR Proficiency & Learning Targets')}"
  },
  {
    target: `          <p style="margin: 0; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.5;">
            Trình độ hiện tại ảnh hưởng trực tiếp đến độ phức tạp của bài tập, kho collocations và đề luyện trong toàn bộ hệ thống.
          </p>`,
    replacement: `          <p style="margin: 0; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.5;">
            \${t('settings.card1_desc', undefined, 'Your active proficiency level dynamically tunes the complexity of exercises, collocation vaults, and drills across the entire system.')}
          </p>`
  },
  {
    target: '<span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">Chọn cấp độ CEFR hiện tại:</span>',
    replacement: '<span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t(\'settings.select_cefr_label\', undefined, \'Select Active CEFR Level:\')}</span>'
  },
  {
    target: '<span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">Mục tiêu XP mỗi ngày:</span>',
    replacement: '<span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t(\'settings.daily_xp_goal_label\', undefined, \'Daily XP Goal:\')}</span>'
  },
  {
    target: '50 XP (Duy trì)',
    replacement: "${t('settings.xp_maintain', undefined, '50 XP (Maintain)')}"
  },
  {
    target: '100 XP (Chuẩn)',
    replacement: "${t('settings.xp_standard', undefined, '100 XP (Standard)')}"
  },
  {
    target: '200 XP (Cấp tốc)',
    replacement: "${t('settings.xp_intensive', undefined, '200 XP (Intensive)')}"
  },
  {
    target: '<span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">Mục tiêu IELTS Band (Target Band):</span>',
    replacement: '<span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t(\'settings.target_ielts_band_label\', undefined, \'Target IELTS Band:\')}</span>'
  },
  {
    target: "${icon('clock', 14)} Ngày thi IELTS mục tiêu:",
    replacement: "${icon('clock', 14)} ${t('settings.target_exam_date_label', undefined, 'Target IELTS Exam Date:')}"
  },
  {
    target: "`⏳ Còn ${examDaysRemaining} ngày nữa đến ngày thi (${targetExamDate})`",
    replacement: "t('settings.days_remaining_countdown', { days: examDaysRemaining, date: targetExamDate }, `⏳ ${examDaysRemaining} days remaining until exam (${targetExamDate})`)"
  },
  {
    target: "`⚠️ Ngày thi đã qua (${targetExamDate})`",
    replacement: "t('settings.exam_date_passed', { date: targetExamDate }, `⚠️ Exam date has passed (${targetExamDate})`)"
  },
  {
    target: "'ℹ️ Chưa đặt ngày thi dự kiến (chọn ngày để kích hoạt đếm ngược)'",
    replacement: "t('settings.exam_date_unset', undefined, 'ℹ️ No exam date set (select a date to activate countdown)')"
  },
  {
    target: '<span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">Quỹ thời gian học mỗi ngày (Time Budget):</span>',
    replacement: '<span style="font-size: var(--font-kicker); color: var(--ink-muted); font-weight: 600; text-transform: uppercase;">${t(\'settings.time_budget_label\', undefined, \'Daily Study Time Budget:\')}</span>'
  },
  {
    target: "${dailyTimeBudget} phút/ngày",
    replacement: "${t('settings.mins_per_day', { mins: dailyTimeBudget }, `${dailyTimeBudget} mins/day`)}"
  },
  {
    target: '15m (Brisk)',
    replacement: "${t('settings.time_15m', undefined, '15m (Brisk)')}"
  },
  {
    target: '30m (Chuẩn)',
    replacement: "${t('settings.time_30m', undefined, '30m (Standard)')}"
  },
  {
    target: '60m (Cấp tốc)',
    replacement: "${t('settings.time_60m', undefined, '60m (Intensive)')}"
  },
  {
    target: '<span>Ưu tiên khắc phục điểm yếu (Weakness-First Focus)</span>',
    replacement: "<span>${t('settings.weakness_first_label', undefined, 'Prioritize Weaknesses (Weakness-First Focus)')}</span>"
  },
  {
    target: "`<strong style=\"color: ${weaknessFirst ? 'var(--good)' : 'var(--ink-muted)'};\">${weaknessFirst ? 'ĐANG BẬT ●' : 'TẮT'}</strong>`",
    replacement: "`<strong style=\"color: ${weaknessFirst ? 'var(--good)' : 'var(--ink-muted)'};\">${weaknessFirst ? t('settings.status_on', undefined, 'ON ●') : t('settings.status_off', undefined, 'OFF')}</strong>`"
  },
  {
    target: `            <span style="font-size: 12px; color: var(--ink-secondary); line-height: 1.4;">
              Tự động ưu tiên đưa các dạng bài, từ vựng và bẫy L1 mẹ đẻ bạn từng làm sai trong Mistake Vault &amp; Error Ledger lên đầu buổi luyện.
            </span>`,
    replacement: `            <span style="font-size: 12px; color: var(--ink-secondary); line-height: 1.4;">
              \${t('settings.weakness_first_desc', undefined, 'Automatically surfaces question types, vocabulary items, and L1 transfer traps you previously missed in the Mistake Vault to the start of practice sessions.')}
            </span>`
  },
  {
    target: "${icon('target', 16)}<span>Làm lại Test xếp lớp 2 phút</span>",
    replacement: "${icon('target', 16)}<span>${t('settings.btn_retake_placement', undefined, 'Retake 2-Min Placement Assessment')}</span>"
  },
  {
    target: '02 • GIAO DIỆN &amp; TRỢ NĂNG',
    replacement: "${t('settings.card2_kicker', undefined, '02 • INTERFACE & ACCESSIBILITY')}"
  },
  {
    target: 'Chế độ hiển thị, Chuyển động &amp; Tập trung',
    replacement: "${t('settings.card2_title', undefined, 'Display Modes, Motion & Focus')}"
  },
  {
    target: "<span>Chủ đề: <strong>${currentTheme === 'dark' ? 'Dark Mode (Tối)' : 'Light Mode (Sáng)'}</strong></span>",
    replacement: "<span>${t('settings.theme_label', { mode: currentTheme === 'dark' ? t('settings.theme_dark_mode', undefined, 'Dark Mode') : t('settings.theme_light_mode', undefined, 'Light Mode') }, `Theme: ${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`)}</span>"
  },
  {
    target: "<span>Chuyển động: <strong>${isReducedMotion ? 'Reduced (Giảm chuyển cảnh)' : 'Full (Mượt mà)'}</strong></span>",
    replacement: "<span>${t('settings.motion_label', { mode: isReducedMotion ? t('settings.motion_reduced', undefined, 'Reduced Motion') : t('settings.motion_full', undefined, 'Smooth Animation') }, `Motion: ${isReducedMotion ? 'Reduced Motion' : 'Smooth Animation'}`)}</span>"
  },
  {
    target: "<span>Zen Immersion: <strong>${isZen ? 'Đang bật ●' : 'Tắt'}</strong></span>",
    replacement: "<span>${t('settings.zen_label', { status: isZen ? t('settings.status_on', undefined, 'ON ●') : t('settings.status_off', undefined, 'OFF') }, `Zen Immersion: ${isZen ? 'ON ●' : 'OFF'}`)}</span>"
  },
  {
    target: "<span>Tương phản cao: <strong>${isHighContrast ? 'Bật (High Contrast)' : 'Chuẩn'}</strong></span>",
    replacement: "<span>${t('settings.contrast_label', { status: isHighContrast ? t('settings.contrast_high', undefined, 'High Contrast') : t('settings.contrast_standard', undefined, 'Standard') }, `High Contrast: ${isHighContrast ? 'High Contrast' : 'Standard'}`)}</span>"
  },
  {
    target: 'Màu sắc chủ đạo ứng dụng (Primary Accent Theme):',
    replacement: "${t('settings.accent_theme_label', undefined, 'Primary Accent Theme:')}"
  },
  {
    target: '03 • HỆ THỐNG ÂM THANH KÉP &amp; GIỌNG ĐỌC',
    replacement: "${t('settings.card3_kicker', undefined, '03 • DUAL AUDIO BUS & VOICES')}"
  },
  {
    target: 'Hiệu ứng tương tác, Không gian âm thanh &amp; TTS',
    replacement: "${t('settings.card3_title', undefined, 'Tactile Feedback, Ambient Soundscapes & TTS')}"
  },
  {
    target: "<span>${isMuted ? 'Đang tắt tiếng' : 'Âm thanh bật'}</span>",
    replacement: "<span>${isMuted ? t('settings.sound_status_muted', undefined, 'Muted') : t('settings.sound_status_on', undefined, 'Audio Enabled')}</span>"
  },
  {
    target: "${icon('volume', 14)} SFX Volume (Âm tương tác):",
    replacement: "${icon('volume', 14)} ${t('settings.sfx_volume_label', undefined, 'SFX Volume (Tactile Audio):')}"
  },
  {
    target: "${icon('music', 14)} Music Volume (Nhạc nền):",
    replacement: "${icon('music', 14)} ${t('settings.music_volume_label', undefined, 'Music Volume (Ambient Soundscape):')}"
  },
  {
    target: 'Không gian âm thanh Ambient:',
    replacement: "${t('settings.ambient_soundscape_label', undefined, 'Ambient Soundscape Mode:')}"
  },
  {
    target: '<option value="off" ${musicMode === \'off\' ? \'selected\' : \'\'}>Tắt nhạc nền (Off)</option>',
    replacement: '<option value="off" ${musicMode === \'off\' ? \'selected\' : \'\'}>${t(\'settings.ambient_off\', undefined, \'Off\')}</option>'
  },
  {
    target: '<option value="calm-chords" ${musicMode === \'calm-chords\' ? \'selected\' : \'\'}>Calm Chords (Dịu êm)</option>',
    replacement: '<option value="calm-chords" ${musicMode === \'calm-chords\' ? \'selected\' : \'\'}>${t(\'settings.ambient_chords_label\', undefined, \'Calm Chords (Gentle)\')}</option>'
  },
  {
    target: '<option value="celestial-void" ${musicMode === \'celestial-void\' ? \'selected\' : \'\'}>Celestial Void (Không gian sâu)</option>',
    replacement: '<option value="celestial-void" ${musicMode === \'celestial-void\' ? \'selected\' : \'\'}>${t(\'settings.ambient_void_label\', undefined, \'Celestial Void (Deep Space)\')}</option>'
  },
  {
    target: '<option value="zen-drone" ${musicMode === \'zen-drone\' ? \'selected\' : \'\'}>Zen Drone (Thiền định)</option>',
    replacement: '<option value="zen-drone" ${musicMode === \'zen-drone\' ? \'selected\' : \'\'}>${t(\'settings.ambient_zen_label\', undefined, \'Zen Drone (Meditative)\')}</option>'
  },
  {
    target: '<option value="alpha-baroque" ${musicMode === \'alpha-baroque\' ? \'selected\' : \'\'}>Alpha Baroque (Nhịp 60 BPM Tối ưu Não bộ)</option>',
    replacement: '<option value="alpha-baroque" ${musicMode === \'alpha-baroque\' ? \'selected\' : \'\'}>${t(\'settings.ambient_alpha_label\', undefined, \'Alpha Baroque (60 BPM Brainwave Optimization)\')}</option>'
  },
  {
    target: '<option value="lofi-study" ${musicMode === \'lofi-study\' ? \'selected\' : \'\'}>Lo-Fi Study Beats (Tập trung Sâu)</option>',
    replacement: '<option value="lofi-study" ${musicMode === \'lofi-study\' ? \'selected\' : \'\'}>${t(\'settings.ambient_lofi_label\', undefined, \'Lo-Fi Study Beats (Deep Focus)\')}</option>'
  },
  {
    target: 'Giọng đọc chuẩn đề thi IELTS (Audio Accent):',
    replacement: "${t('settings.ielts_audio_accent_label', undefined, 'Exam Audio Accent:')}"
  },
  {
    target: '<option value="uk-rp" ${ieltsAccent === \'uk-rp\' ? \'selected\' : \'\'}>UK RP (British Academic - Chuẩn Cambridge)</option>',
    replacement: '<option value="uk-rp" ${ieltsAccent === \'uk-rp\' ? \'selected\' : \'\'}>${t(\'settings.accent_uk_rp\', undefined, \'UK RP (British Academic - Cambridge Standard)\')}</option>'
  },
  {
    target: '<option value="general-american" ${ieltsAccent === \'general-american\' ? \'selected\' : \'\'}>General American (Bắc Mỹ)</option>',
    replacement: '<option value="general-american" ${ieltsAccent === \'general-american\' ? \'selected\' : \'\'}>${t(\'settings.accent_general_american\', undefined, \'General American (North American)\')}</option>'
  },
  {
    target: '<option value="australian" ${ieltsAccent === \'australian\' ? \'selected\' : \'\'}>Australian (en-AU - Giọng Úc)</option>',
    replacement: '<option value="australian" ${ieltsAccent === \'australian\' ? \'selected\' : \'\'}>${t(\'settings.accent_australian\', undefined, \'Australian (en-AU)\')}</option>'
  },
  {
    target: '<option value="scottish" ${ieltsAccent === \'scottish\' ? \'selected\' : \'\'}>Scottish (en-GB-scotland - Scotland)</option>',
    replacement: '<option value="scottish" ${ieltsAccent === \'scottish\' ? \'selected\' : \'\'}>${t(\'settings.accent_scottish\', undefined, \'Scottish (en-GB-scotland)\')}</option>'
  },
  {
    target: '<option value="random" ${ieltsAccent === \'random\' ? \'selected\' : \'\'}>Random Exam Mode (Xoay tua quốc tế ngẫu nhiên)</option>',
    replacement: '<option value="random" ${ieltsAccent === \'random\' ? \'selected\' : \'\'}>${t(\'settings.accent_random\', undefined, \'Random Exam Mode (International Rotation)\')}</option>'
  },
  {
    target: 'Tốc độ đọc giọng mẫu TTS:',
    replacement: "${t('settings.tts_speed_label', undefined, 'TTS Model Voice Speed:')}"
  },
  {
    target: '1.0x (Chuẩn)',
    replacement: "${t('settings.tts_rate_normal', undefined, '1.0x (Standard)')}"
  },
  {
    target: 'Phản hồi xúc giác &amp; Haptics:',
    replacement: "${t('settings.haptics_label', undefined, 'Acoustic Haptics & Feedback:')}"
  },
  {
    target: "${hapticsEnabled ? 'Haptic Feedback: Đang Bật' : 'Haptic Feedback: Tắt'}",
    replacement: "${hapticsEnabled ? t('settings.haptics_status_on', undefined, 'Haptic Feedback: Enabled') : t('settings.haptics_status_off', undefined, 'Haptic Feedback: Off')}"
  },
  {
    target: '04 • THÔNG BÁO &amp; NHẮC NHỞ ÔN TẬP',
    replacement: "${t('settings.card4_kicker', undefined, '04 • NOTIFICATIONS & SRS REMINDERS')}"
  },
  {
    target: 'Nhắc nhở chu kỳ SRS &amp; Bảo vệ chuỗi Streak',
    replacement: "${t('settings.card4_title', undefined, 'SRS Spaced Repetition Cycles & Streak Defense')}"
  },
  {
    target: `          <p style="margin: 0; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.5;">
            Hệ thống sử dụng Web Push Notification để nhắc bạn ôn tập thẻ từ vựng đúng thời điểm vàng theo đường cong quên lãng Spaced Repetition.
          </p>`,
    replacement: `          <p style="margin: 0; font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); line-height: 1.5;">
            \${t('settings.card4_desc', undefined, 'The system uses Web Push Notifications to alert you to review vocabulary cards right at the golden interval on the Ebbinghaus forgetting curve.')}
          </p>`
  },
  {
    target: "${icon('bell', 16)} <span style=\"margin-left: 8px;\">Thông báo đẩy hàng ngày: ${notifEnabled ? 'ĐANG BẬT (ON)' : 'ĐANG TẮT (OFF)'}</span>",
    replacement: "${icon('bell', 16)} <span style=\"margin-left: 8px;\">${t('settings.notif_toggle_label', { status: notifEnabled ? t('settings.notif_status_on', undefined, 'ENABLED (ON)') : t('settings.notif_status_off', undefined, 'DISABLED (OFF)') }, `Daily Push Notifications: ${notifEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}`)}</span>"
  },
  {
    target: 'Khung giờ nhắc ôn tập ưu tiên:',
    replacement: "${t('settings.reminder_time_label', undefined, 'Preferred Daily Reminder Window:')}"
  },
  {
    target: '<option value="08:00" ${reminderTime === \'08:00\' ? \'selected\' : \'\'}>08:00 (Buổi sáng bắt đầu ngày)</option>',
    replacement: '<option value="08:00" ${reminderTime === \'08:00\' ? \'selected\' : \'\'}>${t(\'settings.remind_morning\', undefined, \'08:00 (Morning Kickstarter)\')}</option>'
  },
  {
    target: '<option value="12:30" ${reminderTime === \'12:30\' ? \'selected\' : \'\'}>12:30 (Nghỉ trưa ngắn 5 phút)</option>',
    replacement: '<option value="12:30" ${reminderTime === \'12:30\' ? \'selected\' : \'\'}>${t(\'settings.remind_noon\', undefined, \'12:30 (Quick 5-Minute Midday)\')}</option>'
  },
  {
    target: '<option value="20:00" ${reminderTime === \'20:00\' ? \'selected\' : \'\'}>20:00 (Buổi tối tập trung)</option>',
    replacement: '<option value="20:00" ${reminderTime === \'20:00\' ? \'selected\' : \'\'}>${t(\'settings.remind_evening\', undefined, \'20:00 (Focused Evening)\')}</option>'
  },
  {
    target: '<option value="22:00" ${reminderTime === \'22:00\' ? \'selected\' : \'\'}>22:00 (Trước khi đi ngủ)</option>',
    replacement: '<option value="22:00" ${reminderTime === \'22:00\' ? \'selected\' : \'\'}>${t(\'settings.remind_night\', undefined, \'22:00 (Before Sleep Winddown)\')}</option>'
  },
  {
    target: '05 • QUẢN LÝ DỮ LIỆU &amp; SAO LƯU HỒ SƠ',
    replacement: "${t('settings.card5_kicker', undefined, '05 • DATA MANAGEMENT & PROFILE BACKUP')}"
  },
  {
    target: 'Telemetry lưu trữ &amp; Đồng bộ JSON ngoại tuyến',
    replacement: "${t('settings.card5_title', undefined, 'Storage Telemetry & Offline JSON Synchronization')}"
  },
  {
    target: '<div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">DUNG LƯỢNG</div>',
    replacement: '<div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">${t(\'settings.stat_storage_size\', undefined, \'STORAGE SIZE\')}</div>'
  },
  {
    target: '<div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">SRS CARDS</div>',
    replacement: '<div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">${t(\'settings.stat_srs_cards\', undefined, \'SRS CARDS\')}</div>'
  },
  {
    target: '<div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">CHUỖI NGÀY</div>',
    replacement: '<div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">${t(\'settings.stat_streak\', undefined, \'STREAK\')}</div>'
  },
  {
    target: '<div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">MISTAKE VAULT</div>',
    replacement: '<div style="font-size: var(--font-kicker); color: var(--ink-muted); text-transform: uppercase;">${t(\'settings.stat_mistakes\', undefined, \'MISTAKE VAULT\')}</div>'
  },
  {
    target: '<div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-cyan, #38bdf8); margin-top: 4px;">${telemetry.srsCount} từ</div>',
    replacement: '<div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-cyan, #38bdf8); margin-top: 4px;">${t(\'settings.stat_srs_unit\', { count: telemetry.srsCount }, `${telemetry.srsCount} items`)}</div>'
  },
  {
    target: '<div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--good, #10b981); margin-top: 4px;">${telemetry.streak} ngày</div>',
    replacement: '<div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--good, #10b981); margin-top: 4px;">${t(\'settings.stat_streak_unit\', { days: telemetry.streak }, `${telemetry.streak} days`)}</div>'
  },
  {
    target: '<div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-purple, #a855f7); margin-top: 4px;">${telemetry.mistakes} lỗi</div>',
    replacement: '<div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-purple, #a855f7); margin-top: 4px;">${t(\'settings.stat_mistakes_unit\', { count: telemetry.mistakes }, `${telemetry.mistakes} errors`)}</div>'
  },
  {
    target: "${icon('download', 16)}<span>[ 💾 XUẤT PROFILE (JSON) ]</span>",
    replacement: "${icon('download', 16)}<span>${t('settings.btn_export_profile_json', undefined, '[ 💾 EXPORT PROFILE (JSON) ]')}</span>"
  },
  {
    target: "${icon('upload', 16)}<span>[ 📥 NHẬP PROFILE (JSON) ]</span>",
    replacement: "${icon('upload', 16)}<span>${t('settings.btn_import_profile_json', undefined, '[ 📥 IMPORT PROFILE (JSON) ]')}</span>"
  },
  {
    target: '<span style="font-size: var(--font-kicker); color: var(--critical, #ef4444); font-weight: 700; text-transform: uppercase;">VÙNG NGUY HIỂM (DANGER ZONE)</span>',
    replacement: '<span style="font-size: var(--font-kicker); color: var(--critical, #ef4444); font-weight: 700; text-transform: uppercase;">${t(\'settings.danger_zone_title\', undefined, \'DANGER ZONE\')}</span>'
  },
  {
    target: '<span style="font-size: 12px; color: var(--ink-secondary);">Xóa toàn bộ tiến độ và đưa app về trạng thái ban đầu.</span>',
    replacement: '<span style="font-size: 12px; color: var(--ink-secondary);">${t(\'settings.danger_zone_desc\', undefined, \'Permanently erase all progress, flashcards, and telemetry to reset the application.\')}</span>'
  },
  {
    target: "${this.confirmingReset ? '⚠ XÁC NHẬN XÓA (Click lần nữa)' : 'Xóa toàn bộ dữ liệu'}",
    replacement: "${this.confirmingReset ? t('settings.btn_confirm_erase', undefined, '⚠ CONFIRM ERASE (Click again to proceed)') : t('settings.btn_erase_data', undefined, 'Erase All Application Data')}"
  },
  {
    target: '06 • THÔNG TIN ỨNG DỤNG &amp; HỆ THỐNG',
    replacement: "${t('settings.card6_kicker', undefined, '06 • APPLICATION & SYSTEM INFO')}"
  },
  {
    target: 'English Singularity &amp; Academic IELTS Suite',
    replacement: "${t('settings.card6_title', undefined, 'English Singularity & Academic IELTS Suite')}"
  },
  {
    target: '<div>• <strong>Phiên bản:</strong> Singularity 1.0.0 (Gold Standard 760px Architecture)</div>',
    replacement: "<div>${t('settings.info_version', undefined, '• <strong>Version:</strong> Singularity 1.0.0 (Gold Standard 760px Architecture)')}</div>"
  },
  {
    target: '<div>• <strong>Kiến trúc:</strong> 100% Client-Side Pure TypeScript • Zero Server Dependency • Zero Trackers</div>',
    replacement: "<div>${t('settings.info_architecture', undefined, '• <strong>Architecture:</strong> 100% Client-Side Pure TypeScript • Zero Server Dependency • Zero Trackers')}</div>"
  },
  {
    target: '<div>• <strong>Ngoại tuyến:</strong> PWA Service Worker sẵn sàng hoạt động không cần mạng</div>',
    replacement: "<div>${t('settings.info_offline', undefined, '• <strong>Offline:</strong> PWA Service Worker ready for full offline operation')}</div>"
  },
  {
    target: '<div>• <strong>Chuẩn âm học:</strong> Apple-Calm Acoustic Haptics &amp; Dual Audio Bus Synthesizer</div>',
    replacement: "<div>${t('settings.info_acoustics', undefined, '• <strong>Acoustics:</strong> Apple-Calm Acoustic Haptics & Dual Audio Bus Synthesizer')}</div>"
  },
  {
    target: "${icon('compass', 16)}<span>Xem lại Spotlight Tour</span>",
    replacement: "${icon('compass', 16)}<span>${t('settings.btn_rerun_tour', undefined, 'Re-run Onboarding Spotlight Tour')}</span>"
  },
  {
    target: "${icon('zap', 16)}<span>Xem Quests &amp; Huy hiệu XP</span>",
    replacement: "${icon('zap', 16)}<span>${t('settings.btn_open_quests', undefined, 'View Quests & XP Badges')}</span>"
  }
]);

console.log('All localizations successfully processed.');

