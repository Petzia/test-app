// Canvas drawing in the hand-drawn Doodle Jump style. Works in world units; the caller sets the scale.
import { WIDTH, PLAYER, PLATFORM, MONSTER, ITEMS } from './config.js';

const COLORS = {
  paper: '#f9f5e7',
  gridMinor: 'rgba(214, 170, 120, 0.22)',
  gridMajor: 'rgba(214, 170, 120, 0.38)',
  ink: '#3d3020',
  body: '#c9d93f',
  bodyDark: '#6f8a1f',
  stripe: '#5b7d12',
  normal: '#76c43c',
  normalDark: '#3e7a1c',
  moving: '#4aa8e0',
  movingDark: '#1f6a9c',
  breakable: '#b07a3e',
  breakableDark: '#6e4620',
  vanish: '#ffffff',
  vanishDark: '#9a9a9a',
  monster: '#7a52c7',
  monsterDark: '#40266e',
  metal: '#9aa3ad',
  flame: '#ff9a1f',
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillStroke(ctx, fill, stroke, width = 2) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = width;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

export function drawPaper(ctx, cameraY, height) {
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, WIDTH, height);
  const cell = 16;
  const offset = ((cameraY % cell) + cell) % cell;
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += cell) {
    ctx.strokeStyle = x % (cell * 4) === 0 ? COLORS.gridMajor : COLORS.gridMinor;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
  for (let y = -offset; y <= height; y += cell) {
    const worldRow = Math.round((y + cameraY) / cell);
    ctx.strokeStyle = worldRow % 4 === 0 ? COLORS.gridMajor : COLORS.gridMinor;
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(WIDTH, y + 0.5);
    ctx.stroke();
  }
}

function drawPlatform(ctx, p, y, time) {
  const w = PLATFORM.width;
  const h = PLATFORM.height;
  if (p.type === 'breakable') {
    const split = p.broken ? Math.min(14, p.fallSpeed / 40) : 0;
    const tilt = p.broken ? 0.25 : 0;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(p.x + w / 2 + side * (w / 4 + split), y + h / 2);
      ctx.rotate(side * tilt);
      roundRect(ctx, -w / 4, -h / 2, w / 2, h, 4);
      fillStroke(ctx, COLORS.breakable, COLORS.breakableDark);
      ctx.strokeStyle = COLORS.breakableDark;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-side * w / 4, -h / 2);
      ctx.lineTo(-side * (w / 4 - 4), 0);
      ctx.lineTo(-side * w / 4, h / 2);
      ctx.stroke();
      ctx.restore();
    }
    return;
  }
  const palette = {
    normal: [COLORS.normal, COLORS.normalDark],
    moving: [COLORS.moving, COLORS.movingDark],
    vanish: [COLORS.vanish, COLORS.vanishDark],
  }[p.type];
  ctx.save();
  if (p.gone) ctx.globalAlpha = Math.max(0, 1 - (time - p.goneTime) / 0.5);
  roundRect(ctx, p.x, y, w, h, 7);
  fillStroke(ctx, palette[0], palette[1]);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  roundRect(ctx, p.x + 5, y + 3, w - 10, 3, 1.5);
  ctx.fill();
  ctx.restore();
}

function drawSpring(ctx, x, y, extended) {
  const size = ITEMS.spring;
  const h = extended ? size.height + 12 : size.height;
  const top = y - h;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const coils = 4;
  for (let i = 0; i <= coils; i += 1) {
    const cy = y - (h - 4) * (i / coils);
    ctx.lineTo(x + (i % 2 ? size.width - 3 : 3), cy);
  }
  ctx.stroke();
  roundRect(ctx, x, top, size.width, 4, 2);
  fillStroke(ctx, COLORS.metal, COLORS.ink, 1.5);
}

function drawTrampoline(ctx, x, y, bounced) {
  const size = ITEMS.trampoline;
  const sag = bounced ? 4 : 0;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 4, y);
  ctx.lineTo(x + 8, y - size.height);
  ctx.moveTo(x + size.width - 4, y);
  ctx.lineTo(x + size.width - 8, y - size.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - size.height);
  ctx.quadraticCurveTo(x + size.width / 2, y - size.height + sag, x + size.width, y - size.height);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#e0404a';
  ctx.stroke();
}

function drawPropeller(ctx, x, y, time) {
  // Beanie cap with a spinning propeller; (x, y) is the bottom-left corner.
  const w = ITEMS.propeller.width;
  ctx.beginPath();
  ctx.arc(x + w / 2, y, w / 2, Math.PI, 0);
  fillStroke(ctx, '#f2c230', COLORS.ink);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - w / 2);
  ctx.lineTo(x + w / 2, y - w / 2 - 6);
  ctx.strokeStyle = COLORS.ink;
  ctx.stroke();
  const spread = Math.abs(Math.sin(time * 30)) * 14 + 2;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y - w / 2 - 7, spread, 3, 0, 0, Math.PI * 2);
  fillStroke(ctx, '#e0404a', COLORS.ink, 1.5);
}

function drawJetpack(ctx, x, y, flames, time) {
  // (x, y) is the top-left corner.
  const w = ITEMS.jetpack.width;
  const h = ITEMS.jetpack.height;
  for (const dx of [0, w / 2]) {
    roundRect(ctx, x + dx, y, w / 2 - 1, h - 6, 5);
    fillStroke(ctx, COLORS.metal, COLORS.ink, 1.5);
    if (flames) {
      const len = 12 + Math.sin(time * 40 + dx) * 5;
      ctx.beginPath();
      ctx.moveTo(x + dx + 2, y + h - 6);
      ctx.lineTo(x + dx + w / 4 - 0.5, y + h - 6 + len);
      ctx.lineTo(x + dx + w / 2 - 3, y + h - 6);
      ctx.fillStyle = COLORS.flame;
      ctx.fill();
    }
  }
}

function drawItem(ctx, p, y, time) {
  const item = p.item;
  if (!item) return;
  const x = p.x + item.offset;
  if (item.kind === 'spring') drawSpring(ctx, x, y, item.used);
  else if (item.kind === 'trampoline') drawTrampoline(ctx, x, y, item.used && time - item.usedTime < 0.15);
  else if (item.used) return;
  else if (item.kind === 'propeller') drawPropeller(ctx, x, y, 0);
  else drawJetpack(ctx, x, y - ITEMS.jetpack.height, false, time);
}

export function drawDoodler(ctx, x, y, facing, { shooting = false, power = null, time = 0, dead = false } = {}) {
  const w = PLAYER.width;
  const h = PLAYER.height;
  ctx.save();
  ctx.translate(x + w / 2, y);
  if (!shooting) ctx.scale(facing, 1);
  if (power === 'jetpack') drawJetpack(ctx, -w / 2 - 12, 10, true, time);

  // Legs
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const lx of [-12, -4, 4, 12]) {
    ctx.beginPath();
    ctx.moveTo(lx, h - 8);
    ctx.lineTo(lx, h - 1);
    ctx.lineTo(lx + 3, h - 1);
    ctx.stroke();
  }

  // Body: rounded top, flat striped bottom
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 4, h - 8);
  ctx.lineTo(-w / 2 + 4, 18);
  ctx.quadraticCurveTo(-w / 2 + 4, 2, 0, 2);
  ctx.quadraticCurveTo(w / 2 - 4, 2, w / 2 - 4, 18);
  ctx.lineTo(w / 2 - 4, h - 8);
  ctx.closePath();
  fillStroke(ctx, COLORS.body, COLORS.ink, 2.5);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = COLORS.stripe;
  for (let i = 0; i < 3; i += 1) ctx.fillRect(-w / 2, h - 18 + i * 4, w, 2);
  ctx.restore();

  if (shooting) {
    // Snout pointing straight up
    roundRect(ctx, -5, -12, 10, 18, 4);
    fillStroke(ctx, COLORS.body, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(0, -12, 6, 3, 0, 0, Math.PI * 2);
    fillStroke(ctx, COLORS.body, COLORS.ink, 2);
  } else {
    // Snout pointing forward
    roundRect(ctx, 6, 14, 20, 10, 4);
    fillStroke(ctx, COLORS.body, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(26, 19, 3, 6, 0, 0, Math.PI * 2);
    fillStroke(ctx, COLORS.body, COLORS.ink, 2);
  }

  // Eyes
  ctx.fillStyle = COLORS.ink;
  if (dead) {
    ctx.lineWidth = 2;
    for (const ex of [-6, 6]) {
      ctx.beginPath();
      ctx.moveTo(ex - 3, 9);
      ctx.lineTo(ex + 3, 15);
      ctx.moveTo(ex + 3, 9);
      ctx.lineTo(ex - 3, 15);
      ctx.stroke();
    }
  } else {
    for (const ex of shooting ? [-7, 7] : [-2, 6]) {
      ctx.beginPath();
      ctx.arc(ex, 11, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  if (power === 'propeller') drawPropeller(ctx, x + w / 2 - ITEMS.propeller.width / 2, y + 8, time);
}

function drawMonster(ctx, m, y, time) {
  const w = MONSTER.width;
  const h = MONSTER.height;
  const wobble = Math.sin(time * 6 + m.phase) * 2;
  ctx.save();
  ctx.translate(m.x, y + wobble);
  if (m.dead) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-w / 2, -h / 2);
  }
  // Wings
  ctx.beginPath();
  ctx.ellipse(4, h / 2, 10, 6 + Math.abs(Math.sin(time * 18)) * 6, -0.4, 0, Math.PI * 2);
  ctx.ellipse(w - 4, h / 2, 10, 6 + Math.abs(Math.sin(time * 18)) * 6, 0.4, 0, Math.PI * 2);
  fillStroke(ctx, '#d9cff5', COLORS.ink, 1.5);
  // Body
  roundRect(ctx, 8, 4, w - 16, h - 8, 16);
  fillStroke(ctx, COLORS.monster, COLORS.monsterDark, 2.5);
  // Eyes
  for (const ex of [w / 2 - 9, w / 2 + 9]) {
    ctx.beginPath();
    ctx.arc(ex, 16, 6, 0, Math.PI * 2);
    fillStroke(ctx, '#fff', COLORS.ink, 1.5);
    ctx.beginPath();
    ctx.arc(ex, 17, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ink;
    ctx.fill();
  }
  // Mouth with teeth
  ctx.beginPath();
  ctx.moveTo(w / 2 - 12, h - 15);
  ctx.lineTo(w / 2 + 12, h - 15);
  ctx.lineTo(w / 2, h - 9);
  ctx.closePath();
  fillStroke(ctx, '#fff', COLORS.ink, 1.5);
  ctx.restore();
}

export function drawWorld(ctx, state) {
  const cam = state.cameraY;
  drawPaper(ctx, cam, state.height);
  for (const p of state.platforms) {
    const y = p.y - cam;
    if (y < -60 || y > state.height + 20) continue;
    drawPlatform(ctx, p, y, state.time);
    if (!p.broken && !p.gone) drawItem(ctx, p, y, state.time);
  }
  for (const m of state.monsters) {
    const y = m.y - cam;
    if (y > -MONSTER.height && y < state.height) drawMonster(ctx, m, y, state.time);
  }
  ctx.fillStyle = COLORS.ink;
  for (const b of state.bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y - cam, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  const { player } = state;
  const opts = { shooting: player.shootTime > 0, power: player.power, time: state.time, dead: player.dead };
  drawDoodler(ctx, player.x, player.y - cam, player.facing, opts);
  // Draw a second copy while wrapping around the screen edge.
  if (player.x < 0) drawDoodler(ctx, player.x + WIDTH, player.y - cam, player.facing, opts);
  if (player.x + PLAYER.width > WIDTH) drawDoodler(ctx, player.x - WIDTH, player.y - cam, player.facing, opts);
}
