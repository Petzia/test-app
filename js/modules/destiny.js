// "Destiny" helpers: mean lunar North Node and numerology life path number.
import * as Astronomy from '../vendor/astronomy.js';
import { normalize, signIndex } from './chart.js';

// Mean North Node longitude (Meeus, Astronomical Algorithms, ch. 47).
export function northNode(date) {
  const t = Astronomy.MakeTime(date).tt / 36525;
  const lon = normalize(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + (t ** 3) / 467441);
  return { key: 'node', name: 'Nœud Nord', glyph: '☊', lon, sign: signIndex(lon) };
}

const MASTER_NUMBERS = new Set([11, 22, 33]);

// Sum every digit of the birth date, then reduce to 1–9, keeping master numbers 11, 22 and 33.
export function lifePathNumber(isoDate) {
  let n = [...isoDate.replace(/\D/g, '')].reduce((sum, digit) => sum + Number(digit), 0);
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    n = [...String(n)].reduce((sum, digit) => sum + Number(digit), 0);
  }
  return n;
}
