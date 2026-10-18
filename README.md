# Céleste + Doodle Jump Lite

Two small vanilla JavaScript apps served as a static site (GitHub Pages):

- **Céleste** (`/`): a light Co-Star–style astrology app, in French.
  - Natal chart from birth date, time and place: Sun, Moon, Ascendant, planets in signs and
    Whole Sign houses, retrogrades, major aspects, chart wheel, element balance.
  - Daily personal transits for today and the next 6 days, Moon phase and mood.
  - "Le ciel": current positions, retrograde planets, upcoming sign changes and stations (45 days).
  - Compatibility (synastry) between two profiles with a 0–100 score and the strongest links.
  - Profiles are stored in `localStorage` only. Two example profiles are preloaded.
- **Doodle Jump Lite** (`/doodle/`): bounce from platform to platform.

## Run locally

```sh
python3 -m http.server 8000   # or: npx serve
```

Open http://localhost:8000 (Céleste) or http://localhost:8000/doodle/.

## Tests

```sh
npm test   # node --test, no install needed
```

## Deployment

Every push to `main` runs the tests and deploys `index.html`, `css/`, `js/` and `doodle/`
to GitHub Pages (`.github/workflows/pages.yml`). Pages source must be **GitHub Actions**.

## Project rules

See `CLAUDE.md` and the agents in `.claude/agents/`.
