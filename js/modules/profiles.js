// Birth profiles: validation and persistence (localStorage only, never sent anywhere).
import { isValidTimeZone } from './time.js';

const STORAGE_KEY = 'celeste-profiles-v1';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const DEFAULT_PROFILES = [
  {
    id: 'p1', name: 'Exemple · 13 avril 1992', date: '1992-04-13', time: '02:24',
    place: 'La Chaux-de-Fonds, Suisse', latitude: 47.0999, longitude: 6.8259, timeZone: 'Europe/Zurich',
  },
  {
    id: 'p2', name: 'Moi · 27 octobre 1993', date: '1993-10-27', time: '09:43',
    place: 'Lausanne, Suisse', latitude: 46.516, longitude: 6.6328, timeZone: 'Europe/Zurich',
  },
];

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return y >= 1800 && y <= 2200 && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

const isNumberIn = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const cleanText = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Returns a clean profile or null when the input is not acceptable.
export function validateProfile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = cleanText(raw.name, 40);
  const time = raw.time === null || raw.time === '' ? null : raw.time;
  if (!name || !isValidDate(raw.date)) return null;
  if (time !== null && !(typeof time === 'string' && TIME_RE.test(time))) return null;
  if (!isNumberIn(raw.latitude, -66, 66) || !isNumberIn(raw.longitude, -180, 180)) return null;
  if (typeof raw.timeZone !== 'string' || !isValidTimeZone(raw.timeZone)) return null;
  const id = typeof raw.id === 'string' && /^[\w-]{1,40}$/.test(raw.id) ? raw.id : `p${Date.now()}`;
  return {
    id, name, date: raw.date, time,
    place: cleanText(raw.place, 80),
    latitude: raw.latitude, longitude: raw.longitude, timeZone: raw.timeZone,
  };
}

export function loadProfiles(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILES.map((p) => ({ ...p }));
    const parsed = JSON.parse(raw);
    const profiles = Array.isArray(parsed) ? parsed.slice(0, 20).map(validateProfile).filter(Boolean) : [];
    return profiles.length ? profiles : DEFAULT_PROFILES.map((p) => ({ ...p }));
  } catch {
    return DEFAULT_PROFILES.map((p) => ({ ...p }));
  }
}

export function saveProfiles(profiles, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Storage unavailable: profiles live for this visit only.
  }
}

export function clearProfiles(storage = globalThis.localStorage) {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
