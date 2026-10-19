// Tiny synthesized sound effects with the Web Audio API (no audio files).
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(type, from, to, duration, volume = 0.15) {
    const audio = muted ? null : ensure();
    if (!audio) return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(to, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  const SOUNDS = {
    jump: () => tone('sine', 320, 760, 0.12),
    stomp: () => tone('square', 200, 900, 0.15, 0.1),
    spring: () => tone('triangle', 200, 1400, 0.3),
    trampoline: () => tone('triangle', 150, 1600, 0.4),
    break: () => tone('sawtooth', 300, 60, 0.18, 0.08),
    shoot: () => tone('square', 900, 400, 0.07, 0.06),
    monster: () => tone('sawtooth', 600, 80, 0.3, 0.1),
    propeller: () => tone('square', 400, 800, 0.25, 0.05),
    jetpack: () => tone('sawtooth', 120, 400, 0.5, 0.08),
    hit: () => tone('square', 500, 60, 0.5, 0.12),
    fall: () => tone('sine', 700, 80, 0.8, 0.12),
  };

  return {
    unlock: ensure,
    play: (name) => SOUNDS[name]?.(),
    setMuted: (value) => { muted = value; },
    isMuted: () => muted,
  };
}
