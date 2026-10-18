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
