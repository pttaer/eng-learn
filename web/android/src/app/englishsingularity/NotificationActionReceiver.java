package app.englishsingularity;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

/**
 * Handles silent notification shade actions (e.g. Snooze 1h, Next Word)
 * without launching the full WebView activity or consuming heavy RAM.
 */
public class NotificationActionReceiver extends BroadcastReceiver {
    private static final String TAG = "ES-ACT-RCV";

    public static final String ACTION_SNOOZE_1H = "app.englishsingularity.ACTION_SNOOZE_1H";
    public static final String ACTION_NEXT_WORD = "app.englishsingularity.ACTION_NEXT_WORD";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        String action = intent.getAction();
        Log.d(TAG, "NotificationActionReceiver onReceive: " + action);

        if (ACTION_SNOOZE_1H.equals(action)) {
            handleSnooze(context, intent);
        } else if (ACTION_NEXT_WORD.equals(action)) {
            handleNextWord(context);
        }
    }

    private void handleSnooze(Context context, Intent intent) {
        try {
            // Cancel currently active notification in the shade
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(NotificationHelper.NOTIF_ID);
            }

            String title = intent.getStringExtra("title");
            String body = intent.getStringExtra("body");
            String route = intent.getStringExtra("route");

            if (title == null || title.isEmpty()) title = "SRS Recall (Snoozed)";
            if (body == null || body.isEmpty()) body = "1-hour snooze complete. 2 minutes of recall keeps your streak intact!";

            // Schedule for exactly 1 hour in the future
            long delayMs = 60 * 60 * 1000L;
            NotificationHelper.scheduleNotification(context, title, body, route, delayMs);
            Log.d(TAG, "Snoozed notification for 1 hour");
        } catch (Exception e) {
            Log.e(TAG, "Error handling snooze action", e);
        }
    }

    private void handleNextWord(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(SingularityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            int curIdx = prefs.getInt(SingularityWidgetProvider.PREF_WORD_INDEX, 0);
            prefs.edit().putInt(SingularityWidgetProvider.PREF_WORD_INDEX, curIdx + 1).apply();
            SingularityWidgetProvider.updateAllWidgets(context);
        } catch (Exception e) {
            Log.e(TAG, "Error handling next word action", e);
        }
    }
}

