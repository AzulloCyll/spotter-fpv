export const MOCK_BATTERY = {
  voltage: 16.4,
  current: 24.5,
  percentage: 85,
};

export const MOCK_SIGNAL = {
  rssi: -45,
  lq: 99,
};

export const MOCK_GPS_POSITION = {
  lat: 52.229782,
  lng: 21.012245,
  satellites: 18,
  altitude: 45,
  speed: 72,
  course: 120,
};

export const MOCK_IS_LINK_ACTIVE = true;
export const MOCK_VTX_TEMP = 68;
export const MOCK_CPU_RES = 12;

export const MOCK_WEATHER_DATA = {
  temp: 18,
  condition: "Słonecznie",
  feelsLike: 20,
  windSpeed: 12,
  windGusts: 22,
  kpIndex: 2.1,
  kpForecast: [
    { hour: "12:00", value: 1.2 },
    { hour: "15:00", value: 2.1 },
    { hour: "18:00", value: 2.5 },
    { hour: "21:00", value: 1.8 },
    { hour: "00:00", value: 1.5 },
    { hour: "03:00", value: 1.2 },
    { hour: "06:00", value: 1.0 },
    { hour: "09:00", value: 1.4 },
  ],
  visibility: 12,
  precipitation: 5,
  uvIndex: 3,
};

export const MOCK_LOCATION = {
  name: "Bemowo, Warszawa",
  lat: 52.2297,
  lng: 21.0122,
};

export const MOCK_MAP_STYLE_ID = "light";

export const MOCK_MESSAGES = [
  {
    id: "1",
    sender: "Marek",
    text: "Ktoś dzisiaj na Bemowie?",
    timestamp: "14:20",
  },
  {
    id: "2",
    sender: "Ty",
    text: "Ja będę za 30 min, biorę 5 cali i tinywhoopa.",
    timestamp: "14:22",
  },
  {
    id: "3",
    sender: "Andrzej",
    text: "Ja mogę koło 16:00. Macie wolne kanały?",
    timestamp: "14:25",
  },
  {
    id: "4",
    sender: "Marek",
    text: "R2 i R4 zajęte. Ja latam na R2.",
    timestamp: "14:26",
  },
  { id: "5", sender: "Ty", text: "To ja biorę R6.", timestamp: "14:28" },
];
