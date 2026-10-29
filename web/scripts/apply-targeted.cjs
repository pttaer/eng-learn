const fs = require('fs');

let s1 = fs.readFileSync('web/src/modules/exam-cockpit-dossier.ts', 'utf8');
s1 = s1.replace('✕ Xem trước giao diện đề (Chưa tính giờ)', "${t('cockpit.btn_preview_exam', undefined, '✕ Preview Exam Station (Untimed)')}");
s1 = s1.replace("${icon('zap', 14)} Bắt đầu làm bài thi (60:00)", "${icon('zap', 14)} ${t('cockpit.btn_start_timed_exam', undefined, 'Start Timed Exam (60:00)')}");
s1 = s1.replace('title="Chọn đề thi khác"', 'title="' + "${t('cockpit.select_other_test', undefined, 'Select another test')}" + '"');
s1 = s1.replace("${icon('book', 14)} <span>Danh sách đề</span>", "${icon('book', 14)} <span>${t('cockpit.btn_test_catalog', undefined, 'Test Catalog')}</span>");
s1 = s1.replace('title="Bắt đầu tính giờ làm bài"', 'title="' + "${t('cockpit.start_timer_title', undefined, 'Start timed test')}" + '"');
s1 = s1.replace("${icon('zap', 12)} <span>BẮT ĐẦU</span>", "${icon('zap', 12)} <span>${t('cockpit.btn_start_upper', undefined, 'START')}</span>");
s1 = s1.replace('title="${this.isTimerPaused ? \'Tiếp tục tính giờ\' : \'Tạm dừng đồng hồ\'}"', 'title="${this.isTimerPaused ? t(\'cockpit.resume_timer_title\', undefined, \'Resume exam timer\') : t(\'cockpit.pause_timer_title\', undefined, \'Pause exam timer\')}"');
s1 = s1.replace('<span>${this.isTimerPaused ? \'▶ Tiếp tục\' : \'⏸ Tạm dừng\'}</span>', '<span>${this.isTimerPaused ? t(\'cockpit.btn_resume\', undefined, \'▶ Resume\') : t(\'cockpit.btn_pause\', undefined, \'⏸ Pause\')}</span>');
s1 = s1.replace('Vui lòng chọn 1 đề thi bên dưới để bắt đầu. Đồng hồ tính giờ (60:00) <strong>chỉ bắt đầu chạy</strong> khi bạn bấm nút <strong>"Bắt đầu làm bài thi"</strong>.', "${t('cockpit.test_hub_lead', undefined, 'Please select a test below to begin. The 60:00 countdown timer will only start when you click \"Start Timed Exam\".')}");
fs.writeFileSync('web/src/modules/exam-cockpit-dossier.ts', s1, 'utf8');

let s2 = fs.readFileSync('web/src/modules/settings-dossier.ts', 'utf8');
s2 = s2.replace("${weaknessFirst ? 'ĐANG BẬT ●' : 'TẮT'}", "${weaknessFirst ? t('settings.status_on', undefined, 'ON ●') : t('settings.status_off', undefined, 'OFF')}");
fs.writeFileSync('web/src/modules/settings-dossier.ts', s2, 'utf8');

console.log('Targeted replacements executed cleanly.');

