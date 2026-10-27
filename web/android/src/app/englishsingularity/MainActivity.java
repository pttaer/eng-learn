package app.englishsingularity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
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
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Debug build only: lets Chrome DevTools attach to the WebView for testing
        WebView.setWebContentsDebuggingEnabled(true);

        webView = new WebView(this);
        setContentView(webView);

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

        // Determine initial URL based on deep-link action
        String initialUrl = "file:///android_asset/index.html";
        Intent intent = getIntent();
        if (intent != null && intent.getAction() != null) {
            if (SingularityWidgetProvider.ACTION_OPEN_VOCAB.equals(intent.getAction())) {
                initialUrl = "file:///android_asset/index.html#vocab";
            } else if (SingularityWidgetProvider.ACTION_OPEN_IELTS.equals(intent.getAction())) {
                initialUrl = "file:///android_asset/ielts.html";
            } else if (SingularityWidgetProvider.ACTION_OPEN_READING.equals(intent.getAction())) {
                initialUrl = "file:///android_asset/index.html#reading";
            } else if (SingularityWidgetProvider.ACTION_OPEN_WRITING.equals(intent.getAction())) {
                initialUrl = "file:///android_asset/index.html#writing";
            } else if (SingularityWidgetProvider.ACTION_OPEN_LISTENING.equals(intent.getAction())) {
                initialUrl = "file:///android_asset/index.html#listening";
            } else if (SingularityWidgetProvider.ACTION_OPEN_SPEAKING.equals(intent.getAction())) {
                initialUrl = "file:///android_asset/index.html#speaking";
            }
        }

        webView.loadUrl(initialUrl);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null && intent.getAction() != null && webView != null) {
            if (SingularityWidgetProvider.ACTION_OPEN_VOCAB.equals(intent.getAction())) {
                webView.loadUrl("file:///android_asset/index.html#vocab");
            } else if (SingularityWidgetProvider.ACTION_OPEN_IELTS.equals(intent.getAction())) {
                webView.loadUrl("file:///android_asset/ielts.html");
            } else if (SingularityWidgetProvider.ACTION_OPEN_READING.equals(intent.getAction())) {
                webView.loadUrl("file:///android_asset/index.html#reading");
            } else if (SingularityWidgetProvider.ACTION_OPEN_WRITING.equals(intent.getAction())) {
                webView.loadUrl("file:///android_asset/index.html#writing");
            } else if (SingularityWidgetProvider.ACTION_OPEN_LISTENING.equals(intent.getAction())) {
                webView.loadUrl("file:///android_asset/index.html#listening");
            } else if (SingularityWidgetProvider.ACTION_OPEN_SPEAKING.equals(intent.getAction())) {
                webView.loadUrl("file:///android_asset/index.html#speaking");
            }
        }
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

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }
}
