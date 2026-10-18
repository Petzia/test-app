import { WORLD } from './game.js';

function readColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function render(ctx, state) {
  ctx.fillStyle = readColor('--canvas-bg');
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  for (const p of state.platforms) {
    ctx.fillStyle = p.vx === 0 ? readColor('--platform') : readColor('--platform-moving');
    ctx.fillRect(p.x, p.y, WORLD.platformWidth, WORLD.platformHeight);
  }

  const { x, y } = state.player;
  const s = WORLD.playerSize;
  ctx.fillStyle = readColor('--player');
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = readColor('--canvas-bg');
  ctx.fillRect(x + s * 0.2, y + s * 0.25, s * 0.15, s * 0.15);
  ctx.fillRect(x + s * 0.65, y + s * 0.25, s * 0.15, s * 0.15);
}
