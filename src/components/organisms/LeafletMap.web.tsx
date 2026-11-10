import React, { useEffect, useRef, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { isFromMapFrame, type MapCommand } from '../../utils/mapMessages';
import {
  useLeafletMapBridge,
  type LeafletMapProps,
  type LeafletMapRef,
} from './useLeafletMapBridge';

export type { LeafletMapProps, LeafletMapRef } from './useLeafletMapBridge';

// Web map: the same Leaflet page as native (leafletMapHtml.ts), in an iframe.
// react-native-webview has no web build, so this replaces the WebView.
//
// The iframe is sandboxed with scripts only (no allow-same-origin): the page and the
// third-party scripts it loads run in an opaque origin and cannot touch the app's
// storage or DOM. Both directions go through postMessage and are checked:
// - the page posts only to this app's origin and takes commands only from its parent;
// - the app takes messages only from this iframe's window (isFromMapFrame) and
//   validates them like the native bridge (parseMapMessage).
const parentOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;

export const LeafletMap = forwardRef<LeafletMapRef, LeafletMapProps>((props, ref) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The sandboxed page's origin is opaque ("null"), which postMessage can only target
  // with "*"; the message goes to this iframe's window and nowhere else.
  const send = (command: MapCommand) => {
    frameRef.current?.contentWindow?.postMessage(command, '*');
  };

  const { html, onPageLoad, handleMessage } = useLeafletMapBridge(props, ref, send, parentOrigin);
  const { isDark } = props;

  // The listener is added once; it always calls the latest handler (which sees the
  // current spots and callbacks).
  const handleMessageRef = useRef(handleMessage);
  handleMessageRef.current = handleMessage;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isFromMapFrame(event, frameRef.current?.contentWindow)) return;
      handleMessageRef.current(event.data);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f3f4f6' }]}>
      <iframe
        ref={frameRef}
        title="Mapa spotów"
        srcDoc={html}
        sandbox="allow-scripts"
        onLoad={onPageLoad}
        style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
});
