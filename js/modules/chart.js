// Astrology calculations on top of astronomy-engine (tropical zodiac, Whole Sign houses).
import * as Astronomy from '../vendor/astronomy.js';

export const SIGNS = [
  'Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge',
  'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons',
];
export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((g) => `${g}\uFE0E`);
export const ELEMENTS = ['feu', 'terre', 'air', 'eau'];

export const PLANETS = [
  { key: 'sun', body: 'Sun', name: 'Soleil', glyph: '☉' },
  { key: 'moon', body: 'Moon', name: 'Lune', glyph: '☽' },
  { key: 'mercury', body: 'Mercury', name: 'Mercure', glyph: '☿' },
  { key: 'venus', body: 'Venus', name: 'Vénus', glyph: '♀' },
  { key: 'mars', body: 'Mars', name: 'Mars', glyph: '♂' },
  { key: 'jupiter', body: 'Jupiter', name: 'Jupiter', glyph: '♃' },
  { key: 'saturn', body: 'Saturn', name: 'Saturne', glyph: '♄' },
  { key: 'uranus', body: 'Uranus', name: 'Uranus', glyph: '♅' },
  { key: 'neptune', body: 'Neptune', name: 'Neptune', glyph: '♆' },
  { key: 'pluto', body: 'Pluto', name: 'Pluton', glyph: '♇' },
];
export const ANGLES = [
  { key: 'asc', name: 'Ascendant', glyph: 'AC' },
  { key: 'mc', name: 'Milieu du Ciel', glyph: 'MC' },
];

export const ASPECTS = [
  { key: 'conjunction', name: 'conjonction', angle: 0, orb: 8, glyph: '☌' },
  { key: 'sextile', name: 'sextile', angle: 60, orb: 4, glyph: '⚹' },
  { key: 'square', name: 'carré', angle: 90, orb: 7, glyph: '□' },
  { key: 'trine', name: 'trigone', angle: 120, orb: 7, glyph: '△' },
  { key: 'opposition', name: 'opposition', angle: 180, orb: 8, glyph: '☍' },
];

const DEG = Math.PI / 180;
const DAY_MS = 86400000;

export const normalize = (deg) => ((deg % 360) + 360) % 360;
export const signIndex = (lon) => Math.floor(normalize(lon) / 30);
export const elementOf = (sign) => ELEMENTS[sign % 4];

// 23.5° → "23°30'"
export function formatDegree(lon) {
  const inSign = normalize(lon) % 30;
  let d = Math.floor(inSign);
  let m = Math.round((inSign - d) * 60);
  if (m === 60) {
    d += 1;
    m = 0;
  }
  return `${d}°${String(m).padStart(2, '0')}'`;
}

export function separation(a, b) {
  const diff = Math.abs(normalize(a) - normalize(b));
  return diff > 180 ? 360 - diff : diff;
}

// Returns the closest matching aspect within orb (scaled by orbFactor), or null.
export function findAspect(lonA, lonB, orbFactor = 1) {
  const sep = separation(lonA, lonB);
  let best = null;
  for (const aspect of ASPECTS) {
    const orb = Math.abs(sep - aspect.angle);
    if (orb <= aspect.orb * orbFactor && (!best || orb < best.orb)) best = { ...aspect, orb };
  }
  return best;
}

export function planetLongitude(body, date) {
  const vector = Astronomy.GeoVector(body, date, true);
  return normalize(Astronomy.Ecliptic(vector).elon);
}

export function isRetrograde(body, date) {
  if (body === 'Sun' || body === 'Moon') return false;
  const before = planetLongitude(body, new Date(date.getTime() - DAY_MS / 2));
  const after = planetLongitude(body, new Date(date.getTime() + DAY_MS / 2));
  const motion = ((after - before + 540) % 360) - 180;
  return motion < 0;
}

export function planetPositions(date) {
  return PLANETS.map((p) => {
    const lon = planetLongitude(p.body, date);
    return { ...p, lon, sign: signIndex(lon), retrograde: isRetrograde(p.body, date) };
  });
}

// Ascendant and Midheaven from local apparent sidereal time, latitude and true obliquity.
export function chartAngles(date, latitude, longitude) {
  const time = Astronomy.MakeTime(date);
  const ramc = normalize(Astronomy.SiderealTime(time) * 15 + longitude) * DEG;
  const eps = Astronomy.e_tilt(time).tobl * DEG;
  const phi = latitude * DEG;
  const mc = normalize(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / DEG);
  const asc = normalize(
    Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / DEG,
  );
  return { asc, mc };
}

export function aspectsBetween(pointsA, pointsB, { sameChart = false, orbFactor = 1 } = {}) {
  const found = [];
  pointsA.forEach((a, i) => {
    pointsB.forEach((b, j) => {
      if (sameChart && j <= i) return;
      const aspect = findAspect(a.lon, b.lon, orbFactor);
      if (aspect) found.push({ a, b, aspect });
    });
  });
  return found.sort((x, y) => x.aspect.orb - y.aspect.orb);
}

// birth: { utc: Date, latitude, longitude, timeKnown }
export function natalChart(birth) {
  const planets = planetPositions(birth.utc);
  const chart = { planets, angles: null, ascSign: null };
  if (birth.timeKnown) {
    const { asc, mc } = chartAngles(birth.utc, birth.latitude, birth.longitude);
    chart.ascSign = signIndex(asc);
    chart.angles = [
      { ...ANGLES[0], lon: asc, sign: signIndex(asc) },
      { ...ANGLES[1], lon: mc, sign: signIndex(mc) },
    ];
    // Whole Sign houses: the rising sign is the 1st house.
    for (const p of planets) p.house = ((p.sign - chart.ascSign + 12) % 12) + 1;
  }
  const points = birth.timeKnown ? [...planets, ...chart.angles] : planets;
  chart.points = points;
  chart.aspects = aspectsBetween(points, points, { sameChart: true }).filter(
    ({ a, b }) => !(a.key === 'asc' && b.key === 'mc'),
  );
  return chart;
}

const MOON_PHASES = [
  { max: 22.5, name: 'Nouvelle Lune', icon: '🌑' },
  { max: 67.5, name: 'Premier croissant', icon: '🌒' },
  { max: 112.5, name: 'Premier quartier', icon: '🌓' },
  { max: 157.5, name: 'Lune gibbeuse croissante', icon: '🌔' },
  { max: 202.5, name: 'Pleine Lune', icon: '🌕' },
  { max: 247.5, name: 'Lune gibbeuse décroissante', icon: '🌖' },
  { max: 292.5, name: 'Dernier quartier', icon: '🌗' },
  { max: 337.5, name: 'Dernier croissant', icon: '🌘' },
  { max: 360, name: 'Nouvelle Lune', icon: '🌑' },
];

export function moonPhase(date) {
  const angle = Astronomy.MoonPhase(date);
  return { angle, ...MOON_PHASES.find((p) => angle < p.max) };
}

// Sign changes and retrograde stations in the coming days, sampled once per day.
export function upcomingEvents(start, days) {
  const events = [];
  let previous = planetPositions(start);
  for (let i = 1; i <= days; i += 1) {
    const date = new Date(start.getTime() + i * DAY_MS);
    const current = planetPositions(date);
    current.forEach((p, idx) => {
      const before = previous[idx];
      if (p.key !== 'moon' && p.sign !== before.sign) events.push({ date, type: 'ingress', planet: p });
      if (p.retrograde !== before.retrograde) {
        events.push({ date, type: p.retrograde ? 'retrograde' : 'direct', planet: p });
      }
    });
    previous = current;
  }
  return events;
}

const TRANSIT_WEIGHT = {
  moon: 1, sun: 2, mercury: 2, venus: 2, mars: 3, jupiter: 3, saturn: 4, uranus: 4, neptune: 4, pluto: 4,
};
const TARGET_WEIGHT = { sun: 3, moon: 3, asc: 3, venus: 2, mars: 2, mercury: 2, mc: 2 };

// Transits of the sky at `date` to the natal points, strongest first.
export function transits(chart, date) {
  const sky = planetPositions(date);
  return aspectsBetween(sky, chart.points, { orbFactor: 0.25 })
    .map((t) => ({
      transit: t.a,
      natal: t.b,
      aspect: t.aspect,
      score: (TRANSIT_WEIGHT[t.a.key] + (TARGET_WEIGHT[t.b.key] ?? 1)) * (1 - t.aspect.orb / (t.aspect.orb + 1)),
    }))
    .sort((x, y) => y.score - x.score);
}

const HARMONY = { trine: 1, sextile: 0.8, conjunction: 0.6, square: -0.7, opposition: -0.4 };
const PAIR_WEIGHT = {
  'sun-moon': 3, 'moon-sun': 3, 'venus-mars': 3, 'mars-venus': 3, 'moon-moon': 2.5, 'sun-sun': 2,
  'venus-venus': 2, 'moon-venus': 2, 'venus-moon': 2, 'sun-venus': 2, 'venus-sun': 2,
  'sun-asc': 2, 'asc-sun': 2, 'moon-asc': 2, 'asc-moon': 2, 'venus-asc': 2, 'asc-venus': 2,
  'mars-mars': 1.5, 'mercury-mercury': 1.5, 'saturn-moon': 1.5, 'moon-saturn': 1.5,
  'saturn-venus': 1.5, 'venus-saturn': 1.5, 'saturn-sun': 1.5, 'sun-saturn': 1.5,
};
const PERSONAL = new Set(['sun', 'moon', 'mercury', 'venus', 'mars', 'asc']);

// Synastry: cross-aspects between two charts, with a 0–100 harmony score.
export function synastry(chartA, chartB) {
  const pick = (chart) => chart.points.filter((p) => PERSONAL.has(p.key) || p.key === 'saturn' || p.key === 'jupiter');
  const links = aspectsBetween(pick(chartA), pick(chartB), { orbFactor: 0.75 }).map((l) => {
    const weight = PAIR_WEIGHT[`${l.a.key}-${l.b.key}`] ?? 1;
    const tight = 1 - l.aspect.orb / (l.aspect.orb + 2);
    return { ...l, weight, value: HARMONY[l.aspect.key] * weight * tight };
  });
  const total = links.reduce((sum, l) => sum + l.value, 0);
  const score = Math.round(100 / (1 + Math.exp(-total / 6)));
  const byImportance = [...links].sort((x, y) => Math.abs(y.value) - Math.abs(x.value));
  return {
    score,
    links: byImportance,
    harmonious: byImportance.filter((l) => l.value > 0),
    challenging: byImportance.filter((l) => l.value < 0),
  };
}
