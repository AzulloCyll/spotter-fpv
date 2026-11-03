import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

import { mapData, type WeatherData } from '../utils/weatherMapping';

export type {
  WindForecastEntry,
  PrecipitationForecastEntry,
  TemperatureForecastEntry,
  WeatherData,
} from '../utils/weatherMapping';

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
