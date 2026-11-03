/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { assessFlightConditions } from './flightConditions';
import { getConditionText, mapData, parseKpRows } from './weatherMapping';

// Every time-dependent test passes an explicit `now`, so results do not depend
// on the hour the suite runs at.
const at = (iso: string) => Date.parse(iso);

const pad = (n: number) => String(n).padStart(2, '0');
const slotTime = (i: number) => `2026-06-15T${pad(Math.floor(i / 4))}:${pad((i % 4) * 15)}`;
const series = (length: number, fn: (i: number) => number | null) =>
  Array.from({ length }, (_, i) => fn(i));

/**
 * Open-Meteo response for one day (forecast_days=1, 96 quarter-hours).
 * Values are derived from the slot / hour index, so a value tells which slot it came from.
 */
const makeWeatherRaw = ({ offsetSeconds = 7200, slots = 96 } = {}) => ({
  utc_offset_seconds: offsetSeconds,
  current: {
    temperature_2m: 18,
    apparent_temperature: 17,
    precipitation: 0.2,
    weather_code: 2,
    wind_speed_10m: 12,
    wind_gusts_10m: 20,
    relative_humidity_2m: 60,
  },
  minutely_15: {
    time: Array.from({ length: slots }, (_, i) => slotTime(i)),
    wind_speed_10m: series(slots, (i) => i),
    wind_gusts_10m: series(slots, (i) => i + 100),
    wind_direction_10m: series(slots, (i) => i + 200),
    precipitation: series(slots, (i) => (i % 2 === 0 ? 0 : 0.5)),
    precipitation_probability: series(slots, (i) => i),
    temperature_2m: series(slots, (i) => i + 0.5),
    apparent_temperature: series(slots, (i) => i - 0.5),
  },
  hourly: {
    visibility: series(24, (h) => h * 1000 + 500),
    wind_speed_80m: series(24, (h) => h + 80),
    wind_speed_120m: series(24, (h) => h + 120),
  },
  daily: { uv_index_max: [5] },
});

describe('getConditionText', () => {
  test('maps WMO weather codes to Polish labels', () => {
    const rows: [number, string][] = [
      [0, 'Czyste niebo'],
      [1, 'Częściowe zachmurzenie'],
      [3, 'Częściowe zachmurzenie'],
      [45, 'Mgła'],
      [48, 'Mgła'],
      [51, 'Mżawka'],
      [55, 'Mżawka'],
      [61, 'Deszcz'],
      [65, 'Deszcz'],
      [71, 'Śnieg'],
      [75, 'Śnieg'],
      [80, 'Ulewa'],
      [82, 'Ulewa'],
      [95, 'Burza'],
      [99, 'Burza'],
      [100, 'Nieznane'],
    ];
    for (const [code, text] of rows) assert.equal(getConditionText(code), text, `code ${code}`);
  });
});

describe('mapData: time-zone index', () => {
  test('uses the spot time zone, not UTC or the phone clock (UTC+2)', () => {
    // 10:07 UTC = 12:07 at the spot -> quarter-hour slot 48, hour 12.
    const data = mapData(makeWeatherRaw({ offsetSeconds: 7200 }), [], at('2026-06-15T10:07:00Z'));
    assert.deepEqual(data.windForecast[0], {
      time: '12:00',
      speed: 48,
      gust: 148,
      direction: 248,
    });
    assert.equal(data.windForecast.length, 10);
    assert.equal(data.windForecast[9].time, '14:15');
    assert.equal(data.visibility, 12.5);
    assert.equal(data.windSpeed80m, 92);
    assert.equal(data.windSpeed120m, 132);
  });

  test('negative offset (UTC-5)', () => {
    // 17:44 UTC = 12:44 at the spot -> slot 50 (12:30).
    const data = mapData(makeWeatherRaw({ offsetSeconds: -18000 }), [], at('2026-06-15T17:44:00Z'));
    assert.equal(data.windForecast[0].time, '12:30');
    assert.equal(data.windForecast[0].speed, 50);
    assert.equal(data.windSpeed80m, 92);
  });

  test('missing utc_offset_seconds is treated as UTC', () => {
    const raw = { ...makeWeatherRaw(), utc_offset_seconds: undefined };
    const data = mapData(raw, [], at('2026-06-15T08:20:00Z'));
    assert.equal(data.windForecast[0].time, '08:15');
  });

  test('quarter-hour boundaries', () => {
    const raw = makeWeatherRaw({ offsetSeconds: 0 });
    assert.equal(mapData(raw, [], at('2026-06-15T12:14:59Z')).windForecast[0].time, '12:00');
    assert.equal(mapData(raw, [], at('2026-06-15T12:15:00Z')).windForecast[0].time, '12:15');
  });
});

describe('mapData: forecasts and current values', () => {
  const now = at('2026-06-15T10:07:00Z'); // slot 48 at the spot (UTC+2)

  test('precipitation and temperature forecasts start at the current slot', () => {
    const data = mapData(makeWeatherRaw(), [], now);
    assert.deepEqual(data.precipitationForecast.slice(0, 2), [
      { time: '12:00', amount: 0, probability: 48, type: 'none' },
      { time: '12:15', amount: 0.5, probability: 49, type: 'rain' },
    ]);
    assert.deepEqual(data.tempForecast[0], { time: '12:00', temp: 48.5, feelsLike: 47.5 });
  });

  test('next hour = highest probability and total amount of the next 4 slots', () => {
    const data = mapData(makeWeatherRaw(), [], now);
    assert.equal(data.nextHourPrecipitationProbability, 51);
    assert.equal(data.nextHourPrecipitationAmount, 1);
  });

  test('one missing value in the next hour -> no data (null)', () => {
    const raw = makeWeatherRaw();
    raw.minutely_15.precipitation_probability[50] = null;
    raw.minutely_15.precipitation[51] = null;
    const data = mapData(raw, [], now);
    assert.equal(data.nextHourPrecipitationProbability, null);
    assert.equal(data.nextHourPrecipitationAmount, null);
    // The chart still shows 0 for the missing slots.
    assert.equal(data.precipitationForecast[2].probability, 0);
    assert.equal(data.precipitationForecast[3].amount, 0);
  });

  test('copies current conditions', () => {
    const data = mapData(makeWeatherRaw(), [], now);
    assert.equal(data.temp, 18);
    assert.equal(data.feelsLike, 17);
    assert.equal(data.windSpeed, 12);
    assert.equal(data.windGusts, 20);
    assert.equal(data.precipitation, 0.2);
    assert.equal(data.humidity, 60);
    assert.equal(data.condition, 'Częściowe zachmurzenie');
    assert.equal(data.uvIndex, 5);
  });

  test('missing hourly values -> null, missing UV -> 0', () => {
    const raw = { ...makeWeatherRaw(), hourly: undefined, daily: { uv_index_max: [null] } };
    const data = mapData(raw, [], now);
    assert.equal(data.visibility, null);
    assert.equal(data.windSpeed80m, null);
    assert.equal(data.windSpeed120m, null);
    assert.equal(data.uvIndex, 0);
  });
});

describe('mapData: end-of-day window (Z-143, known bug)', () => {
  // These tests document the CURRENT behaviour. The request uses forecast_days=1,
  // so the quarter-hour data ends at 23:45 local time. Z-143 will fix this; when it
  // does, these expectations must change.
  const raw = makeWeatherRaw({ offsetSeconds: 0 });

  test('21:30 still has the full 10-slot window', () => {
    assert.equal(mapData(raw, [], at('2026-06-15T21:30:00Z')).windForecast.length, 10);
  });

  test('known bug: after 21:45 the window has fewer than 10 slots', () => {
    assert.equal(mapData(raw, [], at('2026-06-15T21:45:00Z')).windForecast.length, 9);
    assert.equal(mapData(raw, [], at('2026-06-15T23:00:00Z')).windForecast.length, 4);
  });

  test('23:00 still has a full next hour', () => {
    const data = mapData(raw, [], at('2026-06-15T23:00:00Z'));
    assert.equal(data.nextHourPrecipitationProbability, 95);
    assert.equal(data.nextHourPrecipitationAmount, 1);
  });

  test('known bug: after 23:15 the next hour has no data, so the rating is UWAGA', () => {
    const data = mapData(raw, [], at('2026-06-15T23:30:00Z'));
    assert.equal(data.windForecast.length, 2);
    assert.equal(data.nextHourPrecipitationProbability, null);
    assert.equal(data.nextHourPrecipitationAmount, null);

    const assessment = assessFlightConditions({
      windSpeed: 5,
      windGusts: 10,
      kpIndex: 1,
      visibility: 20,
      precipitationProbability: data.nextHourPrecipitationProbability,
      precipitationAmount: data.nextHourPrecipitationAmount,
    });
    assert.equal(assessment.level, 'caution');
  });

  test.todo('Z-143: full 10-slot window and next-hour data late in the evening');
});

describe('parseKpRows (NOAA planetary K-index forecast)', () => {
  test('current format: array of objects', () => {
    const rows = parseKpRows([
      { time_tag: '2026-11-03T00:00:00', kp: 2.33, observed: 'observed', noaa_scale: null },
      { time_tag: '2026-11-03T03:00:00', kp: 4, observed: 'predicted', noaa_scale: null },
    ]);
    assert.deepEqual(rows, [
      { time: new Date('2026-11-03T00:00:00Z'), kp: 2.33 },
      { time: new Date('2026-11-03T03:00:00Z'), kp: 4 },
    ]);
  });

  test('old format: array of arrays with a header row and string values', () => {
    const rows = parseKpRows([
      ['time_tag', 'kp', 'observed', 'noaa_scale'],
      ['2026-11-03 00:00:00', '2.33', 'observed', null],
      ['2026-11-03 03:00:00', '5.67', 'predicted', 'G1'],
    ]);
    assert.deepEqual(rows, [
      { time: new Date('2026-11-03T00:00:00Z'), kp: 2.33 },
      { time: new Date('2026-11-03T03:00:00Z'), kp: 5.67 },
    ]);
  });

  test('time tags are read as UTC', () => {
    const [row] = parseKpRows([{ time_tag: '2026-11-03T06:00:00', kp: 1 }]);
    assert.equal(row.time.toISOString(), '2026-11-03T06:00:00.000Z');
  });

  test('damaged rows are skipped, valid rows are kept in order', () => {
    const rows = parseKpRows([
      null,
      undefined,
      42,
      'text',
      {},
      [],
      { time_tag: '2026-11-03T00:00:00', kp: 1 },
      { kp: 3 },
      { time_tag: 123, kp: 3 },
      { time_tag: 'garbage', kp: 3 },
      { time_tag: '2026-11-03T03:00:00', kp: 'abc' },
      { time_tag: '2026-11-03T03:00:00', kp: null },
      { time_tag: '2026-11-03T03:00:00', kp: NaN },
      { time_tag: '2026-11-03T03:00:00', kp: Infinity },
      ['2026-11-03 03:00:00', ''],
      ['2026-11-03 03:00:00'],
      ['2026-11-03 06:00:00', '2'],
    ]);
    assert.deepEqual(rows, [
      { time: new Date('2026-11-03T00:00:00Z'), kp: 1 },
      { time: new Date('2026-11-03T06:00:00Z'), kp: 2 },
    ]);
  });

  test('a string with trailing junk is read leniently (parseFloat)', () => {
    assert.deepEqual(parseKpRows([['2026-11-03 00:00:00', '3.5abc']]), [
      { time: new Date('2026-11-03T00:00:00Z'), kp: 3.5 },
    ]);
  });

  test('input that is not an array -> no rows', () => {
    for (const input of [null, undefined, {}, 'text', 42]) {
      assert.deepEqual(parseKpRows(input), []);
    }
  });
});

describe('mapData: Kp', () => {
  // 3-hour NOAA windows from 2026-11-03 00:00 UTC, Kp = 1..8.
  const space = Array.from({ length: 8 }, (_, i) => ({
    time_tag: `2026-11-03T${pad(i * 3)}:00:00`,
    kp: i + 1,
  }));

  test('current Kp = last window that has started; forecast = next 5 windows in spot time', () => {
    const data = mapData(
      makeWeatherRaw({ offsetSeconds: 3600 }),
      space,
      at('2026-11-03T07:59:00Z'),
    );
    assert.equal(data.kpIndex, 3);
    assert.deepEqual(data.kpForecast, [
      { hour: '7:00', value: 3 },
      { hour: '10:00', value: 4 },
      { hour: '13:00', value: 5 },
      { hour: '16:00', value: 6 },
      { hour: '19:00', value: 7 },
    ]);
  });

  test('a window counts as current from its exact start time', () => {
    const data = mapData(makeWeatherRaw(), space, at('2026-11-03T09:00:00Z'));
    assert.equal(data.kpIndex, 4);
  });

  test('near the end of the data the forecast is shorter', () => {
    const data = mapData(makeWeatherRaw({ offsetSeconds: 0 }), space, at('2026-11-04T12:00:00Z'));
    assert.equal(data.kpIndex, 8);
    assert.deepEqual(data.kpForecast, [{ hour: '21:00', value: 8 }]);
  });

  test('no window has started yet -> no data', () => {
    const data = mapData(makeWeatherRaw(), space, at('2026-11-02T23:59:00Z'));
    assert.equal(data.kpIndex, null);
    assert.deepEqual(data.kpForecast, []);
  });

  test('NOAA unavailable (empty or broken response) -> no data', () => {
    for (const spaceRaw of [[], null, { error: 'x' }]) {
      const data = mapData(makeWeatherRaw(), spaceRaw, at('2026-11-03T07:59:00Z'));
      assert.equal(data.kpIndex, null);
      assert.deepEqual(data.kpForecast, []);
    }
  });
});
