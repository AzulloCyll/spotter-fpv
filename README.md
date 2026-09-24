# Spotter FPV

Aplikacja dla pilotów dronów FPV: mapa miejscówek do latania, pogoda oceniana pod kątem bezpieczeństwa lotu i galeria zdjęć. Expo / React Native — iOS, Android i przeglądarka z jednego kodu.

Plany rozwoju: backlog projektu jest na tablicy kanban Sternika, zarządzanej z `~/Developer/_sternik`.

## Wymagania

- Node.js >= 18
- Aplikacja **Expo Go** na telefonie (do podglądu bez builda natywnego)
- Xcode (iOS) albo Android Studio — tylko jeśli chcesz build natywny

## Uruchomienie

```bash
npm install
cp .env.example .env    # opcjonalne, patrz niżej
npm start
```

Po uruchomieniu wybierz platformę klawiszem w terminalu: `i` (iOS), `a` (Android), `w` (przeglądarka). Telefon w tej samej sieci Wi-Fi: zeskanuj kod QR aplikacją Expo Go.

| Komenda | Do czego |
| --- | --- |
| `npm start` | serwer deweloperski Expo |
| `npm run ios` / `npm run android` | build natywny na urządzenie lub emulator |
| `npm run web` | wersja przeglądarkowa |
| `npm run tunnel` | podgląd na telefonie spoza sieci lokalnej |
| `npm run lint` | ESLint |

## Zmienne środowiskowe

Jedna, opcjonalna — opis w [`.env.example`](./.env.example).

Bez `EXPO_PUBLIC_WEATHER_API_KEY` aplikacja działa normalnie: mapa, spoty, radar opadów, prognoza i galeria nie wymagają żadnego klucza. Nie zadziała tylko przełącznik **Wiatr** nakładany na mapę.

## Skąd biorą się dane

| Dane | Źródło | Klucz |
| --- | --- | --- |
| Pogoda i prognozy | [Open-Meteo](https://open-meteo.com/) | nie |
| Indeks Kp (burze geomagnetyczne) | [NOAA SWPC](https://www.swpc.noaa.gov/) | nie |
| Strefy lotnicze na mapie | [OpenFlightMaps](https://www.openflightmaps.org/) | nie |
| Radar opadów na mapie | [RainViewer](https://www.rainviewer.com/) | nie |
| Warstwa wiatru na mapie | OpenWeatherMap | **tak** |

Indeks Kp jest tu nieprzypadkowo: burze geomagnetyczne psują odbiór GPS, a dron bez GPS traci utrzymywanie pozycji.

Backendu nie ma. Spoty dodane przez użytkownika i galeria zapisują się na urządzeniu.

## Struktura

```
src/
  components/    atoms → molecules → organisms (atomic design)
  screens/       Home, Mapa, Pogoda, Telemetria, Czat
  hooks/         useWeather, useGalleryStorage, useIsTablet
  context/       SpotsContext, ThemeContext
  data/          spoty demonstracyjne
```

Mapa istnieje w dwóch wariantach: `MapScreen.tsx` rysuje Leafletem w WebView (natywnie), `MapScreen.web.tsx` używa `pigeon-maps` (przeglądarka). Bundler wybiera plik po rozszerzeniu — zmiana zachowania mapy wymaga poprawki w obu.
