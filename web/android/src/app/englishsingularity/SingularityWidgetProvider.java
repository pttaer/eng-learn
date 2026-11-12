package app.englishsingularity;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.ArrayMap;
import android.util.SizeF;
import android.view.View;
import android.widget.RemoteViews;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 100% Offline Responsive Home Screen Widget for English Singularity.
 * Supports Compact (2x1 / 2x2), Standard (4x1 / 4x2), and Expanded Tabbed Dossier (4x3 / 4x4)
 * with animated tab switching, dual TTS audio pronunciation, active recall toggle, quest checklist,
 * and 4 Pillars direct launchers.
 */
public class SingularityWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "singularity_widget_prefs";
    public static final String PREF_STREAK = "streak";
    public static final String PREF_PROGRESS = "progress_text";
    public static final String PREF_WORD = "custom_word";
    public static final String PREF_PHONETIC = "custom_phonetic";
    public static final String PREF_MEANING = "custom_meaning";
    public static final String PREF_EXAMPLE = "custom_example";
    public static final String PREF_TAGS = "custom_tags";
    public static final String PREF_WORD_INDEX = "word_rotation_index";
    public static final String PREF_ACTIVE_TAB = "expanded_active_tab";
    public static final String PREF_RECALL_MASKED = "recall_masked";
    public static final String PREF_QUIZ_INDEX = "widget_quiz_index";
    public static final String PREF_QUIZ_SELECTED = "widget_quiz_selected";
    public static final String PREF_QUIZ_SCORE = "widget_quiz_score";
    public static final String PREF_QUIZ_PENDING_SCORE = "widget_quiz_pending_score";
    public static final String PREF_LEVEL = "player_level";
    public static final String PREF_COMPLETED_QUESTS = "completed_quests_count";
    public static final String PREF_QUESTS_TOTAL = "quests_total_count";
    public static final String PREF_QUESTS_JSON = "daily_quests_json";
    public static final String PREF_CUSTOM_WORDS_JSON = "custom_words_json";

    public static class WordCardData {
        public final String word;
        public final String phonetic;
        public final String meaning;
        public final String example;
        public final String tags;

        public WordCardData(String word, String phonetic, String meaning, String example, String tags) {
            this.word = word;
            this.phonetic = phonetic;
            this.meaning = meaning;
            this.example = example;
            this.tags = tags;
        }
    }

    public static WordCardData getWordCard(SharedPreferences prefs, int index) {
        String customJson = prefs.getString(PREF_CUSTOM_WORDS_JSON, null);
        if (customJson != null && !customJson.trim().isEmpty()) {
            try {
                org.json.JSONArray arr = new org.json.JSONArray(customJson);
                if (arr.length() > 0) {
                    int safe = Math.abs(index) % arr.length();
                    org.json.JSONObject obj = arr.getJSONObject(safe);
                    return new WordCardData(
                        obj.optString("word", "Ephemeral"),
                        obj.optString("phonetic", ""),
                        obj.optString("meaning", ""),
                        obj.optString("example", ""),
                        obj.optString("tags", "")
                    );
                }
            } catch (Exception ignored) {}
        }

        if (index == 0 && prefs.contains(PREF_WORD)) {
            return new WordCardData(
                prefs.getString(PREF_WORD, OFFLINE_WORDS[0][0]),
                prefs.getString(PREF_PHONETIC, OFFLINE_WORDS[0][1]),
                prefs.getString(PREF_MEANING, OFFLINE_WORDS[0][2]),
                prefs.getString(PREF_EXAMPLE, OFFLINE_WORDS[0][3]),
                prefs.getString(PREF_TAGS, OFFLINE_WORDS[0][4])
            );
        }

        int safeIdx = Math.abs(index) % OFFLINE_WORDS.length;
        return new WordCardData(
            OFFLINE_WORDS[safeIdx][0],
            OFFLINE_WORDS[safeIdx][1],
            OFFLINE_WORDS[safeIdx][2],
            OFFLINE_WORDS[safeIdx][3],
            OFFLINE_WORDS[safeIdx][4]
        );
    }

    public static final String ACTION_NEXT_WORD = "app.englishsingularity.ACTION_NEXT_WORD";
    public static final String ACTION_SPEAK_WORD = "app.englishsingularity.ACTION_SPEAK_WORD";
    public static final String ACTION_SPEAK_SENTENCE = "app.englishsingularity.ACTION_SPEAK_SENTENCE";
    public static final String ACTION_TOGGLE_RECALL = "app.englishsingularity.ACTION_TOGGLE_RECALL";
    public static final String ACTION_SELECT_TAB = "app.englishsingularity.ACTION_SELECT_TAB";
    public static final String ACTION_ANSWER_QUIZ = "app.englishsingularity.ACTION_ANSWER_QUIZ";
    public static final String ACTION_NEXT_QUIZ = "app.englishsingularity.ACTION_NEXT_QUIZ";
    public static final String ACTION_OPEN_VOCAB = "app.englishsingularity.ACTION_OPEN_VOCAB";
    public static final String ACTION_OPEN_IELTS = "app.englishsingularity.ACTION_OPEN_IELTS";
    public static final String ACTION_OPEN_READING = "app.englishsingularity.ACTION_OPEN_READING";
    public static final String ACTION_OPEN_WRITING = "app.englishsingularity.ACTION_OPEN_WRITING";
    public static final String ACTION_OPEN_LISTENING = "app.englishsingularity.ACTION_OPEN_LISTENING";
    public static final String ACTION_OPEN_SPEAKING = "app.englishsingularity.ACTION_OPEN_SPEAKING";
    public static final String ACTION_OPEN_HABITS = "app.englishsingularity.ACTION_OPEN_HABITS";
    public static final String ACTION_OPEN_QUIZ = "app.englishsingularity.ACTION_OPEN_QUIZ";
    public static final String ACTION_OPEN_TREE = "app.englishsingularity.ACTION_OPEN_TREE";

    private static PendingIntent createActivityPendingIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(action);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(context, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // Curated offline C2 / Academic IELTS pool for standalone offline widget rotation & quiz
    private static final String[][] OFFLINE_WORDS = {
        {
            "Ephemeral",
            "/ɪˈfem.ər.əl/ • adj",
            "Lasting for only a very short time; transient or fleeting.",
            "“Fame in the digital era is intensely ephemeral, vanishing as swiftly as it emerges.”",
            "Collocations: ephemeral nature, ephemeral pleasure  •  Synonyms: transient, fleeting",
            "Phù du, ngắn ngủi, sớm nở tối tàn"
        },
        {
            "Ubiquitous",
            "/juːˈbɪk.wɪ.təs/ • adj",
            "Present, appearing, or found everywhere simultaneously.",
            "“Mobile devices have become ubiquitous in daily modern life.”",
            "Collocations: ubiquitous presence, ubiquitous influence  •  Synonyms: omnipresent, pervasive",
            "Phổ biến khắp nơi, đâu đâu cũng thấy"
        },
        {
            "Paradigm",
            "/ˈpær.ə.daɪm/ • n",
            "A typical example, pattern, model, or conceptual framework.",
            "“The shift marked an entirely new paradigm in economic thought.”",
            "Collocations: paradigm shift, dominant paradigm  •  Synonyms: archetype, model, standard",
            "Mô hình chuẩn mực, khuôn mẫu tư duy"
        },
        {
            "Salient",
            "/ˈseɪ.li.ənt/ • adj",
            "Most noticeable, prominent, or of pivotal importance.",
            "“She highlighted the salient features of the academic proposal.”",
            "Collocations: salient point, salient feature  •  Synonyms: prominent, conspicuous, pivotal",
            "Nổi bật, then chốt, đáng chú ý nhất"
        },
        {
            "Mitigate",
            "/ˈmɪt.ɪ.ɡeɪt/ • v",
            "Make less severe, serious, painful, or damaging.",
            "“Stringent safeguards mitigate systemic failure risk.”",
            "Collocations: mitigate risk, mitigate impact  •  Synonyms: alleviate, attenuate, reduce",
            "Làm giảm nhẹ, xoa dịu, giảm thiểu tác hại"
        },
        {
            "Juxtapose",
            "/ˌdʒʌk.stəˈpəʊz/ • v",
            "Place close together for contrasting effect.",
            "“The essay juxtaposes urban decay and modern high-tech.”",
            "Collocations: juxtapose with, starkly juxtaposed  •  Synonyms: compare, contrast, collate",
            "Đặt cạnh nhau để làm nổi bật tương phản"
        },
        {
            "Plausible",
            "/ˈplɔː.zə.bəl/ • adj",
            "Reasonable or probable; having an appearance of truth.",
            "“The investigator offered a plausible explanation for the anomaly.”",
            "Collocations: plausible explanation, highly plausible  •  Synonyms: credible, believable, feasible",
            "Hợp lý, đáng tin cậy, có thể xảy ra"
        },
        {
            "Exacerbate",
            "/ɪɡˈzæs.ə.beɪt/ • v",
            "Make a problem, bad situation, or negative feeling worse.",
            "“Budget cutbacks will exacerbate the existing labor shortage.”",
            "Collocations: exacerbate tension, exacerbate crisis  •  Synonyms: aggravate, worsen, inflame",
            "Làm trầm trọng thêm, làm xấu đi tình hình"
        },
        {
            "Proponent",
            "/prəˈpəʊ.nənt/ • n",
            "A person who advocates a theory, proposal, or course of action.",
            "“He was an articulate proponent of sustainable clean energy.”",
            "Collocations: leading proponent, vocal proponent  •  Synonyms: advocate, champion, supporter",
            "Người ủng hộ tích cực, người đề xướng"
        },
        {
            "Comprehensive",
            "/ˌkɒm.prɪˈhen.sɪv/ • adj",
            "Including or dealing with all or nearly all aspects of something.",
            "“The research paper provides a comprehensive review of the empirical data.”",
            "Collocations: comprehensive review, comprehensive guide  •  Synonyms: exhaustive, thorough, complete",
            "Toàn diện, bao quát tất cả khía cạnh"
        },
        {
            "Pragmatic",
            "/præɡˈmæt.ɪk/ • adj",
            "Dealing with things sensibly and realistically based on practical results.",
            "“They adopted a pragmatic approach to resolve the complex dilemma.”",
            "Collocations: pragmatic approach, pragmatic solution  •  Synonyms: practical, sensible, realistic",
            "Thực tế, thực dụng, trọng tính khả thi"
        },
        {
            "Ambivalent",
            "/æmˈbɪv.ə.lənt/ • adj",
            "Having mixed feelings or contradictory ideas about something.",
            "“Many scholars remain ambivalent about the rapid proliferation of AI.”",
            "Collocations: feel ambivalent, highly ambivalent  •  Synonyms: equivocal, uncertain, undecided",
            "Lưỡng lự, có cảm xúc trái chiều mâu thuẫn"
        },
        {
            "Conundrum",
            "/kəˈnʌn.drəm/ • n",
            "A confusing and difficult problem or question.",
            "“Balancing economic growth with conservation is a major policy conundrum.”",
            "Collocations: ethical conundrum, solve a conundrum  •  Synonyms: enigma, puzzle, dilemma",
            "Câu đố hóc búa, bài toán nan giải"
        },
        {
            "Resilient",
            "/rɪˈzɪl.jənt/ • adj",
            "Able to withstand or recover quickly from difficult conditions.",
            "“The local ecosystem proved remarkably resilient against severe droughts.”",
            "Collocations: resilient economy, highly resilient  •  Synonyms: robust, adaptable, buoyant",
            "Kiên cường, bền bỉ, phục hồi nhanh chóng"
        },
        {
            "Tenacious",
            "/təˈneɪ.ʃəs/ • adj",
            "Tending to keep a firm hold of something; clinging or determined.",
            "“Her tenacious defense of human rights earned international acclaim.”",
            "Collocations: tenacious grip, tenacious pursuit  •  Synonyms: persistent, resolute, steadfast",
            "Kiên trì, ngoan cường, bám đuổi đến cùng"
        },
        {
            "Scrutinize",
            "/ˈskruː.tɪ.naɪz/ • v",
            "Examine or inspect closely and thoroughly.",
            "“Regulators must rigorously scrutinize the bank's internal transactions.”",
            "Collocations: closely scrutinize, carefully scrutinized  •  Synonyms: inspect, examine, audit",
            "Soi xét kỹ lưỡng, kiểm tra thấu đáo"
        }
    };

    /**
     * Resolves concise gloss for Flash Quiz options (prioritizing pure translation/definition over long blocks).
     */
    private static String getOptionGloss(org.json.JSONObject obj, boolean isVietnamese) {
        if (obj == null) return "";
        if (isVietnamese) {
            String vn = obj.optString("vietnamese", "").trim();
            if (!vn.isEmpty()) return vn;
        }
        String def = obj.optString("definition", "").trim();
        if (!def.isEmpty()) return def;
        return obj.optString("meaning", "").trim();
    }

    /**
     * Internal singleton TTS engine for instant home-screen word pronunciation.
     */
    static class WidgetTtsManager {
        private static TextToSpeech tts;
        private static String pendingWord;
        private static boolean isInitializing = false;
        private static volatile Runnable currentCallback = null;

        private static void setupUtteranceListener(TextToSpeech engine) {
            engine.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {}

                @Override
                public void onDone(String utteranceId) {
                    dispatchFinish();
                }

                @Override
                public void onError(String utteranceId) {
                    dispatchFinish();
                }

                @Deprecated
                public void onError(String utteranceId, int errorCode) {
                    dispatchFinish();
                }
            });
        }

        private static synchronized void dispatchFinish() {
            Runnable cb = currentCallback;
            if (cb != null) {
                currentCallback = null;
                cb.run();
            }
        }

        private static void speakText(TextToSpeech engine, String text, Runnable callback) {
            currentCallback = callback;
            String utteranceId = "singularity_widget_audio_" + System.currentTimeMillis();
            engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId);
        }

        public static synchronized void speak(Context context, final String text, final PendingResult pendingResult) {
            final AtomicBoolean isFinished = new AtomicBoolean(false);
            final Runnable safeFinish = () -> {
                if (pendingResult != null && isFinished.compareAndSet(false, true)) {
                    try {
                        pendingResult.finish();
                    } catch (Exception ignored) {}
                }
            };

            if (text == null || text.trim().isEmpty()) {
                safeFinish.run();
                return;
            }

            final Context appContext = context.getApplicationContext();

            // Safety timeout: ensure pendingResult is finished within 6s even if engine hangs
            if (pendingResult != null) {
                new Handler(Looper.getMainLooper()).postDelayed(safeFinish, 6000);
            }

            if (tts == null) {
                pendingWord = text;
                if (!isInitializing) {
                    isInitializing = true;
                    tts = new TextToSpeech(appContext, status -> {
                        synchronized (WidgetTtsManager.class) {
                            isInitializing = false;
                            if (status == TextToSpeech.SUCCESS && tts != null) {
                                int res = tts.setLanguage(Locale.UK);
                                if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                                    res = tts.setLanguage(Locale.US);
                                    if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                                        tts.setLanguage(Locale.getDefault());
                                    }
                                }
                                tts.setSpeechRate(0.92f);
                                setupUtteranceListener(tts);
                                if (pendingWord != null) {
                                    speakText(tts, pendingWord, safeFinish);
                                    pendingWord = null;
                                } else {
                                    safeFinish.run();
                                }
                            } else {
                                safeFinish.run();
                            }
                        }
                    });
                }
            } else {
                speakText(tts, text, safeFinish);
            }
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        int current = prefs.getInt(PREF_WORD_INDEX, 0);
        prefs.edit().putInt(PREF_WORD_INDEX, current + 1).apply();
        for (int widgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId, null);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateWidget(context, appWidgetManager, appWidgetId, newOptions);
    }

    public static void updateWidget(Context context, AppWidgetManager appWidgetManager, int widgetId, Bundle options) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        int streak = prefs.getInt(PREF_STREAK, 12);
        String progress = prefs.getString(PREF_PROGRESS, "Lv.4 • 2/3 Quests");
        int index = prefs.getInt(PREF_WORD_INDEX, 0);

        WordCardData currentWord = getWordCard(prefs, index);
        String word = currentWord.word;
        String phonetic = currentWord.phonetic;
        String meaning = currentWord.meaning;
        String example = currentWord.example;
        String tags = currentWord.tags;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+ multi-size responsive layout map
            RemoteViews smallViews = buildRemoteViews(context, R.layout.widget_singularity_small, streak, progress, word, phonetic, meaning, example, tags, true);
            RemoteViews mediumViews = buildRemoteViews(context, R.layout.widget_singularity_medium, streak, progress, word, phonetic, meaning, example, tags, false);
            RemoteViews expandedViews = buildRemoteViews(context, R.layout.widget_singularity_expanded, streak, progress, word, phonetic, meaning, example, tags, false);

            Map<SizeF, RemoteViews> viewMapping = new ArrayMap<>();
            viewMapping.put(new SizeF(110f, 60f), smallViews);
            viewMapping.put(new SizeF(220f, 90f), mediumViews);
            viewMapping.put(new SizeF(220f, 170f), expandedViews);

            appWidgetManager.updateAppWidget(widgetId, new RemoteViews(viewMapping));
        } else {
            // Universal fallback for API < 31 based on widget options
            Bundle opts = options != null ? options : appWidgetManager.getAppWidgetOptions(widgetId);
            int minWidth = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 250) : 250;
            int minHeight = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110) : 110;

            int layoutId;
            boolean isCompact = false;
            if (minHeight >= 170 && minWidth >= 200) {
                layoutId = R.layout.widget_singularity_expanded;
            } else if (minWidth < 200 || minHeight < 90) {
                layoutId = R.layout.widget_singularity_small;
                isCompact = true;
            } else {
                layoutId = R.layout.widget_singularity_medium;
            }

            RemoteViews views = buildRemoteViews(context, layoutId, streak, progress, word, phonetic, meaning, example, tags, isCompact);
            appWidgetManager.updateAppWidget(widgetId, views);
        }
    }

    private static RemoteViews buildRemoteViews(Context context, int layoutId, int streak, String progress,
            String word, String phonetic, String meaning, String example, String tags, boolean isCompact) {
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        // Streak pill (compact: "🔥 12d", standard: "🔥 12-Day Streak") - one tap jumps to Habits / Daily Quests
        String streakText;
        try {
            int formatRes = isCompact ? R.string.widget_streak_compact_format : R.string.widget_streak_format;
            streakText = context.getString(formatRes, streak);
        } catch (Exception e) {
            streakText = isCompact ? ("🔥 " + streak + "d") : ("🔥 " + streak + (streak == 1 ? " Day Streak" : "-Day Streak"));
        }
        views.setTextViewText(R.id.widget_streak, streakText);
        views.setOnClickPendingIntent(R.id.widget_streak, createActivityPendingIntent(context, ACTION_OPEN_HABITS, 201));

        // Intent: Tap next word (↻)
        Intent nextIntent = new Intent(context, SingularityWidgetProvider.class);
        nextIntent.setAction(ACTION_NEXT_WORD);
        PendingIntent nextPending = PendingIntent.getBroadcast(
            context, 100, nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_action_next, nextPending);

        if (layoutId == R.layout.widget_singularity_expanded) {
            // ==========================================
            // TABBED EXPANDED WIDGET SETUP (ViewFlipper)
            // ==========================================
            int activeTab = prefs.getInt(PREF_ACTIVE_TAB, 0);
            if (activeTab < 0 || activeTab > 3) activeTab = 0;

            // Context-aware root tap fallback for the active tab view
            String activeRootAction;
            switch (activeTab) {
                case 1: activeRootAction = ACTION_OPEN_QUIZ; break;
                case 2: activeRootAction = ACTION_OPEN_HABITS; break;
                case 3: activeRootAction = ACTION_OPEN_IELTS; break;
                default: activeRootAction = ACTION_OPEN_VOCAB; break;
            }
            views.setOnClickPendingIntent(R.id.widget_root, createActivityPendingIntent(context, activeRootAction, 200));

            // Switch ViewFlipper active displayed child
            views.setInt(R.id.widget_flipper, "setDisplayedChild", activeTab);

            // Tab styles
            int activeBg = R.drawable.widget_tab_active_bg;
            int inactiveBg = R.drawable.widget_tab_inactive_bg;
            int activeColor = 0xFFA5B4FC;
            int inactiveColor = 0xFF64748B;

            views.setInt(R.id.widget_tab_word, "setBackgroundResource", activeTab == 0 ? activeBg : inactiveBg);
            views.setTextColor(R.id.widget_tab_word, activeTab == 0 ? activeColor : inactiveColor);

            views.setInt(R.id.widget_tab_quiz, "setBackgroundResource", activeTab == 1 ? activeBg : inactiveBg);
            views.setTextColor(R.id.widget_tab_quiz, activeTab == 1 ? activeColor : inactiveColor);

            views.setInt(R.id.widget_tab_quests, "setBackgroundResource", activeTab == 2 ? activeBg : inactiveBg);
            views.setTextColor(R.id.widget_tab_quests, activeTab == 2 ? activeColor : inactiveColor);

            views.setInt(R.id.widget_tab_pillars, "setBackgroundResource", activeTab == 3 ? activeBg : inactiveBg);
            views.setTextColor(R.id.widget_tab_pillars, activeTab == 3 ? activeColor : inactiveColor);

            // Tab Click PendingIntents
            Intent tab0 = new Intent(context, SingularityWidgetProvider.class);
            tab0.setAction(ACTION_SELECT_TAB);
            tab0.putExtra("tab_index", 0);
            views.setOnClickPendingIntent(R.id.widget_tab_word, PendingIntent.getBroadcast(
                context, 1000, tab0, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent tab1 = new Intent(context, SingularityWidgetProvider.class);
            tab1.setAction(ACTION_SELECT_TAB);
            tab1.putExtra("tab_index", 1);
            views.setOnClickPendingIntent(R.id.widget_tab_quiz, PendingIntent.getBroadcast(
                context, 1001, tab1, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent tab2 = new Intent(context, SingularityWidgetProvider.class);
            tab2.setAction(ACTION_SELECT_TAB);
            tab2.putExtra("tab_index", 2);
            views.setOnClickPendingIntent(R.id.widget_tab_quests, PendingIntent.getBroadcast(
                context, 1002, tab2, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent tab3 = new Intent(context, SingularityWidgetProvider.class);
            tab3.setAction(ACTION_SELECT_TAB);
            tab3.putExtra("tab_index", 3);
            views.setOnClickPendingIntent(R.id.widget_tab_pillars, PendingIntent.getBroadcast(
                context, 1003, tab3, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // --- TAB 1 (Word Card) ---
            views.setTextViewText(R.id.widget_word, word);
            views.setTextViewText(R.id.widget_phonetic, phonetic);

            // One-tap jump to Vocabulary Dossier on any card element
            views.setOnClickPendingIntent(R.id.widget_card_content, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 210));
            views.setOnClickPendingIntent(R.id.widget_word, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 211));
            views.setOnClickPendingIntent(R.id.widget_phonetic, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 212));
            views.setOnClickPendingIntent(R.id.widget_meaning, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 213));
            views.setOnClickPendingIntent(R.id.widget_example, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 214));

            String cefrTag = "C2 ACADEMIC";
            if (tags != null && tags.contains("CEFR:")) {
                try {
                    int idx = tags.indexOf("CEFR:");
                    String part = tags.substring(idx + 5).trim();
                    String level = part.split("[^A-Za-z0-9]")[0];
                    if (!level.isEmpty()) cefrTag = level.toUpperCase() + " ACADEMIC";
                } catch (Exception ignored) {}
            }

            String hook = prefs.getString("notification_hook", "");
            String tip = prefs.getString("notification_tip", "");
            String displayBadge = (hook != null && !hook.trim().isEmpty()) ? hook : tip;
            if (displayBadge != null && !displayBadge.trim().isEmpty()) {
                views.setTextViewText(R.id.widget_badge_cefr, displayBadge);
            } else {
                views.setTextViewText(R.id.widget_badge_cefr, cefrTag);
            }
            views.setOnClickPendingIntent(R.id.widget_badge_cefr, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 217));

            // Active Recall Masking Toggle
            boolean isMasked = prefs.getBoolean(PREF_RECALL_MASKED, false);
            try {
                views.setTextViewText(R.id.widget_btn_recall_toggle, context.getString(isMasked ? R.string.widget_btn_recall_reveal : R.string.widget_btn_recall_hide));
            } catch (Exception e) {
                views.setTextViewText(R.id.widget_btn_recall_toggle, isMasked ? "👁 Reveal" : "👁 Hide");
            }
            if (isMasked) {
                views.setTextViewText(R.id.widget_meaning, "••••••••••••••••••••••••••••••••••••••••••••••••••");
                views.setTextViewText(R.id.widget_example, "“••••••••••••••••••••••••••••••••••••••••••••••••••”");
            } else {
                views.setTextViewText(R.id.widget_meaning, meaning);
                views.setTextViewText(R.id.widget_example, example);
            }

            Intent recallIntent = new Intent(context, SingularityWidgetProvider.class);
            recallIntent.setAction(ACTION_TOGGLE_RECALL);
            views.setOnClickPendingIntent(R.id.widget_btn_recall_toggle, PendingIntent.getBroadcast(
                context, 600, recallIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // Dual Audio: Word Pronunciation
            Intent audioWordIntent = new Intent(context, SingularityWidgetProvider.class);
            audioWordIntent.setAction(ACTION_SPEAK_WORD);
            audioWordIntent.putExtra("word_to_speak", word);
            views.setOnClickPendingIntent(R.id.widget_btn_audio_word, PendingIntent.getBroadcast(
                context, 500, audioWordIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // Dual Audio: Model Sentence Pronunciation
            Intent audioSentenceIntent = new Intent(context, SingularityWidgetProvider.class);
            audioSentenceIntent.setAction(ACTION_SPEAK_SENTENCE);
            audioSentenceIntent.putExtra("sentence_to_speak", example);
            views.setOnClickPendingIntent(R.id.widget_btn_audio_sentence, PendingIntent.getBroadcast(
                context, 501, audioSentenceIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // Collocations & Synonyms Tag Block
            boolean hasTags = tags != null && !tags.trim().isEmpty();
            views.setViewVisibility(R.id.widget_tags_container, hasTags ? View.VISIBLE : View.GONE);
            views.setOnClickPendingIntent(R.id.widget_tags_container, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 215));
            views.setOnClickPendingIntent(R.id.widget_tags, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 216));
            if (hasTags) {
                if (isMasked) {
                    String recallHint;
                    try {
                        recallHint = context.getString(R.string.widget_recall_hint);
                    } catch (Exception e) {
                        recallHint = isVietnamese
                            ? "[Chế độ Gợi nhớ Tích cực] Chạm '👁 Hiện' để mở nghĩa & cụm từ"
                            : "[Active Recall Mode] Tap '👁 Reveal' to uncover meaning & collocations";
                    }
                    views.setTextViewText(R.id.widget_tags, recallHint);
                } else {
                    views.setTextViewText(R.id.widget_tags, tags);
                }
            }

            String appLocale = prefs.getString("app_locale", "en");
            boolean isVietnamese = "vi".equalsIgnoreCase(appLocale) ||
                (progress != null && (progress.contains("Cấp") || progress.contains("Nhiệm vụ") || progress.contains("chuỗi") || progress.contains("thẻ")));

            // --- TAB 2 (Vocab Flash Quiz) ---
            int quizIdx = prefs.getInt(PREF_QUIZ_INDEX, 0);
            int quizSelected = prefs.getInt(PREF_QUIZ_SELECTED, -1);
            int quizScore = prefs.getInt(PREF_QUIZ_SCORE, 0);

            String customJson = prefs.getString(PREF_CUSTOM_WORDS_JSON, null);
            org.json.JSONArray customArr = null;
            if (customJson != null && !customJson.trim().isEmpty()) {
                try {
                    org.json.JSONArray a = new org.json.JSONArray(customJson);
                    if (a.length() >= 3) customArr = a;
                } catch (Exception ignored) {}
            }

            String quizWord;
            String quizPhonetic;
            String correctDef;
            String distractor1 = null;
            String distractor2 = null;

            if (customArr != null) {
                int len = customArr.length();
                int targetWordIdx = Math.abs(quizIdx) % len;
                org.json.JSONObject targetObj = customArr.optJSONObject(targetWordIdx);

                quizWord = targetObj != null ? targetObj.optString("word", "Ephemeral") : "Ephemeral";
                quizPhonetic = targetObj != null ? targetObj.optString("phonetic", "") : "";
                correctDef = getOptionGloss(targetObj, isVietnamese);
                if (correctDef.isEmpty()) correctDef = "Ephemeral definition";

                for (int step = 1; step < len; step++) {
                    int candIdx = (targetWordIdx + step) % len;
                    org.json.JSONObject candObj = customArr.optJSONObject(candIdx);
                    String candDef = getOptionGloss(candObj, isVietnamese);
                    if (!candDef.isEmpty() && !candDef.equalsIgnoreCase(correctDef)) {
                        if (distractor1 == null) {
                            distractor1 = candDef;
                        } else if (!distractor1.equalsIgnoreCase(candDef)) {
                            distractor2 = candDef;
                            break;
                        }
                    }
                }

                // If fewer than 2 distinct distractors found in customArr, backfill from OFFLINE_WORDS
                int offIdx = 0;
                while ((distractor1 == null || distractor2 == null) && offIdx < OFFLINE_WORDS.length) {
                    String offDef = (isVietnamese && OFFLINE_WORDS[offIdx].length > 5)
                        ? OFFLINE_WORDS[offIdx][5]
                        : OFFLINE_WORDS[offIdx][2];
                    if (!offDef.equalsIgnoreCase(correctDef)) {
                        if (distractor1 == null) {
                            distractor1 = offDef;
                        } else if (!distractor1.equalsIgnoreCase(offDef)) {
                            distractor2 = offDef;
                            break;
                        }
                    }
                    offIdx++;
                }
            } else {
                int targetWordIdx = Math.abs(quizIdx) % OFFLINE_WORDS.length;
                quizWord = OFFLINE_WORDS[targetWordIdx][0];
                quizPhonetic = OFFLINE_WORDS[targetWordIdx][1];
                correctDef = (isVietnamese && OFFLINE_WORDS[targetWordIdx].length > 5)
                    ? OFFLINE_WORDS[targetWordIdx][5]
                    : OFFLINE_WORDS[targetWordIdx][2];

                for (int step = 1; step < OFFLINE_WORDS.length; step++) {
                    int candIdx = (targetWordIdx + step) % OFFLINE_WORDS.length;
                    String candDef = (isVietnamese && OFFLINE_WORDS[candIdx].length > 5)
                        ? OFFLINE_WORDS[candIdx][5]
                        : OFFLINE_WORDS[candIdx][2];
                    if (!candDef.equalsIgnoreCase(correctDef)) {
                        if (distractor1 == null) {
                            distractor1 = candDef;
                        } else if (!distractor1.equalsIgnoreCase(candDef)) {
                            distractor2 = candDef;
                            break;
                        }
                    }
                }
            }

            if (distractor1 == null) distractor1 = isVietnamese ? "Phổ biến khắp nơi" : "Present everywhere simultaneously";
            if (distractor2 == null) distractor2 = isVietnamese ? "Làm giảm nhẹ tác hại" : "Make less severe or damaging";

            // Determine randomized correct position (0, 1, or 2)
            int correctSlot = Math.abs(quizIdx * 7 + 1) % 3;
            String[] options = new String[3];
            if (correctSlot == 0) {
                options[0] = correctDef;
                options[1] = distractor1;
                options[2] = distractor2;
            } else if (correctSlot == 1) {
                options[0] = distractor1;
                options[1] = correctDef;
                options[2] = distractor2;
            } else {
                options[0] = distractor1;
                options[1] = distractor2;
                options[2] = correctDef;
            }

            views.setTextViewText(R.id.widget_quiz_question, quizWord + "  " + quizPhonetic);
            String scoreText = isVietnamese
                ? ("🧠 " + quizScore + " Đúng (+" + (quizScore * 10) + " XP)")
                : ("🧠 " + quizScore + " Correct (+" + (quizScore * 10) + " XP)");
            views.setTextViewText(R.id.widget_quiz_score, scoreText);

            // One-tap jump to Speed Recall Blitz Quiz in app when tapping quiz header/prompt
            views.setOnClickPendingIntent(R.id.widget_quiz_prompt_label, createActivityPendingIntent(context, ACTION_OPEN_QUIZ, 220));
            views.setOnClickPendingIntent(R.id.widget_quiz_question, createActivityPendingIntent(context, ACTION_OPEN_QUIZ, 221));
            views.setOnClickPendingIntent(R.id.widget_quiz_score, createActivityPendingIntent(context, ACTION_OPEN_QUIZ, 222));
            views.setOnClickPendingIntent(R.id.widget_quiz_badge_cefr, createActivityPendingIntent(context, ACTION_OPEN_QUIZ, 223));
            views.setOnClickPendingIntent(R.id.widget_quiz_feedback, createActivityPendingIntent(context, ACTION_OPEN_QUIZ, 224));

            int[] optContainerIds = { R.id.widget_quiz_opt_1, R.id.widget_quiz_opt_2, R.id.widget_quiz_opt_3 };
            int[] optTextIds = { R.id.widget_quiz_opt_text_1, R.id.widget_quiz_opt_text_2, R.id.widget_quiz_opt_text_3 };
            String[] prefixes = { "A. ", "B. ", "C. " };

            if (quizSelected == -1) {
                // Unanswered state
                views.setTextViewText(R.id.widget_quiz_feedback, isVietnamese ? "Chọn 1 đáp án để kiểm tra phản xạ" : "Tap an option to test active recall");
                views.setTextColor(R.id.widget_quiz_feedback, 0xFFA5B4FC);

                for (int i = 0; i < 3; i++) {
                    views.setTextViewText(optTextIds[i], prefixes[i] + options[i]);
                    views.setTextColor(optTextIds[i], 0xFFF3F4F6);
                    views.setInt(optContainerIds[i], "setBackgroundResource", R.drawable.widget_btn_bg);

                    Intent optIntent = new Intent(context, SingularityWidgetProvider.class);
                    optIntent.setAction(ACTION_ANSWER_QUIZ);
                    optIntent.putExtra("option_index", i);
                    views.setOnClickPendingIntent(optContainerIds[i], PendingIntent.getBroadcast(
                        context, 700 + i, optIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
                }
            } else {
                // Answered state
                boolean isUserCorrect = (quizSelected == correctSlot);
                if (isUserCorrect) {
                    views.setTextViewText(R.id.widget_quiz_feedback, isVietnamese ? ("🎉 Chính xác! (+10 XP) • " + quizWord) : ("🎉 Correct! (+10 XP) • " + quizWord));
                    views.setTextColor(R.id.widget_quiz_feedback, 0xFFA5B4FC);
                } else {
                    views.setTextViewText(R.id.widget_quiz_feedback, (isVietnamese ? "❌ Chưa đúng! Đáp án đúng: " : "❌ Incorrect! Correct: ") + correctDef);
                    views.setTextColor(R.id.widget_quiz_feedback, 0xFFF87171);
                }

                for (int i = 0; i < 3; i++) {
                    if (i == correctSlot) {
                        views.setTextViewText(optTextIds[i], "✔ " + prefixes[i] + options[i]);
                        views.setTextColor(optTextIds[i], 0xFFA5B4FC);
                        views.setInt(optContainerIds[i], "setBackgroundResource", R.drawable.widget_tab_active_bg);
                    } else if (i == quizSelected) {
                        views.setTextViewText(optTextIds[i], "✖ " + prefixes[i] + options[i]);
                        views.setTextColor(optTextIds[i], 0xFFEF4444);
                        views.setInt(optContainerIds[i], "setBackgroundResource", R.drawable.widget_btn_bg);
                    } else {
                        views.setTextViewText(optTextIds[i], prefixes[i] + options[i]);
                        views.setTextColor(optTextIds[i], 0xFF64748B);
                        views.setInt(optContainerIds[i], "setBackgroundResource", R.drawable.widget_btn_bg);
                    }

                    // Once answered, clicking options does not re-trigger
                    views.setOnClickPendingIntent(optContainerIds[i], null);
                }
            }

            // Next question action
            Intent nextQuizIntent = new Intent(context, SingularityWidgetProvider.class);
            nextQuizIntent.setAction(ACTION_NEXT_QUIZ);
            views.setOnClickPendingIntent(R.id.widget_quiz_action_next, PendingIntent.getBroadcast(
                context, 800, nextQuizIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // --- TAB 3 (Quests) ---
            int level = prefs.getInt(PREF_LEVEL, 1);
            int questsTotal = prefs.getInt(PREF_QUESTS_TOTAL, 3);
            if (questsTotal <= 0) questsTotal = 3;
            int completedQuests = prefs.getInt(PREF_COMPLETED_QUESTS, -1);

            if (completedQuests == -1) {
                // Fallback to progress string parsing if not yet synced via explicit fields
                completedQuests = 0;
                if (progress != null) {
                    try {
                        if (progress.contains("Lv.")) {
                            String afterLv = progress.substring(progress.indexOf("Lv.") + 3).trim();
                            String lvNum = afterLv.split("[^0-9]")[0];
                            if (!lvNum.isEmpty()) level = Integer.parseInt(lvNum);
                        } else if (progress.contains("Cấp")) {
                            String afterLv = progress.substring(progress.indexOf("Cấp") + 3).trim();
                            String lvNum = afterLv.split("[^0-9]")[0];
                            if (!lvNum.isEmpty()) level = Integer.parseInt(lvNum);
                        }
                        if (progress.contains("/3")) {
                            String beforeSlash = progress.substring(0, progress.indexOf("/3")).trim();
                            int lastSpace = beforeSlash.lastIndexOf(' ');
                            if (lastSpace >= 0) beforeSlash = beforeSlash.substring(lastSpace + 1);
                            if (!beforeSlash.isEmpty()) completedQuests = Integer.parseInt(beforeSlash);
                        }
                    } catch (Exception ignored) {}
                }
            }
            if (completedQuests < 0) completedQuests = 0;
            if (completedQuests > questsTotal) completedQuests = questsTotal;

            int questPct = Math.round(((float) completedQuests / (float) questsTotal) * 100);
            String bannerTitle = streakText + " • " + (isVietnamese ? ("Cấp " + level + " Khám phá") : ("Lv." + level + " Explorer"));
            views.setTextViewText(R.id.widget_quest_banner, bannerTitle);
            views.setProgressBar(R.id.widget_quest_progress_bar, 100, questPct, false);
            views.setTextViewText(R.id.widget_quest_progress_text, completedQuests + "/" + questsTotal + " " + (isVietnamese ? "Hoàn thành (" : "Completed (") + questPct + "%)");
            views.setOnClickPendingIntent(R.id.widget_quest_banner, createActivityPendingIntent(context, ACTION_OPEN_HABITS, 230));
            views.setOnClickPendingIntent(R.id.widget_quest_progress_text, createActivityPendingIntent(context, ACTION_OPEN_HABITS, 231));

            String questsJson = prefs.getString(PREF_QUESTS_JSON, null);
            org.json.JSONArray qArr = null;
            if (questsJson != null && !questsJson.trim().isEmpty()) {
                try {
                    qArr = new org.json.JSONArray(questsJson);
                } catch (Exception ignored) {}
            }

            int[] qTitleIds = { R.id.widget_quest_title_1, R.id.widget_quest_title_2, R.id.widget_quest_title_3 };
            int[] qStatusIds = { R.id.widget_quest_status_1, R.id.widget_quest_status_2, R.id.widget_quest_status_3 };
            int[] qItemIds = { R.id.widget_quest_item_1, R.id.widget_quest_item_2, R.id.widget_quest_item_3 };

            for (int i = 0; i < 3; i++) {
                boolean qDone = false;
                String qTitle = "";
                int xpReward = 50;
                String category = "";

                if (qArr != null && i < qArr.length()) {
                    org.json.JSONObject qObj = qArr.optJSONObject(i);
                    if (qObj != null) {
                        qDone = qObj.optBoolean("completed", false);
                        qTitle = qObj.optString("title", "");
                        xpReward = qObj.optInt("xp", 50);
                        category = qObj.optString("category", "");
                    }
                } else {
                    qDone = completedQuests > i;
                    if (i == 0) qTitle = isVietnamese ? "15 Thẻ SRS Ôn Tập" : "15 SRS Cards Reviewed";
                    else if (i == 1) qTitle = isVietnamese ? "1 Bài Viết Franklin Copywork" : "1 Franklin Rhetorical Copywork";
                    else qTitle = isVietnamese ? "1 Bài Luyện Nói Examiner" : "1 Examiner Speaking Simulation";
                }

                views.setTextViewText(qTitleIds[i], (qDone ? "✔  " : "○  ") + qTitle);
                views.setTextColor(qTitleIds[i], qDone ? 0xFFA5B4FC : 0xFFF3F4F6);

                String statusText = qDone
                    ? (isVietnamese ? "Xong (+" + xpReward + " XP)" : "Done (+" + xpReward + " XP)")
                    : (isVietnamese ? "Bắt đầu →" : "Start →");
                views.setTextViewText(qStatusIds[i], statusText);
                views.setTextColor(qStatusIds[i], qDone ? 0xFF64748B : 0xFFA5B4FC);

                String actionTarget = ACTION_OPEN_VOCAB;
                if ("copywork".equalsIgnoreCase(category) || "writing".equalsIgnoreCase(category)) {
                    actionTarget = ACTION_OPEN_WRITING;
                } else if ("speech".equalsIgnoreCase(category) || "speaking".equalsIgnoreCase(category)) {
                    actionTarget = ACTION_OPEN_SPEAKING;
                } else if ("reading".equalsIgnoreCase(category)) {
                    actionTarget = ACTION_OPEN_READING;
                } else if ("listening".equalsIgnoreCase(category)) {
                    actionTarget = ACTION_OPEN_LISTENING;
                }
                views.setOnClickPendingIntent(qItemIds[i], createActivityPendingIntent(context, actionTarget, 420 + i));
            }

            // --- TAB 4 (4 Pillars Studios) ---
            views.setOnClickPendingIntent(R.id.widget_tile_reading, createActivityPendingIntent(context, ACTION_OPEN_READING, 410));
            views.setOnClickPendingIntent(R.id.widget_tile_writing, createActivityPendingIntent(context, ACTION_OPEN_WRITING, 411));
            views.setOnClickPendingIntent(R.id.widget_tile_listening, createActivityPendingIntent(context, ACTION_OPEN_LISTENING, 412));
            views.setOnClickPendingIntent(R.id.widget_tile_speaking, createActivityPendingIntent(context, ACTION_OPEN_SPEAKING, 413));

            // Universal bottom deep links
            views.setOnClickPendingIntent(R.id.widget_kicker, createActivityPendingIntent(context, ACTION_OPEN_TREE, 250));
            views.setOnClickPendingIntent(R.id.widget_btn_vocab, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 300));
            views.setOnClickPendingIntent(R.id.widget_btn_ielts, createActivityPendingIntent(context, ACTION_OPEN_IELTS, 400));

        } else {
            // ==========================================
            // SMALL, MEDIUM & STANDARD WIDGET SETUP
            // ==========================================
            views.setTextViewText(R.id.widget_word, word);
            views.setTextViewText(R.id.widget_phonetic, phonetic);
            views.setTextViewText(R.id.widget_meaning, meaning);

            // Direct one-tap deep links to Vocabulary Dossier
            views.setOnClickPendingIntent(R.id.widget_root, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 200));
            views.setOnClickPendingIntent(R.id.widget_card_content, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 203));
            views.setOnClickPendingIntent(R.id.widget_word, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 204));
            views.setOnClickPendingIntent(R.id.widget_phonetic, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 205));
            views.setOnClickPendingIntent(R.id.widget_meaning, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 206));

            // Single audio button
            Intent audioIntent = new Intent(context, SingularityWidgetProvider.class);
            audioIntent.setAction(ACTION_SPEAK_WORD);
            audioIntent.putExtra("word_to_speak", word);
            views.setOnClickPendingIntent(R.id.widget_btn_audio, PendingIntent.getBroadcast(
                context, 500, audioIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            if (layoutId != R.layout.widget_singularity_small) {
                String hook = prefs.getString("notification_hook", "");
                String tip = prefs.getString("notification_tip", "");
                String displayProgress = (hook != null && !hook.trim().isEmpty()) ? hook : ((tip != null && !tip.trim().isEmpty()) ? tip : progress);
                views.setTextViewText(R.id.widget_progress, displayProgress);
                views.setOnClickPendingIntent(R.id.widget_progress, createActivityPendingIntent(context, ACTION_OPEN_HABITS, 202));

                boolean hasExample = example != null && !example.trim().isEmpty();
                views.setViewVisibility(R.id.widget_example, hasExample ? View.VISIBLE : View.GONE);
                if (hasExample) {
                    views.setTextViewText(R.id.widget_example, example);
                    views.setOnClickPendingIntent(R.id.widget_example, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 207));
                }

                views.setOnClickPendingIntent(R.id.widget_btn_vocab, createActivityPendingIntent(context, ACTION_OPEN_VOCAB, 300));
                views.setOnClickPendingIntent(R.id.widget_btn_ielts, createActivityPendingIntent(context, ACTION_OPEN_IELTS, 400));
            }
        }

        return views;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        if (intent == null || intent.getAction() == null) {
            return;
        }

        String action = intent.getAction();

        if (ACTION_NEXT_WORD.equals(action)) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            int current = prefs.getInt(PREF_WORD_INDEX, 0);
            prefs.edit()
                .putInt(PREF_WORD_INDEX, current + 1)
                .apply();

            updateAllWidgets(context);
        } else if (ACTION_SELECT_TAB.equals(action)) {
            int tabIndex = intent.getIntExtra("tab_index", 0);
            if (tabIndex < 0 || tabIndex > 3) tabIndex = 0;
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putInt(PREF_ACTIVE_TAB, tabIndex).apply();
            updateAllWidgets(context);
        } else if (ACTION_ANSWER_QUIZ.equals(action)) {
            int opt = intent.getIntExtra("option_index", -1);
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            int currentSelected = prefs.getInt(PREF_QUIZ_SELECTED, -1);
            if (currentSelected == -1 && opt >= 0 && opt <= 2) {
                int quizIdx = prefs.getInt(PREF_QUIZ_INDEX, 0);
                int correctSlot = Math.abs(quizIdx * 7 + 1) % 3;
                int score = prefs.getInt(PREF_QUIZ_SCORE, 0);
                int pending = prefs.getInt(PREF_QUIZ_PENDING_SCORE, 0);
                if (opt == correctSlot) {
                    score++;
                    pending++;
                }
                prefs.edit()
                    .putInt(PREF_QUIZ_SELECTED, opt)
                    .putInt(PREF_QUIZ_SCORE, score)
                    .putInt(PREF_QUIZ_PENDING_SCORE, pending)
                    .apply();
                updateAllWidgets(context);
            }
        } else if (ACTION_NEXT_QUIZ.equals(action)) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            int quizIdx = prefs.getInt(PREF_QUIZ_INDEX, 0);
            prefs.edit()
                .putInt(PREF_QUIZ_INDEX, quizIdx + 1)
                .putInt(PREF_QUIZ_SELECTED, -1)
                .apply();
            updateAllWidgets(context);
        } else if (ACTION_TOGGLE_RECALL.equals(action)) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean currentMasked = prefs.getBoolean(PREF_RECALL_MASKED, false);
            prefs.edit().putBoolean(PREF_RECALL_MASKED, !currentMasked).apply();
            updateAllWidgets(context);
        } else if (ACTION_SPEAK_WORD.equals(action)) {
            final PendingResult pendingResult = goAsync();
            String wordToSpeak = intent.getStringExtra("word_to_speak");
            if (wordToSpeak == null || wordToSpeak.trim().isEmpty()) {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                int index = prefs.getInt(PREF_WORD_INDEX, 0);
                wordToSpeak = getWordCard(prefs, index).word;
            }
            if (wordToSpeak != null) {
                wordToSpeak = wordToSpeak.replace("“", "").replace("”", "").replace("\"", "").trim();
            }
            WidgetTtsManager.speak(context, wordToSpeak, pendingResult);
        } else if (ACTION_SPEAK_SENTENCE.equals(action)) {
            final PendingResult pendingResult = goAsync();
            String sentenceToSpeak = intent.getStringExtra("sentence_to_speak");
            if (sentenceToSpeak == null || sentenceToSpeak.trim().isEmpty()) {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                int index = prefs.getInt(PREF_WORD_INDEX, 0);
                sentenceToSpeak = getWordCard(prefs, index).example;
            }
            if (sentenceToSpeak != null) {
                sentenceToSpeak = sentenceToSpeak.replace("“", "").replace("”", "").replace("\"", "").trim();
            }
            WidgetTtsManager.speak(context, sentenceToSpeak, pendingResult);
        }
    }

    /**
     * Broadcasts an update to all active Singularity home screen widgets.
     */
    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName widget = new ComponentName(context, SingularityWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(widget);
        if (ids != null && ids.length > 0) {
            for (int id : ids) {
                updateWidget(context, manager, id, null);
            }
        }
    }
}
