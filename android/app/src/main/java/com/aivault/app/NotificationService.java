package com.aivault.app;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import android.content.Intent;
import android.os.Bundle;

public class NotificationService extends NotificationListenerService {
    private static final String TAG = "NotificationService";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        Bundle extras = sbn.getNotification().extras;
        String title = extras.getString("android.title");
        CharSequence text = extras.getCharSequence("android.text");

        Log.d(TAG, "Notification received from: " + packageName);
        Log.d(TAG, "Title: " + title);
        Log.d(TAG, "Text: " + text);

        // Broadcast to MainActivity
        Intent intent = new Intent("com.aivault.app.NOTIFICATION_LISTENER");
        intent.putExtra("package", packageName);
        intent.putExtra("title", title);
        intent.putExtra("text", text != null ? text.toString() : "");
        sendBroadcast(intent);
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Handle notification removal if needed
    }
}
