import { chordToMidi, voiceLead } from './theory-utils';

let _audioCtx: AudioContext | null = null;
let _playStop = false;
let _lastMidi: number[] | null = null;

export function getAudioCtx(): AudioContext {
  if (typeof window === 'undefined') return {} as AudioContext; // SSR safety
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

export function playOne(label: string, duration: number = 1.4) {
  const ctx = getAudioCtx();
  if (!ctx || !ctx.destination) return;
  
  let midi = chordToMidi(label);
  if (_lastMidi) midi = voiceLead(_lastMidi, midi);
  _lastMidi = midi;

  const delay = ctx.createDelay();
  delay.delayTime.value = 0.18;
  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.12;
  delay.connect(wetGain);
  wetGain.connect(ctx.destination);

  midi.forEach((note, voiceIdx) => {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const t0 = ctx.currentTime + voiceIdx * 0.015;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq + (Math.random() * 1.5 - 0.75);

    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    const mg1 = 0.6 / midi.length;
    const mg2 = 0.35 / midi.length;

    g1.gain.setValueAtTime(0, t0);
    g1.gain.linearRampToValueAtTime(mg1, t0 + 0.02);
    g1.gain.linearRampToValueAtTime(mg1 * 0.6, t0 + 0.12);
    g1.gain.linearRampToValueAtTime(mg1 * 0.5, t0 + duration * 0.5);
    g1.gain.linearRampToValueAtTime(0, t0 + duration);

    g2.gain.setValueAtTime(0, t0);
    g2.gain.linearRampToValueAtTime(mg2, t0 + 0.02);
    g2.gain.linearRampToValueAtTime(mg2 * 0.6, t0 + 0.12);
    g2.gain.linearRampToValueAtTime(mg2 * 0.5, t0 + duration * 0.5);
    g2.gain.linearRampToValueAtTime(0, t0 + duration);

    osc1.connect(g1); g1.connect(ctx.destination); g1.connect(delay);
    osc2.connect(g2); g2.connect(ctx.destination); g2.connect(delay);

    osc1.start(t0); osc2.start(t0);
    osc1.stop(t0 + duration + 0.05);
    osc2.stop(t0 + duration + 0.05);
  });
}

export async function playProgWithVL(
  chords: string[], 
  bpm: number, 
  onStep: (idx: number) => void, 
  beatsPerChord: number = 2
) {
  _playStop = false;
  const dur = (60 / bpm) * beatsPerChord;
  for (let i = 0; i < chords.length; i++) {
    if (_playStop) break;
    onStep(i);
    playOne(chords[i], dur);
    await new Promise(r => setTimeout(r, dur * 1000));
  }
}

export function stopPlay() { _playStop = true; }
export function resetVoicing() { _lastMidi = null; }

// MIDI Export Utilities
function vlq(value: number): number[] {
  if (value < 0) value = 0;
  if (value < 128) return [value];
  const bytes: number[] = [];
  bytes.push(value & 0x7F);
  value >>= 7;
  while (value > 0) {
    bytes.push((value & 0x7F) | 0x80);
    value >>= 7;
  }
  return bytes.reverse();
}

export function exportMidi(chords: string[], bpm: number, beatsPerChord: number) {
  if (typeof window === 'undefined') return;
  const ticksPerBeat = 480;
  const chordTicks = ticksPerBeat * beatsPerChord;
  let lastM: number[] | null = null;
  const voicedChords = chords.map(c => {
    let midi = chordToMidi(c);
    if (lastM) midi = voiceLead(lastM, midi);
    lastM = midi;
    return midi;
  });
  
  const trackData: number[] = [];
  const microsPerBeat = Math.round(60000000 / bpm);
  trackData.push(0x00);
  trackData.push(0xFF, 0x51, 0x03);
  trackData.push((microsPerBeat >> 16) & 0xFF, (microsPerBeat >> 8) & 0xFF, microsPerBeat & 0xFF);
  
  voicedChords.forEach((notes, ci) => {
    notes.forEach((note, ni) => {
      const delta = (ci === 0 && ni === 0) ? 0 : (ni === 0 ? 10 : 0);
      trackData.push(...vlq(delta));
      trackData.push(0x90, note & 0x7F, 100);
    });
    notes.forEach((note, ni) => {
      const delta = ni === 0 ? (chordTicks - 10) : 0;
      trackData.push(...vlq(delta));
      trackData.push(0x80, note & 0x7F, 0);
    });
  });
  
  trackData.push(0x00, 0xFF, 0x2F, 0x00);
  
  const header = [
    0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
    0x00, 0x00, 0x00, 0x01,
    (ticksPerBeat >> 8) & 0xFF, ticksPerBeat & 0xFF
  ];
  const trackHeader = [
    0x4D, 0x54, 0x72, 0x6B,
    (trackData.length >> 24) & 0xFF, (trackData.length >> 16) & 0xFF,
    (trackData.length >> 8) & 0xFF, trackData.length & 0xFF
  ];
  
  const bytes = new Uint8Array(header.concat(trackHeader, trackData));
  const blob = new Blob([bytes], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'progression.mid';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
