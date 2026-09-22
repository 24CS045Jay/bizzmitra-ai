package com.bizzmitra.ai;

import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (bridge != null && bridge.getWebView() != null) {
            // Disable native WebView overscroll dragging and horizontal scroll bar
            bridge.getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
            bridge.getWebView().setHorizontalScrollBarEnabled(false);
        }
    }
}
