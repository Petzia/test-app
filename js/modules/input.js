// Tracks keyboard and touch input and exposes the current horizontal direction.
export function createInput(target) {
  const keys = { left: false, right: false };
  let touchDir = 0;

  const setKey = (event, pressed) => {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'q') keys.left = pressed;
    if (event.key === 'ArrowRight' || event.key === 'd') keys.right = pressed;
  };
  window.addEventListener('keydown', (e) => setKey(e, true));
  window.addEventListener('keyup', (e) => setKey(e, false));

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
