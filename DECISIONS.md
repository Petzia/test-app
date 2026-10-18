# Decisions

## Doodle Jump Lite (quick mode)

- **Canvas 2D, fixed 400×600 world** scaled with CSS: simple physics in world units,
  works on any screen size.
- **Pure logic in `js/modules/game.js`** (no DOM) so it is tested with `node --test`;
  rendering and input live in their own modules.
- **Mechanics kept minimal**: gravity, auto-bounce, horizontal screen wrap, 20% moving
  platforms, score = height climbed / 10. No monsters, springs or breakable platforms.
- **Best score in `localStorage`**, read defensively (parsed and validated, try/catch).
- **`package.json`** exists only to set `"type": "module"` for Node tests and an `npm test`
  script. Still zero dependencies.
- **GitHub Pages via GitHub Actions** (official `actions/*-pages` actions): deploys only
  the static files (`index.html`, `css/`, `js/`) on push to `main`, after tests pass.
- **Removed the template README**: replaced by the game's README; the agents and
  `CLAUDE.md` are kept unchanged.

## Céleste — astrology app (challenged, then built)

- **Scope agreed after the idea challenge**: natal chart, daily transits (7 days), current sky,
  compatibility. French texts only. No AI/API for texts for now (a static site cannot hold a key;
  a daily GitHub Action generating texts is a possible next step).
- **Dependency: astronomy-engine 2.1.19** (MIT, zero dependencies), vendored unmodified as
  `js/vendor/astronomy.js` (ESM build from npm, sha256 starts with `068f1445ed0c636c`). Accurate planetary
  ephemerides (~1 arcminute) would be unreasonable to rewrite. Served from our origin, no CDN.
- **Tropical zodiac, Whole Sign houses**: the most common modern choice, simple and robust at any
  latitude. Ascendant/MC computed from apparent sidereal time and true obliquity; a test checks the
  Ascendant lies on the eastern horizon.
- **Birth time → UTC with `Intl.DateTimeFormat`** in the place's IANA time zone, which includes
  historical DST (e.g. Swiss summer time in April 1992). The computed UTC offset is displayed.
- **Place search via Open-Meteo geocoding** (free, no key, CORS). Only the place name is sent; the
  CSP allows only that origin in `connect-src`. Manual coordinates are available as a fallback.
- **Texts are rule-based**: hand-written Sun/Moon/Ascendant texts per sign, other placements and
  aspects composed from planet + sign + aspect phrases. Transits use tight orbs (25% of natal orbs).
- **Compatibility score**: cross-aspects between personal planets (+ Jupiter/Saturn), weighted by
  pair importance and orb tightness, mapped to 0–100 with a logistic curve.
- **Privacy**: profiles live in `localStorage` only, with an "Effacer mes données" button.
  The two example profiles (given by the user) are hard-coded as defaults.
- **Doodle Jump moved to `/doodle/`**, linked from Céleste's footer.

## Céleste — "Destinée" tab

- **Life mission = mean North Node** (Meeus formula) by sign and Whole Sign house: the usual
  "destiny" point in modern astrology. Mean (not true) node: simpler, within ~1.5° of the true node.
- **Numerology life path number** (sum of all birth date digits, master numbers 11/22/33 kept):
  popular, easy to explain, and works without a birth time.
- **Career** from the Midheaven sign (vocation + job ideas), Sun sign talents, dominant element and
  planets in the 10th house. Without a birth time, only the Sun and element parts are shown.
