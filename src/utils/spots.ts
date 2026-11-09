import type { Spot, SpotType } from '../data/mockSpots';

export const SPOT_NAME_MAX_LENGTH = 60;
export const SPOT_DESCRIPTION_MAX_LENGTH = 500;

const SPOT_TYPES: readonly SpotType[] = ['bando', 'nature', 'park', 'urban'];
const DIFFICULTIES: readonly Spot['difficulty'][] = ['easy', 'medium', 'hard', 'extreme'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Trims a form value and cuts it to `maxLength`. */
export const normalizeSpotText = (value: string, maxLength: number): string =>
  value.trim().slice(0, maxLength);

/**
 * Checks one stored entry. Rejects only what would crash the UI (wrong types,
 * missing or out-of-range coordinates, unknown type or difficulty). Fields that
 * older app versions did not write (rating, images) are filled with defaults.
 */
const parseSpot = (entry: unknown): Spot | null => {
  if (!isRecord(entry)) return null;
  const { id, name, description, type, difficulty, coordinates, rating, images } = entry;

  if (typeof id !== 'string' || id === '') return null;
  if (typeof name !== 'string' || typeof description !== 'string') return null;
  if (!SPOT_TYPES.includes(type as SpotType)) return null;
  if (!DIFFICULTIES.includes(difficulty as Spot['difficulty'])) return null;
  if (!isRecord(coordinates)) return null;

  const { latitude, longitude } = coordinates;
  if (!isFiniteNumber(latitude) || latitude < -90 || latitude > 90) return null;
  if (!isFiniteNumber(longitude) || longitude < -180 || longitude > 180) return null;

  return {
    id,
    name,
    description,
    type: type as SpotType,
    difficulty: difficulty as Spot['difficulty'],
    coordinates: { latitude, longitude },
    rating: isFiniteNumber(rating) ? rating : 0,
    images: Array.isArray(images)
      ? images.filter((image): image is string => typeof image === 'string')
      : [],
  };
};

export interface ParsedSpots {
  spots: Spot[];
  /** Entries dropped as unreadable. Anything above 0 means the raw data should be backed up. */
  skipped: number;
}

/** Parses the raw AsyncStorage value. Never throws; bad data is skipped and counted. */
export const parseStoredSpots = (raw: string | null): ParsedSpots => {
  if (raw === null || raw === '') return { spots: [], skipped: 0 };

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { spots: [], skipped: 1 };
  }
  if (!Array.isArray(data)) return { spots: [], skipped: 1 };

  const spots: Spot[] = [];
  let skipped = 0;
  for (const entry of data) {
    const spot = parseSpot(entry);
    if (spot) spots.push(spot);
    else skipped += 1;
  }
  return { spots, skipped };
};

/** Merges two lists by id; the first occurrence of an id wins. */
export const mergeSpotsById = (first: Spot[], second: Spot[]): Spot[] => {
  const seen = new Set<string>();
  const merged: Spot[] = [];
  for (const spot of [...first, ...second]) {
    if (seen.has(spot.id)) continue;
    seen.add(spot.id);
    merged.push(spot);
  }
  return merged;
};
