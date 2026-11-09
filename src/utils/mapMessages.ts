// Messages the map WebView may send to the app. The page loads third-party scripts,
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
