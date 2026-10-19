// Small validated wrapper around localStorage (it may be unavailable in private mode).
const PREFIX = 'doodle-';

export function readNumber(key, fallback = 0) {
  try {
    const value = Number.parseInt(localStorage.getItem(PREFIX + key) ?? '', 10);
    return Number.isFinite(value) && value >= 0 && value < 1e9 ? value : fallback;
  } catch {
    return fallback;
  }
}

export function readFlag(key, fallback = false) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value === null ? fallback : value === '1';
  } catch {
    return fallback;
  }
}

// The astrology app that used to live on this origin stored birth data; remove it.
export function removeLegacyData() {
  try {
    localStorage.removeItem('celeste-profiles-v1');
  } catch {
    // Nothing to remove.
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
  } catch {
    // Storage unavailable: settings just aren't kept.
  }
}
