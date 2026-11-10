// The Leaflet page behind the map on every platform: native renders it in
// react-native-webview (LeafletMap.tsx), web in a sandboxed iframe (LeafletMap.web.tsx).
//
// The page talks to the app in two directions:
// - page -> app: MARKER_PRESS and MAP_MOVE (see utils/mapMessages.ts), sent through
//   window.ReactNativeWebView on native or window.parent.postMessage on web;
// - app -> page: MapCommand objects, handed to window.mapCommand (native injects a call)
//   or posted into the iframe (web; only messages from the parent window are taken).

export interface LeafletHtmlOptions {
  isDark: boolean;
  center: { latitude: number; longitude: number };
  ofmTileUrl: string;
  windTileUrl: string;
  rainIndexUrl: string;
  /**
   * Web only: origin of the app page that hosts the iframe. The map posts its messages
   * to this origin only and accepts commands only from it. Omitted on native.
   */
  parentOrigin?: string;
}

// A value written into the page's <script> as a JS literal. JSON is valid JS; "<" is
// escaped so no value can close the script tag.
const js = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export function buildLeafletHtml({
  isDark,
  center,
  ofmTileUrl,
  windTileUrl,
  rainIndexUrl,
  parentOrigin,
}: LeafletHtmlOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Leaflet Map</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <!-- Pinned versions with Subresource Integrity (sha384 of the exact files). Changing a
           version means recomputing its hash: curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A -->
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H" crossorigin="anonymous" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH" crossorigin="anonymous"></script>
      <script src="https://unpkg.com/lucide@1.70.0/dist/umd/lucide.min.js" integrity="sha384-64z4N640tVzhAicQVGzxE/48VNN9yS53U5kv9UH8ca7xGU4KSJ9zz8nD4C2BEerP" crossorigin="anonymous"></script>
      <style>
        html, body { height: 100%; }
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
          cursor: pointer;
        }
        .custom-marker i { display: flex; align-items: center; justify-content: center; }
      </style>
    </head>
    <body class="${isDark ? 'dark-mode' : ''}">
      <div id="map"></div>
      <script>
        var PARENT_ORIGIN = ${js(parentOrigin ?? null)};

        function sendToApp(message) {
          var data = JSON.stringify(message);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(data);
          } else if (PARENT_ORIGIN && window.parent !== window) {
            window.parent.postMessage(data, PARENT_ORIGIN);
          }
        }

        var map = L.map('map', {
          zoomControl: false, attributionControl: false,
          zoomSnap: 1, zoomDelta: 1, fadeAnimation: false,
          markerZoomAnimation: true, inertia: true
        }).setView([${js(center.latitude)}, ${js(center.longitude)}], 13);

        window.map = map;

        // The pilot's own gestures (pan, wheel/double-tap/pinch zoom) mark the map as touched.
        window.mapTouched = false;
        function markTouched() { window.mapTouched = true; }
        map.on('dragstart', markTouched);
        var mapContainer = map.getContainer();
        mapContainer.addEventListener('wheel', markTouched, { passive: true });
        mapContainer.addEventListener('dblclick', markTouched);
        var lastTouchStart = 0;
        mapContainer.addEventListener('touchstart', function(e) {
          var now = Date.now();
          // Pinch (more than one finger) or double-tap (two touches in quick succession).
          if ((e.touches && e.touches.length > 1) || now - lastTouchStart < 350) markTouched();
          lastTouchStart = now;
        }, { passive: true });

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

        // No base layer until the app sends the first 'layers' command after load.
        var currentStyleId = null;
        var currentBaseLayer = null;

        var overlays = {
          ofm: L.tileLayer(${js(ofmTileUrl)}, { opacity: 0.8, zIndex: 10, ...tileOptions }),
          // Loaded asynchronously: RainViewer gives the path to the newest radar
          // frame only in its index response.
          rain: null,
          wind: L.tileLayer(${js(windTileUrl)}, { opacity: 1.0, pane: 'windPane', ...tileOptions })
        };
        var wantRain = false;

        // Fetched on every switch-on of the rain layer, so the pilot always gets the newest frame.
        function loadRain() {
          fetch(${js(rainIndexUrl)})
            .then(function(res) { return res.json(); })
            .then(function(data) {
              var frames = (data.radar && data.radar.past) || [];
              if (!frames.length) return;
              var newest = frames[frames.length - 1];
              if (overlays.rain && map.hasLayer(overlays.rain)) map.removeLayer(overlays.rain);
              // RainViewer serves radar tiles only up to zoom 7 and answers deeper zooms
              // with a "Zoom Level Not Supported" image; Leaflet scales the zoom-7 tiles
              // up instead (blurrier when zoomed in, but no error tiles).
              overlays.rain = L.tileLayer(
                data.host + newest.path + '/256/{z}/{x}/{y}/2/1_1.png',
                { opacity: 0.6, pane: 'rainPane', ...tileOptions, maxNativeZoom: 7 }
              );
              if (wantRain) overlays.rain.addTo(map);
            })
            .catch(function() { /* a missing radar must not break the map */ });
        }


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

        // markerData: [{ id, lat, lng, type }]. Only the type picks the icon and colour
        // (from the fixed list above); the id travels back in MARKER_PRESS.
        function updateMarkers(markerData) {
          Object.values(markers).forEach(function(m) { map.removeLayer(m); });
          markers = {};
          markerData.forEach(function(spot) {
            var config = getMarkerConfig(spot.type);
            var size = 32;
            var icon = L.divIcon({
              className: 'custom-div-icon',
              html: '<div class="custom-marker" style="width: ' + size + 'px; height: ' + size + 'px; border-width: 2px; border-color: ' + config.color + '; color: ' + config.color + ';">' +
                      '<i data-lucide="' + config.icon + '" style="width: 18px; height: 18px;"></i>' +
                    '</div>',
              iconSize: [size, size],
              iconAnchor: [size/2, size/2]
            });

            var marker = L.marker([spot.lat, spot.lng], { icon: icon })
              .addTo(map)
              .on('click', function() {
                sendToApp({ type: 'MARKER_PRESS', id: spot.id });
              });
            markers[spot.id] = marker;
          });
          if (window.lucide) lucide.createIcons();
        }

        function updateLayers(activeStyleId, showOFM, showRain, showWind) {
          if (activeStyleId !== currentStyleId) {
            if (currentBaseLayer) map.removeLayer(currentBaseLayer);
            currentStyleId = activeStyleId;
            currentBaseLayer = baseLayers[activeStyleId] || baseLayers['standard'];
            currentBaseLayer.addTo(map);
          }
          if (showOFM) { if (!map.hasLayer(overlays.ofm)) overlays.ofm.addTo(map); }
          else { if (map.hasLayer(overlays.ofm)) map.removeLayer(overlays.ofm); }
          if (showRain && !wantRain) loadRain();
          wantRain = showRain;
          if (overlays.rain) {
            if (showRain) { if (!map.hasLayer(overlays.rain)) overlays.rain.addTo(map); }
            else { if (map.hasLayer(overlays.rain)) map.removeLayer(overlays.rain); }
          }
          if (showWind) { if (!map.hasLayer(overlays.wind)) overlays.wind.addTo(map); }
          else { if (map.hasLayer(overlays.wind)) map.removeLayer(overlays.wind); }
        }

        function isNum(v) { return typeof v === 'number' && isFinite(v); }

        // Commands from the app (see MapCommand in utils/mapMessages.ts).
        function handleCommand(cmd) {
          if (!cmd || typeof cmd !== 'object') return;
          switch (cmd.type) {
            case 'markers':
              if (Array.isArray(cmd.markers)) updateMarkers(cmd.markers);
              break;
            case 'layers':
              updateLayers(String(cmd.styleId), !!cmd.ofm, !!cmd.rain, !!cmd.wind);
              break;
            case 'setView':
              // An explicit move from the app: the location handoff leaves the view alone after it.
              if (isNum(cmd.lat) && isNum(cmd.lng) && isNum(cmd.zoom)) {
                window.mapTouched = true;
                map.setView([cmd.lat, cmd.lng], cmd.zoom);
              }
              break;
            case 'fitBounds':
              if (cmd.sw && cmd.ne && isNum(cmd.sw.lat) && isNum(cmd.sw.lng) && isNum(cmd.ne.lat) && isNum(cmd.ne.lng)) {
                window.mapTouched = true;
                map.fitBounds([[cmd.sw.lat, cmd.sw.lng], [cmd.ne.lat, cmd.ne.lng]]);
              }
              break;
            case 'userTarget':
              // The user's location: applied only while the pilot has not moved the map.
              if (isNum(cmd.lat) && isNum(cmd.lng) && !window.mapTouched) map.setView([cmd.lat, cmd.lng], 13);
              break;
          }
        }
        window.mapCommand = handleCommand;
        window.addEventListener('message', function(e) {
          if (window.parent === window || e.source !== window.parent) return;
          if (!PARENT_ORIGIN || e.origin !== PARENT_ORIGIN) return;
          handleCommand(e.data);
        });


        map.on('moveend', function() {
          var center = map.getCenter();
          sendToApp({
            type: 'MAP_MOVE',
            payload: {
              center: { lat: center.lat, lng: center.lng },
              zoom: map.getZoom()
            }
          });
        });
      </script>
    </body>
    </html>
  `;
}
