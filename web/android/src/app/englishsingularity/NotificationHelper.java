package app.englishsingularity;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import java.util.Calendar;

/**
 * 100% Offline Native Notification & Circadian Habit Retention Engine.
 * Implements modern multi-cadence scheduling (Day 0 onboarding, 23.5h habit timing,
 * Ebbinghaus decay, midnight streak rescue, and interactive shade actions).
 * Zero external libraries; uses standard Android platform SDK APIs only.
 */
public class NotificationHelper {
    private static final String TAG = "ES-NOTIF";

    // Versioned channel ID allows upgrading importance from DEFAULT to HIGH on existing devices
    public static final String CHANNEL_ID = "singularity_notifications_v2";
    public static final String CHANNEL_NAME = "English Singularity Reminders";
    public static final int NOTIF_ID = 2001;

    // Distinct request codes to prevent scheduled alarms from overwriting each other
    public static final int ALARM_REQUEST_CODE = 9001;
    public static final int ALARM_REQ_CIRCADIAN_MORNING = 9002;
    public static final int ALARM_REQ_CIRCADIAN_AFTERNOON = 9003;
    public static final int ALARM_REQ_CIRCADIAN_EVENING = 9004;
    public static final int ALARM_REQ_CIRCADIAN_MIDNIGHT = 9005;
    public static final int ALARM_REQ_DAY0_TRIAGE = 9006;
    public static final int ALARM_REQ_DAY0_EVENING = 9007;

    public static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm == null) return;

                // Remove deprecated low/default channel if present
                try {
                    if (nm.getNotificationChannel("singularity_notifications") != null) {
                        nm.deleteNotificationChannel("singularity_notifications");
                    }
                } catch (Exception ignored) {}

                if (nm.getNotificationChannel(CHANNEL_ID) == null) {
                    NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_HIGH
                    );
                    channel.setDescription("Spaced repetition recall, streak protection, and circadian habit alerts");
                    channel.enableLights(true);
                    channel.setLightColor(0xFF6366F1); // Indigo accent
                    channel.enableVibration(true);
                    channel.setVibrationPattern(new long[]{0, 250, 150, 250});
                    channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                    channel.setShowBadge(true);
                    nm.createNotificationChannel(channel);
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed to create notification channel", e);
            }
        }
    }

    /**
     * Immediately posts a system notification with rich interactive actions
     * and deep-link navigation directly to the target view.
     */
    public static void showNotification(Context context, String title, String body, String route) {
        try {
            createChannel(context);
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            // 1. Primary content intent: User taps the main notification body
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            if (route != null && !route.isEmpty()) {
                intent.putExtra("route", route);
                if (route.contains("ielts")) {
                    intent.setAction(SingularityWidgetProvider.ACTION_OPEN_IELTS);
                } else if (route.contains("writing")) {
                    intent.setAction(SingularityWidgetProvider.ACTION_OPEN_WRITING);
                } else if (route.contains("reading")) {
                    intent.setAction(SingularityWidgetProvider.ACTION_OPEN_READING);
                } else if (route.contains("listening")) {
                    intent.setAction(SingularityWidgetProvider.ACTION_OPEN_LISTENING);
                } else if (route.contains("speaking")) {
                    intent.setAction(SingularityWidgetProvider.ACTION_OPEN_SPEAKING);
                } else if (route.contains("vocab") || route.contains("colloc")) {
                    intent.setAction(SingularityWidgetProvider.ACTION_OPEN_VOCAB);
                }
            }

            PendingIntent contentPi = PendingIntent.getActivity(
                context,
                (int) System.currentTimeMillis(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder = new Notification.Builder(context, CHANNEL_ID);
            } else {
                builder = new Notification.Builder(context);
            }

            builder.setContentTitle(title)
                   .setContentText(body)
                   .setSmallIcon(R.mipmap.ic_launcher)
                   .setAutoCancel(true)
                   .setContentIntent(contentPi);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                builder.setStyle(new Notification.BigTextStyle().bigText(body));
            }

            // 2. Interactive Action A: [⚡ Quick 60s Quiz] (Launches straight to rapid quiz)
            Intent quizIntent = new Intent(context, MainActivity.class);
            quizIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            quizIntent.putExtra("route", "#blitz");
            PendingIntent quizPi = PendingIntent.getActivity(
                context,
                1002,
                quizIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // 3. Interactive Action B: [💤 Remind in 1h] (Silent background broadcast snooze)
            Intent snoozeIntent = new Intent(context, NotificationActionReceiver.class);
            snoozeIntent.setAction(NotificationActionReceiver.ACTION_SNOOZE_1H);
            snoozeIntent.putExtra("title", title);
            snoozeIntent.putExtra("body", body);
            snoozeIntent.putExtra("route", route);
            PendingIntent snoozePi = PendingIntent.getBroadcast(
                context,
                1003,
                snoozeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // 4. Interactive Action C: [📖 View Word / Target]
            Intent viewIntent = new Intent(context, MainActivity.class);
            viewIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            viewIntent.putExtra("route", (route != null && !route.isEmpty()) ? route : "#vocab");
            PendingIntent viewPi = PendingIntent.getActivity(
                context,
                1004,
                viewIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
                builder.addAction(new Notification.Action.Builder(0, "⚡ Quick 60s Quiz", quizPi).build());
                builder.addAction(new Notification.Action.Builder(0, "💤 Remind in 1h", snoozePi).build());
                builder.addAction(new Notification.Action.Builder(0, "📖 Open", viewPi).build());
            }

            nm.notify(NOTIF_ID, builder.build());
        } catch (Exception e) {
            Log.e(TAG, "Error displaying notification", e);
        }
    }

    /**
     * Resiliently arms an alarm via AlarmManager, supporting exact alarms on Android 12+
     * when permitted and gracefully falling back to setAndAllowWhileIdle() in Doze mode.
     */
    public static void scheduleNotificationWithCode(
        Context context,
        int requestCode,
        String title,
        String body,
        String route,
        long triggerAtMillis
    ) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, NotificationReceiver.class);
            intent.putExtra("title", title);
            intent.putExtra("body", body);
            intent.putExtra("route", route);

            PendingIntent pi = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            long now = System.currentTimeMillis();
            long safeTriggerAt = Math.max(now + 3000, triggerAtMillis);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (am.canScheduleExactAlarms()) {
                    try {
                        am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, safeTriggerAt, pi);
                        Log.d(TAG, "Armed exact alarm [code " + requestCode + "] for " + (safeTriggerAt - now) / 1000 + "s ahead");
                        return;
                    } catch (SecurityException ignored) {}
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, safeTriggerAt, pi);
            } else {
                am.set(AlarmManager.RTC_WAKEUP, safeTriggerAt, pi);
            }
            Log.d(TAG, "Armed resilient alarm [code " + requestCode + "] for " + (safeTriggerAt - now) / 1000 + "s ahead");
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling alarm with code " + requestCode, e);
        }
    }

    /**
     * Standard backward-compatible delay scheduler.
     */
    public static void scheduleNotification(Context context, String title, String body, String route, long delayMs) {
        scheduleNotificationWithCode(context, ALARM_REQUEST_CODE, title, body, route, System.currentTimeMillis() + delayMs);
    }

    /**
     * Cancels any pending scheduled reminder alarms.
     */
    public static void cancelPendingReminders(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            int[] codes = new int[]{
                ALARM_REQUEST_CODE,
                ALARM_REQ_CIRCADIAN_MORNING,
                ALARM_REQ_CIRCADIAN_AFTERNOON,
                ALARM_REQ_CIRCADIAN_EVENING,
                ALARM_REQ_CIRCADIAN_MIDNIGHT,
                ALARM_REQ_DAY0_TRIAGE,
                ALARM_REQ_DAY0_EVENING
            };

            for (int code : codes) {
                Intent intent = new Intent(context, NotificationReceiver.class);
                PendingIntent pi = PendingIntent.getBroadcast(
                    context,
                    code,
                    intent,
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
                );
                if (pi != null) {
                    am.cancel(pi);
                    pi.cancel();
                }
            }
        } catch (Exception ignored) {}
    }

    /**
     * Schedules the intelligent multi-stage circadian habit retention schedule:
     * - Day 0 Onboarding: +2h (Activation triage) and +6h (Evening leisure reset)
     * - Morning Priming: 07:30 (Espresso Vocabulary / Day Intent)
     * - Midday Reset: 12:30 (60s speed drill / Lunch brain booster)
     * - Evening Streak Rescue: 20:30 (Loss Aversion - "Save your streak")
     * - Midnight Emergency: 22:30 (T-90m final call before reset)
     */
    public static void scheduleCircadianCadence(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(SingularityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            String locale = prefs.getString("app_locale", "en");
            boolean isVi = "vi".equalsIgnoreCase(locale);
            int streak = prefs.getInt(SingularityWidgetProvider.PREF_STREAK, 1);
            long now = System.currentTimeMillis();

            long firstLaunchTime = prefs.getLong("first_launch_time", 0);
            if (firstLaunchTime == 0) {
                firstLaunchTime = now;
                prefs.edit().putLong("first_launch_time", firstLaunchTime).apply();
            }

            boolean isDayZero = (now - firstLaunchTime) < (24 * 60 * 60 * 1000L);

            // Day 0 Onboarding Triage (+2 hours after initial download/first exit)
            if (isDayZero) {
                long day0TriageTime = now + (2 * 60 * 60 * 1000L);
                String d0Title = isVi ? "⚡ 2 phút kích hoạt phản xạ!" : "⚡ 2-Minute Habit Kickstarter!";
                String d0Body = isVi ? "Chỉ cần 60 giây ôn nhanh 1 cụm từ C2 để khởi động hành trình học tập."
                                     : "Just 60 seconds to master 1 sharp C2 collocation today. Tap to try!";
                scheduleNotificationWithCode(context, ALARM_REQ_DAY0_TRIAGE, d0Title, d0Body, "#collocations", day0TriageTime);
            }

            // Circadian Milestone 1: Morning Espresso Vocabulary (07:30 AM)
            Calendar morningCal = Calendar.getInstance();
            morningCal.set(Calendar.HOUR_OF_DAY, 7);
            morningCal.set(Calendar.MINUTE, 30);
            morningCal.set(Calendar.SECOND, 0);
            if (morningCal.getTimeInMillis() <= now) {
                morningCal.add(Calendar.DAY_OF_YEAR, 1);
            }
            String mornTitle = isVi ? "☀️ Cà phê sáng cùng 5 từ vựng C2" : "☀️ Morning Espresso Vocabulary";
            String mornBody = isVi ? "Kích hoạt não bộ trước khi bận rộn. 5 từ vựng đắt giá trong 2 phút."
                                   : "Prime your brain before the rush. 5 high-yield words in 2 minutes.";
            scheduleNotificationWithCode(context, ALARM_REQ_CIRCADIAN_MORNING, mornTitle, mornBody, "#collocations", morningCal.getTimeInMillis());

            // Circadian Milestone 2: Midday Lunch Reset (12:30 PM)
            Calendar lunchCal = Calendar.getInstance();
            lunchCal.set(Calendar.HOUR_OF_DAY, 12);
            lunchCal.set(Calendar.MINUTE, 30);
            lunchCal.set(Calendar.SECOND, 0);
            if (lunchCal.getTimeInMillis() <= now) {
                lunchCal.add(Calendar.DAY_OF_YEAR, 1);
            }
            String lunchTitle = isVi ? "🍱 Đổi gió giờ trưa với 3 từ mới" : "🍱 Quick Lunchtime Brain Reset";
            String lunchBody = isVi ? "Vừa ăn trưa vừa lướt nhẹ 3 cụm từ hay. Biến thời gian rảnh thành tiến bộ!"
                                    : "Give your screen time a purposeful twist. 3 rapid-fire collocations while you eat.";
            scheduleNotificationWithCode(context, ALARM_REQ_CIRCADIAN_AFTERNOON, lunchTitle, lunchBody, "#collocations", lunchCal.getTimeInMillis());

            // Circadian Milestone 3: Evening Streak Rescue (20:30 PM / 8:30 PM)
            Calendar eveningCal = Calendar.getInstance();
            eveningCal.set(Calendar.HOUR_OF_DAY, 20);
            eveningCal.set(Calendar.MINUTE, 30);
            eveningCal.set(Calendar.SECOND, 0);
            if (eveningCal.getTimeInMillis() <= now) {
                eveningCal.add(Calendar.DAY_OF_YEAR, 1);
            }
            String eveTitle = isVi ? ("🔥 Đừng để mất chuỗi " + streak + " ngày!") : ("🔥 Don’t lose your " + streak + "-day streak!");
            String eveBody = isVi ? "Sắp qua ngày mới! Chỉ 1 phút ôn nhanh để giữ vững chuỗi học của bạn."
                                  : "Midnight is coming. 1 quick quiz saves your progress and keeps your flame alive.";
            scheduleNotificationWithCode(context, ALARM_REQ_CIRCADIAN_EVENING, eveTitle, eveBody, "#habits", eveningCal.getTimeInMillis());

            // Circadian Milestone 4: Midnight Emergency T-90m (22:30 PM / 10:30 PM)
            Calendar midnightCal = Calendar.getInstance();
            midnightCal.set(Calendar.HOUR_OF_DAY, 22);
            midnightCal.set(Calendar.MINUTE, 30);
            midnightCal.set(Calendar.SECOND, 0);
            if (midnightCal.getTimeInMillis() <= now) {
                midnightCal.add(Calendar.DAY_OF_YEAR, 1);
            }
            String midTitle = isVi ? ("⏳ Còn 90 phút: Cứu chuỗi " + streak + " ngày!") : ("⏳ 90 mins left: Save your " + streak + "-day streak!");
            String midBody = isVi ? "Đồng hồ đang đếm ngược! Hoàn thành 1 bài ngắn trước nửa đêm để giữ kỷ lục."
                                  : "Your streak resets at midnight. Tap now for a 60s drill to keep it safe!";
            scheduleNotificationWithCode(context, ALARM_REQ_CIRCADIAN_MIDNIGHT, midTitle, midBody, "#habits", midnightCal.getTimeInMillis());

            Log.d(TAG, "Successfully armed circadian cadence (Morning, Lunch, Evening, Midnight, Day0)");
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule circadian cadence", e);
        }
    }

    /**
     * Schedules an exit inactivity reminder and ensures circadian cadence is armed.
     */
    public static void scheduleInactivityReminder(Context context) {
        try {
            // First arm the full circadian cadence
            scheduleCircadianCadence(context);

            SharedPreferences prefs = context.getSharedPreferences(SingularityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            long lastJs = prefs.getLong("last_js_scheduled_reminder", 0);
            if (System.currentTimeMillis() - lastJs < 10000) {
                Log.d(TAG, "Inactivity reminder already scheduled by JS exit hook, skipping fallback override.");
                return;
            }

            String locale = prefs.getString("app_locale", "en");
            boolean isVi = "vi".equalsIgnoreCase(locale);
            int streak = prefs.getInt(SingularityWidgetProvider.PREF_STREAK, 1);

            String title;
            String body;
            String route = "#collocations";
            int pick = (int) (System.currentTimeMillis() % 4);

            if (isVi) {
                if (streak > 1) {
                    switch (pick) {
                        case 0:
                            title = "Streak Protection: 🔥 Giữ trọn chuỗi " + streak + " ngày!";
                            body = "Đừng để ngọn lửa học tập bị tắt. 3 phút ôn tập hôm nay để bảo vệ chuỗi ngày rực rỡ!";
                            break;
                        case 1:
                            title = "Khiên bảo vệ (" + streak + " Ngày): 🛡️ Kích hoạt ngay";
                            body = "Đừng đánh mất chuỗi " + streak + " ngày rực rỡ! Dành 3 phút ôn luyện để giữ đà.";
                            break;
                        case 2:
                            title = "Kiên trì phi thường: 👑 Top 5% (" + streak + " ngày)!";
                            body = "Bạn thuộc nhóm giữ chuỗi bền bỉ nhất. Hoàn thành 1 bài tập trước nửa đêm nhé!";
                            break;
                        default:
                            title = "Đồng hồ đếm ngược: ⏳ Giữ chuỗi " + streak + " ngày!";
                            body = "Chỉ còn vài tiếng nữa là hết ngày! Bảo vệ kỷ lục học tập của bạn nào!";
                            break;
                    }
                } else {
                    switch (pick) {
                        case 0:
                            title = "Trí nhớ Ebbinghaus: 🧠 90% từ vựng sẽ phai sau 48h!";
                            body = "2 phút ôn nhanh các thẻ nhớ spaced repetition để khắc sâu vào trí nhớ dài hạn.";
                            break;
                        case 1:
                            title = "Cà phê cùng tiếng Anh: ☕ 3 phút mỗi ngày";
                            body = "Nạp 1 cụm từ C2 mỗi ngày để phản xạ tự nhiên như người bản xứ!";
                            break;
                        case 2:
                            title = "Luyện viết Franklin: ✍️ Nâng band Task 2";
                            body = "Chép và phân tích 1 câu mẫu tu từ Band 8.0 để nâng tầm bài viết!";
                            route = "ielts.html#writing";
                            break;
                        default:
                            title = "Luyện nói 4-3-2: 🎙️ Tự tin Speaking";
                            body = "Giám khảo AI đã sẵn sàng. 4 phút luyện nói để xóa tan ngập ngừng hôm nay!";
                            route = "ielts.html#speaking";
                            break;
                    }
                }
            } else {
                if (streak > 1) {
                    switch (pick) {
                        case 0:
                            title = "Streak Protection: 🔥 Defend your " + streak + "-day streak!";
                            body = "Don't let today break your streak. 1 quick 3-minute session keeps the fire blazing!";
                            break;
                        case 1:
                            title = "Streak Shield (" + streak + " Days): 🛡️ Activated";
                            body = "Don't break your " + streak + "-day streak. Spend 3 quick minutes to secure momentum!";
                            break;
                        case 2:
                            title = "Legendary Grit (" + streak + " Days): 👑 Top 5%!";
                            body = "You're in the top 5% keeping an unbroken chain. Keep the fire burning today!";
                            break;
                        default:
                            title = "Clock is ticking: ⏳ Save your " + streak + "-day streak!";
                            body = "Keep the chain unbroken before midnight. Your future fluent self will thank you!";
                            break;
                    }
                } else {
                    switch (pick) {
                        case 0:
                            title = "Ebbinghaus Recall: 🧠 90% of memory fades in 48h!";
                            body = "2 minutes of spaced repetition recall locks your vocabulary into permanent memory.";
                            break;
                        case 1:
                            title = "Coffee Break English: ☕ 3-Minute Micro-Drill";
                            body = "Micro-learning compounds fast. Pick up 1 sharp C2 expression today!";
                            break;
                        case 2:
                            title = "Franklin Copywork: ✍️ Elevate Writing";
                            body = "Reconstruct 1 rhetorical model sentence today to elevate essay variety!";
                            route = "ielts.html#writing";
                            break;
                        default:
                            title = "Speaking 4-3-2: 🎙️ AI Fluency Drill";
                            body = "Your AI examiner is ready. 4 minutes of speech delivery eliminates hesitation!";
                            route = "ielts.html#speaking";
                            break;
                    }
                }
            }

            // Schedule standard inactivity fallback (4 hours after exit)
            scheduleNotificationWithCode(context, ALARM_REQUEST_CODE, title, body, route, System.currentTimeMillis() + (4 * 60 * 60 * 1000L));
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule inactivity reminder", e);
        }
    }
}
