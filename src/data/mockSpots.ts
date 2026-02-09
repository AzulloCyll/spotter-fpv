export type SpotType = "bando" | "nature" | "park" | "urban";

export interface Spot {
  id: string;
  name: string;
  description: string;
  type: SpotType;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  images?: string[];
}

export const MOCK_SPOTS: Spot[] = [
  {
    id: "1",
    name: 'Opuszczona Fabryka "Ursus"',
    description:
      "Klasyczne bando z dużą ilością betonu i otwartych przestrzeni. Idealne do nauki dive'ów.",
    type: "bando",
    difficulty: "medium",
    coordinates: {
      latitude: 52.2005,
      longitude: 20.8805,
    },
    rating: 4.8,
    images: [
      "https://picsum.photos/300/200?random=1",
      "https://picsum.photos/300/200?random=2",
    ],
  },
  {
    id: "2",
    name: "Pola Mokotowskie - Polana",
    description:
      "Duży park w centrum. Uwaga na spacerowiczów i psy! Latać tylko rano lub w nocy.",
    type: "park",
    difficulty: "easy",
    coordinates: {
      latitude: 52.219,
      longitude: 21.0,
    },
    rating: 3.5,
    images: ["https://picsum.photos/300/200?random=3"],
  },
  {
    id: "3",
    name: "Most Siekierkowski (Pod)",
    description:
      "Techniczne latanie między filarami mostu. Wymagany dobry link wideo.",
    type: "urban",
    difficulty: "hard",
    coordinates: {
      latitude: 52.213,
      longitude: 21.095,
    },
    rating: 4.2,
    images: ["https://picsum.photos/300/200?random=4"],
  },
  {
    id: "4",
    name: "Górka Kazurka",
    description:
      "Popularne miejsce na Ursynowie. Otwarte pole, drzewa, czasem tory rowerowe.",
    type: "nature",
    difficulty: "medium",
    coordinates: {
      latitude: 52.1445,
      longitude: 21.045,
    },
    rating: 4.5,
    images: ["https://picsum.photos/300/200?random=5"],
  },
  {
    id: "5",
    name: "Stary Fort",
    description:
      "Zabytkowe fortyfikacje, ciasne korytarze i dużo cegły. Tylko dla cyfrowego wideo.",
    type: "bando",
    difficulty: "extreme",
    coordinates: {
      latitude: 52.18,
      longitude: 21.06,
    },
    rating: 4.9,
    images: [
      "https://picsum.photos/300/200?random=6",
      "https://picsum.photos/300/200?random=7",
    ],
  },
];
