import React, { useRef, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import type { MapCommand } from '../../utils/mapMessages';
import {
  useLeafletMapBridge,
  type LeafletMapProps,
  type LeafletMapRef,
} from './useLeafletMapBridge';

export type { LeafletMapProps, LeafletMapRef } from './useLeafletMapBridge';

// Native map: the shared Leaflet page (leafletMapHtml.ts) in react-native-webview.
// The web build uses LeafletMap.web.tsx, which renders the same page in an iframe.
export const LeafletMap = forwardRef<LeafletMapRef, LeafletMapProps>((props, ref) => {
  const webViewRef = useRef<WebView>(null);

  // A command is handed to the page's window.mapCommand. JSON is a valid JS literal;
  // if the page is still loading, window.mapCommand is missing and this is a no-op.
  const send = (command: MapCommand) => {
    webViewRef.current?.injectJavaScript(
      `if (window.mapCommand) window.mapCommand(${JSON.stringify(command)}); true;`,
    );
  };

  const { html, onPageLoad, handleMessage } = useLeafletMapBridge(props, ref, send);
  const { isDark } = props;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['https://*']}
        source={{ html, baseUrl: 'https://openflightmaps.org' }}
        onMessage={(event: WebViewMessageEvent) => handleMessage(event.nativeEvent.data)}
        scrollEnabled={false}
        style={styles.webview}
        onLoadEnd={onPageLoad}
        renderLoading={() => (
          <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }} />
        )}
        startInLoadingState
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { backgroundColor: 'transparent' },
});
