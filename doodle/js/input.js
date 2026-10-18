// Tracks keyboard and touch input and exposes the current horizontal direction.
export function createInput(target) {
  const keys = { left: false, right: false };
  let touchDir = 0;

  // event.code is layout-independent: KeyA is Q on AZERTY keyboards.
  const setKey = (event, pressed) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = pressed;
    else if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = pressed;
    else return;
    event.preventDefault();
  };
  window.addEventListener('keydown', (e) => setKey(e, true));
  window.addEventListener('keyup', (e) => setKey(e, false));
  window.addEventListener('blur', () => {
    keys.left = false;
    keys.right = false;
  });

  const onTouch = (event) => {
    const touch = event.touches[0];
    if (!touch) {
      touchDir = 0;
      return;
    }
    const rect = target.getBoundingClientRect();
    touchDir = touch.clientX < rect.left + rect.width / 2 ? -1 : 1;
  };
  target.addEventListener('touchstart', onTouch, { passive: true });
  target.addEventListener('touchmove', onTouch, { passive: true });
  target.addEventListener('touchend', onTouch, { passive: true });

  return {
    direction: () => (keys.right ? 1 : 0) - (keys.left ? 1 : 0) || touchDir,
  };
}
