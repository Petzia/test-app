// Keyboard, touch and tilt (device orientation) controls.
// Tilt mode: tilt the phone to move, tap anywhere to shoot toward that point.
// Touch mode: hold the left/right half of the screen to move, tap the top area to shoot.
const SHOOT_ZONE = 0.25; // top fraction of the screen used for shooting in touch mode
const TILT_FULL_SPEED_DEG = 22;

export function createInput(target) {
  const keys = { left: false, right: false };
  const touches = new Map();
  const shots = [];
  let tilt = null;
  let tiltEnabled = false;

  const setKey = (event, pressed) => {
    const code = event.code;
    if (code === 'ArrowLeft' || code === 'KeyA') keys.left = pressed;
    else if (code === 'ArrowRight' || code === 'KeyD') keys.right = pressed;
    else if (pressed && !event.repeat && (code === 'Space' || code === 'ArrowUp' || code === 'KeyW')) shots.push(null);
    else return;
    event.preventDefault();
  };
  window.addEventListener('keydown', (e) => setKey(e, true));
  window.addEventListener('keyup', (e) => setKey(e, false));
  window.addEventListener('blur', () => {
    keys.left = false;
    keys.right = false;
    touches.clear();
  });

  const relative = (touch) => {
    const rect = target.getBoundingClientRect();
    return { x: (touch.clientX - rect.left) / rect.width, y: (touch.clientY - rect.top) / rect.height };
  };

  target.addEventListener('touchstart', (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      const point = relative(touch);
      if (tiltEnabled || point.y < SHOOT_ZONE) shots.push(point);
      else touches.set(touch.identifier, point);
    }
  }, { passive: false });
  const endTouch = (event) => {
    for (const touch of event.changedTouches) touches.delete(touch.identifier);
  };
  target.addEventListener('touchmove', (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      if (touches.has(touch.identifier)) touches.set(touch.identifier, relative(touch));
    }
  }, { passive: false });
  target.addEventListener('touchend', endTouch);
  target.addEventListener('touchcancel', endTouch);
  target.addEventListener('mousedown', (event) => shots.push(relative(event)));

  const onOrientation = (event) => {
    if (typeof event.gamma === 'number') tilt = event.gamma;
  };

  async function enableTilt() {
    const Orientation = window.DeviceOrientationEvent;
    if (!Orientation) return false;
    try {
      if (typeof Orientation.requestPermission === 'function') {
        const answer = await Orientation.requestPermission();
        if (answer !== 'granted') return false;
      }
    } catch {
      return false;
    }
    window.addEventListener('deviceorientation', onOrientation);
    tiltEnabled = true;
    return true;
  }

  function disableTilt() {
    window.removeEventListener('deviceorientation', onOrientation);
    tiltEnabled = false;
    tilt = null;
  }

  function direction() {
    const keyDir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (keyDir) return keyDir;
    if (tiltEnabled && tilt !== null) return Math.max(-1, Math.min(1, tilt / TILT_FULL_SPEED_DEG));
    let touchDir = 0;
    for (const point of touches.values()) touchDir += point.x < 0.5 ? -1 : 1;
    return Math.max(-1, Math.min(1, touchDir));
  }

  // Returns queued shots as relative screen points ({x, y} in 0..1) or null for "straight up".
  function takeShots() {
    return shots.splice(0, shots.length);
  }

  return { direction, takeShots, enableTilt, disableTilt, isTiltEnabled: () => tiltEnabled };
}
