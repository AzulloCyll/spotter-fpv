import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';

import { mapData, type WeatherData } from '../utils/weatherMapping';
import {
  formatCoordinates,
  formatPlaceName,
  parseStoredPlace,
  resolveWeatherCoords,
  type LocationProblem,
  type WeatherPlace,
} from '../utils/location';

export type {
  WindForecastEntry,
  PrecipitationForecastEntry,
  TemperatureForecastEntry,
  WeatherData,
} from '../utils/weatherMapping';
export type { WeatherPlace } from '../utils/location';

// The place picked by hand on the weather screen; it wins over GPS until cleared.
const PLACE_STORAGE_KEY = '@spotter_weather_place';

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

const REFRESH_INTERVAL_MS = 300000; // 5 minutes

// Two places closer than ~110 m share one reverse-geocoded name (GPS jitters a little).
const sameSpot = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
  a.lat.toFixed(3) === b.lat.toFixed(3) && a.lng.toFixed(3) === b.lng.toFixed(3);

const readSavedPlace = async (): Promise<WeatherPlace | null> => {
  try {
    return parseStoredPlace(await AsyncStorage.getItem(PLACE_STORAGE_KEY));
  } catch (error) {
    console.warn('Nie udało się wczytać wybranego miejsca pogody:', error);
    return null;
  }
};

// `background` refreshes only read the permission state; they never show the system prompt.
const readGps = async (
  background: boolean,
): Promise<
  | { gps: { lat: number; lng: number }; problem?: undefined }
  | { gps: null; problem: LocationProblem }
> => {
  const { status } = background
    ? await Location.getForegroundPermissionsAsync()
    : await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return { gps: null, problem: 'denied' };
  try {
    // A fresh reading (avoid stale cached positions)
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { gps: { lat: coords.latitude, lng: coords.longitude } };
  } catch {
    // Location services off or no fix
    return { gps: null, problem: 'unavailable' };
  }
};

// The geocoder is missing on web (it returns no results) and can fail offline.
const reverseGeocodeName = async (lat: number, lng: number, fallback: string) => {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    return formatPlaceName(results[0], fallback);
  } catch {
    return fallback;
  }
};

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Set when there is neither a picked place nor GPS; the screen then offers the picker.
  const [locationProblem, setLocationProblem] = useState<LocationProblem | null>(null);
  const [manualPlace, setManualPlace] = useState<WeatherPlace | null>(null);
  // Only the latest fetch may write state (the 5-minute refetch can overlap a place change).
  const requestIdRef = useRef(0);
  // The last good data, so a background refresh knows whether it may stay silent.
  const hasDataRef = useRef(false);
  // The last reverse-geocoded name, reused while the spot did not move.
  const geocodeRef = useRef<{ lat: number; lng: number; name: string } | null>(null);
  const lastFetchAtRef = useRef(0);
  const isFocused = useIsFocused();

  /**
   * `background` = the 5-minute refresh. When there is good data it is silent: no loading
   * flag, no permission prompt, no error and no change to the data if it fails.
   */
  const fetchWeather = useCallback(async (background = false) => {
    const requestId = ++requestIdRef.current;
    const isCurrent = () => requestId === requestIdRef.current;
    const quiet = background && hasDataRef.current;
    lastFetchAtRef.current = Date.now();
    try {
      if (!quiet) {
        setLoading(true);
        setError(null);
        setLocationProblem(null);
      }

      const savedPlace = await readSavedPlace();
      const gpsResult = savedPlace ? null : await readGps(background);
      if (!isCurrent()) return;
      setManualPlace(savedPlace);

      const target = resolveWeatherCoords({
        savedPlace,
        gps: gpsResult?.gps ?? null,
        gpsProblem: gpsResult?.problem,
      });
      if (target.source === 'none') {
        // A quiet refresh keeps the old data when the position is briefly unavailable.
        if (quiet) return;
        hasDataRef.current = false;
        setWeather(null);
        setLocation(null);
        setLocationProblem(target.problem);
        return;
      }

      const { lat: latitude, lng: longitude } = target;

      // Prepare requests
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m&minutely_15=precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,apparent_temperature&hourly=visibility,wind_speed_80m,wind_speed_120m&daily=uv_index_max&timezone=auto&forecast_days=2`;
      const spaceUrl = `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json`;

      const reverseGeocodeOnce = async () => {
        const cached = geocodeRef.current;
        if (cached && sameSpot(cached, { lat: latitude, lng: longitude })) return cached.name;
        const fallback = 'Moja lokalizacja';
        const name = await reverseGeocodeName(latitude, longitude, fallback);
        // A failed lookup is not remembered, so the next refresh tries again.
        geocodeRef.current = name === fallback ? null : { lat: latitude, lng: longitude, name };
        return name;
      };

      // Execute concurrently: place name + Weather API + Space API
      const [placeName, weatherRes, spaceRes] = await Promise.all([
        target.source === 'manual' ? target.name : reverseGeocodeOnce(),
        fetch(weatherUrl),
        // Brak NOAA nie blokuje pogody - Kp będzie wtedy „brak danych”.
        fetch(spaceUrl).catch(() => null),
      ]);
      if (!isCurrent()) return;

      // Keep showing the place even when the weather request fails (not on a quiet refresh).
      if (!quiet) setLocation({ name: placeName, lat: latitude, lng: longitude });

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
      if (!isCurrent()) return;

      setLocation({ name: placeName, lat: latitude, lng: longitude });
      hasDataRef.current = true;
      setWeather(mapped);
    } catch (err) {
      if (!isCurrent()) return;
      // With good old data a failed background refresh shows nothing new.
      if (quiet) return;
      // A failed normal load puts the screen in the error state; the next background refresh
      // must then behave like a normal load so it can clear that state.
      hasDataRef.current = false;
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, []);

  /** Saves a place picked on the map and loads its weather. */
  const choosePlace = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      const name = await reverseGeocodeName(lat, lng, formatCoordinates(lat, lng));
      const place: WeatherPlace = { name, lat, lng };
      try {
        await AsyncStorage.setItem(PLACE_STORAGE_KEY, JSON.stringify(place));
      } catch (error) {
        console.warn('Nie udało się zapisać wybranego miejsca pogody:', error);
      }
      await fetchWeather();
    },
    [fetchWeather],
  );

  /** Forgets the picked place, so the weather follows GPS again. */
  const clearPlace = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PLACE_STORAGE_KEY);
    } catch (error) {
      console.warn('Nie udało się usunąć wybranego miejsca pogody:', error);
    }
    await fetchWeather();
  }, [fetchWeather]);

  /** Manual refresh (button): a full load with the loading state. */
  const refetch = useCallback(() => fetchWeather(false), [fetchWeather]);

  // First load on mount.
  useEffect(() => {
    fetchWeather(false);
  }, [fetchWeather]);

  // Tabs stay mounted, so the refresh runs only while this screen is focused. Coming back
  // after a break longer than the interval refreshes at once.
  useEffect(() => {
    if (!isFocused) return;
    if (Date.now() - lastFetchAtRef.current >= REFRESH_INTERVAL_MS) fetchWeather(true);
    // Every refetch reads the saved place again, so it stays on the same place.
    const interval = setInterval(() => fetchWeather(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchWeather, isFocused]);

  return {
    weather,
    location,
    loading,
    error,
    locationProblem,
    manualPlace,
    choosePlace,
    clearPlace,
    refetch,
  };
};
