// Natal chart wheel drawn as inline SVG. Ascendant on the left, zodiac counter-clockwise.
import { svg } from './dom.js';
import { SIGN_GLYPHS, normalize } from './chart.js';

const SIZE = 360;
const C = SIZE / 2;
const R_OUTER = 170;
const R_SIGNS = 140;
const R_PLANETS = 112;
const R_INNER = 88;
const DEG = Math.PI / 180;

const ASPECT_CLASS = {
  trine: 'soft', sextile: 'soft', square: 'hard', opposition: 'hard', conjunction: 'neutral',
};

function point(lon, radius, ascLon) {
  const theta = (180 + lon - ascLon) * DEG;
  return { x: C + radius * Math.cos(theta), y: C - radius * Math.sin(theta) };
}

// Spread glyphs that are too close so they stay readable.
function spread(planets, minGap = 8) {
  const sorted = [...planets].sort((a, b) => a.lon - b.lon).map((p) => ({ ...p, shown: p.lon }));
  for (let pass = 0; pass < 3; pass += 1) {
    for (let i = 1; i < sorted.length; i += 1) {
      const gap = sorted[i].shown - sorted[i - 1].shown;
      if (gap < minGap) sorted[i].shown = sorted[i - 1].shown + minGap;
    }
  }
  return sorted;
}

export function chartWheel(chart) {
  const ascLon = chart.angles ? chart.angles[0].lon : 0;
  const root = svg('svg', {
    viewBox: `0 0 ${SIZE} ${SIZE}`, class: 'wheel', role: 'img',
    'aria-label': 'Roue du thème astral',
  });
  root.append(
    svg('circle', { cx: C, cy: C, r: R_OUTER, class: 'wheel-ring' }),
    svg('circle', { cx: C, cy: C, r: R_SIGNS, class: 'wheel-ring' }),
    svg('circle', { cx: C, cy: C, r: R_INNER, class: 'wheel-ring' }),
  );

  for (let i = 0; i < 12; i += 1) {
    const a = point(i * 30, R_SIGNS, ascLon);
    const b = point(i * 30, R_OUTER, ascLon);
    root.append(svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'wheel-tick' }));
    const g = point(i * 30 + 15, (R_SIGNS + R_OUTER) / 2, ascLon);
    root.append(svg('text', { x: g.x, y: g.y, class: `wheel-sign el-${i % 4}`, text: SIGN_GLYPHS[i] }));
  }

  for (const { a, b, aspect } of chart.aspects) {
    if (a.key === 'asc' || a.key === 'mc' || b.key === 'asc' || b.key === 'mc') continue;
    const p1 = point(a.lon, R_INNER, ascLon);
    const p2 = point(b.lon, R_INNER, ascLon);
    root.append(svg('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: `wheel-aspect ${ASPECT_CLASS[aspect.key]}` }));
  }

  if (chart.angles) {
    for (const angle of chart.angles) {
      const a = point(angle.lon, R_INNER, ascLon);
      const b = point(angle.lon, R_OUTER + 6, ascLon);
      root.append(svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'wheel-axis' }));
      const t = point(angle.lon, R_OUTER + 4, ascLon);
      root.append(svg('text', { x: t.x, y: t.y, class: 'wheel-angle', text: angle.glyph }));
    }
  }

  for (const p of spread(chart.planets)) {
    const tick = point(p.lon, R_INNER, ascLon);
    const tick2 = point(p.lon, R_INNER + 6, ascLon);
    root.append(svg('line', { x1: tick.x, y1: tick.y, x2: tick2.x, y2: tick2.y, class: 'wheel-tick' }));
    const g = point(normalize(p.shown), R_PLANETS, ascLon);
    root.append(svg('text', { x: g.x, y: g.y, class: 'wheel-planet', text: p.glyph }, [
      svg('title', { text: p.name }),
    ]));
  }
  return root;
}
