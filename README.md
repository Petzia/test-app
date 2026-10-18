# Doodle Jump Lite

A tiny Doodle Jump–like game in vanilla JavaScript (canvas, ES modules, no dependencies).
Bounce from platform to platform and climb as high as you can. Blue platforms move.

## Controls

- Keyboard: `←` / `→` (or `A` / `D`; `Q` / `D` on AZERTY)
- Mobile: touch the left or right half of the game area

## Run locally

```sh
python3 -m http.server 8000   # or: npx serve
```

Then open http://localhost:8000.

## Tests

```sh
npm test   # runs node --test, no install needed
```

## Deployment

Every push to `main` runs the tests and deploys the site to GitHub Pages
(`.github/workflows/pages.yml`). One-time setup: in the repository
**Settings → Pages**, set **Source** to **GitHub Actions**.

## Project rules

See `CLAUDE.md` and the agents in `.claude/agents/`.
