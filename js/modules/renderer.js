import { WORLD } from './game.js';

let colors = null;

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name) => style.getPropertyValue(name).trim();
  return {
    background: get('--canvas-bg'),
    platform: get('--platform'),
    platformMoving: get('--platform-moving'),
    player: get('--player'),
  };
}

// Colors come from CSS custom properties; re-read them when the theme changes.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  colors = null;
});

export function render(ctx, state) {
  colors ??= readColors();
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  for (const p of state.platforms) {
    ctx.fillStyle = p.vx === 0 ? colors.platform : colors.platformMoving;
    ctx.fillRect(p.x, p.y, WORLD.platformWidth, WORLD.platformHeight);
  }

  const { x, y } = state.player;
  const s = WORLD.playerSize;
  ctx.fillStyle = colors.player;
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = colors.background;
  ctx.fillRect(x + s * 0.2, y + s * 0.25, s * 0.15, s * 0.15);
  ctx.fillRect(x + s * 0.65, y + s * 0.25, s * 0.15, s * 0.15);
}
