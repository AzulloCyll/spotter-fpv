import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export interface PhotoItem {
  id: string;
  uri: string;
  likes: number;
  isLiked: boolean;
}

const STORAGE_KEY = '@spotter_gallery_photos';
const GALLERY_DIR = `${FileSystem.documentDirectory}gallery/`;

export const useGalleryStorage = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Ładowanie danych przy starcie
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        // Przygotuj folder na zdjęcia jeśli nie istnieje
        const dirInfo = await FileSystem.getInfoAsync(GALLERY_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(GALLERY_DIR, {
            intermediates: true,
          });
        }

        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedPhotos = JSON.parse(saved) as PhotoItem[];
          // Usuwamy stare mockowane zdjęcia z listy (sprzątanie po refaktorze)
          const userPhotosOnly = parsedPhotos.filter((p) => !p.id.startsWith('mock-'));
          setPhotos(userPhotosOnly);

          // Fizycznie usuwamy pliki mocków jeśli istnieją na dysku
          const files = await FileSystem.readDirectoryAsync(GALLERY_DIR);
          for (const file of files) {
            if (file.startsWith('mock_')) {
              await FileSystem.deleteAsync(`${GALLERY_DIR}${file}`, {
                idempotent: true,
              });
            }
          }
        }
      } catch (e) {
        console.error('Failed to load photos', e);
      }
    };
    loadPhotos();
  }, []);

  // Zapisywanie przy każdej zmianie photos
  useEffect(() => {
    const saveToStorage = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
      } catch (e) {
        console.error('Failed to save photos', e);
      }
    };
    if (photos.length > 0) {
      saveToStorage();
    }
  }, [photos]);

  const addPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Brak uprawnień', 'Potrzebujemy dostępu do galerii, abyś mógł dodać zdjęcie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsUploading(true);
      try {
        const pickedUri = result.assets[0].uri;
        const fileName = pickedUri.split('/').pop() || `photo_${Date.now()}.jpg`;
        const permanentUri = `${GALLERY_DIR}${fileName}`;

        await FileSystem.copyAsync({
          from: pickedUri,
          to: permanentUri,
        });

        // Symulacja opóźnienia dla UX
        setTimeout(() => {
          const newPhoto: PhotoItem = {
            id: Date.now().toString(),
            uri: permanentUri,
            likes: 0,
            isLiked: false,
          };
          setPhotos((prev) => [newPhoto, ...prev]);
          setIsUploading(false);
        }, 1000);
      } catch (error) {
        console.error('Error saving image:', error);
        Alert.alert('Błąd', 'Nie udało się zapisać zdjęcia.');
        setIsUploading(false);
      }
    }
  };

  const toggleLike = (id: string) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === id) {
          const newIsLiked = !photo.isLiked;
          return {
            ...photo,
            isLiked: newIsLiked,
            likes: newIsLiked ? photo.likes + 1 : photo.likes - 1,
          };
        }
        return photo;
      }),
    );
  };

  const getFilesDebug = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(GALLERY_DIR);
      return files;
    } catch (e) {
      return [];
    }
  };

  return {
    photos,
    isUploading,
    addPhoto,
    toggleLike,
    getFilesDebug,
  };
};
