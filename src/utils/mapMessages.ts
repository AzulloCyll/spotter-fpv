// Messages the map page (a WebView on native, an iframe on web) may send to the app,
// and the commands the app sends back. The page loads third-party scripts,
// so anything arriving from it is untrusted: only these two shapes are accepted, and
// a spot is never taken from the message (only its id, resolved in the app).

export type MapMessage =
  | { type: 'MARKER_PRESS'; id: string }
  | { type: 'MAP_MOVE'; center: { lat: number; lng: number }; zoom: number };

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export function parseMapMessage(raw: unknown): MapMessage | null {
  if (typeof raw !== 'string') return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const msg = data as Record<string, unknown>;

  if (msg.type === 'MARKER_PRESS') {
    return typeof msg.id === 'string' && msg.id.length > 0
      ? { type: 'MARKER_PRESS', id: msg.id }
      : null;
  }

  if (msg.type === 'MAP_MOVE') {
    const payload = msg.payload as Record<string, unknown> | null | undefined;
    const center = payload?.center as Record<string, unknown> | null | undefined;
    if (
      center &&
      isFiniteNumber(center.lat) &&
      isFiniteNumber(center.lng) &&
      isFiniteNumber(payload?.zoom)
    ) {
      return {
        type: 'MAP_MOVE',
        center: { lat: center.lat, lng: center.lng },
        zoom: payload.zoom as number,
      };
    }
    return null;
  }

  return null;
}

/**
 * Web only: whether a window `message` event came from the map's own iframe. The iframe
 * is sandboxed without allow-same-origin, so its origin is the opaque "null"; any other
 * window (another frame, a browser extension, the app itself) is ignored.
 */
export function isFromMapFrame(
  event: { source: unknown; origin: string },
  frameWindow: unknown,
): boolean {
  return frameWindow != null && event.source === frameWindow && event.origin === 'null';
}

// Commands the app sends to the map page (handled by handleCommand in leafletMapHtml.ts).
export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  type: string;
}

export type MapCommand =
  | { type: 'markers'; markers: MarkerData[] }
  | { type: 'layers'; styleId: string; ofm: boolean; rain: boolean; wind: boolean }
  | { type: 'setView'; lat: number; lng: number; zoom: number }
  | {
      type: 'fitBounds';
      sw: { lat: number; lng: number };
      ne: { lat: number; lng: number };
    }
  | { type: 'userTarget'; lat: number; lng: number };

/** Only what the page needs to draw a marker; names, photos and notes stay in the app. */
export function toMarkerData(
  spots: {
    id: string;
    type: string;
    coordinates: { latitude: number; longitude: number };
  }[],
): MarkerData[] {
  return spots.map((spot) => ({
    id: spot.id,
    lat: spot.coordinates.latitude,
    lng: spot.coordinates.longitude,
    type: spot.type,
  }));
}
