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
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch {}
}

// Brand Signature Startup Chime (Bulletproof with Autoplay Unlock)
export function playSplashChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();

    const triggerNotes = () => {
      const now = audioCtx.currentTime;

      // Harmonic blend: C5 -> E5 -> C6
      const tones = [
        { freq: 523.25, offset: 0.0,  gainVal: 0.22, dur: 0.7 },
        { freq: 659.25, offset: 0.09, gainVal: 0.25, dur: 0.8 },
        { freq: 1046.50, offset: 0.18, gainVal: 0.20, dur: 1.1 }
      ];

      tones.forEach(({ freq, offset, gainVal, dur }) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + offset);

        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(gainVal, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + dur);
      });
    };

    if (audioCtx.state === "suspended") {
      audioCtx.resume().then(() => triggerNotes()).catch(() => {});
    } else {
      triggerNotes();
    }
  } catch {}
}
