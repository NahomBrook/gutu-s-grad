/**
 * Piano synthesizer — plays "Ode to Joy" (Beethoven, 1824 · Public Domain)
 * Built entirely with the Web Audio API; no audio file required.
 */

// ── Note frequencies (A4 = 440 Hz, equal temperament) ──────────────────────
const F = {
  G3:196.00, A3:220.00, B3:246.94,
  C4:261.63, D4:293.66, E4:329.63, F4:349.23,
  G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33,
  R:0, // rest
};

// ── Tempo ───────────────────────────────────────────────────────────────────
const BPM = 68;
const Q  = 60 / BPM;     // quarter note  (~0.88 s)
const H  = Q * 2;         // half
const DQ = Q * 1.5;       // dotted quarter
const E  = Q / 2;         // eighth

// ── Melody: Ode to Joy (Beethoven 9th, 4th movement theme) ─────────────────
// Format: [note, duration_in_seconds]
const MELODY = [
  // ── Phrase A ──────────────────────────────
  ['E4',Q], ['E4',Q], ['F4',Q], ['G4',Q],
  ['G4',Q], ['F4',Q], ['E4',Q], ['D4',Q],
  ['C4',Q], ['C4',Q], ['D4',Q], ['E4',Q],
  ['E4',DQ],['D4',E], ['D4',H],
  // ── Phrase B ──────────────────────────────
  ['E4',Q], ['E4',Q], ['F4',Q], ['G4',Q],
  ['G4',Q], ['F4',Q], ['E4',Q], ['D4',Q],
  ['C4',Q], ['C4',Q], ['D4',Q], ['E4',Q],
  ['D4',DQ],['C4',E], ['C4',H],
  // ── Bridge ────────────────────────────────
  ['D4',Q], ['D4',Q], ['E4',Q], ['C4',Q],
  ['D4',Q], ['E4',E], ['F4',E], ['E4',Q], ['C4',Q],
  ['D4',Q], ['E4',E], ['F4',E], ['E4',Q], ['D4',Q],
  ['C4',Q], ['D4',Q], ['G3',H],
  // ── Phrase A (reprise) ────────────────────
  ['E4',Q], ['E4',Q], ['F4',Q], ['G4',Q],
  ['G4',Q], ['F4',Q], ['E4',Q], ['D4',Q],
  ['C4',Q], ['C4',Q], ['D4',Q], ['E4',Q],
  ['D4',DQ],['C4',E], ['C4',H],
  // ── Rest before loop ─────────────────────
  ['R', H],
];

// Total melody duration (seconds)
const MELODY_DURATION = MELODY.reduce((s, [, d]) => s + d, 0);

// ── Soft chord accompaniment (left hand) ───────────────────────────────────
// Simple I-V-vi-IV-I-IV-I-V pattern, one chord per bar (4 beats)
const BAR = Q * 4;
const CHORDS = [
  // Each entry: [root, third, fifth]  — replayed every bar
  [ F.C4, F.E4, F.G4  ],  // C major
  [ F.G3, F.B3, F.D4  ],  // G major
  [ F.A3, F.C4, F.E4  ],  // A minor
  [ F.F3, F.A3, F.C4  ],  // F major
  [ F.C4, F.E4, F.G4  ],
  [ F.G3, F.B3, F.D4  ],
  [ F.C4, F.E4, F.G4  ],
  [ F.G3, F.B3, F.D4  ],
  // bridge bars
  [ F.G3, F.B3, F.D4  ],
  [ F.C4, F.E4, F.G4  ],
  [ F.G3, F.B3, F.D4  ],
  [ F.G3, F.B3, F.D4  ],
  // reprise
  [ F.C4, F.E4, F.G4  ],
  [ F.G3, F.B3, F.D4  ],
  [ F.A3, F.C4, F.E4  ],
  [ F.F3, F.A3, F.C4  ],
  [ F.C4, F.E4, F.G4  ],
  [ F.G3, F.B3, F.D4  ],
  [ F.C4, F.E4, F.G4  ],
  [ F.G3, F.B3, F.D4  ],
];

// ── Single piano note (sine + harmonics + envelope) ─────────────────────────
function scheduleNote(ctx, dest, freq, startTime, duration, gainAmt = 0.45) {
  if (!freq || !ctx) return;

  const env = ctx.createGain();
  env.connect(dest);

  // Piano-like timbre: fundamental + 2nd, 3rd, 4th harmonics
  [[1, 1.0], [2, 0.35], [3, 0.12], [4, 0.04]].forEach(([mult, rel]) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * mult, startTime);
    osc.connect(env);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.6);
  });

  // ADSR envelope: sharp hammer-like attack, quick initial decay, gentle tail
  env.gain.setValueAtTime(0,          startTime);
  env.gain.linearRampToValueAtTime(gainAmt, startTime + 0.006);  // attack
  env.gain.exponentialRampToValueAtTime(gainAmt * 0.45, startTime + 0.07);  // decay
  env.gain.setValueAtTime(gainAmt * 0.38, startTime + duration * 0.85);     // sustain
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.4); // release
}

// ── Chord note (quieter, lower velocity) ────────────────────────────────────
function scheduleChordNote(ctx, dest, freq, startTime, duration) {
  scheduleNote(ctx, dest, freq, startTime, duration, 0.08);
}

// ── Schedule one full pass through the melody ───────────────────────────────
function scheduleMelody(ctx, dest, startTime) {
  let t = startTime;
  MELODY.forEach(([note, dur]) => {
    scheduleNote(ctx, dest, F[note], t, dur);
    t += dur;
  });
}

function scheduleChords(ctx, dest, startTime) {
  let bar = 0;
  let t   = startTime;
  while (t < startTime + MELODY_DURATION && bar < CHORDS.length) {
    const chord = CHORDS[bar % CHORDS.length];
    chord.forEach(freq => scheduleChordNote(ctx, dest, freq, t, BAR * 0.9));
    t += BAR;
    bar++;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────
export function createPianoPlayer() {
  let ctx         = null;
  let masterGain  = null;
  let loopTimer   = null;
  let playing     = false;

  function loop(startTime) {
    if (!playing || !ctx) return;
    scheduleMelody(ctx, masterGain, startTime);
    scheduleChords(ctx, masterGain, startTime);
    // Re-schedule next iteration 800 ms before current one ends
    const wait = (MELODY_DURATION - 0.8) * 1000;
    loopTimer = setTimeout(() => loop(startTime + MELODY_DURATION), wait);
  }

  return {
    start() {
      if (playing) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);

      // Gentle compressor to even out dynamics
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value      = 8;
      comp.ratio.value     = 3;
      comp.attack.value    = 0.01;
      comp.release.value   = 0.3;

      masterGain.connect(comp);
      comp.connect(ctx.destination);

      playing = true;

      // Fade in over 3 s
      masterGain.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 3);

      loop(ctx.currentTime + 0.15);
    },

    stop() {
      playing = false;
      clearTimeout(loopTimer);
      if (!ctx) return;
      // Fade out over 1.5 s then close context
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setTimeout(() => { ctx && ctx.close(); ctx = null; }, 1600);
    },

    get isPlaying() { return playing; },
  };
}
