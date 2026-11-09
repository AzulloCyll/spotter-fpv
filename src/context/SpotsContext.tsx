import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Spot, MOCK_SPOTS } from '../data/mockSpots';
import { mergeSpotsById, parseStoredSpots } from '../utils/spots';

const STORAGE_KEY = '@spotter_user_spots';
// Raw stored value kept when some entries could not be read, so nothing is lost for good.
const BACKUP_KEY = '@spotter_user_spots_backup';

interface SpotsContextType {
  spots: Spot[];
  /** Does nothing until loading ends, so an early save cannot overwrite the stored list. */
  addSpot: (spot: Spot) => void;
  /** Dopóki trwa, lista zawiera same spoty demonstracyjne. */
  isLoading: boolean;
  /** False while loading and when the stored list could not be read; addSpot is a no-op then. */
  canAddSpots: boolean;
}

const SpotsContext = createContext<SpotsContextType | undefined>(undefined);

const fileExists = async (uri: string): Promise<boolean> => {
  try {
    return (await FileSystem.getInfoAsync(uri)).exists;
  } catch {
    // Cannot tell: treat as present, so a photo is never dropped by mistake.
    return true;
  }
};

/**
 * Returns the URI to keep for a stored photo, or null when its file is gone.
 * Photos are stored with an absolute path, and on iOS the app folder path can change
 * after an update, so a copy in our spots/ folder is looked up under the current
 * document directory before it is given up. Remote URLs are kept as they are.
 */
const resolveImage = async (uri: string): Promise<string | null> => {
  if (!uri.startsWith('file://')) return uri;
  if (await fileExists(uri)) return uri;

  const marker = '/spots/';
  const markerIndex = uri.lastIndexOf(marker);
  if (FileSystem.documentDirectory && markerIndex !== -1) {
    const moved = `${FileSystem.documentDirectory}spots/${uri.slice(markerIndex + marker.length)}`;
    if (moved !== uri && (await fileExists(moved))) return moved;
  }
  // Typically a picker cache path saved by an older version, cleared by the system.
  return null;
};

/** Drops photos whose file is gone, so the map shows no empty thumbnails. */
const dropMissingImages = async (spots: Spot[]): Promise<Spot[]> => {
  if (Platform.OS === 'web') return spots;

  return Promise.all(
    spots.map(async (spot) => {
      if (!spot.images || spot.images.length === 0) return spot;
      const resolved = await Promise.all(spot.images.map(resolveImage));
      return { ...spot, images: resolved.filter((uri): uri is string => uri !== null) };
    }),
  );
};

export const SpotsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Zapisujemy wyłącznie spoty dodane przez użytkownika, a demonstracyjne
  // doklejamy przy odczycie. Trzymanie kopii MOCK_SPOTS na dysku sprawiłoby,
  // że zmiany w danych demo nie dotarłyby do nikogo, kto już uruchomił aplikację.
  const [userSpots, setUserSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canAddSpots, setCanAddSpots] = useState(false);
  // The latest list, read by addSpot so the write happens outside the state updater
  // (React may call an updater twice in Strict Mode).
  const userSpotsRef = useRef<Spot[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    const loadSpots = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const { spots: loaded, skipped } = parseStoredSpots(stored);
        const withImages = await dropMissingImages(loaded);
        // Merge instead of replace, so nothing added in the meantime is lost.
        const merged = mergeSpotsById(withImages, userSpotsRef.current);
        userSpotsRef.current = merged;
        setUserSpots(merged);
        if (skipped > 0 && stored !== null) {
          console.warn(`Pominięto ${skipped} uszkodzonych wpisów spotów, kopia w ${BACKUP_KEY}`);
          // Awaited on purpose: the backup must exist before the first write of the list.
          // If it cannot be written, adding stays blocked (catch below) so the raw data survives;
          // the spots that were read still show.
          await AsyncStorage.setItem(BACKUP_KEY, stored);
        }
        loadedRef.current = true;
        setCanAddSpots(true);
      } catch (error) {
        // The stored list is unknown, so adding stays blocked: a write now could erase it.
        // Uszkodzony wpis nie może zablokować mapy - zostają same spoty demo.
        console.warn('Nie udało się wczytać zapisanych spotów:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpots();
  }, []);

  const addSpot = (spot: Spot) => {
    if (!loadedRef.current) return;
    const next = [...userSpotsRef.current, spot];
    userSpotsRef.current = next;
    setUserSpots(next);
    // Zapis bez await: mapa ma zareagować od razu, a nieudany zapis oznacza
    // utratę spota po restarcie, nie zawieszony interfejs.
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error) => {
      console.warn('Nie udało się zapisać spota:', error);
    });
  };

  const spots = [...MOCK_SPOTS, ...userSpots];

  return (
    <SpotsContext.Provider value={{ spots, addSpot, isLoading, canAddSpots }}>
      {children}
    </SpotsContext.Provider>
  );
};

export const useSpots = () => {
  const context = useContext(SpotsContext);
  if (context === undefined) {
    throw new Error('useSpots must be used within a SpotsProvider');
  }
  return context;
};
