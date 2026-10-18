import { WORLD, createGame, step } from './modules/game.js';
import { render } from './modules/renderer.js';
import { createInput } from './modules/input.js';

const BEST_KEY = 'doodle-best';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');
const startBtn = document.getElementById('start');

canvas.width = WORLD.width;
canvas.height = WORLD.height;

const input = createInput(canvas);
let state = createGame();
let running = false;
let lastTime = 0;

function readBest() {
  try {
    const value = Number.parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage unavailable (private mode): best score just isn't kept.
  }
}

let best = readBest();
bestEl.textContent = String(best);

function endGame() {
  running = false;
  if (state.score > best) {
    best = state.score;
    saveBest(best);
    bestEl.textContent = String(best);
  }
  overlayText.textContent = `Game over — score: ${state.score}`;
  startBtn.textContent = 'Play again';
  overlay.hidden = false;
  startBtn.focus();
}

function loop(time) {
  if (!running) return;
  // Clamp dt so a background tab doesn't teleport the player.
  const dt = Math.min((time - lastTime) / 1000, 1 / 30);
  lastTime = time;
  step(state, input.direction(), dt);
  render(ctx, state);
  scoreEl.textContent = String(state.score);
  if (state.over) {
    endGame();
    return;
  }
  requestAnimationFrame(loop);
}

function start() {
  state = createGame();
  overlay.hidden = true;
  running = true;
  canvas.focus();
  requestAnimationFrame((time) => {
    lastTime = time;
    requestAnimationFrame(loop);
  });
}

startBtn.addEventListener('click', start);
render(ctx, state);
