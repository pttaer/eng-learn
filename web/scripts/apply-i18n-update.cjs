const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, '..', 'src', 'core', 'i18n.ts');
let content = fs.readFileSync(i18nPath, 'utf8');

const NEW_EN_KEYS = {
  // Questions
  'questions.check_instant': "Check & Evidence",
  'questions.answer_first': "Please choose or enter an answer first.",

  // IELTS generic
  'ielts.section': "Section",
  'ielts.nav_scroll_left_aria': "Scroll navigation left",
  'ielts.nav_scroll_right_aria': "Scroll navigation right",
  'ielts.nav_sections_aria': "IELTS sections",

  // Speaking Simulator
  'sim.p3_placeholder': 'Type your Part 3 response here... (Try starting with "Well, that is an intriguing inquiry..." or "It largely hinges upon...")',
  'sim.btn_eval_p3': "Analyze Part 3 Answer & Fillers",
  'sim.validated_p3': "VALIDATED PART 3",
  'sim.incomplete_struct': "INCOMPLETE STRUCTURE",
  'sim.band_model': "Band {band} Model",
  'sim.listen_delivery': "🔊 Listen to Band {band} Delivery",

  // Exam Cockpit
  'cockpit.theme_app': "Default (App Theme)",
  'cockpit.btn_prev_short': "Prev",
  'cockpit.btn_unflag_short': "Unflag",
  'cockpit.btn_flag_short': "Flag",
  'cockpit.btn_next_short': "Next",
  'cockpit.btn_test_catalog': "Test Catalog",
  'cockpit.select_other_test': "Select another test",
  'cockpit.start_timer_title': "Start timed test",
  'cockpit.btn_start_upper': "START",
  'cockpit.resume_timer_title': "Resume exam timer",
  'cockpit.pause_timer_title': "Pause exam timer",
  'cockpit.btn_resume': "▶ Resume",
  'cockpit.btn_pause': "⏸ Pause",
  'cockpit.btn_preview_exam': "✕ Preview Exam Station (Untimed)",
  'cockpit.btn_start_timed_exam': "Start Timed Exam (60:00)",
  'cockpit.test_hub_kicker': "OFFICIAL CD-IELTS EXAM HUB · TEST CATALOG",
  'cockpit.test_hub_title': "Select Standardized CD-IELTS Test",
  'cockpit.test_hub_lead': "Please select a test below to begin. The 60:00 countdown timer will only start when you click \"Start Timed Exam\".",
  'cockpit.card_test_kicker': "TEST 0{testNumber} // {module}",
  'cockpit.card_passage_item': "• Passage {pNum}: {title} ({typeDesc})",
  'cockpit.card_meta_info': "⏱️ {mins} MINS · 📝 {count} QUESTIONS",
  'cockpit.card_selected': "✓ SELECTED",
  'cockpit.card_select_this': "SELECT THIS TEST",
  'cockpit.q_range': "Questions {start}–{end}",
  'cockpit.passage_num': "Passage {n}",

  // Header & Nav & Dossiers
  'dossier.celestial_radar': "Celestial Radar & Diagnostic",
  'nav.analytics': "ANALYTICS",
  'common.ok': "OK",
  'common.undo_action': "Undo action",
  'common.verify': "Verify",
  'common.hint': "Hint",
  'common.send': "Send",
  'common.close_cross': "✕ Close",

  // Placement Quiz
  'placement.title': "FIND YOUR STARTING POINT",
  'placement.intro': "Takes about 2 minutes with gentle exploratory questions (from A1 to C2). The test stops dynamically as soon as questions exceed your pace so you never feel exhausted. You can adjust your level anytime.",
  'dossier.vocab': "Vocabulary",
  'dossier.collocations': "Collocations",
  'dossier.grammar': "Grammar",
  'dossier.reading': "Reading",

  // Writing & Preflight Rules
  'writing.preflight_cockpit': "✈️ PRE-FLIGHT AUDIT COCKPIT",
  'writing.preflight_modal_title': "Select 3 Golden Pre-Flight Rules",
  'writing.save_3_rules': "Save 3 Rules",
  'writing.preflight_header': "Pre-Flight Golden Rules (3 Golden Criteria)",
  'writing.customize_rules': "⚙️ Customize Rules",
  'writing.rule_gra_tense_title': "Verify Subject-Verb & Tense Inflections",
  'writing.rule_gra_tense_desc': "Ensure past historical events use simple past, singular third-person takes -s, and compound tenses have auxiliary be/have.",
  'writing.rule_cc_conjunction_title': "Eliminate Dual Conjunction Collisions",
  'writing.rule_cc_conjunction_desc': "Never pair \"Although / Even though\" with \"But\", or \"Because\" with \"So\" in the same clause hierarchy.",
  'writing.rule_lr_collocation_title': "Verify Collocational Prepositions",
  'writing.rule_lr_collocation_desc': "Lock strict verb + preposition pairs: depend on, spend money on, invest in, an increase of 15% / rose by 15%.",
  'writing.rule_ta_overview_title': "Clear Overview with No Raw Data Figures",
  'writing.rule_ta_overview_desc': "Task 1 overview must state overall key trends/differences without quoting specific numerical stats.",
  'writing.rule_cc_paragraph_title': "Four-Sentence Paragraph Development",
  'writing.rule_cc_paragraph_desc': "Each body paragraph follows: Topic sentence -> In-depth explanation -> Empirical example -> Consequential result.",
  'writing.rule_wf_derivation_title': "Check Word Class & Derivational Suffixes",
  'writing.rule_wf_derivation_desc': "Verify part of speech: ensure adverbs modify adjectives/verbs and nouns have correct nominal suffixes (-tion, -ment, -ance).",
  'writing.overview_placeholder': "Overall, it is evident that [dominant trend]... In stark contrast, [key anomaly]...",
  'writing.body1_placeholder': "Regarding the primary categories...",
  'writing.body2_placeholder': "By contrast, figures for...",
  'writing.intro_placeholder': "State background context and direct thesis stance...",
  'writing.b1_placeholder': "Sentence 1 (Claim)... Sentence 2 (Causal explanation)... Sentence 3 (Concrete evidence)... Sentence 4 (Concluding impact)...",
  'writing.b2_placeholder': "Sentence 1 (Second main claim)... Sentence 2 (Causal logic)... Sentence 3 (Concrete example)... Sentence 4 (Concluding impact)...",
  'writing.concl_placeholder': "In conclusion, reiterate main positions without introducing brand new points...",

  // Vault & Commute
  'vault.input_placeholder': "Type the canonical target formulation...",
  'vault.input_l1_placeholder': "Type the corrected sentence here...",
  'vault.interlanguage_fault': "Interlanguage Fault",
  'vault.l1_root_cause': "L1 Root Cause",
  'vault.return_to_vault': "Return to Vault",
  'vault.exit_drill': "Exit Drill",
  'vault.drill_correct': "✓ CORRECT!",
  'vault.drill_incorrect': "✗ INCORRECT:",
  'vault.standard_answer': "Standard answer:",
  'vault.next_drill': "Next Drill ({current}/{total}) →",
  'commute.prev_track': "Previous Track",
  'commute.next_track': "Next Track",

  // Reading & Ergonomics
  'reading.font_size': "Font size:",
  'reading.line_height_relaxed': "↕ Relaxed",
  'reading.line_height_standard': "↕ Standard",
  'reading.highlight': "🖍️ Highlight",
  'reading.clear_selection': "✕ Clear",
  'reading.highlight_tooltip': "Highlight text",
  'reading.clear_selection_tooltip': "Clear selection",
  'reading.mode_intensive': "🔬 Intensive",
  'reading.mode_extensive': "📖 Extensive",
  'reading.intensive_tooltip': "Intensive (4-Pass)",
  'reading.extensive_tooltip': "Extensive (Comprehensible Input)",
  'reading.close_drawer_tooltip': "Close drawer",
  'reading.close_drawer_aria': "Close vocabulary drawer",
  'reading.view_switcher_aria': "Reading Mobile View Switcher",
  'rdrills.weakness_first': "Weakness-First",
  'rdrills.types_nav_aria': "Question Types 1 through 14",

  // Speaking
  'speaking.comparative_models_title': "Comparative Model Answers & Examiner Commentary (Band 6.5 vs 7.5 vs 8.5)",
  'speaking.replay_scenario': "↺ Replay Scenario",
  'speaking.next_scenario': "Next CEFR Scenario →",
  'speaking.play_exemplar': "▶ Exemplar",
  'speaking.play_your_take': "▶ Your Take",
  'speaking.stop_audio': "⏹ Stop",
  'speaking.roleplay_input_placeholder': "Type or confirm spoken response here...",
  'speaking.timer_aria_label': "Speaking take countdown timer",
  'speaking.timer_toggle_aria': "Start or pause timer",
  'speaking.take_complete_aria': "Stop and finish take",
  'speaking.timer_pause': "⏸ Pause",
  'speaking.timer_start': "▶ Start",
  'speaking.ielts_fallback_placeholder': "Or type your spoken response here...",
  'speaking.scratchpad_placeholder': "Make quick notes here (e.g., neural interface, collaborative lab, high performance computing, societal impact)...",
  'speaking.ielts_discursive_placeholder': "Or type your discursive response here...",

  // Tenses
  'tenses.start_gauntlet': "Start Gauntlet Challenge",
  'tenses.feedback_correct': "✓ CORRECT / WELL DONE!",
  'tenses.feedback_incorrect': "✗ INCORRECT",
  'tenses.correct_ans_label': "Correct answer:",
  'tenses.grammar_rule_label': "Grammar Rule:",
  'tenses.vietnamese_exp_label': "Vietnamese Explanation:",
  'tenses.btn_next_q': "NEXT QUESTION ({current}/{total}) →",
  'tenses.btn_finish_scorecard': "FINISH & VIEW SCORECARD",
  'tenses.grade_c1_title': "C1/C2 NATIVE TENSE MASTERY",
  'tenses.grade_c1_comment': "Your verb inflection accuracy and temporal contextual analysis have reached complete native mastery!",
  'tenses.grade_b2_title': "B2 UPPER-INTERMEDIATE",
  'tenses.grade_b2_comment': "Solid foundation, but pay closer attention to perfect continuous aspects and past temporal markers.",
  'tenses.grade_b1_title': "FOUNDATION REVIEW REQUIRED",
  'tenses.grade_b1_comment': "You should review core tense formulas and contextual signal words in the 12 Tenses Codex.",
  'tenses.signals_label': "SIGNALS / CONTEXT CLUES:",
  'tenses.core_usage_label': "CORE USAGE // SYNTACTIC FUNCTION:",
  'tenses.pitfall_label': "COMMON PITFALL // L1 INTERFERENCE:",
  'tenses.listen_sentence_aria': "Listen to sentence",
  'tenses.select_verb_form_aria': "Select the correct verb form",
  'tenses.listen_example_aria': "Listen to example",

  // Email Builder
  'email.clear_draft': "Clear draft",
  'email.placeholder': "Tap tiles to build your email",

  // Flashcards
  'flashcard.rating_easy': "☆ Easy (4)",

  // Listening Dossier
  'listening.play_normal': "▶ Play 1.0x",
  'listening.play_slow': "⏵ Play 0.8x",
  'listening.reset': "↺ Reset",

  // Blitz Dossier
  'blitz.start_aria': "Start 60-Second Blitz Drill",
  'blitz.play_again_aria': "Play Another Blitz Run",
  'blitz.return_tree_aria': "Return to Constellation Skill Tree",

  // Settings Dossier
  'settings.mode_gentle': "🌱 Mode: Gentle Scaffolding",
  'settings.mode_cockpit': "⚡ Mode: Tactical Cockpit",
  'settings.header_desc': "Manage CEFR levels, dual audio bus configuration, SRS notifications, focused UI modes, and comprehensive profile backups.",
  'settings.card1_kicker': "01 • ROADMAP & CEFR PROFILE",
  'settings.card1_title': "CEFR Proficiency & Learning Targets",
  'settings.card1_desc': "Your active proficiency level dynamically tunes the complexity of exercises, collocation vaults, and drills across the entire system.",
  'settings.select_cefr_label': "Select Active CEFR Level:",
  'settings.daily_xp_goal_label': "Daily XP Goal:",
  'settings.xp_maintain': "50 XP (Maintain)",
  'settings.xp_standard': "100 XP (Standard)",
  'settings.xp_intensive': "200 XP (Intensive)",
  'settings.target_ielts_band_label': "Target IELTS Band:",
  'settings.target_exam_date_label': "Target IELTS Exam Date:",
  'settings.days_remaining_countdown': "⏳ {days} days remaining until exam ({date})",
  'settings.exam_date_passed': "⚠️ Exam date has passed ({date})",
  'settings.exam_date_unset': "ℹ️ No exam date set (select a date to activate countdown)",
  'settings.time_budget_label': "Daily Study Time Budget:",
  'settings.mins_per_day': "{mins} mins/day",
  'settings.time_15m': "15m (Brisk)",
  'settings.time_30m': "30m (Standard)",
  'settings.time_60m': "60m (Intensive)",
  'settings.weakness_first_label': "Prioritize Weaknesses (Weakness-First Focus)",
  'settings.weakness_first_desc': "Automatically surfaces question types, vocabulary items, and L1 transfer traps you previously missed in the Mistake Vault to the start of practice sessions.",
  'settings.status_on': "ON ●",
  'settings.status_off': "OFF",
  'settings.btn_retake_placement': "Retake 2-Min Placement Assessment",
  'settings.card2_kicker': "02 • INTERFACE & ACCESSIBILITY",
  'settings.card2_title': "Display Modes, Motion & Focus",
  'settings.theme_label': "Theme: <strong>{mode}</strong>",
  'settings.theme_dark_mode': "Dark Mode",
  'settings.theme_light_mode': "Light Mode",
  'settings.motion_label': "Motion: <strong>{mode}</strong>",
  'settings.motion_reduced': "Reduced Motion",
  'settings.motion_full': "Smooth Animation",
  'settings.zen_label': "Zen Immersion: <strong>{status}</strong>",
  'settings.contrast_label': "High Contrast: <strong>{status}</strong>",
  'settings.contrast_high': "High Contrast",
  'settings.contrast_standard': "Standard",
  'settings.accent_theme_label': "Primary Accent Theme:",
  'settings.card3_kicker': "03 • DUAL AUDIO BUS & VOICES",
  'settings.card3_title': "Tactile Feedback, Ambient Soundscapes & TTS",
  'settings.sound_status_muted': "Muted",
  'settings.sound_status_on': "Audio Enabled",
  'settings.sfx_volume_label': "SFX Volume (Tactile Audio):",
  'settings.music_volume_label': "Music Volume (Ambient Soundscape):",
  'settings.ambient_soundscape_label': "Ambient Soundscape Mode:",
  'settings.ambient_off': "Off",
  'settings.ambient_chords_label': "Calm Chords (Gentle)",
  'settings.ambient_void_label': "Celestial Void (Deep Space)",
  'settings.ambient_zen_label': "Zen Drone (Meditative)",
  'settings.ielts_audio_accent_label': "Exam Audio Accent:",
  'settings.accent_uk_rp': "UK RP (British Academic - Cambridge Standard)",
  'settings.accent_general_american': "General American (North American)",
  'settings.accent_australian': "Australian (en-AU)",
  'settings.accent_scottish': "Scottish (en-GB-scotland)",
  'settings.accent_random': "Random Exam Mode (International Rotation)",
  'settings.tts_speed_label': "TTS Model Voice Speed:",
  'settings.tts_rate_normal': "1.0x (Standard)",
  'settings.haptics_label': "Acoustic Haptics & Feedback:",
  'settings.haptics_status_on': "Haptic Feedback: Enabled",
  'settings.haptics_status_off': "Haptic Feedback: Off",
  'settings.card4_kicker': "04 • NOTIFICATIONS & SRS REMINDERS",
  'settings.card4_title': "SRS Spaced Repetition Cycles & Streak Defense",
  'settings.card4_desc': "The system uses Web Push Notifications to alert you to review vocabulary cards right at the golden interval on the Ebbinghaus forgetting curve.",
  'settings.notif_toggle_label': "Daily Push Notifications: {status}",
  'settings.notif_status_on': "ENABLED (ON)",
  'settings.notif_status_off': "DISABLED (OFF)",
  'settings.reminder_time_label': "Preferred Daily Reminder Window:",
  'settings.remind_morning': "08:00 (Morning Kickstarter)",
  'settings.remind_noon': "12:30 (Quick 5-Minute Midday)",
  'settings.remind_evening': "20:00 (Focused Evening)",
  'settings.remind_night': "22:00 (Before Sleep Winddown)",
  'settings.card5_kicker': "05 • DATA MANAGEMENT & PROFILE BACKUP",
  'settings.card5_title': "Storage Telemetry & Offline JSON Synchronization",
  'settings.stat_storage_size': "STORAGE SIZE",
  'settings.stat_srs_cards': "SRS CARDS",
  'settings.stat_srs_unit': "{count} items",
  'settings.stat_streak': "STREAK",
  'settings.stat_streak_unit': "{days} days",
  'settings.stat_mistakes': "MISTAKE VAULT",
  'settings.stat_mistakes_unit': "{count} errors",
  'settings.btn_export_profile_json': "[ 💾 EXPORT PROFILE (JSON) ]",
  'settings.btn_import_profile_json': "[ 📥 IMPORT PROFILE (JSON) ]",
  'settings.danger_zone_title': "DANGER ZONE",
  'settings.danger_zone_desc': "Permanently erase all progress, flashcards, and telemetry to reset the application.",
  'settings.btn_confirm_erase': "⚠ CONFIRM ERASE (Click again to proceed)",
  'settings.btn_erase_data': "Erase All Application Data",
  'settings.card6_kicker': "06 • APPLICATION & SYSTEM INFO",
  'settings.card6_title': "English Singularity & Academic IELTS Suite",
  'settings.info_version': "• <strong>Version:</strong> Singularity 1.0.0 (Gold Standard 760px Architecture)",
  'settings.info_architecture': "• <strong>Architecture:</strong> 100% Client-Side Pure TypeScript • Zero Server Dependency • Zero Trackers",
  'settings.info_offline': "• <strong>Offline:</strong> PWA Service Worker ready for full offline operation",
  'settings.info_acoustics': "• <strong>Acoustics:</strong> Apple-Calm Acoustic Haptics & Dual Audio Bus Synthesizer",
  'settings.btn_rerun_tour': "Re-run Onboarding Spotlight Tour",
  'settings.btn_open_quests': "View Quests & XP Badges"
};

const NEW_VI_KEYS = {
  // Questions
  'questions.check_instant': "Kiểm tra & Dẫn chứng",
  'questions.answer_first': "Vui lòng chọn hoặc nhập đáp án trước.",

  // IELTS generic
  'ielts.section': "Phần",
  'ielts.nav_scroll_left_aria': "Cuộn thanh điều hướng sang trái",
  'ielts.nav_scroll_right_aria': "Cuộn thanh điều hướng sang phải",
  'ielts.nav_sections_aria': "Các phần thi IELTS",

  // Speaking Simulator
  'sim.p3_placeholder': 'Nhập câu trả lời Phần 3 tại đây... (Thử bắt đầu bằng "Well, that is an intriguing inquiry..." hoặc "It largely hinges upon...")',
  'sim.btn_eval_p3': "Phân tích Câu trả lời Phần 3 & Từ đệm",
  'sim.validated_p3': "PHẦN 3 ĐẠT CHUẨN",
  'sim.incomplete_struct': "CẤU TRÚC CHƯA HOÀN THIỆN",
  'sim.band_model': "Bài mẫu Band {band}",
  'sim.listen_delivery': "🔊 Nghe bài nói Band {band}",

  // Exam Cockpit
  'cockpit.theme_app': "Mặc định (Theo App)",
  'cockpit.btn_prev_short': "Trước",
  'cockpit.btn_unflag_short': "Bỏ cờ",
  'cockpit.btn_flag_short': "Cờ",
  'cockpit.btn_next_short': "Tiếp",
  'cockpit.btn_test_catalog': "Danh sách đề",
  'cockpit.select_other_test': "Chọn đề thi khác",
  'cockpit.start_timer_title': "Bắt đầu tính giờ làm bài",
  'cockpit.btn_start_upper': "BẮT ĐẦU",
  'cockpit.resume_timer_title': "Tiếp tục tính giờ",
  'cockpit.pause_timer_title': "Tạm dừng đồng hồ",
  'cockpit.btn_resume': "▶ Tiếp tục",
  'cockpit.btn_pause': "⏸ Tạm dừng",
  'cockpit.btn_preview_exam': "✕ Xem trước giao diện đề (Chưa tính giờ)",
  'cockpit.btn_start_timed_exam': "Bắt đầu làm bài thi (60:00)",
  'cockpit.test_hub_kicker': "OFFICIAL CD-IELTS EXAM HUB · DANH SÁCH ĐỀ THI",
  'cockpit.test_hub_title': "Chọn Đề Thi Chuẩn Hóa CD-IELTS",
  'cockpit.test_hub_lead': "Vui lòng chọn 1 đề thi bên dưới để bắt đầu. Đồng hồ tính giờ (60:00) chỉ bắt đầu chạy khi bạn bấm nút \"Bắt đầu làm bài thi\".",
  'cockpit.card_test_kicker': "ĐỀ THI 0{testNumber} // {module}",
  'cockpit.card_passage_item': "• Đoạn {pNum}: {title} ({typeDesc})",
  'cockpit.card_meta_info': "⏱️ {mins} PHÚT · 📝 {count} CÂU",
  'cockpit.card_selected': "✓ ĐÃ CHỌN",
  'cockpit.card_select_this': "CHỌN ĐỀ NÀY",
  'cockpit.q_range': "Câu {start}–{end}",
  'cockpit.passage_num': "Đoạn {n}",

  // Header & Nav & Dossiers
  'dossier.celestial_radar': "Radar Chòm sao & Chẩn đoán",
  'nav.analytics': "PHÂN TÍCH",
  'common.ok': "Đồng ý",
  'common.undo_action': "Hoàn tác thao tác",
  'common.verify': "Xác thực",
  'common.hint': "Gợi ý",
  'common.send': "Gửi",
  'common.close_cross': "✕ Đóng",

  // Placement Quiz
  'placement.title': "XÁC ĐỊNH ĐIỂM XUẤT PHÁT",
  'placement.intro': "Mất khoảng 2 phút với các câu hỏi thăm dò nhẹ nhàng (từ A1 đến C2). Bài kiểm tra tự động dừng lại khi độ khó vượt quá khả năng để bạn không bị mệt mỏi. Bạn có thể điều chỉnh cấp độ bất kỳ lúc nào.",
  'dossier.vocab': "Kho Từ vựng",
  'dossier.collocations': "Lò Cụm từ",
  'dossier.grammar': "Ngữ pháp",
  'dossier.reading': "Đọc hiểu",

  // Writing & Preflight Rules
  'writing.preflight_cockpit': "✈️ BUỒNG LÁI TỰ SOÁT BÀI VIẾT",
  'writing.preflight_modal_title': "Chọn 3 tiêu chí tự soát vàng",
  'writing.save_3_rules': "Lưu 3 tiêu chí",
  'writing.preflight_header': "Pre-Flight Golden Rules (3 Tiêu chí tự soát)",
  'writing.customize_rules': "⚙️ Chọn 3 quy tắc",
  'writing.rule_gra_tense_title': "Kiểm tra Hòa hợp Chủ-Vị & Biến cách Thì",
  'writing.rule_gra_tense_desc': "Đảm bảo sự kiện quá khứ dùng thì quá khứ đơn, ngôi thứ ba số ít thêm -s, và các thì phức có trợ động từ be/have.",
  'writing.rule_cc_conjunction_title': "Loại bỏ Xung đột Cặp liên từ kép",
  'writing.rule_cc_conjunction_desc': "Không bao giờ dùng cặp \"Although / Even though\" đi với \"But\", hoặc \"Because\" đi với \"So\" trong cùng một cấu trúc mệnh đề.",
  'writing.rule_lr_collocation_title': "Kiểm tra Giới từ Cụm từ cố định",
  'writing.rule_lr_collocation_desc': "Kiểm tra nghiêm ngặt các cặp động từ + giới từ: depend on, spend money on, invest in, an increase of 15% / rose by 15%.",
  'writing.rule_ta_overview_title': "Đoạn Tổng quan Rõ ràng không Số liệu thô",
  'writing.rule_ta_overview_desc': "Đoạn tổng quan Task 1 phải nêu bật xu hướng/khác biệt chính mà không trích dẫn số liệu thống kê cụ thể.",
  'writing.rule_cc_paragraph_title': "Phát triển Đoạn văn 4 Câu chuẩn mẫu",
  'writing.rule_cc_paragraph_desc': "Mỗi đoạn thân bài tuân thủ: Câu chủ đề -> Giải thích chuyên sâu -> Dẫn chứng thực tế -> Kết quả hệ quả.",
  'writing.rule_wf_derivation_title': "Kiểm tra Từ loại & Hậu tố Phái sinh",
  'writing.rule_wf_derivation_desc': "Xác thực từ loại: đảm bảo trạng từ bổ nghĩa cho tính từ/động từ và danh từ có đúng hậu tố danh từ (-tion, -ment, -ance).",
  'writing.evid_valid': "✓ Dẫn chứng cụ thể",
  'writing.overview_placeholder': "Nhìn chung, xu hướng nổi bật là [xu hướng chính]... Trái lại, [điểm dị biệt]...",
  'writing.body1_placeholder': "Xét về các hạng mục chính...",
  'writing.body2_placeholder': "Ngược lại, số liệu của...",
  'writing.intro_placeholder': "Nêu bối cảnh chung và quan điểm rõ ràng của bài luận...",
  'writing.b1_placeholder': "Câu 1 (Luận điểm)... Câu 2 (Giải thích nguyên nhân)... Câu 3 (Dẫn chứng cụ thể)... Câu 4 (Tác động kết luận)...",
  'writing.b2_placeholder': "Câu 1 (Luận điểm 2)... Câu 2 (Lập luận nhân quả)... Câu 3 (Ví dụ thực tế)... Câu 4 (Tác động kết luận)...",
  'writing.concl_placeholder': "Tóm lại, khẳng định lại các quan điểm chính mà không đưa thêm ý mới...",

  // Vault & Commute
  'vault.input_placeholder': "Nhập cấu trúc câu chuẩn mục tiêu...",
  'vault.input_l1_placeholder': "Nhập câu đã sửa vào đây...",
  'vault.interlanguage_fault': "Lỗi chuyển di ngôn ngữ (Interlanguage)",
  'vault.l1_root_cause': "Nguyên nhân gốc L1",
  'vault.return_to_vault': "Quay lại Kho lỗi",
  'vault.exit_drill': "Thoát luyện tập",
  'vault.drill_correct': "✓ CHÍNH XÁC!",
  'vault.drill_incorrect': "✗ CHƯA ĐÚNG:",
  'vault.standard_answer': "Đáp án chuẩn:",
  'vault.next_drill': "Bài tập tiếp ({current}/{total}) →",
  'commute.prev_track': "Bài trước",
  'commute.next_track': "Bài tiếp theo",

  // Reading & Ergonomics
  'reading.font_size': "Cỡ chữ:",
  'reading.line_height_relaxed': "↕ Giãn rộng",
  'reading.line_height_standard': "↕ Giãn chuẩn",
  'reading.highlight': "🖍️ Đánh dấu",
  'reading.clear_selection': "✕ Xóa chọn",
  'reading.highlight_tooltip': "Đánh dấu văn bản",
  'reading.clear_selection_tooltip': "Xóa vùng chọn",
  'reading.mode_intensive': "🔬 Đọc sâu",
  'reading.mode_extensive': "📖 Đọc rộng",
  'reading.intensive_tooltip': "Đọc sâu (4 lượt)",
  'reading.extensive_tooltip': "Đọc rộng (Đầu vào dễ hiểu)",
  'reading.close_drawer_tooltip': "Đóng ngăn kéo",
  'reading.close_drawer_aria': "Đóng ngăn từ vựng",
  'reading.view_switcher_aria': "Chuyển chế độ xem bài đọc",
  'rdrills.weakness_first': "Ưu tiên điểm yếu",
  'rdrills.types_nav_aria': "14 dạng câu hỏi Đọc hiểu",

  // Speaking
  'speaking.comparative_models_title': "Bài mẫu Đối chiếu & Nhận xét Giám khảo (Band 6.5 vs 7.5 vs 8.5)",
  'speaking.replay_scenario': "↺ Luyện lại tình huống",
  'speaking.next_scenario': "Tình huống CEFR tiếp theo →",
  'speaking.play_exemplar': "▶ Giọng mẫu",
  'speaking.play_your_take': "▶ Giọng của bạn",
  'speaking.stop_audio': "⏹ Dừng",
  'speaking.roleplay_input_placeholder': "Nhập hoặc xác nhận câu trả lời nói tại đây...",
  'speaking.timer_aria_label': "Đồng hồ đếm ngược bài nói",
  'speaking.timer_toggle_aria': "Bắt đầu hoặc tạm dừng đồng hồ",
  'speaking.take_complete_aria': "Dừng và hoàn thành bài nói",
  'speaking.timer_pause': "⏸ Tạm dừng",
  'speaking.timer_start': "▶ Bắt đầu",
  'speaking.ielts_fallback_placeholder': "Hoặc nhập câu trả lời của bạn tại đây...",
  'speaking.scratchpad_placeholder': "Ghi chú nhanh tại đây (ví dụ: giao diện thần kinh, phòng thí nghiệm hợp tác, tính toán hiệu năng cao, tác động xã hội)...",
  'speaking.ielts_discursive_placeholder': "Hoặc nhập câu trả lời thảo luận sâu tại đây...",

  // Tenses
  'tenses.start_gauntlet': "Bắt đầu Thử thách Gauntlet",
  'tenses.feedback_correct': "✓ CHÍNH XÁC / RẤT TỐT!",
  'tenses.feedback_incorrect': "✗ CHƯA ĐÚNG",
  'tenses.correct_ans_label': "Đáp án đúng:",
  'tenses.grammar_rule_label': "Quy tắc ngữ pháp:",
  'tenses.vietnamese_exp_label': "Giải thích tiếng Việt:",
  'tenses.btn_next_q': "CÂU TIẾP THEO ({current}/{total}) →",
  'tenses.btn_finish_scorecard': "HOÀN THÀNH & XEM BẢNG ĐIỂM",
  'tenses.grade_c1_title': "BẬC THẦY 12 THÌ C1/C2",
  'tenses.grade_c1_comment': "Khả năng chia động từ và phân tích ngữ cảnh thời gian của bạn đạt độ chuẩn xác tuyệt đối!",
  'tenses.grade_b2_title': "TRUNG CẤP CAO B2",
  'tenses.grade_b2_comment': "Nền tảng khá vững vàng, tuy nhiên bạn cần lưu ý kỹ các thì hoàn thành tiếp diễn và mốc thời gian quá khứ.",
  'tenses.grade_b1_title': "CẦN ÔN LẠI NỀN TẢNG",
  'tenses.grade_b1_comment': "Bạn cần ôn lại công thức và các dấu hiệu nhận biết của các thì cơ bản trong 12 Tenses Codex.",
  'tenses.signals_label': "DẤU HIỆU NHẬN BIẾT // NGỮ CẢNH:",
  'tenses.core_usage_label': "CÁCH DÙNG CỐT LÕI // CHỨC NĂNG CÚ PHÁP:",
  'tenses.pitfall_label': "LỖI SAI KINH ĐIỂN // GIAO THOA L1:",
  'tenses.listen_sentence_aria': "Nghe câu văn",
  'tenses.select_verb_form_aria': "Chọn dạng động từ chính xác",
  'tenses.listen_example_aria': "Nghe câu ví dụ",

  // Email Builder
  'email.clear_draft': "Xóa bản nháp",
  'email.placeholder': "Chạm vào các ô để tạo email của bạn",

  // Flashcards
  'flashcard.rating_easy': "☆ Dễ (4)",

  // Listening Dossier
  'listening.play_normal': "▶ Phát 1.0x",
  'listening.play_slow': "⏵ Phát 0.8x",
  'listening.reset': "↺ Đặt lại",

  // Blitz Dossier
  'blitz.start_aria': "Bắt đầu 60 giây luyện phản xạ chớp nhoáng",
  'blitz.play_again_aria': "Chơi thêm một lượt chớp nhoáng",
  'blitz.return_tree_aria': "Trở về Cây kỹ năng Chòm sao",

  // Settings Dossier
  'settings.mode_gentle': "🌱 Chế độ: Giàn giáo Nhẹ nhàng",
  'settings.mode_cockpit': "⚡ Chế độ: Buồng lái Chiến thuật",
  'settings.header_desc': "Quản lý trình độ CEFR, cấu hình hệ thống âm thanh kép, thông báo chu kỳ SRS, giao diện tập trung và sao lưu dữ liệu toàn diện.",
  'settings.card1_kicker': "01 • LỘ TRÌNH & HỒ SƠ CEFR",
  'settings.card1_title': "Trình độ CEFR & Mục tiêu học tập",
  'settings.card1_desc': "Trình độ hiện tại ảnh hưởng trực tiếp đến độ phức tạp của bài tập, kho collocations và đề luyện trong toàn bộ hệ thống.",
  'settings.select_cefr_label': "Chọn cấp độ CEFR hiện tại:",
  'settings.daily_xp_goal_label': "Mục tiêu XP mỗi ngày:",
  'settings.xp_maintain': "50 XP (Duy trì)",
  'settings.xp_standard': "100 XP (Chuẩn)",
  'settings.xp_intensive': "200 XP (Cấp tốc)",
  'settings.target_ielts_band_label': "Mục tiêu IELTS Band (Target Band):",
  'settings.target_exam_date_label': "Ngày thi IELTS mục tiêu:",
  'settings.days_remaining_countdown': "⏳ Còn {days} ngày nữa đến ngày thi ({date})",
  'settings.exam_date_passed': "⚠️ Ngày thi đã qua ({date})",
  'settings.exam_date_unset': "ℹ️ Chưa đặt ngày thi dự kiến (chọn ngày để kích hoạt đếm ngược)",
  'settings.time_budget_label': "Quỹ thời gian học mỗi ngày (Time Budget):",
  'settings.mins_per_day': "{mins} phút/ngày",
  'settings.time_15m': "15m (Brisk)",
  'settings.time_30m': "30m (Chuẩn)",
  'settings.time_60m': "60m (Cấp tốc)",
  'settings.weakness_first_label': "Ưu tiên khắc phục điểm yếu (Weakness-First Focus)",
  'settings.weakness_first_desc': "Tự động ưu tiên đưa các dạng bài, từ vựng và bẫy L1 mẹ đẻ bạn từng làm sai trong Mistake Vault & Error Ledger lên đầu buổi luyện.",
  'settings.status_on': "ĐANG BẬT ●",
  'settings.status_off': "TẮT",
  'settings.btn_retake_placement': "Làm lại Test xếp lớp 2 phút",
  'settings.card2_kicker': "02 • GIAO DIỆN & TRỢ NĂNG",
  'settings.card2_title': "Chế độ hiển thị, Chuyển động & Tập trung",
  'settings.theme_label': "Chủ đề: <strong>{mode}</strong>",
  'settings.theme_dark_mode': "Dark Mode (Tối)",
  'settings.theme_light_mode': "Light Mode (Sáng)",
  'settings.motion_label': "Chuyển động: <strong>{mode}</strong>",
  'settings.motion_reduced': "Reduced (Giảm chuyển cảnh)",
  'settings.motion_full': "Full (Mượt mà)",
  'settings.zen_label': "Zen Immersion: <strong>{status}</strong>",
  'settings.contrast_label': "Tương phản cao: <strong>{status}</strong>",
  'settings.contrast_high': "Bật (High Contrast)",
  'settings.contrast_standard': "Chuẩn",
  'settings.accent_theme_label': "Màu sắc chủ đạo ứng dụng (Primary Accent Theme):",
  'settings.card3_kicker': "03 • HỆ THỐNG ÂM THANH KÉP & GIỌNG ĐỌC",
  'settings.card3_title': "Hiệu ứng tương tác, Không gian âm thanh & TTS",
  'settings.sound_status_muted': "Đang tắt tiếng",
  'settings.sound_status_on': "Âm thanh bật",
  'settings.sfx_volume_label': "SFX Volume (Âm tương tác):",
  'settings.music_volume_label': "Music Volume (Nhạc nền):",
  'settings.ambient_soundscape_label': "Không gian âm thanh Ambient:",
  'settings.ambient_off': "Tắt nhạc nền (Off)",
  'settings.ambient_chords_label': "Calm Chords (Dịu êm)",
  'settings.ambient_void_label': "Celestial Void (Không gian sâu)",
  'settings.ambient_zen_label': "Zen Drone (Thiền định)",
  'settings.ielts_audio_accent_label': "Giọng đọc chuẩn đề thi IELTS (Audio Accent):",
  'settings.accent_uk_rp': "UK RP (British Academic - Chuẩn Cambridge)",
  'settings.accent_general_american': "General American (Bắc Mỹ)",
  'settings.accent_australian': "Australian (en-AU - Giọng Úc)",
  'settings.accent_scottish': "Scottish (en-GB-scotland - Scotland)",
  'settings.accent_random': "Random Exam Mode (Xoay tua quốc tế ngẫu nhiên)",
  'settings.tts_speed_label': "Tốc độ đọc giọng mẫu TTS:",
  'settings.tts_rate_normal': "1.0x (Chuẩn)",
  'settings.haptics_label': "Phản hồi xúc giác & Haptics:",
  'settings.haptics_status_on': "Haptic Feedback: Đang Bật",
  'settings.haptics_status_off': "Haptic Feedback: Tắt",
  'settings.card4_kicker': "04 • THÔNG BÁO & NHẮC NHỞ ÔN TẬP",
  'settings.card4_title': "Nhắc nhở chu kỳ SRS & Bảo vệ chuỗi Streak",
  'settings.card4_desc': "Hệ thống sử dụng Web Push Notification để nhắc bạn ôn tập thẻ từ vựng đúng thời điểm vàng theo đường cong quên lãng Spaced Repetition.",
  'settings.notif_toggle_label': "Thông báo đẩy hàng ngày: {status}",
  'settings.notif_status_on': "ĐANG BẬT (ON)",
  'settings.notif_status_off': "ĐANG TẮT (OFF)",
  'settings.reminder_time_label': "Khung giờ nhắc ôn tập ưu tiên:",
  'settings.remind_morning': "08:00 (Buổi sáng bắt đầu ngày)",
  'settings.remind_noon': "12:30 (Nghỉ trưa ngắn 5 phút)",
  'settings.remind_evening': "20:00 (Buổi tối tập trung)",
  'settings.remind_night': "22:00 (Trước khi đi ngủ)",
  'settings.card5_kicker': "05 • QUẢN LÝ DỮ LIỆU & SAO LƯU HỒ SƠ",
  'settings.card5_title': "Telemetry lưu trữ & Đồng bộ JSON ngoại tuyến",
  'settings.stat_storage_size': "DUNG LƯỢNG",
  'settings.stat_srs_cards': "SRS CARDS",
  'settings.stat_srs_unit': "{count} từ",
  'settings.stat_streak': "CHUỖI NGÀY",
  'settings.stat_streak_unit': "{days} ngày",
  'settings.stat_mistakes': "MISTAKE VAULT",
  'settings.stat_mistakes_unit': "{count} lỗi",
  'settings.btn_export_profile_json': "[ 💾 XUẤT PROFILE (JSON) ]",
  'settings.btn_import_profile_json': "[ 📥 NHẬP PROFILE (JSON) ]",
  'settings.danger_zone_title': "VÙNG NGUY HIỂM (DANGER ZONE)",
  'settings.danger_zone_desc': "Xóa toàn bộ tiến độ và đưa app về trạng thái ban đầu.",
  'settings.btn_confirm_erase': "⚠ XÁC NHẬN XÓA (Click lần nữa)",
  'settings.btn_erase_data': "Xóa toàn bộ dữ liệu",
  'settings.card6_kicker': "06 • THÔNG TIN ỨNG DỤNG & HỆ THỐNG",
  'settings.card6_title': "English Singularity & Academic IELTS Suite",
  'settings.info_version': "• <strong>Phiên bản:</strong> Singularity 1.0.0 (Gold Standard 760px Architecture)",
  'settings.info_architecture': "• <strong>Kiến trúc:</strong> 100% Client-Side Pure TypeScript • Zero Server Dependency • Zero Trackers",
  'settings.info_offline': "• <strong>Ngoại tuyến:</strong> PWA Service Worker sẵn sàng hoạt động không cần mạng",
  'settings.info_acoustics': "• <strong>Chuẩn âm học:</strong> Apple-Calm Acoustic Haptics & Dual Audio Bus Synthesizer",
  'settings.btn_rerun_tour': "Xem lại Spotlight Tour",
  'settings.btn_open_quests': "Xem Quests & Huy hiệu XP"
};

// 1. Clean addTranslations
const addTransStart = content.indexOf('public addTranslations(locale: Locale, translations: Record<string, string>): void {');
const addTransEnd = content.indexOf('Object.assign(this.dictionaries[locale], translations);', addTransStart);
if (addTransStart !== -1 && addTransEnd !== -1) {
  const fullAddTransEnd = content.indexOf('}', addTransEnd) + 1;
  const cleanAddTrans = `public addTranslations(locale: Locale, translations: Record<string, string>): void {
    if (!this.dictionaries[locale]) {
      this.dictionaries[locale] = {};
    }
    Object.assign(this.dictionaries[locale], translations);
  }`;
  content = content.slice(0, addTransStart) + cleanAddTrans + content.slice(fullAddTransEnd);
  console.log('addTranslations cleaned up successfully.');
}

// 2. Format new entries
function formatEntries(dict) {
  return Object.entries(dict)
    .map(([k, v]) => `  '${k}': ${JSON.stringify(v)},`)
    .join('\n');
}

// 3. Inject new EN entries into EN_DICTIONARY before closing '};'
const enMarker = 'export const EN_DICTIONARY: TranslationDictionary = {';
const enStart = content.indexOf(enMarker);
const viMarker = 'export const VI_DICTIONARY: TranslationDictionary = {';
const viStart = content.indexOf(viMarker);

// Find closing '};' of EN_DICTIONARY
const enClose = content.lastIndexOf('};', viStart);
const formattedEn = '\n  // Extended Meticulous UI Localizations (EN)\n' + formatEntries(NEW_EN_KEYS) + '\n';
content = content.slice(0, enClose) + formattedEn + content.slice(enClose);

// Recalculate viStart and find closing '};' of VI_DICTIONARY
const newViStart = content.indexOf(viMarker);
const dictsMarker = 'export const DICTIONARIES: Record<Locale, TranslationDictionary> = {';
const dictsStart = content.indexOf(dictsMarker);
const viClose = content.lastIndexOf('};', dictsStart);
const formattedVi = '\n  // Extended Meticulous UI Localizations (VI)\n' + formatEntries(NEW_VI_KEYS) + '\n';
content = content.slice(0, viClose) + formattedVi + content.slice(viClose);

// Also fix writing.evid_valid in VI if present
content = content.replace(/'writing\.evid_valid': "✓ Concrete Evidence"/g, "'writing.evid_valid': \"✓ Dẫn chứng cụ thể\"");

fs.writeFileSync(i18nPath, content, 'utf8');
console.log('i18n.ts successfully updated with', Object.keys(NEW_EN_KEYS).length, 'new keys.');
