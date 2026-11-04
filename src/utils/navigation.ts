// Route links for the "Nawiguj" button. Each URL opens the maps app (or the maps
// site) with directions to the given point; the start is the user's current position.

export const googleMapsRouteUrl = (latitude: number, longitude: number): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

export const appleMapsRouteUrl = (latitude: number, longitude: number): string =>
  `http://maps.apple.com/?daddr=${latitude},${longitude}`;
