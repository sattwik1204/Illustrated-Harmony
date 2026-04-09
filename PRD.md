# Product Requirements Document
## Illustrated Harmony — AI Composition Engine
**Version 2.0 | April 2026**

---

## 1. PRODUCT OVERVIEW

### 1.1 What It Is
A visual, interactive music theory and composition tool that combines a harmonic relationship map, an AI-powered reharmonization engine, and a tap-to-build progression composer. Built for intermediate-to-advanced musicians who want to understand, explore, and compose harmony without reading sheet music.

### 1.2 Core Philosophy
- **Visual first.** Every concept is shown, not described.
- **Sound first.** Every tap plays something. No silent interactions.
- **No sheet music.** Only chord symbols, diagrams, and color.
- **Composition-ready.** Everything you learn is immediately usable for writing music.

### 1.3 Target User
- Intermediate musician (knows major/minor/dom7 chords, can follow chord symbols)
- Any instrument, but optimized for piano, guitar, DAW users
- Goal: personal learning tool and composition reference
- Context: India-based, interest in Bollywood, film, jazz, and world music

---

## 2. TECH STACK

| Layer | Choice | Reason |
|---|---|---|
| Framework | React (JSX, hooks) | Component model fits the multi-panel architecture |
| Styling | Inline styles only | No build step, self-contained artifact |
| Audio | Web Audio API (native) | No external dependency, precise timing control |
| Reharmonization | Local algorithmic engine | Rule-based music theory transforms, no network needed |
| Persistence | `window.storage` (Anthropic artifact API) | Save/load progressions across sessions |
| Export | Blob + URL.createObjectURL | MIDI file download, no server needed |
| Fonts | Georgia (serif), monospace | Musicality + readability |

---

## 3. COLOR SYSTEM

All colors are module-level constants. Never use inline hex strings directly in JSX — always reference these constants.

```js
const BG      = "#080810";  // page background
const SURFACE = "#0d0d1a";  // panels, headers
const CARD    = "#111120";  // cards, inputs
const BORDER  = "#1c1c30";  // all borders
const TEXT    = "#eeebe4";  // primary text
const MUTED   = "#555570";  // secondary text, disabled
const DIMCOL  = "#22223a";  // inactive backgrounds
const MAJOR   = "#e05060";  // major keys (warm red)
const MINOR   = "#40b0c0";  // relative minors (cool teal)
const DOM7    = "#c8a020";  // dominant 7th chords (gold)
const DIMIN   = "#9050c0";  // diminished chords (purple)
const ACCENT  = "#f0c040";  // highlights, active states (yellow)
const EXT_C   = "#40c090";  // extensions/tensions (green)
const ALT_C   = "#e06040";  // altered chords (orange-red)
const SUB_C   = "#b060e0";  // substitutions (violet)
const INV_C   = "#4090e0";  // inversions (blue)
```

---

## 4. AUDIO ENGINE

### 4.1 Architecture
- **Single shared `AudioContext`** — created once, reused. Never create/destroy per chord.
- **Voice leading** — every chord played after the first uses the closest voicing to the previous chord, minimizing interval movement. This is what makes the audio sound musical.
- **ADSR envelope** — attack 20ms, decay to 60% at 100ms, sustain fade to 50% at half-duration, release to silence at full duration.
- **Timbre** — stack sine + triangle oscillator per note. Sine at 60% gain, triangle at 35%. Slight detuning per voice for width.
- **Note stagger** — each voice in the chord starts 15ms after the previous (simulates natural piano roll).
- **Delay send** — 180ms delay at 12% wet for subtle room.

### 4.2 MIDI Note Parsing (`chordToMidi`)
Parse any chord label string → array of MIDI note numbers placed around octave 4.

Rules:
- Extract root (2-char first, fallback to 1-char)
- Detect quality: major (default), minor (starts with "m" not "maj"), diminished (contains "°" or "dim"), augmented (contains "aug" or "+")
- Intervals in semitones: major=[0,4,7], minor=[0,3,7], dim=[0,3,6], aug=[0,4,8]
- Add 7th: maj7=11, dom7/min7=10, dim7=9
- Add extensions: 9→+14, 11→+17, 13→+21 (include flat-7 if not already present)
- Base = 60 + semitone offset of root

### 4.3 Voice Leading (`voiceLead(prev, next)`)
For each note in `next`:
- Try octave placements: n-12, n, n+12
- Pick the placement closest (min absolute semitone distance) to any note in `prev`
- Return result sorted ascending

### 4.4 Key Functions
```js
playOne(label, duration=1.4)         // play single chord, maintains voice leading state
playProgWithVL(chords, bpm, onStep, beatsPerChord)  // async, plays full progression
stopPlay()                            // sets _playStop flag
resetVoicing()                        // clears _lastMidi state
```

### 4.5 Module-Level State
```js
let _audioCtx = null;     // shared context
let _playStop = false;    // stop flag for playProgWithVL
let _lastMidi = null;     // last voiced chord for voice leading continuity
```

---

## 5. HARMONIC DATA MODEL

### 5.1 Nodes
48 total chord nodes across 4 types, 12 clusters (one per key in circle of fifths order: C, G, D, A, E, B, F#, Db, Ab, Eb, Bb, F).

```js
const NODES = {
  // type: "major" | "minor" | "dom7" | "dim"
  // cluster: 0–11 (circle of fifths position)
  "C":  { type:"major", cluster:0 },
  "Am": { type:"minor", cluster:0 },
  "G7": { type:"dom7",  cluster:0 },
  "B°": { type:"dim",   cluster:0 },
  // ... repeat for all 12 clusters
}
```

### 5.2 Ring Radii (fraction of SVG size)
```js
const RING_R = { major:0.42, minor:0.31, dom7:0.21, dim:0.12 };
```

### 5.3 Edge Types
8 directional relationship types between nodes:

| ID | Label | Color | Dashed | Weight | Meaning |
|---|---|---|---|---|---|
| `v-i` | V→I | `#c8a020` | No | 2.0 | Dominant resolution |
| `rel` | Maj↔Min | `#40b0c0` | No | 1.8 | Relative major/minor |
| `ii-v` | ii→V | `#f0c040` | Yes | 1.4 | Subdominant preparation |
| `dom` | I→Dom7 | `#c8902044` | Yes | 1.0 | Key activates its dominant |
| `v-vi` | Deceptive | `#e0506066` | Yes | 1.2 | V resolves to vi (surprise) |
| `dim-r` | Dim°→I | `#9050c0` | Yes | 1.2 | Diminished resolves up semitone |
| `fifth` | 5ths | `#e0506044` | Yes | 0.8 | Adjacent keys on circle |
| `cross` | Cross-key | `#c8a02055` | Yes | 1.0 | Tritone sub / secondary dominant |

Edge object shape: `{ from: string, to: string, type: EdgeType, bi?: true }`

`bi: true` means bidirectional — render arrowheads at both ends.

### 5.4 Complete Edge List
Per cluster (12 clusters × 8 edges each + circle of fifths + extra cross-key):
- `{from:"C", to:"Am",  type:"rel",   bi:true}`
- `{from:"Am",to:"G7",  type:"ii-v"}`
- `{from:"G7",to:"C",   type:"v-i"}`
- `{from:"G7",to:"Am",  type:"v-vi"}`
- `{from:"C", to:"G7",  type:"dom"}`
- `{from:"B°",to:"C",   type:"dim-r"}`
- `{from:"E7",to:"Am",  type:"v-i"}`   ← V of relative minor
- `{from:"G7",to:"Db",  type:"cross"}` ← tritone sub
- ... (repeat pattern for all 12 clusters)

Circle of fifths (major→major, clockwise):
- C→G, G→D, D→A, A→E, E→B, B→F#, F#→Db, Db→Ab, Ab→Eb, Eb→Bb, Bb→F, F→C

Extra cross-key secondaries:
- E7→D, A7→G, B7→A, C#7→B, D7→C, C7→Bb

### 5.5 Tension Score
`tensionScore(label)` → integer 0–10:
- +2 for "7"
- +2 for "9", "11", or "13"
- +4 for "°" or "dim"
- +3 for "aug" or "+"
- +3 for "b9", "#9", "b5", "#5"
- +4 for "alt"
- Capped at 10

### 5.6 Roman Numerals
```js
const DIATONIC_IN_KEY = {
  C:  { C:"I", Dm:"ii", Em:"iii", F:"IV", G:"V", Am:"vi", G7:"V7", D7:"V/V", A7:"V/ii", E7:"V/vi" },
  G:  { G:"I", Am:"ii", Bm:"iii", C:"IV", D:"V", Em:"vi", D7:"V7", A7:"V/V", B7:"V/vi", E7:"V/ii" },
  D:  { D:"I", Em:"ii", "F#m":"iii", G:"IV", A:"V", Bm:"vi", A7:"V7", E7:"V/V", "F#7":"V/vi", B7:"V/ii" },
  F:  { F:"I", Gm:"ii", Am:"iii", Bb:"IV", C:"V", Dm:"vi", C7:"V7", G7:"V/V", D7:"V/ii", A7:"V/vi" },
  Bb: { Bb:"I", Cm:"ii", Dm:"iii", Eb:"IV", F:"V", Gm:"vi", F7:"V7", C7:"V/V", G7:"V/ii", D7:"V/vi" },
  Am: { Am:"i", "B°":"ii°", C:"III", Dm:"iv", Em:"v", F:"VI", G:"VII", E7:"V7", A7:"V/iv" },
}
```

---

## 6. POSITIONS & LAYOUT

### 6.1 Radial Position
```js
function radialPos(cluster, type, size) {
  const r = size * RING_R[type];
  const a = (cluster * 30 - 90) * Math.PI / 180;
  return { x: size/2 + r*Math.cos(a), y: size/2 + r*Math.sin(a) };
}
```

### 6.2 Graph Position
4×3 grid layout. Each cluster occupies a cell. Within each cell, nodes offset by type:
- major: center-top `{dx:0, dy:-cH*0.28}`
- minor: center-left `{dx:-cW*0.30, dy:cH*0.16}`
- dom7: center-right `{dx:cW*0.30, dy:cH*0.16}`
- dim: bottom-center `{dx:0, dy:cH*0.40}`

Cell dimensions: `cW = size*0.22`, `cH = size*0.30`. Grid starts at `{startX: size*0.10, startY: size*0.07}`.

---

## 7. SVG MAP COMPONENT

### 7.1 Props
```ts
HarmonicMap({
  mode: "radial" | "graph",
  size: number,
  selected: string | null,         // highlighted selected node
  onSelect: (id: string) => void,
  visibleNodes: Set<string>,       // which ring types to show
  activeEdgeTypes: Set<string>,    // which arrow types to show
  activeChord: string | null,      // chord currently playing (animates glow)
  progression: string[],           // chords in builder (shows dashed outline)
  showRoman: boolean,
  contextKey: string | null,       // key for Roman numeral overlay
})
```

### 7.2 Rendering Order (bottom to top)
1. Guide rings (radial only, one per visible ring type)
2. Progression path trace lines (dashed gold lines connecting progression chords, radial only)
3. Edge arrows (curved quadratic bezier paths with arrowhead markers)
4. Node circles + labels
5. Ring labels (radial only, at -75° angle on each ring)
6. Center circle with selected/active chord label (radial only)

### 7.3 SVG Defs
Single `<defs>` block at the top of the SVG containing:
- One `<marker>` per active edge type (ID: `mk-{type}`)
- A `<filter id="glow">` for active chord animation

### 7.4 Node Visual States
| State | Fill | Stroke | StrokeWidth | Extra |
|---|---|---|---|---|
| Active (playing) | node color | node color | 2.5 | glow filter ring + pulse ring |
| Selected | node color | node color | 2.5 | — |
| Reachable from selected | node color + 55 alpha | node color | 2 | — |
| Source of selected | `#ffffff15` | node color | 2 | — |
| In progression | CARD | ACCENT | 1.5 | dashed outline ring |
| Default | CARD | node color | 1 | — |

### 7.5 Edge Rendering
For each edge: compute start/end points inset by `nodeR+1` and `nodeR+5` respectively. Curve midpoint = linear midpoint offset perpendicular by 14px. Use `markerEnd` (and `markerStart` if `bi:true`) referencing `#mk-{type}`.

Opacity: if something is selected, edges touching selected node = 0.92, all others = 0.08. If nothing selected = 0.60.

---

## 8. PAGES & NAVIGATION

Four pages in a top navigation bar:

| ID | Label | Emoji | Description |
|---|---|---|---|
| `build` | Build | 🎹 | Interactive composition mode — map + builder |
| `radial` | Radial Map | ⭕ | Exploration map, no builder |
| `graph` | Graph Map | 🔗 | Graph layout, exploration only |
| `reharm` | Reharmonize | 🎵 | AI reharmonization engine |

Nav bar also shows a live tension meter for the current progression (right side) when progression length > 0.

---

## 9. BUILD PAGE

The primary composition interface. Three regions:

### 9.1 Controls Bar (top)
Two rows:
1. **Ring toggles** — 4 buttons (Major / Minor / Dom7 / Dim°), each with color dot. Major is locked ON (can never be deselected). Toggle shows/hides that ring on the map AND hides its nodes from the SVG.
2. **Arrow toggles** — 8 buttons, one per edge type. Each shows a small arrow preview icon. Toggle shows/hides that arrow type on the map.
3. **Roman numeral toggle** (top-right) — ON/OFF button + key selector dropdown (`C, G, D, F, Bb, Am`). When ON, each map node shows its Roman numeral in the selected key below the chord label.

### 9.2 Map + Info Panel (middle, flex row)
- **Left (flex:1)**: `HarmonicMap` in radial mode. `onSelect` = `handleBuildSelect` which plays the chord AND adds it to the progression.
- **Right (width:185px)**: `InfoPanel` — shows selected chord's tension meter, outgoing paths grouped by arrow type, incoming paths. Every chord label in InfoPanel is tappable (plays audio). "+ add" button adds selected chord to progression without re-selecting.

### 9.3 Builder Strip (bottom)
`ProgressionBuilder` component with:
- Transport bar: BPM slider (40–200), beats-per-chord (1/2/4 buttons), loop toggle (↺), Play/Stop button, MIDI export (⬇), Clear (✕)
- Chord slots: each chord shows label, mini tension bar, reorder buttons (‹ ›), duplicate (⊕), remove (✕)
- Tension meter bar below chord slots
- Voice leading display below tension meter

**Critical**: `ProgressionBuilder` accepts `onActiveIdxChange` prop. It calls this with the current playing chord index on every step, and with -1 when playback ends. The parent App lifts this state to update `activeChordIdx`, which feeds `activeChord` to the map for animation.

---

## 10. RADIAL / GRAPH MAP PAGES

Same Controls bar as Build page. Map fills available space. InfoPanel on right. `onSelect` = `handleMapSelect` which plays AND toggles selection (no add to progression). Progression chords still show dashed outline on map (user can see where their progression sits harmonically).

---

## 11. REHARMONIZE PAGE

### 11.1 Input Bar
- Progression text input (chord symbols space-separated)
- Key input (single key name, optional)
- Analyze button (runs local reharmonization engine)
- Play button (plays current input without analyzing)
- Save button (💾) — saves to persistent storage
- MIDI export button (⬇)

### 11.2 Sub-tabs
Six tabs below the input bar:

| Tab | Content |
|---|---|
| 🎵 Reharm | 4 reharmonization cards |
| 🔬 Analysis | Per-chord analysis cards (expandable) |
| 〰 VoiceLead | Voice leading display for original progression |
| 💾 Saved | Saved progression list |
| 🎸 Presets | Genre preset browser |
| 🔀 Mod Path | Modulation path finder |

### 11.3 Local Reharmonization Engine

A deterministic, rule-based engine that generates 4 reharmonization variants from any input progression. No network calls required.

#### Algorithm
For each input chord, the engine applies music theory transforms:

1. **Detect chord quality** — parse root, quality (major/minor/dom7/dim/aug), extensions
2. **Determine key context** — use provided key or infer from chord functions
3. **Assign Roman numerals** — map each chord to its diatonic function
4. **Assign harmonic function** — Tonic, Subdominant, Dominant, etc.
5. **Generate per-chord options**:
   - **Extensions**: add 7ths, 9ths, 11ths, 13ths based on chord quality
   - **Tensions**: available tensions (b9, #9, #11, b13) based on function
   - **Inversions**: first and second inversion (root/3rd, root/5th)
   - **Substitutions**: tritone sub for dominants, relative major/minor swap, median substitution
   - **Secondary dominant**: V7/x for each chord's resolution target
   - **Altered**: altered dominant voicings where applicable

#### 4 Reharmonization Strategies

```js
const STRATEGIES = [
  {
    name: "Jazz Extensions",
    style: "Jazz",
    difficulty: "Intermediate",
    technique: "Add 7ths and upper extensions to every chord",
    feel: "Rich, warm harmony",
    // Rule: major→maj7/maj9, minor→m7/m9, dom→9/13, dim→m7b5
  },
  {
    name: "Tritone Substitutions",
    style: "Bebop",
    difficulty: "Advanced",
    technique: "Replace dominant chords with tritone substitutes",
    feel: "Chromatic, surprising movement",
    // Rule: dom7→bII7, add approach chords
  },
  {
    name: "Modal Interchange",
    style: "Neo-Soul",
    difficulty: "Intermediate",
    technique: "Borrow chords from parallel minor/major",
    feel: "Bittersweet color shifts",
    // Rule: swap diatonic chords with parallel mode equivalents
  },
  {
    name: "Secondary Dominants",
    style: "Classical",
    difficulty: "Beginner",
    technique: "Add V7/x before target chords",
    feel: "Strong directional pull",
    // Rule: insert or replace with V7 of following chord
  }
];
```

#### Transform Rules (per strategy)

**Jazz Extensions**:
- Major triads → maj7 or maj9
- Minor triads → m7 or m9
- Dominant 7 → 9, 13, or 7#11
- Diminished → m7b5

**Tritone Substitutions**:
- Any dom7 chord → replace with dom7 a tritone away (e.g., G7 → Db7)
- Non-dominant chords → add 7th extension

**Modal Interchange**:
- In major key: IV → iv, I → i, V → v, bVII borrowed from mixolydian
- In minor key: iv → IV, bIII → III, bVII → VII
- Preserve chord count, swap where musically valid

**Secondary Dominants**:
- For each chord (except the first), compute V7 of that chord
- Replace the preceding chord with the secondary dominant if it creates smooth voice leading
- If progression is short, insert secondary dominants before resolution targets

#### Output Structure (same as before, generated locally)
```json
{
  "key": "C",
  "original": ["Dm","G7","C","Am"],
  "analysis": [{
    "chord": "Dm", "roman": "ii", "function": "Subdominant",
    "extensions": ["Dm7","Dm9","Dm11"],
    "tensions": ["add9"],
    "inversions": ["Dm/F","Dm/A"],
    "substitutions": ["Fmaj7","Bb"],
    "secondary_dom": "A7",
    "altered": [],
    "feel": "Gentle departure"
  }],
  "reharmonizations": [{
    "name": "Jazz Extensions",
    "style": "Jazz",
    "chords": ["Dm9","G13","Cmaj9","Am7"],
    "technique": "Add 7ths and upper extensions to every chord",
    "feel": "Rich, warm harmony",
    "difficulty": "Intermediate"
  }]
}
```

#### Key Detection (when key not provided)
- Check if the first or last chord is a major triad → likely key
- Check for V→I cadence at end → confirms key
- Fallback: use the root of the first chord as key

### 11.4 Reharmonization Card
- Name, style label, difficulty badge (color-coded: Beginner=green, Intermediate=yellow, Advanced=red)
- Chord pills (each tappable to play)
- ▶▶ Play button, ⬇ MIDI button, → Builder button (loads chords into Build page)
- Technique description
- Feel quote
- Voice leading display for that reharmonization's chords

### 11.5 Chord Analysis Card
Expandable. Shows chord name, roman numeral, function. On expand: tag pills grouped by category (extensions, tensions, inversions, substitutions, secondary_dom, altered). Each tag is tappable to play that chord/voicing.

Tag colors: extensions=EXT_C, tensions=EXT_C, inversions=INV_C, substitutions=SUB_C, secondary_dom=ACCENT, altered=ALT_C.

### 11.6 Genre Presets
5 genres × 5 presets each:

**🎬 Bollywood**: Sad Minor (Am G F E, Am), Filmi Romance (C Am F G, C), Dramatic (Dm Bb C Am, Dm), Dev Anand (C E7 Am F G7 C, C), Item Song (G D Em C, G)

**🎷 Jazz**: ii–V–I (Dm7 G7 Cmaj7, C), Rhythm Changes (C Am Dm G7, C), Coltrane Cycle (C E7 Ab7 F, C), Autumn Leaves (Cm7 F7 Bbmaj7 Ebmaj7, Bb), Deceptive (G7 Em Am Dm G7 C, C)

**🎬 Film**: Epic Arrival (C Bb F C, C), Bittersweet (C Am F Ab, C), Triumph (F C G Am, C), Dream Float (Cmaj7 Bm7 E7 Am7, C), Tension (Am E Am Dm E, Am)

**🎸 Pop/Rock**: Axis of Awesome (C G Am F, C), 50s (C Am F G, C), Pachelbel (D A Bm F# G D G A, D), Minor Anthem (Am F C G, Am), Andalusian (Am G F E, Am)

**💃 Flamenco/World**: Phrygian (Am G F E, Am), Hijaz (Am Bb E Am, Am), Bossa Nova (Cmaj7 A7 Dm7 G7, C), Tango (Am E7 Dm E7 Am, Am), Rumba (Am F E Am, Am)

Each preset has: ▶ play, → Build (load to builder), 🔄 Analyze (run through local reharmonization engine).

### 11.7 Modulation Path Finder
- FROM and TO dropdowns (major keys only: C G D A E B F# Db Ab Eb Bb F)
- BFS shortest path via circle of fifths
- ▶ Play button plays the path as a chord sequence
- Pivot chord options for each step, with music theory explanation

Pivot map (bidirectional lookup):
- C↔G: Em (iii/C=vi/G), G (V/C=I/G)
- G↔D: Bm, D — D↔A: F#m, A — A↔E: C#m, E
- E↔B: G#m, B — B↔F#: D#m, F#
- Db↔Ab: Fm, Ab — Ab↔Eb: Cm, Eb — Eb↔Bb: Gm, Bb
- Bb↔F: Dm, F — F↔C: Am, C
- F#↔Db: Bbm (enharmonic relative)

### 11.8 Saved Progressions
Stored as JSON in `window.storage` under key `"rh-saved"`. Max 20 entries. Each entry: `{ prog: string, key: string, savedAt: string }`. Deduplication on prog string. Operations: load (sends to builder), play, delete.

---

## 12. PROGRESSION BUILDER COMPONENT

### 12.1 Props
```ts
{
  progression: string[],
  onProgChange: (chords: string[]) => void,
  bpm: number,
  onBpmChange: (bpm: number) => void,
  beatsPerChord: number,
  onBeatsChange: (beats: number) => void,
  onActiveIdxChange: (idx: number) => void,  // -1 when stopped
}
```

### 12.2 Transport
- BPM: range slider 40–200, accent color, shows current value
- Beats per chord: 3 buttons (1, 2, 4)
- Loop toggle (↺): toggles `isLooping` state; checked by `loopRef.current` during playback
- Play: calls `playProgWithVL` with `setActive` as `onStep`; wrapped in `playingRef` guard to prevent double-start
- Stop: sets `loopRef.current = false`, calls `stopPlay()`
- MIDI export: calls `exportMidi(progression, bpm, beatsPerChord)`
- Clear: calls stop + `onProgChange([])` + `resetVoicing()`

### 12.3 Playback Loop (CRITICAL)
```js
const play = async () => {
  if (progression.length === 0 || playingRef.current) return;
  playingRef.current = true;
  setIsPlaying(true);
  resetVoicing();
  loopRef.current = isLooping;
  let shouldContinue = true;
  while (shouldContinue) {
    await playProgWithVL(progression, bpm, setActive, beatsPerChord);
    shouldContinue = loopRef.current && !_playStop;
  }
  setIsPlaying(false);
  setActive(-1);
  playingRef.current = false;
};
```

`setActive` sets both local `activeIdx` AND calls `onActiveIdxChange` (parent).

### 12.4 Chord Slots
Each chord renders as a small card with:
- Chord label (tappable, plays audio)
- Mini tension bar (3px, color-coded)
- Reorder: ‹ and › buttons swap with neighbor
- Duplicate: ⊕ inserts copy after
- Remove: ✕ splices from array
- Active state (while playing): colored background, glow box-shadow

### 12.5 Tension Meter
Bar chart, one bar per chord. Bar height = `(tensionScore/10) * maxHeight`. Colors: score>6=ALT_C, score>3=DOM7, else=EXT_C. Active chord bar = ACCENT.

### 12.6 Voice Leading Display
Shows `analyzeVoiceLeading(chords)` result as a horizontal scrollable table. One column per chord. Each column shows MIDI note names + semitone movement indicator. Color: movement=0 → EXT_C background, movement≤2 → ACCENT background, larger → DIMCOL background. Footer label: "smooth" or "leap".

---

## 13. VOICE LEADING ANALYSIS

```js
function analyzeVoiceLeading(chords) {
  // returns array of: { label, voiced, movements, smooth, maxMove }
  // voiced = voice-led MIDI notes
  // movements = semitone movement per voice from previous chord
  //   (only computed for min(voiced.length, prev.length) voices)
  // smooth = all movements ≤ 2 semitones
}
```

Use `useMemo` on `chords.join(",")` (not array reference) to avoid unnecessary recomputation.

MIDI note name: `NOTE_NAMES[((midi%12)+12)%12]` + octave `Math.floor(midi/12)-1`.

---

## 14. MIDI EXPORT

Type 0 MIDI file (single track), standard format:
- Header: `4d546864` + length (6) + format (0) + tracks (1) + ticks-per-beat (480)
- Track: `4d54726b` + track byte length
- Events: tempo meta event, note-on/note-off pairs for each voiced chord, end-of-track meta
- Variable-length encoding for delta times
- Chord duration: `ticksPerBeat * beatsPerChord`
- Note-off fires 10 ticks before chord end

Download via `Blob → URL.createObjectURL → <a> click → revokeObjectURL`.

---

## 15. STATE ARCHITECTURE (App level)

```js
// Page
page: "build" | "radial" | "graph" | "reharm"

// Map interaction
selected: string | null            // currently selected node
mapSize: number                    // responsive, from ResizeObserver

// Visibility toggles
visibleNodes: Set<"major"|"minor"|"dom7"|"dim">
activeEdgeTypes: Set<EdgeType>

// Composition
progression: string[]              // ordered array of chord labels
activeChordIdx: number             // -1 when not playing; lifted from ProgressionBuilder
bpm: number                        // default 80
beatsPerChord: number              // default 2

// Display
showRoman: boolean                 // Roman numeral overlay
contextKey: string                 // key for Roman numerals (default "C")
```

### 15.1 Derived State
```js
// The chord currently animating on the map
const activeChord = activeChordIdx >= 0 && activeChordIdx < progression.length
  ? progression[activeChordIdx]
  : null;

const isMap   = page === "radial" || page === "graph";
const isBuild = page === "build";
```

### 15.2 Handler Separation (CRITICAL)
```js
// Build page: always adds to progression + plays
const handleBuildSelect = (id) => {
  setSelected(id);
  playOne(id);
  setProgression(p => [...p, id]);
};

// Map pages: toggles selection + plays, does NOT add
const handleMapSelect = (id) => {
  setSelected(p => p === id ? null : id);
  playOne(id);
};
```

### 15.3 ResizeObserver
Attach to the page container `ref`. Updates `mapSize = clamp(containerWidth - 200, 240, 480)`.

---

## 16. KNOWN BUGS TO AVOID

These are bugs from previous implementation — avoid them:

1. **SVG `<defs>` per edge** — put ALL `<marker>` elements in a SINGLE `<defs>` block at SVG root, not inside individual edge `<g>` elements. One marker ID per edge type: `mk-{type}`.

2. **`DIM_C` naming** — name your dim color constant `DIMCOL` or `DIM_COL`, not `DIM_C`, to avoid any potential React confusion with component naming conventions.

3. **`INV_C` missing** — declare `INV_C = "#4090e0"` in the palette. It's used in `TAG_COLOR` for inversions.

4. **Voice leading array bounds** — in `analyzeVoiceLeading`, always use `Math.min(voiced.length, prev.length)` when computing movements. `voiced` and `prev` may have different lengths.

5. **`useMemo` dependency on array** — `VoiceLeadingDisplay` must use `chords.join(",")` as memo key, not the `chords` array itself (arrays are always new references).

6. **Playback double-start** — `ProgressionBuilder.play` must guard with `playingRef.current` to prevent multiple simultaneous loops.

7. **`activeChordIdx` not lifting** — `ProgressionBuilder` must call `onActiveIdxChange(idx)` on every step. App must pass `setActiveChordIdx` as this prop. Without this, the map never animates while playing.

8. **Loop logic** — the playback loop must check `loopRef.current` (not `_playStop`) as the continuation condition AFTER each pass. `_playStop` is a module-level flag; `loopRef.current` is the per-instance loop enable.

9. **Build page double-play** — `onSelect` in build mode already calls `playOne`. `InfoPanel` chord clicks should call `playOne` independently. Don't route InfoPanel clicks through `onSelect`.

10. **`window.storage` crash** — all `window.storage` calls must be inside `try/catch`. The storage API may not be available in all environments.

11. **Boolean SVG children** — when conditionally rendering SVG elements, always use ternary `? <element/> : null`, never `condition && <element/>`. Boolean `false` will crash SVG rendering.

12. **`playProgWithVL` parameter naming** — the async sleep uses `r` as the resolve callback: `await new Promise(r => setTimeout(r, dur*1000))`. Don't rename `r` to a React hook name.

---

## 17. COMPONENT TREE

```
App
├── Header
├── NavBar (+ TensionMeter when progression exists)
├── [Build page]
│   ├── Controls
│   ├── HarmonicMap (radial, handleBuildSelect)
│   ├── InfoPanel
│   └── ProgressionBuilder
│       ├── TransportBar
│       ├── ChordSlots
│       ├── TensionMeter
│       └── VoiceLeadingDisplay
├── [Radial/Graph pages]
│   ├── Controls
│   ├── HarmonicMap
│   └── InfoPanel
└── [Reharm page]
    └── ReharmPanel
        ├── InputBar
        ├── SubTabBar
        └── [Tab content]
            ├── ReharmCard (×4) → VoiceLeadingDisplay
            ├── ChordCard (×n, expandable)
            ├── VoiceLeadingDisplay
            ├── SavedPanel
            ├── PresetsPanel
            └── ModFinder
```

---

## 18. TYPOGRAPHY & SPACING

- **Display / chord labels**: `Georgia, serif` — musical, classical feel
- **Labels / metadata**: `monospace` — technical, precise
- **Font sizes**: 7px (micro labels), 8–9px (body), 10–11px (chord symbols), 12–14px (headings), 17–18px (H1)
- **Padding convention**: 6–12px within components, 8–16px for page sections
- **Border radius**: 4–5px (small), 7–10px (cards), 12–14px (nav pills)

---

## 19. NON-NEGOTIABLES

1. **No sheet music.** Never render staff notation, clefs, or note glyphs.
2. **Every tap plays sound.** No silent UI interaction on a chord element.
3. **Single file.** Entire app in one `.jsx` file. No imports except React hooks.
4. **No external CSS libraries.** All styles inline.
5. **No `localStorage`/`sessionStorage`.** Use `window.storage` API only (with `localStorage` fallback wrapped in try/catch for standard browser environments).
6. **Fully offline.** No external API calls, no network dependencies. All reharmonization is algorithmic.
7. **Voice leading state persists within a session.** `_lastMidi` is module-level. Call `resetVoicing()` when loading a new progression or clearing the builder.
8. **Major ring always visible.** The Major toggle cannot be deselected — it's the anchor of the entire map.