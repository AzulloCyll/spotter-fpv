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

/**
 * Drops local photo paths whose file is gone (e.g. picker cache paths saved by older
 * versions, which the system clears), so the map shows no empty thumbnails.
 * Remote URLs and paths that cannot be checked are kept.
 */
const dropMissingImages = async (spots: Spot[]): Promise<Spot[]> => {
  if (Platform.OS === 'web') return spots;

  const fileExists = async (uri: string) => {
    if (!uri.startsWith('file://')) return true;
    try {
      return (await FileSystem.getInfoAsync(uri)).exists;
    } catch {
      return true;
    }
  };

  return Promise.all(
    spots.map(async (spot) => {
      if (!spot.images || spot.images.length === 0) return spot;
      const exists = await Promise.all(spot.images.map(fileExists));
      return { ...spot, images: spot.images.filter((_, index) => exists[index]) };
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
        if (skipped > 0 && stored !== null) {
          console.warn(`Pominięto ${skipped} uszkodzonych wpisów spotów, kopia w ${BACKUP_KEY}`);
          // Awaited on purpose: the backup must exist before the first write of the list.
          // If it cannot be written, adding stays blocked (catch below) so the raw data survives.
          await AsyncStorage.setItem(BACKUP_KEY, stored);
        }
        const withImages = await dropMissingImages(loaded);
        // Merge instead of replace, so nothing added in the meantime is lost.
        const merged = mergeSpotsById(withImages, userSpotsRef.current);
        userSpotsRef.current = merged;
        setUserSpots(merged);
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
