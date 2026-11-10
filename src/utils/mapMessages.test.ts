/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isFromMapFrame, parseMapMessage, toMarkerData } from './mapMessages';

test('accepts a marker press with an id', () => {
  assert.deepEqual(parseMapMessage('{"type":"MARKER_PRESS","id":"s1"}'), {
    type: 'MARKER_PRESS',
    id: 's1',
  });
});

test('rejects a marker press without a usable id', () => {
  assert.equal(parseMapMessage('{"type":"MARKER_PRESS"}'), null);
  assert.equal(parseMapMessage('{"type":"MARKER_PRESS","id":""}'), null);
  assert.equal(parseMapMessage('{"type":"MARKER_PRESS","id":5}'), null);
  // A whole spot in the old payload shape is not accepted.
  assert.equal(parseMapMessage('{"type":"MARKER_PRESS","payload":{"id":"s1"}}'), null);
});

test('accepts a map move with finite numbers', () => {
  assert.deepEqual(
    parseMapMessage('{"type":"MAP_MOVE","payload":{"center":{"lat":52.1,"lng":21},"zoom":13}}'),
    { type: 'MAP_MOVE', center: { lat: 52.1, lng: 21 }, zoom: 13 },
  );
});

test('rejects malformed map moves', () => {
  assert.equal(parseMapMessage('{"type":"MAP_MOVE"}'), null);
  assert.equal(
    parseMapMessage('{"type":"MAP_MOVE","payload":{"center":{"lat":"1","lng":2},"zoom":3}}'),
    null,
  );
  assert.equal(parseMapMessage('{"type":"MAP_MOVE","payload":{"center":{"lat":1,"lng":2}}}'), null);
  assert.equal(
    parseMapMessage('{"type":"MAP_MOVE","payload":{"center":{"lat":1,"lng":2},"zoom":null}}'),
    null,
  );
  assert.equal(parseMapMessage('{"type":"MAP_MOVE","payload":null}'), null);
});

test('rejects unknown types, console logs, junk and non-strings', () => {
  assert.equal(parseMapMessage('{"type":"CONSOLE_LOG","payload":"x"}'), null);
  assert.equal(parseMapMessage('{"type":"OTHER"}'), null);
  assert.equal(parseMapMessage('not json'), null);
  assert.equal(parseMapMessage('null'), null);
  assert.equal(parseMapMessage('42'), null);
  assert.equal(parseMapMessage(undefined), null);
});

test('takes a message only from the map iframe with the opaque origin', () => {
  const frame = {};
  assert.equal(isFromMapFrame({ source: frame, origin: 'null' }, frame), true);
  // Another window, or the right window with a real origin (not sandboxed).
  assert.equal(isFromMapFrame({ source: {}, origin: 'null' }, frame), false);
  assert.equal(isFromMapFrame({ source: frame, origin: 'https://evil.example' }, frame), false);
  // No iframe yet: nothing is trusted, also not a message without a source.
  assert.equal(isFromMapFrame({ source: null, origin: 'null' }, null), false);
  assert.equal(isFromMapFrame({ source: undefined, origin: 'null' }, undefined), false);
});

test('marker data carries only id, position and type', () => {
  const spot = {
    id: 's1',
    name: 'Hidden name',
    description: 'Hidden note',
    type: 'bando',
    difficulty: 'easy',
    coordinates: { latitude: 52.1, longitude: 21.2 },
    rating: 4,
    images: ['file:///photo.jpg'],
  };
  assert.deepEqual(toMarkerData([spot]), [{ id: 's1', lat: 52.1, lng: 21.2, type: 'bando' }]);
});
