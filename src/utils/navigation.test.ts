/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { appleMapsRouteUrl, googleMapsRouteUrl } from './navigation';

describe('route URLs', () => {
  test('Google Maps directions put the spot in destination', () => {
    assert.equal(
      googleMapsRouteUrl(52.2297, 21.0122),
      'https://www.google.com/maps/dir/?api=1&destination=52.2297,21.0122',
    );
  });

  test('Apple Maps directions put the spot in daddr', () => {
    assert.equal(
      appleMapsRouteUrl(52.2297, 21.0122),
      'http://maps.apple.com/?daddr=52.2297,21.0122',
    );
  });

  test('negative coordinates are kept as they are', () => {
    assert.equal(
      googleMapsRouteUrl(-33.8688, -70.5),
      'https://www.google.com/maps/dir/?api=1&destination=-33.8688,-70.5',
    );
  });
});
