// utils/sound.ts

export function playClickSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, audioCtx.currentTime); // Halka soft click tone
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);    // Halka volume taaki kaan me na chubhe
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch {}
}

// Brand Signature Startup Chime (Splash Screen ke liye)
export function playSplashChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Harmonic blend: C5 (523.25Hz) -> E5 (659.25Hz) -> C6 (1046.5Hz)
    const tones = [
      { freq: 523.25, offset: 0.0,  gainVal: 0.12, dur: 0.8 },
      { freq: 659.25, offset: 0.09, gainVal: 0.14, dur: 0.9 },
      { freq: 1046.50, offset: 0.18, gainVal: 0.10, dur: 1.2 }
    ];

    tones.forEach(({ freq, offset, gainVal, dur }) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + offset);

      // Smooth attack & long crystal fade out
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + offset + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + dur);
    });
  } catch {}
}
