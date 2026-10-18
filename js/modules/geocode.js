// Place search through the Open-Meteo geocoding API (free, no key). Only the place name is sent.
const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

export function parseResults(data) {
  if (!data || !Array.isArray(data.results)) return [];
  return data.results
    .filter((r) => r && typeof r.name === 'string' && Number.isFinite(r.latitude)
      && Number.isFinite(r.longitude) && typeof r.timezone === 'string')
    .slice(0, 6)
    .map((r) => ({
      label: [r.name, r.admin1, r.country].filter((s) => typeof s === 'string' && s).join(', ').slice(0, 80),
      latitude: r.latitude,
      longitude: r.longitude,
      timeZone: r.timezone,
    }));
}

export async function searchPlace(query) {
  const name = query.trim().slice(0, 60);
  if (name.length < 2) return [];
  const url = `${ENDPOINT}?${new URLSearchParams({ name, count: '6', language: 'fr', format: 'json' })}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding failed (${response.status})`);
  return parseResults(await response.json());
}
