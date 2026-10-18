// Renders each tab from computed chart data. All text goes through textContent (see dom.js).
import { el } from './dom.js';
import {
  SIGNS, SIGN_GLYPHS, ELEMENTS, elementOf, formatDegree, moonPhase, planetPositions,
  transits, upcomingEvents, synastry,
} from './chart.js';
import {
  SIGN_INFO, PLANET_INFO, SUN_TEXT, MOON_TEXT, ASC_TEXT, HOUSE_TEXT, ASPECT_TEXT,
  RETROGRADE_TEXT, MOON_SIGN_MOOD, ELEMENT_TEXT, synastryText, natalAspectText, harmonyVerb, scoreLabel, ofName,
} from './texts.js';
import { chartWheel } from './wheel.js';
import { formatOffset } from './time.js';
import { northNode, lifePathNumber } from './destiny.js';
import {
  NODE_SIGN_TEXT, NODE_HOUSE_TEXT, LIFE_PATH_TEXT, MC_CAREER, SUN_TALENT, ELEMENT_WORK, PLANET_IN_10TH,
} from './destinyTexts.js';

const dateFormat = new Intl.DateTimeFormat('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
const shortDate = new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short' });

const signLabel = (sign) => `${SIGN_GLYPHS[sign]} ${SIGNS[sign]}`;
const card = (title, children, className = '') => el('section', { className: `card ${className}` }, [
  title ? el('h2', { text: title, tabindex: '-1' }) : null, ...children,
]);

function noonToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(12, 0, 0, 0);
  return d;
}

function bigThree(chart) {
  const sun = chart.planets[0];
  const moon = chart.planets[1];
  const items = [
    { glyph: '☉', label: 'Soleil', sign: sun.sign, text: SUN_TEXT[sun.sign] },
    { glyph: '☽', label: 'Lune', sign: moon.sign, text: MOON_TEXT[moon.sign] },
  ];
  if (chart.angles) items.push({ glyph: '↑', label: 'Ascendant', sign: chart.ascSign, text: ASC_TEXT[chart.ascSign] });
  return el('div', { className: 'big-three' }, items.map((i) => el('article', { className: 'mini-card' }, [
    el('p', { className: 'mini-label', text: `${i.glyph} ${i.label}` }),
    el('p', { className: 'mini-sign', text: signLabel(i.sign) }),
    el('p', { className: 'mini-text', text: i.text }),
  ])));
}

function transitItem(t) {
  const info = ASPECT_TEXT[t.aspect.key];
  const natal = PLANET_INFO[t.natal.key];
  const title = `${t.transit.glyph} ${t.transit.name} ${t.aspect.glyph} ${t.aspect.name} ton ${t.natal.glyph} ${t.natal.name} natal`;
  const text = `${t.transit.name} ${info.transit} ${natal.domain}. ${info.advice}`;
  return el('li', { className: `transit tone-${t.aspect.key}` }, [
    el('p', { className: 'transit-title', text: title }),
    el('p', { text }),
    el('p', { className: 'tag', text: `${info.tone} · orbe ${t.aspect.orb.toFixed(1)}°` }),
  ]);
}

function dayMood(list) {
  const soft = list.filter((t) => ['trine', 'sextile'].includes(t.aspect.key)).length;
  const hard = list.filter((t) => ['square', 'opposition'].includes(t.aspect.key)).length;
  if (list.length === 0) return 'Journée calme : le ciel te laisse tranquille.';
  if (soft > hard) return 'Journée fluide : les astres te soutiennent.';
  if (hard > soft) return 'Journée intense : avance avec patience.';
  return 'Journée contrastée : un peu de tout au programme.';
}

export function renderToday(container, profile, chart, dayOffset, onDayChange) {
  const date = noonToday(dayOffset);
  const sky = planetPositions(date);
  const moon = sky[1];
  const phase = moonPhase(date);
  const list = transits(chart, date).slice(0, 4);
  const retro = sky.filter((p) => p.retrograde);

  const days = el('div', { className: 'day-picker', role: 'group', 'aria-label': 'Choisir le jour' },
    Array.from({ length: 7 }, (_, i) => {
      const label = i === 0 ? 'Aujourd’hui' : i === 1 ? 'Demain' : shortDate.format(noonToday(i));
      return el('button', {
        type: 'button', 'aria-pressed': String(i === dayOffset),
        className: i === dayOffset ? 'chip active' : 'chip', text: label, onClick: () => onDayChange(i),
      });
    }));

  container.replaceChildren(
    days,
    card(dateFormat.format(date), [
      el('p', { className: 'lead', text: dayMood(list) }),
      el('p', { text: `${phase.icon} ${phase.name} · ${MOON_SIGN_MOOD[moon.sign]}` }),
    ], 'hero'),
    card(`Tes transits — ${profile.name}`, [
      list.length
        ? el('ul', { className: 'transits' }, list.map(transitItem))
        : el('p', { text: 'Aucun transit majeur aujourd’hui : profite de ce calme.' }),
    ]),
    retro.length ? card('Rétrogrades en cours', [
      el('ul', { className: 'plain' }, retro.map((p) => el('li', { text: RETROGRADE_TEXT[p.key] }))),
    ]) : null,
  );
}

function planetRow(p) {
  return el('tr', {}, [
    el('td', { text: `${p.glyph} ${p.name}` }),
    el('td', { text: `${signLabel(p.sign)} ${formatDegree(p.lon)}` }),
    el('td', { text: p.house ? String(p.house) : '—' }),
    el('td', { text: p.retrograde ? 'R' : '' }),
  ]);
}

// Sun, Moon and Ascendant count double.
function elementCounts(chart) {
  const counts = { feu: 0, terre: 0, air: 0, eau: 0 };
  const points = chart.angles ? [...chart.planets, chart.angles[0]] : chart.planets;
  for (const p of points) counts[elementOf(p.sign)] += ['sun', 'moon', 'asc'].includes(p.key) ? 2 : 1;
  return counts;
}

function dominantElement(chart) {
  const counts = elementCounts(chart);
  return ELEMENTS.reduce((a, b) => (counts[b] > counts[a] ? b : a));
}

function elementBalance(chart) {
  const counts = elementCounts(chart);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const dominant = dominantElement(chart);
  return el('div', {}, [
    el('div', { className: 'bars' }, ELEMENTS.map((e) => {
      const bar = el('span', { className: `bar-fill el-${e}` });
      bar.style.width = `${Math.round((counts[e] / total) * 100)}%`;
      return el('div', { className: 'bar' }, [el('span', { className: 'bar-label', text: e }), el('span', { className: 'bar-track' }, [bar])]);
    })),
    el('p', { text: `Élément dominant — ${ELEMENT_TEXT[dominant]}` }),
  ]);
}

export function renderNatal(container, profile, chart, birth) {
  const placements = chart.planets.slice(2).map((p) => {
    const house = p.house ? ` (maison ${p.house} : ${HOUSE_TEXT[p.house - 1]})` : '';
    return el('li', {}, [
      el('strong', { text: `${p.glyph} ${p.name} en ${SIGNS[p.sign]}${p.retrograde ? ' rétrograde' : ''}` }),
      el('span', { text: ` — ${PLANET_INFO[p.key].domain} s’exprime ${SIGN_INFO[p.sign].style}${house}.` }),
    ]);
  });
  const aspects = chart.aspects.slice(0, 8).map(({ a, b, aspect }) => el('li', {}, [
    el('strong', { text: `${a.glyph} ${a.name} ${aspect.glyph} ${aspect.name} ${b.glyph} ${b.name}` }),
    el('span', { text: ` — ${natalAspectText(a.key, b.key, aspect.key)}` }),
  ]));
  const details = `${profile.date.split('-').reverse().join('.')} ${profile.time ?? '(heure inconnue)'} · ${profile.place || 'lieu personnalisé'} · ${formatOffset(birth.offsetMinutes)}`;

  container.replaceChildren(
    card(profile.name, [el('p', { className: 'muted', text: details }), bigThree(chart)], 'hero'),
    card('Ta carte du ciel', [
      el('div', { className: 'wheel-wrap' }, [chartWheel(chart)]),
      profile.time ? null : el('p', { className: 'muted', text: 'Sans heure de naissance, l’ascendant et les maisons ne peuvent pas être calculés.' }),
    ]),
    card('Positions', [el('div', { className: 'table-wrap' }, [el('table', {}, [
      el('thead', {}, [el('tr', {}, ['Astre', 'Signe', 'Maison', ''].map((h) => el('th', { scope: 'col', text: h })))]),
      el('tbody', {}, [...chart.planets, ...(chart.angles ?? [])].map(planetRow)),
    ])])]),
    card('Équilibre des éléments', [elementBalance(chart)]),
    card('Tes autres planètes', [el('ul', { className: 'plain' }, placements)]),
    card('Aspects majeurs', [el('ul', { className: 'plain' }, aspects)]),
  );
}

export function renderSky(container) {
  const now = new Date();
  const sky = planetPositions(now);
  const phase = moonPhase(now);
  const events = upcomingEvents(noonToday(), 45).slice(0, 10);
  const retro = sky.filter((p) => p.retrograde);
  const eventText = (e) => {
    if (e.type === 'ingress') return `${e.planet.glyph} ${e.planet.name} entre en ${SIGNS[e.planet.sign]}`;
    if (e.type === 'retrograde') return `${e.planet.glyph} ${e.planet.name} devient rétrograde`;
    return `${e.planet.glyph} ${e.planet.name} redevient direct`;
  };

  container.replaceChildren(
    card('Le ciel en ce moment', [
      el('p', { className: 'lead', text: `${phase.icon} ${phase.name}` }),
      el('p', { text: MOON_SIGN_MOOD[sky[1].sign] }),
    ], 'hero'),
    card('Positions actuelles', [el('ul', { className: 'sky-grid' }, sky.map((p) => el('li', {}, [
      el('span', { className: 'sky-glyph', text: p.glyph }),
      el('span', { text: `${p.name} en ${SIGNS[p.sign]} ${formatDegree(p.lon)}${p.retrograde ? ' ℞' : ''}` }),
    ])))]),
    card('Rétrogrades', [retro.length
      ? el('ul', { className: 'plain' }, retro.map((p) => el('li', { text: RETROGRADE_TEXT[p.key] })))
      : el('p', { text: 'Aucune planète rétrograde : tout avance !' })]),
    card('À venir (45 jours)', [events.length
      ? el('ul', { className: 'plain timeline' }, events.map((e) => el('li', {}, [
        el('span', { className: 'tag', text: shortDate.format(e.date) }), ` ${eventText(e)}`,
      ])))
      : el('p', { text: 'Rien de majeur à l’horizon.' })]),
  );
}

function linkItem(link, nameA, nameB) {
  const verb = harmonyVerb(link.aspect.key);
  const title = `${link.a.glyph} ${link.a.name} ${ofName(nameA)} ${verb} ${link.b.glyph} ${link.b.name} ${ofName(nameB)}`;
  const text = synastryText(link.a.key, link.b.key, link.aspect.key);
  return el('li', { className: `transit tone-${link.aspect.key}` }, [
    el('p', { className: 'transit-title', text: title }),
    el('p', { text }),
    el('p', { className: 'tag', text: `${link.aspect.name} · orbe ${link.aspect.orb.toFixed(1)}°` }),
  ]);
}

export function renderCompat(container, profiles, charts, selection, onSelect) {
  const [ia, ib] = selection;
  const select = (value, index) => el('select', {
    'aria-label': index === 0 ? 'Première personne' : 'Deuxième personne',
    onChange: (e) => onSelect(index, Number(e.target.value)),
  }, profiles.map((p, i) => {
    const option = el('option', { value: String(i), text: p.name });
    option.selected = i === value;
    return option;
  }));
  const pickers = el('div', { className: 'pickers' }, [select(ia, 0), el('span', { text: '♡' }), select(ib, 1)]);

  if (profiles.length < 2) {
    container.replaceChildren(card('Compatibilité', [el('p', { text: 'Ajoute un deuxième profil avec le bouton ＋ pour calculer votre compatibilité.' })]));
    return;
  }
  if (ia === ib) {
    container.replaceChildren(pickers, card('', [el('p', { text: 'Choisis deux profils différents.' })]));
    return;
  }
  const result = synastry(charts[ia], charts[ib]);
  const [nameA, nameB] = [profiles[ia].name, profiles[ib].name];
  const ring = el('div', { className: 'score-ring', role: 'img', 'aria-label': `Score ${result.score} sur 100` }, [
    el('span', { text: String(result.score) }),
  ]);
  ring.style.setProperty('--score', String(result.score));
  const elementLine = (chart, name) => {
    const s = chart.planets[0].sign;
    const m = chart.planets[1].sign;
    const asc = chart.ascSign !== null ? ` · ↑ ${SIGNS[chart.ascSign]}` : '';
    return el('p', { text: `${name} : ☉ ${SIGNS[s]} (${elementOf(s)}) · ☽ ${SIGNS[m]} (${elementOf(m)})${asc}` });
  };

  container.replaceChildren(
    pickers,
    card('Votre alchimie', [
      el('div', { className: 'score' }, [ring, el('p', { className: 'lead', text: scoreLabel(result.score) })]),
      elementLine(charts[ia], nameA),
      elementLine(charts[ib], nameB),
    ], 'hero'),
    card('Ce qui vous unit', [result.harmonious.length
      ? el('ul', { className: 'transits' }, result.harmonious.slice(0, 5).map((l) => linkItem(l, nameA, nameB)))
      : el('p', { text: 'Peu de liens faciles : votre relation se construit dans l’effort… et c’est aussi une force.' })]),
    result.challenging.length ? card('Vos points de friction', [el('ul', { className: 'transits' },
      result.challenging.slice(0, 3).map((l) => linkItem(l, nameA, nameB)))]) : null,
    el('p', { className: 'muted small', text: 'Score basé sur les aspects entre vos planètes personnelles, pondérés par leur importance et leur précision.' }),
  );
}


export function renderDestiny(container, profile, chart, birth) {
  const node = northNode(birth.utc);
  const nodeHouse = chart.ascSign !== null ? ((node.sign - chart.ascSign + 12) % 12) + 1 : null;
  const lifePath = lifePathNumber(profile.date);
  const path = LIFE_PATH_TEXT[lifePath];
  const sun = chart.planets[0];
  const mc = chart.angles ? chart.angles[1] : null;
  const tenth = chart.planets.filter((p) => p.house === 10);

  const careerCard = mc
    ? card('Vocation et carrière', [
      el('p', { className: 'mini-label', text: `Milieu du Ciel en ${signLabel(mc.sign)}` }),
      el('p', { className: 'lead', text: MC_CAREER[mc.sign].vocation }),
      el('p', {}, [el('strong', { text: 'Métiers qui te correspondent : ' }), MC_CAREER[mc.sign].jobs, '.']),
      el('p', { text: `Tes talents naturels (Soleil en ${SIGNS[sun.sign]}) : ${SUN_TALENT[sun.sign]}.` }),
      el('p', { text: ELEMENT_WORK[dominantElement(chart)] }),
      tenth.length ? el('ul', { className: 'plain' }, tenth.map((p) => el('li', { text: PLANET_IN_10TH[p.key] }))) : null,
    ])
    : card('Vocation et carrière', [
      el('p', { text: `Tes talents naturels (Soleil en ${SIGNS[sun.sign]}) : ${SUN_TALENT[sun.sign]}.` }),
      el('p', { text: ELEMENT_WORK[dominantElement(chart)] }),
      el('p', { className: 'muted', text: 'Ajoute ton heure de naissance pour découvrir ton Milieu du Ciel et les métiers qui te correspondent.' }),
    ]);

  container.replaceChildren(
    card(`Destinée — ${profile.name}`, [
      el('p', { className: 'mini-label', text: `${node.glyph} Nœud Nord en ${signLabel(node.sign)} ${formatDegree(node.lon)}${nodeHouse ? ` · maison ${nodeHouse}` : ''}` }),
      el('p', { className: 'lead', text: 'Ta mission de vie' }),
      el('p', { text: NODE_SIGN_TEXT[node.sign] }),
      nodeHouse ? el('p', { text: NODE_HOUSE_TEXT[nodeHouse - 1] }) : null,
      el('p', { className: 'muted small', text: 'En astrologie, le Nœud Nord indique la direction vers laquelle ton âme est appelée à grandir.' }),
    ], 'hero'),
    card('Chemin de vie (numérologie)', [
      el('div', { className: 'score' }, [
        el('div', { className: 'score-ring life-path', role: 'img', 'aria-label': `Chemin de vie ${lifePath}` }, [el('span', { text: String(lifePath) })]),
        el('p', { className: 'lead', text: path.title }),
      ]),
      el('p', { text: path.text }),
      el('p', { className: 'muted small', text: 'Calculé en additionnant tous les chiffres de ta date de naissance.' }),
    ]),
    careerCard,
  );
}
