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

    public static final String ACTION_NEXT_WORD = "app.englishsingularity.ACTION_NEXT_WORD";
    public static final String ACTION_SPEAK_WORD = "app.englishsingularity.ACTION_SPEAK_WORD";
    public static final String ACTION_SPEAK_SENTENCE = "app.englishsingularity.ACTION_SPEAK_SENTENCE";
    public static final String ACTION_TOGGLE_RECALL = "app.englishsingularity.ACTION_TOGGLE_RECALL";
    public static final String ACTION_SELECT_TAB = "app.englishsingularity.ACTION_SELECT_TAB";
    public static final String ACTION_OPEN_VOCAB = "app.englishsingularity.ACTION_OPEN_VOCAB";
    public static final String ACTION_OPEN_IELTS = "app.englishsingularity.ACTION_OPEN_IELTS";
    public static final String ACTION_OPEN_READING = "app.englishsingularity.ACTION_OPEN_READING";
    public static final String ACTION_OPEN_WRITING = "app.englishsingularity.ACTION_OPEN_WRITING";
    public static final String ACTION_OPEN_LISTENING = "app.englishsingularity.ACTION_OPEN_LISTENING";
    public static final String ACTION_OPEN_SPEAKING = "app.englishsingularity.ACTION_OPEN_SPEAKING";

    // Curated offline C2 / Academic IELTS pool for standalone offline widget rotation
    private static final String[][] OFFLINE_WORDS = {
        {
            "Ephemeral",
            "/ɪˈfem.ər.əl/ • adj",
            "Lasting for only a very short time; transient or fleeting.",
            "“Fame in the digital era is intensely ephemeral, vanishing as swiftly as it emerges.”",
            "✦ Collocations: ephemeral nature, ephemeral pleasure  •  Synonyms: transient, fleeting"
        },
        {
            "Ubiquitous",
            "/juːˈbɪk.wɪ.təs/ • adj",
            "Present, appearing, or found everywhere simultaneously.",
            "“Mobile devices have become ubiquitous in daily modern life.”",
            "✦ Collocations: ubiquitous presence, ubiquitous influence  •  Synonyms: omnipresent, pervasive"
        },
        {
            "Paradigm",
            "/ˈpær.ə.daɪm/ • n",
            "A typical example, pattern, model, or conceptual framework.",
            "“The shift marked an entirely new paradigm in economic thought.”",
            "✦ Collocations: paradigm shift, dominant paradigm  •  Synonyms: archetype, model, standard"
        },
        {
            "Salient",
            "/ˈseɪ.li.ənt/ • adj",
            "Most noticeable, prominent, or of pivotal importance.",
            "“She highlighted the salient features of the academic proposal.”",
            "✦ Collocations: salient point, salient feature  •  Synonyms: prominent, conspicuous, pivotal"
        },
        {
            "Mitigate",
            "/ˈmɪt.ɪ.ɡeɪt/ • v",
            "Make less severe, serious, painful, or damaging.",
            "“Stringent safeguards mitigate systemic failure risk.”",
            "✦ Collocations: mitigate risk, mitigate impact  •  Synonyms: alleviate, attenuate, reduce"
        },
        {
            "Juxtapose",
            "/ˌdʒʌk.stəˈpəʊz/ • v",
            "Place close together for contrasting effect.",
            "“The essay juxtaposes urban decay and modern high-tech.”",
            "✦ Collocations: juxtapose with, starkly juxtaposed  •  Synonyms: compare, contrast, collate"
        },
        {
            "Plausible",
            "/ˈplɔː.zə.bəl/ • adj",
            "Reasonable or probable; having an appearance of truth.",
            "“The investigator offered a plausible explanation for the anomaly.”",
            "✦ Collocations: plausible explanation, highly plausible  •  Synonyms: credible, believable, feasible"
        },
        {
            "Exacerbate",
            "/ɪɡˈzæs.ə.beɪt/ • v",
            "Make a problem, bad situation, or negative feeling worse.",
            "“Budget cutbacks will exacerbate the existing labor shortage.”",
            "✦ Collocations: exacerbate tension, exacerbate crisis  •  Synonyms: aggravate, worsen, inflame"
        },
        {
            "Proponent",
            "/prəˈpəʊ.nənt/ • n",
            "A person who advocates a theory, proposal, or course of action.",
            "“He was an articulate proponent of sustainable clean energy.”",
            "✦ Collocations: leading proponent, vocal proponent  •  Synonyms: advocate, champion, supporter"
        },
        {
            "Comprehensive",
            "/ˌkɒm.prɪˈhen.sɪv/ • adj",
            "Including or dealing with all or nearly all aspects of something.",
            "“The research paper provides a comprehensive review of the empirical data.”",
            "✦ Collocations: comprehensive review, comprehensive guide  •  Synonyms: exhaustive, thorough, complete"
        }
    };

    /**
     * Internal singleton TTS engine for instant home-screen word pronunciation.
     */
    static class WidgetTtsManager {
        private static TextToSpeech tts;
        private static String pendingWord;
        private static boolean isInitializing = false;

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

            // Safety timeout: ensure pendingResult is finished within 5s even if engine hangs
            if (pendingResult != null) {
                new Handler(Looper.getMainLooper()).postDelayed(safeFinish, 5000);
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
                                if (pendingWord != null) {
                                    tts.speak(pendingWord, TextToSpeech.QUEUE_FLUSH, null, "singularity_widget_audio");
                                    pendingWord = null;
                                }
                            }
                            safeFinish.run();
                        }
                    });
                }
            } else {
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "singularity_widget_audio");
                safeFinish.run();
            }
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
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

        int safeIdx = Math.abs(index) % OFFLINE_WORDS.length;
        String word = prefs.getString(PREF_WORD, OFFLINE_WORDS[safeIdx][0]);
        String phonetic = prefs.getString(PREF_PHONETIC, OFFLINE_WORDS[safeIdx][1]);
        String meaning = prefs.getString(PREF_MEANING, OFFLINE_WORDS[safeIdx][2]);
        String example = prefs.getString(PREF_EXAMPLE, OFFLINE_WORDS[safeIdx][3]);
        String tags = prefs.getString(PREF_TAGS, OFFLINE_WORDS[safeIdx][4]);

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

        // Streak pill (compact: "🔥 12d", standard: "🔥 12-Day Streak")
        String streakText;
        try {
            int formatRes = isCompact ? R.string.widget_streak_compact_format : R.string.widget_streak_format;
            streakText = context.getString(formatRes, streak);
        } catch (Exception e) {
            streakText = isCompact ? ("🔥 " + streak + "d") : ("🔥 " + streak + (streak == 1 ? " Day Streak" : "-Day Streak"));
        }
        views.setTextViewText(R.id.widget_streak, streakText);

        // Intent: Tap next word (↻)
        Intent nextIntent = new Intent(context, SingularityWidgetProvider.class);
        nextIntent.setAction(ACTION_NEXT_WORD);
        PendingIntent nextPending = PendingIntent.getBroadcast(
            context, 100, nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_action_next, nextPending);

        // Intent: Open main app on card tap
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent mainPending = PendingIntent.getActivity(
            context, 200, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_card_content, mainPending);
        views.setOnClickPendingIntent(R.id.widget_root, mainPending);

        if (layoutId == R.layout.widget_singularity_expanded) {
            // ==========================================
            // TABBED EXPANDED WIDGET SETUP (ViewFlipper)
            // ==========================================
            int activeTab = prefs.getInt(PREF_ACTIVE_TAB, 0);
            if (activeTab < 0 || activeTab > 2) activeTab = 0;

            // Switch ViewFlipper active displayed child
            views.setInt(R.id.widget_flipper, "setDisplayedChild", activeTab);

            // Tab styles
            int activeBg = R.drawable.widget_tab_active_bg;
            int inactiveBg = R.drawable.widget_tab_inactive_bg;
            int activeColor = 0xFFA5B4FC;
            int inactiveColor = 0xFF64748B;

            views.setInt(R.id.widget_tab_word, "setBackgroundResource", activeTab == 0 ? activeBg : inactiveBg);
            views.setTextColor(R.id.widget_tab_word, activeTab == 0 ? activeColor : inactiveColor);

            views.setInt(R.id.widget_tab_quests, "setBackgroundResource", activeTab == 1 ? activeBg : inactiveBg);
            views.setTextColor(R.id.widget_tab_quests, activeTab == 1 ? activeColor : inactiveColor);

            views.setInt(R.id.widget_tab_pillars, "setBackgroundResource", activeTab == 2 ? activeBg : inactiveBg);
            views.setTextColor(R.id.widget_tab_pillars, activeTab == 2 ? activeColor : inactiveColor);

            // Tab Click PendingIntents
            Intent tab0 = new Intent(context, SingularityWidgetProvider.class);
            tab0.setAction(ACTION_SELECT_TAB);
            tab0.putExtra("tab_index", 0);
            views.setOnClickPendingIntent(R.id.widget_tab_word, PendingIntent.getBroadcast(
                context, 1000, tab0, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent tab1 = new Intent(context, SingularityWidgetProvider.class);
            tab1.setAction(ACTION_SELECT_TAB);
            tab1.putExtra("tab_index", 1);
            views.setOnClickPendingIntent(R.id.widget_tab_quests, PendingIntent.getBroadcast(
                context, 1001, tab1, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent tab2 = new Intent(context, SingularityWidgetProvider.class);
            tab2.setAction(ACTION_SELECT_TAB);
            tab2.putExtra("tab_index", 2);
            views.setOnClickPendingIntent(R.id.widget_tab_pillars, PendingIntent.getBroadcast(
                context, 1002, tab2, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // --- TAB 1 (Word Card) ---
            views.setTextViewText(R.id.widget_word, word);
            views.setTextViewText(R.id.widget_phonetic, phonetic);

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
            if (hasTags) {
                if (isMasked) {
                    views.setTextViewText(R.id.widget_tags, "✦ [Active Recall Mode] Tap '👁 Reveal' to uncover meaning & collocations");
                } else {
                    views.setTextViewText(R.id.widget_tags, tags);
                }
            }

            // --- TAB 2 (Quests) ---
            int level = 4;
            int completedQuests = 2;
            boolean isVietnamese = progress != null && (progress.contains("Cấp") || progress.contains("Nhiệm vụ"));
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
            if (completedQuests < 0) completedQuests = 0;
            if (completedQuests > 3) completedQuests = 3;

            int questPct = Math.round((completedQuests / 3.0f) * 100);
            String bannerTitle = streakText + " • " + (isVietnamese ? ("Cấp " + level + " Khám phá") : ("Lv." + level + " Explorer"));
            views.setTextViewText(R.id.widget_quest_banner, bannerTitle);
            views.setProgressBar(R.id.widget_quest_progress_bar, 100, questPct, false);
            views.setTextViewText(R.id.widget_quest_progress_text, completedQuests + "/3 " + (isVietnamese ? "Hoàn thành (" : "Completed (") + questPct + "%)");

            // Quest Checklist Item 1
            boolean q1Done = completedQuests >= 1;
            views.setTextViewText(R.id.widget_quest_title_1, (q1Done ? "✔  " : "○  ") + "15 SRS Cards Reviewed");
            views.setTextColor(R.id.widget_quest_title_1, q1Done ? 0xFFA5B4FC : 0xFFF3F4F6);
            views.setTextViewText(R.id.widget_quest_status_1, q1Done ? "Done (+50 XP)" : "Start →");
            views.setTextColor(R.id.widget_quest_status_1, q1Done ? 0xFF64748B : 0xFFA5B4FC);

            // Quest Checklist Item 2
            boolean q2Done = completedQuests >= 2;
            views.setTextViewText(R.id.widget_quest_title_2, (q2Done ? "✔  " : "○  ") + "1 Franklin Rhetorical Copywork");
            views.setTextColor(R.id.widget_quest_title_2, q2Done ? 0xFFA5B4FC : 0xFFF3F4F6);
            views.setTextViewText(R.id.widget_quest_status_2, q2Done ? "Done (+50 XP)" : "Start →");
            views.setTextColor(R.id.widget_quest_status_2, q2Done ? 0xFF64748B : 0xFFA5B4FC);

            // Quest Checklist Item 3
            boolean q3Done = completedQuests >= 3;
            views.setTextViewText(R.id.widget_quest_title_3, (q3Done ? "✔  " : "○  ") + "1 Examiner Speaking Simulation");
            views.setTextColor(R.id.widget_quest_title_3, q3Done ? 0xFFA5B4FC : 0xFFF3F4F6);
            views.setTextViewText(R.id.widget_quest_status_3, q3Done ? "Done (+50 XP)" : "Start →");
            views.setTextColor(R.id.widget_quest_status_3, q3Done ? 0xFF64748B : 0xFFA5B4FC);

            // Quest Item Launchers
            Intent quest1Intent = new Intent(context, MainActivity.class);
            quest1Intent.setAction(ACTION_OPEN_VOCAB);
            quest1Intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_quest_item_1, PendingIntent.getActivity(
                context, 420, quest1Intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent quest2Intent = new Intent(context, MainActivity.class);
            quest2Intent.setAction(ACTION_OPEN_WRITING);
            quest2Intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_quest_item_2, PendingIntent.getActivity(
                context, 421, quest2Intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent quest3Intent = new Intent(context, MainActivity.class);
            quest3Intent.setAction(ACTION_OPEN_SPEAKING);
            quest3Intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_quest_item_3, PendingIntent.getActivity(
                context, 422, quest3Intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // --- TAB 3 (4 Pillars Studios) ---
            Intent readingIntent = new Intent(context, MainActivity.class);
            readingIntent.setAction(ACTION_OPEN_READING);
            readingIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_tile_reading, PendingIntent.getActivity(
                context, 410, readingIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent writingIntent = new Intent(context, MainActivity.class);
            writingIntent.setAction(ACTION_OPEN_WRITING);
            writingIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_tile_writing, PendingIntent.getActivity(
                context, 411, writingIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent listeningIntent = new Intent(context, MainActivity.class);
            listeningIntent.setAction(ACTION_OPEN_LISTENING);
            listeningIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_tile_listening, PendingIntent.getActivity(
                context, 412, listeningIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent speakingIntent = new Intent(context, MainActivity.class);
            speakingIntent.setAction(ACTION_OPEN_SPEAKING);
            speakingIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_tile_speaking, PendingIntent.getActivity(
                context, 413, speakingIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent suiteIntent = new Intent(context, MainActivity.class);
            suiteIntent.setAction(ACTION_OPEN_IELTS);
            suiteIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_btn_launch_ielts, PendingIntent.getActivity(
                context, 414, suiteIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            // Universal bottom deep links
            Intent vocabIntent = new Intent(context, MainActivity.class);
            vocabIntent.setAction(ACTION_OPEN_VOCAB);
            vocabIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_btn_vocab, PendingIntent.getActivity(
                context, 300, vocabIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            Intent ieltsIntent = new Intent(context, MainActivity.class);
            ieltsIntent.setAction(ACTION_OPEN_IELTS);
            ieltsIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            views.setOnClickPendingIntent(R.id.widget_btn_ielts, PendingIntent.getActivity(
                context, 400, ieltsIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

        } else {
            // ==========================================
            // SMALL & MEDIUM WIDGET SETUP
            // ==========================================
            views.setTextViewText(R.id.widget_word, word);
            views.setTextViewText(R.id.widget_phonetic, phonetic);
            views.setTextViewText(R.id.widget_meaning, meaning);

            // Single audio button
            Intent audioIntent = new Intent(context, SingularityWidgetProvider.class);
            audioIntent.setAction(ACTION_SPEAK_WORD);
            audioIntent.putExtra("word_to_speak", word);
            views.setOnClickPendingIntent(R.id.widget_btn_audio, PendingIntent.getBroadcast(
                context, 500, audioIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

            if (layoutId != R.layout.widget_singularity_small) {
                views.setTextViewText(R.id.widget_progress, progress);
                boolean hasExample = example != null && !example.trim().isEmpty();
                views.setViewVisibility(R.id.widget_example, hasExample ? View.VISIBLE : View.GONE);
                if (hasExample) {
                    views.setTextViewText(R.id.widget_example, example);
                }

                Intent vocabIntent = new Intent(context, MainActivity.class);
                vocabIntent.setAction(ACTION_OPEN_VOCAB);
                vocabIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                views.setOnClickPendingIntent(R.id.widget_btn_vocab, PendingIntent.getActivity(
                    context, 300, vocabIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));

                Intent ieltsIntent = new Intent(context, MainActivity.class);
                ieltsIntent.setAction(ACTION_OPEN_IELTS);
                ieltsIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                views.setOnClickPendingIntent(R.id.widget_btn_ielts, PendingIntent.getActivity(
                    context, 400, ieltsIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
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
                .remove(PREF_WORD)
                .remove(PREF_PHONETIC)
                .remove(PREF_MEANING)
                .remove(PREF_EXAMPLE)
                .remove(PREF_TAGS)
                .apply();

            updateAllWidgets(context);
        } else if (ACTION_SELECT_TAB.equals(action)) {
            int tabIndex = intent.getIntExtra("tab_index", 0);
            if (tabIndex < 0 || tabIndex > 2) tabIndex = 0;
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putInt(PREF_ACTIVE_TAB, tabIndex).apply();
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
                int safeIdx = Math.abs(index) % OFFLINE_WORDS.length;
                wordToSpeak = prefs.getString(PREF_WORD, OFFLINE_WORDS[safeIdx][0]);
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
                int safeIdx = Math.abs(index) % OFFLINE_WORDS.length;
                sentenceToSpeak = prefs.getString(PREF_EXAMPLE, OFFLINE_WORDS[safeIdx][3]);
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
