import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORLD, createGame, step, wrapX, landsOn } from '../js/modules/game.js';

const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

test('createGame starts with a platform under the player', () => {
  const state = createGame(seeded());
  const bottom = state.player.y + WORLD.playerSize;
  assert.equal(bottom, state.platforms[0].y);
  assert.ok(state.platforms.length > 5);
  assert.equal(state.over, false);
});

test('wrapX wraps around both edges', () => {
  assert.equal(wrapX(-50, 40), WORLD.width);
  assert.equal(wrapX(WORLD.width + 1, 40), -40);
  assert.equal(wrapX(100, 40), 100);
});

test('landsOn only when falling onto the platform from above', () => {
  const platform = { x: 100, y: 300, vx: 0 };
  const player = { x: 110, y: 300 - WORLD.playerSize + 2, vy: 100 };
  assert.equal(landsOn(player, 299, platform), true);
  assert.equal(landsOn({ ...player, vy: -100 }, 299, platform), false);
  assert.equal(landsOn({ ...player, x: 300 }, 299, platform), false);
});

test('player bounces when landing on a platform', () => {
  const state = createGame(seeded());
  state.platforms = [{ x: 0, y: 500, vx: 0 }];
  state.player = { x: 10, y: 500 - WORLD.playerSize - 1, vy: 200 };
  step(state, 0, 1 / 60, seeded());
  assert.equal(state.player.vy, -WORLD.jumpSpeed);
});

test('falling below the screen ends the game', () => {
  const state = createGame(seeded());
  state.platforms = [];
  state.player = { x: 10, y: WORLD.height - 1, vy: 500 };
  step(state, 0, 1 / 60, seeded());
  assert.equal(state.over, true);
});

test('climbing scrolls the world and increases the score', () => {
  const rand = seeded();
  const state = createGame(rand);
  state.player.y = WORLD.height / 3;
  state.player.vy = -WORLD.jumpSpeed;
  for (let i = 0; i < 20; i += 1) step(state, 0, 1 / 60, rand);
  assert.ok(state.score > 0);
  assert.ok(state.platforms.some((p) => p.y < 0));
});
