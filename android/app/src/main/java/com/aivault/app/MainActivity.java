package com.aivault.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.content.ComponentName;
import android.provider.Settings;
import android.text.TextUtils;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    private BroadcastReceiver notificationReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        notificationReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String packageName = intent.getStringExtra("package");
                String title = intent.getStringExtra("title");
                String text = intent.getStringExtra("text");

                JSObject data = new JSObject();
                data.put("app", packageName);
                data.put("sender", title);
                data.put("content", text);

                bridge.triggerWindowJsEvent("onNotificationCaptured", data.toString());
            }
        };

        IntentFilter filter = new IntentFilter("com.aivault.app.NOTIFICATION_LISTENER");
        registerReceiver(notificationReceiver, filter, Context.RECEIVER_EXPORTED);
    }

    // Custom Plugin inside MainActivity to handle permission
    @CapacitorPlugin(name = "NotificationPermission")
    public class NotificationPermissionPlugin extends Plugin {
        @PluginMethod
        public void checkPermission(PluginCall call) {
            JSObject ret = new JSObject();
            ret.put("enabled", isNotificationServiceEnabled());
            call.resolve(ret);
        }

        @PluginMethod
        public void requestPermission(PluginCall call) {
            if (!isNotificationServiceEnabled()) {
                Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
                startActivity(intent);
            }
            call.resolve();
        }

        private boolean isNotificationServiceEnabled() {
            String pkgName = getPackageName();
            final String flat = Settings.Secure.getString(getContentResolver(), "enabled_notification_listeners");
            if (!TextUtils.isEmpty(flat)) {
                final String[] names = flat.split(":");
                for (String name : names) {
                    final ComponentName cn = ComponentName.unflattenFromString(name);
                    if (cn != null && TextUtils.equals(pkgName, cn.getPackageName())) {
                        return true;
                    }
                }
            }
            return false;
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (notificationReceiver != null) {
            unregisterReceiver(notificationReceiver);
        }
    }
}
