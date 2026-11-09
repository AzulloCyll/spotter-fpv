/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseMapMessage } from './mapMessages';

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
