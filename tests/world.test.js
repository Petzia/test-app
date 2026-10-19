import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WIDTH, PLAYER, PLATFORM, JUMP_SPEED, SPRING_SPEED, TRAMPOLINE_SPEED, GRAVITY, ITEMS } from '../js/modules/config.js';
import { createGame, step, shoot, wrapX, gapRange, difficulty, playerOffsets } from '../js/modules/world.js';

const HEIGHT = 640;
const DT = 1 / 120;

function seeded(seed = 7) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// A game reduced to a single platform right under a falling player.
function setup(type = 'normal', item = null) {
  const state = createGame(HEIGHT, seeded());
  const platform = { x: 100, y: 400, type, vx: 0, broken: false, fallSpeed: 0, gone: false, goneTime: 0, item };
  state.platforms = [platform];
  state.monsters = [];
  state.nextY = -1e9; // stop generation
  state.player = { ...state.player, x: 107, y: 400 - PLAYER.height - 2, vx: 0, vy: 300 };
  return { state, platform };
}

test('the game starts by jumping off a platform under the player', () => {
  const state = createGame(HEIGHT, seeded());
  assert.equal(state.player.y + PLAYER.height, state.platforms[0].y);
  assert.equal(state.player.vy, -JUMP_SPEED);
  assert.ok(state.platforms.length > 5);
});

test('every gap between reachable platforms is below the jump height', () => {
  const apex = (JUMP_SPEED ** 2) / (2 * GRAVITY);
  for (const h of [0, 5000, 20000, 100000]) assert.ok(gapRange(h).max < apex - 15, `height ${h}`);
  const state = createGame(HEIGHT, seeded(3));
  state.cameraY = -30000;
  step(state, 0, 0, seeded(3));
  const path = state.platforms.filter((p) => p.type !== 'breakable').map((p) => p.y).sort((a, b) => b - a);
  for (let i = 1; i < path.length; i += 1) assert.ok(path[i - 1] - path[i] < apex - 15);
});

test('difficulty grows with height and is capped', () => {
  assert.equal(difficulty(0), 0);
  assert.ok(difficulty(10000) > 0 && difficulty(10000) < 1);
  assert.equal(difficulty(1e6), 1);
});

test('landing on a platform bounces', () => {
  const { state } = setup();
  step(state, 0, DT);
  assert.equal(state.player.vy, -JUMP_SPEED);
  assert.deepEqual(state.events, ['jump']);
});

test('breakable platforms break and do not bounce', () => {
  const { state, platform } = setup('breakable');
  step(state, 0, DT);
  assert.equal(platform.broken, true);
  assert.ok(state.player.vy > 0);
});

test('vanishing platforms bounce once then disappear', () => {
  const { state, platform } = setup('vanish');
  step(state, 0, DT);
  assert.equal(state.player.vy, -JUMP_SPEED);
  assert.equal(platform.gone, true);
});

test('springs launch the player higher', () => {
  const item = { kind: 'spring', offset: 10, used: false, usedTime: 0 };
  const { state } = setup('normal', item);
  state.player.y = 400 - ITEMS.spring.height - PLAYER.height - 2;
  step(state, 0, DT);
  assert.equal(state.player.vy, -SPRING_SPEED);
  assert.equal(item.used, true);
});

test('picking up a jetpack makes the player fly', () => {
  const item = { kind: 'jetpack', offset: 10, used: false, usedTime: 0 };
  const { state } = setup('normal', item);
  state.player.vy = -100;
  state.player.y = 400 - PLAYER.height - 10;
  step(state, 0, DT);
  assert.equal(state.player.power, 'jetpack');
  step(state, 0, 0.05);
  assert.ok(state.player.vy < -900);
});

test('stomping a monster kills it, touching it from below kills the player', () => {
  const { state } = setup();
  state.platforms = [];
  const monster = { x: 100, y: 300, baseX: 100, baseY: 300, phase: 0, range: 0, dead: false, vy: 0 };
  state.monsters = [monster];
  state.player = { ...state.player, x: 106, y: 300 - PLAYER.height - 1, vy: 300 };
  for (let i = 0; i < 10 && !monster.dead; i += 1) step(state, 0, DT);
  assert.equal(monster.dead, true);
  assert.equal(state.player.vy, -JUMP_SPEED);

  const second = setup();
  const m2 = { x: 100, y: 300, baseX: 100, baseY: 300, phase: 0, range: 0, dead: false, vy: 0 };
  second.state.platforms = [];
  second.state.monsters = [m2];
  second.state.player = { ...second.state.player, x: 106, y: 320, vy: -500 };
  step(second.state, 0, DT);
  assert.equal(second.state.player.dead, true);
  assert.equal(m2.dead, false);
});

test('bullets kill monsters', () => {
  const { state } = setup();
  const monster = { x: 100, y: 150, baseX: 100, baseY: 150, phase: 0, range: 0, dead: false, vy: 0 };
  state.monsters = [monster];
  shoot(state, null);
  assert.equal(state.bullets.length, 1);
  for (let i = 0; i < 40; i += 1) step(state, 0, DT);
  assert.equal(monster.dead, true);
});

test('shooting has a cooldown and always goes upward', () => {
  const { state } = setup();
  shoot(state, { x: 0, y: 1000 });
  shoot(state, { x: 0, y: 1000 });
  assert.equal(state.bullets.length, 1);
  assert.ok(state.bullets[0].vy < 0);
});

test('the player wraps around the screen edges', () => {
  assert.equal(wrapX(-PLAYER.width), -PLAYER.width + WIDTH);
  assert.equal(wrapX(WIDTH - 1), WIDTH - 1 - WIDTH);
  assert.equal(wrapX(100), 100);
});

test('climbing raises the score and moves the camera; falling ends the game', () => {
  const rand = seeded(11);
  const state = createGame(HEIGHT, rand);
  state.player.vy = -SPRING_SPEED;
  for (let i = 0; i < 30; i += 1) step(state, 0, 1 / 60, rand);
  assert.ok(state.score > 100);
  assert.ok(state.cameraY < 0);

  const { state: falling } = setup();
  falling.platforms = [];
  falling.player.y = HEIGHT + 100;
  step(falling, 0, DT);
  assert.equal(falling.over, true);
  assert.ok(falling.events.includes('fall'));
});

test('moving platforms bounce off the walls', () => {
  const { state, platform } = setup('moving');
  platform.vx = 200;
  platform.x = WIDTH - PLATFORM.width - 1;
  state.player.y = 0;
  state.player.vy = -100;
  step(state, 0, 0.02);
  assert.ok(platform.vx < 0);
});

test('a long automatic game never crashes and stays consistent', () => {
  const rand = seeded(5);
  const state = createGame(HEIGHT, rand);
  for (let i = 0; i < 6000 && !state.over; i += 1) {
    const target = state.platforms.find((p) => p.y < state.player.y && !p.broken);
    const dir = target ? Math.sign(target.x + PLATFORM.width / 2 - (state.player.x + PLAYER.width / 2)) : 0;
    step(state, dir, 1 / 60, rand);
  }
  assert.ok(Number.isFinite(state.score));
  assert.ok(state.platforms.length < 200);
});

test('the wrapped copy of the player lands on edge platforms', () => {
  const { state, platform } = setup();
  platform.x = WIDTH - PLATFORM.width; // right edge
  state.player.x = -20; // copy drawn at WIDTH - 20, over the platform
  assert.deepEqual(playerOffsets(state.player), [0, WIDTH]);
  step(state, 0, DT);
  assert.equal(state.player.vy, -JUMP_SPEED);
});

test('trampolines launch even higher than springs', () => {
  const item = { kind: 'trampoline', offset: 10, used: false, usedTime: 0 };
  const { state } = setup('normal', item);
  state.player.y = 400 - ITEMS.trampoline.height - PLAYER.height - 2;
  step(state, 0, DT);
  assert.equal(state.player.vy, -TRAMPOLINE_SPEED);
});

test('a flying player kills monsters, and stays safe briefly after the power ends', () => {
  const { state } = setup();
  state.platforms = [];
  const monster = { x: 100, y: 300, baseX: 100, baseY: 300, phase: 0, range: 0, dead: false, vy: 0 };
  state.monsters = [monster];
  state.player = { ...state.player, x: 106, y: 320, vy: -900, power: null, grace: 0.5 };
  step(state, 0, DT);
  assert.equal(monster.dead, true);
  assert.equal(state.player.dead, false);
});

test('power-ups expire and give a grace period', () => {
  const { state } = setup();
  state.platforms = [];
  state.player = { ...state.player, y: 200, power: 'propeller', powerTime: 0.01, grace: 0 };
  step(state, 0, 0.02);
  assert.equal(state.player.power, null);
  assert.ok(state.player.grace > 0);
});
