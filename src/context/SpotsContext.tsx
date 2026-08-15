import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spot, MOCK_SPOTS } from '../data/mockSpots';

const STORAGE_KEY = '@spotter_user_spots';

interface SpotsContextType {
  spots: Spot[];
  addSpot: (spot: Spot) => void;
  /** Dopóki trwa, lista zawiera same spoty demonstracyjne. */
  isLoading: boolean;
}

const SpotsContext = createContext<SpotsContextType | undefined>(undefined);

export const SpotsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Zapisujemy wyłącznie spoty dodane przez użytkownika, a demonstracyjne
  // doklejamy przy odczycie. Trzymanie kopii MOCK_SPOTS na dysku sprawiłoby,
  // że zmiany w danych demo nie dotarłyby do nikogo, kto już uruchomił aplikację.
  const [userSpots, setUserSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSpots = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUserSpots(JSON.parse(stored) as Spot[]);
        }
      } catch (error) {
        // Uszkodzony wpis nie może zablokować mapy - zostają same spoty demo.
        console.warn('Nie udało się wczytać zapisanych spotów:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpots();
  }, []);

  const addSpot = (spot: Spot) => {
    setUserSpots((previous) => {
      const next = [...previous, spot];
      // Zapis bez await: mapa ma zareagować od razu, a nieudany zapis oznacza
      // utratę spota po restarcie, nie zawieszony interfejs.
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error) => {
        console.warn('Nie udało się zapisać spota:', error);
      });
      return next;
    });
  };

  const spots = [...MOCK_SPOTS, ...userSpots];

  return (
    <SpotsContext.Provider value={{ spots, addSpot, isLoading }}>{children}</SpotsContext.Provider>
  );
};

export const useSpots = () => {
  const context = useContext(SpotsContext);
  if (context === undefined) {
    throw new Error('useSpots must be used within a SpotsProvider');
  }
  return context;
};
