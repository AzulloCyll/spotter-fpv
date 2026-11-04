import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

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

const readSavedPlace = async (): Promise<WeatherPlace | null> => {
  try {
    return parseStoredPlace(await AsyncStorage.getItem(PLACE_STORAGE_KEY));
  } catch (error) {
    console.warn('Nie udało się wczytać wybranego miejsca pogody:', error);
    return null;
  }
};

const readGps = async (): Promise<
  | { gps: { lat: number; lng: number }; problem?: undefined }
  | { gps: null; problem: LocationProblem }
> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
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

  const fetchWeather = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isCurrent = () => requestId === requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      setLocationProblem(null);

      const savedPlace = await readSavedPlace();
      const gpsResult = savedPlace ? null : await readGps();
      if (!isCurrent()) return;
      setManualPlace(savedPlace);

      const target = resolveWeatherCoords({
        savedPlace,
        gps: gpsResult?.gps ?? null,
        gpsProblem: gpsResult?.problem,
      });
      if (target.source === 'none') {
        setWeather(null);
        setLocation(null);
        setLocationProblem(target.problem);
        return;
      }

      const { lat: latitude, lng: longitude } = target;

      // Prepare requests
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m&minutely_15=precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,apparent_temperature&hourly=visibility,wind_speed_80m,wind_speed_120m&daily=uv_index_max&timezone=auto&forecast_days=1`;
      const spaceUrl = `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json`;

      // Execute concurrently: place name + Weather API + Space API
      const [placeName, weatherRes, spaceRes] = await Promise.all([
        target.source === 'manual'
          ? target.name
          : reverseGeocodeName(latitude, longitude, 'Moja lokalizacja'),
        fetch(weatherUrl),
        // Brak NOAA nie blokuje pogody - Kp będzie wtedy „brak danych”.
        fetch(spaceUrl).catch(() => null),
      ]);
      if (!isCurrent()) return;

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
      if (!isCurrent()) return;

      setWeather(mapped);
    } catch (err) {
      if (!isCurrent()) return;
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

  useEffect(() => {
    fetchWeather();
    // Every refetch reads the saved place again, so it stays on the same place.
    const interval = setInterval(fetchWeather, 300000); // Refetch every 5 minutes
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchWeather]);

  return {
    weather,
    location,
    loading,
    error,
    locationProblem,
    manualPlace,
    choosePlace,
    clearPlace,
    refetch: fetchWeather,
  };
};
