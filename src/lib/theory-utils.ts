import { 
  ROOT_MAP, NOTE_NAMES, DIATONIC_IN_KEY, RING_R, ChordType, 
  CLUSTER_DATA, NODES, EDGES, EDGE_TYPES 
} from './theory-data';

export function parseChordRoot(label: string): string {
  if (!label || label.length === 0) return "C";
  if (label.length >= 2 && (label[1] === '#' || label[1] === 'b')) return label.slice(0, 2);
  return label[0];
}

export function parseChordQuality(label: string): 'major' | 'minor' | 'dim' | 'aug' {
  const root = parseChordRoot(label);
  const rest = label.slice(root.length);
  if (rest.includes('°') || rest.includes('dim')) return 'dim';
  if (rest.includes('aug') || (rest.length > 0 && rest[0] === '+')) return 'aug';
  if (rest.startsWith('m') && !rest.startsWith('maj')) return 'minor';
  return 'major';
}

export function detectKey(chords: string[]): string {
  if (!chords || chords.length === 0) return "C";
  // V7 → major resolution
  for (let i = 0; i < chords.length - 1; i++) {
    if (chords[i].includes('7') && parseChordQuality(chords[i+1]) === 'major') {
      return parseChordRoot(chords[i + 1]);
    }
  }
  const firstRoot = parseChordRoot(chords[0]);
  const lastRoot = parseChordRoot(chords[chords.length - 1]);
  const firstST = ROOT_MAP[firstRoot];
  const lastST = ROOT_MAP[lastRoot];
  
  if (firstRoot === lastRoot) return firstRoot;
  if (firstST !== undefined && lastST !== undefined) {
    if ((lastST + 5) % 12 === firstST && parseChordQuality(chords[0]) === 'major') return firstRoot;
  }
  if (parseChordQuality(chords[0]) === 'major') return firstRoot;
  if (parseChordQuality(chords[chords.length-1]) === 'major') return lastRoot;
  return firstRoot;
}

export function getRoman(chord: string, key: string): string {
  const d = DIATONIC_IN_KEY[key];
  return d ? (d[chord] || '?') : '?';
}

export function getHarmonicFunction(roman: string): string {
  if (/^I$|^i$|^III$|^iii$/.test(roman)) return 'Tonic';
  if (/^IV|^iv|^ii|^II/.test(roman)) return 'Subdominant';
  if (/^V|^v$|^VII|^vii/.test(roman)) return 'Dominant';
  if (/^vi|^VI/.test(roman)) return 'Tonic';
  return 'Other';
}

export const FEEL_MAP: Record<string, string> = { 
  Tonic: 'Home, stable resolution', 
  Subdominant: 'Gentle departure', 
  Dominant: 'Tension seeking resolution', 
  Other: 'Passing color' 
};

export function chordToMidi(label: string): number[] {
  if (!label || label.length === 0) return [60, 64, 67];
  const root = parseChordRoot(label);
  let rest = label.slice(root.length);
  
  // Strip slash (inversions)
  const slashIdx = rest.indexOf('/');
  if (slashIdx >= 0) rest = rest.slice(0, slashIdx);

  const rootST = ROOT_MAP[root];
  if (rootST === undefined) return [60, 64, 67];

  let intervals: number[];
  if (rest.includes('°') || rest.includes('dim')) {
    intervals = [0, 3, 6];
  } else if (rest.includes('aug') || (rest.length > 0 && rest[0] === '+')) {
    intervals = [0, 4, 8];
  } else if (rest.startsWith('m') && !rest.startsWith('maj')) {
    intervals = [0, 3, 7];
  } else {
    intervals = [0, 4, 7];
  }
  
  if (rest.includes('m7b5') || rest.includes('ø')) {
    intervals = [0, 3, 6];
  }
  if (rest.includes('b5') && !rest.includes('m7b5')) {
    intervals = intervals.map(i => i === 7 ? 6 : (i === 8 ? 6 : i));
  }
  if (rest.includes('#5') && !rest.includes('aug')) {
    intervals = intervals.map(i => i === 7 ? 8 : i);
  }

  if (rest.includes('maj7') || rest.includes('maj9') || rest.includes('maj11') || rest.includes('maj13')) {
    intervals.push(11);
  } else if (rest.includes('7') || rest.includes('9') || rest.includes('11') || rest.includes('13')) {
    if (rest.includes('°') || rest.includes('dim')) {
      intervals.push(9);
    } else {
      intervals.push(10);
    }
  }

  if (/9/.test(rest) && !/b9/.test(rest) && !/#9/.test(rest)) {
    if (!intervals.includes(10) && !intervals.includes(11)) intervals.push(10);
    intervals.push(14);
  }
  if (/11/.test(rest) && !/#11/.test(rest)) {
    if (!intervals.includes(10) && !intervals.includes(11)) intervals.push(10);
    intervals.push(17);
  }
  if (/13/.test(rest) && !/b13/.test(rest)) {
    if (!intervals.includes(10) && !intervals.includes(11)) intervals.push(10);
    intervals.push(21);
  }
  
  if (rest.includes('b9')) intervals.push(13);
  if (rest.includes('#9')) intervals.push(15);
  if (rest.includes('#11')) intervals.push(18);
  if (rest.includes('b13')) intervals.push(20);

  const base = 60 + rootST;
  return [...new Set(intervals)].sort((a, b) => a - b).map(i => base + i);
}

export function voiceLead(prev: number[] | null, next: number[]): number[] {
  if (!prev || prev.length === 0) return next;
  return next.map(n => {
    const options = [n - 12, n, n + 12];
    let best = n;
    let bestDist = Infinity;
    options.forEach(opt => {
      prev.forEach(p => {
        const d = Math.abs(opt - p);
        if (d < bestDist) { bestDist = d; best = opt; }
      });
    });
    return best;
  }).sort((a, b) => a - b);
}

export function tensionScore(label: string): number {
  let s = 0;
  if (/7/.test(label)) s += 2;
  if (/9|11|13/.test(label)) s += 2;
  if (/°|dim/.test(label)) s += 4;
  if (/aug|\+/.test(label)) s += 3;
  if (/b9|#9|b5|#5/.test(label)) s += 3;
  if (/alt/i.test(label)) s += 4;
  return Math.min(s, 10);
}

export function midiNoteName(midi: number): string {
  return NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}

export interface VoiceLeadingData {
  label: string;
  voiced: number[];
  movements: number[];
  smooth: boolean;
  maxMove: number;
}

export function analyzeVoiceLeading(chords: string[]): VoiceLeadingData[] {
  if (!chords || chords.length === 0) return [];
  const result: VoiceLeadingData[] = [];
  let prev: number[] | null = null;
  chords.forEach((label) => {
    let midi = chordToMidi(label);
    if (prev) midi = voiceLead(prev, midi);
    const movements: number[] = [];
    if (prev) {
      const len = Math.min(midi.length, prev.length);
      for (let i = 0; i < len; i++) {
        movements.push(Math.abs(midi[i] - prev[i]));
      }
    }
    const smooth = movements.length > 0 && movements.every(m => m <= 2);
    const maxMove = movements.length > 0 ? Math.max(...movements) : 0;
    result.push({ 
      label: label, 
      voiced: [...midi], 
      movements: movements, 
      smooth: smooth, 
      maxMove: maxMove 
    });
    prev = midi;
  });
  return result;
}

export function radialPos(cluster: number, type: ChordType, size: number) {
  const r = size * RING_R[type];
  const a = (cluster * 30 - 90) * Math.PI / 180;
  return { x: size / 2 + r * Math.cos(a), y: size / 2 + r * Math.sin(a) };
}

export function graphPos(cluster: number, type: ChordType, size: number) {
  const cW = size * 0.22, cH = size * 0.30;
  const startX = size * 0.10, startY = size * 0.07;
  const col = cluster % 4, row = Math.floor(cluster / 4);
  const cx = startX + col * cW + cW / 2;
  const cy = startY + row * cH + cH / 2;
  const offsets = {
    major: { dx: 0, dy: -cH * 0.28 },
    minor: { dx: -cW * 0.30, dy: cH * 0.16 },
    dom7:  { dx: cW * 0.30, dy: cH * 0.16 },
    dim:   { dx: 0, dy: cH * 0.40 },
  };
  const off = offsets[type];
  return { x: cx + off.dx, y: cy + off.dy };
}

export function chordAnalysis(chord: string, key: string) {
  const root = parseChordRoot(chord);
  const quality = parseChordQuality(chord);
  const rootST = ROOT_MAP[root] || 0;
  const roman = getRoman(chord, key);
  const func = getHarmonicFunction(roman);

  let extensions: string[] = [];
  if (quality === 'major') extensions = [root+'maj7', root+'maj9', root+'6'];
  else if (quality === 'minor') extensions = [root+'m7', root+'m9', root+'m11'];
  else if (chord.includes('7')) extensions = [root+'9', root+'13', root+'7#11'];
  else if (quality === 'dim') extensions = [root+'m7b5'];

  const tensions = func === 'Dominant' ? ['b9','#9','#11','b13'] : (quality === 'minor' ? ['add9','add11'] : ['add9']);
  const inversions: string[] = [];
  if (quality === 'minor') {
    inversions.push(chord+'/'+NOTE_NAMES[(rootST+3)%12], chord+'/'+NOTE_NAMES[(rootST+7)%12]);
  } else if (quality === 'major') {
    inversions.push(chord+'/'+NOTE_NAMES[(rootST+4)%12], chord+'/'+NOTE_NAMES[(rootST+7)%12]);
  }

  const substitutions: string[] = [];
  if (quality === 'major') substitutions.push(NOTE_NAMES[(rootST+9)%12]+'m');
  if (quality === 'minor') substitutions.push(NOTE_NAMES[(rootST+3)%12]);
  if (chord.includes('7')) substitutions.push(NOTE_NAMES[(rootST+6)%12]+'7');

  const secondary_dom = NOTE_NAMES[(rootST+7)%12] + '7';
  let altered: string[] = [];
  if (chord.includes('7') || func === 'Dominant') altered = [root+'7alt', root+'7b9#9'];

  return { 
    chord: chord, roman: roman, function: func, extensions, tensions,
    inversions, substitutions, secondary_dom,
    altered, feel: FEEL_MAP[func] || 'Color tone' 
  };
}
