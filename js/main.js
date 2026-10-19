import { WIDTH } from './modules/config.js';
import { createGame, step, shoot } from './modules/world.js';
import { drawWorld } from './modules/render.js';
import { createInput } from './modules/input.js';
import { createAudio } from './modules/audio.js';
import { readNumber, readFlag, write, removeLegacyData } from './modules/storage.js';

const MIN_HEIGHT = 540;
const MAX_HEIGHT = 820;

const ui = {
  stage: document.getElementById('stage'),
  canvas: document.getElementById('game'),
  hud: document.getElementById('hud'),
  score: document.getElementById('score'),
  pauseBtn: document.getElementById('pause'),
  soundBtn: document.getElementById('sound'),
  menu: document.getElementById('menu'),
  menuBest: document.getElementById('menu-best'),
  playBtn: document.getElementById('play'),
  controlBtn: document.getElementById('control'),
  controlHelp: document.getElementById('control-help'),
  pauseScreen: document.getElementById('paused'),
  resumeBtn: document.getElementById('resume'),
  quitBtn: document.getElementById('quit'),
  over: document.getElementById('gameover'),
  overScore: document.getElementById('over-score'),
  overBest: document.getElementById('over-best'),
  newRecord: document.getElementById('new-record'),
  againBtn: document.getElementById('again'),
  menuBtn: document.getElementById('to-menu'),
};

const ctx = ui.canvas.getContext('2d');
const input = createInput(ui.canvas);
const audio = createAudio();
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

const app = {
  mode: 'menu', // menu | playing | paused | over
  height: 640,
  scale: 1,
  state: null,
  best: readNumber('best'),
  useTilt: readFlag('tilt', isTouchDevice),
  lastTime: 0,
};
audio.setMuted(readFlag('muted', false));

function resize() {
  const rect = ui.stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  app.height = Math.round(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, (WIDTH * rect.height) / rect.width)));
  app.scale = rect.width / WIDTH;
  ui.canvas.width = Math.round(rect.width * dpr);
  ui.canvas.height = Math.round(rect.width * (app.height / WIDTH) * dpr);
  ui.canvas.style.height = `${rect.width * (app.height / WIDTH)}px`;
  ctx.setTransform((rect.width * dpr) / WIDTH, 0, 0, (rect.width * dpr) / WIDTH, 0, 0);
  if (app.state) app.state.height = app.height;
}

function show(screen) {
  for (const el of [ui.menu, ui.pauseScreen, ui.over]) el.hidden = el !== screen;
  ui.hud.hidden = screen === ui.menu;
}

function updateControlLabel() {
  if (!isTouchDevice) {
    ui.controlBtn.hidden = true;
    ui.controlHelp.textContent = '← → pour bouger · Espace ou clic pour tirer';
    return;
  }
  ui.controlBtn.textContent = app.useTilt ? 'Contrôle : inclinaison 📱' : 'Contrôle : tactile 👆';
  ui.controlHelp.textContent = app.useTilt
    ? 'Incline ton natel pour bouger, tape l’écran pour tirer.'
    : 'Garde le doigt à gauche ou à droite pour bouger, tape en haut pour tirer.';
}

function updateSoundLabel() {
  ui.soundBtn.textContent = audio.isMuted() ? '🔇' : '🔊';
  ui.soundBtn.setAttribute('aria-label', audio.isMuted() ? 'Activer le son' : 'Couper le son');
}

async function start() {
  audio.unlock();
  if (isTouchDevice && app.useTilt && !input.isTiltEnabled()) {
    const ok = await input.enableTilt();
    if (!ok) {
      app.useTilt = false;
      write('tilt', false);
      updateControlLabel();
    }
  }
  if (!app.useTilt) input.disableTilt();
  app.state = createGame(app.height);
  input.takeShots();
  app.mode = 'playing';
  show(null);
  ui.score.textContent = '0';
  ui.canvas.focus();
}

function pause() {
  if (app.mode !== 'playing') return;
  app.mode = 'paused';
  show(ui.pauseScreen);
  ui.resumeBtn.focus();
}

function resume() {
  app.mode = 'playing';
  show(null);
  app.lastTime = performance.now();
}

function toMenu() {
  app.mode = 'menu';
  app.state = createGame(app.height);
  ui.menuBest.textContent = String(app.best);
  show(ui.menu);
  ui.playBtn.focus();
}

function gameOver() {
  app.mode = 'over';
  const score = app.state.score;
  const record = score > app.best;
  if (record) {
    app.best = score;
    write('best', score);
  }
  ui.overScore.textContent = String(score);
  ui.overBest.textContent = String(app.best);
  ui.newRecord.hidden = !record;
  show(ui.over);
  ui.againBtn.focus();
}

function handleShots() {
  for (const point of input.takeShots()) {
    if (app.mode !== 'playing') continue;
    const target = point ? { x: point.x * WIDTH, y: app.state.cameraY + point.y * app.height } : null;
    shoot(app.state, target);
  }
}

function frame(time) {
  const dt = Math.min((time - app.lastTime) / 1000, 0.05);
  app.lastTime = time;
  if (app.mode === 'playing') {
    handleShots();
    step(app.state, input.direction(), dt);
    for (const event of app.state.events.splice(0)) audio.play(event);
    ui.score.textContent = String(app.state.score);
    if (app.state.over) gameOver();
  } else if (app.mode === 'menu') {
    // Attract mode: the Doodler keeps bouncing behind the menu.
    step(app.state, 0, dt);
    app.state.events.length = 0;
    if (app.state.over) app.state = createGame(app.height);
  }
  drawWorld(ctx, app.state);
  requestAnimationFrame(frame);
}

ui.playBtn.addEventListener('click', start);
ui.againBtn.addEventListener('click', start);
ui.menuBtn.addEventListener('click', toMenu);
ui.quitBtn.addEventListener('click', toMenu);
ui.pauseBtn.addEventListener('click', pause);
ui.resumeBtn.addEventListener('click', resume);
ui.soundBtn.addEventListener('click', () => {
  audio.setMuted(!audio.isMuted());
  write('muted', audio.isMuted());
  updateSoundLabel();
});
ui.controlBtn.addEventListener('click', () => {
  app.useTilt = !app.useTilt;
  write('tilt', app.useTilt);
  updateControlLabel();
});
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (app.mode === 'playing') pause();
    else if (app.mode === 'paused') resume();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
});
window.addEventListener('resize', resize);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline support is optional; the game works without it.
    });
  });
}

removeLegacyData();
resize();
updateControlLabel();
updateSoundLabel();
toMenu();
app.lastTime = performance.now();
requestAnimationFrame(frame);
