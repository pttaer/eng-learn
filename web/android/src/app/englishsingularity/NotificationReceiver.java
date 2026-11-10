package app.englishsingularity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * BroadcastReceiver triggered by AlarmManager to post delayed notifications when app is closed.
 * Automatically chains the next circadian habit event so the app never goes silent forever.
 */
public class NotificationReceiver extends BroadcastReceiver {
    private static final String TAG = "ES-NOTIF-RCV";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        try {
            String title = intent.getStringExtra("title");
            String body = intent.getStringExtra("body");
            String route = intent.getStringExtra("route");

            if (title == null || title.isEmpty()) {
                title = "English Singularity";
            }
            if (body == null || body.isEmpty()) {
                body = "Time for your daily spaced repetition recall session!";
            }

            // 1. Post the notification
            NotificationHelper.showNotification(context, title, body, route);

            // 2. Continuous Habit Loop: Auto-chain the next circadian schedule
            // Ensures the learner is not forgotten if they dismiss or miss this single alert
            NotificationHelper.scheduleCircadianCadence(context);
        } catch (Exception e) {
            Log.e(TAG, "Error in onReceive", e);
        }
    }
}
