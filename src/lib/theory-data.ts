/* ═══════════════════════════════════════════════════════════════════
   THEORY DATA & CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

export const BG = "#080810";
export const SURFACE = "#0d0d1a";
export const CARD = "#111120";
export const BORDER = "#1c1c30";
export const TEXT = "#eeebe4";
export const MUTED = "#555570";
export const DIMCOL = "#22223a";
export const MAJOR = "#e05060";
export const MINOR = "#40b0c0";
export const DOM7 = "#c8a020";
export const DIMIN = "#9050c0";
export const ACCENT = "#f0c040";
export const EXT_C = "#40c090";
export const ALT_C = "#e06040";
export const SUB_C = "#b060e0";
export const INV_C = "#4090e0";

export type ChordType = 'major' | 'minor' | 'dom7' | 'dim';

export const TYPE_COLOR: Record<ChordType, string> = { 
  major: MAJOR, 
  minor: MINOR, 
  dom7: DOM7, 
  dim: DIMIN 
};

export const TAG_COLOR = { 
  extensions: EXT_C, 
  tensions: EXT_C, 
  inversions: INV_C, 
  substitutions: SUB_C, 
  secondary_dom: ACCENT, 
  altered: ALT_C 
};

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const ROOT_MAP: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "Fb": 4, "E#": 5,
  "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11, "Cb": 11
};

export const KEY_ORDER = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];

export interface ClusterEntry {
  key: string;
  major: string;
  minor: string;
  dom7: string;
  dim: string;
}

export const CLUSTER_DATA: ClusterEntry[] = [
  { key: "C", major: "C", minor: "Am", dom7: "G7", dim: "B°" },
  { key: "G", major: "G", minor: "Em", dom7: "D7", dim: "F#°" },
  { key: "D", major: "D", minor: "Bm", dom7: "A7", dim: "C#°" },
  { key: "A", major: "A", minor: "F#m", dom7: "E7", dim: "G#°" },
  { key: "E", major: "E", minor: "C#m", dom7: "B7", dim: "D#°" },
  { key: "B", major: "B", minor: "G#m", dom7: "F#7", dim: "A#°" },
  { key: "F#", major: "F#", minor: "D#m", dom7: "C#7", dim: "E#°" },
  { key: "Db", major: "Db", minor: "Bbm", dom7: "Ab7", dim: "C°" },
  { key: "Ab", major: "Ab", minor: "Fm", dom7: "Eb7", dim: "G°" },
  { key: "Eb", major: "Eb", minor: "Cm", dom7: "Bb7", dim: "D°" },
  { key: "Bb", major: "Bb", minor: "Gm", dom7: "F7", dim: "A°" },
  { key: "F", major: "F", minor: "Dm", dom7: "C7", dim: "E°" },
];

export interface NodeData {
  type: ChordType;
  cluster: number;
}

export const NODES: Record<string, NodeData> = {};
CLUSTER_DATA.forEach((c, i) => {
  NODES[c.major] = { type: "major", cluster: i };
  NODES[c.minor] = { type: "minor", cluster: i };
  NODES[c.dom7] = { type: "dom7", cluster: i };
  NODES[c.dim] = { type: "dim", cluster: i };
});

export interface EdgeType {
  label: string;
  color: string;
  dashed: boolean;
  weight: number;
}

export const EDGE_TYPES: Record<string, EdgeType> = {
  "v-i": { label: "V→I", color: "#c8a020", dashed: false, weight: 2.0 },
  "rel": { label: "Maj↔Min", color: "#40b0c0", dashed: false, weight: 1.8 },
  "ii-v": { label: "ii→V", color: "#f0c040", dashed: true, weight: 1.4 },
  "dom": { label: "I→Dom7", color: "#c8902044", dashed: true, weight: 1.0 },
  "v-vi": { label: "Deceptive", color: "#e0506066", dashed: true, weight: 1.2 },
  "dim-r": { label: "Dim°→I", color: "#9050c0", dashed: true, weight: 1.2 },
  "fifth": { label: "5ths", color: "#e0506044", dashed: true, weight: 0.8 },
  "cross": { label: "Cross-key", color: "#c8a02055", dashed: true, weight: 1.0 },
};

export const V_OF_VI = [
  "E7", "B7", "F#7", "C#7", null, null, null, "F7", "C7", "G7", "D7", "A7"
];

export interface Edge {
  from: string;
  to: string;
  type: string;
  bi?: boolean;
}

export const EDGES: Edge[] = [];
CLUSTER_DATA.forEach((c, i) => {
  EDGES.push({ from: c.major, to: c.minor, type: "rel", bi: true });
  EDGES.push({ from: c.minor, to: c.dom7, type: "ii-v" });
  EDGES.push({ from: c.dom7, to: c.major, type: "v-i" });
  EDGES.push({ from: c.dom7, to: c.minor, type: "v-vi" });
  EDGES.push({ from: c.major, to: c.dom7, type: "dom" });
  EDGES.push({ from: c.dim, to: c.major, type: "dim-r" });
  if (V_OF_VI[i]) {
    EDGES.push({ from: V_OF_VI[i] as string, to: c.minor, type: "v-i" });
  }
  const tri = CLUSTER_DATA[(i + 6) % 12];
  EDGES.push({ from: c.dom7, to: tri.major, type: "cross" });
  const next = CLUSTER_DATA[(i + 1) % 12];
  EDGES.push({ from: c.major, to: next.major, type: "fifth" });
});

[["E7", "D"], ["A7", "G"], ["B7", "A"], ["C#7", "B"], ["D7", "C"], ["C7", "Bb"]].forEach((pair) => {
  EDGES.push({ from: pair[0], to: pair[1], type: "cross" });
});

export const DIATONIC_IN_KEY: Record<string, Record<string, string>> = {
  C: { C: "I", Dm: "ii", Em: "iii", F: "IV", G: "V", Am: "vi", "G7": "V7", "D7": "V/V", "A7": "V/ii", "E7": "V/vi" },
  G: { G: "I", Am: "ii", Bm: "iii", C: "IV", D: "V", Em: "vi", "D7": "V7", "A7": "V/V", "B7": "V/vi", "E7": "V/ii" },
  D: { D: "I", Em: "ii", "F#m": "iii", G: "IV", A: "V", Bm: "vi", "A7": "V7", "E7": "V/V", "F#7": "V/vi", "B7": "V/ii" },
  F: { F: "I", Gm: "ii", Am: "iii", Bb: "IV", C: "V", Dm: "vi", "C7": "V7", "G7": "V/V", "D7": "V/ii", "A7": "V/vi" },
  Bb: { Bb: "I", Cm: "ii", Dm: "iii", Eb: "IV", F: "V", Gm: "vi", "F7": "V7", "C7": "V/V", "G7": "V/ii", "D7": "V/vi" },
  Am: { Am: "i", "B°": "ii°", C: "III", Dm: "iv", Em: "v", F: "VI", G: "VII", "E7": "V7", "A7": "V/iv" },
};

export const RING_R: Record<ChordType, number> = { 
  major: 0.42, 
  minor: 0.31, 
  dom7: 0.21, 
  dim: 0.12 
};

export const PIVOT_MAP: Record<string, string[]> = {
  "C-G": ["Em", "G"], "G-C": ["Em", "C"], "G-D": ["Bm", "D"], "D-G": ["Bm", "G"],
  "D-A": ["F#m", "A"], "A-D": ["F#m", "D"], "A-E": ["C#m", "E"], "E-A": ["C#m", "A"],
  "E-B": ["G#m", "B"], "B-E": ["G#m", "E"], "B-F#": ["D#m", "F#"], "F#-B": ["D#m", "B"],
  "F#-Db": ["Bbm"], "Db-F#": ["Bbm"],
  "Db-Ab": ["Fm", "Ab"], "Ab-Db": ["Fm", "Db"], "Ab-Eb": ["Cm", "Eb"], "Eb-Ab": ["Cm", "Ab"],
  "Eb-Bb": ["Gm", "Bb"], "Bb-Eb": ["Gm", "Eb"], "Bb-F": ["Dm", "F"], "F-Bb": ["Dm", "Bb"],
  "F-C": ["Am", "C"], "C-F": ["Am", "F"],
};

export const GENRE_PRESETS = [
  { name: "🎬 Bollywood", presets: [
    { name: "Sad Minor", chords: ["Am", "G", "F", "E"], key: "Am" },
    { name: "Filmi Romance", chords: ["C", "Am", "F", "G"], key: "C" },
    { name: "Dramatic", chords: ["Dm", "Bb", "C", "Am"], key: "Dm" },
    { name: "Dev Anand", chords: ["C", "E7", "Am", "F", "G7", "C"], key: "C" },
    { name: "Item Song", chords: ["G", "D", "Em", "C"], key: "G" },
  ]},
  { name: "🎷 Jazz", presets: [
    { name: "ii–V–I", chords: ["Dm7", "G7", "Cmaj7"], key: "C" },
    { name: "Rhythm Changes", chords: ["C", "Am", "Dm", "G7"], key: "C" },
    { name: "Coltrane Cycle", chords: ["C", "E7", "Ab7", "F"], key: "C" },
    { name: "Autumn Leaves", chords: ["Cm7", "F7", "Bbmaj7", "Ebmaj7"], key: "Bb" },
    { name: "Deceptive", chords: ["G7", "Em", "Am", "Dm", "G7", "C"], key: "C" },
  ]},
  { name: "🎬 Film", presets: [
    { name: "Epic Arrival", chords: ["C", "Bb", "F", "C"], key: "C" },
    { name: "Bittersweet", chords: ["C", "Am", "F", "Ab"], key: "C" },
    { name: "Triumph", chords: ["F", "C", "G", "Am"], key: "C" },
    { name: "Dream Float", chords: ["Cmaj7", "Bm7", "E7", "Am7"], key: "C" },
    { name: "Tension", chords: ["Am", "E", "Am", "Dm", "E"], key: "Am" },
  ]},
  { name: "🎸 Pop/Rock", presets: [
    { name: "Axis of Awesome", chords: ["C", "G", "Am", "F"], key: "C" },
    { name: "50s", chords: ["C", "Am", "F", "G"], key: "C" },
    { name: "Pachelbel", chords: ["D", "A", "Bm", "F#", "G", "D", "G", "A"], key: "D" },
    { name: "Minor Anthem", chords: ["Am", "F", "C", "G"], key: "Am" },
    { name: "Andalusian", chords: ["Am", "G", "F", "E"], key: "Am" },
  ]},
  { name: "💃 Flamenco/World", presets: [
    { name: "Phrygian", chords: ["Am", "G", "F", "E"], key: "Am" },
    { name: "Hijaz", chords: ["Am", "Bb", "E", "Am"], key: "Am" },
    { name: "Bossa Nova", chords: ["Cmaj7", "A7", "Dm7", "G7"], key: "C" },
    { name: "Tango", chords: ["Am", "E7", "Dm", "E7", "Am"], key: "Am" },
    { name: "Rumba", chords: ["Am", "F", "E", "Am"], key: "Am" },
  ]},
];
