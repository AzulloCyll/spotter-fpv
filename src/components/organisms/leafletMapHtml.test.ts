/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildLeafletHtml } from './leafletMapHtml';

const base = {
  isDark: false,
  center: { latitude: 52.2, longitude: 21 },
  ofmTileUrl: 'https://ofm.example/{z}/{x}/{y}.png',
  windTileUrl: 'https://wind.example/{z}/{x}/{y}.png?appid=k',
  rainIndexUrl: 'https://rain.example/index.json',
};

test('native page has no parent origin and keeps the pinned scripts with SRI', () => {
  const html = buildLeafletHtml(base);
  assert.match(html, /var PARENT_ORIGIN = null;/);
  assert.match(html, /leaflet@1\.9\.4\/dist\/leaflet\.js" integrity="sha384-/);
  assert.match(html, /lucide@1\.70\.0\/dist\/umd\/lucide\.min\.js" integrity="sha384-/);
  assert.match(html, /\.setView\(\[52\.2, 21\], 13\)/);
});

test('rain radar tiles stop at zoom 7 and are scaled up beyond it', () => {
  const html = buildLeafletHtml(base);
  assert.match(html, /pane: 'rainPane', \.\.\.tileOptions, maxNativeZoom: 7 \}/);
});

test('web page names the parent origin it talks to', () => {
  const html = buildLeafletHtml({ ...base, parentOrigin: 'http://localhost:8086' });
  assert.match(html, /var PARENT_ORIGIN = "http:\/\/localhost:8086";/);
});

test('a value cannot close the script tag', () => {
  const html = buildLeafletHtml({ ...base, ofmTileUrl: 'https://x/</script><script>alert(1)//' });
  assert.equal(html.includes('</script><script>alert(1)'), false);
  assert.match(html, /\\u003c\/script>/);
});
