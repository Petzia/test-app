// Pure game logic: no DOM access, so it can be tested with node --test.

export const WORLD = Object.freeze({
  width: 400,
  height: 600,
  gravity: 1500,
  jumpSpeed: 720,
  moveSpeed: 320,
  playerSize: 40,
  platformWidth: 70,
  platformHeight: 12,
  platformGap: 85,
});

export function createPlatform(x, y, rand = Math.random) {
  const moving = rand() < 0.2;
  return { x, y, vx: moving ? 80 : 0 };
}

export function createGame(rand = Math.random) {
  const platforms = [];
  // Wide starting platform under the player, then random ones going up.
  platforms.push({ x: WORLD.width / 2 - WORLD.platformWidth / 2, y: WORLD.height - 40, vx: 0 });
  for (let y = WORLD.height - 40 - WORLD.platformGap; y > -WORLD.platformGap; y -= WORLD.platformGap) {
    platforms.push(createPlatform(rand() * (WORLD.width - WORLD.platformWidth), y, rand));
  }
  return {
    player: {
      x: WORLD.width / 2 - WORLD.playerSize / 2,
      y: WORLD.height - 40 - WORLD.playerSize,
      vy: -WORLD.jumpSpeed,
    },
    platforms,
    score: 0,
    climbed: 0,
    over: false,
  };
}

export function wrapX(x, size, width = WORLD.width) {
  if (x + size < 0) return width;
  if (x > width) return -size;
  return x;
}

export function landsOn(player, prevBottom, platform) {
  const bottom = player.y + WORLD.playerSize;
  const overlapsX =
    player.x + WORLD.playerSize > platform.x && player.x < platform.x + WORLD.platformWidth;
  return player.vy > 0 && overlapsX && prevBottom <= platform.y && bottom >= platform.y;
}

function movePlatforms(platforms, dt) {
  for (const p of platforms) {
    if (p.vx === 0) continue;
    p.x += p.vx * dt;
    if (p.x < 0 || p.x + WORLD.platformWidth > WORLD.width) {
      p.vx = -p.vx;
      p.x = Math.min(Math.max(p.x, 0), WORLD.width - WORLD.platformWidth);
    }
  }
}

function scrollWorld(state, rand) {
  const threshold = WORLD.height / 3;
  if (state.player.y >= threshold) return;
  const shift = threshold - state.player.y;
  state.player.y = threshold;
  state.climbed += shift;
  state.score = Math.floor(state.climbed / 10);
  for (const p of state.platforms) p.y += shift;
  state.platforms = state.platforms.filter((p) => p.y < WORLD.height);
  let topY = Math.min(...state.platforms.map((p) => p.y));
  while (topY > -WORLD.platformGap) {
    topY -= WORLD.platformGap;
    state.platforms.push(createPlatform(rand() * (WORLD.width - WORLD.platformWidth), topY, rand));
  }
}

// direction: -1 (left), 0 (none) or 1 (right). dt in seconds.
export function step(state, direction, dt, rand = Math.random) {
  if (state.over) return state;
  const { player } = state;
  const prevBottom = player.y + WORLD.playerSize;

  player.x = wrapX(player.x + direction * WORLD.moveSpeed * dt, WORLD.playerSize);
  player.vy += WORLD.gravity * dt;
  player.y += player.vy * dt;

  movePlatforms(state.platforms, dt);
  for (const p of state.platforms) {
    if (landsOn(player, prevBottom, p)) {
      player.y = p.y - WORLD.playerSize;
      player.vy = -WORLD.jumpSpeed;
      break;
    }
  }

  scrollWorld(state, rand);
  if (player.y > WORLD.height) state.over = true;
  return state;
}
