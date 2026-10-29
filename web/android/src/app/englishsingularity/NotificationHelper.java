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

/**
 * 100% Offline Native Notification & Inactivity Alarm Manager.
 * Zero external libraries; uses standard Android platform SDK APIs only.
 */
public class NotificationHelper {
    private static final String TAG = "ES-NOTIF";
    public static final String CHANNEL_ID = "singularity_notifications";
    public static final String CHANNEL_NAME = "English Singularity Reminders";
    public static final int NOTIF_ID = 2001;
    public static final int ALARM_REQUEST_CODE = 9001;

    public static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                    NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_HIGH
                    );
                    channel.setDescription("Spaced repetition recall, streak protection and daily quest notifications");
                    channel.enableLights(true);
                    channel.enableVibration(true);
                    nm.createNotificationChannel(channel);
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed to create notification channel", e);
            }
        }
    }

    /**
     * Immediately posts a system notification with deep-link navigation back into the app.
     */
    public static void showNotification(Context context, String title, String body, String route) {
        try {
            createChannel(context);
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

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

            PendingIntent pi = PendingIntent.getActivity(
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
                   .setContentIntent(pi);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                builder.setStyle(new Notification.BigTextStyle().bigText(body));
            }

            nm.notify(NOTIF_ID, builder.build());
        } catch (Exception e) {
            Log.e(TAG, "Error displaying notification", e);
        }
    }

    /**
     * Schedules a future notification via AlarmManager.
     */
    public static void scheduleNotification(Context context, String title, String body, String route, long delayMs) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, NotificationReceiver.class);
            intent.putExtra("title", title);
            intent.putExtra("body", body);
            intent.putExtra("route", route);

            PendingIntent pi = PendingIntent.getBroadcast(
                context,
                ALARM_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            long triggerAt = System.currentTimeMillis() + Math.max(5000, delayMs);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
            } else {
                am.set(AlarmManager.RTC_WAKEUP, triggerAt, pi);
            }
            Log.d(TAG, "Scheduled reminder for " + (delayMs / 1000) + "s in future");
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling alarm", e);
        }
    }

    /**
     * Cancels any pending scheduled reminder alarms.
     */
    public static void cancelPendingReminders(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, NotificationReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                context,
                ALARM_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
            );
            if (pi != null) {
                am.cancel(pi);
                pi.cancel();
            }
        } catch (Exception ignored) {}
    }

    /**
     * Schedules a reminder when the user exits the app, tailored to their saved locale setting.
     */
    public static void scheduleInactivityReminder(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(SingularityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            long lastJs = prefs.getLong("last_js_scheduled_reminder", 0);
            if (System.currentTimeMillis() - lastJs < 10000) {
                Log.d(TAG, "Inactivity reminder already scheduled by JS exit hook, skipping fallback override.");
                return;
            }

            String locale = prefs.getString("app_locale", "en");
            boolean isVi = "vi".equalsIgnoreCase(locale);
            int streak = prefs.getInt(SingularityWidgetProvider.PREF_STREAK, 1);
            String progress = prefs.getString(SingularityWidgetProvider.PREF_PROGRESS, "");

            String title;
            String body;
            String route = "#collocations";
            int pick = (int) (System.currentTimeMillis() % 4);

            if (isVi) {
                if (streak > 1) {
                    switch (pick) {
                        case 0:
                            title = "Streak Protection Alert: 🔥 Giữ trọn chuỗi " + streak + " ngày!";
                            body = "Đừng để ngọn lửa học tập bị tắt. Chỉ 3 phút ôn tập hôm nay để bảo vệ chuỗi ngày rực rỡ!";
                            break;
                        case 1:
                            title = "Streak Protection Alert (" + streak + " Ngày): 🛡️ Kích hoạt Khiên bảo vệ chuỗi";
                            body = "Đừng đánh mất chuỗi " + streak + " ngày rực rỡ! Dành 3 phút ôn luyện để giữ vững đà tiến bộ.";
                            break;
                        case 2:
                            title = "Streak Protection Alert: 👑 Kiên trì phi thường (" + streak + " ngày)!";
                            body = "Bạn thuộc top 5% người học giữ chuỗi bền bỉ nhất. Hoàn thành 1 bài tập trước nửa đêm nhé!";
                            break;
                        default:
                            title = "Streak Protection Alert: ⏳ Đồng hồ đang đếm ngược!";
                            body = "Chỉ còn vài tiếng nữa là hết ngày! Bảo vệ kỷ lục " + streak + " ngày học của bạn nào!";
                            break;
                    }
                } else {
                    switch (pick) {
                        case 0:
                            title = "Time to learn today: 🧠 90% từ vựng sẽ phai nhạt sau 48h!";
                            body = "2 phút ôn nhanh các thẻ nhớ spaced repetition để khắc sâu vào trí nhớ dài hạn.";
                            break;
                        case 1:
                            title = "Time to learn today: ☕ 3 phút cà phê cùng tiếng Anh";
                            body = "Nạp 1 cụm từ C2 mỗi ngày để phản xạ tự nhiên như người bản xứ!";
                            break;
                        case 2:
                            title = "Time to learn today: ✍️ Phòng luyện viết Franklin";
                            body = "Chép và phân tích 1 câu mẫu tu từ Band 8.0 để nâng tầm bài viết!";
                            route = "ielts.html#writing";
                            break;
                        default:
                            title = "Time to learn today: 🎙️ Luyện nói 4-3-2";
                            body = "Giám khảo AI đã sẵn sàng. 4 phút luyện nói để xóa tan ngập ngừng hôm nay!";
                            route = "ielts.html#speaking";
                            break;
                    }
                }
            } else {
                if (streak > 1) {
                    switch (pick) {
                        case 0:
                            title = "Streak Protection Alert: 🔥 Defend your " + streak + "-day streak!";
                            body = "Don't let today break your streak. 1 quick 3-minute session keeps the fire blazing!";
                            break;
                        case 1:
                            title = "Streak Protection Alert (" + streak + " Days): 🛡️ Streak Shield Activated";
                            body = "Don't break your " + streak + "-day streak. Spend 3 quick minutes to secure your momentum!";
                            break;
                        case 2:
                            title = "Streak Protection Alert (" + streak + " Days): 👑 Legendary Grit!";
                            body = "You're in the top 5% keeping an unbroken " + streak + "-day chain. Keep the fire burning!";
                            break;
                        default:
                            title = "Streak Protection Alert (" + streak + " Days): ⏳ Clock is ticking!";
                            body = "Keep the chain unbroken before midnight. Your future fluent self will thank you!";
                            break;
                    }
                } else {
                    switch (pick) {
                        case 0:
                            title = "SRS Review Due: 🧠 90% of memory fades in 48h!";
                            body = "2 minutes of spaced repetition recall locks your vocabulary into permanent memory.";
                            break;
                        case 1:
                            title = "Time to learn today: ☕ 3-Minute Coffee Break English";
                            body = "Micro-learning compounds fast. Pick up 1 sharp C2 expression today!";
                            break;
                        case 2:
                            title = "Time to learn today: ✍️ Franklin Copywork Studio";
                            body = "Reconstruct 1 rhetorical model sentence today to elevate your essay variety!";
                            route = "ielts.html#writing";
                            break;
                        default:
                            title = "Time to learn today: 🎙️ Speaking 4-3-2 Drill";
                            body = "Your AI examiner is ready. 4 minutes of speech delivery eliminates hesitation!";
                            route = "ielts.html#speaking";
                            break;
                    }
                }
            }

            // Schedule for 4 hours after exit
            scheduleNotification(context, title, body, route, 4 * 60 * 60 * 1000);
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule inactivity reminder", e);
        }
    }
}

