/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  assessFlightConditions,
  type FlightFactor,
  type FlightInputs,
  type FlightStatusLevel,
} from './flightConditions';

/** Calm, clear conditions: every factor is GO. */
const GOOD: FlightInputs = {
  windSpeed: 10,
  windGusts: 15,
  kpIndex: 2,
  visibility: 10,
  precipitationProbability: 0,
  precipitationAmount: 0,
};

const assess = (overrides: Partial<FlightInputs>) =>
  assessFlightConditions({ ...GOOD, ...overrides });

const factor = (overrides: Partial<FlightInputs>, key: FlightFactor['key']) => {
  const found = assess(overrides).factors.find((f) => f.key === key);
  assert.ok(found, `factor ${key} missing`);
  return found;
};

const cases = (
  key: FlightFactor['key'],
  field: keyof FlightInputs,
  rows: [number, FlightStatusLevel][],
) => {
  for (const [value, expected] of rows) {
    test(`${field} = ${value} -> ${expected}`, () => {
      assert.equal(factor({ [field]: value }, key).level, expected);
    });
  }
};

describe('assessFlightConditions: thresholds', () => {
  test('all factors good -> GO', () => {
    const result = assessFlightConditions(GOOD);
    assert.equal(result.level, 'go');
    assert.deepEqual(
      result.factors.map((f) => [f.key, f.level, f.missing]),
      [
        ['wind', 'go', false],
        ['gusts', 'go', false],
        ['kp', 'go', false],
        ['visibility', 'go', false],
        ['precipitation', 'go', false],
      ],
    );
  });

  describe('wind (caution from 25, no-go from 40 km/h)', () => {
    cases('wind', 'windSpeed', [
      [24.9, 'go'],
      [25, 'caution'],
      [39.9, 'caution'],
      [40, 'nogo'],
    ]);
  });

  describe('gusts (caution from 35, no-go from 50 km/h)', () => {
    cases('gusts', 'windGusts', [
      [34.9, 'go'],
      [35, 'caution'],
      [49.9, 'caution'],
      [50, 'nogo'],
    ]);
  });

  describe('Kp (caution from 4, no-go from 5)', () => {
    cases('kp', 'kpIndex', [
      [3.9, 'go'],
      [4, 'caution'],
      [4.9, 'caution'],
      [5, 'nogo'],
    ]);
  });

  describe('visibility (caution below 3, no-go below 1 km)', () => {
    cases('visibility', 'visibility', [
      [3, 'go'],
      [2.9, 'caution'],
      [1, 'caution'],
      [0.9, 'nogo'],
    ]);
  });

  describe('precipitation probability (caution from 40, no-go from 70 %)', () => {
    cases('precipitation', 'precipitationProbability', [
      [39, 'go'],
      [40, 'caution'],
      [69, 'caution'],
      [70, 'nogo'],
    ]);
  });

  describe('precipitation amount (caution above 0, no-go from 1 mm)', () => {
    cases('precipitation', 'precipitationAmount', [
      [0, 'go'],
      [0.1, 'caution'],
      [0.9, 'caution'],
      [1, 'nogo'],
    ]);
  });

  test('result is the worst factor', () => {
    assert.equal(assess({ windSpeed: 30 }).level, 'caution');
    assert.equal(assess({ windSpeed: 30, kpIndex: 6 }).level, 'nogo');
    assert.equal(assess({ visibility: 0.5, precipitationAmount: 0.2 }).level, 'nogo');
  });

  test('formats the displayed values', () => {
    const result = assess({ windSpeed: 12.6, kpIndex: 3, visibility: 4.25 });
    const values = Object.fromEntries(result.factors.map((f) => [f.key, f.value]));
    assert.equal(values.wind, '13 km/h');
    assert.equal(values.kp, '3.0');
    assert.equal(values.visibility, '4.3 km');
    assert.equal(values.precipitation, '0% • 0.0 mm');
  });
});

describe('assessFlightConditions: no data = UWAGA', () => {
  const fields: [keyof FlightInputs, FlightFactor['key']][] = [
    ['windSpeed', 'wind'],
    ['windGusts', 'gusts'],
    ['kpIndex', 'kp'],
    ['visibility', 'visibility'],
    ['precipitationProbability', 'precipitation'],
    ['precipitationAmount', 'precipitation'],
  ];

  for (const [field, key] of fields) {
    for (const value of [null, NaN, Infinity]) {
      test(`${field} = ${value} -> factor ${key} is caution and missing, result never GO`, () => {
        const result = assess({ [field]: value });
        const f = result.factors.find((x) => x.key === key);
        assert.deepEqual(f && { level: f.level, missing: f.missing, value: f.value }, {
          level: 'caution',
          missing: true,
          value: 'brak danych',
        });
        assert.equal(result.level, 'caution');
      });
    }
  }

  test('missing data does not hide a NO-GO factor', () => {
    assert.equal(assess({ kpIndex: null, windSpeed: 45 }).level, 'nogo');
  });

  test('all data missing -> UWAGA', () => {
    const result = assessFlightConditions({
      windSpeed: null,
      windGusts: null,
      kpIndex: null,
      visibility: null,
      precipitationProbability: null,
      precipitationAmount: null,
    });
    assert.equal(result.level, 'caution');
    assert.ok(result.factors.every((f) => f.missing && f.level === 'caution'));
  });
});
