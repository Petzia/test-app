// Game tuning. World units are logical pixels; the world is WIDTH wide, y grows downward.
export const WIDTH = 360;
export const GRAVITY = 1700;
export const JUMP_SPEED = 760; // apex ≈ 170 px
export const SPRING_SPEED = 1250;
export const TRAMPOLINE_SPEED = 1650;
export const MAX_SPEED_X = 380;
export const BULLET_SPEED = 950;
export const SHOOT_COOLDOWN = 0.15;

export const PLAYER = { width: 46, height: 46, footInset: 11 };
export const PLATFORM = { width: 60, height: 14 };
export const MONSTER = { width: 58, height: 44 };
export const CAMERA_ANCHOR = 0.4; // player stays below this fraction of the screen while climbing

export const POWERS = {
  propeller: { duration: 3, speed: 620 },
  jetpack: { duration: 3.5, speed: 1050 },
};

export const ITEMS = {
  spring: { width: 18, height: 12 },
  trampoline: { width: 40, height: 10 },
  propeller: { width: 30, height: 20 },
  jetpack: { width: 26, height: 34 },
};

// Height (in world px) at which the game reaches full difficulty.
export const MAX_DIFFICULTY_HEIGHT = 20000;
