export function playRevealTone() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    // Resume context if suspended (autoplay policy) before scheduling
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio not supported — silent fallback
  }
}
