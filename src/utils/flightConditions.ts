/**
 * Ocena Go / No-Go na podstawie bieżącej pogody.
 * Progi i zasady ustalone przez właściciela (Z-011):
 * wynik = najgorszy czynnik, czynnik bez danych = UWAGA (wynik nigdy nie jest wtedy GO).
 */

export type FlightStatusLevel = 'go' | 'caution' | 'nogo';

export interface FlightInputs {
  /** km/h, 10 m */
  windSpeed: number | null;
  /** km/h, 10 m */
  windGusts: number | null;
  kpIndex: number | null;
  /** km */
  visibility: number | null;
  /** Najwyższa szansa opadów w najbliższej godzinie, % */
  precipitationProbability: number | null;
  /** Suma opadów w najbliższej godzinie, mm */
  precipitationAmount: number | null;
}

export interface FlightFactor {
  key: 'wind' | 'gusts' | 'kp' | 'visibility' | 'precipitation';
  label: string;
  value: string;
  level: FlightStatusLevel;
  missing: boolean;
}

export interface FlightAssessment {
  level: FlightStatusLevel;
  factors: FlightFactor[];
}

export const FLIGHT_THRESHOLDS = {
  wind: { caution: 25, nogo: 40 },
  gusts: { caution: 35, nogo: 50 },
  kp: { caution: 4, nogo: 5 },
  visibility: { caution: 3, nogo: 1 },
  precipitationProbability: { caution: 40, nogo: 70 },
  precipitationAmount: { caution: 0, nogo: 1 },
} as const;

const RANK: Record<FlightStatusLevel, number> = { go: 0, caution: 1, nogo: 2 };

const isNum = (v: number | null): v is number => typeof v === 'number' && Number.isFinite(v);

/** Wyżej = gorzej (wiatr, porywy, Kp). */
const levelAbove = (v: number, t: { caution: number; nogo: number }): FlightStatusLevel =>
  v >= t.nogo ? 'nogo' : v >= t.caution ? 'caution' : 'go';

const missingFactor = (key: FlightFactor['key'], label: string): FlightFactor => ({
  key,
  label,
  value: 'brak danych',
  level: 'caution',
  missing: true,
});

export const assessFlightConditions = (inputs: FlightInputs): FlightAssessment => {
  const T = FLIGHT_THRESHOLDS;
  const factors: FlightFactor[] = [];

  factors.push(
    isNum(inputs.windSpeed)
      ? {
          key: 'wind',
          label: 'Wiatr',
          value: `${Math.round(inputs.windSpeed)} km/h`,
          level: levelAbove(inputs.windSpeed, T.wind),
          missing: false,
        }
      : missingFactor('wind', 'Wiatr'),
  );

  factors.push(
    isNum(inputs.windGusts)
      ? {
          key: 'gusts',
          label: 'Porywy',
          value: `${Math.round(inputs.windGusts)} km/h`,
          level: levelAbove(inputs.windGusts, T.gusts),
          missing: false,
        }
      : missingFactor('gusts', 'Porywy'),
  );

  factors.push(
    isNum(inputs.kpIndex)
      ? {
          key: 'kp',
          label: 'Kp',
          value: inputs.kpIndex.toFixed(1),
          level: levelAbove(inputs.kpIndex, T.kp),
          missing: false,
        }
      : missingFactor('kp', 'Kp'),
  );

  factors.push(
    isNum(inputs.visibility)
      ? {
          key: 'visibility',
          label: 'Widoczność',
          value: `${inputs.visibility.toFixed(1)} km`,
          level:
            inputs.visibility < T.visibility.nogo
              ? 'nogo'
              : inputs.visibility < T.visibility.caution
                ? 'caution'
                : 'go',
          missing: false,
        }
      : missingFactor('visibility', 'Widoczność'),
  );

  if (isNum(inputs.precipitationProbability) && isNum(inputs.precipitationAmount)) {
    const p = inputs.precipitationProbability;
    const mm = inputs.precipitationAmount;
    // Opady: UWAGA już przy jakiejkolwiek ilości (> 0 mm), NO-GO od 1 mm w godzinę.
    const level: FlightStatusLevel =
      p >= T.precipitationProbability.nogo || mm >= T.precipitationAmount.nogo
        ? 'nogo'
        : p >= T.precipitationProbability.caution || mm > T.precipitationAmount.caution
          ? 'caution'
          : 'go';
    factors.push({
      key: 'precipitation',
      label: 'Opady (1 h)',
      value: `${Math.round(p)}% • ${mm.toFixed(1)} mm`,
      level,
      missing: false,
    });
  } else {
    factors.push(missingFactor('precipitation', 'Opady (1 h)'));
  }

  const level = factors.reduce<FlightStatusLevel>(
    (worst, f) => (RANK[f.level] > RANK[worst] ? f.level : worst),
    'go',
  );

  return { level, factors };
};
