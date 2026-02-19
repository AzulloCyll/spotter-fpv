import React, { useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Spot } from '../../data/mockSpots';
import { OFM_TILE_URL, WEATHER_API_WIND_URL, WEATHER_API_RAIN_URL } from '../../constants/mapStyles';

export interface LeafletMapRef {
    animateToByBounds: (sw: { lat: number, lng: number }, ne: { lat: number, lng: number }) => void;
    animateTo: (lat: number, lng: number, zoom?: number) => void;
}

interface LeafletMapProps {
    initialRegion: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    spots: Spot[];
    activeStyleId: string;
    showOFM: boolean;
    showRain: boolean;
    showWind: boolean;
    isDark: boolean;
    onMarkerPress: (spot: Spot) => void;
    onMapMove?: (center: { lat: number; lng: number }, zoom: number) => void;
}

export const LeafletMap = forwardRef<LeafletMapRef, LeafletMapProps>(({
    initialRegion,
    spots,
    activeStyleId,
    showOFM,
    showRain,
    showWind,
    isDark,
    onMarkerPress,
    onMapMove
}, ref) => {
    const webViewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
        animateToByBounds: (sw: { lat: number, lng: number }, ne: { lat: number, lng: number }) => {
            const js = `if (window.map) map.fitBounds([[${sw.lat}, ${sw.lng}], [${ne.lat}, ${ne.lng}]]);`;
            webViewRef.current?.injectJavaScript(js);
        },
        animateTo: (lat: number, lng: number, zoom?: number) => {
            const js = `if (window.map) map.setView([${lat}, ${lng}], ${zoom || 15});`;
            webViewRef.current?.injectJavaScript(js);
        }
    }));

    const leafletHtml = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Leaflet Map</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/lucide@latest"></script>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; background: ${isDark ? '#111827' : '#f3f4f6'}; }
        #map { height: 100vh; width: 100vw; }
        .leaflet-tile-container img { filter: brightness(1); will-change: transform; }
        .leaflet-pane.leaflet-windPane-pane { mix-blend-mode: multiply; }
        .leaflet-pane.leaflet-windPane-pane img { filter: contrast(2) saturate(3) !important; }
        .leaflet-pane.leaflet-rainPane-pane { mix-blend-mode: multiply; }
        .leaflet-pane.leaflet-rainPane-pane img { filter: contrast(2) saturate(3) !important; }
        .leaflet-tile { outline: 1px solid transparent; }
        .leaflet-container { background: ${isDark ? '#111827' : '#f3f4f6'} !important; }
        .custom-marker {
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; border-style: solid;
          background: ${isDark ? '#1e293b' : '#ffffff'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .custom-marker i { display: flex; align-items: center; justify-content: center; }
      </style>
    </head>
    <body class="${isDark ? 'dark-mode' : ''}">
      <div id="map"></div>
      <script>
        // Log proxy for debugging
        (function() {
          var oldLog = console.log;
          console.log = function(message) {
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', payload: String(message) }));
            } catch(e) {}
            oldLog.apply(console, arguments);
          };
          window.onerror = function(msg, url, line) {
            console.log("JS Error: " + msg + " at line " + line);
          };
        })();

        var map = L.map('map', {
          zoomControl: false, attributionControl: false,
          zoomSnap: 1, zoomDelta: 1, fadeAnimation: false,
          markerZoomAnimation: true, inertia: true
        }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], 13);

        window.map = map;

        // Custom panes for weather overlays – z-index above default overlayPane (400)
        map.createPane('rainPane');
        map.getPane('rainPane').style.zIndex = 640;
        map.getPane('rainPane').style.pointerEvents = 'none';
        map.createPane('windPane');
        map.getPane('windPane').style.zIndex = 650;
        map.getPane('windPane').style.pointerEvents = 'none';

        var tileOptions = {
          keepBuffer: 4, updateWhenZooming: true, updateWhenIdle: false,
          noWrap: false, bounds: [[-90, -180], [90, 180]]
        };


        var baseLayers = {
          'standard': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', tileOptions),
          'dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', tileOptions),
          'satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', tileOptions),
          'hybrid': L.layerGroup([
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', tileOptions),
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', tileOptions)
          ])
        };

        var currentStyleId = '${activeStyleId}';
        var currentBaseLayer = baseLayers[currentStyleId] || baseLayers['standard'];
        currentBaseLayer.addTo(map);

        var overlays = {
          ofm: L.tileLayer('${OFM_TILE_URL}', { opacity: 0.8, zIndex: 10, ...tileOptions }),
          rain: L.tileLayer('${WEATHER_API_RAIN_URL}', { opacity: 0.6, pane: 'rainPane', ...tileOptions }),
          wind: L.tileLayer('${WEATHER_API_WIND_URL}', { opacity: 1.0, pane: 'windPane', ...tileOptions })
        };


        var markers = {};

        function getMarkerConfig(type) {
          var config = { icon: 'map-pin', color: '#1e40af' };
          switch(type) {
            case 'bando': config = { icon: 'alert-triangle', color: '#ef4444' }; break;
            case 'nature': config = { icon: 'tree-pine', color: '#22c55e' }; break;
            case 'park': config = { icon: 'flag', color: '#f59e0b' }; break;
            case 'urban': config = { icon: 'building-2', color: '#8b5cf6' }; break;
          }
          return config;
        }

        function updateMarkers(spots) {
          Object.values(markers).forEach(m => map.removeLayer(m));
          markers = {};
          spots.forEach(spot => {
            var config = getMarkerConfig(spot.type);
            var size = 32;
            var icon = L.divIcon({
              className: 'custom-div-icon',
              html: \`<div class="custom-marker" style="width: \${size}px; height: \${size}px; border-width: 2px; border-color: \${config.color}; color: \${config.color};">
                        <i data-lucide="\${config.icon}" style="width: 18px; height: 18px;"></i>
                      </div>\`,
              iconSize: [size, size],
              iconAnchor: [size/2, size/2]
            });

            var marker = L.marker([spot.coordinates.latitude, spot.coordinates.longitude], { icon: icon })
              .addTo(map)
              .on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'MARKER_PRESS',
                  payload: spot
                }));
              });
            markers[spot.id] = marker;
          });
          if (window.lucide) lucide.createIcons();
        }

        function updateLayers(activeStyleId, showOFM, showRain, showWind) {
          if (activeStyleId !== currentStyleId) {
            map.removeLayer(currentBaseLayer);
            currentStyleId = activeStyleId;
            currentBaseLayer = baseLayers[activeStyleId] || baseLayers['standard'];
            currentBaseLayer.addTo(map);
          }
          if (showOFM) { if (!map.hasLayer(overlays.ofm)) overlays.ofm.addTo(map); }
          else { if (map.hasLayer(overlays.ofm)) map.removeLayer(overlays.ofm); }
          if (showRain) { if (!map.hasLayer(overlays.rain)) overlays.rain.addTo(map); }
          else { if (map.hasLayer(overlays.rain)) map.removeLayer(overlays.rain); }
          if (showWind) { if (!map.hasLayer(overlays.wind)) overlays.wind.addTo(map); }
          else { if (map.hasLayer(overlays.wind)) map.removeLayer(overlays.wind); }
        }


        map.on('moveend', function() {
          var center = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_MOVE',
            payload: {
              center: { lat: center.lat, lng: center.lng },
              zoom: map.getZoom()
            }
          }));
        });
        window.rnUpdateMarkers = updateMarkers;
        window.rnUpdateLayers = updateLayers;
      </script>
    </body>
    </html>
  `, [isDark, initialRegion.latitude, initialRegion.longitude, showRain, OFM_TILE_URL, WEATHER_API_WIND_URL, WEATHER_API_RAIN_URL]);

    const syncAll = () => {
        const js = `
            if (window.rnUpdateMarkers) window.rnUpdateMarkers(${JSON.stringify(spots)});
            if (window.rnUpdateLayers) window.rnUpdateLayers('${activeStyleId}', ${showOFM}, ${showRain}, ${showWind});
        `;
        webViewRef.current?.injectJavaScript(js);
    };

    useEffect(() => {
        const js = `
            if (window.rnUpdateLayers) window.rnUpdateLayers('${activeStyleId}', ${showOFM}, ${showRain}, ${showWind});
            document.body.className = '${isDark ? 'dark-mode' : ''}';
            document.body.style.background = '${isDark ? '#111827' : '#f3f4f6'}';
        `;
        webViewRef.current?.injectJavaScript(js);
    }, [activeStyleId, showOFM, showRain, showWind, isDark]);

    useEffect(() => {
        const js = `if (window.rnUpdateMarkers) window.rnUpdateMarkers(${JSON.stringify(spots)});`;
        webViewRef.current?.injectJavaScript(js);
    }, [spots]);

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const { type, payload } = JSON.parse(event.nativeEvent.data);
            if (type === 'MARKER_PRESS') onMarkerPress(payload);
            else if (type === 'MAP_MOVE' && onMapMove) onMapMove(payload.center, payload.zoom);
            else if (type === 'CONSOLE_LOG') console.log('[WebView]', payload);
        } catch (e) { }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: leafletHtml, baseUrl: 'https://openflightmaps.org' }}
                onMessage={handleMessage}
                scrollEnabled={false}
                style={styles.webview}
                onLoadEnd={syncAll}
                renderLoading={() => <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f3f4f6' }} />}
                startInLoadingState={true}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    webview: { backgroundColor: 'transparent' }
});
