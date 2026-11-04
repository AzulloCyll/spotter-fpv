/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  formatPlaceName,
  isValidCoordinate,
  parseStoredPlace,
  resolveWeatherCoords,
  type WeatherPlace,
} from './location';

const KRAKOW: WeatherPlace = { name: 'Kraków, Małopolskie', lat: 50.06, lng: 19.94 };
const GPS = { lat: 52.4, lng: 16.93 };

describe('resolveWeatherCoords', () => {
  test('a saved place wins over GPS', () => {
    assert.deepEqual(resolveWeatherCoords({ savedPlace: KRAKOW, gps: GPS }), {
      source: 'manual',
      name: KRAKOW.name,
      lat: KRAKOW.lat,
      lng: KRAKOW.lng,
    });
  });

  test('a saved place is used when GPS is missing', () => {
    const result = resolveWeatherCoords({ savedPlace: KRAKOW, gps: null, gpsProblem: 'denied' });
    assert.equal(result.source, 'manual');
  });

  test('GPS is used without a saved place', () => {
    assert.deepEqual(resolveWeatherCoords({ savedPlace: null, gps: GPS }), {
      source: 'gps',
      lat: GPS.lat,
      lng: GPS.lng,
    });
  });

  test('without a place and GPS it reports why', () => {
    assert.deepEqual(resolveWeatherCoords({ savedPlace: null, gps: null, gpsProblem: 'denied' }), {
      source: 'none',
      problem: 'denied',
    });
    assert.deepEqual(resolveWeatherCoords({ savedPlace: null, gps: null }), {
      source: 'none',
      problem: 'unavailable',
    });
  });

  test('a saved place with broken coordinates falls back to GPS', () => {
    const broken = { name: 'X', lat: Number.NaN, lng: 10 };
    assert.equal(resolveWeatherCoords({ savedPlace: broken, gps: GPS }).source, 'gps');
  });
});

describe('parseStoredPlace', () => {
  test('reads a stored place', () => {
    assert.deepEqual(parseStoredPlace(JSON.stringify(KRAKOW)), KRAKOW);
  });

  test('nothing stored means no place', () => {
    assert.equal(parseStoredPlace(null), null);
    assert.equal(parseStoredPlace(''), null);
  });

  test('malformed entries mean no place', () => {
    assert.equal(parseStoredPlace('{not json'), null);
    assert.equal(parseStoredPlace('null'), null);
    assert.equal(parseStoredPlace('"Kraków"'), null);
    assert.equal(parseStoredPlace(JSON.stringify({ name: 'A', lat: '50', lng: 19 })), null);
    assert.equal(parseStoredPlace(JSON.stringify({ name: 'A', lat: 95, lng: 19 })), null);
  });

  test('a missing name becomes the coordinates', () => {
    assert.deepEqual(parseStoredPlace(JSON.stringify({ lat: 50.0614, lng: 19.9366 })), {
      name: '50.06, 19.94',
      lat: 50.0614,
      lng: 19.9366,
    });
  });
});

describe('isValidCoordinate', () => {
  test('accepts the range edges and rejects values past them', () => {
    assert.equal(isValidCoordinate(90, 180), true);
    assert.equal(isValidCoordinate(-90, -180), true);
    assert.equal(isValidCoordinate(90.1, 0), false);
    assert.equal(isValidCoordinate(0, -180.1), false);
    assert.equal(isValidCoordinate(Infinity, 0), false);
    assert.equal(isValidCoordinate(undefined, 0), false);
  });
});

describe('formatPlaceName', () => {
  test('joins the city and the region', () => {
    assert.equal(
      formatPlaceName({ city: 'Warszawa', region: 'Mazowieckie' }, 'fallback'),
      'Warszawa, Mazowieckie',
    );
  });

  test('uses the district when there is no city', () => {
    assert.equal(formatPlaceName({ city: null, district: 'Mokotów' }, 'fallback'), 'Mokotów');
  });

  test('falls back when the result has nothing usable', () => {
    assert.equal(formatPlaceName(undefined, 'Moja lokalizacja'), 'Moja lokalizacja');
    assert.equal(
      formatPlaceName({ city: ' ', region: null }, 'Moja lokalizacja'),
      'Moja lokalizacja',
    );
  });
});
