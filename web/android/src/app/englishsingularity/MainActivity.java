package app.englishsingularity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;

/**
 * Hosts the offline phone build (index.html, ielts.html) bundled in assets/.
 * Everything runs locally: no network permission, storage stays in this app's WebView data.
 */
public class MainActivity extends Activity {
    private static final String TAG = "ES-WEB";
    private static final int FILE_REQUEST = 1001;
    private static final int PERMISSION_REQUEST_NOTIFICATIONS = 102;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    public class WidgetBridge {
        @JavascriptInterface
        public void updateWidgetData(String jsonStr) {
            try {
                JSONObject obj = new JSONObject(jsonStr);
                SharedPreferences prefs = getSharedPreferences(SingularityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = prefs.edit();

                if (obj.has("streak")) {
                    editor.putInt(SingularityWidgetProvider.PREF_STREAK, obj.optInt("streak", 1));
                }
                if (obj.has("progress")) {
                    editor.putString(SingularityWidgetProvider.PREF_PROGRESS, obj.optString("progress"));
                }
                if (obj.has("notification_hook")) {
                    editor.putString("notification_hook", obj.optString("notification_hook"));
                }
                if (obj.has("notification_tip")) {
                    editor.putString("notification_tip", obj.optString("notification_tip"));
                }
                if (obj.has("locale")) {
                    editor.putString("app_locale", obj.optString("locale", "en"));
                }
                if (obj.has("level")) {
                    editor.putInt(SingularityWidgetProvider.PREF_LEVEL, obj.optInt("level", 1));
                }
                if (obj.has("completed_quests")) {
                    editor.putInt(SingularityWidgetProvider.PREF_COMPLETED_QUESTS, obj.optInt("completed_quests", 0));
                }
                if (obj.has("quests_total")) {
                    editor.putInt(SingularityWidgetProvider.PREF_QUESTS_TOTAL, obj.optInt("quests_total", 3));
                }
                if (obj.has("quests")) {
                    editor.putString(SingularityWidgetProvider.PREF_QUESTS_JSON, obj.getJSONArray("quests").toString());
                }
                if (obj.has("words")) {
                    editor.putString(SingularityWidgetProvider.PREF_CUSTOM_WORDS_JSON, obj.getJSONArray("words").toString());
                }
                if (obj.has("word")) {
                    editor.putString(SingularityWidgetProvider.PREF_WORD, obj.optString("word"));
                    editor.putString(SingularityWidgetProvider.PREF_PHONETIC, obj.optString("phonetic", ""));
                    editor.putString(SingularityWidgetProvider.PREF_MEANING, obj.optString("meaning", ""));
                    editor.putString(SingularityWidgetProvider.PREF_EXAMPLE, obj.optString("example", ""));
                    String tagsVal = obj.optString("tags", "").trim();
                    if (!tagsVal.isEmpty()) {
                        editor.putString(SingularityWidgetProvider.PREF_TAGS, tagsVal);
                    } else {
                        editor.remove(SingularityWidgetProvider.PREF_TAGS);
                    }
                }
                editor.apply();

                SingularityWidgetProvider.updateAllWidgets(MainActivity.this);
            } catch (Exception e) {
                Log.e(TAG, "Error updating widget data from JS", e);
            }
        }

        @JavascriptInterface
        public int consumeWidgetQuizScore() {
            SharedPreferences prefs = getSharedPreferences(SingularityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            int pending = prefs.getInt(SingularityWidgetProvider.PREF_QUIZ_PENDING_SCORE, 0);
            if (pending > 0) {
                prefs.edit().putInt(SingularityWidgetProvider.PREF_QUIZ_PENDING_SCORE, 0).apply();
            }
            return pending;
        }

        @JavascriptInterface
        public void postNotification(String title, String body, String route) {
            NotificationHelper.showNotification(MainActivity.this, title, body, route);
        }

        @JavascriptInterface
        public void scheduleNotification(String title, String body, String route, long delayMs) {
            try {
                getSharedPreferences(SingularityWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .putLong("last_js_scheduled_reminder", System.currentTimeMillis())
                    .apply();
            } catch (Exception ignored) {}
            NotificationHelper.scheduleNotification(MainActivity.this, title, body, route, delayMs);
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    checkAndRequestNotificationPermission();
                }
            });
        }

        @JavascriptInterface
        public boolean hasNotificationPermission() {
            if (Build.VERSION.SDK_INT >= 33) {
                return checkSelfPermission("android.permission.POST_NOTIFICATIONS") == android.content.pm.PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public void openNotificationSettings() {
            try {
                Intent intent = new Intent();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    intent.setAction(android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                    intent.putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, getPackageName());
                } else {
                    intent.setAction(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(Uri.parse("package:" + getPackageName()));
                }
                startActivity(intent);
            } catch (Exception e) {
                Log.e(TAG, "Error opening notification settings", e);
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Debug build only: lets Chrome DevTools attach to the WebView for testing
        WebView.setWebContentsDebuggingEnabled(true);

        webView = new WebView(this);
        setContentView(webView);

        // Auto-request POST_NOTIFICATIONS on Android 13+ (API 33+) so notifications are never silently blocked
        checkAndRequestNotificationPermission();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);   // localStorage holds all progress
        settings.setAllowFileAccess(true);

        // Bridge to receive streak & vocabulary telemetry from the web app
        webView.addJavascriptInterface(new WidgetBridge(), "AndroidWidgetBridge");

        // Keep every navigation inside the WebView (asset pages link to each other)
        webView.setWebViewClient(new WebViewClient());

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                String line = m.message() + " (" + m.sourceId() + ":" + m.lineNumber() + ")";
                if (m.messageLevel() == ConsoleMessage.MessageLevel.ERROR) {
                    Log.e(TAG, line);
                } else {
                    Log.d(TAG, line);
                }
                return true;
            }

            // Needed for the profile import <input type="file">; a WebView does nothing without it
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), FILE_REQUEST);
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        // Determine initial URL based on deep-link action or route extra
        String initialUrl = resolveInitialUrl(getIntent());
        webView.loadUrl(initialUrl);
    }

    private String resolveInitialUrl(Intent intent) {
        boolean isIeltsPackage = getPackageName().contains("ielts");
        String defaultPage = isIeltsPackage ? "ielts.html" : "index.html";
        if (intent == null) return "file:///android_asset/" + defaultPage;
        String routeExtra = intent.getStringExtra("route");
        if (routeExtra != null && !routeExtra.isEmpty()) {
            if (routeExtra.contains("ielts.html")) {
                return "file:///android_asset/ielts.html" + (routeExtra.contains("#") ? routeExtra.substring(routeExtra.indexOf("#")) : "");
            } else {
                return "file:///android_asset/index.html" + (routeExtra.startsWith("#") ? routeExtra : ("#" + routeExtra));
            }
        }
        String action = intent.getAction();
        if (action != null) {
            if (SingularityWidgetProvider.ACTION_OPEN_VOCAB.equals(action)) {
                return "file:///android_asset/index.html#vocab";
            } else if (SingularityWidgetProvider.ACTION_OPEN_IELTS.equals(action)) {
                return "file:///android_asset/ielts.html";
            } else if (SingularityWidgetProvider.ACTION_OPEN_HABITS.equals(action)) {
                return "file:///android_asset/index.html#habits";
            } else if (SingularityWidgetProvider.ACTION_OPEN_QUIZ.equals(action)) {
                return "file:///android_asset/index.html#blitz";
            } else if (SingularityWidgetProvider.ACTION_OPEN_READING.equals(action)) {
                return "file:///android_asset/index.html#reading";
            } else if (SingularityWidgetProvider.ACTION_OPEN_WRITING.equals(action)) {
                return "file:///android_asset/index.html#writing";
            } else if (SingularityWidgetProvider.ACTION_OPEN_LISTENING.equals(action)) {
                return "file:///android_asset/index.html#listening";
            } else if (SingularityWidgetProvider.ACTION_OPEN_SPEAKING.equals(action)) {
                return "file:///android_asset/index.html#speaking";
            } else if (SingularityWidgetProvider.ACTION_OPEN_TREE.equals(action)) {
                return "file:///android_asset/index.html#tree";
            }
        }
        return "file:///android_asset/" + defaultPage;
    }

    private void navigateToTarget(String targetPage, String targetHash) {
        if (webView == null) return;
        String currentUrl = webView.getUrl();
        final String safeHash = targetHash != null ? targetHash : "";
        if (currentUrl != null && currentUrl.contains(targetPage)) {
            // Already inside the requested HTML bundle; execute instant client-side route transition
            final String js = "try { " +
                "var t = '" + safeHash.replace("'", "\\'") + "'; " +
                "if (window.location.hash === t) { window.dispatchEvent(new Event('hashchange')); } " +
                "else { window.location.hash = t; } " +
                "} catch (e) { window.location.hash = '" + safeHash.replace("'", "\\'") + "'; }";
            webView.post(new Runnable() {
                @Override
                public void run() {
                    webView.evaluateJavascript(js, null);
                }
            });
        } else {
            // Different HTML file (e.g. index.html <-> ielts.html); perform full load
            webView.loadUrl("file:///android_asset/" + targetPage + safeHash);
        }
    }

    private void handleNavigationIntent(Intent intent) {
        if (intent == null || webView == null) return;
        String routeExtra = intent.getStringExtra("route");
        if (routeExtra != null && !routeExtra.isEmpty()) {
            if (routeExtra.contains("ielts.html")) {
                String hash = routeExtra.contains("#") ? routeExtra.substring(routeExtra.indexOf("#")) : "";
                navigateToTarget("ielts.html", hash);
            } else {
                String hash = routeExtra.startsWith("#") ? routeExtra : ("#" + routeExtra);
                navigateToTarget("index.html", hash);
            }
            return;
        }

        String action = intent.getAction();
        if (action != null) {
            if (SingularityWidgetProvider.ACTION_OPEN_VOCAB.equals(action)) {
                navigateToTarget("index.html", "#vocab");
            } else if (SingularityWidgetProvider.ACTION_OPEN_IELTS.equals(action)) {
                navigateToTarget("ielts.html", "");
            } else if (SingularityWidgetProvider.ACTION_OPEN_HABITS.equals(action)) {
                navigateToTarget("index.html", "#habits");
            } else if (SingularityWidgetProvider.ACTION_OPEN_QUIZ.equals(action)) {
                navigateToTarget("index.html", "#blitz");
            } else if (SingularityWidgetProvider.ACTION_OPEN_READING.equals(action)) {
                navigateToTarget("index.html", "#reading");
            } else if (SingularityWidgetProvider.ACTION_OPEN_WRITING.equals(action)) {
                navigateToTarget("index.html", "#writing");
            } else if (SingularityWidgetProvider.ACTION_OPEN_LISTENING.equals(action)) {
                navigateToTarget("index.html", "#listening");
            } else if (SingularityWidgetProvider.ACTION_OPEN_SPEAKING.equals(action)) {
                navigateToTarget("index.html", "#speaking");
            } else if (SingularityWidgetProvider.ACTION_OPEN_TREE.equals(action)) {
                navigateToTarget("index.html", "#tree");
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleNavigationIntent(intent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_REQUEST && filePathCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getDataString() != null) {
                result = new Uri[] { Uri.parse(data.getDataString()) };
            }
            filePathCallback.onReceiveValue(result);
            filePathCallback = null;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        // Step back through in-app history first; leave the app only from the first screen
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private void checkAndRequestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33) {
            if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, PERMISSION_REQUEST_NOTIFICATIONS);
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_NOTIFICATIONS) {
            if (grantResults.length > 0 && grantResults[0] == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                NotificationHelper.createChannel(this);
                NotificationHelper.scheduleCircadianCadence(this);
                Log.d(TAG, "POST_NOTIFICATIONS granted by user");
            } else {
                Log.d(TAG, "POST_NOTIFICATIONS denied by user");
            }
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
        NotificationHelper.scheduleInactivityReminder(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
        NotificationHelper.cancelPendingReminders(this);
        NotificationHelper.scheduleCircadianCadence(this);
    }
}
