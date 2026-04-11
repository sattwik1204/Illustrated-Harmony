import { 
  parseChordRoot, parseChordQuality, detectKey, chordAnalysis 
} from './theory-utils';
import { ROOT_MAP, NOTE_NAMES } from './theory-data';

export interface ReharmStrategy {
  name: string;
  style: string;
  chords: string[];
  technique: string;
  feel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ReharmResult {
  key: string;
  original: string[];
  analysis: any[];
  reharmonizations: ReharmStrategy[];
}

export function applyJazzExtensions(chords: string[]): ReharmStrategy {
  const newChords = chords.map(chord => {
    const root = parseChordRoot(chord);
    const quality = parseChordQuality(chord);
    if (quality === 'major') return chord.includes('7') ? root + 'maj9' : root + 'maj7';
    if (quality === 'minor') return chord.includes('7') ? root + 'm9' : root + 'm7';
    if (chord.includes('7')) return root + '9';
    if (quality === 'dim') return root + 'm7b5';
    return chord;
  });
  return {
    name: "Jazz Extensions",
    style: "Jazz",
    chords: newChords,
    technique: "Add 7ths and upper extensions to every chord",
    feel: "Rich, warm harmony",
    difficulty: "Intermediate"
  };
}

export function applyTritoneSubs(chords: string[]): ReharmStrategy {
  const newChords = chords.map(chord => {
    const root = parseChordRoot(chord);
    const quality = parseChordQuality(chord);
    const rootST = ROOT_MAP[root] || 0;
    if (chord.includes('7') && quality !== 'dim') {
      return NOTE_NAMES[(rootST + 6) % 12] + '7';
    }
    if (quality === 'major') return root + 'maj7';
    if (quality === 'minor') return root + 'm7';
    return chord;
  });
  return {
    name: "Tritone Substitutions",
    style: "Bebop",
    chords: newChords,
    technique: "Replace dominant chords with tritone substitutes",
    feel: "Chromatic, surprising movement",
    difficulty: "Advanced"
  };
}

export function applyModalInterchange(chords: string[], key: string): ReharmStrategy {
  const keyST = ROOT_MAP[key] || 0;
  const newChords = chords.map((chord, i) => {
    const root = parseChordRoot(chord);
    const quality = parseChordQuality(chord);
    const rootST = ROOT_MAP[root];
    if (rootST === undefined) return chord;
    const interval = ((rootST - keyST) + 12) % 12;
    if (interval === 5 && quality === 'major') return root + 'm7';
    if (interval === 5 && quality === 'minor') return root;
    if (interval === 0 && quality === 'major' && i > 0 && i < chords.length - 1) return root + 'm';
    if (interval === 7 && quality === 'major') return NOTE_NAMES[(keyST + 10) % 12];
    if (quality === 'major' && !chord.includes('7')) return root + 'maj7';
    if (quality === 'minor' && !chord.includes('7')) return root + 'm7';
    return chord;
  });
  return {
    name: "Modal Interchange",
    style: "Neo-Soul",
    chords: newChords,
    technique: "Borrow chords from parallel minor/major",
    feel: "Bittersweet color shifts",
    difficulty: "Intermediate"
  };
}

export function applySecondaryDominants(chords: string[]): ReharmStrategy {
  const newChords = chords.map((chord, i) => {
    if (i === 0 || i === chords.length - 1) return chord;
    const nextRoot = parseChordRoot(chords[i + 1]);
    const nextST = ROOT_MAP[nextRoot];
    if (nextST === undefined) return chord;
    const secDomRoot = NOTE_NAMES[(nextST + 7) % 12];
    if (!chord.includes('7')) return secDomRoot + '7';
    return chord;
  });
  return {
    name: "Secondary Dominants",
    style: "Classical",
    chords: newChords,
    technique: "Add V7/x before target chords",
    feel: "Strong directional pull",
    difficulty: "Beginner"
  };
}

export function localReharmonize(inputChords: string[], keyInput: string | null): ReharmResult {
  const key = keyInput || detectKey(inputChords);
  const analysis = inputChords.map(c => chordAnalysis(c, key));
  const reharmonizations = [
    applyJazzExtensions(inputChords),
    applyTritoneSubs(inputChords),
    applyModalInterchange(inputChords, key),
    applySecondaryDominants(inputChords),
  ];
  return { key, original: inputChords, analysis, reharmonizations };
}
