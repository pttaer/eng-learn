package app.englishsingularity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Reschedules offline notification alarms when the device reboots,
 * the app is updated, or system time/timezone shifts.
 * Essential for 100% offline habit retention without server push.
 */
public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "ES-BOOT-RCV";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        Log.d(TAG, "Received system broadcast: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action)) {
            
            try {
                // Ensure notification channels are initialized
                NotificationHelper.createChannel(context);

                // Reschedule upcoming circadian habit alarms
                NotificationHelper.scheduleCircadianCadence(context);
                Log.d(TAG, "Successfully re-armed offline notification schedule after " + action);
            } catch (Exception e) {
                Log.e(TAG, "Error re-arming notification schedule after reboot", e);
            }
        }
    }
}

