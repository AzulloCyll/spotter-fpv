import { useState, useEffect } from "react";
import * as Location from "expo-location";

export interface WeatherData {
  temp: number;
  condition: string;
  feelsLike: number;
  windSpeed: number;
  windGusts: number;
  kpIndex: number;
  kpForecast: { hour: string; value: number }[];
  visibility: number;
  precipitation: number;
  humidity: number;
  uvIndex: number;
  precipitationForecast: any[]; // To be typed strictly
  windForecast: any[]; // To be typed strictly
  tempForecast: any[]; // To be typed strictly
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
    if (code === 0) return "Czyste niebo";
    if (code <= 3) return "Częściowe zachmurzenie";
    if (code <= 48) return "Mgła";
    if (code <= 55) return "Mżawka";
    if (code <= 65) return "Deszcz";
    if (code <= 75) return "Śnieg";
    if (code <= 82) return "Ulewa";
    if (code <= 99) return "Burza";
    return "Nieznane";
  };

  const mapData = (weatherRaw: any, spaceRaw: any): WeatherData => {
    const current = weatherRaw.current;
    const offsetSeconds = weatherRaw.utc_offset_seconds || 0;

    // Calculate 'now' in target location's timezone
    const targetNow = new Date(Date.now() + offsetSeconds * 1000);
    const currentHourIndex = targetNow.getUTCHours();
    const currentMinuteShifted = targetNow.getUTCMinutes();
    const current15MinIndex =
      currentHourIndex * 4 + Math.floor(currentMinuteShifted / 15);

    // Wind: Show next 2.5 hours (10 points)
    const windForecast = weatherRaw.minutely_15.time
      .slice(current15MinIndex, current15MinIndex + 10)
      .map((t: string, i: number) => {
        const d = new Date(t);
        return {
          time: `${d.getUTCHours()}:${d.getUTCMinutes().toString().padStart(2, "0")}`,
          speed: weatherRaw.minutely_15.wind_speed_10m[current15MinIndex + i],
          gust: weatherRaw.minutely_15.wind_gusts_10m[current15MinIndex + i],
          direction:
            weatherRaw.minutely_15.wind_direction_10m[current15MinIndex + i],
        };
      });

    // Precipitation: Show next 2.5 hours (10 points)
    const precipitationForecast = weatherRaw.minutely_15.time
      .slice(current15MinIndex, current15MinIndex + 10)
      .map((t: string, i: number) => {
        const timeStr = t.split("T")[1];
        return {
          time: timeStr,
          amount:
            weatherRaw.minutely_15.precipitation[current15MinIndex + i] ?? 0,
          probability:
            weatherRaw.minutely_15.precipitation_probability[
              current15MinIndex + i
            ] ?? 0,
          type:
            (weatherRaw.minutely_15.precipitation[current15MinIndex + i] ?? 0) >
            0
              ? "rain"
              : "none",
        };
      });

    // Temperature: Show next 2.5 hours (10 points)
    const tempForecast = weatherRaw.minutely_15.time
      .slice(current15MinIndex, current15MinIndex + 10)
      .map((t: string, i: number) => {
        const timeStr = t.split("T")[1];
        return {
          time: timeStr,
          temp:
            weatherRaw.minutely_15.temperature_2m[current15MinIndex + i] ?? 0,
          feelsLike:
            weatherRaw.minutely_15.apparent_temperature[
              current15MinIndex + i
            ] ?? 0,
        };
      });

    let currentKp = 0;
    let kpForecast: { hour: string; value: number }[] = [];
    if (Array.isArray(spaceRaw) && spaceRaw.length > 1) {
      const rows = spaceRaw.slice(1);
      const parseNoaaDate = (dateStr: string) => new Date(dateStr + "Z");
      let currentIndex =
        rows.findIndex((row) => parseNoaaDate(row[0]) > new Date()) - 1;
      if (currentIndex < 0 && rows.length > 0) currentIndex = rows.length - 1;

      if (currentIndex !== -1) {
        currentKp = parseFloat(rows[currentIndex][1]);
        kpForecast = rows.slice(currentIndex, currentIndex + 5).map((row) => ({
          hour: parseNoaaDate(row[0]).getHours() + ":00",
          value: parseFloat(row[1]),
        }));
      }
    }

    return {
      temp: current.temperature_2m,
      condition: getConditionText(current.weather_code),
      feelsLike: current.apparent_temperature,
      windSpeed: current.wind_speed_10m,
      windGusts: current.wind_gusts_10m,
      kpIndex: currentKp,
      kpForecast,
      visibility:
        (weatherRaw.hourly.visibility[currentHourIndex] || 10000) / 1000,
      precipitation: current.precipitation,
      humidity: current.relative_humidity_2m,
      uvIndex: weatherRaw.daily.uv_index_max[0] || 0,
      precipitationForecast,
      windForecast,
      tempForecast,
    };
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }

        // 1. Get location (try last known first for speed)
        let locationCoords = await Location.getLastKnownPositionAsync({});
        if (!locationCoords) {
          locationCoords = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }

        const { latitude, longitude } = locationCoords.coords;

        // 2. Prepare requests
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m&minutely_15=precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,apparent_temperature&hourly=visibility&daily=uv_index_max&timezone=auto&forecast_days=1`;
        const spaceUrl = `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json`;

        // 3. Execute concurrently: Reverse Geocode + Weather API + Space API
        const [reverseGeocode, weatherRes, spaceRes] = await Promise.all([
          Location.reverseGeocodeAsync({ latitude, longitude }),
          fetch(weatherUrl),
          fetch(spaceUrl),
        ]);

        const placeName = reverseGeocode[0]
          ? `${reverseGeocode[0].city || reverseGeocode[0].district}, ${reverseGeocode[0].region || ""}`
          : "Moja lokalizacja";

        setLocation({ name: placeName, lat: latitude, lng: longitude });

        if (!weatherRes.ok) {
          throw new Error(`Weather API Error: ${weatherRes.status}`);
        }

        // Space weather API can sometimes return 404 or other non-200 for specific requests,
        // but we want to proceed with weather data if space data fails.
        let spaceData = [];
        if (spaceRes.ok) {
          spaceData = await spaceRes.json();
        } else {
          console.warn(
            `Space Weather API Error: ${spaceRes.status}. Proceeding without space data.`,
          );
        }

        const weatherData = await weatherRes.json();
        const mapped = mapData(weatherData, spaceData);

        setWeather(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Refetch every 5 minutes
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return { weather, location, loading, error, refetch: () => {} };
};
