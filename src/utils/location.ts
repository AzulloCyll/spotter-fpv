// Pure location helpers shared by the map and the weather screen. No React Native
// imports here, so `npm test` can load this file directly.

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** A place picked by hand on the map for the weather screen. */
export interface WeatherPlace {
  name: string;
  lat: number;
  lng: number;
}

/** Where a map opens when the user's location is not known (yet). */
export const DEFAULT_MAP_CENTER: Coordinates = { latitude: 52.2297, longitude: 21.0122 };

/** Why the app has no position of the user. */
export type LocationProblem = 'denied' | 'unavailable';

/** One wording for the missing location, used by the map alert and the weather screen. */
export const LOCATION_PROBLEM_TEXT: Record<LocationProblem, { title: string; message: string }> = {
  denied: {
    title: 'Brak dostępu do lokalizacji',
    message:
      'Aplikacja nie ma zgody na użycie Twojej lokalizacji. Możesz ją włączyć w ustawieniach.',
  },
  unavailable: {
    title: 'Nie znamy Twojej lokalizacji',
    message:
      'Nie udało się ustalić Twojej lokalizacji. Sprawdź, czy usługi lokalizacji są włączone.',
  },
};

export const isValidCoordinate = (lat: unknown, lng: unknown): boolean =>
  typeof lat === 'number' &&
  typeof lng === 'number' &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180;

/** Reads a stored weather place; anything malformed counts as no place. */
export const parseStoredPlace = (raw: string | null): WeatherPlace | null => {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const { name, lat, lng } = value as Record<string, unknown>;
  if (!isValidCoordinate(lat, lng)) return null;
  const place = { lat: lat as number, lng: lng as number };
  return {
    name: typeof name === 'string' && name.trim() ? name : formatCoordinates(place.lat, place.lng),
    ...place,
  };
};

export type WeatherCoords =
  | { source: 'manual'; name: string; lat: number; lng: number }
  | { source: 'gps'; lat: number; lng: number }
  | { source: 'none'; problem: LocationProblem };

/**
 * Which coordinates the weather is fetched for. A place picked by hand wins over GPS
 * until the user clears it ("Użyj mojej lokalizacji"); without either there is nothing
 * to fetch and the screen asks the user to pick a place.
 */
export const resolveWeatherCoords = ({
  savedPlace,
  gps,
  gpsProblem = 'unavailable',
}: {
  savedPlace: WeatherPlace | null;
  gps: { lat: number; lng: number } | null;
  gpsProblem?: LocationProblem;
}): WeatherCoords => {
  if (savedPlace && isValidCoordinate(savedPlace.lat, savedPlace.lng)) {
    return { source: 'manual', name: savedPlace.name, lat: savedPlace.lat, lng: savedPlace.lng };
  }
  if (gps && isValidCoordinate(gps.lat, gps.lng)) {
    return { source: 'gps', lat: gps.lat, lng: gps.lng };
  }
  return { source: 'none', problem: gpsProblem };
};

export const formatCoordinates = (lat: number, lng: number): string =>
  `${lat.toFixed(2)}, ${lng.toFixed(2)}`;

/** The subset of expo-location's reverse geocode result the name is built from. */
export interface GeocodeParts {
  city?: string | null;
  district?: string | null;
  subregion?: string | null;
  region?: string | null;
}

/** "City, Region" from a reverse geocode result, or the fallback when it has nothing usable. */
export const formatPlaceName = (geocode: GeocodeParts | undefined, fallback: string): string => {
  if (!geocode) return fallback;
  const parts = [geocode.city || geocode.district || geocode.subregion, geocode.region].filter(
    (part): part is string => !!part && !!part.trim(),
  );
  return parts.length ? parts.join(', ') : fallback;
};
