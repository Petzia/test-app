// Pure game logic (no DOM): world generation, physics, collisions and scoring.
import {
  WIDTH, GRAVITY, JUMP_SPEED, SPRING_SPEED, TRAMPOLINE_SPEED, MAX_SPEED_X, BULLET_SPEED,
  SHOOT_COOLDOWN, PLAYER, PLATFORM, MONSTER, CAMERA_ANCHOR, POWERS, ITEMS, MAX_DIFFICULTY_HEIGHT,
} from './config.js';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export function difficulty(height) {
  return clamp(height / MAX_DIFFICULTY_HEIGHT, 0, 1);
}

// Vertical gap range between two reachable platforms, growing with height.
export function gapRange(height) {
  const d = difficulty(height);
  return { min: lerp(28, 70, d), max: lerp(70, 145, d) };
}

function makePlatform(x, y, type, d, rand) {
  const platform = { x, y, type, vx: 0, broken: false, fallSpeed: 0, gone: false, goneTime: 0, item: null };
  if (type === 'moving') platform.vx = (rand() < 0.5 ? -1 : 1) * lerp(60, 150, d);
  return platform;
}

function randomItem(height, rand) {
  const r = rand();
  if (height > 800 && r < 0.008) return 'jetpack';
  if (height > 400 && r < 0.022) return 'propeller';
  if (r < 0.045) return 'trampoline';
  if (r < 0.11) return 'spring';
  return null;
}

function attachItem(platform, kind, rand) {
  const size = ITEMS[kind];
  platform.item = { kind, offset: rand() * (PLATFORM.width - size.width), used: false, usedTime: 0 };
}

function addRow(state, rand) {
  const height = state.startY - state.nextY;
  const d = difficulty(height);
  const x = rand() * (WIDTH - PLATFORM.width);
  const r = rand();
  let type = 'normal';
  if (r < lerp(0.04, 0.38, d)) type = 'moving';
  else if (height > 1500 && r < lerp(0.04, 0.38, d) + lerp(0, 0.16, d)) type = 'vanish';
  const platform = makePlatform(x, state.nextY, type, d, rand);
  if (type !== 'vanish') {
    const kind = randomItem(height, rand);
    if (kind) attachItem(platform, kind, rand);
  }
  state.platforms.push(platform);

  const { min, max } = gapRange(height);
  const gap = lerp(min, max, rand());

  // Breakable decoys never count as a path.
  if (rand() < lerp(0.12, 0.32, d)) {
    const decoy = makePlatform(rand() * (WIDTH - PLATFORM.width), state.nextY - gap * lerp(0.3, 0.7, rand()), 'breakable', d, rand);
    state.platforms.push(decoy);
  }

  const lastMonster = state.monsters.length ? state.monsters[state.monsters.length - 1].baseY : Infinity;
  if (height > 2500 && rand() < lerp(0.02, 0.06, d) && lastMonster - state.nextY > 900) {
    const mx = rand() * (WIDTH - MONSTER.width);
    state.monsters.push({
      x: mx, y: state.nextY - gap / 2 - MONSTER.height, baseX: mx, baseY: state.nextY - gap / 2 - MONSTER.height,
      phase: rand() * Math.PI * 2, range: rand() < 0.5 ? 0 : lerp(20, 60, rand()), dead: false, vy: 0,
    });
  }
  state.nextY -= gap;
}

export function generate(state, rand) {
  const limit = state.cameraY - state.height * 0.5;
  while (state.nextY > limit) addRow(state, rand);
}

export function createGame(height, rand = Math.random) {
  const startY = height - 40;
  const state = {
    height,
    startY,
    cameraY: 0,
    nextY: startY - 60,
    player: {
      x: WIDTH / 2 - PLAYER.width / 2, y: startY - PLAYER.height, vx: 0, vy: -JUMP_SPEED,
      facing: 1, shootTime: 0, cooldown: 0, power: null, powerTime: 0, grace: 0, dead: false,
    },
    platforms: [makePlatform(WIDTH / 2 - PLATFORM.width / 2, startY, 'normal', 0, rand)],
    monsters: [],
    bullets: [],
    score: 0,
    over: false,
    time: 0,
    events: [],
  };
  generate(state, rand);
  return state;
}

const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// Horizontal offsets at which the player exists: a second copy while straddling a screen edge.
export function playerOffsets(player) {
  if (player.x < 0) return [0, WIDTH];
  if (player.x + PLAYER.width > WIDTH) return [0, -WIDTH];
  return [0];
}

const GRACE_TIME = 0.6; // invulnerability after a power-up ends

function bounce(state, speed, event) {
  state.player.vy = -speed;
  state.events.push(event);
}

// Returns true when the player landed on something this step.
function land(state, prevFeet) {
  const { player } = state;
  const feet = player.y + PLAYER.height;
  const footWidth = PLAYER.width - PLAYER.footInset * 2;
  const feetX = playerOffsets(player).map((dx) => player.x + dx + PLAYER.footInset);
  const crosses = (top) => prevFeet <= top && feet >= top;
  const within = (x, w) => feetX.some((fx) => fx + footWidth > x && fx < x + w);

  for (const p of state.platforms) {
    if (p.broken || p.gone) continue;
    // Springs and trampolines can be reused; `usedTime` only drives their animation.
    if (p.item && (p.item.kind === 'spring' || p.item.kind === 'trampoline')) {
      const size = ITEMS[p.item.kind];
      const top = p.y - size.height;
      if (crosses(top) && within(p.x + p.item.offset, size.width)) {
        player.y = top - PLAYER.height;
        p.item.used = true;
        p.item.usedTime = state.time;
        bounce(state, p.item.kind === 'spring' ? SPRING_SPEED : TRAMPOLINE_SPEED, p.item.kind);
        return true;
      }
    }
    if (!crosses(p.y) || !within(p.x, PLATFORM.width)) continue;
    if (p.type === 'breakable') {
      p.broken = true;
      state.events.push('break');
      continue;
    }
    player.y = p.y - PLAYER.height;
    bounce(state, JUMP_SPEED, 'jump');
    if (p.type === 'vanish') {
      p.gone = true;
      p.goneTime = state.time;
    }
    return true;
  }
  return false;
}

function pickUpPowers(state) {
  const { player } = state;
  if (player.power) return;
  const boxes = playerOffsets(player).map((dx) => ({ x: player.x + dx, y: player.y, w: PLAYER.width, h: PLAYER.height }));
  for (const p of state.platforms) {
    const item = p.item;
    if (!item || item.used || (item.kind !== 'propeller' && item.kind !== 'jetpack')) continue;
    const size = ITEMS[item.kind];
    const itemBox = { x: p.x + item.offset, y: p.y - size.height, w: size.width, h: size.height };
    if (boxes.some((box) => overlaps(box, itemBox))) {
      item.used = true;
      player.power = item.kind;
      player.powerTime = POWERS[item.kind].duration;
      state.events.push(item.kind);
      return;
    }
  }
}

function monsterBox(m) {
  return { x: m.x + 6, y: m.y + 4, w: MONSTER.width - 12, h: MONSTER.height - 8 };
}

function hitMonsters(state, prevFeet) {
  const { player } = state;
  if (player.dead) return;
  const boxes = playerOffsets(player)
    .map((dx) => ({ x: player.x + dx + 8, y: player.y + 6, w: PLAYER.width - 16, h: PLAYER.height - 6 }));
  for (const m of state.monsters) {
    if (m.dead || !boxes.some((box) => overlaps(box, monsterBox(m)))) continue;
    if (player.power || player.grace > 0) {
      m.dead = true;
      state.events.push('monster');
    } else if (player.vy > 0 && prevFeet <= m.y + 14) {
      m.dead = true;
      player.y = m.y - PLAYER.height;
      bounce(state, JUMP_SPEED, 'stomp');
    } else {
      player.dead = true;
      player.vx = 0;
      player.vy = Math.max(player.vy, 0);
      state.events.push('hit');
    }
    return;
  }
}

function moveBullets(state, dt) {
  for (const b of state.bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    for (const m of state.monsters) {
      if (!m.dead && overlaps({ x: b.x - 4, y: b.y - 4, w: 8, h: 8 }, monsterBox(m))) {
        m.dead = true;
        b.hit = true;
        state.events.push('monster');
      }
    }
  }
  state.bullets = state.bullets.filter((b) => !b.hit && b.y > state.cameraY - 40 && b.x > -20 && b.x < WIDTH + 20);
}

// target: point in world coordinates the player aims at (only upward shots).
export function shoot(state, target) {
  const { player } = state;
  if (player.dead || player.power || player.cooldown > 0 || state.over) return;
  const ox = player.x + PLAYER.width / 2;
  const oy = player.y + 6;
  const dx = target ? target.x - ox : 0;
  const dy = target ? Math.min(target.y - oy, -Math.abs(dx) * 0.6, -40) : -1;
  const len = Math.hypot(dx, dy);
  state.bullets.push({ x: ox, y: oy, vx: (dx / len) * BULLET_SPEED, vy: (dy / len) * BULLET_SPEED });
  player.cooldown = SHOOT_COOLDOWN;
  player.shootTime = 0.25;
  state.events.push('shoot');
}

export function wrapX(x) {
  const center = x + PLAYER.width / 2;
  if (center < 0) return x + WIDTH;
  if (center > WIDTH) return x - WIDTH;
  return x;
}

function stepPlatforms(state, dt) {
  for (const p of state.platforms) {
    if (p.broken) {
      p.fallSpeed += GRAVITY * dt;
      p.y += p.fallSpeed * dt;
    } else if (p.vx !== 0) {
      p.x += p.vx * dt;
      if (p.x < 0 || p.x > WIDTH - PLATFORM.width) {
        p.vx = -p.vx;
        p.x = clamp(p.x, 0, WIDTH - PLATFORM.width);
      }
    }
  }
}

function stepMonsters(state, dt) {
  for (const m of state.monsters) {
    if (m.dead) {
      m.vy += GRAVITY * dt;
      m.y += m.vy * dt;
    } else if (m.range) {
      m.x = clamp(m.baseX + Math.sin(state.time * 2 + m.phase) * m.range, 0, WIDTH - MONSTER.width);
    }
  }
}

function stepPlayer(state, direction, dt) {
  const { player } = state;
  const prevFeet = player.y + PLAYER.height;
  if (!player.dead) {
    const target = clamp(direction, -1, 1) * MAX_SPEED_X;
    player.vx += (target - player.vx) * Math.min(1, dt * 12);
    if (Math.abs(player.vx) > 30) player.facing = Math.sign(player.vx);
    player.x = wrapX(player.x + player.vx * dt);
  }
  player.cooldown = Math.max(0, player.cooldown - dt);
  player.shootTime = Math.max(0, player.shootTime - dt);
  player.grace = Math.max(0, player.grace - dt);

  if (player.power) {
    player.powerTime -= dt;
    player.vy = -POWERS[player.power].speed;
    if (player.powerTime <= 0) {
      player.power = null;
      player.grace = GRACE_TIME;
    }
  } else {
    player.vy += GRAVITY * dt;
  }
  player.y += player.vy * dt;

  if (!player.dead && !player.power && player.vy > 0) land(state, prevFeet);
  if (!player.dead) pickUpPowers(state);
  hitMonsters(state, prevFeet);
}

function stepCamera(state) {
  const { player } = state;
  if (!player.dead) {
    const anchor = state.cameraY + state.height * CAMERA_ANCHOR;
    if (player.y < anchor) state.cameraY = player.y - state.height * CAMERA_ANCHOR;
    state.score = Math.max(state.score, Math.floor(state.startY - PLAYER.height - player.y));
  }
  if (player.y > state.cameraY + state.height + 40) {
    if (!state.over) state.events.push('fall');
    state.over = true;
  }
}

function cleanUp(state) {
  const bottom = state.cameraY + state.height + 120;
  state.platforms = state.platforms.filter((p) => p.y < bottom && !(p.gone && state.time - p.goneTime > 0.6));
  state.monsters = state.monsters.filter((m) => m.y < bottom);
}

const MAX_SUBSTEP = 1 / 120;

// direction: analog horizontal input in [-1, 1]; dt in seconds.
export function step(state, direction, dt, rand = Math.random) {
  if (state.over) return state;
  let remaining = Math.min(dt, 1 / 20);
  while (remaining > 1e-6) {
    const h = Math.min(MAX_SUBSTEP, remaining);
    remaining -= h;
    state.time += h;
    stepPlatforms(state, h);
    stepMonsters(state, h);
    stepPlayer(state, direction, h);
    moveBullets(state, h);
    stepCamera(state);
    if (state.over) break;
  }
  generate(state, rand);
  cleanUp(state);
  return state;
}
