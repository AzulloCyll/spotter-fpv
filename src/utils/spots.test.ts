/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { mergeSpotsById, normalizeSpotText, parseStoredSpots } from './spots';

const GOOD = {
  id: '1',
  name: 'Hala',
  description: 'Opis',
  type: 'bando',
  difficulty: 'easy',
  coordinates: { latitude: 52.2, longitude: 21 },
  rating: 3,
  images: ['file:///a.jpg'],
};

describe('parseStoredSpots', () => {
  test('null and empty string mean no spots and nothing skipped', () => {
    assert.deepEqual(parseStoredSpots(null), { spots: [], skipped: 0 });
    assert.deepEqual(parseStoredSpots(''), { spots: [], skipped: 0 });
  });

  test('bad JSON is reported as skipped', () => {
    assert.deepEqual(parseStoredSpots('{nope'), { spots: [], skipped: 1 });
  });

  test('JSON that is not an array is reported as skipped', () => {
    assert.deepEqual(parseStoredSpots('{"a":1}'), { spots: [], skipped: 1 });
  });

  test('a good entry passes unchanged', () => {
    const result = parseStoredSpots(JSON.stringify([GOOD]));
    assert.deepEqual(result, { spots: [GOOD], skipped: 0 });
  });

  test('an old entry without rating and images stays, with defaults', () => {
    const { rating: _r, images: _i, ...old } = GOOD;
    const result = parseStoredSpots(JSON.stringify([old]));
    assert.equal(result.skipped, 0);
    assert.equal(result.spots[0].rating, 0);
    assert.deepEqual(result.spots[0].images, []);
  });

  test('an entry without coordinates is skipped, good ones stay', () => {
    const { coordinates: _c, ...broken } = GOOD;
    const result = parseStoredSpots(JSON.stringify([GOOD, broken, { ...GOOD, id: '2' }]));
    assert.equal(result.spots.length, 2);
    assert.equal(result.skipped, 1);
  });

  test('NaN (stored as null), strings and out-of-range coordinates are skipped', () => {
    const bad = [
      { ...GOOD, coordinates: { latitude: null, longitude: 21 } },
      { ...GOOD, coordinates: { latitude: '52', longitude: 21 } },
      { ...GOOD, coordinates: { latitude: 91, longitude: 21 } },
      { ...GOOD, coordinates: { latitude: 52, longitude: -181 } },
    ];
    assert.deepEqual(parseStoredSpots(JSON.stringify(bad)), { spots: [], skipped: 4 });
  });

  test('an unknown type or difficulty is skipped', () => {
    const bad = [
      { ...GOOD, type: 'space' },
      { ...GOOD, difficulty: 'impossible' },
    ];
    assert.deepEqual(parseStoredSpots(JSON.stringify(bad)), { spots: [], skipped: 2 });
  });

  test('non-object entries and missing text are skipped', () => {
    const bad = [null, 5, 'x', { ...GOOD, name: 7 }, { ...GOOD, id: '' }];
    assert.deepEqual(parseStoredSpots(JSON.stringify(bad)), { spots: [], skipped: 5 });
  });

  test('non-string images are dropped, not the whole spot', () => {
    const result = parseStoredSpots(JSON.stringify([{ ...GOOD, images: ['a', 3, null] }]));
    assert.deepEqual(result.spots[0].images, ['a']);
  });
});

describe('mergeSpotsById', () => {
  test('keeps the first occurrence and the order', () => {
    const a = { ...GOOD, id: 'a' } as never;
    const b = { ...GOOD, id: 'b' } as never;
    const a2 = { ...GOOD, id: 'a', name: 'other' } as never;
    assert.deepEqual(mergeSpotsById([a], [b, a2]), [a, b]);
  });
});

describe('normalizeSpotText', () => {
  test('trims and cuts to the limit', () => {
    assert.equal(normalizeSpotText('  abc  ', 60), 'abc');
    assert.equal(normalizeSpotText('abcdef', 3), 'abc');
    assert.equal(normalizeSpotText('   ', 60), '');
  });
});
