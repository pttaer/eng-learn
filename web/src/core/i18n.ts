/**
 * English Singularity - Core Internationalization (i18n) Engine
 * Full English/Vietnamese localization engine with reactive subscriptions,
 * DOM localization attributes, parameter interpolation, and complete dictionaries.
 */

export type Locale = 'en' | 'vi';

export const STORAGE_KEY = 'eng_locale';
export const LOCALE_EVENT = 'eng:locale-changed';

export type TranslationDictionary = Record<string, string>;

export const EN_DICTIONARY: TranslationDictionary = {
  // Common / Generic Actions & States
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.submit': 'Submit',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.confirm': 'Confirm',
  'common.reset': 'Reset',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.retry': 'Retry',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.all': 'All',
  'common.completed': 'Completed',
  'common.pending': 'Pending',
  'common.view': 'View',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.copy': 'Copy',
  'common.copied': 'Copied!',
  'common.share': 'Share',
  'common.export': 'Export',
  'common.import': 'Import',
  'common.start': 'Start',
  'common.continue': 'Continue',
  'common.done': 'Done',
  'common.success': 'Success',
  'common.dismiss': 'Dismiss',
  'common.undo': 'Undo',

  // Header HUD & Nav
  'nav.back_to_constellation': 'Back to Constellation',
  'nav.change_level': 'Change Level',
  'nav.daily_streak': 'Daily Streak',
  'nav.speed_blitz': 'Speed Blitz',
  'nav.cefr_mediation': 'CEFR Mediation',
  'nav.analytics_serl': 'Analytics & SERL',
  'nav.cd_ielts_cockpit': 'CD-IELTS Cockpit',
  'nav.rpg_progression': 'RPG Progression',
  'nav.zen_immersion_mode': 'Zen Immersion Mode',
  'nav.theme_toggle': 'Theme Toggle',
  'nav.interactive_tour': 'Interactive Tour',
  'nav.ambient_music': 'Ambient Music',
  'nav.audio_mute': 'Audio Mute',
  'nav.settings_data_management': 'Settings & Data Management',
  'nav.mobile_menu': 'Mobile Menu',
  'nav.home': 'Home',
  'nav.practice': 'Practice',
  'nav.dossiers': 'Dossiers',
  'nav.profile': 'Profile',
  'nav.toggle_navigation': 'Toggle Navigation',
  'nav.retention': 'Retention',
  'nav.radar': 'Radar',
  'nav.blitz': 'Blitz',
  'nav.cockpit': 'Cockpit',
  'nav.tree': 'Tree',
  'nav.more': 'More',
  'nav.mobile_controls': 'Mobile Controls',
  'nav.mistake_vault': 'Smart Mistake Vault & Blitz',
  'nav.commute_audio': 'Hands-Free Commute Audio Loop',
  'nav.drills': 'Practice Drills, Sounds & Email',
  'nav.level': 'Level',
  'nav.muted': 'Muted',
  'nav.enabled': 'Enabled',
  'nav.active': 'Active',
  'nav.off': 'Off',
  'nav.view_workout': 'Click to view Daily Workout on Constellation Tree',

  // Settings Modal
  'settings.title': 'Settings & Data Management',
  'settings.appearance': 'Appearance',
  'settings.language': 'Language',
  'settings.english': 'English',
  'settings.vietnamese': 'Vietnamese',
  'settings.motion': 'Motion & Animations',
  'settings.reduced_motion': 'Reduced Motion',
  'settings.sound_music': 'Sound & Music',
  'settings.ambient_music': 'Ambient Music',
  'settings.haptics': 'Acoustic Haptics',
  'settings.daily_reminder': 'Daily Reminder',
  'settings.notifications': 'Notifications',
  'settings.daily_reminder_notifications': 'Daily Reminder / Notifications',
  'settings.lang_en': 'English',
  'settings.lang_vi': 'Vietnamese',
  'settings.export_profile': 'Export Profile',
  'settings.import_profile': 'Import Profile',
  'settings.reset_tour': 'Reset Tour',
  'settings.reset_placement': 'Reset Placement',
  'settings.close': 'Close',
  'settings.theme': 'Theme',
  'settings.dark': 'Dark',
  'settings.light': 'Light',
  'settings.system': 'System',
  'settings.danger_zone': 'Danger Zone',
  'settings.clear_data': 'Clear All Data',
  'settings.sfx_volume': 'SFX Volume',
  'settings.music_volume': 'Music Volume',
  'settings.storage_desc': 'Your progress, SRS intervals, and streaks are safely stored in your browser\'s local memory. You can export or import a backup JSON file anytime.',

  // Dossier Names & Tabs
  'dossier.constellation_tree': 'Constellation Tree',
  'dossier.reading_lab': 'Reading Lab',
  'dossier.writing_studio': 'Writing Studio',
  'dossier.listening_chamber': 'Listening Chamber',
  'dossier.speaking_partner': 'Speaking Partner',
  'dossier.vocabulary_vault': 'Vocabulary Vault',
  'dossier.collocation_forge': 'Collocation Forge',
  'dossier.grammar_codex': 'Grammar Codex',
  'dossier.twelve_verb_tenses': '12 Verb Tenses',
  'dossier.twelve_tenses': '12 Verb Tenses',
  'dossier.daily_mission_log': 'Daily Mission Log',
  'dossier.speed_blitz': 'Speed Blitz',
  'dossier.cefr_mediation': 'CEFR Mediation',
  'dossier.attack_drills': 'Attack Drills',
  'dossier.analytics_cockpit': 'Analytics Cockpit',
  'dossier.ielts_exam': 'IELTS Exam',

  // Flashcards & SRS Review
  'flashcard.flip': 'Flip',
  'flashcard.again': 'Again',
  'flashcard.hard': 'Hard',
  'flashcard.good': 'Good',
  'flashcard.easy': 'Easy',
  'flashcard.reveal_answer': 'Reveal Answer',
  'flashcard.mastered': 'Mastered',
  'flashcard.srs_deck': 'SRS Deck',
  'flashcard.review_due': 'Review Due',
  'flashcard.next_card': 'Next Card',
  'flashcard.hint': 'Hint',
  'flashcard.show_explanation': 'Show Explanation',
  'flashcard.interval': 'Interval',
  'flashcard.repetition': 'Repetition',

  // IELTS Specific
  'ielts.overview': 'Overview',
  'ielts.diagnostic': 'Diagnostic',
  'ielts.reading': 'Reading',
  'ielts.listening': 'Listening',
  'ielts.writing': 'Writing',
  'ielts.speaking': 'Speaking',
  'ielts.vocabulary': 'Vocabulary',
  'ielts.strategy': 'Strategy',
  'ielts.mock_tests': 'Mock Tests',
  'ielts.timed_passages': 'Timed Passages',
  'ielts.attack_drills_lab': 'Attack Drills Lab',
  'ielts.traps_audio_lab': 'Traps & Audio Lab',
  'ielts.blueprints_architect': 'Blueprints & Architect',
  'ielts.examiner_simulator': 'Examiner Simulator',
  'ielts.band_score': 'Band Score',
  'ielts.target_band_7': 'Target Band 7.0+',
  'ielts.raw_score': 'Raw Score',
  'ielts.submit_test': 'Submit Test',
  'ielts.task1': 'Task 1',
  'ielts.task2': 'Task 2',
  'ielts.part1': 'Part 1',
  'ielts.part2': 'Part 2',
  'ielts.part3': 'Part 3',
  'ielts.part4': 'Part 4',
  'ielts.time_remaining': 'Time Remaining',
  'ielts.word_count': 'Word Count',
  'ielts.model_answer': 'Model Answer',
  'ielts.rubric': 'Band Descriptors',

  // IELTS Navigation & Header
  'ielts.nav_overview': 'Overview',
  'ielts.nav_diagnostic': 'Diagnostic',
  'ielts.nav_reading': 'Reading',
  'ielts.nav_listening': 'Listening',
  'ielts.nav_writing': 'Writing',
  'ielts.nav_speaking': 'Speaking',
  'ielts.nav_vocab': 'Vocab',
  'ielts.nav_strategy': 'Strategy',
  'ielts.nav_mock': 'Mock tests',
  'ielts.nav_study_path': 'Study path',
  'ielts.nav_reading_drills': 'Reading Drills',
  'ielts.nav_listening_traps': 'Listening Traps',
  'ielts.nav_writing_studio': 'Writing Studio',
  'ielts.nav_speaking_simulator': 'Speaking Simulator',
  'ielts.subnav_timed_passages': 'Timed Passages',
  'ielts.subnav_attack_drills': '14 Attack Drills Lab',
  'ielts.subnav_sections_audio': 'Sections 1–4 Audio',
  'ielts.subnav_traps_audio': 'Traps & Audio Lab',
  'ielts.subnav_prompts_rubrics': 'Prompts & Rubrics',
  'ielts.subnav_blueprints': 'Blueprints & Architect',
  'ielts.subnav_prompts_notepad': 'Prompts & Notepad',
  'ielts.subnav_examiner_sim': 'Examiner Simulator',
  'ielts.subnav_studio': 'STUDIO:',
  'ielts.audio_commute': 'AUDIO',
  'ielts.vault': 'VAULT',
  'ielts.commute_tooltip': 'Hands-Free Commute Audio Loop',
  'ielts.vault_tooltip': 'Smart Mistake Vault',
  'ielts.toggle_lang': 'Switch language (EN/VI)',

  // IELTS Overview Page
  'ielts.road_to_7': 'IELTS Academic: road to 7.0',
  'ielts.road_to_7_lead': 'Exam-format practice for all four skills. Listening and Reading are scored with standard raw-score conversion tables. Writing and Speaking give automatic checks plus rubric ratings. Everything runs 100% offline in your browser.',
  'ielts.reading_lead': 'One passage, 20 minutes, 13-14 questions. Same question types as the exam. Submit to see the evidence for every answer.',
  'ielts.listening_lead': 'Ten questions per section, voiced by browser text-to-speech with a different voice per speaker. Practice mode lets you replay; the mock plays each section once.',
  'ielts.speaking_lead': 'Recordings stay on your device. Pace and pauses are measured from the audio as a hint; the band is your own rubric rating, so it is an estimate.',
  'ielts.card_guided_path_title': 'Guided 7.0 Path',
  'ielts.card_guided_path_badge': 'Plan',
  'ielts.card_guided_path_desc': 'Roadmap length from recent attempts, Reading focus, and a readiness gate for each skill.',
  'ielts.card_guided_path_btn': 'Open study path',
  'ielts.card_diag_title': 'Diagnostic Checkpoint',
  'ielts.card_diag_badge': 'Benchmark',
  'ielts.card_diag_desc': '20 Cambridge morphosyntactic and lexical items with immediate option reveals, 6-flaw error taxonomy radar, and 4-step remediation plan.',
  'ielts.card_diag_btn': 'Launch Diagnostic Checkpoint',
  'ielts.card_reading_title': 'Academic Reading Suite',
  'ielts.card_reading_badge': 'Passages + Drills',
  'ielts.card_reading_desc': '3 timed authentic academic reading passages with calibrated band scoring, plus the 14 Question-Type Attack Drills Lab and live Exam Synonym Engine.',
  'ielts.card_reading_btn1': 'Timed Passages',
  'ielts.card_reading_btn2': '14 Attack Drills Lab',
  'ielts.card_listening_title': 'Academic Listening Suite',
  'ielts.card_listening_badge': 'Audio + Trap Lab',
  'ielts.card_listening_desc': '4 authentic multi-speaker dialogue and lecture sections, plus the Listening Trap & Oral Self-Correction Audio Lab with waveform visualizer.',
  'ielts.card_listening_btn1': 'Sections 1–4 Audio',
  'ielts.card_listening_btn2': 'Trap Audio Lab',
  'ielts.card_writing_title': 'Academic Writing Suite',
  'ielts.card_writing_badge': 'Blueprints + Diff',
  'ielts.card_writing_desc': 'Timed Task 1 report generator and Task 2 essay workbench, featuring 6 visual blueprints (zero-data overview rule) and 5 architectures with Myers diff.',
  'ielts.card_writing_btn1': 'Timed Tasks 1 & 2',
  'ielts.card_writing_btn2': 'Blueprint & Essay Studio',
  'ielts.card_speaking_title': 'Academic Speaking Suite',
  'ielts.card_speaking_badge': 'Interlocutor + Fillers',
  'ielts.card_speaking_desc': 'Speaking interview practice with audio recording and 1-minute notepad, plus the 3-Part Examiner Simulator with conversational filler detection.',
  'ielts.card_speaking_btn1': 'Practice Prompts',
  'ielts.card_speaking_btn2': '3-Part Examiner Simulator',
  'ielts.card_strategy_title': 'Master Strategy Hub',
  'ielts.card_strategy_badge': 'Tactical Vault',
  'ielts.card_strategy_desc': '46 tactical cards across all 7 skills derived from Keino Campbell’s masterclass, featuring expandable formula drawers and high-yield traps.',
  'ielts.card_strategy_btn': 'Explore Tactical Cards',
  'ielts.card_mock_title': 'Full Mock Exam Cockpit',
  'ielts.card_mock_badge': 'CD-IELTS Simulator',
  'ielts.card_mock_desc': 'Complete 4-skill timed mock exams replicating computer-delivered test day conditions with split-screen resizer and theme picker.',
  'ielts.card_mock_btn': 'Start Full Mock Exam',

  // IELTS Report
  'ielts.report_title': 'Your band report',
  'ielts.report_overall': 'Overall',
  'ielts.report_self_estimate': 'self-estimate',
  'ielts.report_needs_4': 'needs all 4 skills',
  'ielts.report_ready': 'Ready for 7.0',
  'ielts.report_not_ready': 'Not yet ready for 7.0',
  'ielts.report_note': 'Bands use the last 3 attempts per skill. Listening and Reading come from standard raw-score conversion tables. Writing and Speaking come from your own rubric ratings, so they can only support the result, never certify it.',

  // Common IELTS Actions and Indicators
  'ielts.check_answers': 'Check answers',
  'ielts.submit_answers': 'Submit answers',
  'ielts.reset': 'Reset',
  'ielts.reveal': 'Reveal',
  'ielts.play_audio': 'Play Audio',
  'ielts.pause': 'Pause',
  'ielts.speed': 'Speed',
  'ielts.start_timer': 'Start Timer',
  'ielts.review_mistakes': 'Review Mistakes',
  'ielts.report': 'Report',
  'ielts.passage': 'Passage',
  'ielts.questions_label': 'Questions',
  'ielts.all_passages': 'All passages',
  'ielts.all_sections': 'All sections',
  'ielts.all_prompts': 'All prompts',
  'ielts.all_topics': 'All topics',
  'ielts.all_cue_cards': 'All cue cards',
  'ielts.back_to_speaking': 'Back to Speaking',
  'ielts.back_to_mock': 'Back to Mock Overview',
  'ielts.review': 'Review',
  'ielts.untimed': 'Untimed',
  'ielts.submit_for_feedback': 'Submit for feedback',
  'ielts.save_estimate': 'Save estimate',
  'ielts.saved': 'Saved',
  'ielts.words': 'words',
  'ielts.start_test': 'Start the test',
  'ielts.next_question': 'Next question',
  'ielts.rate_yourself': 'Rate yourself',
  'ielts.study_path_title': 'Your 7.0 study path',
  'ielts.readiness_gate': 'Readiness gate',
  'ielts.roadmap': 'Roadmap',
  'ielts.mark_done': 'Mark done',
  'ielts.undo': 'Undo',
  'ielts.correct': 'Correct',
  'ielts.incorrect': 'Incorrect',
  'ielts.explanation': 'Explanation',
  'ielts.practice': 'Practice',

  // Widget
  'widget.streak_format': '{count}-Day Streak',
  'widget.compact_streak': '{count}d',
  'widget.study': 'Study',
  'widget.ielts': 'IELTS',
  'widget.next': 'Next',
  'widget.definition': 'Definition',
  'widget.contextual_example': 'Contextual Example',
  'widget.cefr_tag': 'CEFR Tag',
  'widget.word_card': 'Word Card',
  'widget.quests': 'Quests',
  'widget.four_pillars': '4 Pillars',
  'widget.daily_focus': 'Daily Focus',

  // Dossier & Drill Actions
  'action.flip': 'Flip',
  'action.show_answer': 'Show Answer',
  'action.reveal': 'Reveal',
  'action.reveal_answer': 'Reveal Answer',
  'action.check_answer': 'Check Answer',
  'action.play_audio': 'Play Audio',
  'action.record': 'Record',
  'action.stop_recording': 'Stop Recording',
  'action.filter_level': 'Filter by level',
  'action.prev': 'Prev',
  'action.next': 'Next',
  'action.prev_card': 'Previous Card',
  'action.next_card': 'Next Card',
  'action.pronounce': 'Pronounce',
  'action.listen': 'Listen',
  'action.drill': 'Drill',
  'action.practice': 'Practice',
  'action.restart': 'Restart',
  'action.start_drill': 'Start Drill',
  'action.play_again': 'Play Again',

  // Feedback & Prompts
  'feedback.correct': 'Correct!',
  'feedback.try_again': 'Try again',
  'feedback.vietnamese_translation': 'Vietnamese Translation',
  'feedback.usage_notes': 'Usage Notes',
  'feedback.contextual_example': 'Contextual Example',
  'feedback.explanation': 'Explanation',
  'feedback.keyword_signal': 'Keyword Signal',

  // Category & Filter Badges
  'category.all': 'All',
  'category.all_categories': 'All Categories',
  'category.everyday': 'Everyday',
  'category.business': 'Business',
  'category.academic': 'Academic',
  'category.idioms': 'Idioms',
  'category.level': 'Level',
  'category.srs_due': 'SRS Due',

  // Placeholders
  'placeholder.search_collocations': 'Search collocations... (Ctrl+K)',
  'placeholder.search_vocabulary': 'Search vocabulary...',
  'placeholder.filter_grammar': 'Filter grammar patterns...',
  'placeholder.type_response': 'Type your response here...',

  // Vocabulary Dossier
  'vocab.title': 'VOCABULARY VAULT',
  'vocab.root_forge': 'Root Forge',
  'vocab.cefr_ascent': 'CEFR Ascent',
  'vocab.particle_lab': 'Particle Lab',
  'vocab.card_counter': 'Card {current} / {total}',
  'vocab.reviewed_count': '{count} reviewed',
  'vocab.reviewed_words': '{count} words reviewed',
  'vocab.prev': 'Prev',
  'vocab.next': 'Next',
  'vocab.shortcut_hint': 'Shortcuts: SPACE flip • 1 again • 2 good',
  'vocab.empty_tier': 'No cards available for this mode and difficulty level.',
  'vocab.rated_undo': 'Vocabulary rated',
  'vocab.surprise_remind': 'SURPRISE FLASH REMIND',

  // Collocations Dossier
  'colloc.title': 'COLLOCATION FORGE',
  'colloc.active_srs': 'Active SRS Drill',
  'colloc.full_lexicon': 'Full Lexicon ({total})',
  'colloc.total_count': 'TOTAL: {total} COLLOCATIONS',
  'colloc.srs_due': 'SRS Due',
  'colloc.archive_entries': 'ARCHIVE // {total} ENTRIES',
  'colloc.collocation_phrase': 'COLLOCATION PHRASE',
  'colloc.category_header': 'CATEGORY',
  'colloc.vietnamese_header': 'VIETNAMESE TRANSLATION',
  'colloc.audio_header': 'AUDIO',
  'colloc.srs_status_header': 'SRS STATUS',
  'colloc.practice_header': 'PRACTICE',
  'colloc.drill_btn': 'DRILL',
  'colloc.prev_50': 'Prev 50',
  'colloc.next_50': 'Next 50',
  'colloc.page_info': 'PAGE {current} / {total}',
  'colloc.zero_records': 'No collocation entries found matching the filter criteria.',

  // Tenses Dossier
  'tenses.title': '12 VERB TENSES CODEX',
  'tenses.random_drill': 'Random Drill ({count} Qs)',
  'tenses.gauntlet': '12-Tense Gauntlet',
  'tenses.codex': '12 Tenses Codex',
  'tenses.advanced_syntax': 'Advanced Syntax (B2–C2)',
  'tenses.all_tenses': 'All 12 Tenses',
  'tenses.present': 'Present (4)',
  'tenses.past': 'Past (4)',
  'tenses.future': 'Future (4)',
  'tenses.filter_tense': 'FILTER TENSE:',
  'tenses.all_in_family': '-- All Tenses in Family --',
  'tenses.drill_accuracy': 'DRILL ACCURACY',
  'tenses.hot_streak': 'HOT STREAK',
  'tenses.streak_in_row': '{count} IN A ROW',
  'tenses.active_pool': 'ACTIVE QUESTION POOL',
  'tenses.questions_count': '{count} QUESTIONS',
  'tenses.zero_questions': 'No questions found in this tense filter. Please choose another family.',

  // Reading Dossier
  'reading.title': 'READING COMPREHENSION',
  'reading.articles': 'Articles',
  'reading.reading_passes': 'Reading passes',
  'reading.words_count': 'WORDS: {count}',
  'reading.pass1_badge': '01 GIST SKIM',
  'reading.pass1_title': 'PASS 1: COLD READ & THESIS EXTRACTION',
  'reading.pass1_instruction': 'Scan the macro-structure within 60 seconds. Extract overarching thesis before lexical details distract cognitive bandwidth.',
  'reading.pass2_badge': '02 SKELETON',
  'reading.pass2_title': 'PASS 2: CLAUSAL & SYNTACTIC ARCHITECTURE',
  'reading.pass2_instruction': 'Dissect the core Subject-Verb-Object spine and subordinate clausal geometry across key argument milestones.',
  'reading.pass3_badge': '03 LEXICON',
  'reading.pass3_title': 'PASS 3: INTENSIVE SENTENCE MINING',
  'reading.pass3_instruction': 'Internalize target C1/C2 collocations, lexical anchors, and etymological roots with contextual SRS cards.',
  'reading.pass4_badge': '04 SYNTHESIS',
  'reading.pass4_title': 'PASS 4: CRITICAL SYNTHESIS & PRÉCIS',
  'reading.pass4_instruction': 'Analyze the 50-word benchmark précis and reverse-engineer the core thesis into your personal writing buffer.',
  'reading.start_timer': 'Start 60s Skim Timer',
  'reading.pause_timer': 'Pause Timer',
  'reading.reset_timer': 'Reset Timer',
  'reading.tab_text': 'Text Pass',
  'reading.tab_analysis': 'Analysis Panel',

  // Writing Dossier
  'writing.title': 'WRITING STUDIO',
  'writing.franklin_copywork': 'PILLAR 03 // FRANKLIN COPYWORK',
  'writing.step1_analyze': '1. ANALYZE',
  'writing.step2_type': '2. RECALL & TYPE',
  'writing.step3_evaluate': '3. EVALUATE',
  'writing.prev_prompt': 'Prev Prompt',
  'writing.next_prompt': 'Next Prompt',
  'writing.prompt_counter': 'PROMPT {current} / {total}',
  'writing.step1_heading': 'STEP 1 // RHETORICAL ARCHITECTURE',
  'writing.play_model': 'Play Model',
  'writing.meal_scaffolding': 'MEAL STRUCTURAL SCAFFOLDING',
  'writing.rhetorical_commentary': 'Rhetorical Commentary:',
  'writing.memorized_start': 'Memorized — Hide Model & Start Typing',
  'writing.accuracy': 'Accuracy',
  'writing.net_wpm': 'Net WPM',

  // Listening Dossier
  'listening.title': 'LISTENING CHAMBER',
  'listening.active_transcription': 'PILLAR 04 // ACTIVE TRANSCRIPTION',
  'listening.active_cloze': 'ACTIVE CLOZE',
  'listening.three_pass_protocol': '3-PASS PROTOCOL',
  'listening.passive_passages': 'Passive Passages',
  'listening.cloze_transcription': 'Cloze Transcription',
  'listening.check_answers': 'Check Answers',
  'listening.reveal_all': 'Reveal All',
  'listening.score': 'Score: {correct} / {total} ({percentage}%)',

  // Speaking Dossier
  'speaking.title': 'SPEAKING PARTNER',
  'speaking.prompts_count': '{count} PROMPTS',
  'speaking.scenarios_count': '{count} SCENARIOS (A1-C2)',
  'speaking.formant_lab_status': '8 IPA TARGETS // MINIMAL PAIRS',
  'speaking.ielts_status': 'IELTS SPEAKING EXAMINER // BAND 9.0',
  'speaking.start_take': 'Start Speaking Take',
  'speaking.stop_take': 'Stop Take',
  'speaking.record_mic': 'Click to Speak Response',
  'speaking.stop_submit': 'Stop & Submit Spoken Take',
  'speaking.send_turn': 'Send Turn',
  'speaking.restart_scene': 'Restart Scene',

  // Lexicon Drawer
  'lexicon.title': 'UNIVERSAL LEXICON',
  'lexicon.definition': 'Definition',
  'lexicon.vietnamese': 'Vietnamese Translation',
  'lexicon.etymology': 'Greco-Latin Root / Etymology',
  'lexicon.collocations': 'Frequent Collocations',
  'lexicon.context': 'Contextual Example',
  'lexicon.bookmark_srs': 'Bookmark to SRS Deck',
  'lexicon.in_srs': 'In SRS Deck',
  'lexicon.close': 'Close',

  // Blitz Dossier
  'blitz.title': 'SPEED BLITZ',
  'blitz.subtitle': '60-Second Roguelike Reflex Challenge',
  'blitz.start': 'Start Speed Blitz',
  'blitz.combo': 'Combo x{multiplier}',
  'blitz.score': 'Score: {score}',
  'blitz.time_remaining': 'Time: {seconds}s',
  'blitz.game_over': 'Blitz Complete!',
  'blitz.final_score': 'Final Score: {score}',
  'blitz.best_streak': 'Best Streak: {count}',
  'blitz.accuracy': 'Accuracy: {accuracy}%',
  'blitz.xp_earned': '+{xp} XP Earned',

  // Analytics Dossier
  'analytics.title': 'ANALYTICS & SERL 2.0',
  'analytics.competency_radar': 'Competency Radar',
  'analytics.spectrum_header': 'CEFR 6-AXIS HEXAGONAL SPECTRUM',
  'analytics.trajectory_header': '30-DAY PREDICTIVE TRAJECTORY CORRIDOR',
  'analytics.trajectory_title': 'IELTS Band Trajectory',
  'analytics.serl_title': 'SERL 2.0 Rehabilitation Gauntlet',
  'analytics.active_errors': 'Active Error Records ({count})',
  'analytics.no_errors': 'Zero critical errors pending rehabilitation.',
  'analytics.launch_drill': 'Launch Micro-Drill',
  'analytics.accuracy': 'Accuracy',
  'analytics.drill_time': 'Drill Time Remaining: {seconds}s'
};

export const VI_DICTIONARY: TranslationDictionary = {
  // Common / Generic Actions & States
  'common.save': 'Lưu',
  'common.cancel': 'Hủy',
  'common.close': 'Đóng',
  'common.submit': 'Nộp bài',
  'common.back': 'Quay lại',
  'common.next': 'Tiếp theo',
  'common.confirm': 'Xác nhận',
  'common.reset': 'Đặt lại',
  'common.loading': 'Đang tải...',
  'common.error': 'Lỗi',
  'common.retry': 'Thử lại',
  'common.search': 'Tìm kiếm',
  'common.filter': 'Lọc',
  'common.all': 'Tất cả',
  'common.completed': 'Đã hoàn thành',
  'common.pending': 'Đang chờ',
  'common.view': 'Xem',
  'common.edit': 'Chỉnh sửa',
  'common.delete': 'Xóa',
  'common.copy': 'Sao chép',
  'common.copied': 'Đã sao chép!',
  'common.share': 'Chia sẻ',
  'common.export': 'Xuất',
  'common.import': 'Nhập',
  'common.start': 'Bắt đầu',
  'common.continue': 'Tiếp tục',
  'common.done': 'Hoàn tất',
  'common.success': 'Thành công',
  'common.dismiss': 'Bỏ qua',
  'common.undo': 'Hoàn tác',

  // Header HUD & Nav
  'nav.back_to_constellation': 'Trở về Chòm sao',
  'nav.change_level': 'Đổi cấp độ',
  'nav.daily_streak': 'Chuỗi ngày liên tục',
  'nav.speed_blitz': 'Phản xạ Chớp nhoáng',
  'nav.cefr_mediation': 'CEFR Mediation',
  'nav.analytics_serl': 'Phân tích & SERL',
  'nav.cd_ielts_cockpit': 'Buồng lái CD-IELTS',
  'nav.rpg_progression': 'Tiến trình RPG',
  'nav.zen_immersion_mode': 'Chế độ Tập trung Zen',
  'nav.theme_toggle': 'Đổi giao diện',
  'nav.interactive_tour': 'Hướng dẫn tương tác',
  'nav.ambient_music': 'Nhạc nền không gian',
  'nav.audio_mute': 'Tắt âm thanh',
  'nav.settings_data_management': 'Cài đặt & Quản lý dữ liệu',
  'nav.mobile_menu': 'Menu di động',
  'nav.home': 'Trang chủ',
  'nav.practice': 'Luyện tập',
  'nav.dossiers': 'Hồ sơ học tập',
  'nav.profile': 'Hồ sơ cá nhân',
  'nav.toggle_navigation': 'Chuyển đổi điều hướng',
  'nav.retention': 'Tỷ lệ ghi nhớ',
  'nav.radar': 'Radar',
  'nav.blitz': 'Chớp nhoáng',
  'nav.cockpit': 'Buồng lái',
  'nav.tree': 'Cây Chòm sao',
  'nav.more': 'Thêm',
  'nav.mobile_controls': 'Điều khiển Di động',
  'nav.mistake_vault': 'Kho Lỗi sai & Ôn luyện',
  'nav.commute_audio': 'Chế độ Nghe Rảnh tay',
  'nav.drills': 'Bài tập Đột phá, Phát âm & Thư',
  'nav.level': 'Cấp độ',
  'nav.muted': 'Đã tắt',
  'nav.enabled': 'Đang bật',
  'nav.active': 'Bật',
  'nav.off': 'Tắt',
  'nav.view_workout': 'Nhấp để xem Bài tập Hằng ngày trên Cây Chòm sao',

  // Settings Modal
  'settings.title': 'Cài đặt & Quản lý dữ liệu',
  'settings.appearance': 'Giao diện',
  'settings.language': 'Ngôn ngữ',
  'settings.english': 'Tiếng Anh',
  'settings.vietnamese': 'Tiếng Việt',
  'settings.motion': 'Chuyển động & Hiệu ứng',
  'settings.reduced_motion': 'Giảm chuyển động',
  'settings.sound_music': 'Âm thanh & Âm nhạc',
  'settings.ambient_music': 'Nhạc nền không gian',
  'settings.haptics': 'Phản hồi âm học',
  'settings.daily_reminder': 'Nhắc nhở hằng ngày',
  'settings.notifications': 'Thông báo',
  'settings.daily_reminder_notifications': 'Nhắc nhở hằng ngày / Thông báo',
  'settings.lang_en': 'Tiếng Anh',
  'settings.lang_vi': 'Tiếng Việt',
  'settings.export_profile': 'Xuất hồ sơ',
  'settings.import_profile': 'Nhập hồ sơ',
  'settings.reset_tour': 'Khởi động lại hướng dẫn',
  'settings.reset_placement': 'Làm lại bài xếp lớp',
  'settings.close': 'Đóng',
  'settings.theme': 'Giao diện màu',
  'settings.dark': 'Tối',
  'settings.light': 'Sáng',
  'settings.system': 'Theo hệ thống',
  'settings.danger_zone': 'Vùng nguy hiểm',
  'settings.clear_data': 'Xóa toàn bộ dữ liệu',
  'settings.sfx_volume': 'Âm lượng hiệu ứng',
  'settings.music_volume': 'Âm lượng nhạc nền',
  'settings.storage_desc': 'Tiến trình, chuỗi học và các khoảng nhớ SRS được lưu an toàn trên trình duyệt của bạn. Bạn có thể xuất hoặc nhập tệp sao lưu JSON bất cứ lúc nào.',

  // Dossier Names & Tabs
  'dossier.constellation_tree': 'Cây Chòm sao Tri thức',
  'dossier.reading_lab': 'Phòng đọc Chuyên sâu',
  'dossier.writing_studio': 'Xưởng Luyện viết',
  'dossier.listening_chamber': 'Phòng Luyện nghe',
  'dossier.speaking_partner': 'Bạn Luyện nói AI',
  'dossier.vocabulary_vault': 'Kho Từ vựng Cốt lõi',
  'dossier.collocation_forge': 'Lò Luyện Cụm từ',
  'dossier.grammar_codex': 'Cẩm nang Ngữ pháp',
  'dossier.twelve_verb_tenses': '12 Thì Động từ',
  'dossier.twelve_tenses': '12 Thì Động từ',
  'dossier.daily_mission_log': 'Nhật ký Nhiệm vụ Hằng ngày',
  'dossier.speed_blitz': 'Phản xạ Chớp nhoáng',
  'dossier.cefr_mediation': 'CEFR Mediation',
  'dossier.attack_drills': 'Bài tập Đột phá',
  'dossier.analytics_cockpit': 'Buồng lái Phân tích',
  'dossier.ielts_exam': 'Kỳ thi IELTS',

  // Flashcards & SRS Review
  'flashcard.flip': 'Lật thẻ',
  'flashcard.again': 'Học lại',
  'flashcard.hard': 'Khó',
  'flashcard.good': 'Tốt',
  'flashcard.easy': 'Dễ',
  'flashcard.reveal_answer': 'Hiện đáp án',
  'flashcard.mastered': 'Đã thành thạo',
  'flashcard.srs_deck': 'Bộ thẻ nhớ SRS',
  'flashcard.review_due': 'Cần ôn tập',
  'flashcard.next_card': 'Thẻ tiếp theo',
  'flashcard.hint': 'Gợi ý',
  'flashcard.show_explanation': 'Xem giải thích',
  'flashcard.interval': 'Khoảng cách ôn tập',
  'flashcard.repetition': 'Số lần lặp lại',

  // IELTS Specific
  'ielts.overview': 'Tổng quan',
  'ielts.diagnostic': 'Đánh giá Năng lực',
  'ielts.reading': 'Đọc hiểu',
  'ielts.listening': 'Luyện nghe',
  'ielts.writing': 'Luyện viết',
  'ielts.speaking': 'Luyện nói',
  'ielts.vocabulary': 'Từ vựng Học thuật',
  'ielts.strategy': 'Chiến thuật',
  'ielts.mock_tests': 'Thi thử Toàn diện',
  'ielts.timed_passages': 'Đọc bấm giờ',
  'ielts.attack_drills_lab': 'Bài tập Đột phá',
  'ielts.traps_audio_lab': 'Bẫy Âm học & Thính giác',
  'ielts.blueprints_architect': 'Khung bài & Cấu trúc',
  'ielts.examiner_simulator': 'Mô phỏng Giám khảo',
  'ielts.band_score': 'Điểm Band',
  'ielts.target_band_7': 'Mục tiêu Band 7.0+',
  'ielts.raw_score': 'Điểm thô',
  'ielts.submit_test': 'Nộp bài thi',
  'ielts.task1': 'Bài viết 1',
  'ielts.task2': 'Bài viết 2',
  'ielts.part1': 'Phần 1',
  'ielts.part2': 'Phần 2',
  'ielts.part3': 'Phần 3',
  'ielts.part4': 'Phần 4',
  'ielts.time_remaining': 'Thời gian còn lại',
  'ielts.word_count': 'Số lượng từ',
  'ielts.model_answer': 'Bài viết mẫu',
  'ielts.rubric': 'Tiêu chí Chấm điểm',

  // IELTS Navigation & Header
  'ielts.nav_overview': 'Tổng quan',
  'ielts.nav_diagnostic': 'Đánh giá',
  'ielts.nav_reading': 'Đọc hiểu',
  'ielts.nav_listening': 'Nghe',
  'ielts.nav_writing': 'Viết',
  'ielts.nav_speaking': 'Nói',
  'ielts.nav_vocab': 'Từ vựng',
  'ielts.nav_strategy': 'Chiến lược',
  'ielts.nav_mock': 'Thi thử',
  'ielts.nav_study_path': 'Lộ trình học',
  'ielts.nav_reading_drills': 'Luyện dạng bài Đọc',
  'ielts.nav_listening_traps': 'Bẫy nghe Audio',
  'ielts.nav_writing_studio': 'Phòng viết Học thuật',
  'ielts.nav_speaking_simulator': 'Mô phỏng Giám khảo',
  'ielts.subnav_timed_passages': 'Bài đọc bấm giờ',
  'ielts.subnav_attack_drills': '14 Dạng bài',
  'ielts.subnav_sections_audio': 'Nghe phần 1–4',
  'ielts.subnav_traps_audio': 'Bẫy nghe Audio',
  'ielts.subnav_prompts_rubrics': 'Đề bài & Tiêu chí',
  'ielts.subnav_blueprints': 'Cấu trúc & Dàn ý',
  'ielts.subnav_prompts_notepad': 'Đề bài & Sổ tay',
  'ielts.subnav_examiner_sim': 'Mô phỏng thi',
  'ielts.subnav_studio': 'PHÒNG LUYỆN:',
  'ielts.audio_commute': 'NGHE',
  'ielts.vault': 'KHO LỖI',
  'ielts.commute_tooltip': 'Nghe lặp chế độ rảnh tay khi di chuyển',
  'ielts.vault_tooltip': 'Kho lưu trữ lỗi sai thông minh',
  'ielts.toggle_lang': 'Chuyển đổi ngôn ngữ (EN/VI)',

  // IELTS Overview Page
  'ielts.road_to_7': 'IELTS Academic: road to 7.0',
  'ielts.road_to_7_lead': 'Luyện thi chuẩn định dạng cho cả 4 kỹ năng. Nghe và Đọc được chấm theo thang điểm quy đổi chuẩn. Viết và Nói cung cấp kiểm tra tự động kèm đánh giá tiêu chí. Hoạt động 100% ngoại tuyến trên trình duyệt của bạn.',
  'ielts.reading_lead': 'Một bài đọc, 20 phút, 13-14 câu hỏi. Cùng định dạng câu hỏi như đề thi thật. Nộp bài để xem dẫn chứng cho từng câu trả lời.',
  'ielts.listening_lead': 'Mười câu hỏi mỗi phần, phát âm bằng giọng đọc trình duyệt với giọng khác nhau cho từng người nói. Chế độ luyện tập cho phép nghe lại; bài thi thử chỉ phát một lần.',
  'ielts.speaking_lead': 'Các bản ghi âm lưu trên thiết bị của bạn. Tốc độ và quãng nghỉ được phân tích từ âm thanh để tham khảo; điểm band do bạn tự đánh giá theo tiêu chí.',
  'ielts.card_guided_path_title': 'Guided 7.0 Path',
  'ielts.card_guided_path_badge': 'Plan',
  'ielts.card_guided_path_desc': 'Độ dài lộ trình dựa trên kết quả gần đây, trọng tâm Đọc hiểu và điều kiện sẵn sàng cho từng kỹ năng.',
  'ielts.card_guided_path_btn': 'Mở lộ trình học',
  'ielts.card_diag_title': 'Diagnostic Checkpoint',
  'ielts.card_diag_badge': 'Benchmark',
  'ielts.card_diag_desc': '20 câu ngữ pháp và từ vựng Cambridge với hiển thị đáp án tức thì, radar phân loại 6 dạng lỗi và lộ trình khắc phục 4 bước.',
  'ielts.card_diag_btn': 'Bắt đầu bài kiểm tra năng lực',
  'ielts.card_reading_title': 'Academic Reading Suite',
  'ielts.card_reading_badge': 'Passages + Drills',
  'ielts.card_reading_desc': '3 bài đọc học thuật bấm giờ với thang điểm band chuẩn, kèm Phòng luyện 14 dạng câu hỏi và Công cụ đồng nghĩa thi thực tế.',
  'ielts.card_reading_btn1': 'Bài đọc bấm giờ',
  'ielts.card_reading_btn2': 'Phòng luyện 14 dạng bài',
  'ielts.card_listening_title': 'Academic Listening Suite',
  'ielts.card_listening_badge': 'Audio + Trap Lab',
  'ielts.card_listening_desc': '4 phần hội thoại và bài giảng chuẩn thi thực tế, kèm Phòng bẫy nghe & tự sửa lỗi phát âm với biểu đồ sóng âm.',
  'ielts.card_listening_btn1': 'Nghe phần 1–4',
  'ielts.card_listening_btn2': 'Phòng bẫy nghe & Audio',
  'ielts.card_writing_title': 'Academic Writing Suite',
  'ielts.card_writing_badge': 'Blueprints + Diff',
  'ielts.card_writing_desc': 'Trình tạo báo cáo Task 1 bấm giờ và bàn làm việc viết bài luận Task 2, với 6 khung trực quan (nguyên tắc tổng quan không chứa số liệu) và 5 cấu trúc kèm Myers diff.',
  'ielts.card_writing_btn1': 'Bài viết Task 1 & 2 bấm giờ',
  'ielts.card_writing_btn2': 'Cấu trúc & Dàn ý bài viết',
  'ielts.card_speaking_title': 'Academic Speaking Suite',
  'ielts.card_speaking_badge': 'Interlocutor + Fillers',
  'ielts.card_speaking_desc': 'Luyện phỏng vấn nói với ghi âm và sổ ghi chép 1 phút, kèm Mô phỏng Giám khảo 3 phần phát hiện từ đệm giao tiếp.',
  'ielts.card_speaking_btn1': 'Đề bài luyện tập',
  'ielts.card_speaking_btn2': 'Mô phỏng Giám khảo 3 phần',
  'ielts.card_strategy_title': 'Master Strategy Hub',
  'ielts.card_strategy_badge': 'Tactical Vault',
  'ielts.card_strategy_desc': '46 thẻ chiến thuật trên toàn bộ 7 kỹ năng từ khóa học bậc thầy của Keino Campbell, với công thức mở rộng và các bẫy điểm số cao.',
  'ielts.card_strategy_btn': 'Khám phá Thẻ Chiến thuật',
  'ielts.card_mock_title': 'Full Mock Exam Cockpit',
  'ielts.card_mock_badge': 'CD-IELTS Simulator',
  'ielts.card_mock_desc': 'Bài thi thử bấm giờ trọn vẹn 4 kỹ năng mô phỏng điều kiện thi máy tính thực tế với khả năng chỉnh chia đôi màn hình và chọn giao diện.',
  'ielts.card_mock_btn': 'Bắt đầu Thi thử Toàn diện',

  // IELTS Report
  'ielts.report_title': 'Báo cáo điểm Band',
  'ielts.report_overall': 'Tổng thể',
  'ielts.report_self_estimate': 'tự đánh giá',
  'ielts.report_needs_4': 'cần đủ cả 4 kỹ năng',
  'ielts.report_ready': 'Đã sẵn sàng cho 7.0',
  'ielts.report_not_ready': 'Chưa sẵn sàng cho 7.0',
  'ielts.report_note': 'Điểm Band tính từ 3 lần làm gần nhất mỗi kỹ năng. Điểm Nghe và Đọc theo thang điểm quy đổi chuẩn. Điểm Viết và Nói từ tự đánh giá tiêu chí, chỉ có tính chất tham khảo.',

  // Common IELTS Actions and Indicators
  'ielts.check_answers': 'Kiểm tra đáp án',
  'ielts.submit_answers': 'Nộp bài làm',
  'ielts.reset': 'Đặt lại',
  'ielts.reveal': 'Hiện đáp án',
  'ielts.play_audio': 'Phát âm thanh',
  'ielts.pause': 'Tạm dừng',
  'ielts.speed': 'Tốc độ',
  'ielts.start_timer': 'Bắt đầu bấm giờ',
  'ielts.review_mistakes': 'Xem lại lỗi sai',
  'ielts.report': 'Báo cáo',
  'ielts.passage': 'Bài đọc',
  'ielts.questions_label': 'Câu hỏi',
  'ielts.all_passages': 'Tất cả bài đọc',
  'ielts.all_sections': 'Tất cả phần nghe',
  'ielts.all_prompts': 'Tất cả đề bài',
  'ielts.all_topics': 'Tất cả chủ đề',
  'ielts.all_cue_cards': 'Tất cả thẻ chủ đề',
  'ielts.back_to_speaking': 'Quay lại phần Nói',
  'ielts.back_to_mock': 'Quay lại tổng quan Thi thử',
  'ielts.review': 'Xem lại',
  'ielts.untimed': 'Không giới hạn thời gian',
  'ielts.submit_for_feedback': 'Nộp bài để nhận nhận xét',
  'ielts.save_estimate': 'Lưu điểm tự đánh giá',
  'ielts.saved': 'Đã lưu',
  'ielts.words': 'từ',
  'ielts.start_test': 'Bắt đầu bài thi',
  'ielts.next_question': 'Câu tiếp theo',
  'ielts.rate_yourself': 'Tự đánh giá',
  'ielts.study_path_title': 'Lộ trình học 7.0 của bạn',
  'ielts.readiness_gate': 'Cổng sẵn sàng',
  'ielts.roadmap': 'Lộ trình chi tiết',
  'ielts.mark_done': 'Đánh dấu hoàn thành',
  'ielts.undo': 'Hoàn tác',
  'ielts.correct': 'Đúng',
  'ielts.incorrect': 'Sai',
  'ielts.explanation': 'Giải thích',
  'ielts.practice': 'Luyện tập',

  // Widget
  'widget.streak_format': 'Chuỗi {count} ngày',
  'widget.compact_streak': '{count}ng',
  'widget.study': 'Học tập',
  'widget.ielts': 'IELTS',
  'widget.next': 'Tiếp tục',
  'widget.definition': 'Định nghĩa',
  'widget.contextual_example': 'Ví dụ ngữ cảnh',
  'widget.cefr_tag': 'Thẻ CEFR',
  'widget.word_card': 'Thẻ từ vựng',
  'widget.quests': 'Nhiệm vụ',
  'widget.four_pillars': '4 Trụ cột',
  'widget.daily_focus': 'Trọng tâm hôm nay',

  // Dossier & Drill Actions
  'action.flip': 'Lật thẻ',
  'action.show_answer': 'Hiện đáp án',
  'action.reveal': 'Tiết lộ',
  'action.reveal_answer': 'Hiện đáp án',
  'action.check_answer': 'Kiểm tra',
  'action.play_audio': 'Phát âm thanh',
  'action.record': 'Ghi âm',
  'action.stop_recording': 'Dừng ghi âm',
  'action.filter_level': 'Lọc theo cấp độ',
  'action.prev': 'Trước',
  'action.next': 'Tiếp',
  'action.prev_card': 'Thẻ trước',
  'action.next_card': 'Thẻ tiếp',
  'action.pronounce': 'Phát âm',
  'action.listen': 'Nghe',
  'action.drill': 'Luyện tập',
  'action.practice': 'Luyện tập',
  'action.restart': 'Khởi động lại',
  'action.start_drill': 'Bắt đầu luyện tập',
  'action.play_again': 'Chơi lại',

  // Feedback & Prompts
  'feedback.correct': 'Chính xác!',
  'feedback.try_again': 'Thử lại',
  'feedback.vietnamese_translation': 'Bản dịch tiếng Việt',
  'feedback.usage_notes': 'Ghi chú sử dụng',
  'feedback.contextual_example': 'Ví dụ ngữ cảnh',
  'feedback.explanation': 'Giải thích',
  'feedback.keyword_signal': 'Dấu hiệu nhận biết',

  // Category & Filter Badges
  'category.all': 'Tất cả',
  'category.all_categories': 'Tất cả danh mục',
  'category.everyday': 'Đời sống',
  'category.business': 'Kinh doanh',
  'category.academic': 'Học thuật',
  'category.idioms': 'Thành ngữ',
  'category.level': 'Cấp độ',
  'category.srs_due': 'Cần ôn SRS',

  // Placeholders
  'placeholder.search_collocations': 'Tìm kiếm cụm từ... (Ctrl+K)',
  'placeholder.search_vocabulary': 'Tìm kiếm từ vựng...',
  'placeholder.filter_grammar': 'Lọc cấu trúc ngữ pháp...',
  'placeholder.type_response': 'Nhập câu trả lời của bạn tại đây...',

  // Vocabulary Dossier
  'vocab.title': 'KHO TỪ VỰNG CỐT LÕI',
  'vocab.root_forge': 'Luyện Gốc từ',
  'vocab.cefr_ascent': 'Nâng bậc CEFR',
  'vocab.particle_lab': 'Tiểu từ & Giới từ',
  'vocab.card_counter': 'Thẻ {current} / {total}',
  'vocab.reviewed_count': '{count} đã ôn',
  'vocab.reviewed_words': '{count} từ đã ôn',
  'vocab.prev': 'Trước',
  'vocab.next': 'Tiếp',
  'vocab.shortcut_hint': 'Phím tắt: SPACE lật • 1 chưa nhớ • 2 đã nhớ',
  'vocab.empty_tier': 'Không có thẻ nào cho chế độ và cấp độ khó này.',
  'vocab.rated_undo': 'Đã đánh giá từ vựng',
  'vocab.surprise_remind': 'NHẮC NHỚ ĐỘT XUẤT',

  // Collocations Dossier
  'colloc.title': 'LÒ LUYỆN CỤM TỪ',
  'colloc.active_srs': 'Luyện phản xạ SRS',
  'colloc.full_lexicon': 'Toàn bộ Từ điển ({total})',
  'colloc.total_count': 'TỔNG CỘNG: {total} CỤM TỪ',
  'colloc.srs_due': 'Cần ôn SRS',
  'colloc.archive_entries': 'KHO LƯU TRỮ // {total} MỤC',
  'colloc.collocation_phrase': 'CỤM TỪ KẾT HỢP',
  'colloc.category_header': 'DANH MỤC',
  'colloc.vietnamese_header': 'BẢN DỊCH TIẾNG VIỆT',
  'colloc.audio_header': 'ÂM THANH',
  'colloc.srs_status_header': 'TRẠNG THÁI SRS',
  'colloc.practice_header': 'LUYỆN TẬP',
  'colloc.drill_btn': 'LUYỆN',
  'colloc.prev_50': '50 trước',
  'colloc.next_50': '50 sau',
  'colloc.page_info': 'TRANG {current} / {total}',
  'colloc.zero_records': 'Không tìm thấy cụm từ nào khớp với tiêu chí lọc.',

  // Tenses Dossier
  'tenses.title': 'CẨM NANG 12 THÌ ĐỘNG TỪ',
  'tenses.random_drill': 'Luyện ngẫu nhiên ({count} câu)',
  'tenses.gauntlet': 'Thử thách 12 Thì Toàn diện',
  'tenses.codex': 'Cẩm nang 12 Thì',
  'tenses.advanced_syntax': 'Cú pháp Nâng cao (B2–C2)',
  'tenses.all_tenses': 'Tất cả 12 thì',
  'tenses.present': 'Hiện tại (4)',
  'tenses.past': 'Quá khứ (4)',
  'tenses.future': 'Tương lai (4)',
  'tenses.filter_tense': 'LỌC THÌ:',
  'tenses.all_in_family': '-- Tất cả các thì trong nhóm --',
  'tenses.drill_accuracy': 'ĐỘ CHÍNH XÁC',
  'tenses.hot_streak': 'CHUỖI ĐÚNG LIÊN TỤC',
  'tenses.streak_in_row': '{count} CÂU LIÊN TIẾP',
  'tenses.active_pool': 'KHO CÂU HỎI KHẢ DỤNG',
  'tenses.questions_count': '{count} CÂU HỎI',
  'tenses.zero_questions': 'Không tìm thấy câu hỏi nào trong bộ lọc này. Vui lòng chọn nhóm thì khác.',

  // Reading Dossier
  'reading.title': 'PHÒNG ĐỌC HIỂU CHUYÊN SÂU',
  'reading.articles': 'Bài đọc',
  'reading.reading_passes': 'Các bước đọc',
  'reading.words_count': 'SỐ TỪ: {count}',
  'reading.pass1_badge': '01 ĐỌC LƯỚT',
  'reading.pass1_title': 'BƯỚC 1: ĐỌC LƯỚT & TRÍCH XUẤT LUẬN ĐIỂM',
  'reading.pass1_instruction': 'Quét cấu trúc tổng thể trong 60 giây. Rút ra luận điểm cốt lõi trước khi đi vào chi tiết từ vựng.',
  'reading.pass2_badge': '02 BỘ KHUNG',
  'reading.pass2_title': 'BƯỚC 2: CẤU TRÚC CÂU & MỆNH ĐỀ',
  'reading.pass2_instruction': 'Mổ xẻ trục chính Chủ ngữ - Động từ - Tân ngữ và các tầng mệnh đề phụ thuộc qua các luận cứ then chốt.',
  'reading.pass3_badge': '03 TỪ VỰNG',
  'reading.pass3_title': 'BƯỚC 3: KHAI THÁC TỪ VỰNG CHUYÊN SÂU',
  'reading.pass3_instruction': 'Thấu suốt cụm từ C1/C2, điểm tựa từ vựng và gốc từ nguyên qua các thẻ nhớ ngữ cảnh SRS.',
  'reading.pass4_badge': '04 TỔNG HỢP',
  'reading.pass4_title': 'BƯỚC 4: TỔNG HỢP & TÓM TẮT CHẶT CHẼ',
  'reading.pass4_instruction': 'Phân tích bản tóm tắt mẫu 50 từ chuẩn mực và tái lập luận điểm trọng tâm vào bộ nhớ viết của bạn.',
  'reading.start_timer': 'Bắt đầu bấm giờ đọc lướt 60s',
  'reading.pause_timer': 'Tạm dừng',
  'reading.reset_timer': 'Đặt lại đồng hồ',
  'reading.tab_text': 'Văn bản đọc',
  'reading.tab_analysis': 'Bảng phân tích',

  // Writing Dossier
  'writing.title': 'XƯỞNG LUYỆN VIẾT',
  'writing.franklin_copywork': 'TRỤ CỘT 03 // PHƯƠNG PHÁP FRANKLIN COPYWORK',
  'writing.step1_analyze': '1. PHÂN TÍCH',
  'writing.step2_type': '2. HỒI TƯỞNG & GÕ',
  'writing.step3_evaluate': '3. ĐÁNH GIÁ',
  'writing.prev_prompt': 'Đề bài trước',
  'writing.next_prompt': 'Đề bài tiếp',
  'writing.prompt_counter': 'ĐỀ BÀI {current} / {total}',
  'writing.step1_heading': 'BƯỚC 1 // CẤU TRÚC TU TỪ HỌC',
  'writing.play_model': 'Nghe câu mẫu',
  'writing.meal_scaffolding': 'KHUNG PHÂN TÍCH CẤU TRÚC M-E-A-L',
  'writing.rhetorical_commentary': 'Nhận định tu từ học:',
  'writing.memorized_start': 'Đã ghi nhớ — Ẩn câu mẫu & Bắt đầu gõ',
  'writing.accuracy': 'Độ chính xác',
  'writing.net_wpm': 'Tốc độ thực (WPM)',

  // Listening Dossier
  'listening.title': 'PHÒNG LUYỆN NGHE',
  'listening.active_transcription': 'TRỤ CỘT 04 // CHÉP CHÍNH TẢ CHỦ ĐỘNG',
  'listening.active_cloze': 'ĐIỀN TỪ CHỦ ĐỘNG',
  'listening.three_pass_protocol': 'QUY TRÌNH 3 BƯỚC',
  'listening.passive_passages': 'Bài nghe tiếp nhận',
  'listening.cloze_transcription': 'Chép chính tả điền từ',
  'listening.check_answers': 'Kiểm tra đáp án',
  'listening.reveal_all': 'Hiện toàn bộ đáp án',
  'listening.score': 'Điểm: {correct} / {total} ({percentage}%)',

  // Speaking Dossier
  'speaking.title': 'BẠN LUYỆN NÓI AI',
  'speaking.prompts_count': '{count} CHỦ ĐỀ',
  'speaking.scenarios_count': '{count} TÌNH HUỐNG (A1-C2)',
  'speaking.formant_lab_status': '8 NGUYÊN ÂM IPA // CẶP TỪ TỐI THIỂU',
  'speaking.ielts_status': 'GIÁM KHẢO IELTS // MỤC TIÊU BAND 9.0',
  'speaking.start_take': 'Bắt đầu ghi âm bài nói',
  'speaking.stop_take': 'Dừng ghi âm',
  'speaking.record_mic': 'Nhấn để bắt đầu nói',
  'speaking.stop_submit': 'Dừng & Gửi phần nói',
  'speaking.send_turn': 'Gửi lượt nói',
  'speaking.restart_scene': 'Làm lại tình huống',

  // Lexicon Drawer
  'lexicon.title': 'TỪ ĐIỂN ĐA NĂNG',
  'lexicon.definition': 'Định nghĩa',
  'lexicon.vietnamese': 'Bản dịch tiếng Việt',
  'lexicon.etymology': 'Gốc từ Hy Lạp - Latin / Từ nguyên',
  'lexicon.collocations': 'Cụm từ thường gặp',
  'lexicon.context': 'Ví dụ trong ngữ cảnh',
  'lexicon.bookmark_srs': 'Lưu vào bộ thẻ SRS',
  'lexicon.in_srs': 'Đã lưu trong SRS',
  'lexicon.close': 'Đóng',

  // Blitz Dossier
  'blitz.title': 'PHẢN XẠ CHỚP NHOÁNG',
  'blitz.subtitle': 'Thử thách phản xạ nhanh 60 giây phong cách Roguelike',
  'blitz.start': 'Bắt đầu Chớp nhoáng',
  'blitz.combo': 'Chuỗi x{multiplier}',
  'blitz.score': 'Điểm số: {score}',
  'blitz.time_remaining': 'Thời gian: {seconds}s',
  'blitz.game_over': 'Hoàn thành lượt chơi!',
  'blitz.final_score': 'Điểm chung cuộc: {score}',
  'blitz.best_streak': 'Chuỗi kỷ lục: {count}',
  'blitz.accuracy': 'Độ chính xác: {accuracy}%',
  'blitz.xp_earned': '+{xp} XP Nhận được',

  // Analytics Dossier
  'analytics.title': 'PHÂN TÍCH & SERL 2.0',
  'analytics.competency_radar': 'Biểu đồ Năng lực Radar',
  'analytics.spectrum_header': 'QUANG PHỔ LỤC GIÁC 6 TRỤ CỘT CEFR',
  'analytics.trajectory_header': 'HÀNH LANG DỰ ĐOÁN TIẾN TRÌNH 30 NGÀY',
  'analytics.trajectory_title': 'Quỹ đạo Band điểm IELTS',
  'analytics.serl_title': 'Đấu trường Khắc phục Lỗi SERL 2.0',
  'analytics.active_errors': 'Lỗi cần khắc phục ({count})',
  'analytics.no_errors': 'Không có lỗi trọng yếu nào cần khắc phục.',
  'analytics.launch_drill': 'Bắt đầu bài tập phục hồi',
  'analytics.accuracy': 'Độ chính xác',
  'analytics.drill_time': 'Thời gian luyện tập còn lại: {seconds}s'
};

export const DICTIONARIES: Record<Locale, TranslationDictionary> = {
  en: EN_DICTIONARY,
  vi: VI_DICTIONARY
};

class I18nManager {
  private currentLocale: Locale = 'en';
  private listeners: Set<(locale: Locale) => void> = new Set();
  private dictionaries: Record<Locale, TranslationDictionary> = DICTIONARIES;

  constructor() {
    this.init();
  }

  private init(): void {
    let savedLocale: Locale = 'en';
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'vi' || stored === 'en') {
          savedLocale = stored;
        }
      }
    } catch {
      // In private browsing or storage disabled scenarios
      savedLocale = 'en';
    }
    this.currentLocale = savedLocale;
    this.syncHtmlLang();
  }

  private syncHtmlLang(): void {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = this.currentLocale;
    }
  }

  public getLocale(): Locale {
    return this.currentLocale;
  }

  public setLocale(locale: Locale): void {
    if (locale !== 'en' && locale !== 'vi') return;
    if (this.currentLocale === locale) return;

    this.currentLocale = locale;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, locale);
      }
    } catch {
      // Ignore storage write issues
    }

    this.syncHtmlLang();

    // Notify window event listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(LOCALE_EVENT, { detail: { locale: this.currentLocale } })
      );
    }

    // Notify registered subscriber callbacks
    for (const callback of this.listeners) {
      try {
        callback(this.currentLocale);
      } catch (err) {
        console.error('Error in i18n locale change listener:', err);
      }
    }
  }

  public toggleLocale(): Locale {
    const nextLocale: Locale = this.currentLocale === 'en' ? 'vi' : 'en';
    this.setLocale(nextLocale);
    return nextLocale;
  }

  public onLocaleChange(callback: (locale: Locale) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public addTranslations(locale: Locale, translations: Record<string, string>): void {
    if (!this.dictionaries[locale]) {
      this.dictionaries[locale] = {};
    }
    Object.assign(this.dictionaries[locale], translations);
  }

  public t(key: string, params?: Record<string, string | number>, fallback?: string): string {
    const dict = this.dictionaries[this.currentLocale] || this.dictionaries.en;
    let text = dict[key];

    // If key not found in current locale, try English fallback
    if (text === undefined && this.dictionaries.en) {
      text = this.dictionaries.en[key];
    }

    // If still not found, check provided fallback or default to key
    if (text === undefined) {
      text = fallback !== undefined ? fallback : key;
    }

    // Interpolate {param} or {{param}} tokens if params supplied
    if (params) {
      for (const [pKey, pVal] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{\\{?${pKey}\\}?\\}`, 'g'), String(pVal));
      }
    }

    return text;
  }

  public localizeDom(root?: HTMLElement): void {
    const context = root || (typeof document !== 'undefined' ? document.body : undefined);
    if (!context) return;

    // Localize the root element itself if applicable
    this.localizeElement(context);

    // Localize all matching descendants
    const textEls = context.querySelectorAll<HTMLElement>('[data-i18n]');
    textEls.forEach(el => this.localizeElement(el));

    const titleEls = context.querySelectorAll<HTMLElement>('[data-i18n-title]');
    titleEls.forEach(el => this.localizeAttribute(el, 'data-i18n-title', 'title'));

    const phEls = context.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-placeholder]');
    phEls.forEach(el => this.localizeAttribute(el, 'data-i18n-placeholder', 'placeholder'));

    const ariaEls = context.querySelectorAll<HTMLElement>('[data-i18n-aria-label]');
    ariaEls.forEach(el => this.localizeAttribute(el, 'data-i18n-aria-label', 'aria-label'));
  }

  private localizeElement(el: HTMLElement): void {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const translated = this.t(key);
    if (translated) {
      el.textContent = translated;
    }
  }

  private localizeAttribute(el: HTMLElement, sourceAttr: string, targetAttr: string): void {
    const key = el.getAttribute(sourceAttr);
    if (!key) return;
    const translated = this.t(key);
    if (translated) {
      el.setAttribute(targetAttr, translated);
    }
  }
}

export const I18n = new I18nManager();

export const t = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string
): string => I18n.t(key, params, fallback);

export default I18n;
