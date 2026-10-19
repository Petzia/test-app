# Decisions

## Doodle Jump PWA (quick mode, replaces previous apps)

- **Repository reset**: the previous Céleste app and the simple Doodle game were removed at the
  user's request. `CLAUDE.md`, `.claude/agents/` and the Pages workflow were kept.
- **Faithful mechanics**: auto-bounce, screen wrap, the four classic platform types, springs,
  trampolines, propeller hat, jetpack, monsters with stomp/shoot, upward shooting toward the tap.
- **Fairness guarantee**: the max vertical gap between reachable platforms (145 px) stays below the
  jump apex (~170 px); breakable platforms are extra decoys and never part of the path.
- **Fixed sub-steps (1/120 s)** in the pure `world.js` so collisions don't tunnel at low frame rates;
  the logic has no DOM access and is covered by `node --test`.
- **Graphics drawn with canvas primitives** (no sprite files): no copyrighted assets, tiny download.
- **Logical world 360 px wide**, height adapted to the screen ratio (540–820), scaled with devicePixelRatio.
- **Controls**: tilt by default on touch devices (like the original), touch fallback, keyboard on desktop.
- **PWA**: manifest with relative `start_url`/`scope` (works under the `/test-app/` Pages path),
  network-first service worker with cache fallback for offline play, PNG icons generated from the
  game's own Doodler drawing.
- **Sound** synthesized with Web Audio: no audio files, can be muted (saved locally).
