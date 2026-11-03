/**
 * Pure mapping of the Open-Meteo and NOAA responses into WeatherData.
 * Kept free of React / Expo imports so it can be unit-tested with node:test.
 */

/** Kolejne kwadranse prognozy - kształt, którego oczekują wykresy w molecules/. */
export interface WindForecastEntry {
  time: string;
  speed: number;
  gust: number;
  direction: number;
}

export interface PrecipitationForecastEntry {
  time: string;
  amount: number;
  probability: number;
  type: 'rain' | 'snow' | 'none';
}

export interface TemperatureForecastEntry {
  time: string;
  temp: number;
  feelsLike: number;
}

export interface WeatherData {
  temp: number;
  condition: string;
  feelsLike: number;
  windSpeed: number;
  windGusts: number;
  /** null = brak danych z NOAA */
  kpIndex: number | null;
  kpForecast: { hour: string; value: number }[];
  /** km; null = brak danych */
  visibility: number | null;
  /** Średni wiatr (nie porywy) w bieżącej godzinie, km/h; null = brak danych */
  windSpeed80m: number | null;
  windSpeed120m: number | null;
  /** Najwyższa szansa opadów w najbliższej godzinie, % */
  nextHourPrecipitationProbability: number | null;
  /** Suma opadów w najbliższej godzinie, mm */
  nextHourPrecipitationAmount: number | null;
  precipitation: number;
  humidity: number;
  uvIndex: number;
  precipitationForecast: PrecipitationForecastEntry[];
  windForecast: WindForecastEntry[];
  tempForecast: TemperatureForecastEntry[];
}

export interface KpRow {
  time: Date;
  kp: number;
}

export const getConditionText = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog and depositing rime fog
  // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  // ...
  if (code === 0) return 'Czyste niebo';
  if (code <= 3) return 'Częściowe zachmurzenie';
  if (code <= 48) return 'Mgła';
  if (code <= 55) return 'Mżawka';
  if (code <= 65) return 'Deszcz';
  if (code <= 75) return 'Śnieg';
  if (code <= 82) return 'Ulewa';
  if (code <= 99) return 'Burza';
  return 'Nieznane';
};

const numOrNull = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

// NOAA podaje Kp w oknach 3 h. Obecnie jako tablicę obiektów { time_tag, kp },
// dawniej jako tablicę tablic z wierszem nagłówka - obsługujemy oba kształty.
export const parseKpRows = (spaceRaw: unknown): KpRow[] =>
  (Array.isArray(spaceRaw) ? spaceRaw : [])
    .map((row: any) => {
      const timeTag = Array.isArray(row) ? row[0] : row?.time_tag;
      const kpRaw = Array.isArray(row) ? row[1] : row?.kp;
      const time = new Date(`${timeTag}Z`);
      const kp = numOrNull(typeof kpRaw === 'string' ? parseFloat(kpRaw) : kpRaw);
      return typeof timeTag === 'string' && !isNaN(time.getTime()) && kp !== null
        ? { time, kp }
        : null;
    })
    .filter((row): row is KpRow => row !== null);

/** `now` (ms since epoch) is injectable so tests can pin the clock. */
export const mapData = (weatherRaw: any, spaceRaw: any, now: number = Date.now()): WeatherData => {
  const current = weatherRaw.current;
  const offsetSeconds = weatherRaw.utc_offset_seconds || 0;

  // Calculate 'now' in target location's timezone
  const targetNow = new Date(now + offsetSeconds * 1000);
  const currentHourIndex = targetNow.getUTCHours();
  const currentMinuteShifted = targetNow.getUTCMinutes();
  const current15MinIndex = currentHourIndex * 4 + Math.floor(currentMinuteShifted / 15);

  // Wind: Show next 2.5 hours (10 points)
  const windForecast = weatherRaw.minutely_15.time
    .slice(current15MinIndex, current15MinIndex + 10)
    .map((t: string, i: number): WindForecastEntry => {
      // Czas lokalny spotu wprost z API (jak w opadach i temperaturze);
      // new Date(t) czytało go jako czas telefonu i przesuwało godziny.
      return {
        time: t.split('T')[1],
        speed: weatherRaw.minutely_15.wind_speed_10m[current15MinIndex + i],
        gust: weatherRaw.minutely_15.wind_gusts_10m[current15MinIndex + i],
        direction: weatherRaw.minutely_15.wind_direction_10m[current15MinIndex + i],
      };
    });

  // Precipitation: Show next 2.5 hours (10 points)
  const precipitationForecast = weatherRaw.minutely_15.time
    .slice(current15MinIndex, current15MinIndex + 10)
    .map((t: string, i: number): PrecipitationForecastEntry => {
      const timeStr = t.split('T')[1];
      return {
        time: timeStr,
        amount: weatherRaw.minutely_15.precipitation[current15MinIndex + i] ?? 0,
        probability: weatherRaw.minutely_15.precipitation_probability[current15MinIndex + i] ?? 0,
        type:
          (weatherRaw.minutely_15.precipitation[current15MinIndex + i] ?? 0) > 0 ? 'rain' : 'none',
      };
    });

  // Temperature: Show next 2.5 hours (10 points)
  const tempForecast = weatherRaw.minutely_15.time
    .slice(current15MinIndex, current15MinIndex + 10)
    .map((t: string, i: number): TemperatureForecastEntry => {
      const timeStr = t.split('T')[1];
      return {
        time: timeStr,
        temp: weatherRaw.minutely_15.temperature_2m[current15MinIndex + i] ?? 0,
        feelsLike: weatherRaw.minutely_15.apparent_temperature[current15MinIndex + i] ?? 0,
      };
    });

  const kpRows = parseKpRows(spaceRaw);

  // Bieżące okno = ostatnie, które już się zaczęło.
  let kpCurrentIndex = -1;
  kpRows.forEach((row, i) => {
    if (row.time.getTime() <= now) kpCurrentIndex = i;
  });

  const currentKp: number | null = kpCurrentIndex === -1 ? null : kpRows[kpCurrentIndex].kp;
  const kpForecast =
    kpCurrentIndex === -1
      ? []
      : kpRows.slice(kpCurrentIndex, kpCurrentIndex + 5).map((row) => ({
          // Godzina w strefie spotu, tak jak na pozostałych wykresach.
          hour: new Date(row.time.getTime() + offsetSeconds * 1000).getUTCHours() + ':00',
          value: row.kp,
        }));

  // Najbliższa godzina = 4 kolejne kwadranse; brak którejkolwiek wartości = brak danych.
  const nextHourSlots = [0, 1, 2, 3].map((i) => current15MinIndex + i);
  const nextHourProbs = nextHourSlots.map((i) =>
    numOrNull(weatherRaw.minutely_15.precipitation_probability?.[i]),
  );
  const nextHourAmounts = nextHourSlots.map((i) =>
    numOrNull(weatherRaw.minutely_15.precipitation?.[i]),
  );
  const nextHourPrecipitationProbability = nextHourProbs.every((v) => v !== null)
    ? Math.max(...(nextHourProbs as number[]))
    : null;
  const nextHourPrecipitationAmount = nextHourAmounts.every((v) => v !== null)
    ? (nextHourAmounts as number[]).reduce((a, b) => a + b, 0)
    : null;

  const visibilityMeters = numOrNull(weatherRaw.hourly?.visibility?.[currentHourIndex]);

  return {
    temp: current.temperature_2m,
    condition: getConditionText(current.weather_code),
    feelsLike: current.apparent_temperature,
    windSpeed: current.wind_speed_10m,
    windGusts: current.wind_gusts_10m,
    kpIndex: currentKp,
    kpForecast,
    visibility: visibilityMeters === null ? null : visibilityMeters / 1000,
    windSpeed80m: numOrNull(weatherRaw.hourly?.wind_speed_80m?.[currentHourIndex]),
    windSpeed120m: numOrNull(weatherRaw.hourly?.wind_speed_120m?.[currentHourIndex]),
    nextHourPrecipitationProbability,
    nextHourPrecipitationAmount,
    precipitation: current.precipitation,
    humidity: current.relative_humidity_2m,
    uvIndex: weatherRaw.daily.uv_index_max[0] || 0,
    precipitationForecast,
    windForecast,
    tempForecast,
  };
};
