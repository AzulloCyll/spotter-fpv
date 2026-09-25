import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

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

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getConditionText = (code: number): string => {
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

  const mapData = (weatherRaw: any, spaceRaw: any): WeatherData => {
    const current = weatherRaw.current;
    const offsetSeconds = weatherRaw.utc_offset_seconds || 0;

    // Calculate 'now' in target location's timezone
    const targetNow = new Date(Date.now() + offsetSeconds * 1000);
    const currentHourIndex = targetNow.getUTCHours();
    const currentMinuteShifted = targetNow.getUTCMinutes();
    const current15MinIndex = currentHourIndex * 4 + Math.floor(currentMinuteShifted / 15);

    // Wind: Show next 2.5 hours (10 points)
    const windForecast = weatherRaw.minutely_15.time
      .slice(current15MinIndex, current15MinIndex + 10)
      .map((t: string, i: number): WindForecastEntry => {
        const d = new Date(t);
        return {
          time: `${d.getUTCHours()}:${d.getUTCMinutes().toString().padStart(2, '0')}`,
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
            (weatherRaw.minutely_15.precipitation[current15MinIndex + i] ?? 0) > 0
              ? 'rain'
              : 'none',
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

    const numOrNull = (v: unknown): number | null =>
      typeof v === 'number' && Number.isFinite(v) ? v : null;

    // NOAA podaje Kp w oknach 3 h. Obecnie jako tablicę obiektów { time_tag, kp },
    // dawniej jako tablicę tablic z wierszem nagłówka - obsługujemy oba kształty.
    const kpRows = (Array.isArray(spaceRaw) ? spaceRaw : [])
      .map((row: any) => {
        const timeTag = Array.isArray(row) ? row[0] : row?.time_tag;
        const kpRaw = Array.isArray(row) ? row[1] : row?.kp;
        const time = new Date(`${timeTag}Z`);
        const kp = numOrNull(typeof kpRaw === 'string' ? parseFloat(kpRaw) : kpRaw);
        return typeof timeTag === 'string' && !isNaN(time.getTime()) && kp !== null
          ? { time, kp }
          : null;
      })
      .filter((row): row is { time: Date; kp: number } => row !== null);

    // Bieżące okno = ostatnie, które już się zaczęło.
    const nowMs = Date.now();
    let kpCurrentIndex = -1;
    kpRows.forEach((row, i) => {
      if (row.time.getTime() <= nowMs) kpCurrentIndex = i;
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

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // 1. Get a fresh location reading (avoid stale cached positions)
      const locationCoords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = locationCoords.coords;

      // 2. Prepare requests
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m&minutely_15=precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,apparent_temperature&hourly=visibility,wind_speed_80m,wind_speed_120m&daily=uv_index_max&timezone=auto&forecast_days=1`;
      const spaceUrl = `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json`;

      // 3. Execute concurrently: Reverse Geocode + Weather API + Space API
      const [reverseGeocode, weatherRes, spaceRes] = await Promise.all([
        Location.reverseGeocodeAsync({ latitude, longitude }),
        fetch(weatherUrl),
        // Brak NOAA nie blokuje pogody - Kp będzie wtedy „brak danych”.
        fetch(spaceUrl).catch(() => null),
      ]);

      const placeName = reverseGeocode[0]
        ? `${reverseGeocode[0].city || reverseGeocode[0].district}, ${reverseGeocode[0].region || ''}`
        : 'Moja lokalizacja';

      setLocation({ name: placeName, lat: latitude, lng: longitude });

      if (!weatherRes.ok) {
        throw new Error(`Weather API Error: ${weatherRes.status}`);
      }

      // Space weather API can sometimes return 404 or other non-200 for specific requests,
      // but we want to proceed with weather data if space data fails.
      let spaceData: unknown = [];
      if (spaceRes?.ok) {
        spaceData = await spaceRes.json().catch(() => []);
      } else {
        console.warn(
          `Space Weather API Error: ${spaceRes?.status ?? 'network'}. Proceeding without space data.`,
        );
      }

      const weatherData = await weatherRes.json();
      const mapped = mapData(weatherData, spaceData);

      setWeather(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Refetch every 5 minutes
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchWeather]);

  return { weather, location, loading, error, refetch: fetchWeather };
};
