# Doodle Jump (PWA)

A faithful Doodle Jump remake in vanilla JavaScript (canvas, ES modules, zero dependencies),
installable as a Progressive Web App and playable offline on a phone.

## Features

- Graph-paper look, hand-drawn Doodler, wrap-around screen edges.
- Platforms: green (static), blue (moving), brown (breaks, no bounce), white (vanishes after one jump).
- Power-ups: spring, trampoline, propeller hat, jetpack.
- Flying monsters: jump on them or shoot them; touching them from below or the side is fatal.
- Difficulty grows with height (wider gaps, more moving/vanishing/breaking platforms, monsters).
- Synthesized sound effects (Web Audio), best score saved locally, pause, French UI.

## Controls

- **Phone, tilt (default)**: tilt the phone to move, tap the screen to shoot toward your finger.
  iOS asks for motion permission when you press "Jouer".
- **Phone, touch**: hold the left/right half to move, tap the top quarter to shoot.
- **Keyboard**: `←` `→` (or `A` `D`) to move, `Space`/`↑` to shoot, `P`/`Esc` to pause.

## Install on a phone

Open the GitHub Pages URL, then:
- **iPhone (Safari)**: Share → "Sur l'écran d'accueil".
- **Android (Chrome)**: menu ⋮ → "Installer l'application".

## Run locally

```sh
python3 -m http.server 8000   # or: npx serve
```

Open http://localhost:8000. (Tilt controls need HTTPS on real phones; GitHub Pages provides it.)

## Tests

```sh
npm test   # node --test, no install needed
```

## Deployment

Every push to `main` runs the tests and deploys the static files to GitHub Pages
(`.github/workflows/pages.yml`).
