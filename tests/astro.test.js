import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as Astronomy from '../js/vendor/astronomy.js';
import { localToUtc, formatOffset } from '../js/modules/time.js';
import {
  natalChart, chartAngles, signIndex, findAspect, separation, formatDegree, synastry,
  transits, upcomingEvents, moonPhase,
} from '../js/modules/chart.js';
import { validateProfile, loadProfiles, DEFAULT_PROFILES } from '../js/modules/profiles.js';
import { parseResults } from '../js/modules/geocode.js';

const chartOf = (p) => natalChart({
  ...localToUtc(p.date, p.time, p.timeZone), latitude: p.latitude, longitude: p.longitude, timeKnown: true,
});

test('localToUtc applies historical Swiss DST', () => {
  const summer = localToUtc('1992-04-13', '02:24', 'Europe/Zurich');
  assert.equal(summer.utc.toISOString(), '1992-04-13T00:24:00.000Z');
  assert.equal(summer.offsetMinutes, 120);
  // In 1993 European summer time ended on 26 September.
  const winter = localToUtc('1993-10-27', '09:43', 'Europe/Zurich');
  assert.equal(winter.utc.toISOString(), '1993-10-27T08:43:00.000Z');
  assert.equal(formatOffset(winter.offsetMinutes), 'UTC+01:00');
});

test('sign and degree helpers', () => {
  assert.equal(signIndex(0), 0);
  assert.equal(signIndex(359.9), 11);
  assert.equal(signIndex(-1), 11);
  assert.equal(formatDegree(23.5), "23°30'");
  assert.equal(formatDegree(29.9999), "29°59'");
  assert.equal(separation(350, 10), 20);
});

test('findAspect picks the closest aspect within orb', () => {
  assert.equal(findAspect(0, 121).key, 'trine');
  assert.equal(findAspect(10, 190).key, 'opposition');
  assert.equal(findAspect(0, 45), null);
  assert.equal(findAspect(0, 125, 0.25), null);
});

test('natal chart matches known ephemeris values', () => {
  const a = chartOf(DEFAULT_PROFILES[0]);
  assert.equal(a.planets[0].sign, 0); // Sun in Aries
  assert.ok(Math.abs(a.planets[0].lon - 23.33) < 0.1);
  assert.equal(a.planets[5].retrograde, true); // Jupiter retrograde in Virgo, April 1992
  const b = chartOf(DEFAULT_PROFILES[1]);
  assert.equal(b.planets[0].sign, 7); // Sun in Scorpio
  assert.equal(b.planets[2].retrograde, true); // Mercury retrograde, late October 1993
  assert.equal(b.planets[2].sign, 7);
});

test('ascendant lies on the eastern horizon', () => {
  const date = new Date('1992-04-13T00:24:00Z');
  const lat = 47.0999;
  const lon = 6.8259;
  const { asc, mc } = chartAngles(date, lat, lon);
  const time = Astronomy.MakeTime(date);
  const eps = (Astronomy.e_tilt(time).tobl * Math.PI) / 180;
  const toHorizon = (lambda) => {
    const l = (lambda * Math.PI) / 180;
    const ra = (Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l)) * 180) / Math.PI / 15;
    const dec = (Math.asin(Math.sin(eps) * Math.sin(l)) * 180) / Math.PI;
    return Astronomy.Horizon(time, new Astronomy.Observer(lat, lon, 0), (ra + 24) % 24, dec);
  };
  const h = toHorizon(asc);
  assert.ok(Math.abs(h.altitude) < 0.05, `altitude ${h.altitude}`);
  assert.ok(h.azimuth > 0 && h.azimuth < 180, `azimuth ${h.azimuth}`);
  assert.ok(Math.abs(toHorizon(mc).azimuth - 180) < 0.1);
});

test('whole sign houses start at the rising sign', () => {
  const chart = chartOf(DEFAULT_PROFILES[0]);
  for (const p of chart.planets) assert.equal(p.house, ((p.sign - chart.ascSign + 12) % 12) + 1);
});

test('unknown birth time skips angles and houses', () => {
  const p = DEFAULT_PROFILES[0];
  const chart = natalChart({ ...localToUtc(p.date, '12:00', p.timeZone), latitude: p.latitude, longitude: p.longitude, timeKnown: false });
  assert.equal(chart.angles, null);
  assert.equal(chart.planets[0].house, undefined);
});

test('synastry score stays between 0 and 100 and is symmetric enough', () => {
  const [a, b] = DEFAULT_PROFILES.map(chartOf);
  const s = synastry(a, b);
  assert.ok(s.score >= 0 && s.score <= 100);
  assert.ok(s.links.length > 0);
  assert.ok(Math.abs(synastry(b, a).score - s.score) <= 2);
});

test('transits are sorted by strength and use tight orbs', () => {
  const chart = chartOf(DEFAULT_PROFILES[1]);
  const list = transits(chart, new Date('2026-10-18T12:00:00Z'));
  for (let i = 1; i < list.length; i += 1) assert.ok(list[i - 1].score >= list[i].score);
  for (const t of list) assert.ok(t.aspect.orb <= 2);
});

test('upcoming events detect a known Mercury retrograde station', () => {
  // Mercury stationed retrograde around 25 October 1993.
  const events = upcomingEvents(new Date('1993-10-15T12:00:00Z'), 20);
  assert.ok(events.some((e) => e.type === 'retrograde' && e.planet.key === 'mercury'));
});

test('moon phase names a full moon', () => {
  // Full moon on 17 April 1992.
  assert.equal(moonPhase(new Date('1992-04-17T05:00:00Z')).name, 'Pleine Lune');
});

test('validateProfile rejects bad input', () => {
  const good = { ...DEFAULT_PROFILES[0] };
  assert.ok(validateProfile(good));
  assert.equal(validateProfile({ ...good, date: '1992-02-30' }), null);
  assert.equal(validateProfile({ ...good, time: '25:00' }), null);
  assert.equal(validateProfile({ ...good, timeZone: 'Nowhere/Land' }), null);
  assert.equal(validateProfile({ ...good, latitude: 'x' }), null);
  assert.equal(validateProfile({ ...good, name: '   ' }), null);
  assert.equal(validateProfile({ ...good, time: '' }).time, null);
  assert.equal(validateProfile({ ...good, name: 'a'.repeat(100) }).name.length, 40);
});

test('loadProfiles falls back to defaults on corrupted storage', () => {
  const storage = (value) => ({ getItem: () => value });
  assert.equal(loadProfiles(storage('{not json')).length, DEFAULT_PROFILES.length);
  assert.equal(loadProfiles(storage(JSON.stringify([{ name: 'x' }]))).length, DEFAULT_PROFILES.length);
  const one = loadProfiles(storage(JSON.stringify([{ ...DEFAULT_PROFILES[1], id: 'z' }])));
  assert.equal(one.length, 1);
  assert.equal(one[0].id, 'z');
});

test('parseResults keeps only well-formed places', () => {
  const results = parseResults({
    results: [
      { name: 'Lausanne', admin1: 'Vaud', country: 'Suisse', latitude: 46.5, longitude: 6.6, timezone: 'Europe/Zurich' },
      { name: 'Broken', latitude: 'x', longitude: 1, timezone: 'UTC' },
    ],
  });
  assert.equal(results.length, 1);
  assert.equal(results[0].label, 'Lausanne, Vaud, Suisse');
  assert.deepEqual(parseResults(null), []);
});
