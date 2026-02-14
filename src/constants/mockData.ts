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
  precipitationForecast: [
    { time: "14:30", amount: 0, probability: 0, type: "none" },
    { time: "14:45", amount: 0.1, probability: 10, type: "rain" },
    { time: "15:00", amount: 0.5, probability: 30, type: "rain" },
    { time: "15:15", amount: 1.2, probability: 60, type: "rain" },
    { time: "15:30", amount: 0.8, probability: 45, type: "rain" },
    { time: "15:45", amount: 0.2, probability: 15, type: "rain" },
    { time: "16:00", amount: 0, probability: 5, type: "none" },
  ] as any[],
  windForecast: [
    { time: "14:30", speed: 12, gust: 18, direction: 120 },
    { time: "14:45", speed: 14, gust: 20, direction: 125 },
    { time: "15:00", speed: 15, gust: 22, direction: 130 },
    { time: "15:15", speed: 18, gust: 28, direction: 135 },
    { time: "15:30", speed: 16, gust: 25, direction: 130 },
    { time: "15:45", speed: 14, gust: 20, direction: 125 },
    { time: "16:00", speed: 12, gust: 18, direction: 120 },
  ],
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
