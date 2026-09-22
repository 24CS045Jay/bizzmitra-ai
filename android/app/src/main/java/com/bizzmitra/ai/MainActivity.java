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
            View webView = bridge.getWebView();
            webView.setOverScrollMode(View.OVER_SCROLL_IF_CONTENT_SCROLLS);
            webView.setVerticalScrollBarEnabled(true);
            webView.setHorizontalScrollBarEnabled(false);
            webView.setNestedScrollingEnabled(true);
        }
    }
}
