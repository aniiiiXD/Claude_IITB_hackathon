/**
 * Geolocation utilities for Nidaan.
 *
 * - haversineKm: straight-line distance between two lat/lon points
 * - getUserLocation: browser Geolocation API wrapper
 * - sortByDistance: attach distanceKm to any array with lat/lon and sort
 * - googleMapsDirectionsUrl: deep link to Google Maps turn-by-turn from current location
 * - getNearbyLabs: MapMyIndia Mappls Nearby API for nearest DBS collection centers
 *   Requires NEXT_PUBLIC_MAPPLS_API_KEY env var. Falls back to Dr. Lal PathLabs web locator.
 */

import { TreatmentCenter } from './centers';

export interface WithDistance<T> {
  item: T;
  distanceKm: number;
}

// ── Haversine formula ────────────────────────────────────────────────────────

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// ── Browser geolocation ──────────────────────────────────────────────────────

export interface UserLocation {
  lat: number;
  lon: number;
  accuracy: number; // metres
}

export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      err => reject(err),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  });
}

// ── Distance sort ────────────────────────────────────────────────────────────

export function sortCentersByDistance(
  centers: TreatmentCenter[],
  userLat: number,
  userLon: number
): WithDistance<TreatmentCenter>[] {
  return centers
    .map(c => ({ item: c, distanceKm: haversineKm(userLat, userLon, c.lat, c.lon) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// ── Navigation deep links ────────────────────────────────────────────────────

/** Opens Google Maps turn-by-turn from the user's current location to the center. */
export function googleMapsDirectionsUrl(center: TreatmentCenter): string {
  const dest = encodeURIComponent(`${center.name}, ${center.city}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_lat=${center.lat}&destination_lng=${center.lon}`;
}

/** Google Maps search link — useful when the exact address matters more than turn-by-turn. */
export function googleMapsSearchUrl(center: TreatmentCenter): string {
  return `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lon}`;
}

// ── MapMyIndia Mappls Nearby API ─────────────────────────────────────────────
// Docs: https://about.mappls.com/api/advanced-maps/doc/nearby-api
// Requires NEXT_PUBLIC_MAPPLS_API_KEY

export interface NearbyLab {
  name: string;
  address: string;
  distanceKm: number;
  phone?: string;
  mapsUrl: string;
}

async function getMapplsToken(apiKey: string): Promise<string> {
  const res = await fetch('https://outpost.mapmyindia.com/api/security/v3.0.5/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiKey,
    }),
  });
  if (!res.ok) throw new Error('Mappls token request failed');
  const data = await res.json();
  return data.access_token as string;
}

export async function getNearbyLabs(
  lat: number,
  lon: number,
  radiusKm = 25
): Promise<NearbyLab[]> {
  const apiKey = process.env.NEXT_PUBLIC_MAPPLS_API_KEY;

  if (!apiKey) {
    // Fallback: return a single link to Dr. Lal PathLabs locator
    return [{
      name: 'Find nearest DBS collection center',
      address: 'Dr. Lal PathLabs — 5,000+ centers across India',
      distanceKm: 0,
      mapsUrl: `https://labs.lalpathlabs.com/find-a-test-center`,
    }];
  }

  try {
    const token = await getMapplsToken(apiKey);
    const res = await fetch(
      `https://atlas.mapmyindia.com/api/places/nearby/json` +
        `?keywords=diagnostic+lab+pathology` +
        `&refLocation=${lat},${lon}` +
        `&radius=${radiusKm * 1000}` +
        `&sortBy=dist` +
        `&page=1` +
        `&pod=CITY`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Mappls nearby search failed');
    const data = await res.json();

    return (data.suggestedLocations ?? []).slice(0, 5).map((loc: Record<string, unknown>) => ({
      name: String(loc.placeName ?? ''),
      address: String(loc.placeAddress ?? ''),
      distanceKm: typeof loc.distance === 'number' ? loc.distance / 1000 : 0,
      phone: loc.tel ? String(loc.tel) : undefined,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`,
    }));
  } catch {
    return [{
      name: 'Find nearest collection center',
      address: 'Dr. Lal PathLabs — 5,000+ centers across India',
      distanceKm: 0,
      mapsUrl: 'https://labs.lalpathlabs.com/find-a-test-center',
    }];
  }
}
